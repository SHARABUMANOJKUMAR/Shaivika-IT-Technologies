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

/**
 * Helper to get or create the Portfolio sheet with standardized headers
 */
function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.getSheets()[0];
    sheet.setName(SHEET_NAME);
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
  const sheet = getOrCreateSheet();
  action = action || 'getProjects';

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
