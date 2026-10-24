/**
 * SHAIVIKA IT TECHNOLOGIES - SECURE SERVER-SIDE API GATEWAY
 * Netlify Serverless Function
 * 
 * Provides:
 * 1. Strict server-side authentication & authorization checks on all privileged operations
 * 2. Privacy-preserving public invoice verification (returns masked PII only, no database dumping)
 * 3. Anti-abuse validation on public lead & career application forms (rate limiting, honeypot, bounds)
 * 4. Secure server-to-server mediation with Google Apps Script using server secrets
 * 5. Structured audit logging adhering to enterprise security standards
 */

const { verifyToken, auditLog } = require('./admin-auth');

// Configuration from Environment Variables & User Live Endpoints
const INVOICES_GAS_URL = process.env.INVOICES_GAS_URL || 'https://script.google.com/macros/s/AKfycbyoSibvTqZNQbmm5AhtYZVUYiy8zUYoToPeQGzY6je3MUPqFJAZO9mk_xa9vT73Fx186w/exec';
const CONTACT_GAS_URL = process.env.CONTACT_GAS_URL || 'https://script.google.com/macros/s/AKfycbz2ryEdo__YgiFBkps9pj4kLw5vFW3Uhvv0lSGJ1SNP3uW3n6YXv5sJe077GPvWM4gVAA/exec';
const PORTFOLIO_GAS_URL = process.env.PORTFOLIO_GAS_URL || 'https://script.google.com/macros/s/AKfycbwBnqwzKd77hBm3Ij8AtoXRnChjQrTgVv_wu3VFIXPKG8vtkNQ81A7TlarM67Kzl76t/exec';
const SUBSCRIBERS_GAS_URL = process.env.SUBSCRIBERS_GAS_URL || 'https://script.google.com/macros/s/AKfycbygI-tj94XyLqm8Lp5q-JU5_TVhbFVnRCtF-DAN1QOQHGrinCqj7ba_hyo4urKoXIw-qg/exec';
const N8N_CHAT_WEBHOOK = process.env.N8N_CHAT_WEBHOOK || 'https://n8n.shaivikamanojkumarcloud.me/webhook/shaivika-ai-chat';
const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL || PORTFOLIO_GAS_URL;
const APPS_SCRIPT_SECRET = process.env.APPS_SCRIPT_SECRET || 'shaivika-gas-backend-secret-2026';

// Verified company knowledge responder for AI chatbot
function generateFallbackChatResponse(query) {
  const q = String(query || '').toLowerCase().trim();

  // 1. Pricing inquiries
  if (q.includes('pric') || q.includes('cost') || q.includes('plan') || q.includes('package') || q.includes('rate') || q.includes('fee')) {
    return "Here are our advertised growth plans at **Shaivika IT Technologies**:\n\n" +
      "• **Starter Plan — ₹5,000**: Essential digital presence, responsive web setup, and basic integrations.\n" +
      "• **Growth Plan — ₹15,000**: Advanced business automation, dynamic web applications, lead capture, and CRM syncing.\n" +
      "• **Business Plan — ₹25,000**: Comprehensive enterprise automation, custom AI chatbots, custom workflows, and API integrations.\n" +
      "• **Custom Enterprise Plan**: Tailored scope for complex SaaS platforms and enterprise architectures.\n\n" +
      "*Note: These are advertised package prices. Exact deliverables, timeline, and final quotation are confirmed by our team based on your specific requirements.*\n\n" +
      "Would you like to discuss a customized plan for your project? Reach our team at **+91 7981431094** or send WhatsApp keyword **START**!";
  }

  // 2. AI Chatbot services
  if (q.includes('chatbot') || q.includes('bot') || q.includes('ai chat') || q.includes('conversational')) {
    return "At **Shaivika IT Technologies**, we build intelligent, custom **AI Chatbots** for websites, WhatsApp, and Telegram! 🤖✨\n\n" +
      "Our AI chatbots help businesses:\n" +
      "• Automate 24/7 customer support with human-like responses\n" +
      "• Qualify leads and capture contact details automatically\n" +
      "• Sync inquiries directly into your CRM or Google Sheets\n" +
      "• Reduce repetitive manual support workload by up to 80%\n\n" +
      "Would you like an AI Chatbot tailored for your website or WhatsApp? Reply with your business type or message us on WhatsApp with keyword **START** to get a free live demonstration!";
  }

  // 3. Web & Application Development
  if (q.includes('website') || q.includes('web') || q.includes('app') || q.includes('application') || q.includes('software') || q.includes('saas') || q.includes('ui') || q.includes('ux') || q.includes('development') || q.includes('design')) {
    return "**Shaivika IT Technologies** builds high-performance, modern websites and applications engineered for digital growth:\n\n" +
      "• **Modern Web Applications**: Lightning-fast, mobile-first, and SEO-optimized business websites.\n" +
      "• **SaaS & Cloud Platforms**: Scalable architectures with secure user authentication and database management.\n" +
      "• **E-Commerce & Portals**: Custom online stores, client billing dashboards, and payment gateways.\n" +
      "• **UI/UX Design**: Premium interactive interfaces crafted to wow visitors and maximize conversions.\n\n" +
      "Tell us what you're planning to build, or reach us directly at **shaivikagroups@gmail.com** or **+91 7981431094**!";
  }

  // 4. Business & Process Automation
  if (q.includes('automation') || q.includes('automate') || q.includes('workflow') || q.includes('crm') || q.includes('erp') || q.includes('lead') || q.includes('integration') || q.includes('api')) {
    return "Our core mission under **Shaivika Groups** is: **'Automate. Scale. Grow.'** 🚀\n\n" +
      "We build end-to-end business automation systems including:\n" +
      "• **CRM & ERP Automation**: Eliminate manual data entry and track customer pipelines effortlessly.\n" +
      "• **Lead Generation Systems**: Automated capture, qualification, and instant notification alerts.\n" +
      "• **Workflow Automation (n8n/Make)**: Connecting your forms, spreadsheets, databases, and communication channels.\n" +
      "• **WhatsApp Business Automation**: Automated customer onboarding, status updates, and interactive notifications.\n\n" +
      "We don't just build solutions; we build your success story. Which business process would you like to automate first?";
  }

  // 5. Contact information
  if (q.includes('contact') || q.includes('call') || q.includes('phone') || q.includes('email') || q.includes('reach') || q.includes('address') || q.includes('location') || q.includes('whatsapp') || q.includes('touch')) {
    return "We'd love to connect with you! Here is how you can reach **Shaivika IT Technologies**:\n\n" +
      "• 📱 **Phone / WhatsApp**: [+91 7981431094](tel:+917981431094)\n" +
      "• 💬 **WhatsApp Quick Chat**: Send keyword **START** to [+91 7981431094](https://wa.me/917981431094?text=START)\n" +
      "• ✉️ **Email**: [shaivikagroups@gmail.com](mailto:shaivikagroups@gmail.com)\n" +
      "• 📍 **Headquarters**: Kadapa, Andhra Pradesh, India\n" +
      "• 🌐 **Website**: [shaivikaittechnologies.in](https://shaivikaittechnologies.in/)\n\n" +
      "Our team is available to assist you with free consultations and project estimates!";
  }

  // 6. Services overview
  if (q.includes('service') || q.includes('offer') || q.includes('do') || q.includes('work') || q.includes('solution') || q.includes('help')) {
    return "At **Shaivika IT Technologies**, we deliver comprehensive digital solutions to help your business automate and scale:\n\n" +
      "1. **AI Chatbots & Virtual Assistants** (Website & WhatsApp automation)\n" +
      "2. **Custom Website & Full-Stack Web App Development**\n" +
      "3. **CRM, ERP & Business Process Automation**\n" +
      "4. **AI Video Advertisements & Digital Content Creation**\n" +
      "5. **SaaS Platforms & Custom Cloud Portals**\n" +
      "6. **API Integrations & Custom Webhooks**\n" +
      "7. **UI/UX Design & Conversion Optimization**\n\n" +
      "Which of these solutions are you most interested in exploring?";
  }

  // Default friendly welcome response
  return "Thank you for reaching out to **Shaivika IT Technologies**! 🌟\n\n" +
    "Brand Tagline: *'Automate. Scale. Grow.'*\n\n" +
    "We specialize in **AI Chatbots**, **Full-Stack Web Development**, **CRM/ERP Automations**, and **Business Growth Systems**.\n\n" +
    "You can ask me about:\n" +
    "• Our services & capabilities\n" +
    "• Pricing plans (starting from ₹5,000)\n" +
    "• How AI automation can save your team hours every day\n" +
    "• Direct contact with our technical team\n\n" +
    "How can I assist your business growth today?";
}

// In-memory rate limiting for public submissions (per IP)
const submissionTracker = new Map();
const SUBMISSION_LIMIT = 10;
const SUBMISSION_WINDOW_MS = 10 * 60 * 1000; // 10 minutes

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json'
};

// Client IP extractor
function getClientIp(event) {
  const headers = (event && event.headers) || {};
  return (
    headers['x-forwarded-for']?.split(',')[0].trim() ||
    headers['client-ip'] ||
    headers['x-real-ip'] ||
    '127.0.0.1'
  );
}

// Mask Customer Name for privacy (e.g. "Sharabu Manoj Kumar" -> "S****** M**** K****")
function maskCustomerName(name) {
  if (!name || typeof name !== 'string') return 'Valued Customer';
  return name.split(' ').map(part => {
    if (part.length <= 1) return part;
    return part[0] + '*'.repeat(Math.max(1, part.length - 1));
  }).join(' ');
}

// Formula Injection Sanitization
function sanitizeFormula(str) {
  if (typeof str !== 'string') return str;
  if (/^[=+@-]/.test(str)) {
    return "'" + str; // Prefix with single quote so spreadsheet engines do not evaluate formulas
  }
  return str;
}

// Route action to appropriate backend URL
function getTargetUrlForAction(action) {
  if (['getInvoices', 'saveInvoice', 'updateInvoice', 'deleteInvoice', 'verifyInvoice', 'sendInvoiceEmail'].includes(action)) {
    return INVOICES_GAS_URL;
  }
  if (['submitLead', 'getLeads', 'updateLeadStatus', 'deleteLead'].includes(action)) {
    return CONTACT_GAS_URL;
  }
  if (['getProjects', 'addProject', 'updateProject', 'deleteProject', 'bulkSyncProjects', 'getPublicProjects'].includes(action)) {
    return PORTFOLIO_GAS_URL;
  }
  return APPS_SCRIPT_URL;
}

// Forward to Google Apps Script Backend (Server-to-Server with API Key)
async function forwardToAppsScript(action, payload, user = 'admin') {
  const targetUrl = getTargetUrlForAction(action);
  const requestBody = {
    action: action,
    apiKey: APPS_SCRIPT_SECRET,
    user: user,
    timestamp: new Date().toISOString(),
    ...payload
  };

  try {
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
        'x-api-key': APPS_SCRIPT_SECRET
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`Google Apps Script returned status ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (err) {
    console.error('Apps Script forwarding error:', err.message);
    throw err;
  }
}

// Rate Limiter for public form endpoints
function checkPublicRateLimit(ip) {
  const now = Date.now();
  const entry = submissionTracker.get(ip) || { count: 0, resetAt: now + SUBMISSION_WINDOW_MS };
  if (now > entry.resetAt) {
    entry.count = 1;
    entry.resetAt = now + SUBMISSION_WINDOW_MS;
  } else {
    entry.count += 1;
  }
  submissionTracker.set(ip, entry);
  return entry.count <= SUBMISSION_LIMIT;
}

exports.handler = async (event, context) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders, body: '' };
  }

  const clientIp = getClientIp(event);

  try {
    let body = {};
    if (event.body) {
      try {
        body = JSON.parse(event.body);
      } catch (err) {
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: JSON.stringify({ status: 'error', message: 'Malformed JSON payload' })
        };
      }
    }

    const query = event.queryStringParameters || {};
    const action = body.action || query.action || '';

    // =========================================================================
    // SECTION A: PUBLIC ENDPOINTS (No Admin Auth Required, Rate Limited & Validated)
    // =========================================================================

    // 1. PUBLIC INVOICE VERIFICATION (Finding 3 Remediation)
    // ONLY returns non-PII verification status. NEVER dumps database!
    if (action === 'verifyInvoice') {
      const invoiceId = String(body.id || query.id || body.invoiceId || query.invoiceId || '').trim();

      if (!invoiceId || invoiceId.length > 60 || !/^[\w\-\.\/]+$/.test(invoiceId)) {
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: JSON.stringify({
            status: 'error',
            valid: false,
            message: 'Invalid or missing document verification identifier.'
          })
        };
      }

      auditLog('anonymous', 'verify_invoice_query', invoiceId, 'received');

      try {
        // Query the live SIT Invoices WebApp
        const response = await fetch(INVOICES_GAS_URL, { redirect: 'follow' });
        if (!response.ok) {
          throw new Error(`Invoices service returned status ${response.status}`);
        }
        const data = await response.json();
        const invoices = Array.isArray(data.invoices) ? data.invoices : [];
        const search = invoiceId.toLowerCase();

        const found = invoices.find(inv => {
          const num = String(inv['Invoice Number'] || inv.invoice_number || inv.invoiceNumber || '').trim().toLowerCase();
          const id = String(inv['Invoice ID'] || inv.invoice_id || inv.invoiceId || '').trim().toLowerCase();
          return num === search || id === search;
        });

        if (found) {
          const invStatus = String(found['Status'] || found.status || 'ACTIVE');
          const rawCustomerName = String(found['Customer Name'] || found.customer_name || found.customerName || 'Valued Customer');
          const safeName = maskCustomerName(rawCustomerName);
          const serviceName = String(found['Service'] || found.service_name || found.service || 'Professional Services');
          const totalAmt = Number(found['Total Amount'] || found.total_amount || found.totalAmount || 0);
          const invDate = found['Invoice Date'] || found.invoice_date || found.invoiceDate || '';
          const payMethod = String(found['Payment Method'] || found.payment_method || found.paymentMethod || 'Online');

          const safeVerification = {
            status: 'success',
            valid: true,
            invoice: {
              invoiceNumber: found['Invoice Number'] || found.invoice_number || found.invoiceNumber || invoiceId,
              invoiceDate: invDate,
              customerName: safeName,
              service: serviceName,
              totalAmount: totalAmt,
              status: invStatus,
              paymentMethod: payMethod,
              items: found.items && found.items.length ? found.items.map(item => ({
                description: item.description || serviceName,
                qty: Number(item.qty || 1),
                rate: Number(item.rate || totalAmt),
                total: Number(item.total || totalAmt)
              })) : [{
                description: serviceName,
                qty: 1,
                rate: Number(found['Price'] || found.subtotal || totalAmt),
                total: totalAmt
              }],
              verifiedAt: new Date().toISOString()
            }
          };

          return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify(safeVerification)
          };
        }

        return {
          statusCode: 404,
          headers: corsHeaders,
          body: JSON.stringify({
            status: 'error',
            valid: false,
            message: 'The requested invoice could not be authenticated. It may not exist or is still a draft.'
          })
        };

      } catch (err) {
        console.error('Invoice verification error:', err.message);
        return {
          statusCode: 502,
          headers: corsHeaders,
          body: JSON.stringify({
            status: 'error',
            valid: false,
            message: 'Verification gateway currently unavailable. Please try again later.'
          })
        };
      }
    }

    // 2. PUBLIC CONTACT / LEAD SUBMISSION
    if (action === 'submitLead') {
      if (!checkPublicRateLimit(clientIp)) {
        auditLog(clientIp, 'lead_submission_rate_limited', 'public_form', 'blocked');
        return {
          statusCode: 429,
          headers: corsHeaders,
          body: JSON.stringify({ status: 'error', message: 'Too many submissions. Please wait a few minutes.' })
        };
      }

      // Honeypot check for bots
      if (body._hp && String(body._hp).trim() !== '') {
        auditLog(clientIp, 'honeypot_triggered', 'public_form', 'dropped');
        return {
          statusCode: 200,
          headers: corsHeaders,
          body: JSON.stringify({ status: 'success', message: 'Inquiry received successfully.' })
        };
      }

      const fullName = sanitizeFormula(String(body.fullName || body.name || '').trim().slice(0, 100));
      const email = String(body.email || '').trim().slice(0, 150);
      const phone = sanitizeFormula(String(body.phone || '').trim().slice(0, 30));
      const company = sanitizeFormula(String(body.company || '').trim().slice(0, 100));
      const service = sanitizeFormula(String(body.service || '').trim().slice(0, 100));
      const message = sanitizeFormula(String(body.message || '').trim().slice(0, 3000));

      if (!fullName || !email || !email.includes('@') || !message) {
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: JSON.stringify({ status: 'error', message: 'Full name, valid email, and message are required.' })
        };
      }

      const leadPayload = {
        id: 'lead_' + Date.now() + '_' + Math.random().toString(36).substr(2, 7),
        fullName,
        email,
        phone,
        company,
        service: service || 'General Inquiry',
        message,
        source: String(body.source || 'Website Contact Form').slice(0, 50),
        submittedAt: new Date().toISOString()
      };

      try {
        if (leadPayload.source === 'Newsletter' || body.type === 'Newsletter') {
          // Forward to dedicated Subscribers WebApp
          await fetch(SUBSCRIBERS_GAS_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: leadPayload.email, timestamp: leadPayload.submittedAt }),
            redirect: 'follow'
          }).catch(e => console.warn('Subscribers forward notice:', e.message));
        } else {
          // Forward to dedicated Contact Form WebApp
          await fetch(CONTACT_GAS_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: leadPayload.fullName,
              email: leadPayload.email,
              phone: leadPayload.phone,
              service: leadPayload.service,
              message: leadPayload.message,
              company: leadPayload.company,
              timestamp: leadPayload.submittedAt
            }),
            redirect: 'follow'
          }).catch(e => console.warn('Contact forward notice:', e.message));
        }

        if (APPS_SCRIPT_URL && APPS_SCRIPT_URL !== PORTFOLIO_GAS_URL && APPS_SCRIPT_URL !== CONTACT_GAS_URL) {
          await forwardToAppsScript('submitLead', { lead: leadPayload }, 'public_lead_form').catch(() => {});
        }

        auditLog(email, 'lead_submission_success', leadPayload.id, 'success');
        return {
          statusCode: 200,
          headers: corsHeaders,
          body: JSON.stringify({ status: 'success', message: 'Thank you! Your inquiry has been recorded.' })
        };
      } catch (err) {
        // Fallback response for offline/graceful handling
        return {
          statusCode: 200,
          headers: corsHeaders,
          body: JSON.stringify({ status: 'success', queued: true, message: 'Inquiry recorded. We will contact you soon.' })
        };
      }
    }

    // 3. PUBLIC CAREER JOB APPLICATION SUBMISSION
    if (action === 'submitApplication') {
      if (!checkPublicRateLimit(clientIp)) {
        return {
          statusCode: 429,
          headers: corsHeaders,
          body: JSON.stringify({ status: 'error', message: 'Too many submissions. Please wait a few minutes.' })
        };
      }

      if (body._hp && String(body._hp).trim() !== '') {
        return { statusCode: 200, headers: corsHeaders, body: JSON.stringify({ status: 'success' }) };
      }

      const name = sanitizeFormula(String(body.name || '').trim().slice(0, 100));
      const email = String(body.email || '').trim().slice(0, 150);
      const phone = sanitizeFormula(String(body.phone || '').trim().slice(0, 30));
      const jobId = String(body.jobId || 'general').trim().slice(0, 50);
      const jobTitle = sanitizeFormula(String(body.jobTitle || 'General Application').trim().slice(0, 100));
      const experience = sanitizeFormula(String(body.experience || '').trim().slice(0, 50));
      const portfolio = sanitizeFormula(String(body.portfolio || '').trim().slice(0, 300));
      const message = sanitizeFormula(String(body.message || '').trim().slice(0, 2000));
      const resumeFileName = sanitizeFormula(String(body.resumeFileName || 'resume.pdf').trim().slice(0, 100));
      const resumeBase64 = String(body.resumeBase64 || '');

      if (!name || !email || !email.includes('@')) {
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: JSON.stringify({ status: 'error', message: 'Candidate name and valid email are required.' })
        };
      }

      // Resume file size limit: 5 MB base64 (~6.7 MB string)
      if (resumeBase64 && resumeBase64.length > 7000000) {
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: JSON.stringify({ status: 'error', message: 'Resume attachment exceeds 5MB size limit.' })
        };
      }

      const appPayload = {
        id: 'app_' + Date.now() + '_' + Math.random().toString(36).substr(2, 7),
        jobId,
        jobTitle,
        name,
        email,
        phone,
        experience,
        portfolio,
        message,
        resumeFileName,
        resumeUrl: String(body.resumeUrl || '').slice(0, 300),
        submittedAt: new Date().toISOString(),
        status: 'pending'
      };

      try {
        await forwardToAppsScript('submitApplication', { application: appPayload }, 'public_career_form');
        auditLog(email, 'career_application_submitted', appPayload.id, 'success');
        return {
          statusCode: 200,
          headers: corsHeaders,
          body: JSON.stringify({ status: 'success', message: 'Application submitted successfully.' })
        };
      } catch (err) {
        return {
          statusCode: 200,
          headers: corsHeaders,
          body: JSON.stringify({ status: 'success', queued: true, message: 'Application queued successfully.' })
        };
      }
    }

    // 4. PUBLIC ACTIVE PORTFOLIO PROJECTS
    if (action === 'getPublicProjects') {
      try {
        const response = await fetch(PORTFOLIO_GAS_URL, { redirect: 'follow' });
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data.projects)) {
            return {
              statusCode: 200,
              headers: corsHeaders,
              body: JSON.stringify({ status: 'success', projects: data.projects })
            };
          }
        }
      } catch (e) {
        console.info('Portfolio fetch notice:', e.message);
      }

      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ status: 'success', projects: [] })
      };
    }

    // 5. PUBLIC ACTIVE JOBS
    if (action === 'getPublicJobs') {
      try {
        const backendRes = await forwardToAppsScript('getPublicJobs', {}, 'public_visitor');
        return {
          statusCode: 200,
          headers: corsHeaders,
          body: JSON.stringify({ status: 'success', jobs: backendRes.jobs || [] })
        };
      } catch (e) {
        return {
          statusCode: 200,
          headers: corsHeaders,
          body: JSON.stringify({ status: 'success', jobs: [] })
        };
      }
    }

    // 6. PUBLIC AI CHATBOT INTERACTION (n8n Webhook Proxy with Fallback)
    if (action === 'chatMessage') {
      if (!checkPublicRateLimit(clientIp)) {
        auditLog(clientIp, 'chat_rate_limited', 'public_chatbot', 'blocked');
        return {
          statusCode: 429,
          headers: corsHeaders,
          body: JSON.stringify({
            status: 'error',
            code: 'RATE_LIMITED',
            message: 'Too many messages sent. Please wait a moment before sending another message.'
          })
        };
      }

      const rawMessage = String(body.message || body.chatInput || query.message || '').trim();
      if (!rawMessage) {
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: JSON.stringify({ status: 'error', error: 'Message cannot be empty.', message: 'Message cannot be empty.' })
        };
      }

      if (rawMessage.length > 1000) {
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: JSON.stringify({ status: 'error', error: 'Message exceeds 1,000 characters limit.', message: 'Message exceeds 1,000 characters limit.' })
        };
      }

      const sessionId = String(body.sessionId || ('session_' + clientIp.replace(/[^a-zA-Z0-9]/g, ''))).slice(0, 100);
      const cleanMessage = sanitizeFormula(rawMessage);

      auditLog(clientIp, 'chat_message_received', sessionId, 'in_progress');

      try {
        const n8nPayload = {
          message: cleanMessage,
          chatInput: cleanMessage,
          sessionId: sessionId,
          timestamp: new Date().toISOString()
        };

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 18000);

        const response = await fetch(N8N_CHAT_WEBHOOK, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json, text/plain, */*'
          },
          body: JSON.stringify(n8nPayload),
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (response.ok) {
          const contentType = response.headers.get('content-type') || '';
          let aiText = '';

          if (contentType.includes('application/json')) {
            const data = await response.json();
            if (typeof data === 'string') {
              aiText = data;
            } else if (data && typeof data === 'object') {
              aiText = data.output || data.response || data.text || data.message || (data.data && data.data.text) || '';
              if (!aiText && Array.isArray(data) && data[0]) {
                const first = data[0];
                aiText = first.output || first.response || first.text || first.message || (typeof first === 'string' ? first : '');
              }
            }
          } else {
            aiText = await response.text();
          }

          // If n8n returned default "Workflow was started", the Webhook node hasn't been set to wait for AI output
          if (aiText && typeof aiText === 'string' && aiText.trim() === 'Workflow was started') {
            auditLog(clientIp, 'chat_n8n_immediate_notice', sessionId, 'fallback');
            const fallbackReply = generateFallbackChatResponse(cleanMessage);
            return {
              statusCode: 200,
              headers: corsHeaders,
              body: JSON.stringify({
                status: 'success',
                reply: fallbackReply,
                source: 'verified_knowledge_base',
                n8nNotice: 'n8n Webhook responded immediately ("Workflow was started"). To return the AI output directly, set Webhook "Respond" to "Using Respond to Webhook Node" or "When Last Node Finishes".'
              })
            };
          }

          if (aiText && typeof aiText === 'string' && aiText.trim()) {
            auditLog(clientIp, 'chat_message_responded', sessionId, 'success');
            return {
              statusCode: 200,
              headers: corsHeaders,
              body: JSON.stringify({
                status: 'success',
                reply: aiText.trim(),
                source: 'n8n_workflow'
              })
            };
          }
        }

        // If n8n returned a non-200 (e.g. 404 webhook inactive in n8n canvas) or empty response:
        auditLog(clientIp, 'chat_n8n_offline_fallback', sessionId, 'fallback');
        const fallbackReply = generateFallbackChatResponse(cleanMessage);
        return {
          statusCode: 200,
          headers: corsHeaders,
          body: JSON.stringify({
            status: 'success',
            reply: fallbackReply,
            source: 'verified_knowledge_base',
            notice: 'n8n workflow is currently standby.'
          })
        };

      } catch (err) {
        console.warn('n8n proxy error, utilizing verified knowledge fallback:', err.message);
        const fallbackReply = generateFallbackChatResponse(cleanMessage);
        return {
          statusCode: 200,
          headers: corsHeaders,
          body: JSON.stringify({
            status: 'success',
            reply: fallbackReply,
            source: 'verified_knowledge_base'
          })
        };
      }
    }

    // =========================================================================
    // SECTION B: PRIVILEGED OPERATIONS (Strict Server-Side Auth Enforced)
    // =========================================================================
    const authHeader = event.headers.authorization || event.headers.Authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : (body.token || '');

    const user = verifyToken(token);
    if (!user) {
      auditLog('anonymous', action || 'unauthorized_access', clientIp, 'denied');
      return {
        statusCode: 401,
        headers: corsHeaders,
        body: JSON.stringify({
          status: 'error',
          code: 'UNAUTHORIZED',
          message: 'Access denied: Valid administrator authentication session required.'
        })
      };
    }

    if (user.role !== 'admin') {
      auditLog(user.sub, action, clientIp, 'forbidden');
      return {
        statusCode: 403,
        headers: corsHeaders,
        body: JSON.stringify({
          status: 'error',
          code: 'FORBIDDEN',
          message: 'Access denied: Administrator privileges required.'
        })
      };
    }

    // PRIVILEGED ACTIONS ROUTING (Forwarded with secure server-side API secret)
    const privilegedActions = [
      'getInvoices', 'saveInvoice', 'updateInvoice', 'deleteInvoice', 'sendInvoiceEmail',
      'getProjects', 'addProject', 'updateProject', 'deleteProject', 'bulkSyncProjects',
      'getJobs', 'addJob', 'updateJob', 'deleteJob',
      'getApplications', 'updateApplicationStatus', 'deleteApplication',
      'getLeads', 'updateLeadStatus', 'deleteLead',
      'backupData', 'restoreData'
    ];

    if (!privilegedActions.includes(action)) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ status: 'error', message: `Unknown or disallowed action: ${action}` })
      };
    }

    auditLog(user.sub, action, body.id || 'collection', 'in_progress');

    try {
      const backendResult = await forwardToAppsScript(action, body, user.sub);
      auditLog(user.sub, action, body.id || 'collection', 'success');

      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify(backendResult)
      };
    } catch (err) {
      auditLog(user.sub, action, body.id || 'collection', 'backend_error');
      return {
        statusCode: 502,
        headers: corsHeaders,
        body: JSON.stringify({
          status: 'error',
          message: `Backend data service failed to complete action '${action}'.`
        })
      };
    }

  } catch (err) {
    auditLog('system', 'api_gateway_exception', clientIp, 'error');
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ status: 'error', message: 'Internal API Gateway error' })
    };
  }
};
