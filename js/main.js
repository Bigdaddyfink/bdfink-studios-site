/* ============================================================
   BDFink Studios — Main JavaScript
   GSAP Horizontal Scroll, Navigation, Lazy Loading
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

  // ── GSAP Horizontal Scroll ──────────────────────────────────
  function initHorizontalScroll() {
    gsap.registerPlugin(ScrollTrigger);

    panelElements = gsap.utils.toArray('.panel');
    const wrapper = document.getElementById('panels');
    const scrollWrapper = document.getElementById('scrollWrapper');

    if (isMobile()) {
      wrapper.style.flexDirection = 'column';
      wrapper.style.width = '100%';
      // Clear any leftover GSAP transforms from desktop
      gsap.set(wrapper, { x: 0, clearProps: 'transform' });
      // Ensure scroll wrapper allows vertical scrolling
      if (scrollWrapper) {
        scrollWrapper.style.overflow = 'visible';
      }
      initVerticalReveals();
      return;
    }

    // Desktop: restore overflow hidden for horizontal scroll
    if (scrollWrapper) {
      scrollWrapper.style.overflow = 'hidden';
    }

    // Desktop: horizontal scroll via GSAP ScrollTrigger
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

  function initVerticalReveals() {
    const reveals = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            entry.target.classList.remove('reveal');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    reveals.forEach((el) => observer.observe(el));
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
    // Map panel indices to nav link indices
    // Panels: 0=Hero, 1=VideoReel, 2=VideoGallery, 3=Reels, 4=AIVideo, 5=IllusFeature, 6=IllusGallery, 7=WebDesign, 8=SocialMgmt, 9=Pricing, 10=ShopCTA, 11=Contact
    // Nav:    0=Home, 1=Video,     1=Video,        1=Video, 2=AIVideo, 3=Illustration,  3=Illustration,  4=Web,       5=Social,     6=Pricing, 7=Shop,    8=Contact
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

    const ctx = canvas.getContext('2d');
    let particles = [];
    const count = 40;

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
          // Use brand accent colors randomly
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

        // Wrap around edges
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
      gsap.set(wrapper, { x: 0, clearProps: 'transform' });
      wrapper.style.flexDirection = '';
      wrapper.style.width = '';

      // Only reset elements still waiting to be revealed (not already shown)
      document.querySelectorAll('.reveal:not(.revealed)').forEach((el) => {
        gsap.set(el, { opacity: 0, y: 30 });
      });

      // On mobile, also make sure already-revealed elements stay visible
      if (isMobile()) {
        document.querySelectorAll('.revealed').forEach((el) => {
          gsap.set(el, { opacity: 1, y: 0 });
        });
      }

      initHorizontalScroll();
      initNavigation();
    }, 300);
  }

  // ── Hero Entrance (animate on load, no scroll needed) ───────
  function initHeroEntrance() {
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
    initHeroEntrance();
    initHorizontalScroll();
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
