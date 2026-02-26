/* ============================================================
   THE APPLE ILLUSION — script.js
   Fixed: EMI ring animation (observe the ring element directly,
   use rAF double-frame trick to guarantee CSS transition fires),
   hero counters, bar charts, tab switching, reveal animations.
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ─── SCROLL PROGRESS & NAV ─── */
  const navUnderline = document.getElementById('navUnderline');
  const scrollPct    = document.getElementById('scrollPct');
  const navLinks     = document.querySelectorAll('.nav-link');
  const sections     = document.querySelectorAll('section[id]');

  function onScroll() {
    const scrollY = window.scrollY;
    const docH = document.documentElement.scrollHeight - window.innerHeight;
    const pct  = docH > 0 ? Math.round((scrollY / docH) * 100) : 0;
    if (navUnderline) navUnderline.style.width = pct + '%';
    if (scrollPct)    scrollPct.textContent    = pct + '%';

    let current = '';
    sections.forEach(sec => { if (scrollY >= sec.offsetTop - 100) current = sec.id; });
    navLinks.forEach(l => {
      const href = l.getAttribute('href').replace('#', '');
      l.style.color      = href === current ? 'var(--gray-800)' : '';
      l.style.background = href === current ? 'var(--gray-100)' : '';
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ─── SMOOTH NAV LINKS ─── */
  navLinks.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const target = document.getElementById(link.getAttribute('href').replace('#', ''));
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  /* ─── COUNTER ANIMATION ─── */
  function animateCount(el, to, duration = 1600) {
    const start = performance.now();
    function step(now) {
      const p = Math.min((now - start) / duration, 1);
      const e = 1 - Math.pow(1 - p, 3);          // ease-out cubic
      el.textContent = Math.round(to * e);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ─── HERO STAT COUNTERS ─── */
  const statObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      animateCount(entry.target, parseInt(entry.target.dataset.target));
      statObs.unobserve(entry.target);
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('.hsf-num[data-target]').forEach(el => statObs.observe(el));

  /* ─── EMI RING ANIMATION ─────────────────────────────────────────
     Key fix: observe the RING ELEMENT itself, not the whole section.
     The section is taller than the viewport so threshold: 0.3 never
     fires.  Observing the small ring element fires reliably.
     Also use rAF double-frame so the CSS transition actually plays.
  ─────────────────────────────────────────────────────────────── */
  const emiRing  = document.getElementById('emiRing');
  const emiPctEl = document.getElementById('emiPct');

  if (emiRing) {
    const r             = parseFloat(emiRing.getAttribute('r') || 82);
    const circumference = 2 * Math.PI * r;          // 515.2 for r=82

    // start fully hidden
    emiRing.style.strokeDasharray  = circumference;
    emiRing.style.strokeDashoffset = circumference;

    const ringObs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        const target = 65;
        const offset = circumference - (target / 100) * circumference;

        // double-rAF guarantees browser has painted the initial state
        // before we change the offset, so the CSS transition fires
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            emiRing.style.strokeDashoffset = offset;
            if (emiPctEl) animateCount(emiPctEl, target, 2200);
          });
        });

        ringObs.unobserve(entry.target);
      });
    }, { threshold: 0.4 });          // ring element is small — 0.4 is fine

    ringObs.observe(emiRing);
  }

  /* ─── BAR CHART ANIMATION ─── */
  const barChart = document.querySelector('.bc-bars');
  if (barChart) {
    const bars = barChart.querySelectorAll('.bc-bar');
    bars.forEach(b => { b.style.height = '0%'; });

    const bcObs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        bars.forEach((bar, i) => {
          setTimeout(() => { bar.style.height = bar.dataset.h + '%'; }, i * 130);
        });
        bcObs.unobserve(entry.target);
      });
    }, { threshold: 0.2 });
    bcObs.observe(barChart);
  }

  /* ─── HORIZONTAL BAR ANIMATION ─── */
  function animateHBars(container) {
    container.querySelectorAll('.hb-fill').forEach(fill => {
      fill.style.width = '0%';
      requestAnimationFrame(() => requestAnimationFrame(() => {
        fill.style.width = fill.dataset.w + '%';
      }));
    });
  }

  const hBarObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      animateHBars(entry.target);
      hBarObs.unobserve(entry.target);
    });
  }, { threshold: 0.2 });
  document.querySelectorAll('.hbars').forEach(c => hBarObs.observe(c));

  /* ─── TAB SWITCHING ─── */
  const tabBtns   = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      tabPanels.forEach(p => p.classList.remove('active'));
      btn.classList.add('active');

      const panel = document.getElementById('tab-' + btn.dataset.tab);
      if (!panel) return;
      panel.classList.add('active');

      // re-trigger animations inside newly visible tab
      panel.querySelectorAll('.hbars').forEach(animateHBars);
      panel.querySelectorAll('.bc-bar').forEach((bar, i) => {
        bar.style.height = '0%';
        setTimeout(() => { bar.style.height = bar.dataset.h + '%'; }, i * 130);
      });
    });
  });

  /* ─── REVEAL ON SCROLL ─── */
  const revealObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      // stagger siblings that appear together
      const siblings = Array.from(entry.target.parentElement?.children || []);
      const pending  = siblings.filter(s => s.classList.contains('reveal') && !s.classList.contains('visible'));
      const pos      = pending.indexOf(entry.target);
      setTimeout(() => entry.target.classList.add('visible'), Math.max(0, pos * 80));
      revealObs.unobserve(entry.target);
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

  /* ─── PSYCH CARD 3-D TILT ─── */
  document.querySelectorAll('.psych-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width  - 0.5;
      const y = (e.clientY - r.top)  / r.height - 0.5;
      card.style.transform = `translateY(-4px) rotateX(${-y * 4}deg) rotateY(${x * 4}deg)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });

  /* ─── FAKE IPHONE ANIMATIONS ─── */
  const fiApps = document.querySelectorAll('.fi-app');
  const appColors = [
    'linear-gradient(135deg,#ff3b30,#ff6b35)',
    'linear-gradient(135deg,#007aff,#5ac8fa)',
    'linear-gradient(135deg,#30d158,#34c759)',
    'linear-gradient(135deg,#ffd60a,#ff9f0a)',
    'linear-gradient(135deg,#bf5af2,#9b59b6)',
    'linear-gradient(135deg,#ff9f0a,#ff6b00)',
    'linear-gradient(135deg,#5ac8fa,#32ade6)',
    'linear-gradient(135deg,#ff2d55,#ff375f)',
    'linear-gradient(135deg,#8e8e93,#636366)',
  ];
  if (fiApps.length) {
    setInterval(() => {
      const app = fiApps[Math.floor(Math.random() * fiApps.length)];
      app.style.transition = 'background 0.4s ease';
      app.style.background = appColors[Math.floor(Math.random() * appColors.length)];
    }, 1200);
  }

  const priceTag = document.querySelector('.fi-price-tag');
  if (priceTag) {
    const prices = ['₹1,59,900', '₹79,900', '₹69,900', '₹1,34,900', '₹59,900'];
    let pi = 0;
    setInterval(() => {
      pi = (pi + 1) % prices.length;
      priceTag.style.opacity    = '0';
      priceTag.style.transition = 'opacity 0.3s ease';
      setTimeout(() => { priceTag.textContent = prices[pi]; priceTag.style.opacity = '1'; }, 300);
    }, 2500);
  }

  /* ─── HERO BTN GLOW ─── */
  document.querySelectorAll('.btn-primary').forEach(btn => {
    btn.addEventListener('mouseenter', () => { btn.style.boxShadow = '0 0 24px rgba(0,122,255,0.3)'; });
    btn.addEventListener('mouseleave', () => { btn.style.boxShadow = ''; });
  });

});