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
      const iframe = document.createElement('iframe');
      iframe.src = item.src;
      iframe.allow =
        'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
      iframe.allowFullscreen = true;
      lightboxContent.appendChild(iframe);
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
