const CARD_JOURNEY_BREAKPOINT = 980;

document.querySelectorAll("[data-card-journey]").forEach((journey) => {
  const scrollArea = journey.querySelector("[data-card-scroll-area]");
  const scene = journey.querySelector("[data-card-scroll-scene]");
  const heading = journey.querySelector("[data-card-heading]");
  const stage = journey.querySelector("[data-card-scroll-stage]");
  const track = journey.querySelector("[data-card-track]");
  const cards = [...journey.querySelectorAll("[data-card-journey-item]")];
  const layoutRoot = journey.parentElement;

  if (!scrollArea || !scene || !heading || !stage || !track || !cards.length) return;

  const siteHeader = document.querySelector(".site-header");
  const desktop = window.matchMedia(`(min-width: ${CARD_JOURNEY_BREAKPOINT + 1}px)`);
  const mobile = window.matchMedia(`(max-width: ${CARD_JOURNEY_BREAKPOINT}px)`);
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const mobileTransitionStep = 1;
  const mobileEntryAngle = 35 * (Math.PI / 180);
  const mobileEntryGap = 2;
  let scrollDistance = 0;
  let scrollStart = 0;
  let scrollFrame = 0;
  let layoutFrame = 0;

  const clearLayout = () => {
    scrollDistance = 0;
    scrollStart = 0;
    journey.style.removeProperty("--benefit-heading-offset");
    layoutRoot?.style.removeProperty("--benefit-exit-tail");
    scrollArea.style.height = "";
    scene.style.removeProperty("--benefit-scene-top");
    scene.style.removeProperty("--benefit-scene-height");
    scene.style.removeProperty("--benefit-heading-top");
    stage.style.removeProperty("--benefit-stage-top");
    stage.style.removeProperty("--benefit-stage-height");
    stage.style.removeProperty("--benefit-image-height");
    track.style.transform = "";
    cards.forEach((card) => {
      card.style.removeProperty("height");
      card.style.transform = "";
    });
  };

  const updateTrack = () => {
    scrollFrame = 0;
    if (reducedMotion.matches || !scrollDistance) return;

    const progress = Math.min(1, Math.max(0, (window.scrollY - scrollStart) / scrollDistance));
    if (desktop.matches) {
      track.style.transform = `translate3d(${-scrollDistance * progress}px, 0, 0)`;
      return;
    }

    const transitionCount = Math.max(1, cards.length - 1);
    const timelineLength = 1 + ((transitionCount - 1) * mobileTransitionStep);
    const timelineProgress = progress * timelineLength;
    const stageLeft = stage.getBoundingClientRect().left;

    cards.forEach((card, index) => {
      const transitionStart = (index - 1) * mobileTransitionStep;
      const cardProgress = index === 0 ? 1 : Math.min(1, Math.max(0, timelineProgress - transitionStart));
      const finalX = index === 0 ? 0 : (index % 2 ? 10 : -10);
      const finalY = index * 11;
      const cardLeft = stageLeft + card.offsetLeft;
      const startX = index % 2
        ? -(cardLeft + card.offsetWidth + mobileEntryGap)
        : window.innerWidth + mobileEntryGap - cardLeft;
      const startY = finalY + (Math.abs(startX - finalX) * Math.tan(mobileEntryAngle));
      const x = startX + ((finalX - startX) * cardProgress);
      const y = startY + ((finalY - startY) * cardProgress);
      card.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    });
  };

  const scheduleTrackUpdate = () => {
    if (!scrollFrame) scrollFrame = window.requestAnimationFrame(updateTrack);
  };

  const performLayout = () => {
    layoutFrame = 0;
    clearLayout();
    if (reducedMotion.matches) return;

    const viewportHeight = Math.round(window.visualViewport?.height || window.innerHeight);
    const headerHeight = siteHeader?.offsetHeight || (mobile.matches ? 68 : 74);
    const sceneHeight = Math.max(480, viewportHeight - headerHeight);
    scene.style.setProperty("--benefit-scene-top", `${headerHeight}px`);
    scene.style.setProperty("--benefit-scene-height", `${sceneHeight}px`);

    let cardHeight = cards[0]?.offsetHeight || 350;
    if (mobile.matches) {
      const imageWidth = cards[0]?.clientWidth || 0;
      const imageHeight = imageWidth * (11 / 16);
      stage.style.setProperty("--benefit-image-height", `${imageHeight}px`);
      const highestText = Math.max(...cards.map((card) => card.querySelector("div")?.scrollHeight || 0));
      cardHeight = highestText + imageHeight;
      const stackSpace = Number.parseFloat(getComputedStyle(stage).getPropertyValue("--benefit-stack-space")) || 0;
      cards.forEach((card) => card.style.setProperty("height", `${cardHeight}px`));
      stage.style.setProperty("--benefit-stage-height", `${Math.ceil(cardHeight + stackSpace)}px`);
    }

    if (desktop.matches) {
      scrollDistance = Math.max(0, track.scrollWidth - stage.clientWidth);
    } else {
      const transitionCount = Math.max(1, cards.length - 1);
      const timelineLength = 1 + ((transitionCount - 1) * mobileTransitionStep);
      scrollDistance = Math.round(cardHeight * 0.6 * timelineLength);
    }

    const headingStyle = getComputedStyle(heading);
    const headingLineHeight = Number.parseFloat(headingStyle.lineHeight) || (Number.parseFloat(headingStyle.fontSize) * 1.1);
    const headingGap = mobile.matches ? 20 : 32;
    const visibleHeadingHeight = mobile.matches ? headingLineHeight : heading.offsetHeight;
    const targetStageTop = Math.round((viewportHeight * 0.45) - (cardHeight / 2));
    const minimumStageTop = Math.ceil(headerHeight + visibleHeadingHeight + headingGap);
    const stageViewportTop = Math.max(headerHeight + 8, targetStageTop, minimumStageTop);
    const headingViewportTop = stageViewportTop - headingGap - heading.offsetHeight;
    const headingOffset = headingViewportTop - headerHeight;
    const stageOffset = stageViewportTop - headerHeight;
    const finalStackOffset = mobile.matches ? (cards.length - 1) * 11 : 0;
    const exitTail = sceneHeight - (stageOffset + cardHeight + finalStackOffset);

    journey.style.setProperty("--benefit-heading-offset", `${headingOffset}px`);
    layoutRoot?.style.setProperty("--benefit-exit-tail", `${exitTail}px`);
    scene.style.setProperty("--benefit-stage-top", `${stageOffset}px`);
    scene.style.setProperty("--benefit-heading-top", `${headingOffset}px`);
    scrollArea.style.height = `${Math.ceil(sceneHeight + scrollDistance)}px`;

    scrollStart = scrollArea.getBoundingClientRect().top + window.scrollY - headerHeight;
    updateTrack();
  };

  const scheduleLayout = () => {
    if (!layoutFrame) layoutFrame = window.requestAnimationFrame(performLayout);
  };

  window.addEventListener("scroll", scheduleTrackUpdate, { passive: true });
  window.addEventListener("resize", scheduleLayout);
  window.visualViewport?.addEventListener("resize", scheduleLayout);
  desktop.addEventListener("change", scheduleLayout);
  mobile.addEventListener("change", scheduleLayout);
  reducedMotion.addEventListener("change", scheduleLayout);
  window.addEventListener("load", scheduleLayout, { once: true });
  scheduleLayout();
});
