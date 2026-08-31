(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (reduceMotion.matches || !window.PointerEvent) return;

  const controls = [
    ".hero-actions a",
    ".site-main p > a:only-child:not(.inline-link)",
    ".site-main p > a:first-child:last-of-type:not(.inline-link)",
    ".site-main button",
    ".tour-plan header > a",
    ".desktop-nav > a",
    ".nav-group-link",
    ".mega-menu a",
    ".mobile-nav > summary",
    ".mobile-subnav > summary",
    ".mobile-menu-panel nav > a",
    ".mobile-subnav a",
    ".floating-whatsapp",
    ".plan-image-link",
    ".app-store-icons a",
    ".faq-item summary",
  ];
  const filledControls = [
    ".desktop-nav .nav-cta",
    ".hero-actions a:first-child",
    ".site-main p > a:only-child:not(.inline-link)",
    ".site-main p > a:first-child:last-of-type:not(.inline-link)",
    ".site-main button:not(#email-anfrage)",
    ".tour-plan header > a",
    ".mobile-menu-panel .mobile-menu-cta",
    ".floating-whatsapp",
    "#whatsapp-anfrage",
  ].join(",");
  const interactions = new Map();

  const getControl = (target) => target instanceof Element ? target.closest(controls.join(",")) : null;

  const clearControl = (control) => {
    if (!control) return;
    control.classList.remove("is-touch-pressed");
    window.setTimeout(() => control.classList.remove("is-touch-releasing"), 280);
  };

  const startFeedback = (control, x, y) => {
    const layer = control.querySelector(":scope > .touch-feedback-layer");
    if (!layer) return;

    const rect = control.getBoundingClientRect();
    const diameter = Math.hypot(rect.width, rect.height) * 2;
    layer.style.width = `${diameter}px`;
    layer.style.height = `${diameter}px`;
    layer.style.left = `${x - rect.left}px`;
    layer.style.top = `${y - rect.top}px`;
    control.classList.remove("is-touch-releasing", "is-touch-pressed");
    void layer.offsetWidth;
    control.classList.add("is-touch-pressed");
  };

  document.querySelectorAll(controls.join(",")).forEach((control) => {
    control.classList.add("touch-feedback-target");
    if (getComputedStyle(control).position === "static") control.classList.add("touch-feedback-needs-position");
    if (control.matches(filledControls)) control.classList.add("touch-feedback-filled");

    const layer = document.createElement("span");
    layer.className = "touch-feedback-layer";
    layer.setAttribute("aria-hidden", "true");
    control.append(layer);
  });

  document.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;

    const control = getControl(event.target);
    if (!control) return;

    startFeedback(control, event.clientX, event.clientY);
    interactions.set(event.pointerId, { control, startX: event.clientX, startY: event.clientY });
  }, { passive: true });

  document.addEventListener("pointermove", (event) => {
    const interaction = interactions.get(event.pointerId);
    if (!interaction) return;

    if (Math.hypot(event.clientX - interaction.startX, event.clientY - interaction.startY) > 8) {
      interaction.control.classList.add("is-touch-releasing");
      clearControl(interaction.control);
      interactions.delete(event.pointerId);
    }
  }, { passive: true });

  const endPointerFeedback = (event) => {
    const interaction = interactions.get(event.pointerId);
    if (!interaction) return;

    interaction.control.classList.add("is-touch-releasing");
    clearControl(interaction.control);
    interactions.delete(event.pointerId);
  };

  document.addEventListener("pointerup", endPointerFeedback, { passive: true });
  document.addEventListener("pointercancel", endPointerFeedback, { passive: true });
  window.addEventListener("blur", () => {
    interactions.forEach(({ control }) => clearControl(control));
    interactions.clear();
  });

  document.addEventListener("keydown", (event) => {
    if (event.repeat || (event.key !== "Enter" && event.key !== " ")) return;

    const control = getControl(document.activeElement);
    if (!control) return;

    const rect = control.getBoundingClientRect();
    startFeedback(control, rect.left + rect.width / 2, rect.top + rect.height / 2);
  });

  document.addEventListener("keyup", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    clearControl(getControl(document.activeElement));
  });
})();
