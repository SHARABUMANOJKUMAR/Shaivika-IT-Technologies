/**
 * SHAIVIKA IT TECHNOLOGIES — SUBSCRIBERS GOOGLE APPS SCRIPT
 * Sheet: https://docs.google.com/spreadsheets/d/1GXysNjTgxd1BiDluP7OVkL2YmAUBVBzm0-ZNXEzNmAA/edit
 * 
 * Deployment Instructions:
 * 1. Open your Subscribers Google Sheet (ID: 1GXysNjTgxd1BiDluP7OVkL2YmAUBVBzm0-ZNXEzNmAA)
 * 2. Click Extensions > Apps Script
 * 3. Replace all existing code with this script
 * 4. Click Deploy > Manage Deployments > Edit active deployment > New Version > Deploy
 * 5. Verify the WebApp URL is active
 */

const SHEET_ID = '1GXysNjTgxd1BiDluP7OVkL2YmAUBVBzm0-ZNXEzNmAA';
const SHEET_NAME = 'Subscribers';
const HEADERS = ['Timestamp', 'Email', 'Source', 'Status', 'IP_Hash'];

function getOrCreateSubscribersSheet() {
  let ss;
  try {
    ss = SpreadsheetApp.getActiveSpreadsheet();
  } catch (e) {
    // Standalone fallback
  }
  if (!ss) {
    ss = SpreadsheetApp.openById(SHEET_ID);
  }

  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    const headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
    headerRange.setBackground('#0066ff');
    headerRange.setFontColor('#ffffff');
    headerRange.setFontWeight('bold');
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function sanitizeCell(val) {
  if (val === null || val === undefined) return '';
  const str = String(val).trim();
  if (/^[=+@-]/.test(str)) {
    return "'" + str; // Neutralize formula injection
  }
  return str;
}

function doPost(e) {
  try {
    let data = {};
    if (e && e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (err) {
        data = e.parameter || {};
      }
    } else if (e && e.parameter) {
      data = e.parameter;
    }

    const email = String(data.email || '').trim().toLowerCase();
    if (!email || !email.includes('@')) {
      return ContentService.createTextOutput(JSON.stringify({
        result: 'error',
        status: 'error',
        message: 'Valid email address is required'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    const sheet = getOrCreateSubscribersSheet();
    const lastRow = sheet.getLastRow();
    let alreadyExists = false;

    if (lastRow > 1) {
      const emailColumn = sheet.getRange(2, 2, lastRow - 1, 1).getValues();
      for (let i = 0; i < emailColumn.length; i++) {
        if (String(emailColumn[i][0]).trim().toLowerCase() === email) {
          alreadyExists = true;
          break;
        }
      }
    }

    if (!alreadyExists) {
      const row = [
        sanitizeCell(data.timestamp || new Date().toISOString()),
        sanitizeCell(email),
        sanitizeCell(data.source || 'Website Footer Newsletter'),
        'Active',
        sanitizeCell(data.ipHash || '')
      ];
      sheet.appendRow(row);
    }

    return ContentService.createTextOutput(JSON.stringify({
      result: 'success',
      status: 'success',
      alreadySubscribed: alreadyExists,
      message: alreadyExists ? 'Email is already subscribed to updates.' : 'Thank you for subscribing to Shaivika IT Technologies!'
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      result: 'error',
      status: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  const callback = e && e.parameter && e.parameter.callback;
  const out = {
    status: 'success',
    service: 'Shaivika IT Technologies Subscribers Service',
    active: true,
    sheetId: SHEET_ID
  };

  if (callback) {
    return ContentService.createTextOutput(`${callback}(${JSON.stringify(out)})`)
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }

  return ContentService.createTextOutput(JSON.stringify(out))
    .setMimeType(ContentService.MimeType.JSON);
}
