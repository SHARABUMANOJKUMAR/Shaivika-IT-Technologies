/**
 * SHAIVIKA IT TECHNOLOGIES - Lead Interceptor
 * Captures form submissions (Contact, Newsletter) and saves them date-wise to LocalStorage
 */
document.addEventListener('DOMContentLoaded', () => {
  // Contact Form Interception
  const contactForm = document.querySelector('#contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', () => {
      // Extract values
      const nameVal = contactForm.fullName?.value || contactForm.querySelector('[name="fullName"]')?.value || 'Anonymous';
      const emailVal = contactForm.email?.value || contactForm.querySelector('[type="email"]')?.value || '';
      const phoneVal = contactForm.phone?.value || '';
      const companyVal = contactForm.company?.value || '';
      const serviceVal = contactForm.service?.value || '';
      const messageVal = contactForm.message?.value || '';
      
      // Simple validation matching contact.html validation
      if (nameVal && emailVal && messageVal) {
        // Format message to display all metadata
        let formattedMessage = '';
        if (serviceVal) formattedMessage += `Service Requested: ${serviceVal}\n`;
        if (phoneVal) formattedMessage += `Phone: ${phoneVal}\n`;
        if (companyVal) formattedMessage += `Company: ${companyVal}\n`;
        if (formattedMessage) formattedMessage += `\n`;
        formattedMessage += messageVal;

        saveSubmission({
          type: 'Contact Form',
          name: nameVal,
          email: emailVal,
          subject: serviceVal ? `Service: ${serviceVal}` : 'General Inquiry',
          message: formattedMessage
        });
      }
    });
  }

  // Newsletter Form Interception
  const newsletterForm = document.querySelector('.newsletter-form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', () => {
      const emailInput = newsletterForm.querySelector('.newsletter-input');
      if (emailInput && emailInput.value && emailInput.value.includes('@')) {
        saveSubmission({
          type: 'Newsletter',
          name: 'Newsletter Subscriber',
          email: emailInput.value,
          subject: 'Newsletter Subscription',
          message: 'Subscribed to the newsletter list.'
        });
      }
    });
  }

  function saveSubmission(data) {
    try {
      const submissions = JSON.parse(localStorage.getItem('shaivika_submissions') || '[]');
      const newSubmission = {
        id: 'lead_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toISOString(),
        ...data
      };
      submissions.push(newSubmission);
      localStorage.setItem('shaivika_submissions', JSON.stringify(submissions));
      console.log('Submission saved successfully:', newSubmission);
    } catch (e) {
      console.error('Error saving submission to localStorage:', e);
    }
  }
});
