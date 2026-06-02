/* ================================================================
   Oracle DBA Simplified — Global Interactive Features
   - Reading progress bar
   - Back-to-top button
   - Nav shrink on scroll
   - Reveal animations
   - Active TOC link tracking
   - Mobile menu enhancement
   - Back-to-home button (for pages missing it)
   ================================================================ */

(function () {
  'use strict';

  /* ── 1. Reading progress bar ─────────────────────────────── */
  function initProgressBar() {
    const bar = document.createElement('div');
    bar.id = 'gbl-progress';
    document.body.prepend(bar);

    function update() {
      const scrollTop = window.scrollY;
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docH > 0 ? Math.min((scrollTop / docH) * 100, 100) : 0;
      bar.style.width = pct + '%';
    }
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  /* ── 2. Back-to-top button ───────────────────────────────── */
  function initBackToTop() {
    const btn = document.createElement('button');
    btn.id = 'gbl-top-btn';
    btn.title = 'Back to top';
    btn.innerHTML = '<i class="fas fa-arrow-up"></i>';
    document.body.appendChild(btn);

    btn.addEventListener('click', () =>
      window.scrollTo({ top: 0, behavior: 'smooth' })
    );

    window.addEventListener('scroll', () => {
      if (window.scrollY > 380) {
        btn.classList.add('visible');
      } else {
        btn.classList.remove('visible');
      }
    }, { passive: true });
  }

  /* ── 3. Nav shrink on scroll ─────────────────────────────── */
  function initNavShrink() {
    const nav = document.querySelector('nav.fixed, nav[class*="fixed top"]');
    if (!nav) return;

    window.addEventListener('scroll', () => {
      if (window.scrollY > 60) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }
    }, { passive: true });
  }

  /* ── 4. Reveal on scroll (IntersectionObserver) ──────────── */
  function initReveal() {
    const items = document.querySelectorAll('.reveal');
    if (!items.length) return;

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.classList.add('visible');
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    items.forEach(el => obs.observe(el));
  }

  /* ── 5. Active TOC / nav link on scroll ──────────────────── */
  function initActiveTOC() {
    const links = document.querySelectorAll('.nav-link[href^="#"], .toc-link[href^="#"]');
    if (!links.length) return;

    const sectionIds = Array.from(links)
      .map(l => l.getAttribute('href').slice(1))
      .filter(id => !!document.getElementById(id));

    function setActive() {
      const scrollPos = window.scrollY + 100;
      let current = sectionIds[0];

      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el && el.offsetTop <= scrollPos) current = id;
      }

      links.forEach(l => {
        const href = l.getAttribute('href').slice(1);
        if (href === current) {
          l.classList.add('active');
        } else {
          l.classList.remove('active');
        }
      });
    }

    window.addEventListener('scroll', setActive, { passive: true });
    setActive();
  }

  /* ── 6. Mobile menu toggle ───────────────────────────────── */
  function initMobileMenu() {
    const btn = document.getElementById('mob-btn') ||
                document.getElementById('menu-btn');
    const menu = document.getElementById('mob-menu') ||
                 document.getElementById('mobile-menu');
    if (!btn || !menu) return;

    btn.addEventListener('click', () => {
      menu.classList.toggle('open');
      const isOpen = menu.classList.contains('open');
      btn.querySelector('i')?.classList.toggle('fa-bars', !isOpen);
      btn.querySelector('i')?.classList.toggle('fa-times', isOpen);
    });

    // Close on nav link click
    menu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        menu.classList.remove('open');
        btn.querySelector('i')?.classList.add('fa-bars');
        btn.querySelector('i')?.classList.remove('fa-times');
      });
    });
  }

  /* ── 7. Tab system enhancement ───────────────────────────── */
  function initTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    if (!tabBtns.length) return;

    tabBtns.forEach(btn => {
      if (btn._tabInit) return;
      btn._tabInit = true;

      btn.addEventListener('click', () => {
        const target = btn.dataset.tab;
        if (!target) return;

        // Find sibling tab group
        const container = btn.closest('[class*="tab"]') || btn.parentElement;
        const allBtns = container.querySelectorAll ? container.querySelectorAll('.tab-btn') : tabBtns;
        const allContent = document.querySelectorAll('.tab-content');

        allBtns.forEach(b => b.classList.remove('active'));
        allContent.forEach(c => c.classList.remove('active'));

        btn.classList.add('active');
        const content = document.getElementById(target) ||
                        document.querySelector('[data-tab-content="' + target + '"]');
        if (content) {
          content.classList.add('active');
          content.style.animation = 'fadeIn .3s ease';
        }
      });
    });
  }

  /* ── 8. Accordion enhancement ────────────────────────────── */
  function initAccordions() {
    const accBtns = document.querySelectorAll('.acc-btn');
    accBtns.forEach(btn => {
      if (btn._accInit) return;
      btn._accInit = true;

      btn.addEventListener('click', () => {
        const content = btn.nextElementSibling;
        if (!content || !content.classList.contains('acc-content')) return;

        const isOpen = content.classList.contains('open');

        // Optionally close others in the same group
        const group = btn.closest('[class*="acc-group"]') || btn.parentElement?.parentElement;
        if (group) {
          group.querySelectorAll('.acc-content.open').forEach(c => c.classList.remove('open'));
          group.querySelectorAll('.acc-btn.open').forEach(b => b.classList.remove('open'));
        }

        if (!isOpen) {
          content.classList.add('open');
          btn.classList.add('open');
        }
      });
    });
  }

  /* ── 9. Smooth external links ────────────────────────────── */
  function initLinks() {
    document.querySelectorAll('a[href^="http"]').forEach(a => {
      if (!a.target) a.target = '_blank';
      if (!a.rel)    a.rel    = 'noopener noreferrer';
    });
  }

  /* ── 10. Ensure "Back to Home" exists on every non-index page */
  function ensureBackToHome() {
    const isIndex =
      window.location.pathname.endsWith('index.html') ||
      window.location.pathname === '/' ||
      window.location.pathname.endsWith('/');

    if (isIndex) return;

    // Check if there's already a visible back-to-home link
    const hasBack = Array.from(document.querySelectorAll('a'))
      .some(a => /index\.html|Back to Home/i.test(a.href + a.textContent));

    if (hasBack) return;

    // Inject a floating back-to-home button
    const backBtn = document.createElement('a');
    backBtn.href = 'index.html';
    backBtn.id = 'gbl-home-btn';
    backBtn.title = 'Back to Home';
    backBtn.innerHTML = '<i class="fas fa-home"></i><span>Home</span>';
    backBtn.style.cssText = `
      position:fixed;bottom:80px;right:28px;
      display:flex;align-items:center;gap:6px;
      background:rgba(12,26,48,0.88);
      border:1px solid rgba(56,189,248,0.30);
      color:#7dd3fc;font-size:.78rem;font-weight:600;
      padding:8px 14px;border-radius:10px;
      text-decoration:none;
      backdrop-filter:blur(12px);
      transition:all .25s ease;
      z-index:998;
    `;
    backBtn.addEventListener('mouseenter', () => {
      backBtn.style.background = 'rgba(56,189,248,0.18)';
      backBtn.style.borderColor = 'rgba(56,189,248,0.5)';
      backBtn.style.transform = 'translateY(-2px)';
    });
    backBtn.addEventListener('mouseleave', () => {
      backBtn.style.background = 'rgba(12,26,48,0.88)';
      backBtn.style.borderColor = 'rgba(56,189,248,0.30)';
      backBtn.style.transform = 'translateY(0)';
    });
    document.body.appendChild(backBtn);
  }

  /* ── 11. Copy code button on terminal blocks ─────────────── */
  function initCopyButtons() {
    document.querySelectorAll('.terminal, pre').forEach(block => {
      if (block.querySelector('.copy-btn')) return;

      const btn = document.createElement('button');
      btn.className = 'copy-btn';
      btn.innerHTML = '<i class="far fa-copy"></i>';
      btn.title = 'Copy code';
      btn.style.cssText = `
        position:absolute;top:10px;right:12px;
        background:rgba(56,189,248,0.12);
        border:1px solid rgba(56,189,248,0.25);
        color:#7dd3fc;border-radius:7px;
        width:30px;height:30px;
        display:flex;align-items:center;justify-content:center;
        font-size:.75rem;cursor:pointer;
        transition:all .2s ease;z-index:2;
      `;

      const wrapper = block;
      if (getComputedStyle(wrapper).position === 'static') {
        wrapper.style.position = 'relative';
      }
      wrapper.appendChild(btn);

      btn.addEventListener('click', () => {
        const codeEl = block.querySelector('code, pre');
        const text = (codeEl || block).innerText.replace(/^\$\s/gm, '');
        navigator.clipboard.writeText(text).then(() => {
          btn.innerHTML = '<i class="fas fa-check"></i>';
          btn.style.color = '#34d399';
          btn.style.borderColor = 'rgba(52,211,153,0.4)';
          setTimeout(() => {
            btn.innerHTML = '<i class="far fa-copy"></i>';
            btn.style.color = '#7dd3fc';
            btn.style.borderColor = 'rgba(56,189,248,0.25)';
          }, 1800);
        }).catch(() => {});
      });
    });
  }

  /* ── 12. Page load progress ──────────────────────────────── */
  function initPageProgress() {
    // Show a brief "loading" flash on the progress bar
    const bar = document.getElementById('gbl-progress');
    if (!bar) return;
    bar.style.width = '30%';
    bar.style.transition = 'width 0.3s ease';
    setTimeout(() => { bar.style.width = '100%'; }, 200);
    setTimeout(() => { bar.style.opacity = '0'; }, 600);
    setTimeout(() => { bar.style.opacity = '1'; bar.style.width = '0%'; bar.style.transition = 'width 0.1s linear'; }, 700);
  }

  /* ── 13. Smooth anchor clicks ────────────────────────────── */
  function initSmoothAnchors() {
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', e => {
        const id = a.getAttribute('href').slice(1);
        const target = document.getElementById(id);
        if (!target) return;
        e.preventDefault();
        const offset = 72; // nav height
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      });
    });
  }

  /* ── 14. Fade-in animation for tab content ───────────────── */
  const fadeStyle = document.createElement('style');
  fadeStyle.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .tab-content.active { animation: fadeIn .3s ease; }

    /* Enhanced nav-link hover area */
    .nav-link { padding: 4px 8px; border-radius: 6px; }

    /* Topic card hover glow */
    div.glass.rounded-2xl {
      transition: border-color .25s, transform .25s, box-shadow .25s;
    }
  `;
  document.head.appendChild(fadeStyle);

  /* ── Init all ────────────────────────────────────────────── */
  function init() {
    initProgressBar();
    initBackToTop();
    initNavShrink();
    initReveal();
    initActiveTOC();
    initMobileMenu();
    initTabs();
    initAccordions();
    initLinks();
    ensureBackToHome();
    initPageProgress();
    initSmoothAnchors();

    // Copy buttons after a small delay for DOM stability
    setTimeout(initCopyButtons, 300);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
