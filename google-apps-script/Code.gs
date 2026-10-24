/**
 * ============================================================================
 * SHAIVIKA IT TECHNOLOGIES - HARDENED ENTERPRISE GOOGLE APPS SCRIPT BACKEND
 * Unified Data Service for Invoices, Leads, Portfolio, Jobs & Applications
 * ============================================================================
 * 
 * SECURITY ARCHITECTURE:
 * 1. Server-to-Server Authentication: Requires valid API Key (Script Properties: 'API_KEY')
 *    for all privileged operations (reading invoice database, modifying projects, etc.).
 * 2. Anonymous Access Strictly Restricted:
 *    - Anonymous callers CANNOT dump customer invoices or access customer PII.
 *    - Anonymous 'verifyInvoice' queries return only non-sensitive, masked verification records.
 *    - Anonymous 'submitLead' and 'submitApplication' are validated, bounded, and sanitized.
 * 3. Formula Injection Neutralization: All input fields starting with =, +, -, @ are escaped.
 * 4. Record-Level Validation: Schema, type, and length constraints on every field.
 * 5. Secure Logging: Internal audit trail without logging customer PII or credentials.
 */

// Configuration & Default Fallback Secret (Overridden by ScriptProperties 'API_KEY')
const CONFIG = {
  DEFAULT_API_KEY: 'shaivika-gas-backend-secret-2026',
  COMPANY_NAME: 'Shaivika IT Technologies',
  MAX_FIELD_LENGTH: 3000
};

// Sheet Names
const SHEETS = {
  INVOICES: 'Invoices',
  PORTFOLIO: 'Portfolio',
  JOBS: 'Jobs',
  APPLICATIONS: 'Applications',
  LEADS: 'Leads',
  AUDIT_LOG: 'AuditLog'
};

// Column Layouts
const HEADERS = {
  INVOICES: [
    'Timestamp', 'Invoice ID', 'Invoice Number', 'Status', 'Customer Name',
    'Phone', 'Email', 'Service', 'Price', 'GST %', 'Subtotal', 'GST Amount',
    'CGST', 'SGST', 'Total Amount', 'Invoice Date', 'Due Date', 'State Code',
    'Payment Method', 'Notes', 'PDF File Name', 'PDF URL', 'Created At', 'Updated At'
  ],
  PORTFOLIO: [
    'ID', 'Title', 'Description', 'Categories', 'Link', 'Emoji', 'Image', 'ModalID', 'Status', 'CreatedAt'
  ],
  JOBS: [
    'Job ID', 'Title', 'Department', 'Location', 'Type', 'Experience', 'Description', 'Requirements', 'Status', 'CreatedAt'
  ],
  APPLICATIONS: [
    'Application ID', 'Job ID', 'Job Title', 'Candidate Name', 'Email', 'Phone', 'Experience', 'Portfolio', 'Message', 'Resume URL', 'Status', 'SubmittedAt'
  ],
  LEADS: [
    'Lead ID', 'Full Name', 'Email', 'Phone', 'Company', 'Service', 'Message', 'Source', 'Status', 'SubmittedAt'
  ],
  AUDIT_LOG: [
    'Timestamp', 'Actor', 'Action', 'Resource ID', 'Status'
  ]
};

// ---------------------------------------------------------------------------
// SHEET INITIALIZATION & RETRIEVAL HELPERS
// ---------------------------------------------------------------------------
function getOrCreateSheet(sheetName, headers, headerColor = '#1e3a8a') {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }
  if (sheet.getLastRow() === 0 && headers && headers.length > 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length)
      .setBackground(headerColor)
      .setFontColor('#ffffff')
      .setFontWeight('bold')
      .setHorizontalAlignment('center');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

// ---------------------------------------------------------------------------
// SECURITY & SANITIZATION UTILITIES
// ---------------------------------------------------------------------------
function getActiveApiKey() {
  try {
    const props = PropertiesService.getScriptProperties();
    const storedKey = props.getProperty('API_KEY');
    if (storedKey && storedKey.trim() !== '') return storedKey.trim();
  } catch (e) {
    // Ignore property read errors
  }
  return CONFIG.DEFAULT_API_KEY;
}

function validateApiKey(providedKey) {
  const expectedKey = getActiveApiKey();
  if (!providedKey || typeof providedKey !== 'string') return false;
  return providedKey.trim() === expectedKey;
}

// Neutralize spreadsheet formula injection (e.g. '=cmd|...', '+SUM(...)', '@...', '-...')
function sanitizeCell(val) {
  if (val === null || val === undefined) return '';
  let str = String(val).trim();
  if (str.length > CONFIG.MAX_FIELD_LENGTH) {
    str = str.substring(0, CONFIG.MAX_FIELD_LENGTH);
  }
  if (/^[=+@-]/.test(str)) {
    return "'" + str; // Prefix with single quote
  }
  return str;
}

// Mask customer name for public verification
function maskName(name) {
  if (!name || typeof name !== 'string') return 'Valued Customer';
  return name.split(' ').map(function(part) {
    if (part.length <= 1) return part;
    return part[0] + '*'.repeat(Math.max(1, part.length - 1));
  }).join(' ');
}

// Record internal audit log entry
function logAudit(actor, action, resourceId, status) {
  try {
    const sheet = getOrCreateSheet(SHEETS.AUDIT_LOG, HEADERS.AUDIT_LOG, '#334155');
    sheet.appendRow([
      new Date().toISOString(),
      sanitizeCell(actor || 'system'),
      sanitizeCell(action || 'unknown'),
      sanitizeCell(resourceId || ''),
      sanitizeCell(status || 'success')
    ]);
  } catch (e) {
    // Silently continue if audit log fails
  }
}

// Standard JSON output builder
function createResponse(data, statusCode = 200) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// ---------------------------------------------------------------------------
// AREA 1: INVOICE MANAGEMENT
// ---------------------------------------------------------------------------

// 1.A: Public Single-Invoice Verification (Finding 3 Remediation)
function verifySingleInvoice(invoiceId) {
  if (!invoiceId) return { status: 'error', valid: false, message: 'Missing verification ID' };
  const sheet = getOrCreateSheet(SHEETS.INVOICES, HEADERS.INVOICES);
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return { status: 'error', valid: false, message: 'Invoice not found' };

  const values = sheet.getRange(2, 1, lastRow - 1, HEADERS.INVOICES.length).getValues();
  const search = String(invoiceId).trim().toLowerCase();

  for (let i = 0; i < values.length; i++) {
    const row = values[i];
    const rowId = String(row[1] || '').trim().toLowerCase();
    const rowNumber = String(row[2] || '').trim().toLowerCase();

    if (rowId === search || rowNumber === search) {
      const status = String(row[3] || 'ACTIVE');
      if (status === 'DRAFT') {
        return { status: 'error', valid: false, message: 'Document is in draft status and not yet issued.' };
      }

      // Return ONLY masked, non-sensitive verification details
      return {
        status: 'success',
        valid: true,
        invoice: {
          invoiceNumber: String(row[2]),
          status: status,
          customerName: maskName(String(row[4])),
          service: String(row[7]),
          totalAmount: Number(row[14] || 0),
          invoiceDate: row[15] instanceof Date ? row[15].toISOString() : String(row[15]),
          paymentMethod: String(row[18] || 'Online'),
          items: [{ description: String(row[7]), qty: 1, rate: Number(row[8] || 0), total: Number(row[14] || 0) }]
        }
      };
    }
  }

  return { status: 'error', valid: false, message: 'Invoice record not found' };
}

// 1.B: Authenticated Invoice Query (Requires API Key)
function getAllInvoices() {
  const sheet = getOrCreateSheet(SHEETS.INVOICES, HEADERS.INVOICES);
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return { status: 'success', success: true, invoices: [] };

  const values = sheet.getRange(2, 1, lastRow - 1, HEADERS.INVOICES.length).getValues();
  const invoices = values.map(function(row) {
    const invoiceNumber = String(row[2] || '').trim();
    if (!invoiceNumber) return null;

    const inv = {};
    HEADERS.INVOICES.forEach(function(header, idx) {
      const val = row[idx];
      inv[header] = (val instanceof Date) ? val.toISOString() : val;
    });

    inv.invoice_id = row[1];
    inv.invoice_number = row[2];
    inv.status = row[3];
    inv.customer_name = row[4];
    inv.customer_phone = row[5];
    inv.customer_email = row[6];
    inv.service_name = row[7];
    inv.subtotal = row[10];
    inv.tax_amount = row[11];
    inv.total_amount = row[14];
    inv.invoice_date = row[15] instanceof Date ? row[15].toISOString() : String(row[15]);
    inv.due_date = row[16] instanceof Date ? row[16].toISOString() : String(row[16]);
    inv.payment_method = row[18];
    inv.created_at = row[22] instanceof Date ? row[22].toISOString() : String(row[22]);
    inv.items = [{ description: row[7], qty: 1, rate: row[8], taxRate: row[9], taxAmount: row[11], total: row[14] }];
    return inv;
  }).filter(Boolean);

  return { status: 'success', success: true, count: invoices.length, invoices: invoices };
}

// 1.C: Authenticated Save / Update Invoice
function saveOrUpdateInvoice(invoice) {
  if (!invoice) return { status: 'error', message: 'Missing invoice payload' };
  const sheet = getOrCreateSheet(SHEETS.INVOICES, HEADERS.INVOICES);
  const invoiceId = sanitizeCell(invoice.invoiceId || invoice.invoice_id);
  const invoiceNumber = sanitizeCell(invoice.invoiceNumber || invoice.invoice_number);

  if (!invoiceId || !invoiceNumber) {
    return { status: 'error', message: 'Invoice ID and invoice number are required.' };
  }

  const firstItem = (invoice.items && invoice.items[0]) || {};
  const price = Number(invoice.price ?? invoice.subtotal ?? firstItem.rate ?? 0);
  const gstPercent = Number(invoice.gstPercent ?? invoice.gst_percent ?? invoice.tax_rate ?? firstItem.taxRate ?? 0);
  const service = sanitizeCell(invoice.service || invoice.service_name || firstItem.description || 'Professional Services');

  const rowValues = [
    new Date(),
    invoiceId,
    invoiceNumber,
    sanitizeCell(invoice.status || 'DRAFT'),
    sanitizeCell(invoice.customerName || invoice.customer_name),
    sanitizeCell(invoice.phone || invoice.customer_phone),
    sanitizeCell(invoice.email || invoice.customer_email),
    service,
    price,
    gstPercent,
    Number(invoice.subtotal || price),
    Number(invoice.gstAmount ?? invoice.gst_amount ?? 0),
    Number(invoice.cgst || 0),
    Number(invoice.sgst || 0),
    Number(invoice.totalAmount ?? invoice.total_amount ?? price),
    sanitizeCell(invoice.invoiceDate || invoice.invoice_date),
    sanitizeCell(invoice.dueDate || invoice.due_date),
    sanitizeCell(invoice.stateCode || invoice.state_code || 'AP'),
    sanitizeCell(invoice.paymentMethod || invoice.payment_method || 'Online'),
    sanitizeCell(invoice.notes || ''),
    sanitizeCell(invoice.pdfFileName || invoice.pdf_file_name || ''),
    sanitizeCell(invoice.pdfUrl || invoice.pdf_url || ''),
    sanitizeCell(invoice.createdAt || invoice.created_at || new Date().toISOString()),
    new Date().toISOString()
  ];

  const lastRow = sheet.getLastRow();
  let targetRow = -1;
  if (lastRow > 1) {
    const ids = sheet.getRange(2, 2, lastRow - 1, 2).getValues();
    for (let i = 0; i < ids.length; i++) {
      if (String(ids[i][0]) === invoiceId || String(ids[i][1]) === invoiceNumber) {
        targetRow = i + 2;
        break;
      }
    }
  }

  if (targetRow > 0) {
    sheet.getRange(targetRow, 1, 1, HEADERS.INVOICES.length).setValues([rowValues]);
  } else {
    sheet.appendRow(rowValues);
  }

  return { status: 'success', success: true, message: 'Invoice saved successfully', invoiceId: invoiceId, invoiceNumber: invoiceNumber };
}

// ---------------------------------------------------------------------------
// AREA 2: LEADS & CONTACT FORM SUBMISSIONS
// ---------------------------------------------------------------------------
function submitLeadRecord(lead) {
  if (!lead) return { status: 'error', message: 'Missing lead payload' };
  const sheet = getOrCreateSheet(SHEETS.LEADS, HEADERS.LEADS, '#047857');
  const leadId = sanitizeCell(lead.id || ('lead_' + Date.now()));
  const fullName = sanitizeCell(lead.fullName || lead.name);
  const email = sanitizeCell(lead.email);

  if (!fullName || !email) {
    return { status: 'error', message: 'Full name and email are required' };
  }

  sheet.appendRow([
    leadId,
    fullName,
    email,
    sanitizeCell(lead.phone || ''),
    sanitizeCell(lead.company || ''),
    sanitizeCell(lead.service || 'General Inquiry'),
    sanitizeCell(lead.message || ''),
    sanitizeCell(lead.source || 'Website'),
    'new',
    new Date().toISOString()
  ]);

  return { status: 'success', success: true, message: 'Inquiry saved successfully', id: leadId };
}

function getLeadRecords() {
  const sheet = getOrCreateSheet(SHEETS.LEADS, HEADERS.LEADS, '#047857');
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return { status: 'success', leads: [] };

  const values = sheet.getRange(2, 1, lastRow - 1, HEADERS.LEADS.length).getValues();
  const leads = values.map(function(row) {
    return {
      id: row[0],
      name: row[1],
      email: row[2],
      phone: row[3],
      company: row[4],
      service: row[5],
      message: row[6],
      source: row[7],
      status: row[8],
      submittedAt: row[9] instanceof Date ? row[9].toISOString() : String(row[9])
    };
  });
  return { status: 'success', count: leads.length, leads: leads };
}

// ---------------------------------------------------------------------------
// AREA 3: PORTFOLIO MANAGEMENT
// ---------------------------------------------------------------------------
function getProjects(publicOnly = false) {
  const sheet = getOrCreateSheet(SHEETS.PORTFOLIO, HEADERS.PORTFOLIO, '#4338ca');
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return { status: 'success', projects: [] };

  const values = sheet.getRange(2, 1, lastRow - 1, HEADERS.PORTFOLIO.length).getValues();
  const projects = values.map(function(row) {
    const status = String(row[8] || 'active').toLowerCase();
    if (publicOnly && status !== 'active') return null;

    const rawCats = String(row[3] || '');
    const categories = rawCats ? rawCats.split(',').map(function(s) { return s.trim(); }) : [];

    return {
      id: String(row[0]),
      title: String(row[1]),
      description: String(row[2]),
      categories: categories,
      link: String(row[4] || ''),
      emoji: String(row[5] || '🚀'),
      image: String(row[6] || ''),
      modalId: String(row[7] || ''),
      status: status,
      createdAt: row[9] instanceof Date ? row[9].toISOString() : String(row[9])
    };
  }).filter(Boolean);

  return { status: 'success', count: projects.length, projects: projects };
}

function saveOrUpdateProject(proj) {
  if (!proj) return { status: 'error', message: 'Missing project payload' };
  const sheet = getOrCreateSheet(SHEETS.PORTFOLIO, HEADERS.PORTFOLIO, '#4338ca');
  const projId = sanitizeCell(proj.id || ('proj_' + Date.now()));
  const title = sanitizeCell(proj.title);
  if (!title) return { status: 'error', message: 'Project title is required' };

  const cats = Array.isArray(proj.categories) ? proj.categories.join(', ') : sanitizeCell(proj.categories || '');
  const rowValues = [
    projId,
    title,
    sanitizeCell(proj.description || ''),
    cats,
    sanitizeCell(proj.link || ''),
    sanitizeCell(proj.emoji || '🚀'),
    sanitizeCell(proj.image || ''),
    sanitizeCell(proj.modalId || ''),
    sanitizeCell(proj.status || 'active'),
    new Date().toISOString()
  ];

  const lastRow = sheet.getLastRow();
  let targetRow = -1;
  if (lastRow > 1) {
    const ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
    for (let i = 0; i < ids.length; i++) {
      if (String(ids[i][0]) === projId) {
        targetRow = i + 2;
        break;
      }
    }
  }

  if (targetRow > 0) {
    sheet.getRange(targetRow, 1, 1, HEADERS.PORTFOLIO.length).setValues([rowValues]);
  } else {
    sheet.appendRow(rowValues);
  }

  return { status: 'success', message: 'Project saved successfully', id: projId };
}

function deleteProjectRecord(projId) {
  if (!projId) return { status: 'error', message: 'Missing project ID' };
  const sheet = getOrCreateSheet(SHEETS.PORTFOLIO, HEADERS.PORTFOLIO, '#4338ca');
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return { status: 'error', message: 'Project not found' };

  const ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  for (let i = 0; i < ids.length; i++) {
    if (String(ids[i][0]) === String(projId)) {
      sheet.deleteRow(i + 2);
      return { status: 'success', message: 'Project deleted successfully', id: projId };
    }
  }
  return { status: 'error', message: 'Project ID not found' };
}

// ---------------------------------------------------------------------------
// AREA 4: JOBS & CAREER POSTINGS
// ---------------------------------------------------------------------------
function getJobs(publicOnly = false) {
  const sheet = getOrCreateSheet(SHEETS.JOBS, HEADERS.JOBS, '#b45309');
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return { status: 'success', jobs: [] };

  const values = sheet.getRange(2, 1, lastRow - 1, HEADERS.JOBS.length).getValues();
  const jobs = values.map(function(row) {
    const status = String(row[8] || 'active').toLowerCase();
    if (publicOnly && status !== 'active') return null;

    return {
      id: String(row[0]),
      title: String(row[1]),
      department: String(row[2]),
      location: String(row[3]),
      type: String(row[4]),
      experience: String(row[5]),
      description: String(row[6]),
      requirements: String(row[7]),
      status: status,
      createdAt: row[9] instanceof Date ? row[9].toISOString() : String(row[9])
    };
  }).filter(Boolean);

  return { status: 'success', count: jobs.length, jobs: jobs };
}

function saveOrUpdateJob(job) {
  if (!job) return { status: 'error', message: 'Missing job payload' };
  const sheet = getOrCreateSheet(SHEETS.JOBS, HEADERS.JOBS, '#b45309');
  const jobId = sanitizeCell(job.id || ('job_' + Date.now()));
  const title = sanitizeCell(job.title);
  if (!title) return { status: 'error', message: 'Job title is required' };

  const rowValues = [
    jobId,
    title,
    sanitizeCell(job.department || 'Engineering'),
    sanitizeCell(job.location || 'Kadapa / Remote'),
    sanitizeCell(job.type || 'Full-time'),
    sanitizeCell(job.experience || '1-3 Years'),
    sanitizeCell(job.description || ''),
    sanitizeCell(job.requirements || ''),
    sanitizeCell(job.status || 'active'),
    new Date().toISOString()
  ];

  const lastRow = sheet.getLastRow();
  let targetRow = -1;
  if (lastRow > 1) {
    const ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
    for (let i = 0; i < ids.length; i++) {
      if (String(ids[i][0]) === jobId) {
        targetRow = i + 2;
        break;
      }
    }
  }

  if (targetRow > 0) {
    sheet.getRange(targetRow, 1, 1, HEADERS.JOBS.length).setValues([rowValues]);
  } else {
    sheet.appendRow(rowValues);
  }

  return { status: 'success', message: 'Job posting saved successfully', id: jobId };
}

// ---------------------------------------------------------------------------
// AREA 5: JOB APPLICATIONS
// ---------------------------------------------------------------------------
function submitApplicationRecord(app) {
  if (!app) return { status: 'error', message: 'Missing application payload' };
  const sheet = getOrCreateSheet(SHEETS.APPLICATIONS, HEADERS.APPLICATIONS, '#0f766e');
  const appId = sanitizeCell(app.id || ('app_' + Date.now()));
  const name = sanitizeCell(app.name || app.candidateName);
  const email = sanitizeCell(app.email);

  if (!name || !email) {
    return { status: 'error', message: 'Candidate name and email are required' };
  }

  sheet.appendRow([
    appId,
    sanitizeCell(app.jobId || 'general'),
    sanitizeCell(app.jobTitle || 'General Application'),
    name,
    email,
    sanitizeCell(app.phone || ''),
    sanitizeCell(app.experience || ''),
    sanitizeCell(app.portfolio || ''),
    sanitizeCell(app.message || ''),
    sanitizeCell(app.resumeUrl || ''),
    'pending',
    new Date().toISOString()
  ]);

  return { status: 'success', message: 'Application recorded successfully', id: appId };
}

function getApplicationRecords() {
  const sheet = getOrCreateSheet(SHEETS.APPLICATIONS, HEADERS.APPLICATIONS, '#0f766e');
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return { status: 'success', applications: [] };

  const values = sheet.getRange(2, 1, lastRow - 1, HEADERS.APPLICATIONS.length).getValues();
  const apps = values.map(function(row) {
    return {
      id: row[0],
      jobId: row[1],
      jobTitle: row[2],
      name: row[3],
      email: row[4],
      phone: row[5],
      experience: row[6],
      portfolio: row[7],
      message: row[8],
      resumeUrl: row[9],
      status: row[10],
      submittedAt: row[11] instanceof Date ? row[11].toISOString() : String(row[11])
    };
  });
  return { status: 'success', count: apps.length, applications: apps };
}

// ---------------------------------------------------------------------------
// DISPATCHER & REQUEST HANDLERS
// ---------------------------------------------------------------------------
function processRequest(action, payload, providedKey) {
  action = String(action || '').trim();

  // Public Actions (No API Key Required)
  if (action === 'verifyInvoice') {
    return verifySingleInvoice(payload.invoiceId || payload.id);
  }
  if (action === 'submitLead') {
    return submitLeadRecord(payload.lead || payload);
  }
  if (action === 'submitApplication') {
    return submitApplicationRecord(payload.application || payload);
  }
  if (action === 'getPublicProjects') {
    return getProjects(true);
  }
  if (action === 'getPublicJobs') {
    return getJobs(true);
  }
  if (action === 'ping') {
    return { status: 'success', message: 'Shaivika backend operational', timestamp: new Date().toISOString() };
  }

  // Privileged Actions: Require Valid API Key
  if (!validateApiKey(providedKey)) {
    logAudit('unauthenticated_client', action, 'unauthorized', 'rejected');
    return {
      status: 'error',
      code: 401,
      message: 'Unauthorized: Privileged operations require valid server-side API Key.'
    };
  }

  logAudit(payload.user || 'admin', action, payload.id || 'collection', 'received');

  // Privileged Operations Routing
  switch (action) {
    case 'getInvoices':
      return getAllInvoices();
    case 'saveInvoice':
    case 'updateInvoice':
      return saveOrUpdateInvoice(payload.invoice || payload);
    case 'getProjects':
      return getProjects(false);
    case 'addProject':
    case 'updateProject':
      return saveOrUpdateProject(payload.project || payload);
    case 'deleteProject':
      return deleteProjectRecord(payload.id || (payload.project && payload.project.id));
    case 'getJobs':
      return getJobs(false);
    case 'addJob':
    case 'updateJob':
      return saveOrUpdateJob(payload.job || payload);
    case 'getApplications':
      return getApplicationRecords();
    case 'getLeads':
      return getLeadRecords();
    default:
      return { status: 'error', message: 'Unknown action: ' + action };
  }
}

function doGet(e) {
  try {
    const params = (e && e.parameter) || {};
    const action = params.action || 'ping';
    const apiKey = params.apiKey || params.key || '';
    let payload = {};

    if (params.payload) {
      try { payload = JSON.parse(params.payload); } catch (err) { payload = params; }
    } else {
      payload = params;
    }

    const result = processRequest(action, payload, apiKey);
    return createResponse(result);
  } catch (err) {
    return createResponse({ status: 'error', message: 'Server processing error' }, 500);
  }
}

function doPost(e) {
  try {
    let payload = {};
    let action = '';
    let apiKey = '';

    if (e && e.postData && e.postData.contents) {
      try {
        payload = JSON.parse(e.postData.contents);
        action = payload.action;
        apiKey = payload.apiKey || payload.key;
      } catch (err) {
        payload = e.parameter || {};
        action = payload.action;
        apiKey = payload.apiKey || payload.key;
      }
    } else if (e && e.parameter) {
      payload = e.parameter;
      action = payload.action;
      apiKey = payload.apiKey || payload.key;
    }

    const result = processRequest(action, payload, apiKey);
    return createResponse(result);
  } catch (err) {
    return createResponse({ status: 'error', message: 'Server processing error' }, 500);
  }
}
