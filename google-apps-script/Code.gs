/**
 * ============================================================================
 * SHAIVIKA IT TECHNOLOGIES - GOOGLE APPS SCRIPT BACKEND
 * Invoice Database & Services API
 * ============================================================================
 * 
 * SETUP INSTRUCTIONS:
 * 1. Open Google Sheets (https://sheets.new) and create a new Spreadsheet.
 * 2. Rename the first sheet tab to: "Invoices" (or leave as Sheet1, script handles it).
 * 3. Go to Extensions -> Apps Script.
 * 4. Replace all code in Code.gs with this complete script.
 * 5. Click "Deploy" -> "Manage deployments" -> Edit -> New Version (or "New deployment").
 * 6. Configuration:
 *    - Description: "Shaivika Invoice API"
 *    - Execute as: "Me" (your email)
 *    - Who has access: "Anyone" (CRITICAL for website & admin portal access)
 * 7. Click "Deploy", Authorize permissions when prompted.
 * 8. Copy the generated "Web App URL" (ends with /exec).
 * 9. Paste this URL into your Shaivika Admin Dashboard -> Settings -> Google Sheet Integration!
 */

const INVOICE_SHEET_NAME = 'Invoices';
const INVOICE_HEADERS = [
  'Timestamp', 'Invoice ID', 'Invoice Number', 'Status', 'Customer Name',
  'Phone', 'Email', 'Service', 'Price', 'GST %', 'Subtotal', 'GST Amount',
  'CGST', 'SGST', 'Total Amount', 'Invoice Date', 'Due Date', 'State Code',
  'Payment Method', 'Notes', 'PDF File Name', 'PDF URL', 'Created At', 'Updated At'
];

function getOrCreateInvoiceSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(INVOICE_SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(INVOICE_SHEET_NAME);
  if (sheet.getName() !== INVOICE_SHEET_NAME) {
    throw new Error('Invoice operation attempted on wrong sheet.');
  }
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, INVOICE_HEADERS.length).setValues([INVOICE_HEADERS]);
    sheet.getRange(1, 1, 1, INVOICE_HEADERS.length)
      .setBackground('#1e3a8a').setFontColor('#ffffff').setFontWeight('bold')
      .setHorizontalAlignment('center');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function invoiceValue(value) {
  return value === null || value === undefined ? '' : value;
}

function invoiceRow(invoice) {
  const firstItem = invoice.items && invoice.items[0] ? invoice.items[0] : {};
  const price = invoice.price ?? invoice.subtotal ?? firstItem.rate ?? 0;
  const gstPercent = invoice.gstPercent ?? invoice.gst_percent ?? invoice.tax_rate ?? firstItem.taxRate ?? 0;
  const service = invoice.service || invoice.service_name || firstItem.description || '';
  return [
    new Date(), invoiceValue(invoice.invoiceId || invoice.invoice_id),
    invoiceValue(invoice.invoiceNumber || invoice.invoice_number), invoiceValue(invoice.status),
    invoiceValue(invoice.customerName || invoice.customer_name), invoiceValue(invoice.phone || invoice.customer_phone),
    invoiceValue(invoice.email || invoice.customer_email), invoiceValue(service),
    Number(price), Number(gstPercent),
    Number(invoice.subtotal || 0), Number(invoice.gstAmount ?? invoice.gst_amount ?? 0),
    Number(invoice.cgst || 0), Number(invoice.sgst || 0), Number(invoice.totalAmount ?? invoice.total_amount ?? 0),
    invoiceValue(invoice.invoiceDate || invoice.invoice_date), invoiceValue(invoice.dueDate || invoice.due_date),
    invoiceValue(invoice.stateCode || invoice.state_code), invoiceValue(invoice.paymentMethod || invoice.payment_method),
    invoiceValue(invoice.notes), invoiceValue(invoice.pdfFileName || invoice.pdf_file_name),
    invoiceValue(invoice.pdfUrl || invoice.pdf_url), invoiceValue(invoice.createdAt || invoice.created_at),
    invoiceValue(invoice.updatedAt || invoice.updated_at)
  ];
}

function validateInvoicePayload(invoice) {
  const firstItem = invoice.items && invoice.items[0] ? invoice.items[0] : {};
  const price = invoice.price ?? invoice.subtotal ?? firstItem.rate ?? 0;
  const service = invoice.service || invoice.service_name || firstItem.description;
  const required = [
    ['invoiceId', invoice.invoiceId || invoice.invoice_id],
    ['invoiceNumber', invoice.invoiceNumber || invoice.invoice_number],
    ['status', invoice.status],
    ['customerName', invoice.customerName || invoice.customer_name],
    ['service', service],
    ['paymentMethod', invoice.paymentMethod || invoice.payment_method],
    ['invoiceDate', invoice.invoiceDate || invoice.invoice_date],
    ['dueDate', invoice.dueDate || invoice.due_date],
    ['stateCode', invoice.stateCode || invoice.state_code]
  ];
  const missing = required.filter(item => item[1] === null || item[1] === undefined || String(item[1]).trim() === '').map(item => item[0]);
  if (missing.length) return { status: 'error', success: false, message: 'Missing invoice fields: ' + missing.join(', ') };
  if (Number(price) <= 0 || Number(invoice.totalAmount ?? invoice.total_amount ?? firstItem.total ?? 0) < 0) {
    return { status: 'error', success: false, message: 'Invoice price and total amount must be valid.' };
  }
  return null;
}

function saveInvoiceRecord(invoice) {
  const sheet = getOrCreateInvoiceSheet();
  const invoiceId = String(invoice.invoiceId || invoice.invoice_id || '');
  const invoiceNumber = String(invoice.invoiceNumber || invoice.invoice_number || '');
  if (!invoiceId || !invoiceNumber) return { status: 'error', success: false, message: 'Invoice ID and invoice number are required.' };
  const validationError = validateInvoicePayload(invoice);
  if (validationError) return validationError;

  const lastRow = sheet.getLastRow();
  const rows = lastRow > 1 ? sheet.getRange(2, 2, lastRow - 1, 2).getValues() : [];
  let targetRow = -1;
  rows.some(function(row, index) {
    if (String(row[0]) === invoiceId || String(row[1]) === invoiceNumber) {
      targetRow = index + 2;
      return true;
    }
    return false;
  });

  const values = invoiceRow(invoice);
  if (targetRow > 0) sheet.getRange(targetRow, 1, 1, INVOICE_HEADERS.length).setValues([values]);
  else sheet.appendRow(values);
  return {
    status: 'success', success: true, message: 'Invoice saved successfully',
    invoiceId: invoiceId, invoiceNumber: invoiceNumber
  };
}

function sendInvoiceEmail(invoice) {
  const email = String(invoice.email || invoice.customer_email || '').trim();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { status: 'error', success: false, message: 'A valid customer email is required.' };
  }
  const name = String(invoice.customerName || invoice.customer_name || 'Customer');
  const number = String(invoice.invoiceNumber || invoice.invoice_number || 'Invoice');
  const total = Number(invoice.totalAmount ?? invoice.total_amount ?? 0).toFixed(2);
  const date = String(invoice.invoiceDate || invoice.invoice_date || '');
  const service = String(invoice.service || invoice.service_name || 'Professional Services');
  const payment = String(invoice.paymentMethod || invoice.payment_method || 'Online / Bank Transfer');
  const shareUrl = String(invoice.shareUrl || invoice.share_url || '');
  const safe = function(value) { return String(value).replace(/[&<>"']/g, function(c) { return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]; }); };
  const link = shareUrl ? '<p><a href="' + safe(shareUrl) + '" style="display:inline-block;background:#2563eb;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:bold">View Invoice</a></p>' : '';
  const htmlBody = '<div style="margin:0;background:#f1f5f9;padding:24px;font-family:Arial,sans-serif;color:#172033">' +
    '<div style="max-width:620px;margin:auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 8px 30px rgba(15,23,42,.12)">' +
    '<div style="padding:28px;background:linear-gradient(135deg,#1e3a8a,#2563eb);color:#fff"><div style="font-size:22px;font-weight:bold">Shaivika IT Technologies</div><div style="opacity:.85;margin-top:6px">Professional invoice notification</div></div>' +
    '<div style="padding:28px"><p style="font-size:17px">Hello ' + safe(name) + ',</p><p>Your invoice has been generated and issued successfully.</p>' +
    '<table style="width:100%;border-collapse:collapse;margin:22px 0"><tr><td style="padding:10px 0;color:#64748b">Invoice</td><td style="padding:10px 0;text-align:right;font-weight:bold">' + safe(number) + '</td></tr>' +
    '<tr><td style="padding:10px 0;color:#64748b">Service</td><td style="padding:10px 0;text-align:right">' + safe(service) + '</td></tr>' +
    '<tr><td style="padding:10px 0;color:#64748b">Invoice date</td><td style="padding:10px 0;text-align:right">' + safe(date) + '</td></tr>' +
    '<tr><td style="padding:10px 0;color:#64748b">Payment method</td><td style="padding:10px 0;text-align:right">' + safe(payment) + '</td></tr>' +
    '<tr><td style="padding:14px 0;border-top:2px solid #e2e8f0;font-weight:bold">Total amount</td><td style="padding:14px 0;border-top:2px solid #e2e8f0;text-align:right;color:#2563eb;font-size:21px;font-weight:bold">₹' + total + '</td></tr></table>' +
    link + '<p style="color:#64748b;line-height:1.6">Thank you for choosing Shaivika IT Technologies.</p></div>' +
    '<div style="padding:18px 28px;background:#f8fafc;color:#64748b;font-size:12px">This is an automated message. Please keep this email for your records.</div></div></div>';
  MailApp.sendEmail({ to: email, subject: 'Invoice ' + number + ' - Shaivika IT Technologies', htmlBody: htmlBody, body: 'Your invoice ' + number + ' total is ₹' + total + '. ' + (shareUrl || '') });
  return { status: 'success', success: true, message: 'Invoice email sent successfully', email: email };
}

function serializeDate(dateObj) {
  if (!dateObj) return '';
  if (dateObj instanceof Date) {
    if (isNaN(dateObj.getTime())) return '';
    return dateObj.toISOString();
  }
  return String(dateObj);
}

function getInvoiceRecords() {
    const invoiceSheet = getOrCreateInvoiceSheet();
    const lastInvoiceRow = invoiceSheet.getLastRow();
    if (lastInvoiceRow <= 1) return { status: 'success', success: true, invoices: [], timestamp: new Date().toISOString(), source: 'google-sheets' };
    const values = invoiceSheet.getRange(2, 1, lastInvoiceRow - 1, INVOICE_HEADERS.length).getValues();
    const invoices = values.map(function(row) {
      const invoiceNumber = String(row[2] || '').trim();
      if (!invoiceNumber || /^proj_/i.test(invoiceNumber)) return null;
      const invoice = {};
      INVOICE_HEADERS.forEach(function(header, index) { 
        if (header.includes('Date') || header === 'Timestamp' || header.includes('At')) {
          invoice[header] = serializeDate(row[index]);
        } else {
          invoice[header] = row[index]; 
        }
      });
      invoice.invoice_id = row[1];
      invoice.invoice_number = row[2];
      invoice.status = row[3];
      invoice.customer_name = row[4];
      invoice.customer_phone = row[5];
      invoice.customer_email = row[6];
      invoice.service_name = row[7];
      invoice.subtotal = row[10];
      invoice.tax_amount = row[11];
      invoice.total_amount = row[14];
      invoice.invoice_date = serializeDate(row[15]);
      invoice.due_date = serializeDate(row[16]);
      invoice.payment_method = row[18];
      invoice.created_at = serializeDate(row[22]);
      invoice.updated_at = serializeDate(row[23]);
      invoice.items = [{ description: row[7], qty: 1, rate: row[8], taxRate: row[9], taxAmount: row[11], total: row[14] }];
      return invoice;
    }).filter(Boolean);
    return { status: 'success', success: true, invoices: invoices, timestamp: new Date().toISOString(), source: 'google-sheets' };
}

/**
 * Standard JSON / JSONP Response
 */
function createJsonResponse(data, callback) {
  if (callback && String(callback).trim() !== '') {
    return ContentService.createTextOutput(callback + '(' + JSON.stringify(data) + ')')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Core Action Handler for both GET and POST requests
 */
function processAction(action, payload) {
  action = action || 'getInvoices';

  if (action === 'ping') {
    return {
      status: 'success',
      message: 'Shaivika IT Invoice Backend is live and connected!',
      timestamp: new Date().toISOString()
    };
  }

  if (action === 'saveInvoice' || action === 'updateInvoice') {
    return saveInvoiceRecord(payload.invoice || payload);
  }
  if (action === 'sendInvoiceEmail') {
    return sendInvoiceEmail(payload.invoice || payload);
  }
  if (action === 'getInvoices') {
    return getInvoiceRecords();
  }

  return {
    status: 'error',
    message: 'Unknown action: ' + action
  };
}

/**
 * GET Handler: Supports read and write operations via GET / JSONP
 */
function doGet(e) {
  try {
    const callback = (e && e.parameter && (e.parameter.callback || e.parameter.prefix)) || '';
    let action = (e && e.parameter && e.parameter.action) || 'getInvoices';
    let payload = {};

    if (e && e.parameter) {
      if (e.parameter.payload) {
        try { payload = JSON.parse(e.parameter.payload); } catch (err) { payload = e.parameter; }
      } else {
        payload = e.parameter;
      }
    }

    const result = processAction(action, payload);
    return createJsonResponse(result, callback);

  } catch (error) {
    const callback = (e && e.parameter && (e.parameter.callback || e.parameter.prefix)) || '';
    return createJsonResponse({ status: 'error', message: error.toString() }, callback);
  }
}

/**
 * POST Handler: Handles Add, Edit, Delete, and Bulk Sync via POST
 */
function doPost(e) {
  try {
    let payload = {};
    let action = 'saveInvoice';

    if (e && e.postData && e.postData.contents) {
      try {
        payload = JSON.parse(e.postData.contents);
        if (payload.action) action = payload.action;
      } catch (err) {
        payload = e.parameter || {};
        if (payload.action) action = payload.action;
      }
    } else if (e && e.parameter) {
      payload = e.parameter;
      if (payload.action) action = payload.action;
    }

    // Handle array payload (bulk sync)
    if (Array.isArray(payload)) {
      payload.forEach(inv => saveInvoiceRecord(inv));
      return createJsonResponse({ status: 'success', message: 'Bulk sync completed' }, '');
    }

    const result = processAction(action, payload);
    return createJsonResponse(result, '');

  } catch (error) {
    return createJsonResponse({ status: 'error', message: error.toString() }, '');
  }
}
