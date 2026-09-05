/**
 * ============================================================================
 * SHAIVIKA IT TECHNOLOGIES - GOOGLE APPS SCRIPT BACKEND
 * Portfolio Projects & CMS Database Service
 * ============================================================================
 * 
 * SETUP INSTRUCTIONS:
 * 1. Open Google Sheets (https://sheets.new) and create a new Spreadsheet.
 * 2. Rename the first sheet tab to: "Portfolio" (or leave as Sheet1, script handles it).
 * 3. Go to Extensions -> Apps Script.
 * 4. Replace all code in Code.gs with this complete script.
 * 5. Click "Deploy" -> "Manage deployments" -> Edit -> New Version (or "New deployment").
 * 6. Configuration:
 *    - Description: "Shaivika Portfolio CMS API"
 *    - Execute as: "Me" (your email)
 *    - Who has access: "Anyone" (CRITICAL for website & admin portal access)
 * 7. Click "Deploy", Authorize permissions when prompted.
 * 8. Copy the generated "Web App URL" (ends with /exec).
 * 9. Paste this URL into your Shaivika Admin Dashboard -> Settings -> Google Sheet Integration!
 */

const SHEET_NAME = 'Portfolio';
const HEADERS = [
  'ID',
  'Title',
  'Description',
  'Categories',
  'Link',
  'Emoji',
  'Image',
  'ModalID',
  'Status',
  'CreatedAt'
];

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
  migrateLegacyPortfolioRows(sheet);
  return sheet;
}

function migrateLegacyPortfolioRows(invoiceSheet) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let portfolioSheet = ss.getSheetByName(SHEET_NAME);
  if (!portfolioSheet) portfolioSheet = ss.insertSheet(SHEET_NAME);
  if (portfolioSheet.getName() !== SHEET_NAME) {
    throw new Error('Portfolio operation attempted on wrong sheet.');
  }
  if (portfolioSheet.getLastRow() === 0) {
    portfolioSheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    portfolioSheet.getRange(1, 1, 1, HEADERS.length)
      .setFontWeight('bold').setBackground('#0066ff').setFontColor('#ffffff');
    portfolioSheet.setFrozenRows(1);
  }

  const lastRow = invoiceSheet.getLastRow();
  if (lastRow <= 1) return 0;
  const width = Math.max(invoiceSheet.getLastColumn(), INVOICE_HEADERS.length);
  const values = invoiceSheet.getRange(2, 1, lastRow - 1, width).getValues();
  const existingIds = portfolioSheet.getLastRow() > 1
    ? portfolioSheet.getRange(2, 1, portfolioSheet.getLastRow() - 1, 1).getValues().map(row => String(row[0]))
    : [];
  const rowsToMove = [];
  const rowsToDelete = [];

  values.forEach(function(row, index) {
    const id = String(row[0] || '').trim();
    const title = String(row[1] || '').trim();
    const link = String(row[4] || '').trim();
    const status = String(row[8] || '').trim();
    const isPortfolioRow = /^proj_/i.test(id) ||
      (title === 'Untitled Project' && link === 'contact.html' && status === 'active');
    if (!isPortfolioRow) return;
    if (id && existingIds.indexOf(id) === -1) {
      rowsToMove.push([
        id || ('proj_' + new Date().getTime() + '_' + index), title,
        String(row[2] || ''), String(row[3] || ''), link,
        String(row[5] || '💼'), String(row[6] || ''), String(row[7] || ''),
        status || 'active', String(row[9] || new Date().toLocaleString())
      ]);
      existingIds.push(id);
    }
    rowsToDelete.push(index + 2);
  });

  if (rowsToMove.length) {
    portfolioSheet.getRange(portfolioSheet.getLastRow() + 1, 1, rowsToMove.length, HEADERS.length).setValues(rowsToMove);
  }
  rowsToDelete.reverse().forEach(rowNumber => invoiceSheet.deleteRow(rowNumber));
  return rowsToDelete.length;
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
  if (sheet.getName() !== INVOICE_SHEET_NAME) {
    throw new Error('Invoice operation attempted on wrong sheet.');
  }
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

/**
 * Helper to get or create the Portfolio sheet with standardized headers
 */
function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);
  if (sheet.getName() !== SHEET_NAME) {
    throw new Error('Portfolio operation attempted on wrong sheet.');
  }
  
  // Ensure headers exist
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length)
      .setFontWeight('bold')
      .setBackground('#0066ff')
      .setFontColor('#ffffff');
    sheet.setFrozenRows(1);
  }
  return sheet;
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
  action = action || 'getProjects';

  const invoiceActions = ['saveInvoice', 'updateInvoice', 'sendInvoiceEmail', 'getInvoices'];
  if (invoiceActions.indexOf(action) !== -1) {
    if (action === 'saveInvoice' || action === 'updateInvoice') {
      return saveInvoiceRecord(payload.invoice || payload);
    }
    if (action === 'sendInvoiceEmail') {
      return sendInvoiceEmail(payload.invoice || payload);
    }
    return getInvoiceRecords();
  }

  const sheet = getOrCreateSheet();
  if (sheet.getName() !== SHEET_NAME) {
    throw new Error('Portfolio operation attempted on wrong sheet.');
  }

  // 1. PING / TEST CONNECTION
  if (action === 'ping') {
    return {
      status: 'success',
      message: 'Shaivika IT Apps Script Backend is live and connected!',
      timestamp: new Date().toISOString()
    };
  }

  // 2. GET ALL PROJECTS
  if (action === 'getProjects') {
    const lastRow = sheet.getLastRow();
    if (lastRow <= 1) {
      return {
        status: 'success',
        count: 0,
        projects: []
      };
    }

    const values = sheet.getRange(2, 1, lastRow - 1, HEADERS.length).getValues();
    const projects = values.map(function(row) {
      const categoriesRaw = row[3] ? String(row[3]) : '';
      const categories = categoriesRaw
        ? categoriesRaw.split(',').map(function(c) { return c.trim(); }).filter(Boolean)
        : [];

      return {
        id: String(row[0] || ''),
        title: String(row[1] || ''),
        description: String(row[2] || ''),
        categories: categories,
        link: String(row[4] || ''),
        emoji: String(row[5] || '💼'),
        image: String(row[6] || ''),
        modalId: String(row[7] || ''),
        status: String(row[8] || 'active'),
        created_at: String(row[9] || '')
      };
    }).filter(function(p) { return p.id && p.status !== 'deleted'; });

    return {
      status: 'success',
      count: projects.length,
      projects: projects
    };
  }

  // 3. ADD PROJECT
  if (action === 'addProject') {
    const project = payload.project || payload;
    const id = String(project.id || 'proj_' + new Date().getTime());
    const title = String(project.title || 'Untitled Project');
    const desc = String(project.description || '');
    const categories = Array.isArray(project.categories)
      ? project.categories.join(', ')
      : String(project.categories || '');
    const link = String(project.link || 'contact.html');
    const emoji = String(project.emoji || '💼');
    const image = String(project.image || '');
    const modalId = String(project.modalId || '');
    const status = String(project.status || 'active');
    const createdAt = String(project.created_at || new Date().toLocaleString());

    sheet.appendRow([
      id,
      title,
      desc,
      categories,
      link,
      emoji,
      image,
      modalId,
      status,
      createdAt
    ]);

    return {
      status: 'success',
      message: 'Project added to Google Sheet successfully',
      id: id
    };
  }

  // 4. UPDATE PROJECT
  if (action === 'updateProject') {
    const project = payload.project || payload;
    const id = String(project.id || '');
    if (!id) {
      return { status: 'error', message: 'Project ID is required for update' };
    }

    const lastRow = sheet.getLastRow();
    if (lastRow <= 1) {
      // If no rows, append as new
      return processAction('addProject', { project: project });
    }

    const ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues().map(function(r) { return String(r[0]); });
    const rowIndex = ids.indexOf(id);

    const categories = Array.isArray(project.categories)
      ? project.categories.join(', ')
      : String(project.categories || '');

    if (rowIndex === -1) {
      // If not found in sheet, append
      sheet.appendRow([
        id,
        String(project.title || ''),
        String(project.description || ''),
        categories,
        String(project.link || ''),
        String(project.emoji || '💼'),
        String(project.image || ''),
        String(project.modalId || ''),
        String(project.status || 'active'),
        String(project.created_at || new Date().toLocaleString())
      ]);
      return { status: 'success', message: 'Project inserted (was not found for update)', id: id };
    }

    const targetRow = rowIndex + 2; // +1 for 1-based index, +1 for header
    sheet.getRange(targetRow, 1, 1, HEADERS.length).setValues([[
      id,
      String(project.title || ''),
      String(project.description || ''),
      categories,
      String(project.link || ''),
      String(project.emoji || '💼'),
      String(project.image || ''),
      String(project.modalId || ''),
      String(project.status || 'active'),
      String(project.created_at || new Date().toLocaleString())
    ]]);

    return {
      status: 'success',
      message: 'Project updated in Google Sheet successfully',
      id: id
    };
  }

  // 5. DELETE PROJECT
  if (action === 'deleteProject') {
    const id = String(payload.id || (payload.project && payload.project.id) || '');
    if (!id) {
      return { status: 'error', message: 'Project ID is required for deletion' };
    }

    const lastRow = sheet.getLastRow();
    if (lastRow <= 1) {
      return { status: 'warning', message: 'No rows to delete' };
    }

    const ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues().map(function(r) { return String(r[0]); });
    const rowIndex = ids.indexOf(id);

    if (rowIndex !== -1) {
      const targetRow = rowIndex + 2;
      sheet.deleteRow(targetRow);
      return {
        status: 'success',
        message: 'Project deleted from Google Sheet successfully',
        id: id
      };
    } else {
      return {
        status: 'warning',
        message: 'Project ID not found in sheet, nothing deleted',
        id: id
      };
    }
  }

  // 6. BULK SYNC
  if (action === 'bulkSync') {
    const projectsList = payload.projects || [];
    if (!Array.isArray(projectsList)) {
      return { status: 'error', message: 'Projects must be an array' };
    }

    // Clear existing data rows
    const lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      sheet.deleteRows(2, lastRow - 1);
    }

    if (projectsList.length > 0) {
      const rows = projectsList.map(function(p) {
        const cats = Array.isArray(p.categories) ? p.categories.join(', ') : String(p.categories || '');
        return [
          String(p.id || 'proj_' + new Date().getTime()),
          String(p.title || ''),
          String(p.description || ''),
          cats,
          String(p.link || ''),
          String(p.emoji || '💼'),
          String(p.image || ''),
          String(p.modalId || ''),
          String(p.status || 'active'),
          String(p.created_at || new Date().toLocaleString())
        ];
      });

      sheet.getRange(2, 1, rows.length, HEADERS.length).setValues(rows);
    }

    return {
      status: 'success',
      message: 'Bulk sync completed: ' + projectsList.length + ' projects saved to Google Sheet.'
    };
  }

  return {
    status: 'error',
    message: 'Unknown action: ' + action
  };
}

function getInvoiceRecords() {
    const invoiceSheet = getOrCreateInvoiceSheet();
    const lastInvoiceRow = invoiceSheet.getLastRow();
    if (lastInvoiceRow <= 1) return { status: 'success', success: true, invoices: [] };
    const values = invoiceSheet.getRange(2, 1, lastInvoiceRow - 1, INVOICE_HEADERS.length).getValues();
    const invoices = values.map(function(row) {
      const invoiceNumber = String(row[2] || '').trim();
      if (!invoiceNumber || /^proj_/i.test(invoiceNumber)) return null;
      const invoice = {};
      INVOICE_HEADERS.forEach(function(header, index) { invoice[header] = row[index]; });
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
      invoice.invoice_date = row[15];
      invoice.due_date = row[16];
      invoice.payment_method = row[18];
      invoice.items = [{ description: row[7], qty: 1, rate: row[8], taxRate: row[9], taxAmount: row[11], total: row[14] }];
      return invoice;
    }).filter(Boolean);
    return { status: 'success', success: true, invoices: invoices };
}

/**
 * GET Handler: Supports read and write operations via GET / JSONP
 */
function doGet(e) {
  try {
    const callback = (e && e.parameter && (e.parameter.callback || e.parameter.prefix)) || '';
    let action = (e && e.parameter && e.parameter.action) || 'getProjects';
    let payload = {};

    if (e && e.parameter) {
      if (e.parameter.payload) {
        try {
          payload = JSON.parse(e.parameter.payload);
        } catch (err) {
          payload = e.parameter;
        }
      } else if (e.parameter.project) {
        try {
          payload = { project: JSON.parse(e.parameter.project) };
        } catch (err) {
          payload = e.parameter;
        }
      } else {
        payload = e.parameter;
      }
    }

    const result = processAction(action, payload);
    return createJsonResponse(result, callback);

  } catch (error) {
    const callback = (e && e.parameter && (e.parameter.callback || e.parameter.prefix)) || '';
    return createJsonResponse({
      status: 'error',
      message: error.toString()
    }, callback);
  }
}

/**
 * POST Handler: Handles Add, Edit, Delete, and Bulk Sync via POST
 */
function doPost(e) {
  try {
    let payload = {};
    let action = 'addProject';

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

    const result = processAction(action, payload);
    return createJsonResponse(result, '');

  } catch (error) {
    return createJsonResponse({
      status: 'error',
      message: error.toString()
    }, '');
  }
}
