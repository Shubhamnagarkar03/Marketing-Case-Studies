/* ─────────────────────────────────────────
   portfolio.js
   ───────────────────────────────────────── */

/* ── 1. SCROLL REVEAL — staggered card entrance ── */
(function initScrollReveal() {
  const cards = document.querySelectorAll('.case-card');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const card  = entry.target;
          const index = parseInt(card.dataset.index, 10) || 0;

          // stagger by index: 0ms, 80ms, 160ms …
          setTimeout(() => card.classList.add('is-visible'), index * 80);
          observer.unobserve(card);
        }
      });
    },
    { threshold: 0.1 }
  );

  cards.forEach((card, i) => {
    card.dataset.index = i;
    observer.observe(card);
  });
})();


/* ── 2. SWATCH TOOLTIP — show hex on hover ── */
(function initSwatchTooltips() {
  const dots = document.querySelectorAll('.swatch-dot');

  dots.forEach((dot) => {
    const hex = dot.getAttribute('title');
    if (!hex) return;

    // Create tooltip element
    const tip = document.createElement('span');
    tip.textContent = hex;
    tip.style.cssText = `
      position: absolute;
      bottom: calc(100% + 8px);
      left: 50%;
      transform: translateX(-50%);
      background: var(--ink);
      color: var(--paper);
      font-family: 'DM Mono', monospace;
      font-size: 8px;
      letter-spacing: 0.1em;
      padding: 4px 8px;
      border-radius: 2px;
      white-space: nowrap;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.15s;
    `;

    // Wrap dot in relative container if not already
    const parent = dot.parentElement;
    parent.style.position = 'relative';
    parent.appendChild(tip);

    dot.addEventListener('mouseenter', () => { tip.style.opacity = '1'; });
    dot.addEventListener('mouseleave', () => { tip.style.opacity = '0'; });
  });
})();


/* ── 3. ACTIVE NAV LINK (future-proof) ── */
(function initActiveLinks() {
  const links = document.querySelectorAll('a.case-card');
  links.forEach((link) => {
    link.addEventListener('mouseenter', () => {
      links.forEach((l) => l !== link && l.classList.add('sibling-dim'));
    });
    link.addEventListener('mouseleave', () => {
      links.forEach((l) => l.classList.remove('sibling-dim'));
    });
  });
})();


/* ── 4. SIBLING DIM — CSS hook ── */
// Inject a small style so .sibling-dim reduces opacity of non-hovered cards
(function injectSiblingDimStyle() {
  const style = document.createElement('style');
  style.textContent = `
    .cases-grid:has(.case-card:hover) .case-card:not(:hover) {
      opacity: 0.5;
      transition: opacity 0.25s;
    }
  `;
  document.head.appendChild(style);
})();