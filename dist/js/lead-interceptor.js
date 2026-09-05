/**
 * SHAIVIKA IT TECHNOLOGIES - Lead Interceptor
 * Captures form submissions (Contact, Newsletter) and saves them date-wise to LocalStorage
 */
document.addEventListener('DOMContentLoaded', () => {
  // Contact Form Interception
  const contactForm = document.querySelector('#contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', () => {
      // Extract values with safe bounds
      const nameVal = String(contactForm.fullName?.value || contactForm.querySelector('[name="fullName"]')?.value || 'Anonymous').trim().slice(0, 100);
      const emailVal = String(contactForm.email?.value || contactForm.querySelector('[type="email"]')?.value || '').trim().slice(0, 150);
      const phoneVal = String(contactForm.phone?.value || '').trim().slice(0, 30);
      const companyVal = String(contactForm.company?.value || '').trim().slice(0, 100);
      const serviceVal = String(contactForm.service?.value || '').trim().slice(0, 100);
      const messageVal = String(contactForm.message?.value || '').trim().slice(0, 3000);
      
      // Simple validation matching contact.html validation
      if (nameVal && emailVal && emailVal.includes('@') && messageVal) {
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

      // Send to Google Sheet if Web App URL is configured
      const sheetUrl = window.GOOGLE_SHEET_WEB_APP_URL || localStorage.getItem('shaivika_google_sheet_url') || 'https://script.google.com/macros/s/AKfycbysQyEjXqm-Dyl85Wt3TE-AaEGp56XExz-EZV7sGKmUqbiOVzDruo9QSG-7KrkIiQvW/exec';
      if (sheetUrl) {
        fetch(sheetUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain' },
          body: JSON.stringify({
            sheetName: 'Form Submissions',
            ...newSubmission
          })
        }).then(() => {
          console.log('Form submission sent to Google Sheet');
        }).catch(err => {
          console.error('Google Sheet post error:', err);
        });
      }
    } catch (e) {
      console.error('Error saving submission to localStorage:', e);
    }
  }
});
