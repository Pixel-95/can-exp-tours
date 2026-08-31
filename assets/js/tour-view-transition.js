(() => {
  const STORAGE_KEY = "canyon-explore-tour-transition";
  const MAX_AGE_MS = 5000;
  const supportedTours = new Set([
    "merlins-world",
    "kangaroo-jump",
    "kobelache-intensiv",
    "canyoning-tessin",
  ]);
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const supportsTransitions = "PageSwapEvent" in window && "PageRevealEvent" in window;

  let pendingTransition = null;

  const getTourFromPath = (pathname) => {
    const match = pathname.match(/^\/touren\/(merlins-world|kangaroo-jump|kobelache-intensiv|canyoning-tessin)\/?$/);
    return match?.[1] ?? null;
  };

  const getStoredTransition = () => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (!stored) return null;

      const transition = JSON.parse(stored);
      if (!supportedTours.has(transition.key) || Date.now() - transition.timestamp > MAX_AGE_MS) {
        sessionStorage.removeItem(STORAGE_KEY);
        return null;
      }

      return transition;
    } catch {
      return null;
    }
  };

  const clearStoredTransition = () => {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // A disabled session storage must not affect navigation.
    }
  };

  const clearTransitionName = (element) => {
    if (element) element.style.viewTransitionName = "";
  };

  const skipTransition = (viewTransition) => {
    if (!viewTransition) return;
    viewTransition.finished.catch(() => {});
    viewTransition.skipTransition();
  };

  if (!supportsTransitions || reducedMotion.matches) return;

  document.addEventListener("click", (event) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    const target = event.target instanceof Element ? event.target : null;
    const link = target?.closest("a[data-tour-transition], a[data-tour-transition-source]");
    if (!link || link.target || link.hasAttribute("download")) return;

    const key = link.dataset.tourTransition ?? link.dataset.tourTransitionSource;
    const destination = new URL(link.href, window.location.href);
    const image = link.querySelector("[data-tour-transition-image]") ?? document.querySelector(`a[data-tour-transition="${key}"] [data-tour-transition-image]`);

    if (!key || !supportedTours.has(key) || !image || getTourFromPath(destination.pathname) !== key) return;

    pendingTransition = { key, image, destinationPath: destination.pathname };

    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
        key,
        destinationPath: destination.pathname,
        timestamp: Date.now(),
      }));
    } catch {
      pendingTransition = null;
    }
  }, { capture: true });

  window.addEventListener("pageswap", (event) => {
    const viewTransition = event.viewTransition;
    const transition = pendingTransition;

    if (!viewTransition || !transition || reducedMotion.matches) {
      skipTransition(viewTransition);
      return;
    }

    const destinationUrl = event.activation?.entry?.url;
    const destinationPath = destinationUrl ? new URL(destinationUrl).pathname : transition.destinationPath;
    if (destinationPath !== transition.destinationPath) {
      clearStoredTransition();
      skipTransition(viewTransition);
      return;
    }

    transition.image.style.viewTransitionName = `tour-image-${transition.key}`;
    viewTransition.finished.then(
      () => clearTransitionName(transition.image),
      () => clearTransitionName(transition.image),
    );
  });

  window.addEventListener("pagereveal", (event) => {
    const viewTransition = event.viewTransition;
    const transition = getStoredTransition();
    const key = getTourFromPath(window.location.pathname);

    if (!viewTransition || !transition || reducedMotion.matches || transition.key !== key) {
      skipTransition(viewTransition);
      clearStoredTransition();
      return;
    }

    const image = document.querySelector(`[data-tour-transition-target="${key}"]`) ?? document.querySelector(".tour-hero-media");
    if (!image) {
      clearStoredTransition();
      skipTransition(viewTransition);
      return;
    }

    image.dataset.tourTransitionTarget = key;
    image.style.viewTransitionName = `tour-image-${key}`;
    viewTransition.finished.then(
      () => {
        clearTransitionName(image);
        clearStoredTransition();
      },
      () => {
        clearTransitionName(image);
        clearStoredTransition();
      },
    );
  });
})();
