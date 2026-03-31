/* ============================================================
   BDFink Studios — Contact Form Handler
   Handles form submission with Netlify Forms
   ============================================================ */

(function () {
  'use strict';

  const form = document.querySelector('.contact-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = form.querySelector('.form-submit');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span>Sending...</span>';
    submitBtn.disabled = true;

    const formData = new FormData(form);

    try {
      const response = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(formData).toString(),
      });

      if (response.ok) {
        // Show success state
        form.innerHTML = `
          <div class="form-success">
            <svg class="form-success__icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            <h3 class="form-success__text">Message Sent</h3>
            <p class="form-success__sub">Thanks for reaching out. I'll get back to you soon.</p>
          </div>
        `;
      } else {
        throw new Error('Form submission failed');
      }
    } catch (err) {
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;

      // Show inline error
      let errorEl = form.querySelector('.form-error');
      if (!errorEl) {
        errorEl = document.createElement('p');
        errorEl.className = 'form-error';
        errorEl.style.cssText =
          'color: var(--ember); font-size: var(--text-small); margin-top: 8px;';
        submitBtn.parentElement.appendChild(errorEl);
      }
      errorEl.textContent =
        'Something went wrong. Please try emailing me directly at bdfinkstudios@gmail.com';
    }
  });
})();
