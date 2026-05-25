/* ============================================================
   BDFink Studios — Main JavaScript
   Vertical Scroll, GSAP Reveals, Navigation
   ============================================================ */

(function () {
  'use strict';

  // Initialize Lucide icons
  lucide.createIcons();

  // ── GSAP Vertical Scroll Reveals ────────────────────────────
  function initScrollReveals() {
    gsap.registerPlugin(ScrollTrigger);

    // Animate hero elements on page load (staggered entrance)
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
          onComplete: () => {
            el.classList.add('revealed');
            el.classList.remove('reveal');
          },
        }
      );
    });

    // Animate all other .reveal elements on scroll
    const reveals = document.querySelectorAll('.reveal');
    reveals.forEach((el) => {
      gsap.fromTo(
        el,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
          onComplete: () => {
            el.classList.add('revealed');
            el.classList.remove('reveal');
          },
        }
      );
    });
  }

  // ── Navigation ──────────────────────────────────────────────
  function initNavigation() {
    const navLinks = document.querySelectorAll(
      '.nav__link, .nav__mobile-link, .pricing-card__cta, .inline-link, .care-plan__cta'
    );
    const mobileToggle = document.getElementById('navToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileClose = document.getElementById('navClose');

    // Smooth scroll to anchor
    navLinks.forEach((link) => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href && href.startsWith('#')) {
          e.preventDefault();
          const target = document.querySelector(href);
          if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
          }
          // Close mobile menu
          if (mobileMenu && mobileMenu.classList.contains('open')) {
            mobileMenu.classList.remove('open');
          }
        }
      });
    });

    // Mobile menu toggle
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

    // Active nav tracking based on scroll position
    const sections = document.querySelectorAll('section[id]');
    const desktopLinks = document.querySelectorAll('.nav__link');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            desktopLinks.forEach((link) => {
              const linkHref = link.getAttribute('href');
              link.classList.toggle('active', linkHref === '#' + id);
            });
          }
        });
      },
      { rootMargin: '-20% 0px -60% 0px' }
    );

    sections.forEach((section) => observer.observe(section));
  }

  // ── Hero Particles ──────────────────────────────────────────
  function initHeroParticles() {
    const canvas = document.getElementById('heroParticles');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let particles = [];
    const isMobile = window.innerWidth <= 768;
    const count = isMobile ? 15 : 40;

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

  // ── Featured Vimeo end-screen overlay ───────────────────────
  function initFeaturedVimeo() {
    const iframe = document.getElementById('featuredVimeoIframe');
    const overlay = document.getElementById('featuredVimeoOverlay');
    const replayBtn = document.getElementById('featuredVimeoReplay');
    if (!iframe || !overlay || !replayBtn) return;

    const player = new Vimeo.Player(iframe);
    player.on('ended', () => overlay.classList.add('active'));
    replayBtn.addEventListener('click', () => {
      overlay.classList.remove('active');
      player.play();
    });
  }

  // ── Initialize ──────────────────────────────────────────────
  function init() {
    initScrollReveals();
    initNavigation();
    initLazyVideos();
    initHeroParticles();
    initFeaturedVimeo();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
