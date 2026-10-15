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
    if (event.composedPath().includes(mobileNavigation)) return;

    closeMobileNavigation();
  };

  document.addEventListener("wheel", closeOnOutsideScroll, { capture: true, passive: true });
  document.addEventListener("touchmove", closeOnOutsideScroll, { capture: true, passive: true });
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
      const nextStageHeight = `${Math.ceil(stageHeight)}px`;
      const nextListHeight = `${Math.ceil(stageHeight + stackLayout.totalDistance)}px`;
      if (stackStage.style.height !== nextStageHeight) stackStage.style.height = nextStageHeight;
      if (reviewList.style.height !== nextListHeight) reviewList.style.height = nextListHeight;
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

    let scrollSyncFrame = 0;
    let pendingScrollSync = null;

    const syncHorizontalScroll = (source, target) => {
      if (Math.abs(target.scrollLeft - source.scrollLeft) < .5) return;

      pendingScrollSync = { source, target };
      if (scrollSyncFrame) return;

      scrollSyncFrame = window.requestAnimationFrame(() => {
        scrollSyncFrame = 0;
        const sync = pendingScrollSync;
        pendingScrollSync = null;

        if (sync && Math.abs(sync.target.scrollLeft - sync.source.scrollLeft) >= .5) {
          sync.target.scrollLeft = sync.source.scrollLeft;
        }
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

const animatedDetails = document.querySelectorAll(".faq-item");
const prefersReducedDetailsMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

if (animatedDetails.length && !prefersReducedDetailsMotion.matches) {
  animatedDetails.forEach((details) => {
    const summary = details.querySelector("summary");
    const content = details.querySelector(":scope > div, :scope > p");
    if (!summary || !content) return;

    let animation;
    let animationFrame;
    let isClosing = false;

    const reset = (isOpen) => {
      details.open = isOpen;
      details.style.height = "";
      details.style.overflow = "";
      animation = undefined;
      isClosing = false;
    };

    const cancelCurrentAnimation = () => {
      if (animationFrame) {
        window.cancelAnimationFrame(animationFrame);
        animationFrame = undefined;
      }
      animation?.cancel();
      animation = undefined;
    };

    const collapse = (startHeight) => {
      isClosing = true;
      details.style.overflow = "hidden";
      animation = details.animate(
        { height: [startHeight, `${summary.offsetHeight}px`] },
        { duration: 240, easing: "cubic-bezier(.2, .8, .2, 1)" },
      );
      animation.onfinish = () => reset(false);
    };

    const expand = (startHeight) => {
      isClosing = false;
      details.style.height = startHeight;
      details.open = true;
      details.style.overflow = "hidden";
      animationFrame = window.requestAnimationFrame(() => {
        animationFrame = undefined;
        animation = details.animate(
          { height: [startHeight, `${summary.offsetHeight + content.offsetHeight}px`] },
          { duration: 300, easing: "cubic-bezier(.2, .8, .2, 1)" },
        );
        animation.onfinish = () => reset(true);
      });
    };

    summary.addEventListener("click", (event) => {
      event.preventDefault();
      const startHeight = `${details.offsetHeight}px`;
      const shouldExpand = isClosing || !details.open;
      cancelCurrentAnimation();

      if (shouldExpand) expand(startHeight);
      else collapse(startHeight);
    });
  });
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

const floatingWhatsApp = document.querySelector(".floating-whatsapp");
if (floatingWhatsApp && "HTMLDialogElement" in window) {
  const chatToggle = document.createElement("button");
  const chatDialog = document.createElement("dialog");

  chatToggle.className = "floating-chat-toggle";
  chatToggle.type = "button";
  chatToggle.textContent = "Chat starten";
  chatToggle.setAttribute("aria-haspopup", "dialog");
  chatToggle.setAttribute("aria-controls", "dify-chat-dialog");

  chatDialog.className = "chat-dialog";
  chatDialog.id = "dify-chat-dialog";
  chatDialog.setAttribute("aria-label", "Canyon Explore Tours Chat");
  chatDialog.innerHTML = `
    <button class="chat-dialog-close" type="button" aria-label="Chat schließen">&times;</button>
    <div class="chat-dialog-loading" role="status" aria-live="polite">
      Chat wird geladen&nbsp;&hellip;
    </div>
    <iframe
      title="Chat mit Canyon Explore Tours"
      data-src="https://udify.app/chatbot/WnPIdLi1CLFKFtIw"
      src="about:blank"
      loading="lazy"
      referrerpolicy="strict-origin-when-cross-origin"
    ></iframe>
  `;

  floatingWhatsApp.before(chatToggle);
  document.body.append(chatDialog);

  const setPageScrollLocked = (isLocked) => {
    document.documentElement.classList.toggle("chat-dialog-open", isLocked);
    document.body.classList.toggle("chat-dialog-open", isLocked);
  };

  const openChat = () => {
    const iframe = chatDialog.querySelector("iframe");
    const loadingMessage = chatDialog.querySelector(".chat-dialog-loading");
    if (iframe && !iframe.dataset.loaded) {
      iframe.dataset.loading = "true";
      if (loadingMessage) loadingMessage.hidden = false;
      iframe.src = iframe.dataset.src;
      iframe.dataset.loaded = "true";
    }
    chatDialog.showModal();
    setPageScrollLocked(true);
    window.cetTrack?.("chat_open", { cta_location: "floating_button" });
  };

  chatDialog.querySelector("iframe")?.addEventListener("load", (event) => {
    if (event.currentTarget.dataset.loading !== "true") return;

    delete event.currentTarget.dataset.loading;
    const loadingMessage = chatDialog.querySelector(".chat-dialog-loading");
    if (loadingMessage) loadingMessage.hidden = true;
  });

  chatToggle.addEventListener("click", openChat);
  chatDialog.querySelector(".chat-dialog-close")?.addEventListener("click", () => chatDialog.close());
  chatDialog.addEventListener("close", () => setPageScrollLocked(false));
}

const ANALYTICS_MEASUREMENT_ID = "G-5N83VF96FK";
const ANALYTICS_CONSENT_KEY = "cet-analytics-consent";
let analyticsLoaded = false;

const readAnalyticsConsent = () => {
  try {
    return window.localStorage.getItem(ANALYTICS_CONSENT_KEY);
  } catch {
    return null;
  }
};

const writeAnalyticsConsent = (value) => {
  try {
    window.localStorage.setItem(ANALYTICS_CONSENT_KEY, value);
  } catch {
    // The current choice still applies for this page if storage is unavailable.
  }
};

const loadAnalytics = () => {
  if (analyticsLoaded) return;

  analyticsLoaded = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag() {
    window.dataLayer.push(arguments);
  };
  window.gtag("consent", "default", {
    analytics_storage: "granted",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
  window.gtag("js", new Date());
  window.gtag("config", ANALYTICS_MEASUREMENT_ID, {
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
  });

  const analyticsScript = document.createElement("script");
  analyticsScript.async = true;
  analyticsScript.src = `https://www.googletagmanager.com/gtag/js?id=${ANALYTICS_MEASUREMENT_ID}`;
  document.head.append(analyticsScript);
};

window.cetTrack = (eventName, parameters = {}) => {
  if (readAnalyticsConsent() !== "granted") return;
  loadAnalytics();
  window.gtag("event", eventName, parameters);
};

const analyticsBanner = document.createElement("aside");
analyticsBanner.className = "analytics-consent";
analyticsBanner.setAttribute("role", "dialog");
analyticsBanner.setAttribute("aria-label", "Cookie-Einstellungen");
analyticsBanner.hidden = true;
analyticsBanner.innerHTML = `
  <div>
    <strong>Cookies auf dieser Website</strong>
    <p>Wir verwenden optionale Cookies, um die Nutzung auf unserer Website zu verbessern. <a href="/rechtliches/datenschutz/#google-analytics">Mehr erfahren</a></p>
  </div>
  <div class="analytics-consent-actions">
    <button type="button" data-analytics-choice="denied">Ablehnen</button>
    <button type="button" data-analytics-choice="granted">Akzeptieren</button>
  </div>
`;
document.body.append(analyticsBanner);

const updateFloatingActionOffset = () => {
  if (analyticsBanner.hidden) return;

  const offset = window.innerHeight - analyticsBanner.getBoundingClientRect().top + 12;
  document.body.style.setProperty("--analytics-consent-offset", `${offset}px`);
};

const setAnalyticsBannerVisibility = (isVisible) => {
  analyticsBanner.hidden = !isVisible;
  document.body.classList.toggle("has-analytics-consent", isVisible);

  if (isVisible) updateFloatingActionOffset();
  else document.body.style.removeProperty("--analytics-consent-offset");
};

if ("ResizeObserver" in window) {
  new ResizeObserver(updateFloatingActionOffset).observe(analyticsBanner);
}
window.addEventListener("resize", updateFloatingActionOffset);

const setAnalyticsConsent = (choice) => {
  writeAnalyticsConsent(choice);
  setAnalyticsBannerVisibility(false);
  if (choice === "granted") {
    loadAnalytics();
  } else if (analyticsLoaded) {
    window.gtag("consent", "update", { analytics_storage: "denied" });
    window.location.reload();
  }
};

analyticsBanner.addEventListener("click", (event) => {
  const button = event.target instanceof Element ? event.target.closest("[data-analytics-choice]") : null;
  if (button) setAnalyticsConsent(button.dataset.analyticsChoice);
});

const privacyNavigation = document.querySelector('.site-footer nav[aria-label="Rechtliches"]');
if (privacyNavigation) {
  const analyticsSettingsButton = document.createElement("button");
  analyticsSettingsButton.className = "footer-privacy-settings";
  analyticsSettingsButton.type = "button";
  analyticsSettingsButton.textContent = "Cookie-Einstellungen";
  analyticsSettingsButton.addEventListener("click", () => {
    setAnalyticsBannerVisibility(true);
    analyticsBanner.querySelector("button")?.focus();
  });
  privacyNavigation.append(analyticsSettingsButton);
}

const savedAnalyticsConsent = readAnalyticsConsent();
if (savedAnalyticsConsent === "granted") loadAnalytics();
else if (savedAnalyticsConsent !== "denied") setAnalyticsBannerVisibility(true);

const contactLocation = (element) => {
  if (element.closest(".floating-whatsapp")) return "floating_button";
  if (element.closest(".hero-actions")) return "hero";
  if (element.closest(".site-footer")) return "footer";
  if (element.closest(".site-header")) return "header";
  return "content";
};

document.addEventListener("click", (event) => {
  const link = event.target instanceof Element ? event.target.closest("a[href]") : null;
  if (!link) return;

  const href = link.getAttribute("href") || "";
  const parameters = { cta_location: contactLocation(link) };
  if (href.startsWith("https://wa.me/")) window.cetTrack("contact_whatsapp", parameters);
  else if (href.startsWith("mailto:")) window.cetTrack("contact_email", parameters);
  else if (href.startsWith("tel:")) window.cetTrack("contact_phone", parameters);
  else if (new URL(link.href, window.location.origin).pathname === "/tour-anfragen/") {
    window.cetTrack("request_cta_click", parameters);
  }
});

const requestForm = document.querySelector("#tour-anfrage");
if (requestForm) {
  const trackRequestStart = () => window.cetTrack("request_form_start");
  requestForm.addEventListener("focusin", trackRequestStart, { once: true });
}
