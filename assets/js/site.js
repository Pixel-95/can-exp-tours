const MOBILE_BREAKPOINT = 980;
const mobileNavigation = document.querySelector(".mobile-nav");

if (mobileNavigation) {
  const navigationToggle = mobileNavigation.querySelector(":scope > summary");
  const navigationLabel = navigationToggle?.querySelector(".mobile-menu-label");
  const navigationPanel = mobileNavigation.querySelector(".mobile-menu-panel");
  const replayEnterAnimation = (element, className) => {
    element.classList.remove(className);
    void element.offsetWidth;
    element.classList.add(className);
  };
  const navigationBackdrop = document.createElement("div");
  navigationBackdrop.className = "mobile-menu-backdrop";
  navigationBackdrop.setAttribute("aria-hidden", "true");
  document.body.append(navigationBackdrop);

  const closeMobileNavigation = ({ restoreFocus = false } = {}) => {
    if (!mobileNavigation.open) return;

    mobileNavigation.removeAttribute("open");
    mobileNavigation.querySelectorAll(".mobile-subnav[open]").forEach((submenu) => {
      submenu.removeAttribute("open");
    });

    if (restoreFocus) navigationToggle?.focus();
  };

  mobileNavigation.addEventListener("toggle", () => {
    if (navigationToggle && navigationLabel) {
      const label = mobileNavigation.open ? "Menü schließen" : "Menü öffnen";
      navigationLabel.textContent = label;
      navigationToggle.setAttribute("aria-label", label);
    }

    if (mobileNavigation.open && navigationPanel) {
      replayEnterAnimation(navigationPanel, "is-entering");
    }
  });

  mobileNavigation.addEventListener("click", (event) => {
    if (event.target instanceof Element && event.target.closest("a")) {
      closeMobileNavigation();
    }
  });

  navigationBackdrop.addEventListener("click", () => closeMobileNavigation());

  document.addEventListener("click", (event) => {
    if (event.target instanceof Node && !mobileNavigation.contains(event.target)) {
      closeMobileNavigation();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMobileNavigation({ restoreFocus: true });
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > MOBILE_BREAKPOINT) closeMobileNavigation();
  });

  const closeOnOutsideScroll = (event) => {
    if (!mobileNavigation.open) return;
    if (navigationPanel && event.composedPath().includes(navigationPanel)) return;

    closeMobileNavigation();
  };

  document.addEventListener("wheel", closeOnOutsideScroll, { capture: true, passive: true });
  document.addEventListener("touchmove", closeOnOutsideScroll, { capture: true, passive: true });
  document.addEventListener("scroll", closeOnOutsideScroll, { capture: true, passive: true });
}

const benefitJourney = document.querySelector(".benefit-journey");

if (benefitJourney) {
  const benefitScrollArea = benefitJourney.querySelector(".benefit-scroll-area");
  const benefitScene = benefitJourney.querySelector(".benefit-scroll-scene");
  const benefitHeading = benefitScene?.querySelector("h2");
  const benefitStage = benefitJourney.querySelector(".benefit-scroll-stage");
  const benefitTrack = benefitJourney.querySelector(".benefit-track");
  const benefitCards = [...benefitJourney.querySelectorAll(".benefit-card")];
  const benefitLayoutRoot = benefitJourney.parentElement;
  const siteHeader = document.querySelector(".site-header");
  const desktopBenefits = window.matchMedia("(min-width: 981px)");
  const mobileBenefits = window.matchMedia("(max-width: 980px)");
  const reducedBenefitMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const mobileBenefitTransitionStep = 0.58;
  let benefitDistance = 0;
  let benefitScrollStart = 0;
  let benefitFrame = 0;
  let benefitLayoutFrame = 0;

  const clearBenefitLayout = () => {
    benefitDistance = 0;
    benefitScrollStart = 0;
    benefitJourney.style.removeProperty("--benefit-heading-offset");
    benefitLayoutRoot?.style.removeProperty("--benefit-exit-tail");
    benefitScrollArea.style.height = "";
    benefitScene.style.removeProperty("--benefit-scene-top");
    benefitScene.style.removeProperty("--benefit-scene-height");
    benefitScene.style.removeProperty("--benefit-heading-top");
    benefitScene.style.removeProperty("height");
    benefitStage.style.removeProperty("--benefit-stage-top");
    benefitStage.style.removeProperty("--benefit-stage-height");
    benefitStage.style.removeProperty("--benefit-image-height");
    benefitTrack.style.transform = "";
    benefitCards.forEach((card) => {
      card.style.removeProperty("height");
      card.style.transform = "";
    });
  };

  const updateBenefitTrack = () => {
    benefitFrame = 0;
    if (reducedBenefitMotion.matches || !benefitDistance) return;

    const progress = Math.min(1, Math.max(0, (window.scrollY - benefitScrollStart) / benefitDistance));
    if (desktopBenefits.matches) {
      benefitTrack.style.transform = `translate3d(${-benefitDistance * progress}px, 0, 0)`;
      return;
    }

    if (mobileBenefits.matches) {
      const transitionCount = Math.max(1, benefitCards.length - 1);
      const timelineLength = 1 + ((transitionCount - 1) * mobileBenefitTransitionStep);
      const timelineProgress = progress * timelineLength;
      const horizontalEntryFactor = 1 / Math.tan(35 * (Math.PI / 180));
      benefitCards.forEach((card, index) => {
        const transitionStart = (index - 1) * mobileBenefitTransitionStep;
        const cardProgress = index === 0 ? 1 : Math.min(1, Math.max(0, timelineProgress - transitionStart));
        const finalX = index === 0 ? 0 : (index % 2 ? 10 : -10);
        const finalY = index * 11;
        const entryDistance = Math.max(card.offsetHeight, window.innerWidth) + 40;
        const startY = entryDistance;
        const startX = startY * horizontalEntryFactor * (index % 2 ? -1 : 1);
        const x = startX + ((finalX - startX) * cardProgress);
        const y = startY + ((finalY - startY) * cardProgress);
        card.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      });
    }
  };

  const scheduleBenefitTrack = () => {
    if (!benefitFrame) benefitFrame = window.requestAnimationFrame(updateBenefitTrack);
  };

  const performBenefitLayout = () => {
    benefitLayoutFrame = 0;
    if (!benefitScrollArea || !benefitScene || !benefitHeading || !benefitStage || !benefitTrack) return;

    clearBenefitLayout();

    if (reducedBenefitMotion.matches) {
      return;
    }

    const viewportHeight = Math.round(window.visualViewport?.height || window.innerHeight);
    const headerHeight = siteHeader?.offsetHeight || (mobileBenefits.matches ? 68 : 74);
    const sceneHeight = Math.max(480, viewportHeight - headerHeight);
    benefitScene.style.setProperty("--benefit-scene-top", `${headerHeight}px`);
    benefitScene.style.setProperty("--benefit-scene-height", `${sceneHeight}px`);

    let cardHeight = benefitCards[0]?.offsetHeight || 350;

    if (mobileBenefits.matches) {
      const imageWidth = benefitCards[0]?.clientWidth || 0;
      const imageHeight = imageWidth * (11 / 16);
      benefitStage.style.setProperty("--benefit-image-height", `${imageHeight}px`);
      const highestText = Math.max(...benefitCards.map((card) => card.querySelector("div")?.scrollHeight || 0));
      cardHeight = highestText + imageHeight;
      const stackSpace = Number.parseFloat(getComputedStyle(benefitStage).getPropertyValue("--benefit-stack-space")) || 0;
      benefitCards.forEach((card) => card.style.setProperty("height", `${cardHeight}px`));
      benefitStage.style.setProperty("--benefit-stage-height", `${Math.ceil(cardHeight + stackSpace)}px`);
    }

    if (desktopBenefits.matches) {
      benefitDistance = Math.max(0, benefitTrack.scrollWidth - benefitStage.clientWidth);
    } else {
      const transitionCount = Math.max(1, benefitCards.length - 1);
      const timelineLength = 1 + ((transitionCount - 1) * mobileBenefitTransitionStep);
      benefitDistance = Math.round(cardHeight * 0.6 * timelineLength);
    }

    const headingStyle = getComputedStyle(benefitHeading);
    const headingLineHeight = Number.parseFloat(headingStyle.lineHeight) || (Number.parseFloat(headingStyle.fontSize) * 1.1);
    const headingGap = mobileBenefits.matches ? 20 : 32;
    const visibleHeadingHeight = mobileBenefits.matches ? headingLineHeight : benefitHeading.offsetHeight;
    const targetStageTop = Math.round((viewportHeight * 0.45) - (cardHeight / 2));
    const minimumStageTop = Math.ceil(headerHeight + visibleHeadingHeight + headingGap);
    const stageViewportTop = Math.max(headerHeight + 8, targetStageTop, minimumStageTop);
    const headingViewportTop = stageViewportTop - headingGap - benefitHeading.offsetHeight;
    const headingOffset = headingViewportTop - headerHeight;
    const stageOffset = stageViewportTop - headerHeight;
    const finalStackOffset = mobileBenefits.matches ? (benefitCards.length - 1) * 11 : 0;
    const exitTail = sceneHeight - (stageOffset + cardHeight + finalStackOffset);

    benefitJourney.style.setProperty("--benefit-heading-offset", `${headingOffset}px`);
    benefitLayoutRoot?.style.setProperty("--benefit-exit-tail", `${exitTail}px`);
    benefitScene.style.setProperty("--benefit-stage-top", `${stageOffset}px`);
    benefitScene.style.setProperty("--benefit-heading-top", `${headingOffset}px`);
    benefitScrollArea.style.height = `${Math.ceil(sceneHeight + benefitDistance)}px`;

    const scrollAreaTop = benefitScrollArea.getBoundingClientRect().top + window.scrollY;
    benefitScrollStart = scrollAreaTop - headerHeight;
    updateBenefitTrack();
  };

  const layoutBenefitJourney = () => {
    if (!benefitLayoutFrame) benefitLayoutFrame = window.requestAnimationFrame(performBenefitLayout);
  };

  window.addEventListener("scroll", scheduleBenefitTrack, { passive: true });
  window.addEventListener("resize", layoutBenefitJourney);
  window.visualViewport?.addEventListener("resize", layoutBenefitJourney);
  desktopBenefits.addEventListener("change", layoutBenefitJourney);
  mobileBenefits.addEventListener("change", layoutBenefitJourney);
  reducedBenefitMotion.addEventListener("change", layoutBenefitJourney);
  window.addEventListener("load", layoutBenefitJourney, { once: true });
  layoutBenefitJourney();
}

const reviewList = document.querySelector("#google-reviews-list");
const reviewData = document.querySelector("#google-reviews-data");

if (reviewList && reviewData) {
  try {
    const reviews = JSON.parse(reviewData.textContent);
    const avatarColors = ["#1a73e8", "#d93025", "#188038", "#9334e6", "#c26401", "#007b83"];
    const likeIcon = '<svg viewBox="0 0 24 24" focusable="false"><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3m0 11V11m0 11h9.4a2 2 0 0 0 1.95-1.55l1.2-5A2 2 0 0 0 17.6 13H14l.6-4.3A2.1 2.1 0 0 0 12.5 6L7 11" /></svg>';
    const colorForName = (name) => {
      const sum = [...name].reduce((total, character) => total + character.codePointAt(0), 0);
      return avatarColors[sum % avatarColors.length];
    };

    const reviewCards = reviews.map((review, index) => {
      const name = typeof review.name === "string" ? review.name.trim() : "Unbekannt";
      const stackItem = document.createElement("div");
      const card = document.createElement("article");
      const header = document.createElement("header");
      const avatar = document.createElement("span");
      const author = document.createElement("div");
      const authorName = document.createElement("h3");
      const profile = document.createElement("p");
      const rating = document.createElement("p");
      const stars = document.createElement("span");
      const time = document.createElement("span");
      const text = document.createElement("p");
      const likes = document.createElement("p");
      const likeIconElement = document.createElement("span");
      const likeCount = document.createElement("span");

      stackItem.className = "review-stack-item";
      stackItem.style.setProperty("--review-index", String(index + 1));
      stackItem.style.setProperty("--review-stack-offset", `${index * 18}px`);
      card.className = "google-review";
      avatar.className = "review-avatar";
      avatar.textContent = name.charAt(0).toLocaleUpperCase("de-DE");
      avatar.style.backgroundColor = colorForName(name);
      avatar.setAttribute("aria-hidden", "true");
      author.className = "review-author";
      authorName.textContent = name;
      profile.className = "review-profile";
      profile.textContent = typeof review.profile === "string" ? review.profile : "";
      rating.className = "review-rating";
      stars.className = "review-stars";
      stars.textContent = "★★★★★";
      stars.setAttribute("aria-label", "5 von 5 Sternen");
      time.textContent = typeof review.time === "string" ? review.time : "";
      text.className = "review-text";
      text.textContent = typeof review.text === "string" ? review.text : "";
      likes.className = "review-likes";
      likeIconElement.className = "review-like-icon";
      likeIconElement.setAttribute("aria-hidden", "true");
      likeIconElement.innerHTML = likeIcon;
      likeCount.textContent = Number.isFinite(Number(review.likes)) ? String(review.likes) : "0";

      author.append(authorName, profile);
      header.append(avatar, author);
      rating.append(stars, time);
      likes.append(likeIconElement, likeCount);
      card.append(header, rating, text, likes);
      stackItem.append(card);
      return stackItem;
    });

    const stackStage = document.createElement("div");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let stackLayout = null;
    let animationFrame = 0;

    stackStage.className = "review-stack-stage";
    stackStage.append(...reviewCards);
    reviewList.replaceChildren(stackStage);

    const updateReviewStack = () => {
      animationFrame = 0;
      if (!stackLayout || reducedMotion.matches) return;

      const progress = Math.min(
        stackLayout.totalDistance,
        Math.max(0, stackLayout.stickTop - reviewList.getBoundingClientRect().top),
      );
      const exitDistance = Math.max(0, progress - stackLayout.exitStart);

      reviewCards.forEach((card, index) => {
        const position = Math.max(stackLayout.finalPositions[index], stackLayout.startPositions[index] - progress) - exitDistance;
        card.style.transform = `translate3d(0, ${position}px, 0)`;
      });
    };

    const scheduleReviewStack = () => {
      if (animationFrame) return;
      animationFrame = window.requestAnimationFrame(updateReviewStack);
    };

    const layoutReviewStack = () => {
      if (reducedMotion.matches) {
        stackLayout = null;
        reviewList.style.height = "";
        stackStage.style.height = "";
        reviewCards.forEach((card) => {
          card.style.transform = "";
        });
        return;
      }

      const listStyles = getComputedStyle(reviewList);
      const gap = Number.parseFloat(listStyles.getPropertyValue("--review-gap")) || 48;
      const stickTop = Number.parseFloat(listStyles.getPropertyValue("--reviews-stick-top")) || 92;
      const heights = reviewCards.map((card) => card.offsetHeight);
      const startPositions = [];
      const finalPositions = reviewCards.map((card, index) => index * 18);
      let nextPosition = 0;

      heights.forEach((height) => {
        startPositions.push(nextPosition);
        nextPosition += height + gap;
      });

      const exitStart = Math.max(...startPositions.map((position, index) => position - finalPositions[index]), 0);
      const stageHeight = Math.max(...heights.map((height, index) => height + finalPositions[index]));
      const exitDistance = 0;

      stackLayout = {
        exitStart,
        finalPositions,
        startPositions,
        stickTop,
        totalDistance: exitStart + exitDistance,
      };
      stackStage.style.height = `${Math.ceil(stageHeight)}px`;
      reviewList.style.height = `${Math.ceil(stageHeight + stackLayout.totalDistance)}px`;
      updateReviewStack();
    };

    window.addEventListener("scroll", scheduleReviewStack, { passive: true });
    window.addEventListener("resize", layoutReviewStack);
    reducedMotion.addEventListener("change", layoutReviewStack);

    if ("ResizeObserver" in window) {
      const reviewResizeObserver = new ResizeObserver(layoutReviewStack);
      reviewCards.forEach((card) => reviewResizeObserver.observe(card));
    }

    window.requestAnimationFrame(layoutReviewStack);
  } catch (error) {
    console.error("Google-Bewertungen konnten nicht gelesen werden.", error);
  }
}

const currentPath = window.location.pathname;
document.querySelectorAll(".desktop-nav a, .mobile-nav a").forEach((link) => {
  const linkPath = new URL(link.href, window.location.origin).pathname;
  if (linkPath !== "/" && currentPath.startsWith(linkPath)) {
    link.setAttribute("aria-current", "page");
  }
});

const tourComparisons = [...document.querySelectorAll(".tour-comparison")];

if (tourComparisons.length) {
  const comparisonHeader = document.querySelector(".site-header");
  const comparisonReleaseGap = 50;
  let comparisonReleaseFrame = 0;

  const updateComparisonRelease = () => {
    comparisonReleaseFrame = 0;
    const releaseBoundary = window.innerHeight - comparisonReleaseGap;

    tourComparisons.forEach((comparison) => {
      const bounds = comparison.getBoundingClientRect();
      const stickyTop = Number.parseFloat(getComputedStyle(comparison).getPropertyValue("--comparison-sticky-top")) || 74;
      const isReleased = bounds.bottom <= releaseBoundary;

      comparison.classList.toggle("is-sticky-released", isReleased);
      comparison.classList.toggle("is-sticky-active", bounds.top <= stickyTop && !isReleased);
    });
  };

  const scheduleComparisonRelease = () => {
    if (!comparisonReleaseFrame) comparisonReleaseFrame = window.requestAnimationFrame(updateComparisonRelease);
  };

  const updateComparisonLayout = () => {
    const stickyTop = comparisonHeader?.getBoundingClientRect().height || 74;

    tourComparisons.forEach((comparison) => {
      const comparisonHead = comparison.querySelector(".comparison-head");
      if (!comparisonHead) return;

      comparison.classList.remove("is-sticky-released");
      const comparisonHeadHeight = comparisonHead.getBoundingClientRect().height;
      const comparisonHeight = comparison.getBoundingClientRect().height;
      const releaseTop = Math.max(0, comparisonHeight - window.innerHeight + comparisonReleaseGap + stickyTop);

      comparison.style.setProperty("--comparison-sticky-top", `${stickyTop}px`);
      comparison.style.setProperty("--comparison-head-height", `${comparisonHeadHeight}px`);
      comparison.style.setProperty("--comparison-release-top", `${releaseTop}px`);
    });

    updateComparisonRelease();
  };

  tourComparisons.forEach((comparison) => {
    const headingScroll = comparison.querySelector(".comparison-head-scroll");
    const bodyScroll = comparison.querySelector(".comparison-scroll");
    if (!headingScroll || !bodyScroll) return;

    let syncingScroll = false;

    const syncHorizontalScroll = (source, target) => {
      if (syncingScroll) return;
      syncingScroll = true;
      target.scrollLeft = source.scrollLeft;
      window.requestAnimationFrame(() => {
        syncingScroll = false;
      });
    };

    headingScroll.addEventListener("scroll", () => syncHorizontalScroll(headingScroll, bodyScroll), { passive: true });
    bodyScroll.addEventListener("scroll", () => syncHorizontalScroll(bodyScroll, headingScroll), { passive: true });
    headingScroll.scrollLeft = bodyScroll.scrollLeft;
  });

  if (comparisonHeader && "ResizeObserver" in window) {
    const comparisonHeaderObserver = new ResizeObserver(updateComparisonLayout);
    comparisonHeaderObserver.observe(comparisonHeader);
  }

  window.addEventListener("scroll", scheduleComparisonRelease, { passive: true });
  window.addEventListener("resize", updateComparisonLayout);
  window.requestAnimationFrame(updateComparisonLayout);
}

if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches && "IntersectionObserver" in window) {
  const revealItems = document.querySelectorAll("main > section, main > figure, main > h2, main > article > figure");
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -8%", threshold: 0.08 },
  );

  revealItems.forEach((item) => {
    item.dataset.reveal = "";
    revealObserver.observe(item);
  });
}
