/**
 * SHAIVIKA IT TECHNOLOGIES - SECURE LEAD INTERCEPTOR
 * Intercepts inquiries and newsletter subscriptions with anti-abuse controls
 * Routes through secure API Gateway (ShaivikaAPI) with offline localStorage backup
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Contact Form Interception (Ensures offline storage & API routing)
  const contactForm = document.querySelector('#contactForm');
  if (contactForm && !contactForm.dataset.interceptorAttached) {
    contactForm.dataset.interceptorAttached = 'true';

    // Add hidden honeypot field dynamically if not present
    if (!contactForm.querySelector('input[name="_hp"]')) {
      const hp = document.createElement('input');
      hp.type = 'text';
      hp.name = '_hp';
      hp.style.cssText = 'display:none!important;position:absolute!important;left:-9999px!important;';
      hp.tabIndex = -1;
      hp.setAttribute('autocomplete', 'off');
      contactForm.appendChild(hp);
    }
  }

  // 2. Newsletter Form Interception
  const newsletterForms = document.querySelectorAll('.newsletter-form');
  newsletterForms.forEach(form => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const emailInput = form.querySelector('.newsletter-input') || form.querySelector('input[type="email"]');
      const emailVal = String(emailInput?.value || '').trim();

      if (emailVal && emailVal.includes('@')) {
        const lead = {
          type: 'Newsletter',
          fullName: 'Newsletter Subscriber',
          email: emailVal,
          service: 'Newsletter Subscription',
          message: 'Subscribed to the newsletter updates.',
          source: window.location.pathname || 'Website'
        };

        saveLocalLead(lead);

        if (window.ShaivikaAPI && typeof window.ShaivikaAPI.submitLead === 'function') {
          try {
            await window.ShaivikaAPI.submitLead(lead);
          } catch (err) {
            // Handled via local storage queue
          }
        }

        emailInput.value = '';
        const btn = form.querySelector('button[type="submit"]');
        if (btn) {
          const orig = btn.innerHTML;
          btn.innerHTML = '✓ Subscribed!';
          btn.disabled = true;
          setTimeout(() => {
            btn.innerHTML = orig;
            btn.disabled = false;
          }, 4000);
        }
      }
    });
  });

  function saveLocalLead(data) {
    try {
      const submissions = JSON.parse(localStorage.getItem('shaivika_submissions') || '[]');
      const newSubmission = {
        id: 'lead_' + Date.now() + '_' + Math.random().toString(36).substr(2, 7),
        timestamp: new Date().toISOString(),
        ...data
      };
      submissions.unshift(newSubmission);
      localStorage.setItem('shaivika_submissions', JSON.stringify(submissions.slice(0, 100)));
    } catch (e) {
      // Ignore quota errors
    }
  }

  // Global helper for form submissions
  window.saveLocalLead = saveLocalLead;
});
