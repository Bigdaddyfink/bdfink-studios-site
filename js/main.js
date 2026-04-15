/* ============================================================
   BDFink Studios — Main JavaScript
   Desktop: GSAP Horizontal Scroll
   Mobile: Simple vertical scroll (no GSAP scroll magic)
   ============================================================ */

(function () {
  'use strict';

  // Initialize Lucide icons
  lucide.createIcons();

  const isMobile = () => window.innerWidth <= 768;

  // Store references for navigation
  let scrollTween = null;
  let panelElements = [];
  let mainTrigger = null;

  // ── Mobile Setup (no GSAP, just clean vertical layout) ──────
  function initMobile() {
    panelElements = Array.from(document.querySelectorAll('.panel'));
    const wrapper = document.getElementById('panels');
    const scrollWrapper = document.getElementById('scrollWrapper');

    // Force vertical layout
    wrapper.style.cssText = 'display:flex; flex-direction:column; width:100%; transform:none;';

    // Allow vertical scrolling
    if (scrollWrapper) {
      scrollWrapper.style.cssText = 'overflow:visible; height:auto;';
    }

    // Make ALL content visible immediately — no animations
    document.querySelectorAll('.reveal').forEach((el) => {
      el.style.opacity = '1';
      el.style.transform = 'none';
      el.classList.add('revealed');
      el.classList.remove('reveal');
    });
  }

  // ── Desktop: GSAP Horizontal Scroll ─────────────────────────
  function initDesktop() {
    gsap.registerPlugin(ScrollTrigger);

    panelElements = gsap.utils.toArray('.panel');
    const wrapper = document.getElementById('panels');
    const scrollWrapper = document.getElementById('scrollWrapper');

    // Restore desktop styles
    if (scrollWrapper) {
      scrollWrapper.style.overflow = 'hidden';
    }
    wrapper.style.cssText = '';

    const totalWidth = wrapper.scrollWidth;
    const viewportWidth = window.innerWidth;

    scrollTween = gsap.to(wrapper, {
      x: -(totalWidth - viewportWidth),
      ease: 'none',
      scrollTrigger: {
        trigger: '.scroll-wrapper',
        pin: true,
        scrub: 1,
        end: () => '+=' + (totalWidth - viewportWidth),
        invalidateOnRefresh: true,
      },
    });

    mainTrigger = scrollTween.scrollTrigger;

    // Reveal animations using containerAnimation
    panelElements.forEach((panel) => {
      const reveals = panel.querySelectorAll('.reveal');
      reveals.forEach((el, j) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            delay: j * 0.08,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: el,
              containerAnimation: scrollTween,
              start: 'left 80%',
              toggleActions: 'play none none none',
            },
          }
        );
      });
    });
  }

  // ── Navigation ──────────────────────────────────────────────
  function initNavigation() {
    const navLinks = document.querySelectorAll(
      '.nav__link, .nav__mobile-link, .pricing-card__cta, .inline-link'
    );
    const mobileToggle = document.getElementById('navToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileClose = document.getElementById('navClose');

    navLinks.forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const sectionIndex = parseInt(link.dataset.section, 10);
        if (!isNaN(sectionIndex)) {
          scrollToPanel(sectionIndex);
        }
        if (mobileMenu.classList.contains('open')) {
          mobileMenu.classList.remove('open');
        }
      });
    });

    if (mobileToggle) {
      mobileToggle.addEventListener('click', () => {
        mobileMenu.classList.add('open');
      });
    }

    if (mobileClose) {
      mobileClose.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
      });
    }

    // Update active nav on scroll (desktop only)
    if (!isMobile()) {
      ScrollTrigger.create({
        trigger: '.scroll-wrapper',
        start: 'top top',
        end: () =>
          '+=' +
          (document.getElementById('panels').scrollWidth - window.innerWidth),
        onUpdate: (self) => {
          const progress = self.progress;
          const currentIndex = Math.round(progress * (panelElements.length - 1));
          updateActiveNav(currentIndex);
        },
      });
    }
  }

  function scrollToPanel(index) {
    if (isMobile()) {
      const panel = panelElements[index];
      if (panel) {
        panel.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }

    if (!mainTrigger || !panelElements[index]) return;

    const targetPanel = panelElements[index];
    const wrapper = document.getElementById('panels');
    const totalWidth = wrapper.scrollWidth;
    const viewportWidth = window.innerWidth;
    const maxScroll = totalWidth - viewportWidth;

    const panelLeft = targetPanel.offsetLeft;
    const scrollProgress = Math.min(panelLeft / maxScroll, 1);
    const scrollTarget =
      mainTrigger.start + scrollProgress * (mainTrigger.end - mainTrigger.start);

    gsap.to(window, {
      scrollTo: { y: scrollTarget, autoKill: false },
      duration: 1.2,
      ease: 'power2.inOut',
    });
  }

  function updateActiveNav(index) {
    const navLinks = document.querySelectorAll('.nav__link');
    const sectionMap = [0, 1, 1, 1, 2, 3, 3, 4, 5, 6, 7, 8];
    const navIndex = sectionMap[index] !== undefined ? sectionMap[index] : 0;

    navLinks.forEach((link, i) => {
      link.classList.toggle('active', i === navIndex);
    });
  }

  // ── Hero Particles ──────────────────────────────────────────
  function initHeroParticles() {
    const canvas = document.getElementById('heroParticles');
    if (!canvas) return;

    // Reduce particles on mobile for performance
    const ctx = canvas.getContext('2d');
    let particles = [];
    const count = isMobile() ? 15 : 40;

    function resize() {
      const hero = canvas.parentElement;
      canvas.width = hero.offsetWidth;
      canvas.height = hero.offsetHeight;
    }

    function createParticles() {
      particles = [];
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 2 + 0.5,
          speedX: (Math.random() - 0.5) * 0.3,
          speedY: (Math.random() - 0.5) * 0.2,
          opacity: Math.random() * 0.3 + 0.05,
          color: ['232,85,61', '232,168,62', '91,143,168'][
            Math.floor(Math.random() * 3)
          ],
        });
      }
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color}, ${p.opacity})`;
        ctx.fill();
      });

      requestAnimationFrame(animate);
    }

    resize();
    createParticles();
    animate();

    window.addEventListener('resize', () => {
      resize();
      createParticles();
    });
  }

  // ── Lazy Load Videos ────────────────────────────────────────
  function initLazyVideos() {
    const videoPlaceholders = document.querySelectorAll(
      '.video-player__placeholder'
    );

    videoPlaceholders.forEach((placeholder) => {
      placeholder.addEventListener('click', () => {
        const embed = placeholder.parentElement;
        const videoId = embed.dataset.videoId;
        const provider = embed.dataset.videoProvider || 'youtube';

        if (!videoId || videoId === 'YOUR_VIDEO_ID') return;

        let src = '';
        if (provider === 'youtube') {
          src = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`;
        } else if (provider === 'vimeo') {
          src = `https://player.vimeo.com/video/${videoId}?autoplay=1`;
        }

        const iframe = document.createElement('iframe');
        iframe.src = src;
        iframe.allow =
          'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
        iframe.allowFullscreen = true;
        embed.innerHTML = '';
        embed.appendChild(iframe);
      });
    });
  }

  // ── Resize Handler ──────────────────────────────────────────
  let resizeTimeout;
  function handleResize() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      // Kill all existing ScrollTriggers
      ScrollTrigger.getAll().forEach((st) => st.kill());
      scrollTween = null;
      mainTrigger = null;

      const wrapper = document.getElementById('panels');
      gsap.set(wrapper, { clearProps: 'all' });
      wrapper.style.cssText = '';

      if (isMobile()) {
        initMobile();
      } else {
        // Reset reveal classes for desktop re-animation
        document.querySelectorAll('.revealed').forEach((el) => {
          el.classList.add('reveal');
          el.classList.remove('revealed');
          el.style.opacity = '';
          el.style.transform = '';
        });
        initHeroEntrance();
        initDesktop();
      }

      initNavigation();
    }, 300);
  }

  // ── Hero Entrance (animate on load, desktop only) ───────────
  function initHeroEntrance() {
    if (isMobile()) return; // CSS handles visibility on mobile

    const heroReveals = document.querySelectorAll('.panel--hero .reveal');
    heroReveals.forEach((el, i) => {
      gsap.fromTo(
        el,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          delay: 0.2 + i * 0.15,
          ease: 'power2.out',
        }
      );
    });
  }

  // ── Initialize ──────────────────────────────────────────────
  function init() {
    if (isMobile()) {
      // MOBILE: No GSAP scroll, just plain vertical page
      initMobile();
    } else {
      // DESKTOP: Full GSAP horizontal scroll experience
      initHeroEntrance();
      initDesktop();
    }

    initNavigation();
    initLazyVideos();
    initHeroParticles();
    window.addEventListener('resize', handleResize);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
