const MOBILE_BREAKPOINT = 980;
const mobileNavigation = document.querySelector(".mobile-nav");

if (mobileNavigation) {
  const navigationToggle = mobileNavigation.querySelector(":scope > summary");
  const navigationPanel = mobileNavigation.querySelector(".mobile-menu-panel");
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
    if (navigationToggle) {
      navigationToggle.textContent = mobileNavigation.open ? "Menü schließen" : "Menü öffnen";
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

  window.addEventListener(
    "scroll",
    () => {
      if (window.innerWidth <= MOBILE_BREAKPOINT) closeMobileNavigation();
    },
    { passive: true },
  );

  const closeOnOutsideScroll = (event) => {
    if (!mobileNavigation.open) return;
    if (event.target instanceof Node && navigationPanel?.contains(event.target)) return;

    closeMobileNavigation();
  };

  document.addEventListener("wheel", closeOnOutsideScroll, { capture: true, passive: true });
  document.addEventListener("touchmove", closeOnOutsideScroll, { capture: true, passive: true });
}

const currentPath = window.location.pathname;
document.querySelectorAll(".desktop-nav a, .mobile-nav a").forEach((link) => {
  const linkPath = new URL(link.href, window.location.origin).pathname;
  if (linkPath !== "/" && currentPath.startsWith(linkPath)) {
    link.setAttribute("aria-current", "page");
  }
});

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
