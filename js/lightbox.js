/* ============================================================
   BDFink Studios — Lightbox
   Image gallery & video lightbox viewer
   ============================================================ */

(function () {
  'use strict';

  const lightbox = document.getElementById('lightbox');
  const lightboxContent = document.getElementById('lightboxContent');
  const closeBtn = lightbox.querySelector('.lightbox__close');
  const prevBtn = lightbox.querySelector('.lightbox__prev');
  const nextBtn = lightbox.querySelector('.lightbox__next');

  let currentItems = [];
  let currentIndex = 0;

  // ── Collect clickable items ─────────────────────────────────

  // Illustration cards
  const illusCards = document.querySelectorAll('.illus-card');
  illusCards.forEach((card) => {
    card.addEventListener('click', () => {
      currentItems = Array.from(illusCards).map((c) => ({
        type: 'image',
        src: c.dataset.full || c.querySelector('img').src,
        alt: c.querySelector('img').alt,
      }));
      currentIndex = parseInt(card.dataset.index, 10) || 0;
      openLightbox();
    });
  });

  // Book cards (shop page)
  const bookCards = document.querySelectorAll('.book-card');
  bookCards.forEach((card, i) => {
    const img = card.querySelector('.book-card__image img');
    if (!img) return;
    img.style.cursor = 'zoom-in';
    img.addEventListener('click', (e) => {
      e.preventDefault();
      currentItems = Array.from(bookCards)
        .map((c) => {
          const ci = c.querySelector('.book-card__image img');
          return ci ? { type: 'image', src: ci.src, alt: ci.alt } : null;
        })
        .filter(Boolean);
      currentIndex = i;
      openLightbox();
    });
  });

  // Video cards
  const videoCards = document.querySelectorAll('.video-card');
  videoCards.forEach((card, i) => {
    card.addEventListener('click', () => {
      const videoUrl = card.dataset.videoUrl;
      if (videoUrl && videoUrl !== '#') {
        currentItems = [{ type: 'video', src: videoUrl }];
        currentIndex = 0;
        openLightbox();
      }
    });
  });

  // ── Lightbox Controls ──────────────────────────────────────

  function openLightbox() {
    renderContent();
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';

    // Show/hide nav buttons
    const showNav = currentItems.length > 1;
    prevBtn.style.display = showNav ? 'flex' : 'none';
    nextBtn.style.display = showNav ? 'flex' : 'none';
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
    // Clear video iframes to stop playback
    lightboxContent.innerHTML = '';
  }

  function renderContent() {
    const item = currentItems[currentIndex];
    lightboxContent.innerHTML = '';

    if (item.type === 'image') {
      const img = document.createElement('img');
      img.src = item.src;
      img.alt = item.alt || 'Gallery image';
      lightboxContent.appendChild(img);
    } else if (item.type === 'video') {
      const isVimeo = item.src.includes('vimeo.com');

      const isYouTube = item.src.includes('youtube.com');
      let embedSrc = item.src;
      if (isYouTube) {
        const sep = embedSrc.includes('?') ? '&' : '?';
        embedSrc += sep + 'origin=' + encodeURIComponent(window.location.origin);
      }

      const iframe = document.createElement('iframe');
      iframe.src = embedSrc;
      iframe.setAttribute('frameborder', '0');
      iframe.setAttribute('allowfullscreen', '');
      iframe.allow = 'autoplay; picture-in-picture';

      if (isVimeo) {
        const wrapper = document.createElement('div');
        wrapper.className = 'vimeo-wrapper';

        const overlay = document.createElement('div');
        overlay.className = 'vimeo-end-overlay';

        const replayBtn = document.createElement('button');
        replayBtn.className = 'vimeo-replay-btn';
        replayBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg> Replay';

        overlay.appendChild(replayBtn);
        wrapper.appendChild(iframe);
        wrapper.appendChild(overlay);
        lightboxContent.appendChild(wrapper);

        const player = new Vimeo.Player(iframe);
        player.on('ended', () => overlay.classList.add('active'));
        replayBtn.addEventListener('click', () => {
          overlay.classList.remove('active');
          player.play();
        });
      } else {
        lightboxContent.appendChild(iframe);
      }
    }
  }

  function showPrev() {
    currentIndex =
      (currentIndex - 1 + currentItems.length) % currentItems.length;
    renderContent();
  }

  function showNext() {
    currentIndex = (currentIndex + 1) % currentItems.length;
    renderContent();
  }

  // ── Event Listeners ────────────────────────────────────────

  closeBtn.addEventListener('click', closeLightbox);
  prevBtn.addEventListener('click', showPrev);
  nextBtn.addEventListener('click', showNext);

  // Close on backdrop click
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
      closeLightbox();
    }
  });

  // Keyboard controls
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('open')) return;

    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') showPrev();
    if (e.key === 'ArrowRight') showNext();
  });

  // Touch swipe for mobile
  let touchStartX = 0;
  let touchEndX = 0;

  lightboxContent.addEventListener(
    'touchstart',
    (e) => {
      touchStartX = e.changedTouches[0].screenX;
    },
    { passive: true }
  );

  lightboxContent.addEventListener(
    'touchend',
    (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) showNext();
        else showPrev();
      }
    },
    { passive: true }
  );
})();
