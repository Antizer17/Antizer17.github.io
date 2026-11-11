/**
 * ==========================================================================
 * PORTFOLIO CLIENT-SIDE SCRIPTS — Sameer
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initProjectsSlider();
  initEmailDrawer();
});

/* ==========================================================================
   1. THEME TOGGLE (DARK / LIGHT MODE)
   ========================================================================== */
function initThemeToggle() {
  const root = document.documentElement;
  const modeBtn = document.getElementById('mode');

  if (!modeBtn) return;

  function updateAriaLabel() {
    const currentTheme = root.getAttribute('data-theme') || 'light';
    const isLight = currentTheme === 'light';
    modeBtn.setAttribute('aria-label', isLight ? 'Switch to dark mode' : 'Switch to light mode');
  }

  updateAriaLabel();

  modeBtn.addEventListener('click', () => {
    const currentTheme = root.getAttribute('data-theme') || 'light';
    const nextTheme = currentTheme === 'light' ? 'dark' : 'light';

    root.setAttribute('data-theme', nextTheme);
    updateAriaLabel();

    try {
      localStorage.setItem('theme', nextTheme);
    } catch (e) {
      console.warn('Unable to access localStorage for theme preference:', e);
    }
  });
}

/* ==========================================================================
   2. PROJECTS CAROUSEL / SLIDER
   ========================================================================== */
function initProjectsSlider() {
  const track = document.getElementById('project-slider');
  const prevBtn = document.getElementById('proj-prev');
  const nextBtn = document.getElementById('proj-next');

  if (!track || !prevBtn || !nextBtn) return;

  /**
   * Updates disabled states of the navigation arrow buttons
   * based on current horizontal scroll position.
   */
  function updateButtons() {
    const tolerance = 5; // px buffer to handle fractional scaling
    const maxScroll = track.scrollWidth - track.clientWidth - tolerance;

    prevBtn.disabled = track.scrollLeft <= tolerance;
    nextBtn.disabled = track.scrollLeft >= maxScroll;
  }

  /**
   * Calculates the scroll step width based on a single card's width + gap.
   */
  function getScrollStep() {
    const firstCard = track.querySelector('.card');
    const gap = 20; // 1.25rem = 20px
    return firstCard ? firstCard.offsetWidth + gap : 320;
  }

  prevBtn.addEventListener('click', () => {
    track.scrollBy({ left: -getScrollStep(), behavior: 'smooth' });
  });

  nextBtn.addEventListener('click', () => {
    track.scrollBy({ left: getScrollStep(), behavior: 'smooth' });
  });

  // Track scroll position dynamically (including touch swipes on mobile)
  track.addEventListener('scroll', updateButtons, { passive: true });
  window.addEventListener('resize', updateButtons);

  // Initial calculation
  updateButtons();
}

/* ==========================================================================
   3. EMAIL PULL-UP DRAWER (BOTTOM SHEET & CONTACT FORM)
   ========================================================================== */
function initEmailDrawer() {
  const drawer = document.getElementById('email-drawer');
  const backdrop = document.getElementById('drawer-backdrop');
  const closeBtn = document.getElementById('drawer-close');
  const openButtons = document.querySelectorAll('.open-email-btn');
  const form = document.getElementById('contact-form');
  const statusEl = document.getElementById('form-status');
  const sendBtn = document.getElementById('send-btn');

  if (!drawer) return;

  function openDrawer(event) {
    if (event) event.preventDefault();

    drawer.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden'; // Lock background scroll

    // Focus the first input field for better accessibility
    setTimeout(() => {
      const firstInput = drawer.querySelector('input');
      if (firstInput) firstInput.focus();
    }, 150);
  }

  function closeDrawer() {
    drawer.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = ''; // Restore background scroll
  }

  // Open triggers
  openButtons.forEach((btn) => btn.addEventListener('click', openDrawer));

  // Close triggers
  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  if (backdrop) backdrop.addEventListener('click', closeDrawer);

  // Keyboard shortcut: Escape to close
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('open')) {
      closeDrawer();
    }
  });

  // Form submission handler
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = document.getElementById('user-name').value.trim();
      const email = document.getElementById('user-email').value.trim();
      const subject = document.getElementById('user-subject').value.trim();
      const message = document.getElementById('user-message').value.trim();

      sendBtn.disabled = true;
      statusEl.textContent = 'Sending...';

      /**
       * CONFIGURATION: Direct Email Sending
       * -----------------------------------------------------------------------
       * To receive messages silently directly in your inbox without opening a mail client:
       * 1. Visit https://web3forms.com
       * 2. Enter your email to get a free instant access key
       * 3. Paste that access key into WEB3FORMS_ACCESS_KEY below:
       */
      const WEB3FORMS_ACCESS_KEY = ''; // <-- Paste your free key here (e.g. 'a1b2c3d4-...')

      if (WEB3FORMS_ACCESS_KEY) {
        try {
          const response = await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
            body: JSON.stringify({
              access_key: WEB3FORMS_ACCESS_KEY,
              name: name,
              email: email,
              subject: subject,
              message: message,
            }),
          });

          const result = await response.json();

          if (result.success) {
            statusEl.textContent = '✓ Message sent! I’ll get back to you soon.';
            form.reset();
            setTimeout(() => {
              closeDrawer();
              statusEl.textContent = '';
              sendBtn.disabled = false;
            }, 2500);
          } else {
            statusEl.textContent = result.message || 'Error sending message. Please try again.';
            sendBtn.disabled = false;
          }
        } catch (error) {
          statusEl.textContent = 'Network error. Please try again.';
          sendBtn.disabled = false;
        }
      } else {
        // Fallback: Opens the visitor's mail client with prefilled details
        const mailtoUri =
          'mailto:you@example.com?subject=' +
          encodeURIComponent(subject) +
          '&body=' +
          encodeURIComponent('From: ' + name + ' (' + email + ')\n\n' + message);

        window.location.href = mailtoUri;
        statusEl.textContent = 'Opening your email client...';

        setTimeout(() => {
          form.reset();
          closeDrawer();
          statusEl.textContent = '';
          sendBtn.disabled = false;
        }, 2500);
      }
    });
  }
}
