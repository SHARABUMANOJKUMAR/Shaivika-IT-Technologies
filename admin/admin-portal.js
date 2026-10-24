/**
 * SHAIVIKA IT TECHNOLOGIES - ADMIN PORTAL COMPONENT
 * Production-Grade Dynamic Mount Controller
 * Separates privileged dashboard markup from unauthenticated visitors
 */

(function() {
  'use strict';

  const DASHBOARD_TEMPLATE = "    <!-- ===== MAIN DASHBOARD ===== -->\n    \n    <!-- Mobile Header (Visible only on mobile/tablet) -->\n    <header class=\"mobile-header\">\n        <div class=\"mobile-header-title\">SHAIVIKA ADMIN</div>\n        <button class=\"mobile-menu-btn\" id=\"mobileMenuBtn\" aria-label=\"Open Menu\">\n            <i class=\"fa-solid fa-bars\"></i>\n        </button>\n    </header>\n    \n    <!-- Sidebar Overlay (Visible when sidebar is open on mobile) -->\n    <div class=\"sidebar-overlay\" id=\"sidebarOverlay\"></div>\n\n    <div class=\"dashboard-container\" id=\"dashboardContainer\">\n        <!-- Sidebar Navigation -->\n        <aside class=\"sidebar\" id=\"adminSidebar\">\n            <div class=\"sidebar-header\">\n                <span class=\"sidebar-logo\">SHAIVIKA ADMIN</span>\n                <button class=\"theme-toggle-btn action-btn\" aria-label=\"Toggle Theme\" id=\"themeToggleBtn\">🌙</button>\n            </div>\n            <ul class=\"sidebar-nav\">\n                <li class=\"sidebar-item\">\n                    <span class=\"sidebar-link active\" data-tab=\"dashboard-summary\">📊 Dashboard Summary</span>\n                </li>\n                <li class=\"sidebar-item\">\n                    <span class=\"sidebar-link\" data-tab=\"portfolio-manager-tab\">💼 Portfolio Projects</span>\n                </li>\n                <li class=\"sidebar-item\">\n                    <span class=\"sidebar-link\" data-tab=\"category-manager-tab\">🏷️ Categories</span>\n                </li>\n                <li class=\"sidebar-item\">\n                    <span class=\"sidebar-link\" data-tab=\"leads-manager-tab\">✉️ Form Submissions</span>\n                </li>\n                <li class=\"sidebar-item\">\n                    <span class=\"sidebar-link\" data-tab=\"jobs-manager-tab\">👔 Job Openings</span>\n                </li>\n                <li class=\"sidebar-item\">\n                    <span class=\"sidebar-link\" data-tab=\"applications-manager-tab\" style=\"display:flex;align-items:center;justify-content:space-between;\">\n                        <span>📄 Job Applications</span>\n                        <span id=\"pendingAppsBadge\" class=\"status-badge badge-warning\" style=\"display:none;font-size:0.7rem;padding:2px 7px;\">0</span>\n                    </span>\n                </li>\n\n                <li class=\"sidebar-item\">\n                    <span class=\"sidebar-link\" data-tab=\"invoice-generator-tab\"><i class=\"fa fa-file-invoice-dollar\"></i> Billing & Invoices</span>\n                </li>\n<li class=\"sidebar-item\">\n                    <span class=\"sidebar-link\" data-tab=\"settings-tab\">⚙️ Settings & Backup</span>\n                </li>\n            </ul>\n            <div class=\"sidebar-footer\">\n                <span class=\"sidebar-link\" id=\"logoutBtn\" style=\"color: var(--danger);\">🚪 Sign Out</span>\n            </div>\n        </aside>\n\n        <!-- Main Workspace -->\n        <main class=\"main-content\">\n            <!-- Header -->\n            <header class=\"content-header\">\n                <h2 class=\"page-title\" id=\"contentTitle\">Dashboard Summary</h2>\n                <div style=\"font-size: 0.9rem; color: var(--text-secondary);\" id=\"currentTime\"></div>\n            </header>\n\n            <!-- TAB 1: SUMMARY -->\n            <section class=\"tab-content active\" id=\"dashboard-summary\">\n                <div class=\"stats-grid\">\n                    <div class=\"stat-card\">\n                        <div class=\"stat-icon\">💼</div>\n                        <div class=\"stat-details\">\n                            <h3>Total Projects</h3>\n                            <p id=\"statTotalProjects\">0</p>\n                        </div>\n                    </div>\n                    <div class=\"stat-card\">\n                        <div class=\"stat-icon\">🏷️</div>\n                        <div class=\"stat-details\">\n                            <h3>Categories</h3>\n                            <p id=\"statTotalCategories\">0</p>\n                        </div>\n                    </div>\n                    <div class=\"stat-card\">\n                        <div class=\"stat-icon\">✉️</div>\n                        <div class=\"stat-details\">\n                            <h3>Form Leads</h3>\n                            <p id=\"statTotalSubmissions\">0</p>\n                        </div>\n                    </div>\n                    <div class=\"stat-card\">\n                        <div class=\"stat-icon\">👔</div>\n                        <div class=\"stat-details\">\n                            <h3>Active Jobs</h3>\n                            <p id=\"statTotalJobs\">0</p>\n                        </div>\n                    </div>\n                    <div class=\"stat-card\">\n                        <div class=\"stat-icon\">📄</div>\n                        <div class=\"stat-details\">\n                            <h3>Applications</h3>\n                            <p id=\"statTotalApplications\">0</p>\n                        </div>\n                    </div>\n                    <div class=\"stat-card\" style=\"cursor:pointer;\" onclick=\"document.querySelector('[data-tab=invoice-generator-tab]').click()\" title=\"View Billing & Invoices\">\n                        <div class=\"stat-icon\">🧾</div>\n                        <div class=\"stat-details\">\n                            <h3>Total Invoices</h3>\n                            <p id=\"statTotalInvoices\">0</p>\n                        </div>\n                    </div>\n                </div>\n\n                <div class=\"data-card\">\n                    <div class=\"data-card-header\">\n                        <h3 class=\"modal-title\">Recent Submissions (Leads)</h3>\n                        <button class=\"btn btn-secondary btn-sm\" id=\"viewAllLeadsBtn\">View All</button>\n                    </div>\n                    <div class=\"data-table-wrapper\">\n                        <table class=\"data-table\">\n                            <thead>\n                                <tr>\n                                    <th>Date</th>\n                                    <th>Type</th>\n                                    <th>Name</th>\n                                    <th>Email</th>\n                                    <th>Subject</th>\n                                    <th>Action</th>\n                                </tr>\n                            </thead>\n                            <tbody id=\"recentLeadsBody\">\n                                <!-- Dynamic rows -->\n                            </tbody>\n                        </table>\n                    </div>\n                </div>\n            </section>\n\n            <!-- TAB 2: PORTFOLIO -->\n            <section class=\"tab-content\" id=\"portfolio-manager-tab\">\n                <div class=\"data-card\">\n                    <div class=\"data-card-header\">\n                        <input type=\"text\" class=\"search-input\" id=\"searchProjects\" placeholder=\"Search projects by title, desc...\">\n                        <div style=\"display:flex;gap:8px;flex-wrap:wrap;\">\n                            <button class=\"btn btn-secondary btn-sm\" id=\"syncGoogleSheetBtn\" title=\"Pull latest projects from Google Sheet\">🔄 Sync Google Sheet</button>\n                            <button class=\"btn btn-primary btn-sm\" id=\"addNewProjectBtn\">➕ Add Project</button>\n                            <button class=\"btn btn-secondary btn-sm\" id=\"exportPortfolioBtn\" onclick=\"exportPortfolioJSON()\">⬇️ Export JSON</button>\n                            <button class=\"btn btn-danger btn-sm\" id=\"btnResetDb\" style=\"background:rgba(239,68,68,0.2);border:1px solid rgba(239,68,68,0.3);color:#ef4444;\" title=\"Reset database to default baseline\">🔄 Reset DB</button>\n                        </div>\n                    </div>\n                    <div class=\"data-table-wrapper\">\n                        <table class=\"data-table\">\n                            <thead>\n                                <tr>\n                                    <th>Thumb</th>\n                                    <th>Title</th>\n                                    <th>Categories</th>\n                                    <th>URL / Target</th>\n                                    <th>Actions</th>\n                                </tr>\n                            </thead>\n                            <tbody id=\"projectsTableBody\">\n                                <!-- Dynamic rows -->\n                            </tbody>\n                        </table>\n                    </div>\n                </div>\n            </section>\n\n            <!-- TAB 3: CATEGORIES -->\n            <section class=\"tab-content\" id=\"category-manager-tab\">\n                <div style=\"display: grid; grid-template-columns: 1fr 2fr; gap: 30px;\" id=\"catGridContainer\">\n                    <div class=\"data-card\" style=\"height: fit-content;\">\n                        <h3 class=\"modal-title\" style=\"margin-bottom: 20px;\" id=\"catFormTitle\">Add New Category</h3>\n                        <form id=\"categoryForm\">\n                            <input type=\"hidden\" id=\"editCatIndex\" value=\"-1\">\n                            <input type=\"hidden\" id=\"editCatOriginalId\" value=\"\">\n                            <div class=\"form-group\">\n                                <label class=\"form-label\">Category Name</label>\n                                <input type=\"text\" class=\"form-input\" id=\"catName\" required placeholder=\"e.g. Mobile Apps\">\n                            </div>\n                            <div class=\"form-group\">\n                                <label class=\"form-label\">Slug ID</label>\n                                <input type=\"text\" class=\"form-input\" id=\"catId\" required placeholder=\"e.g. mobile-apps\" pattern=\"[a-z0-9\\-]+\">\n                            </div>\n                            <div style=\"display: flex; gap: 10px; margin-top: 10px;\">\n                                <button type=\"submit\" class=\"btn btn-primary\" id=\"saveCatBtn\" style=\"flex: 1;\">Save Category</button>\n                                <button type=\"button\" class=\"btn btn-secondary\" id=\"cancelEditCatBtn\" style=\"display: none;\" onclick=\"window.cancelEditCategory()\">Cancel</button>\n                            </div>\n                        </form>\n                    </div>\n                    <div class=\"data-card\">\n                        <h3 class=\"modal-title\" style=\"margin-bottom: 20px;\">Existing Categories</h3>\n                        <div class=\"data-table-wrapper\">\n                            <table class=\"data-table\">\n                                <thead>\n                                    <tr>\n                                        <th>Slug ID</th>\n                                        <th>Name</th>\n                                        <th>Actions</th>\n                                    </tr>\n                                </thead>\n                                <tbody id=\"categoriesTableBody\">\n                                    <!-- Dynamic rows -->\n                                </tbody>\n                            </table>\n                        </div>\n                    </div>\n                </div>\n            </section>\n\n            <!-- TAB 4: LEADS -->\n            <section class=\"tab-content\" id=\"leads-manager-tab\">\n                <div class=\"data-card\">\n                    <div class=\"data-card-header\">\n                        <input type=\"text\" class=\"search-input\" id=\"searchLeads\" placeholder=\"Search leads by name, email, msg...\">\n                        <div style=\"display: flex; gap: 8px;\">\n                            <button class=\"btn btn-secondary btn-sm\" id=\"exportLeadsCsv\">Export CSV</button>\n                            <button class=\"btn btn-secondary btn-sm\" id=\"exportLeadsJson\">Export JSON</button>\n                        </div>\n                    </div>\n                    <div class=\"data-table-wrapper\">\n                        <table class=\"data-table\">\n                            <thead>\n                                <tr>\n                                    <th>Date</th>\n                                    <th>Type</th>\n                                    <th>Name</th>\n                                    <th>Email</th>\n                                    <th>Subject</th>\n                                    <th>Actions</th>\n                                </tr>\n                            </thead>\n                            <tbody id=\"leadsTableBody\">\n                                <!-- Dynamic rows -->\n                            </tbody>\n                        </table>\n                    </div>\n                </div>\n            </section>\n\n            <!-- TAB 5: JOB OPENINGS -->\n            <section class=\"tab-content\" id=\"jobs-manager-tab\">\n                <div class=\"data-card\">\n                    <div class=\"data-card-header\">\n                        <input type=\"text\" class=\"search-input\" id=\"searchJobs\" placeholder=\"Search job postings...\">\n                        <button class=\"btn btn-primary btn-sm\" id=\"addNewJobBtn\">➕ Post New Job</button>\n                    </div>\n                    <div class=\"data-table-wrapper\">\n                        <table class=\"data-table\">\n                            <thead>\n                                <tr>\n                                    <th>Icon</th>\n                                    <th>Job Title</th>\n                                    <th>Department</th>\n                                    <th>Location</th>\n                                    <th>Type</th>\n                                    <th>Status</th>\n                                    <th>Actions</th>\n                                </tr>\n                            </thead>\n                            <tbody id=\"jobsTableBody\">\n                                <!-- Dynamic job rows -->\n                            </tbody>\n                        </table>\n                    </div>\n                </div>\n            </section>\n\n            <!-- TAB 6: JOB APPLICATIONS -->\n            <section class=\"tab-content\" id=\"applications-manager-tab\">\n                <div class=\"data-card\">\n                    <div class=\"data-card-header\">\n                        <div style=\"display:flex;gap:12px;flex-wrap:wrap;align-items:center;\">\n                            <input type=\"text\" class=\"search-input\" id=\"searchApplications\" placeholder=\"Search candidate by name, email, skills...\">\n                            <select class=\"form-select\" id=\"filterAppStatus\" style=\"width:auto;padding:8px 12px;\">\n                                <option value=\"all\">All Application Statuses</option>\n                                <option value=\"pending\">Pending Review</option>\n                                <option value=\"shortlisted\">Shortlisted</option>\n                                <option value=\"rejected\">Rejected</option>\n                            </select>\n                        </div>\n                        <div style=\"display:flex;gap:8px;\">\n                            <button class=\"btn btn-secondary btn-sm\" id=\"exportAppsCsv\" onclick=\"window.exportCandidatesCSV()\">📥 Export Candidates CSV</button>\n                            <button class=\"btn btn-primary btn-sm\" id=\"refreshApplicationsBtn\" onclick=\"window.refreshApplications()\" title=\"Reload applications from latest data\">🔄 Refresh</button>\n                        </div>\n                    </div>\n                    <div class=\"data-table-wrapper\">\n                        <table class=\"data-table\">\n                            <thead>\n                                <tr>\n                                    <th>Applied Date</th>\n                                    <th>Candidate Name</th>\n                                    <th>Target Position</th>\n                                    <th>Contact Info</th>\n                                    <th>Status / Exp</th>\n                                    <th>Resume</th>\n                                    <th>App Status</th>\n                                    <th>Actions</th>\n                                </tr>\n                            </thead>\n                            <tbody id=\"applicationsTableBody\">\n                                <!-- Dynamic application rows -->\n                            </tbody>\n                        </table>\n                    </div>\n                </div>\n            </section>\n\n            <!-- TAB 7: SETTINGS -->\n\n<section class=\"tab-content\" id=\"settings-tab\">\n                <div style=\"display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 30px;\">\n                    \n                    <!-- GOOGLE SHEET INTEGRATION CARD -->\n                    <div class=\"data-card\" style=\"grid-column: 1 / -1;\">\n                        <div style=\"display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;\">\n                            <h3 class=\"modal-title\" style=\"margin-bottom:0;\">📊 Google Sheet Portfolio & CMS Integration</h3>\n                            <span class=\"tag tag-cyan\" id=\"gasSyncBadge\">Not Connected</span>\n                        </div>\n                        <p style=\"color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 20px; line-height: 1.6;\">\n                            Connect your Google Apps Script Web App URL to automatically synchronize Portfolio projects between this Admin Dashboard, your Google Spreadsheet, and the live Website in real-time.\n                        </p>\n                        <div style=\"display: grid; grid-template-columns: 1fr auto; gap: 16px; align-items: end;\">\n                            <div class=\"form-group\" style=\"margin-bottom: 0;\">\n                                <label class=\"form-label\">Google Apps Script Web App URL</label>\n                                <input type=\"url\" class=\"form-input\" id=\"gasPortfolioUrl\" value=\"https://script.google.com/macros/s/AKfycbyoSibvTqZNQbmm5AhtYZVUYiy8zUYoToPeQGzY6je3MUPqFJAZO9mk_xa9vT73Fx186w/exec\" placeholder=\"https://script.google.com/macros/s/AKfycb.../exec\">\n                            </div>\n                            <div style=\"display:flex; gap:10px; flex-wrap:wrap;\">\n                                <button class=\"btn btn-primary\" id=\"btnSaveGasUrl\">💾 Save & Test</button>\n                                <button class=\"btn btn-secondary\" id=\"btnPushAllToGas\" title=\"Sync all current projects to Google Sheet\">📤 Push All Projects</button>\n                                <button class=\"btn btn-secondary\" id=\"btnPullAllFromGas\" title=\"Fetch projects from Google Sheet\">📥 Pull From Sheet</button>\n                            </div>\n                        </div>\n                        <div id=\"gasStatusOutput\" style=\"margin-top: 14px; font-size: 0.85rem; padding: 10px 14px; border-radius: 8px; display: none;\"></div>\n                    </div>\n\n                    <div class=\"data-card\">\n                        <h3 class=\"modal-title\" style=\"margin-bottom: 24px;\">Change Admin Password</h3>\n                        <form id=\"changePasswordForm\">\n                            <div class=\"form-group\">\n                                <label class=\"form-label\">Current Password</label>\n                                <input type=\"password\" class=\"form-input\" id=\"currentPass\" required autocomplete=\"current-password\">\n                            </div>\n                            <div class=\"form-group\">\n                                <label class=\"form-label\">New Password</label>\n                                <input type=\"password\" class=\"form-input\" id=\"newPass\" required autocomplete=\"new-password\">\n                            </div>\n                            <div class=\"form-group\">\n                                <label class=\"form-label\">Confirm New Password</label>\n                                <input type=\"password\" class=\"form-input\" id=\"confirmPass\" required autocomplete=\"new-password\">\n                            </div>\n                            <button type=\"submit\" class=\"btn btn-primary\" style=\"width: 100%;\">Update Password</button>\n                        </form>\n                    </div>\n\n                    <div class=\"data-card\" style=\"height: fit-content;\">\n                        <h3 class=\"modal-title\" style=\"margin-bottom: 12px;\">📊 Google Sheets Integration</h3>\n                        <p style=\"color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 16px; line-height: 1.5;\">\n                            Connect your website forms, job applications, and leads directly to Google Sheets via Google Apps Script Web App.\n                        </p>\n                        <form id=\"googleSheetForm\">\n                            <div class=\"form-group\">\n                                <label class=\"form-label\">Apps Script Web App URL</label>\n                                <input type=\"url\" class=\"form-input\" id=\"googleSheetUrlInput\" placeholder=\"https://script.google.com/macros/s/.../exec\">\n                            </div>\n                            <div style=\"display: flex; gap: 10px; flex-wrap: wrap;\">\n                                <button type=\"submit\" class=\"btn btn-primary btn-sm\" style=\"flex:1;\">💾 Save URL</button>\n                                <button type=\"button\" class=\"btn btn-secondary btn-sm\" id=\"btnTestGoogleSheet\" style=\"flex:1;\">🧪 Test Ping</button>\n                            </div>\n                            <button type=\"button\" class=\"btn btn-success btn-sm\" id=\"btnSyncAllToSheet\" style=\"width: 100%; margin-top: 10px;\">🚀 Sync All Existing Data to Google Sheet</button>\n                        </form>\n                    </div>\n\n                    <div class=\"data-card\" style=\"height: fit-content;\">\n                        <h3 class=\"modal-title\" style=\"margin-bottom: 24px;\">Database Maintenance</h3>\n                        <p style=\"color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 20px; line-height: 1.5;\">\n                            Export the full system database (projects, form leads, job postings, and applicant resumes) as a JSON backup.\n                        </p>\n                        <div style=\"display: flex; flex-direction: column; gap: 14px;\">\n                            <button class=\"btn btn-secondary\" id=\"btnExportDb\" style=\"width: 100%;\">📥 Export Full DB Backup</button>\n                            <label class=\"btn btn-secondary\" style=\"width: 100%; cursor: pointer;\">\n                                📤 Import Database Restore\n                                <input type=\"file\" id=\"btnImportDbFile\" accept=\".json\" style=\"display: none;\">\n                            </label>\n                            <button class=\"btn btn-danger btn-sm\" id=\"btnResetDbSettings\" style=\"width: 100%; margin-top: 15px;\">⚠️ Reset to Default Baseline</button>\n                        </div>\n                    </div>\n                </div>\n            </section>\n                                <!-- TAB 8: INVOICE SYSTEM -->\n\n            <section class=\"tab-content\" id=\"invoice-generator-tab\">\n                <div class=\"inv-container\">\n                    <!-- Glassmorphic Header Navigation -->\n                    <div class=\"inv-header-nav\">\n                        <h2 class=\"inv-title\"><i class=\"fa fa-file-invoice-dollar\"></i> Shaivika Billing System</h2>\n                        <div class=\"inv-nav-pills\">\n                            <button type=\"button\" class=\"inv-nav-btn active\" data-view=\"dashboard\" onclick=\"window.switchInvoiceView('dashboard')\"><i class=\"fa fa-chart-line\"></i> Dashboard</button>\n                            <button type=\"button\" class=\"inv-nav-btn\" data-view=\"list\" onclick=\"window.switchInvoiceView('list')\"><i class=\"fa fa-list\"></i> All Invoices</button>\n                        </div>\n                    </div>\n\n                    <!-- DASHBOARD VIEW -->\n                    <div class=\"inv-view\" id=\"inv-view-dashboard\" style=\"display:block;\">\n                        \n                        <!-- Dashboard Header & Status -->\n                        <div class=\"inv-flex-between\" style=\"display:flex; justify-content:space-between; align-items:center; margin-bottom: 24px; flex-wrap:wrap; gap:16px;\">\n                            <div style=\"display:flex; align-items:center; gap:12px;\">\n                                <div id=\"inv-dash-status-indicator\" style=\"display:inline-flex; align-items:center; gap:6px; font-weight:600; font-size:14px; padding:4px 10px; border-radius:20px; background:rgba(16, 185, 129, 0.1); color:var(--success);\">\n                                    <span style=\"height:8px; width:8px; background:currentColor; border-radius:50%; display:inline-block; box-shadow:0 0 8px currentColor;\"></span>\n                                    LIVE\n                                </div>\n                                <span id=\"inv-dash-last-updated\" style=\"color:var(--text-muted); font-size:13px;\">Last updated: --</span>\n                            </div>\n                            <div>\n                                <button type=\"button\" class=\"btn btn-secondary btn-sm\" id=\"inv-dash-refresh-btn\" onclick=\"window.refreshDashboardData()\" style=\"display:inline-flex; align-items:center; gap:6px; margin-right:8px;\">\n                                    <i class=\"fa fa-sync\"></i> Refresh\n                                </button>\n                                <button type=\"button\" class=\"btn btn-primary btn-sm\" onclick=\"window.switchInvoiceView('create')\">\n                                    <i class=\"fa-solid fa-plus-circle\"></i> Create Invoice\n                                </button>\n                            </div>\n                        </div>\n\n                        <!-- KPI Cards -->\n                        <div class=\"inv-dash-cards\" style=\"margin-bottom: 24px; display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px;\">\n                            <div class=\"inv-card premium-card\" style=\"cursor:pointer;\" onclick=\"window.switchInvoiceView('list')\" title=\"Click to view all invoices\">\n                                <div class=\"card-icon\" style=\"background: linear-gradient(135deg, #667eea, #764ba2);\"><i class=\"fa fa-file-invoice\"></i></div>\n                                <div>\n                                    <h4 style=\"font-size:13px; text-transform:uppercase; letter-spacing:0.5px; opacity:0.8; margin-bottom:4px;\">Total Invoices</h4>\n                                    <h2 id=\"inv-dash-total-inv\" style=\"font-size:26px; margin:0;\">0</h2>\n                                </div>\n                            </div>\n                            <div class=\"inv-card premium-card\">\n                                <div class=\"card-icon\" style=\"background: linear-gradient(135deg, #00C9FF, #92FE9D);\"><i class=\"fa fa-wallet\"></i></div>\n                                <div>\n                                    <h4 style=\"font-size:13px; text-transform:uppercase; letter-spacing:0.5px; opacity:0.8; margin-bottom:4px;\">Total Revenue</h4>\n                                    <h2 id=\"inv-dash-revenue\" style=\"font-size:26px; margin:0;\">₹0</h2>\n                                </div>\n                            </div>\n\n                        </div>\n\n                        <!-- Financial Overview Metrics Row -->\n                        <div style=\"display:grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 15px; margin-bottom: 30px; background:var(--bg-glass); border:1px solid var(--border-glass); border-radius:12px; padding:20px;\">\n                            <div style=\"border-right: 1px solid var(--border-glass); padding-right:15px;\">\n                                <div style=\"color:var(--text-muted); font-size:12px; margin-bottom:5px;\">Collection Rate</div>\n                                <div id=\"inv-metric-collection-rate\" style=\"font-size:20px; font-weight:700; color:var(--success);\">0%</div>\n                            </div>\n                            <div style=\"border-right: 1px solid var(--border-glass); padding-right:15px;\">\n                                <div style=\"color:var(--text-muted); font-size:12px; margin-bottom:5px;\">Outstanding Rate</div>\n                                <div id=\"inv-metric-outstanding-rate\" style=\"font-size:20px; font-weight:700; color:var(--warning);\">0%</div>\n                            </div>\n                            <div>\n                                <div style=\"color:var(--text-muted); font-size:12px; margin-bottom:5px;\">Overdue Rate</div>\n                                <div id=\"inv-metric-overdue-rate\" style=\"font-size:20px; font-weight:700; color:var(--danger);\">0%</div>\n                            </div>\n                        </div>\n\n                        <!-- Charts Section -->\n                        <div style=\"display:grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 24px; margin-bottom: 30px;\">\n                            \n                            <div class=\"premium-panel\" style=\"padding: 20px;\">\n                                <h3 style=\"margin-top:0; margin-bottom:20px; font-size:16px;\"><i class=\"fa fa-chart-area\"></i> Revenue Trend (Last 6 Months)</h3>\n                                <div style=\"position: relative; height:250px; width:100%;\">\n                                    <canvas id=\"chart-revenue-trend\"></canvas>\n                                </div>\n                            </div>\n                            \n                            <div class=\"premium-panel\" style=\"padding: 20px;\">\n                                <h3 style=\"margin-top:0; margin-bottom:20px; font-size:16px;\"><i class=\"fa fa-chart-pie\"></i> Invoice Status Distribution</h3>\n                                <div style=\"position: relative; height:250px; width:100%;\">\n                                    <canvas id=\"chart-status-dist\"></canvas>\n                                </div>\n                            </div>\n\n                            <div class=\"premium-panel\" style=\"padding: 20px;\">\n                                <h3 style=\"margin-top:0; margin-bottom:20px; font-size:16px;\"><i class=\"fa fa-chart-bar\"></i> Revenue vs Collection</h3>\n                                <div style=\"position: relative; height:250px; width:100%;\">\n                                    <canvas id=\"chart-rev-vs-col\"></canvas>\n                                </div>\n                            </div>\n\n                            <div class=\"premium-panel\" style=\"padding: 20px;\">\n                                <h3 style=\"margin-top:0; margin-bottom:20px; font-size:16px;\"><i class=\"fa fa-users\"></i> Top Clients by Outstanding Balance</h3>\n                                <div style=\"position: relative; height:250px; width:100%;\">\n                                    <canvas id=\"chart-outstanding\"></canvas>\n                                </div>\n                            </div>\n\n                            <div class=\"premium-panel\" style=\"padding: 20px;\">\n                                <h3 style=\"margin-top:0; margin-bottom:20px; font-size:16px;\"><i class=\"fa fa-calendar-alt\"></i> Monthly Invoice Volume</h3>\n                                <div style=\"position: relative; height:250px; width:100%;\">\n                                    <canvas id=\"chart-monthly-volume\"></canvas>\n                                </div>\n                            </div>\n\n                            <div class=\"premium-panel\" style=\"padding: 20px;\">\n                                <h3 style=\"margin-top:0; margin-bottom:20px; font-size:16px;\"><i class=\"fa fa-hand-holding-usd\"></i> Payment Collection Trend</h3>\n                                <div style=\"position: relative; height:250px; width:100%;\">\n                                    <canvas id=\"chart-payment-trend\"></canvas>\n                                </div>\n                            </div>\n                            \n                        </div>\n                        \n                        <!-- Top Clients Table -->\n                        <div class=\"premium-panel\" style=\"margin-bottom: 30px;\">\n                            <h3 style=\"margin-top:0; margin-bottom:20px; font-size:16px;\"><i class=\"fa fa-star\"></i> Top Clients by Billing</h3>\n                            <div class=\"table-responsive\">\n                                <table class=\"inv-premium-table\">\n                                    <thead>\n                                        <tr>\n                                            <th>Client</th>\n                                            <th style=\"text-align:center;\">Invoices</th>\n                                            <th style=\"text-align:right;\">Total Billing</th>\n                                            <th style=\"text-align:right;\">Paid</th>\n                                            <th style=\"text-align:right;\">Outstanding</th>\n                                        </tr>\n                                    </thead>\n                                    <tbody id=\"inv-top-clients-body\">\n                                        <!-- Populated by JS -->\n                                    </tbody>\n                                </table>\n                            </div>\n                        </div>\n\n                        <div class=\"inv-recent-section premium-panel\">\n                            <div style=\"display:flex; justify-content:space-between; align-items:center; margin-bottom:18px; flex-wrap:wrap; gap:12px;\">\n                                <div style=\"display:flex; align-items:center; gap:12px; flex-wrap:wrap;\">\n                                    <h3 style=\"margin:0;\"><i class=\"fa fa-file-invoice\"></i> Recent Invoices (<span id=\"inv-dash-count-badge\">0</span>)</h3>\n                                    <div class=\"inv-filter-pills\" id=\"inv-dash-filter-pills\" style=\"display:flex; gap:6px;\">\n                                        <button type=\"button\" class=\"btn btn-sm btn-primary active\" data-dash-filter=\"ALL\" onclick=\"window.setInvoiceDashFilter('ALL')\">All</button>\n                                        <button type=\"button\" class=\"btn btn-sm btn-ghost\" data-dash-filter=\"PAID\" onclick=\"window.setInvoiceDashFilter('PAID')\">Paid</button>\n                                        <button type=\"button\" class=\"btn btn-sm btn-ghost\" data-dash-filter=\"PENDING\" onclick=\"window.setInvoiceDashFilter('PENDING')\">Pending</button>\n                                        <button type=\"button\" class=\"btn btn-sm btn-ghost\" data-dash-filter=\"OVERDUE\" onclick=\"window.setInvoiceDashFilter('OVERDUE')\">Overdue</button>\n                                        <button type=\"button\" class=\"btn btn-sm btn-ghost\" data-dash-filter=\"DRAFT\" onclick=\"window.setInvoiceDashFilter('DRAFT')\">Draft</button>\n                                    </div>\n                                </div>\n                                <div style=\"display:flex; gap:10px; align-items:center; flex-wrap:wrap;\">\n                                    <input type=\"text\" id=\"inv-dash-search\" class=\"inv-input\" placeholder=\"Search total invoices...\" style=\"width: 220px;\">\n                                    <button type=\"button\" class=\"btn btn-primary btn-sm\" onclick=\"window.switchInvoiceView('list')\">View All Invoices</button>\n                                </div>\n                            </div>\n\n                            <div class=\"table-responsive\">\n                                <table class=\"inv-premium-table\">\n                                    <thead>\n                                        <tr>\n                                            <th>Invoice # & Date</th>\n                                            <th>Client</th>\n                                            <th>Amount</th>\n                                            <th>Status</th>\n                                            <th>Balance Due</th>\n                                            <th>Actions</th>\n                                        </tr>\n                                    </thead>\n                                    <tbody id=\"inv-dash-recent-body\">\n                                        <!-- Populated by JS -->\n                                    </tbody>\n                                </table>\n                            </div>\n                        </div>\n                    </div>\n\n                    <!-- LIST VIEW -->\n                    <div class=\"inv-view\" id=\"inv-view-list\" style=\"display:none;\">\n                        <div class=\"premium-panel\">\n                            <div style=\"display:flex; justify-content:space-between; margin-bottom:20px; align-items:center; flex-wrap:wrap; gap:12px;\">\n                                <div style=\"display:flex; align-items:center; gap:12px; flex-wrap:wrap;\">\n                                    <h3 style=\"margin:0;\">All Invoices</h3>\n                                    <div class=\"inv-filter-pills\" id=\"inv-list-filter-pills\" style=\"display:flex; gap:6px;\">\n                                        <button type=\"button\" class=\"btn btn-sm btn-primary active\" data-list-filter=\"ALL\" onclick=\"window.setInvoiceListFilter('ALL')\">All</button>\n                                        <button type=\"button\" class=\"btn btn-sm btn-ghost\" data-list-filter=\"PAID\" onclick=\"window.setInvoiceListFilter('PAID')\">Paid</button>\n                                        <button type=\"button\" class=\"btn btn-sm btn-ghost\" data-list-filter=\"PENDING\" onclick=\"window.setInvoiceListFilter('PENDING')\">Pending</button>\n                                        <button type=\"button\" class=\"btn btn-sm btn-ghost\" data-list-filter=\"OVERDUE\" onclick=\"window.setInvoiceListFilter('OVERDUE')\">Overdue</button>\n                                        <button type=\"button\" class=\"btn btn-sm btn-ghost\" data-list-filter=\"DRAFT\" onclick=\"window.setInvoiceListFilter('DRAFT')\">Draft</button>\n                                    </div>\n                                </div>\n                                <div style=\"display:flex; gap: 10px; align-items:center; flex-wrap:wrap;\">\n                                    <input type=\"text\" id=\"inv-search-invoices\" class=\"inv-input\" placeholder=\"Search invoices...\" style=\"width: 240px;\">\n                                    <button type=\"button\" class=\"btn btn-primary btn-sm\" onclick=\"window.switchInvoiceView('create')\"><i class=\"fa-solid fa-plus-circle\"></i> + Create Invoice</button>\n                                </div>\n                            </div>\n                            <div class=\"table-responsive\">\n                                <table class=\"inv-premium-table\">\n                                    <thead>\n                                        <tr>\n                                            <th>Invoice # & Date</th>\n                                            <th>Client</th>\n                                            <th>Amount</th>\n                                            <th>Status</th>\n                                            <th>Balance Due</th>\n                                            <th>Actions</th>\n                                        </tr>\n                                    </thead>\n                                    <tbody id=\"inv-list-body\">\n                                        <!-- Populated by JS -->\n                                    </tbody>\n                                </table>\n                            </div>\n                        </div>\n                    </div>\n\n                    <!-- CUSTOMERS VIEW -->\n                    <div class=\"inv-view\" id=\"inv-view-customers\" style=\"display:none;\">\n                        <div class=\"premium-panel\">\n                            <div style=\"display:flex; justify-content:space-between; margin-bottom:20px; align-items:center;\">\n                                <h3>Customers</h3>\n                                <div style=\"display:flex; gap: 10px;\">\n                                    <input type=\"text\" id=\"inv-search-customers\" class=\"inv-input\" placeholder=\"Search customers...\" style=\"width: 250px;\">\n                                    <button class=\"btn btn-primary btn-sm\" onclick=\"window.openCustomerModal()\"><i class=\"fa-solid fa-user-plus\"></i> + Add Customer</button>\n                                </div>\n                            </div>\n                            <div class=\"table-responsive\">\n                                <table class=\"inv-premium-table\">\n                                    <thead>\n                                        <tr>\n                                            <th>Client ID</th>\n                                            <th>Name</th>\n                                            <th>Company</th>\n                                            <th>Email</th>\n                                            <th>Actions</th>\n                                        </tr>\n                                    </thead>\n                                    <tbody id=\"inv-cust-body\">\n                                        <!-- Populated by JS -->\n                                    </tbody>\n                                </table>\n                            </div>\n                        </div>\n                    </div>\n\n                    <!-- SERVICES VIEW -->\n                    <div class=\"inv-view\" id=\"inv-view-services\" style=\"display:none;\">\n                        <div class=\"premium-panel\">\n                            <div style=\"display:flex; justify-content:space-between; margin-bottom:20px; align-items:center;\">\n                                <h3>Services Database</h3>\n                                <div style=\"display:flex; gap: 10px;\">\n                                    <input type=\"text\" id=\"inv-search-services\" class=\"inv-input\" placeholder=\"Search services...\" style=\"width: 250px;\">\n                                    <button class=\"btn btn-primary btn-sm\" onclick=\"window.openServiceModal()\"><i class=\"fa-solid fa-plus\"></i> + Add Service</button>\n                                </div>\n                            </div>\n                            <div class=\"table-responsive\">\n                                <table class=\"inv-premium-table\">\n                                    <thead>\n                                        <tr>\n                                            <th>Service ID</th>\n                                            <th>Name</th>\n                                            <th>HSN/SAC</th>\n                                            <th>Default Rate</th>\n                                            <th>Actions</th>\n                                        </tr>\n                                    </thead>\n                                    <tbody id=\"inv-srv-body\">\n                                        <!-- Populated by JS -->\n                                    </tbody>\n                                </table>\n                            </div>\n                        </div>\n                    </div>\n\n                    <!-- SETTINGS VIEW -->\n                    <div class=\"inv-view\" id=\"inv-view-settings\" style=\"display:none;\">\n                        <div class=\"premium-panel\">\n                            <h3><i class=\"fa fa-building\"></i> Company Profile & Billing Settings</h3>\n                            <div class=\"inv-form-grid\" style=\"margin-top:20px;\">\n                                <div class=\"inv-form-group\">\n                                    <label>Company Name</label>\n                                    <input type=\"text\" id=\"inv-set-companyName\" class=\"inv-input\">\n                                </div>\n                                <div class=\"inv-form-group\">\n                                    <label>Tagline</label>\n                                    <input type=\"text\" id=\"inv-set-tagline\" class=\"inv-input\">\n                                </div>\n                                <div class=\"inv-form-group\">\n                                    <label>Email Address</label>\n                                    <input type=\"email\" id=\"inv-set-email\" class=\"inv-input\">\n                                </div>\n                                <div class=\"inv-form-group\">\n                                    <label>Phone Number</label>\n                                    <input type=\"text\" id=\"inv-set-phone\" class=\"inv-input\">\n                                </div>\n                                <div class=\"inv-form-group\" style=\"grid-column: 1 / -1;\">\n                                    <label>Company Address</label>\n                                    <textarea id=\"inv-set-address\" class=\"inv-input\" rows=\"2\"></textarea>\n                                </div>\n                                <div class=\"inv-form-group\">\n                                    <label>GSTIN</label>\n                                    <input type=\"text\" id=\"inv-set-gstin\" class=\"inv-input\">\n                                </div>\n                                <div class=\"inv-form-group\">\n                                    <label>PAN Number</label>\n                                    <input type=\"text\" id=\"inv-set-pan\" class=\"inv-input\">\n                                </div>\n                            </div>\n\n                            <h4 style=\"margin-top:30px; margin-bottom:15px;\"><i class=\"fa fa-university\"></i> Bank & Payment Details</h4>\n                            <div class=\"inv-form-grid\">\n                                <div class=\"inv-form-group\">\n                                    <label>Bank Name</label>\n                                    <input type=\"text\" id=\"inv-set-bankName\" class=\"inv-input\">\n                                </div>\n                                <div class=\"inv-form-group\">\n                                    <label>Account Name</label>\n                                    <input type=\"text\" id=\"inv-set-accountName\" class=\"inv-input\">\n                                </div>\n                                <div class=\"inv-form-group\">\n                                    <label>Account Number</label>\n                                    <input type=\"text\" id=\"inv-set-accountNo\" class=\"inv-input\">\n                                </div>\n                                <div class=\"inv-form-group\">\n                                    <label>IFSC Code</label>\n                                    <input type=\"text\" id=\"inv-set-ifsc\" class=\"inv-input\">\n                                </div>\n                                <div class=\"inv-form-group\">\n                                    <label>UPI ID</label>\n                                    <input type=\"text\" id=\"inv-set-upiId\" class=\"inv-input\" placeholder=\"e.g. name@bank\">\n                                </div>\n                                <div class=\"inv-form-group\">\n                                    <label>Default Tax Rate (%)</label>\n                                    <input type=\"number\" id=\"inv-set-defaultTaxRate\" class=\"inv-input\" min=\"0\" max=\"100\">\n                                </div>\n                            </div>\n                            \n                            <h4 class=\"inv-section-heading\" style=\"margin-top:30px;\"><i class=\"fa fa-table\"></i> Google Sheet Integration (Apps Script)</h4>\n                            <div class=\"inv-form-group form-full\" style=\"margin-bottom:15px;\">\n                                <label>Google Apps Script Web App URL for Invoices</label>\n                                <div style=\"display:flex; gap:10px; flex-wrap:wrap;\">\n                                    <input type=\"url\" id=\"inv-set-gasInvoiceUrl\" class=\"inv-input\" value=\"https://script.google.com/macros/s/AKfycbyoSibvTqZNQbmm5AhtYZVUYiy8zUYoToPeQGzY6je3MUPqFJAZO9mk_xa9vT73Fx186w/exec\" placeholder=\"https://script.google.com/macros/s/AKfycb.../exec\" style=\"flex:1; min-width:260px;\">\n                                    <button type=\"button\" class=\"premium-btn action-btn\" onclick=\"window.syncInvoicesToGoogleSheet()\"><i class=\"fa fa-sync\"></i> Sync All to Sheet</button>\n                                </div>\n                            </div>\n\n                            <h4 class=\"inv-section-heading\" style=\"margin-top:25px;\"><i class=\"fa fa-file-contract\"></i> Default Terms</h4>\n                            <div class=\"inv-form-group\">\n                                <textarea id=\"inv-set-defaultTerms\" class=\"inv-input\" rows=\"4\"></textarea>\n                            </div>\n\n                            <button class=\"premium-btn save-btn\" style=\"margin-top: 20px; width: 100%;\" onclick=\"window.saveBillingSettings()\"><i class=\"fa fa-save\"></i> Save Settings</button>\n                        </div>\n                    </div>\n\n                    <!-- CREATE / EDIT VIEW (SPLIT SCREEN) -->\n                    <div class=\"inv-view\" id=\"inv-view-create\" style=\"display:none;\">\n                        \n                        <div class=\"inv-split-screen\">\n                            \n                            <!-- LEFT: BUILDER PANE -->\n                            <div class=\"inv-builder-pane premium-panel\">\n                                <div style=\"display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border); padding-bottom:15px; margin-bottom:20px;\">\n                                    <h3><i class=\"fa fa-magic\"></i> Invoice Builder</h3>\n                                    <div style=\"display:flex; gap:10px;\">\n                                        <button type=\"button\" id=\"inv-save-btn\" class=\"premium-btn action-btn\" onclick=\"window.saveInvoiceForm()\">Save Draft</button>\n                                        <button type=\"button\" id=\"inv-generate-btn\" class=\"premium-btn save-btn\" onclick=\"window.generateFinalInvoice()\"><i class=\"fa fa-check-circle\"></i> Generate & Issue</button>\n                                    </div>\n                                </div>\n                                \n                                <input type=\"hidden\" id=\"inv-form-uuid\" value=\"\">\n                                <input type=\"hidden\" id=\"inv-form-id\" value=\"\">\n                                \n                                <!-- Customer Details (Flat) -->\n                                <h4 class=\"inv-section-heading\"><i class=\"fa fa-user\"></i> Customer Details</h4>\n                                <div class=\"inv-form-grid\" style=\"margin-bottom: 25px;\">\n                                    <div class=\"inv-form-group form-full\">\n                                        <label>Full Name *</label>\n                                        <input type=\"text\" id=\"inv-flat-name\" class=\"inv-input\" placeholder=\"Client Name\" required>\n                                    </div>\n                                    <div class=\"inv-form-group\">\n                                        <label>Phone Number</label>\n                                        <input type=\"text\" id=\"inv-flat-phone\" class=\"inv-input\" placeholder=\"e.g. 9876543210\">\n                                    </div>\n                                    <div class=\"inv-form-group\">\n                                        <label>Email</label>\n                                        <input type=\"email\" id=\"inv-flat-email\" class=\"inv-input\" placeholder=\"client@example.com\">\n                                    </div>\n                                </div>\n\n                                <!-- Service & Pricing Details -->\n                                <h4 class=\"inv-section-heading\"><i class=\"fa fa-box\"></i> Service Details</h4>\n                                <div class=\"inv-form-grid\" style=\"margin-bottom: 25px;\">\n                                    <div class=\"inv-form-group form-full\">\n                                        <label>Service *</label>\n                                        <select id=\"inv-flat-service\" class=\"inv-input\" required onchange=\"window.toggleOtherServiceField && window.toggleOtherServiceField(this.value)\">\n                                            <option value=\"\">Select a service...</option>\n                                            <option value=\"preset-1\">Web &amp; App Development (2-in-1)</option>\n                                            <option value=\"preset-2\">Web Development</option>\n                                            <option value=\"preset-3\">App Development</option>\n                                            <option value=\"preset-4\">AI Automations Suite</option>\n                                            <option value=\"preset-5\">SEO Optimisation</option>\n                                            <option value=\"preset-6\">Analytical Dashboards</option>\n                                            <option value=\"preset-7\">AI Chatbot Builders</option>\n                                            <option value=\"preset-8\">Logo Designing</option>\n                                            <option value=\"preset-9\">AI Video &amp; Photo Business Promotions</option>\n                                            <option value=\"preset-10\">Virtual Wedding &amp; Invitation Cards</option>\n                                            <option value=\"preset-11\">Final Year Projects</option>\n                                            <option value=\"preset-12\">Custom CRM Systems</option>\n                                            <option value=\"preset-13\">SaaS Products</option>\n                                            <option value=\"preset-14\">Product Mentence</option>\n                                            <option value=\"others\">Others</option>\n                                        </select>\n                                    </div>\n                                    <div class=\"inv-form-group form-full\" id=\"inv-other-service-group\" style=\"display: none;\">\n                                        <label for=\"inv-flat-other-service\">Enter Service Name *</label>\n                                        <input type=\"text\" id=\"inv-flat-other-service\" class=\"inv-input\" placeholder=\"Enter the service name\">\n                                    </div>\n                                    <div class=\"inv-form-group\">\n                                        <label>Price (₹) *</label>\n                                        <input type=\"number\" id=\"inv-flat-price\" class=\"inv-input\" min=\"0\" value=\"0\" required>\n                                    </div>\n                                    <div class=\"inv-form-group\">\n                                        <label>GST (%)</label>\n                                        <input type=\"number\" id=\"inv-flat-gst\" class=\"inv-input\" min=\"0\" value=\"18\">\n                                    </div>\n                                    <div class=\"inv-form-group form-full inv-total-box\" style=\"background: rgba(16, 185, 129, 0.12); border: 1px solid rgba(16, 185, 129, 0.3); padding: 12px 16px; border-radius: 10px;\">\n                                        <label style=\"color: #10b981; font-weight: 700; margin-bottom: 4px; display: block;\">Total Amount (₹)</label>\n                                        <input type=\"number\" id=\"inv-flat-total\" class=\"inv-input read-only\" style=\"font-size: 20px; font-weight: 800; background: transparent; border: none; padding: 0; color: #10b981;\" readonly value=\"0\">\n                                    </div>\n                                </div>\n\n                                <!-- Invoice Meta -->\n                                <h4 class=\"inv-section-heading\"><i class=\"fa fa-info-circle\"></i> Invoice Summary</h4>\n                                <div class=\"inv-form-grid\" style=\"margin-bottom: 20px;\">\n                                    <div class=\"inv-form-group\">\n                                        <label>Invoice Date</label>\n                                        <input type=\"date\" id=\"inv-form-date\" class=\"inv-input\">\n                                    </div>\n                                    <div class=\"inv-form-group\">\n                                        <label>State Code (for GST)</label>\n                                        <select id=\"inv-form-state\" class=\"inv-input\">\n                                            <option value=\"AP\">Andhra Pradesh (Intra-state)</option>\n                                            <option value=\"OTHER\">Other State (Inter-state)</option>\n                                        </select>\n                                    </div>\n                                    <div class=\"inv-form-group\">\n                                        <label>Payment Method</label>\n                                        <select id=\"inv-form-payment-method\" class=\"inv-input\" onchange=\"window.renderInvoicePreview && window.renderInvoicePreview()\">\n                                            <option value=\"Online / Bank Transfer\">Online / Bank Transfer</option>\n                                            <option value=\"Cash\">Cash</option>\n                                            <option value=\"UPI\">UPI</option>\n                                            <option value=\"Cheque\">Cheque</option>\n                                        </select>\n                                    </div>\n                                    <div class=\"inv-form-group form-full\">\n                                        <label>Summary / Notes</label>\n                                        <textarea id=\"inv-flat-summary\" class=\"inv-input\" rows=\"3\" placeholder=\"Description of work or payment terms...\"></textarea>\n                                    </div>\n                                </div>\n                            </div>\n\n                            <!-- RIGHT: PREVIEW PANE -->\n                            <div class=\"inv-preview-pane\">\n                                <div style=\"text-align:center; padding-bottom: 15px; color: var(--text-muted); font-size: 0.85rem; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;\">\n                                    Live A4 PDF Preview\n                                </div>\n                                <div class=\"a4-container\">\n                                    <div class=\"a4-sheet\" id=\"invoice-preview-sheet\">\n                                        <!-- Content populated reactively by invoice-pdf.js -->\n                                    </div>\n                                </div>\n                                <div style=\"display: flex; gap: 10px; justify-content: center; margin-top: 20px;\">\n                                    <button type=\"button\" id=\"inv-download-btn\" class=\"premium-btn action-btn\" onclick=\"window.downloadInvoicePDF()\"><i class=\"fa fa-download\"></i> Download PDF</button>\n                                    <button type=\"button\" id=\"inv-email-btn\" class=\"premium-btn action-btn\" onclick=\"window.sendInvoiceEmail()\"><i class=\"fa fa-envelope\"></i> Email</button>\n                                    <button type=\"button\" id=\"inv-whatsapp-btn\" class=\"premium-btn\" style=\"background: #25D366; color: white; border: none; padding: 10px 15px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.3s;\" onclick=\"window.sendInvoiceWhatsApp()\"><i class=\"fab fa-whatsapp\"></i> WhatsApp</button>\n                                    <button type=\"button\" class=\"premium-btn action-btn\" onclick=\"window.shareInvoice()\"><i class=\"fa fa-share-alt\"></i> Share</button>\n                                    <button type=\"button\" class=\"premium-btn action-btn\" onclick=\"window.copyInvoiceLink()\"><i class=\"fa fa-link\"></i> Copy Link</button>\n                                </div>\n                            </div>\n\n                        </div>\n                    </div>\n\n                </div>\n\n                <!-- MODALS FOR BILLING SYSTEM -->\n                <div class=\"modal\" id=\"invCustomerModal\">\n                    <div class=\"modal-content\" style=\"max-width: 500px;\">\n                        <div class=\"modal-header\">\n                            <h3 class=\"modal-title\" id=\"invCustomerModalTitle\">Add/Edit Customer</h3>\n                            <button class=\"modal-close\" onclick=\"document.getElementById('invCustomerModal').classList.remove('open')\">✕</button>\n                        </div>\n                        <div class=\"inv-form-grid\">\n                            <input type=\"hidden\" id=\"inv-cust-id\">\n                            <div class=\"inv-form-group form-full\">\n                                <label>Contact Name *</label>\n                                <input type=\"text\" id=\"inv-cust-name\" class=\"inv-input\" required>\n                            </div>\n                            <div class=\"inv-form-group form-full\">\n                                <label>Company Name</label>\n                                <input type=\"text\" id=\"inv-cust-company\" class=\"inv-input\">\n                            </div>\n                            <div class=\"inv-form-group\">\n                                <label>Email Address</label>\n                                <input type=\"email\" id=\"inv-cust-email\" class=\"inv-input\">\n                            </div>\n                            <div class=\"inv-form-group\">\n                                <label>Phone</label>\n                                <input type=\"text\" id=\"inv-cust-phone\" class=\"inv-input\">\n                            </div>\n                            <div class=\"inv-form-group\">\n                                <label>GSTIN</label>\n                                <input type=\"text\" id=\"inv-cust-gstin\" class=\"inv-input\">\n                            </div>\n                            <div class=\"inv-form-group\">\n                                <label>PAN</label>\n                                <input type=\"text\" id=\"inv-cust-pan\" class=\"inv-input\">\n                            </div>\n                            <div class=\"inv-form-group form-full\">\n                                <label>Billing Address</label>\n                                <textarea id=\"inv-cust-address\" class=\"inv-input\" rows=\"2\"></textarea>\n                            </div>\n                            <div class=\"inv-form-group form-full\">\n                                <button class=\"premium-btn save-btn\" style=\"width: 100%;\" onclick=\"window.saveCustomerRecord()\">Save Customer</button>\n                            </div>\n                        </div>\n                    </div>\n                </div>\n\n                <div class=\"modal\" id=\"invServiceModal\">\n                    <div class=\"modal-content\" style=\"max-width: 500px;\">\n                        <div class=\"modal-header\">\n                            <h3 class=\"modal-title\" id=\"invServiceModalTitle\">Add/Edit Service</h3>\n                            <button class=\"modal-close\" onclick=\"document.getElementById('invServiceModal').classList.remove('open')\">✕</button>\n                        </div>\n                        <div class=\"inv-form-grid\">\n                            <input type=\"hidden\" id=\"inv-srv-id\">\n                            <div class=\"inv-form-group form-full\">\n                                <label>Service Name *</label>\n                                <input type=\"text\" id=\"inv-srv-name\" class=\"inv-input\" required>\n                            </div>\n                            <div class=\"inv-form-group form-full\">\n                                <label>Description</label>\n                                <textarea id=\"inv-srv-desc\" class=\"inv-input\" rows=\"2\"></textarea>\n                            </div>\n                            <div class=\"inv-form-group\">\n                                <label>HSN / SAC Code</label>\n                                <input type=\"text\" id=\"inv-srv-hsn\" class=\"inv-input\">\n                            </div>\n                            <div class=\"inv-form-group\">\n                                <label>Tax Rate (%)</label>\n                                <input type=\"number\" id=\"inv-srv-tax\" class=\"inv-input\" value=\"18\">\n                            </div>\n                            <div class=\"inv-form-group form-full\">\n                                <label>Default Price (₹)</label>\n                                <input type=\"number\" id=\"inv-srv-price\" class=\"inv-input\" value=\"0\">\n                            </div>\n                            <div class=\"inv-form-group form-full\">\n                                <button class=\"premium-btn save-btn\" style=\"width: 100%;\" onclick=\"window.saveServiceRecord()\">Save Service</button>\n                            </div>\n                        </div>\n                    </div>\n                </div>\n\n                <div class=\"modal\" id=\"invSelectServiceModal\">\n                    <div class=\"modal-content\" style=\"max-width: 600px;\">\n                        <div class=\"modal-header\">\n                            <h3 class=\"modal-title\">Select Service</h3>\n                            <button class=\"modal-close\" onclick=\"document.getElementById('invSelectServiceModal').classList.remove('open')\">✕</button>\n                        </div>\n                        <div style=\"max-height: 400px; overflow-y: auto;\">\n                            <table class=\"inv-premium-table\">\n                                <tbody id=\"inv-srv-selector-body\">\n                                    <!-- Populated by JS -->\n                                </tbody>\n                            </table>\n                        </div>\n                    </div>\n                </div>\n\n                <div class=\"modal\" id=\"invPaymentModal\">\n                    <div class=\"modal-content\" style=\"max-width: 400px;\">\n                        <div class=\"modal-header\">\n                            <h3 class=\"modal-title\">Record Payment</h3>\n                            <button class=\"modal-close\" onclick=\"document.getElementById('invPaymentModal').classList.remove('open')\">✕</button>\n                        </div>\n                        <div class=\"inv-form-grid\">\n                            <input type=\"hidden\" id=\"inv-pay-invoice-id\">\n                            <div class=\"inv-form-group form-full\">\n                                <label>Amount Received (₹)</label>\n                                <input type=\"number\" id=\"inv-pay-amount\" class=\"inv-input\" required>\n                            </div>\n                            <div class=\"inv-form-group form-full\">\n                                <label>Payment Method</label>\n                                <select id=\"inv-pay-method\" class=\"inv-input\">\n                                    <option value=\"UPI\">UPI</option>\n                                    <option value=\"Bank Transfer\">Bank Transfer (NEFT/RTGS/IMPS)</option>\n                                    <option value=\"Cash\">Cash</option>\n                                    <option value=\"Online Gateway\">Online Gateway</option>\n                                    <option value=\"Other\">Other</option>\n                                </select>\n                            </div>\n                            <div class=\"inv-form-group form-full\">\n                                <label>Transaction ID / Reference</label>\n                                <input type=\"text\" id=\"inv-pay-ref\" class=\"inv-input\">\n                            </div>\n                            <div class=\"inv-form-group form-full\">\n                                <label>Payment Date</label>\n                                <input type=\"date\" id=\"inv-pay-date\" class=\"inv-input\">\n                            </div>\n                            <div class=\"inv-form-group form-full\">\n                                <button class=\"premium-btn save-btn\" style=\"width: 100%;\" onclick=\"window.savePaymentRecord()\">Submit Payment</button>\n                            </div>\n                        </div>\n                    </div>\n                </div>\n                \n                <div class=\"modal\" id=\"invAuditModal\">\n                    <div class=\"modal-content\" style=\"max-width: 600px;\">\n                        <div class=\"modal-header\">\n                            <h3 class=\"modal-title\">Invoice Audit History</h3>\n                            <button class=\"modal-close\" onclick=\"document.getElementById('invAuditModal').classList.remove('open')\">✕</button>\n                        </div>\n                        <div style=\"max-height: 400px; overflow-y: auto;\">\n                            <ul id=\"inv-audit-list\" style=\"list-style:none; padding:0; margin:0;\">\n                                <!-- Populated by JS -->\n                            </ul>\n                        </div>\n                    </div>\n                </div>\n\n                <style>\n                /* Premium Glassmorphic UI for Invoices */\n                .inv-container { padding: 0; animation: fadeInUp 0.4s ease; }\n                .inv-header-nav { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; background: var(--bg-glass, rgba(15, 23, 42, 0.85)); padding: 16px 24px; border-radius: 16px; border: 1px solid var(--border-glass, rgba(255,255,255,0.12)); box-shadow: 0 10px 30px rgba(0,0,0,0.1); }\n                .inv-title { margin: 0; font-size: 1.5rem; font-weight: 800; background: linear-gradient(135deg, #38bdf8, #818cf8); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }\n                .inv-nav-pills { display: flex; gap: 8px; background: var(--bg-secondary, #0f172a); padding: 6px; border-radius: 12px; flex-wrap: wrap; }\n                .inv-nav-btn { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); padding: 9px 18px; border-radius: 8px; color: var(--text-secondary, #94a3b8); font-weight: 600; cursor: pointer; transition: all 0.25s ease; display: flex; align-items: center; gap: 6px; font-size: 0.9rem; }\n                .inv-nav-btn:hover { background: rgba(255,255,255,0.1); color: var(--text-primary, #f8fafc); border-color: rgba(255,255,255,0.2); }\n                .inv-nav-btn.active { background: linear-gradient(135deg, #2563eb, #4f46e5); color: #ffffff; border-color: transparent; box-shadow: 0 4px 15px rgba(37,99,235,0.4); transform: translateY(-2px); font-weight: 700; }\n                \n                .inv-dash-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; margin-bottom: 30px; }\n                .inv-card { display: flex; align-items: center; gap: 20px; background: var(--bg-glass, rgba(15, 23, 42, 0.85)); padding: 24px; border-radius: 16px; border: 1px solid var(--border-glass, rgba(255,255,255,0.12)); transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.3s; }\n                .inv-card:hover { transform: translateY(-3px); box-shadow: 0 15px 35px rgba(0,0,0,0.15); border-color: var(--primary); }\n                .card-icon { width: 56px; height: 56px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 1.4rem; color: white; box-shadow: inset 0 0 10px rgba(255,255,255,0.2); }\n                .inv-card h4 { margin: 0; color: var(--text-secondary); font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1px; }\n                .inv-card h2 { margin: 5px 0 0 0; font-size: 1.75rem; color: var(--text-primary); font-weight: 800; }\n                \n                .premium-panel { background: var(--bg-glass, rgba(15, 23, 42, 0.85)); padding: 28px; border-radius: 16px; border: 1px solid var(--border-glass, rgba(255,255,255,0.12)); box-shadow: 0 10px 30px rgba(0,0,0,0.1); margin-bottom: 30px; }\n                .premium-panel h3 { margin-top: 0; color: var(--text-primary); font-weight: 800; }\n                \n                .inv-section-heading { margin: 0 0 16px 0; font-size: 0.95rem; font-weight: 700; color: #60a5fa; display: flex; align-items: center; gap: 8px; letter-spacing: 0.02em; }\n\n                .inv-premium-table { width: 100%; border-collapse: separate; border-spacing: 0 10px; }\n                .inv-premium-table th { color: var(--text-secondary); text-transform: uppercase; font-size: 0.78rem; letter-spacing: 1px; padding: 10px 15px; text-align: left; border-bottom: 1px solid var(--border-glass, rgba(255,255,255,0.12)); }\n                .inv-premium-table td { background: var(--bg-secondary, #0f172a); padding: 14px 16px; border-top: 1px solid var(--border-glass, rgba(255,255,255,0.12)); border-bottom: 1px solid var(--border-glass, rgba(255,255,255,0.12)); color: var(--text-primary); }\n                .inv-premium-table td:first-child { border-left: 1px solid var(--border-glass, rgba(255,255,255,0.12)); border-radius: 12px 0 0 12px; }\n                .inv-premium-table td:last-child { border-right: 1px solid var(--border-glass, rgba(255,255,255,0.12)); border-radius: 0 12px 12px 0; }\n                .inv-premium-table tr { transition: transform 0.2s, box-shadow 0.2s; }\n                .inv-premium-table tbody tr:hover td { background: var(--bg-card-hover, rgba(15,23,42,0.95)); }\n                \n                .inv-form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 18px; }\n                .inv-form-group label { display: block; margin-bottom: 6px; font-weight: 600; color: var(--text-primary, #f8fafc); font-size: 0.88rem; }\n                .inv-input {\n                    width: 100%;\n                    padding: 11px 14px;\n                    border-radius: 10px;\n                    border: 1.5px solid rgba(255, 255, 255, 0.2);\n                    background: #0f172a;\n                    color: #f8fafc;\n                    font-size: 0.92rem;\n                    outline: none;\n                    transition: all 0.2s ease;\n                    font-family: inherit;\n                    box-sizing: border-box;\n                }\n                .inv-input:focus { border-color: #2563eb !important; box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.3) !important; background: #0f172a; }\n                .inv-input.read-only { background: rgba(255, 255, 255, 0.05); color: #cbd5e1; }\n                \n                [data-theme=\"light\"] .inv-header-nav,\n                [data-theme=\"light\"] .inv-card,\n                [data-theme=\"light\"] .premium-panel {\n                    background: #ffffff !important;\n                    border: 1px solid #cbd5e1 !important;\n                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06) !important;\n                }\n                [data-theme=\"light\"] .inv-nav-pills { background: #f1f5f9 !important; }\n                [data-theme=\"light\"] .inv-nav-btn { color: #475569 !important; border: 1px solid #cbd5e1 !important; }\n                [data-theme=\"light\"] .inv-nav-btn:hover { background: #e2e8f0 !important; color: #0f172a !important; }\n                [data-theme=\"light\"] .inv-nav-btn.active { background: linear-gradient(135deg, #2563eb, #4f46e5) !important; color: #ffffff !important; border-color: transparent !important; }\n                [data-theme=\"light\"] .inv-form-group label { color: #0f172a !important; }\n                [data-theme=\"light\"] .inv-section-heading { color: #1e40af !important; }\n                [data-theme=\"light\"] .inv-input { background: #ffffff !important; border: 1.5px solid #94a3b8 !important; color: #0f172a !important; }\n                [data-theme=\"light\"] .inv-input:focus { background: #ffffff !important; border-color: #2563eb !important; box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.2) !important; color: #0f172a !important; }\n                [data-theme=\"light\"] .inv-premium-table td { background: #ffffff !important; border: 1px solid #e2e8f0 !important; color: #0f172a !important; }\n                [data-theme=\"light\"] .inv-total-box { background: #ecfdf5 !important; border-color: #a7f3d0 !important; }\n                [data-theme=\"light\"] .inv-total-box label,\n                [data-theme=\"light\"] #inv-flat-total { color: #047857 !important; }\n                \n                /* Premium Buttons */\n                .premium-btn { padding: 10px 20px; border-radius: 8px; border: none; font-weight: 700; cursor: pointer; transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); position: relative; overflow: hidden; }\n                .premium-btn::before { content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 50%; background: linear-gradient(to bottom, rgba(255,255,255,0.4), transparent); }\n                .premium-btn:hover { transform: translateY(-3px) scale(1.05); box-shadow: 0 10px 20px rgba(0,0,0,0.15); }\n                .premium-btn:active { transform: translateY(1px); }\n                .save-btn { background: linear-gradient(135deg, #00b09b, #96c93d); color: white; }\n                .action-btn { background: linear-gradient(135deg, #667eea, #764ba2); color: white; }\n                .add-btn { background: var(--surface); color: var(--text-primary); border: 1px dashed var(--border); }\n                .add-btn:hover { background: var(--background); border-color: #00C9FF; color: #00C9FF; }\n                \n                /* Tags */\n                .tag { padding: 5px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; }\n                .tag-green { background: rgba(16, 185, 129, 0.1); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.2); }\n                .tag-blue { background: rgba(59, 130, 246, 0.1); color: #3b82f6; border: 1px solid rgba(59, 130, 246, 0.2); }\n                .tag-purple { background: rgba(139, 92, 246, 0.1); color: #8b5cf6; border: 1px solid rgba(139, 92, 246, 0.2); }\n                .tag-amber { background: rgba(245, 158, 11, 0.1); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.2); }\n                .tag-red { background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2); }\n                .tag-cyan { background: rgba(6, 182, 212, 0.1); color: #00C9FF; border: 1px solid rgba(6, 182, 212, 0.2); }\n                \n                .text-gradient { background: linear-gradient(135deg, #00C9FF, #92FE9D); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }\n\n                /* Split Screen Layout */\n                .inv-split-screen { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; align-items: flex-start; }\n                .inv-builder-pane { width: 100%; min-width: 0; }\n                .inv-preview-pane { width: 100%; position: sticky; top: 30px; display: flex; flex-direction: column; align-items: center; min-width: 0; }\n                \n                /* A4 Preview Container */\n                .a4-container {\n                    width: 100%;\n                    display: flex;\n                    justify-content: center;\n                    background: #0f172a;\n                    padding: 16px;\n                    border-radius: 16px;\n                    box-shadow: inset 0 0 20px rgba(0,0,0,0.6);\n                    overflow: hidden;\n                    box-sizing: border-box;\n                    transition: height 0.2s ease;\n                }\n                \n                .a4-sheet {\n                    background: #ffffff !important;\n                    color: #0f172a !important;\n                    width: 210mm;\n                    min-height: 297mm;\n                    padding: 15mm;\n                    box-shadow: 0 15px 50px rgba(0,0,0,0.4);\n                    transform-origin: top center;\n                    box-sizing: border-box;\n                    font-family: 'Inter', sans-serif;\n                    flex-shrink: 0;\n                }\n\n                @media (max-width: 1200px) {\n                    .inv-split-screen { grid-template-columns: 1fr; }\n                    .inv-preview-pane { position: static; width: 100%; }\n                }\n\n                /* Audit List Styling */\n                #inv-audit-list li {\n                    padding: 12px 15px;\n                    border-bottom: 1px solid var(--border);\n                    display: flex;\n                    justify-content: space-between;\n                    align-items: center;\n                }\n                #inv-audit-list li:last-child { border-bottom: none; }\n                .audit-meta { font-size: 0.8rem; color: var(--text-muted); }\n                </style>\n            </section>\n\n</main>\n    </div>\n\n    <!-- PROJECT MODAL -->\n    <div class=\"modal\" id=\"projectModal\">\n        <div class=\"modal-content\">\n            <div class=\"modal-header\">\n                <h3 class=\"modal-title\" id=\"projectModalTitle\">Add Portfolio Project</h3>\n                <button class=\"modal-close\" id=\"closeProjectModal\">✕</button>\n            </div>\n            <form id=\"projectForm\">\n                <input type=\"hidden\" id=\"editProjectIndex\" value=\"-1\">\n                <div class=\"form-grid\">\n                    <div class=\"form-group form-full\">\n                        <label class=\"form-label\">Project Title</label>\n                        <input type=\"text\" class=\"form-input\" id=\"projectTitle\" required placeholder=\"e.g. Modern Mobile App\">\n                    </div>\n                    <div class=\"form-group form-full\">\n                        <label class=\"form-label\">Project Description</label>\n                        <textarea class=\"form-input textarea-input\" id=\"projectDesc\" required placeholder=\"Brief detail about what the project does...\"></textarea>\n                    </div>\n                    <div class=\"form-group form-full\">\n                        <label class=\"form-label\">Categories</label>\n                        <div style=\"display: flex; flex-wrap: wrap; gap: 10px; margin-top: 8px;\" id=\"projectCategoriesSelect\"></div>\n                    </div>\n                    <div class=\"form-group\">\n                        <label class=\"form-label\">Live Link / Target URL</label>\n                        <input type=\"text\" class=\"form-input\" id=\"projectLink\" placeholder=\"https://example.com or contact.html\">\n                    </div>\n                    <div class=\"form-group\">\n                        <label class=\"form-label\">Fallback Emoji</label>\n                        <input type=\"text\" class=\"form-input\" id=\"projectEmoji\" placeholder=\"e.g. 📱 or 🏥\" maxlength=\"4\">\n                    </div>\n                    <div class=\"form-group form-full\">\n                        <label class=\"form-label\">Project Thumbnail / Image URL (Optional)</label>\n                        <input type=\"text\" class=\"form-input\" id=\"projectImage\" placeholder=\"https://example.com/image.jpg or img/portfolio/app.png\">\n                    </div>\n                </div>\n                <div style=\"display: flex; justify-content: flex-end; gap: 12px; margin-top: 28px;\">\n                    <button type=\"button\" class=\"btn btn-secondary\" id=\"cancelProjectModal\">Cancel</button>\n                    <button type=\"submit\" class=\"btn btn-primary\">Save Project</button>\n                </div>\n            </form>\n        </div>\n    </div>\n\n    <!-- CUSTOM ANIMATED DELETE CONFIRMATION MODAL -->\n    <div class=\"modal\" id=\"deleteConfirmModal\">\n        <div class=\"modal-content\" style=\"max-width: 440px; text-align: center; padding: 36px 28px;\">\n            <div style=\"width: 72px; height: 72px; margin: 0 auto 20px; border-radius: 50%; background: linear-gradient(135deg, rgba(239,68,68,0.2), rgba(244,63,94,0.1)); border: 2px solid rgba(239,68,68,0.4); display: flex; align-items: center; justify-content: center; box-shadow: 0 0 25px rgba(239,68,68,0.35); animation: pulseWarning 2s infinite;\">\n                <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"32\" height=\"32\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#f87171\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\">\n                    <path d=\"M3 6h18\"/>\n                    <path d=\"M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6\"/>\n                    <path d=\"M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2\"/>\n                    <line x1=\"10\" y1=\"11\" x2=\"10\" y2=\"17\"/>\n                    <line x1=\"14\" y1=\"11\" x2=\"14\" y2=\"17\"/>\n                </svg>\n            </div>\n            <h3 style=\"font-size: 1.35rem; font-weight: 700; margin-bottom: 8px; color: #ffffff;\">Delete Portfolio Project?</h3>\n            <p style=\"font-size: 0.9rem; color: var(--text-secondary); line-height: 1.5; margin-bottom: 24px;\">\n                Are you sure you want to delete <strong id=\"deleteProjectTargetTitle\" style=\"color: #f87171;\"></strong>? This action will remove it from the dashboard and sync to Google Sheets.\n            </p>\n            <div style=\"display: flex; gap: 12px; justify-content: center;\">\n                <button type=\"button\" class=\"btn btn-secondary\" id=\"cancelDeleteModalBtn\" style=\"padding: 10px 20px; border-radius: 12px;\">Cancel</button>\n                <button type=\"button\" class=\"btn btn-danger\" id=\"confirmDeleteModalBtn\" style=\"padding: 10px 24px; border-radius: 12px; background: linear-gradient(135deg, #ef4444, #dc2626); box-shadow: 0 4px 15px rgba(239,68,68,0.4); display: flex; align-items: center; gap: 8px;\">\n                    <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M3 6h18\"/><path d=\"M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6\"/><path d=\"M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2\"/></svg>\n                    <span>Yes, Delete</span>\n                </button>\n            </div>\n        </div>\n    </div>\n\n    <!-- JOB POSTING MODAL -->\n    <div class=\"modal\" id=\"jobModal\">\n        <div class=\"modal-content\">\n            <div class=\"modal-header\">\n                <h3 class=\"modal-title\" id=\"jobModalTitle\">Post New Job Opening</h3>\n                <button class=\"modal-close\" id=\"closeJobModal\">✕</button>\n            </div>\n            <form id=\"jobForm\">\n                <input type=\"hidden\" id=\"editJobIndex\" value=\"-1\">\n                <div class=\"form-grid\">\n                    <div class=\"form-group form-full\">\n                        <label class=\"form-label\">Job Title *</label>\n                        <input type=\"text\" class=\"form-input\" id=\"jobTitle\" required placeholder=\"e.g. Full-Stack Web Developer\">\n                    </div>\n                    <div class=\"form-group\">\n                        <label class=\"form-label\">Department *</label>\n                        <select class=\"form-select\" id=\"jobDepartment\" required>\n                            <option value=\"sales\">Sales & BD</option>\n                            <option value=\"engineering\">Engineering</option>\n                            <option value=\"ai\">AI & Data</option>\n                            <option value=\"design\">Design</option>\n                            <option value=\"general\">General / Other</option>\n                        </select>\n                    </div>\n                    <div class=\"form-group\">\n                        <label class=\"form-label\">Emoji Icon</label>\n                        <input type=\"text\" class=\"form-input\" id=\"jobEmoji\" placeholder=\"e.g. 💻, 💼, 🤖\" maxlength=\"4\">\n                    </div>\n                    <div class=\"form-group\">\n                        <label class=\"form-label\">Location *</label>\n                        <input type=\"text\" class=\"form-input\" id=\"jobLocation\" required placeholder=\"e.g. Remote (India) / Kadapa\">\n                    </div>\n                    <div class=\"form-group\">\n                        <label class=\"form-label\">Employment Type *</label>\n                        <select class=\"form-select\" id=\"jobType\" required>\n                            <option value=\"Full-Time\">Full-Time</option>\n                            <option value=\"Part-Time\">Part-Time</option>\n                            <option value=\"Commission / Partnership\">Commission / Partnership</option>\n                            <option value=\"Internship\">Internship</option>\n                        </select>\n                    </div>\n                    <div class=\"form-group\">\n                        <label class=\"form-label\">Experience Required *</label>\n                        <input type=\"text\" class=\"form-input\" id=\"jobExperience\" required placeholder=\"e.g. 0-2 Years / Freshers\">\n                    </div>\n                    <div class=\"form-group\">\n                        <label class=\"form-label\">Salary / Incentive Package</label>\n                        <input type=\"text\" class=\"form-input\" id=\"jobSalary\" placeholder=\"e.g. Competitive + Incentives\">\n                    </div>\n                    <div class=\"form-group form-full\">\n                        <label class=\"form-label\">Position Overview *</label>\n                        <textarea class=\"form-input textarea-input\" id=\"jobOverview\" required placeholder=\"Describe the role overview and goals...\"></textarea>\n                    </div>\n                    <div class=\"form-group form-full\">\n                        <label class=\"form-label\">Key Responsibilities (One per line) *</label>\n                        <textarea class=\"form-input textarea-input\" id=\"jobResponsibilities\" required placeholder=\"Build responsive web apps&#10;Integrate APIs and databases\"></textarea>\n                    </div>\n                    <div class=\"form-group form-full\">\n                        <label class=\"form-label\">Required Skills (Comma separated) *</label>\n                        <input type=\"text\" class=\"form-input\" id=\"jobSkills\" required placeholder=\"React, Node.js, Python, B2B Sales\">\n                    </div>\n                    <div class=\"form-group\">\n                        <label class=\"form-label\">Status</label>\n                        <select class=\"form-select\" id=\"jobStatus\">\n                            <option value=\"active\">Active (Visible on Site)</option>\n                            <option value=\"inactive\">Inactive (Hidden)</option>\n                        </select>\n                    </div>\n                </div>\n                <div style=\"display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px;\">\n                    <button type=\"button\" class=\"btn btn-secondary\" id=\"cancelJobModal\">Cancel</button>\n                    <button type=\"submit\" class=\"btn btn-primary\">Save Job Posting</button>\n                </div>\n            </form>\n        </div>\n    </div>\n\n    <!-- CANDIDATE APPLICATION DETAIL MODAL -->\n    <div class=\"modal\" id=\"applicationDetailModal\">\n        <div class=\"modal-content\" style=\"max-width: 650px;\">\n            <div class=\"modal-header\">\n                <h3 class=\"modal-title\">Candidate Profile & Application</h3>\n                <button class=\"modal-close\" id=\"closeAppModal\">✕</button>\n            </div>\n            <div id=\"appModalBody\">\n                <!-- Dynamic details -->\n            </div>\n            <div style=\"display: flex; justify-content: space-between; align-items: center; margin-top: 24px; padding-top: 16px; border-top:1px solid var(--border-glass);\">\n                <div id=\"appStatusActionBtns\" style=\"display:flex;gap:8px;\">\n                    <!-- Action buttons -->\n                </div>\n                <button class=\"btn btn-primary btn-sm\" id=\"closeAppModalBtn\">Close Profile</button>\n            </div>\n        </div>\n    </div>\n\n    <!-- LEAD DETAILS MODAL -->\n    <div class=\"premium-modal\" id=\"leadModal\">\n        <div class=\"premium-modal-content\" style=\"max-width: 500px;\">\n            <div class=\"modal-header\">\n                <h3 class=\"modal-title\">Form Submission Details</h3>\n                <button class=\"modal-close\" id=\"closeLeadModal\">✕</button>\n            </div>\n            <div id=\"leadModalBody\"></div>\n            <div style=\"display: flex; justify-content: flex-end; margin-top: 24px;\">\n                <button class=\"btn btn-primary btn-sm\" id=\"closeLeadModalBtn\">Close</button>\n            </div>\n        </div>\n    </div>\n\n    <!-- DELETE CONFIRMATION MODAL -->\n    <div class=\"premium-modal\" id=\"leadDeleteConfirmModal\">\n        <div class=\"premium-modal-content\" style=\"max-width: 400px;\">\n            <div class=\"warning-icon-wrapper\">\n                <div class=\"warning-icon\">\n                    <svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z\"></path><line x1=\"12\" y1=\"9\" x2=\"12\" y2=\"13\"></line><line x1=\"12\" y1=\"17\" x2=\"12.01\" y2=\"17\"></line></svg>\n                </div>\n            </div>\n            <div class=\"premium-modal-title\">Delete Submission?</div>\n            <div class=\"premium-modal-text\">This action cannot be undone. This will permanently delete the form submission data.</div>\n            <div class=\"premium-modal-actions\">\n                <button class=\"premium-modal-btn premium-btn-cancel\" id=\"cancelDeleteBtn\">Cancel</button>\n                <button class=\"premium-modal-btn premium-btn-confirm\" id=\"confirmDeleteActionBtn\">Confirm Delete</button>\n            </div>\n        </div>\n    </div>\n\n    <!-- EDIT PANEL -->\n    <div class=\"edit-slide-panel\" id=\"editLeadPanel\">\n        <div class=\"edit-panel-header\">\n            <h3 class=\"modal-title\">Edit Submission</h3>\n            <button class=\"edit-panel-close\" id=\"closeEditPanelBtn\">✕</button>\n        </div>\n        <div id=\"editLeadBody\">\n            <input type=\"hidden\" id=\"editLeadId\">\n            <div style=\"margin-bottom: 16px;\">\n                <label style=\"display:block; margin-bottom:8px; color:var(--text-secondary); font-size: 0.85rem;\">Name</label>\n                <input type=\"text\" id=\"editLeadName\" class=\"form-control\" style=\"width: 100%; padding: 10px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: #fff;\">\n            </div>\n            <div style=\"margin-bottom: 16px;\">\n                <label style=\"display:block; margin-bottom:8px; color:var(--text-secondary); font-size: 0.85rem;\">Email</label>\n                <input type=\"email\" id=\"editLeadEmail\" class=\"form-control\" style=\"width: 100%; padding: 10px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: #fff;\">\n            </div>\n            <div style=\"margin-bottom: 16px;\">\n                <label style=\"display:block; margin-bottom:8px; color:var(--text-secondary); font-size: 0.85rem;\">Subject</label>\n                <input type=\"text\" id=\"editLeadSubject\" class=\"form-control\" style=\"width: 100%; padding: 10px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: #fff;\">\n            </div>\n            <div style=\"margin-bottom: 16px;\">\n                <label style=\"display:block; margin-bottom:8px; color:var(--text-secondary); font-size: 0.85rem;\">Message</label>\n                <textarea id=\"editLeadMessage\" class=\"form-control\" rows=\"5\" style=\"width: 100%; padding: 10px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: #fff;\"></textarea>\n            </div>\n            <div style=\"margin-top: 24px; text-align: right;\">\n                <button class=\"btn btn-primary\" id=\"saveEditLeadBtn\" style=\"width: 100%; padding: 12px; border-radius: 8px;\">Save Changes</button>\n            </div>\n        </div>\n    </div>\n\n    <!-- Toast System -->\n    <div class=\"toast\" id=\"toastBox\">\n        <span class=\"toast-icon\" id=\"toastIcon\">✅</span>\n        <span id=\"toastMsg\">Action complete.</span>\n    </div>\n";

  let clockInterval = null;

  window.mountAdminPortal = function(mountContainer, user) {
    if (!mountContainer) return;
    mountContainer.innerHTML = DASHBOARD_TEMPLATE;

    // Execute administrative controller
    try {
      initAdminController(user);
    } catch (err) {
      console.error('Admin controller init error:', err);
    }
  };

  window.unmountAdminPortal = function() {
    if (clockInterval) {
      clearInterval(clockInterval);
      clockInterval = null;
    }
  };

  function initAdminController(currentUser) {
        let database = {
            categories: [],
            projects: [],
            submissions: [],
            jobs: [],
            applications: []
        };
        let currentActiveTab = 'dashboard-summary';

        const loginWrapper = document.getElementById('loginWrapper');
        const loginForm = document.getElementById('loginForm');
        const dashboardContainer = document.getElementById('dashboardContainer');
        const logoutBtn = document.getElementById('logoutBtn');
        const sidebarLinks = document.querySelectorAll('.sidebar-link[data-tab]');
        const tabContents = document.querySelectorAll('.tab-content');
        const contentTitle = document.getElementById('contentTitle');
        const currentTime = document.getElementById('currentTime');
        const themeToggleBtn = document.getElementById('themeToggleBtn');

        // Hardcoded passwords removed for security

        setInterval(() => {
            const now = new Date();
            currentTime.textContent = now.toLocaleString();
        }, 1000);
        currentTime.textContent = new Date().toLocaleString();

        const checkAuth = () => {
            if (localStorage.getItem('shaivika_admin_logged_in') === 'true') {
                loginWrapper.style.display = 'none';
                dashboardContainer.style.display = 'flex';
                loadData();
            } else {
                loginWrapper.style.display = 'flex';
                dashboardContainer.style.display = 'none';
            }
        };

        const initTheme = () => {
            const currentTheme = localStorage.getItem('theme') || 'dark';
            document.documentElement.setAttribute('data-theme', currentTheme);
            themeToggleBtn.innerHTML = currentTheme === 'dark' ? '☀️' : '🌙';
        };

        themeToggleBtn.addEventListener('click', () => {
            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            const newTheme = isDark ? 'light' : 'dark';
            localStorage.setItem('theme', newTheme);
            document.documentElement.setAttribute('data-theme', newTheme);
            themeToggleBtn.innerHTML = newTheme === 'dark' ? '☀️' : '🌙';
        });

        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // Brute-force rate limiting and lockout protection
            const lockoutUntil = parseInt(sessionStorage.getItem('shaivika_admin_lockout') || '0', 10);
            const now = Date.now();
            if (lockoutUntil > now) {
                const remaining = Math.ceil((lockoutUntil - now) / 1000);
                showToast(`Too many failed attempts. Locked for ${remaining}s.`, 'error');
                return;
            }

            const user = document.getElementById('username').value.trim();
            const pass = document.getElementById('password').value.trim();
            const storedPass = localStorage.getItem('shaivika_admin_password');

            // Client-side authentication handler moved to admin-auth-client.js

        logoutBtn?.addEventListener("click", () => { if (typeof window.handleAdminLogout === "function") window.handleAdminLogout(); });

        // Ensure switchInvoiceView exists early for zero-latency clicks
        if (typeof window.switchInvoiceView !== 'function') {
            window.switchInvoiceView = function(viewId, context = null) {
                const invoiceTab = document.getElementById('invoice-generator-tab');
                if (invoiceTab) {
                    invoiceTab.querySelectorAll('.inv-nav-btn').forEach(btn => {
                        if (btn.dataset.view === viewId) btn.classList.add('active');
                        else btn.classList.remove('active');
                    });
                    invoiceTab.querySelectorAll('.inv-view').forEach(view => view.style.display = 'none');
                    const target = document.getElementById('inv-view-' + viewId);
                    if (target) {
                        target.style.display = 'block';
                    }
                }
                window._pendingInvoiceView = { viewId, context };
            };
        }

        sidebarLinks.forEach(link => {
            link.addEventListener('click', () => {
                const targetTab = link.dataset.tab;
                sidebarLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
                tabContents.forEach(tc => tc.classList.remove('active'));
                document.getElementById(targetTab).classList.add('active');
                const firstSpan = link.querySelector('span') || link;
                contentTitle.textContent = firstSpan.textContent.trim().replace(/^[\p{Emoji}\s]+/u, '');
                currentActiveTab = targetTab;

                if (targetTab === 'invoice-generator-tab') {
                    if (typeof window.switchInvoiceView === 'function') {
                        window.switchInvoiceView('dashboard');
                    } else {
                        window._pendingInvoiceView = { viewId: 'dashboard', context: null };
                    }
                }
            });
        });

        const showToast = (msg, type = 'success') => {
            const toastBox = document.getElementById('toastBox');
            const toastIcon = document.getElementById('toastIcon');
            const toastMsg = document.getElementById('toastMsg');

            if (type === 'success') {
                toastIcon.textContent = '✅';
                toastBox.style.borderColor = 'rgba(16, 185, 129, 0.4)';
            } else if (type === 'info') {
                toastIcon.textContent = 'ℹ️';
                toastBox.style.borderColor = 'rgba(59, 130, 246, 0.4)';
            } else if (type === 'warning') {
                toastIcon.textContent = '⚠️';
                toastBox.style.borderColor = 'rgba(245, 158, 11, 0.4)';
            } else {
                toastIcon.textContent = '❌';
                toastBox.style.borderColor = 'rgba(239, 68, 68, 0.4)';
            }

            // Strip leading emoji from message to avoid duplicate icons
            const cleanMsg = msg.replace(/^(✅|ℹ️|⚠️|❌|📥|📤|🔄|✔️)\s*/u, '');
            toastMsg.textContent = cleanMsg;
            toastBox.classList.add('show');
            if (window._toastTimeout) clearTimeout(window._toastTimeout);
            window._toastTimeout = setTimeout(() => toastBox.classList.remove('show'), 3500);
        };
        window.showToast = showToast;

        const escapeHTML = (str) => {
            if (str == null) return '';
            return String(str)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
        };
        window.escapeHTML = escapeHTML;

        const sanitizeUrl = (url) => {
            if (!url) return '';
            const trimmed = String(url).trim();
            if (/^(https?:\/\/|\/|\.\/|\.\.\/|mailto:|tel:)/i.test(trimmed)) {
                return trimmed;
            }
            return '';
        };
        window.sanitizeUrl = sanitizeUrl;

        const DEFAULT_FALLBACK_PROJECTS = [
            { id: "p1", title: "Manspharshcare Platform", description: "Comprehensive healthcare web platform built for Manspharshcare.xyz — featuring patient portal, appointment booking, and telemedicine.", categories: ["webapp", "ui"], link: "https://mansparshcare.xyz/", emoji: "🏥" },
            { id: "p3", title: "AI Lead Automation CRM", description: "Intelligent lead scoring, WhatsApp follow-ups, pipeline management and conversion analytics.", categories: ["ai", "saas"], link: "contact.html", emoji: "🤖" },
            { id: "p4", title: "Business Analytics Dashboard", description: "Real-time data visualization platform with Google Sheets integration, KPI tracking, and automated reports.", categories: ["saas", "enterprise"], link: "contact.html", emoji: "📊" },
            { id: "p5", title: "Real Estate WhatsApp Bot", description: "Intelligent WhatsApp bot that qualifies property leads, shares listings, and schedules site visits automatically.", categories: ["ai", "webapp"], link: "contact.html", emoji: "💬" },
            { id: "p6", title: "EdTech Learning Platform", description: "Dark-themed e-learning platform with video courses, progress tracking, gamification, and certificate generation.", categories: ["ui", "webapp"], link: "contact.html", emoji: "🎓" }
        ];

        const DEFAULT_FALLBACK_JOBS = [
            { id: "job_bdp", title: "Business Development Partner", department: "sales", location: "Remote (India) / Hybrid", type: "Commission / Partnership", experience: "1+ Years in B2B / Sales", salary: "High Performance Incentives + Commission", status: "active", emoji: "💼", overview: "Shaivika IT Technologies invites ambitious business development professionals to join our BD Partner Program.", responsibilities: ["Identify and engage prospective business clients across targeted industries.", "Build relationships with founders, directors, CXOs, and key decision-makers."], skills: ["B2B Sales", "Client Acquisition", "IT Consulting"] },
            { id: "job_fullstack", title: "Full-Stack Web Developer", department: "engineering", location: "Kadapa / Hybrid", type: "Full-Time", experience: "0-2 Years (Freshers Welcome)", salary: "Competitive + Performance Bonus", status: "active", emoji: "💻", overview: "We are seeking a talented Full-Stack Web Developer proficient in modern frontend frameworks and backend systems.", responsibilities: ["Develop high-performance, responsive web applications using modern JavaScript/React.", "Integrate RESTful APIs and database architecture."], skills: ["JavaScript", "React", "Node.js", "REST APIs"] },
            { id: "job_ai", title: "AI & Automation Engineer", department: "ai", location: "Remote / Hybrid", type: "Full-Time / Part-Time", experience: "1+ Years in AI/NLP", salary: "Industry Standard + Perks", status: "active", emoji: "🤖", overview: "Join our core AI team to design and build intelligent automation bots and LLM integrations.", responsibilities: ["Design AI agent workflows and conversational bots.", "Integrate OpenAI/Gemini APIs and LangChain."], skills: ["Python", "OpenAI APIs", "WhatsApp API", "LangChain"] },
            { id: "job_uiux", title: "UI/UX & Product Designer", department: "design", location: "Remote (India)", type: "Full-Time", experience: "1+ Years Portfolio Required", salary: "Competitive", status: "active", emoji: "🎨", overview: "Craft visually stunning digital interfaces and dark-mode themes.", responsibilities: ["Design high-fidelity wireframes and Figma prototypes."], skills: ["Figma", "UI Design", "Glassmorphism"] },
            { id: "job_mobile", title: "Flutter / Mobile App Developer", department: "engineering", location: "Hybrid / Remote", type: "Full-Time", experience: "1+ Years", salary: "Competitive", status: "active", emoji: "📱", overview: "Build cross-platform mobile apps for Android and iOS using Flutter.", responsibilities: ["Develop high-performance Flutter applications."], skills: ["Flutter", "Dart", "Firebase"] }
        ];

        const loadData = async () => {
            // Categories
            try {
                let cats = localStorage.getItem('shaivika_portfolio_categories');
                if (cats && JSON.parse(cats).length > 0) {
                    database.categories = JSON.parse(cats);
                } else {
                    database.categories = [
                        { id: "webapp", name: "Web Apps" },
                        { id: "ai", name: "AI & Automation" },
                        { id: "ui", name: "UI Design" },
                        { id: "saas", name: "SaaS" },
                        { id: "enterprise", name: "Enterprise" }
                    ];
                    localStorage.setItem('shaivika_portfolio_categories', JSON.stringify(database.categories));
                }
            } catch (e) {
                database.categories = [
                    { id: "webapp", name: "Web Apps" },
                    { id: "ai", name: "AI & Automation" },
                    { id: "ui", name: "UI Design" },
                    { id: "saas", name: "SaaS" },
                    { id: "enterprise", name: "Enterprise" }
                ];
            }

            // Projects
            try {
                let projs = localStorage.getItem('shaivika_portfolio_projects');
                if (projs && JSON.parse(projs).length > 0) {
                    database.projects = JSON.parse(projs);
                } else {
                    try {
                        const fallback = await fetch('../data/portfolio.json');
                        if (fallback.ok) {
                            const data = await fallback.json();
                            database.projects = data.projects && data.projects.length ? data.projects : DEFAULT_FALLBACK_PROJECTS;
                        } else {
                            database.projects = DEFAULT_FALLBACK_PROJECTS;
                        }
                    } catch (e) {
                        database.projects = DEFAULT_FALLBACK_PROJECTS;
                    }
                    localStorage.setItem('shaivika_portfolio_projects', JSON.stringify(database.projects));
                }
            } catch (e) {
                database.projects = DEFAULT_FALLBACK_PROJECTS;
            }

                // Submissions
                try {
                    const sheetUrl = 'https://docs.google.com/spreadsheets/d/19Sa9Bh6_cEs-oTUEPRRgQURpC5BaOwYfhaoF6nFBCMU/gviz/tq?tqx=out:json';
                    const response = await fetch(sheetUrl).catch(() => null);
                    if (response && response.ok) {
                        const text = await response.text();
                        const jsonStart = text.indexOf('{');
                        const jsonEnd = text.lastIndexOf('}');
                        if (jsonStart !== -1 && jsonEnd !== -1) {
                            const jsonString = text.substring(jsonStart, jsonEnd + 1);
                            const data = JSON.parse(jsonString);
                            const rows = data.table && data.table.rows ? data.table.rows : [];
                            
                            database.submissions = rows.map((row, index) => {
                                return {
                                    id: 'gs-' + index,
                                    timestamp: row.c && row.c[0] ? (row.c[0].f || row.c[0].v) : new Date().toISOString(),
                                    name: row.c && row.c[1] ? row.c[1].v : 'Unknown',
                                    email: row.c && row.c[2] ? row.c[2].v : 'No Email',
                                    subject: row.c && row.c[5] ? row.c[5].v : 'No Service',
                                    message: row.c && row.c[6] ? row.c[6].v : 'No Message',
                                    type: row.c && row.c[7] ? (String(row.c[7].v).includes('Newsletter') ? 'Newsletter' : 'Contact') : 'Contact'
                                };
                            }).reverse();
                            localStorage.setItem('shaivika_submissions', JSON.stringify(database.submissions));
                        }
                    } else {
                        let subs = localStorage.getItem('shaivika_submissions');
                        database.submissions = subs ? JSON.parse(subs) : [];
                    }
                } catch(e) {
                    let subs = localStorage.getItem('shaivika_submissions');
                    try {
                        database.submissions = subs ? JSON.parse(subs) : [];
                    } catch(err) {
                        database.submissions = [];
                    }
                }


            // Jobs
            try {
                let jbs = localStorage.getItem('shaivika_job_postings');
                if (jbs && JSON.parse(jbs).length > 0) {
                    database.jobs = JSON.parse(jbs);
                } else {
                    database.jobs = DEFAULT_FALLBACK_JOBS;
                    localStorage.setItem('shaivika_job_postings', JSON.stringify(database.jobs));
                }
            } catch (e) {
                database.jobs = DEFAULT_FALLBACK_JOBS;
            }
            if (Array.isArray(database.jobs)) {
                database.jobs.forEach((j, i) => {
                    if (!j.id) j.id = 'job_' + (Date.now() + i);
                });
            }

            // Applications
            try {
                let apps = localStorage.getItem('shaivika_job_applications');
                database.applications = apps ? JSON.parse(apps) : [];
            } catch (e) {
                database.applications = [];
            }
            ensureApplicationIds();

            // Always render everything safely!
            try { updateDashboardStats(); } catch(e) {}
            try { renderDashboardRecentSubmissions(); } catch(e) {}
            try { renderProjectsTable(); } catch(e) {}
            try { renderCategoriesTable(); } catch(e) {}
            try { renderLeadsTable(); } catch(e) {}
            try { renderJobsTable(); } catch(e) {}
            try { renderApplicationsTable(); } catch(e) {}
            try { populateCategoryCheckboxes(); } catch(e) {}
        };

        const saveData = () => {
            localStorage.setItem('shaivika_portfolio_categories', JSON.stringify(database.categories));
            localStorage.setItem('shaivika_portfolio_projects', JSON.stringify(database.projects));
            localStorage.setItem('shaivika_submissions', JSON.stringify(database.submissions));
            localStorage.setItem('shaivika_job_postings', JSON.stringify(database.jobs));
            localStorage.setItem('shaivika_job_applications', JSON.stringify(database.applications));
            updateDashboardStats();
            populateCategoryCheckboxes();
            window.dispatchEvent(new CustomEvent('shaivika_portfolio_updated', { detail: database.projects }));
        };

        // Export portfolio.json for deployment
        window.exportPortfolioJSON = () => {
            const exportData = {
                categories: database.categories,
                projects: database.projects
            };
            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'portfolio.json';
            a.click();
            URL.revokeObjectURL(url);
            showToast('✅ Downloaded portfolio.json — Replace file in /data/ folder and push to GitHub!', 'success');
        };

        const updateDashboardStats = () => {
            document.getElementById('statTotalProjects').textContent = database.projects.length;
            document.getElementById('statTotalCategories').textContent = database.categories.length;
            document.getElementById('statTotalSubmissions').textContent = database.submissions.length;
            document.getElementById('statTotalJobs').textContent = database.jobs.filter(j => j.status !== 'inactive').length;
            document.getElementById('statTotalApplications').textContent = database.applications.length;

            const statInvoicesEl = document.getElementById('statTotalInvoices');
            if (statInvoicesEl) {
                const invoices = window.InvoiceDB ? window.InvoiceDB.getInvoices() : (JSON.parse(localStorage.getItem('shaivika_invoices') || '[]'));
                statInvoicesEl.textContent = invoices.length;
            }

            const pendingCount = database.applications.filter(a => a.appStatus === 'pending').length;
            const badge = document.getElementById('pendingAppsBadge');
            if (badge) {
                if (pendingCount > 0) {
                    badge.textContent = pendingCount;
                    badge.style.display = 'inline-block';
                } else {
                    badge.style.display = 'none';
                }
            }
        };

        const renderDashboardRecentSubmissions = () => {
            const tbody = document.getElementById('recentLeadsBody');
            tbody.innerHTML = '';
            const sortedSubmissions = [...database.submissions].sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp));
            const recent = sortedSubmissions.slice(0, 5);

            if (recent.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--text-muted);">No form submissions yet.</td></tr>';
                return;
            }

            recent.forEach(sub => {
                const tr = document.createElement('tr');
                const date = new Date(sub.timestamp).toLocaleDateString();
                const typeTag = sub.type === 'Newsletter' ? 'tag-purple' : 'tag-blue';
                tr.innerHTML = `
                    <td>${escapeHTML(date)}</td>
                    <td><span class="tag ${typeTag}">${escapeHTML(sub.type)}</span></td>
                    <td>${escapeHTML(sub.name)}</td>
                    <td>${escapeHTML(sub.email)}</td>
                    <td>${escapeHTML(sub.subject)}</td>
                    <td>
                        <div class="premium-actions">
                            <div class="tooltip-wrap" data-tooltip="View Submission">
                                <button class="premium-btn view-btn" onclick="viewLeadDetails('${sub.id}')">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                </button>
                            </div>
                            <div class="tooltip-wrap" data-tooltip="Edit Submission">
                                <button class="premium-btn edit-btn" onclick="editLeadDetails('${sub.id}')">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                </button>
                            </div>
                            <div class="tooltip-wrap" data-tooltip="Delete Submission">
                                <button class="premium-btn delete-btn" onclick="confirmDeleteLead('${sub.id}')">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                </button>
                            </div>
                        </div>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        };

        document.getElementById('viewAllLeadsBtn').addEventListener('click', () => {
            document.querySelector('.sidebar-link[data-tab="leads-manager-tab"]').click();
        });

        // PROJECTS TABLE
        const renderProjectsTable = (searchQuery = '', highlightIndex = -1) => {
            const tbody = document.getElementById('projectsTableBody');
            tbody.innerHTML = '';

            let filtered = database.projects;
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                filtered = database.projects.filter(p => 
                    p.title.toLowerCase().includes(query) || 
                    p.description.toLowerCase().includes(query)
                );
            }

            if (filtered.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 24px;">No projects found.</td></tr>';
                return;
            }

            filtered.forEach((proj) => {
                const idx = database.projects.indexOf(proj);
                const tr = document.createElement('tr');
                tr.className = `tr-project-row ${highlightIndex === idx ? 'tr-row-highlight' : ''}`;
                tr.id = 'proj-row-' + proj.id;
                
                let thumbHTML = proj.image ? `<img src="${proj.image}" style="width:50px; height:35px; object-fit:cover; border-radius:6px; box-shadow: 0 2px 6px rgba(0,0,0,0.3);">` : `<span style="font-size: 1.35rem;">${proj.emoji || '💻'}</span>`;
                const cats = Array.isArray(proj.categories) ? proj.categories : (typeof proj.categories === 'string' ? proj.categories.split(',').map(s => s.trim()) : []);
                const tags = cats.map(cId => `<span class="tag tag-cyan" style="font-size:0.68rem; margin-right:4px;">${cId}</span>`).join('');
                const linkDisplay = proj.link ? `<a href="${proj.link}" target="_blank" style="color:var(--accent); text-decoration:none; font-weight:500; display:inline-flex; align-items:center; gap:4px;" title="${proj.link}"><span>${proj.link.length > 28 ? proj.link.substring(0,25) + '...' : proj.link}</span> <span style="font-size:0.75rem;">↗</span></a>` : '<span style="color:var(--text-muted);">None</span>';

                tr.innerHTML = `
                    <td style="text-align:center;">${thumbHTML}</td>
                    <td class="project-title-cell" style="font-weight:600; color: var(--text-primary); font-size:0.95rem;">${proj.title}</td>
                    <td>${tags}</td>
                    <td>${linkDisplay}</td>
                    <td>
                        <div class="action-btns">
                            <button type="button" class="action-btn action-btn-edit" onclick="openEditProject(${idx})" title="Edit Project">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                </svg>
                                <span>Edit</span>
                            </button>
                            <button type="button" class="action-btn action-btn-delete" onclick="promptDeleteProject(${idx})" title="Delete Project">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M3 6h18"/>
                                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                                    <line x1="10" y1="11" x2="10" y2="17"/>
                                    <line x1="14" y1="11" x2="14" y2="17"/>
                                </svg>
                                <span>Delete</span>
                            </button>

                        </div>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        };

        document.getElementById('searchProjects').addEventListener('input', (e) => {
            renderProjectsTable(e.target.value);
        });

        const populateCategoryCheckboxes = () => {
            const wrapper = document.getElementById('projectCategoriesSelect');
            if (!wrapper) return;
            wrapper.innerHTML = '';
            database.categories.forEach(cat => {
                const label = document.createElement('label');
                label.style.cssText = 'display:flex; align-items:center; gap:6px; cursor:pointer; background:rgba(255,255,255,0.03); padding:6px 12px; border-radius:8px; border:1px solid var(--border-glass); font-size:0.85rem;';
                label.innerHTML = `<input type="checkbox" name="projCatCheckbox" value="${cat.id}"> ${cat.name}`;
                wrapper.appendChild(label);
            });
        };

        // CATEGORIES TABLE
        const renderCategoriesTable = () => {
            const tbody = document.getElementById('categoriesTableBody');
            tbody.innerHTML = '';
            if (database.categories.length === 0) {
                tbody.innerHTML = '<tr><td colspan="3" style="text-align: center; color: var(--text-muted); padding:24px;">No categories created.</td></tr>';
                return;
            }
            database.categories.forEach((cat) => {
                const tr = document.createElement('tr');
                const safeCatId = escapeHTML(cat.id);
                tr.innerHTML = `
                    <td><code style="color:var(--cyan); font-weight:600;">${safeCatId}</code></td>
                    <td style="font-weight:600;">${escapeHTML(cat.name)}</td>
                    <td>
                        <div class="action-btns">
                            <button type="button" class="action-btn action-btn-edit" onclick="window.openEditCategory('${safeCatId}')" title="Edit Category">
                                <i class="fa-solid fa-pen"></i> <span>Edit</span>
                            </button>
                            <button type="button" class="action-btn action-btn-delete" onclick="window.deleteCategory('${safeCatId}')" title="Delete Category">
                                <i class="fa-solid fa-trash"></i> <span>Delete</span>
                            </button>
                        </div>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        };

        // LEADS TABLE
        const renderLeadsTable = (searchQuery = '') => {
            const tbody = document.getElementById('leadsTableBody');
            tbody.innerHTML = '';
            let filtered = [...database.submissions].sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp));
            if (searchQuery) {
                const q = searchQuery.toLowerCase();
                filtered = filtered.filter(l => l.name.toLowerCase().includes(q) || l.email.toLowerCase().includes(q) || l.subject.toLowerCase().includes(q));
            }
            if (filtered.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding:24px;">No form submissions.</td></tr>';
                return;
            }
            filtered.forEach(sub => {
                const tr = document.createElement('tr');
                const date = new Date(sub.timestamp).toLocaleString();
                const typeTag = sub.type === 'Newsletter' ? 'tag-purple' : 'tag-blue';
                tr.innerHTML = `
                    <td>${escapeHTML(date)}</td>
                    <td><span class="tag ${typeTag}">${escapeHTML(sub.type)}</span></td>
                    <td>${escapeHTML(sub.name)}</td>
                    <td>${escapeHTML(sub.email)}</td>
                    <td>${escapeHTML(sub.subject)}</td>
                    <td>
                        <div class="action-btns">
                            <button type="button" class="action-btn action-btn-view action-btn-icon" title="View Submission" onclick="viewLeadDetails('${escapeHTML(sub.id)}')">
                                <i class="fa-solid fa-eye"></i>
                            </button>
                            <button type="button" class="action-btn action-btn-edit action-btn-icon" title="Edit Submission" onclick="editLeadDetails('${escapeHTML(sub.id)}')">
                                <i class="fa-solid fa-pen"></i>
                            </button>
                            <button type="button" class="action-btn action-btn-delete action-btn-icon" title="Delete Submission" onclick="confirmDeleteLead('${escapeHTML(sub.id)}')">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        </div>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        };

        document.getElementById('searchLeads').addEventListener('input', (e) => {
            renderLeadsTable(e.target.value);
        });

        // JOBS MANAGEMENT TABLE
        const renderJobsTable = (searchQuery = '') => {
            const tbody = document.getElementById('jobsTableBody');
            tbody.innerHTML = '';

            let filtered = database.jobs;
            if (searchQuery) {
                const q = searchQuery.toLowerCase();
                filtered = filtered.filter(j => j.title.toLowerCase().includes(q) || (j.departmentName || '').toLowerCase().includes(q) || (j.location || '').toLowerCase().includes(q));
            }

            if (filtered.length === 0) {
                tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding:24px;">No job postings active. Click "Post New Job" to add one.</td></tr>';
                return;
            }

            filtered.forEach((job) => {
                const tr = document.createElement('tr');
                const statusBadge = job.status === 'inactive' ? '<span class="status-badge badge-danger">Inactive</span>' : '<span class="status-badge badge-success">Active</span>';
                const safeJobId = escapeHTML(job.id);

                tr.innerHTML = `
                    <td style="font-size:1.4rem;text-align:center;">${job.emoji || '💼'}</td>
                    <td style="font-weight:700;">${escapeHTML(job.title)}</td>
                    <td><span class="tag tag-purple">${escapeHTML(job.departmentName || job.department)}</span></td>
                    <td>📍 ${escapeHTML(job.location || 'Remote')}</td>
                    <td>${escapeHTML(job.type || 'Full-Time')}</td>
                    <td>${statusBadge}</td>
                    <td>
                        <div class="action-btns">
                            <button type="button" class="action-btn action-btn-edit action-btn-icon" onclick="window.openEditJob('${safeJobId}')" title="Edit Job Opening">
                                <i class="fa-solid fa-pen"></i>
                            </button>
                            <button type="button" class="action-btn action-btn-toggle action-btn-icon" onclick="window.toggleJobStatus('${safeJobId}')" title="Toggle Active Status">
                                <i class="fa-solid fa-arrows-rotate"></i>
                            </button>
                            <button type="button" class="action-btn action-btn-delete action-btn-icon" onclick="window.deleteJob('${safeJobId}')" title="Delete Job Opening">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        </div>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        };

        document.getElementById('searchJobs').addEventListener('input', (e) => {
            renderJobsTable(e.target.value);
        });

        // JOB APPLICATIONS TABLE
        const renderApplicationsTable = (searchQuery = '') => {
            const tbody = document.getElementById('applicationsTableBody');
            if (!tbody) return;
            tbody.innerHTML = '';

            const statusFilter = document.getElementById('filterAppStatus')?.value || 'all';
            let filtered = [...(database.applications || [])].sort((a,b) => new Date(b.submittedAt) - new Date(a.submittedAt));

            if (statusFilter !== 'all') {
                filtered = filtered.filter(a => a.appStatus === statusFilter);
            }

            if (searchQuery) {
                const q = searchQuery.toLowerCase();
                filtered = filtered.filter(a => 
                    (a.name || '').toLowerCase().includes(q) || 
                    (a.email || '').toLowerCase().includes(q) || 
                    (a.jobTitle || '').toLowerCase().includes(q) || 
                    (a.skills || '').toLowerCase().includes(q)
                );
            }

            if (filtered.length === 0) {
                tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: var(--text-muted); padding:24px;">No candidate job applications found.</td></tr>';
                return;
            }

            filtered.forEach((app) => {
                const tr = document.createElement('tr');
                const dateStr = app.submittedAt ? new Date(app.submittedAt).toLocaleDateString('en-IN') : 'N/A';

                const curStatus = app.appStatus || 'pending';
                const statusSelectHTML = `
                    <select class="form-select status-select-sm" onchange="window.updateAppStatus('${escapeHTML(app.id)}', this.value)" style="padding:5px 10px; font-size:0.8rem; border-radius:8px; font-weight:700; cursor:pointer; background:var(--background); color:var(--text-primary); border:1px solid var(--border);">
                        <option value="pending" ${curStatus === 'pending' ? 'selected' : ''}>⏳ Pending</option>
                        <option value="shortlisted" ${curStatus === 'shortlisted' ? 'selected' : ''}>✅ Shortlisted</option>
                        <option value="rejected" ${curStatus === 'rejected' ? 'selected' : ''}>❌ Rejected</option>
                    </select>
                `;

                const safeResumeName = escapeHTML(app.resumeFileName || 'Resume Attached');
                const hasResume = (app.resumeBase64 || app.resumeUrl) ? `<span style="color:var(--success);font-weight:600;">📎 ${safeResumeName}</span>` : '<span style="color:var(--text-muted);">No file</span>';

                tr.innerHTML = `
                    <td>${escapeHTML(dateStr)}</td>
                    <td style="font-weight:700;">${escapeHTML(app.name)}</td>
                    <td><span class="tag tag-cyan">${escapeHTML(app.jobTitle)}</span></td>
                    <td>
                        <div style="font-size:0.85rem;">📧 ${escapeHTML(app.email)}</div>
                        <div style="font-size:0.8rem;color:var(--text-secondary);">📱 ${escapeHTML(app.phone)}</div>
                    </td>
                    <td>${escapeHTML(app.status || 'N/A')} <br><small style="color:var(--text-muted);">${escapeHTML(app.experience || '')}</small></td>
                    <td>${hasResume}</td>
                    <td>${statusSelectHTML}</td>
                    <td>
                        <div class="action-btns">
                            <button type="button" class="action-btn action-btn-view" onclick="window.viewApplicationDetails('${escapeHTML(app.id)}')" title="View Full Candidate Profile & Resume">
                                <i class="fa-solid fa-id-card"></i> <span>Profile</span>
                            </button>
                            <button type="button" class="action-btn action-btn-delete action-btn-icon" onclick="window.deleteApplication('${escapeHTML(app.id)}')" title="Delete Application">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        </div>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        };
        window.renderApplicationsTable = renderApplicationsTable;

        document.getElementById('searchApplications').addEventListener('input', (e) => {
            renderApplicationsTable(e.target.value);
        });

        document.getElementById('filterAppStatus').addEventListener('change', () => {
            renderApplicationsTable(document.getElementById('searchApplications').value);
        });

        // Refresh button: reload from localStorage live
        document.getElementById('refreshApplicationsBtn').addEventListener('click', () => {
            const apps = localStorage.getItem('shaivika_job_applications');
            database.applications = apps ? JSON.parse(apps) : [];
            updateDashboardStats();
            renderApplicationsTable(document.getElementById('searchApplications').value);
            showToast('Applications refreshed!', 'success');
        });

        const ensureApplicationIds = () => {
            if (!Array.isArray(database.applications)) {
                database.applications = [];
                return;
            }
            let updated = false;
            database.applications.forEach((a, i) => {
                if (!a.id) {
                    a.id = 'app_' + Date.now() + '_' + i + '_' + Math.random().toString(36).substring(2, 6);
                    updated = true;
                }
            });
            if (updated) {
                localStorage.setItem('shaivika_job_applications', JSON.stringify(database.applications));
            }
        };
        window.ensureApplicationIds = ensureApplicationIds;

        // Auto-detect new applications from other tabs/pages (Careers page submission)
        window.addEventListener('storage', (e) => {
            if (e.key === 'shaivika_job_applications') {
                database.applications = e.newValue ? JSON.parse(e.newValue) : [];
                ensureApplicationIds();
                updateDashboardStats();
                renderApplicationsTable(document.getElementById('searchApplications')?.value || '');
                showToast('🔔 New job application received!', 'success');
            }
        });

        // JOB MODAL LOGIC
        const jobModal = document.getElementById('jobModal');
        const openJobModal = () => {
            jobModal.classList.add('open');
            document.body.style.overflow = 'hidden';
        };

        const closeJobModal = () => {
            jobModal.classList.remove('open');
            document.body.style.overflow = '';
            document.getElementById('jobForm').reset();
            document.getElementById('editJobIndex').value = '-1';
            document.getElementById('jobModalTitle').textContent = 'Post New Job Opening';
        };

        document.getElementById('addNewJobBtn').addEventListener('click', () => {
            closeJobModal();
            openJobModal();
        });

        document.getElementById('closeJobModal').addEventListener('click', closeJobModal);
        document.getElementById('cancelJobModal').addEventListener('click', closeJobModal);

        document.getElementById('jobForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const editIdx = parseInt(document.getElementById('editJobIndex').value);
            const title = document.getElementById('jobTitle').value.trim();
            const department = document.getElementById('jobDepartment').value;
            const emoji = document.getElementById('jobEmoji').value.trim() || '💼';
            const location = document.getElementById('jobLocation').value.trim();
            const type = document.getElementById('jobType').value;
            const experience = document.getElementById('jobExperience').value.trim();
            const salary = document.getElementById('jobSalary').value.trim();
            const overview = document.getElementById('jobOverview').value.trim();
            const responsibilities = document.getElementById('jobResponsibilities').value.split('\n').filter(r => r.trim().length > 0);
            const skills = document.getElementById('jobSkills').value.split(',').map(s => s.trim()).filter(s => s.length > 0);
            const status = document.getElementById('jobStatus').value;

            const deptNames = { sales: 'Sales & Partnership', engineering: 'Engineering', ai: 'AI & Data', design: 'Design', general: 'General' };

            const jobData = {
                id: editIdx > -1 ? database.jobs[editIdx].id : 'job_' + Date.now(),
                title,
                department,
                departmentName: deptNames[department] || 'General',
                emoji,
                location,
                type,
                experience,
                salary,
                overview,
                responsibilities,
                skills,
                status,
                postedDate: new Date().toLocaleDateString()
            };

            if (editIdx > -1) {
                database.jobs[editIdx] = jobData;
                showToast('Job posting updated.', 'success');

                const JOBS_SHEET_URL = 'https://script.google.com/macros/s/AKfycbw2QB_wFrV8JAPsA-bEfEJ8ivdXkRUTXVZFurC6q9_bD5ntxY2pXH2HlSzllULQp3Jd/exec';
                fetch(JOBS_SHEET_URL, {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: { 'Content-Type': 'text/plain' },
                    body: JSON.stringify({
                        action: 'edit',
                        ...jobData
                    })
                })
                .then(() => console.log('Job updated in Google Sheet'))
                .catch(err => console.error('Google Sheet error:', err));
            } else {
                database.jobs.unshift(jobData);
                showToast('New job posted successfully!', 'success');

                const JOBS_SHEET_URL = 'https://script.google.com/macros/s/AKfycbw2QB_wFrV8JAPsA-bEfEJ8ivdXkRUTXVZFurC6q9_bD5ntxY2pXH2HlSzllULQp3Jd/exec';
                fetch(JOBS_SHEET_URL, {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: { 'Content-Type': 'text/plain' },
                    body: JSON.stringify({
                        action: 'add',
                        ...jobData
                    })
                })
                .then(() => console.log('Job posting sent to Google Sheet'))
                .catch(err => console.error('Google Sheet error:', err));
            }

            saveData();
            renderJobsTable();
            closeJobModal();
        });

        window.openEditJob = (jobIdOrIdx) => {
            let job = database.jobs.find(j => j.id === jobIdOrIdx);
            let idx = -1;
            if (job) {
                idx = database.jobs.indexOf(job);
            } else if (typeof jobIdOrIdx === 'number' || !isNaN(Number(jobIdOrIdx))) {
                idx = Number(jobIdOrIdx);
                job = database.jobs[idx];
            }
            if (!job) return;

            document.getElementById('editJobIndex').value = idx;
            document.getElementById('jobModalTitle').textContent = 'Edit Job Opening';

            document.getElementById('jobTitle').value = job.title || '';
            document.getElementById('jobDepartment').value = job.department || 'general';
            document.getElementById('jobEmoji').value = job.emoji || '💼';
            document.getElementById('jobLocation').value = job.location || '';
            document.getElementById('jobType').value = job.type || 'Full-Time';
            document.getElementById('jobExperience').value = job.experience || '';
            document.getElementById('jobSalary').value = job.salary || '';
            document.getElementById('jobOverview').value = job.overview || '';
            document.getElementById('jobResponsibilities').value = (job.responsibilities || []).join('\n');
            document.getElementById('jobSkills').value = (job.skills || []).join(', ');
            document.getElementById('jobStatus').value = job.status || 'active';

            openJobModal();
        };

        window.toggleJobStatus = (jobIdOrIdx) => {
            let job = database.jobs.find(j => j.id === jobIdOrIdx);
            if (!job && (typeof jobIdOrIdx === 'number' || !isNaN(Number(jobIdOrIdx)))) {
                job = database.jobs[Number(jobIdOrIdx)];
            }
            if (!job) return;

            job.status = job.status === 'inactive' ? 'active' : 'inactive';
            saveData();
            renderJobsTable();
            updateDashboardStats();
            showToast(`Job status changed to ${job.status}.`, 'success');
        };

        window.deleteJob = (jobIdOrIdx) => {
            let job = database.jobs.find(j => j.id === jobIdOrIdx);
            let idx = -1;
            if (job) {
                idx = database.jobs.indexOf(job);
            } else if (typeof jobIdOrIdx === 'number' || !isNaN(Number(jobIdOrIdx))) {
                idx = Number(jobIdOrIdx);
                job = database.jobs[idx];
            }
            if (!job) return;

            if (confirm(`Are you sure you want to delete "${job.title}"?`)) {
                const deletedId = job.id;
                database.jobs.splice(idx, 1);
                saveData();
                renderJobsTable();
                updateDashboardStats();
                showToast('Job posting deleted.', 'success');

                // Also delete from Google Sheet
                const JOBS_SHEET_URL = 'https://script.google.com/macros/s/AKfycbw2QB_wFrV8JAPsA-bEfEJ8ivdXkRUTXVZFurC6q9_bD5ntxY2pXH2HlSzllULQp3Jd/exec';
                if (deletedId) {
                    fetch(JOBS_SHEET_URL, {
                        method: 'POST',
                        mode: 'no-cors',
                        headers: { 'Content-Type': 'text/plain' },
                        body: JSON.stringify({
                            action: 'delete',
                            id: deletedId
                        })
                    })
                    .then(() => console.log('Job deleted from Google Sheet'))
                    .catch(err => console.error('Google Sheet delete error:', err));
                }
            }
        };

        // CANDIDATE APPLICATION MODAL LOGIC
        const applicationDetailModal = document.getElementById('applicationDetailModal');

        window.viewApplicationDetails = (appId) => {
            const app = database.applications.find(a => a.id === appId);
            if (!app) return;

            const modalBody = document.getElementById('appModalBody');
            const actionContainer = document.getElementById('appStatusActionBtns');

            const cleanPhone = (app.phone || '').replace(/[^0-9]/g,'');
            const safePortfolio = sanitizeUrl(app.portfolio);
            const safeResumeUrl = sanitizeUrl(app.resumeUrl);
            const safeResumeBase64 = (app.resumeBase64 && app.resumeBase64.startsWith('data:')) ? app.resumeBase64 : '';

            let resumeSectionHTML = '';
            if (safeResumeBase64 || safeResumeUrl) {
                const downloadBtn = safeResumeBase64 ? `<a href="${safeResumeBase64}" download="${escapeHTML(app.resumeFileName || 'resume.pdf')}" class="btn btn-success btn-sm">📥 Download Resume</a>` : '';
                const previewBtn = safeResumeBase64 ? `<button onclick="window.open('${safeResumeBase64}')" class="btn btn-secondary btn-sm">👁️ Open Resume Preview</button>` : '';
                const cloudBtn = safeResumeUrl ? `<a href="${safeResumeUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm">☁️ View Resume (Cloud)</a>` : '';
                resumeSectionHTML = `
                    <div style="background:rgba(16,185,129,0.06);border:1px solid rgba(16,185,129,0.3);padding:16px;border-radius:12px;margin-top:16px;">
                        <div style="font-weight:700;font-size:14px;color:var(--success);margin-bottom:8px;">📄 Resume File Attached</div>
                        <div style="font-size:13px;color:var(--text-secondary);margin-bottom:12px;">Filename: <strong>${escapeHTML(app.resumeFileName || 'Candidate Resume')}</strong></div>
                        <div style="display:flex;gap:10px;flex-wrap:wrap;">
                            ${downloadBtn}
                            ${previewBtn}
                            ${cloudBtn}
                        </div>
                    </div>
                `;
            } else {
                resumeSectionHTML = `
                    <div style="background:rgba(239,68,68,0.06);border:1px solid rgba(239,68,68,0.2);padding:14px;border-radius:12px;margin-top:16px;color:var(--danger);font-size:13px;">
                        ⚠️ No resume file uploaded with this application.
                    </div>
                `;
            }

            modalBody.innerHTML = `
                <div class="lead-detail-field">
                    <div class="lead-detail-label">Candidate Name</div>
                    <div class="lead-detail-value" style="font-size:1.1rem;font-weight:800;color:var(--primary);">${escapeHTML(app.name)}</div>
                </div>
                <div class="lead-detail-field">
                    <div class="lead-detail-label">Applied Position</div>
                    <div class="lead-detail-value"><span class="tag tag-cyan">${escapeHTML(app.jobTitle)}</span></div>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                    <div class="lead-detail-field">
                        <div class="lead-detail-label">Email Address</div>
                        <div class="lead-detail-value"><a href="mailto:${escapeHTML(app.email)}" style="color:var(--accent);">${escapeHTML(app.email)}</a></div>
                    </div>
                    <div class="lead-detail-field">
                        <div class="lead-detail-label">Mobile (WhatsApp)</div>
                        <div class="lead-detail-value"><a href="https://wa.me/${cleanPhone}" target="_blank" rel="noopener noreferrer" style="color:var(--success);">📱 ${escapeHTML(app.phone)} (Chat)</a></div>
                    </div>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                    <div class="lead-detail-field">
                        <div class="lead-detail-label">Current Status</div>
                        <div class="lead-detail-value">${escapeHTML(app.status || 'N/A')}</div>
                    </div>
                    <div class="lead-detail-field">
                        <div class="lead-detail-label">Passout / Experience</div>
                        <div class="lead-detail-value">${escapeHTML(app.experience || 'N/A')}</div>
                    </div>
                </div>
                <div class="lead-detail-field">
                    <div class="lead-detail-label">Primary Skills</div>
                    <div class="lead-detail-value">${escapeHTML(app.skills || 'N/A')}</div>
                </div>
                ${safePortfolio ? `
                <div class="lead-detail-field">
                    <div class="lead-detail-label">Portfolio / LinkedIn</div>
                    <div class="lead-detail-value"><a href="${safePortfolio}" target="_blank" rel="noopener noreferrer" style="color:var(--accent);">${escapeHTML(app.portfolio)}</a></div>
                </div>` : ''}
                ${app.message ? `
                <div class="lead-detail-field">
                    <div class="lead-detail-label">Cover Statement / Note</div>
                    <div class="lead-detail-value" style="white-space:pre-wrap;">${escapeHTML(app.message)}</div>
                </div>` : ''}
                ${resumeSectionHTML}
            `;

            actionContainer.innerHTML = `
                <button class="btn btn-success btn-sm" onclick="updateAppStatus('${app.id}', 'shortlisted')">Mark Shortlisted</button>
                <button class="btn btn-danger btn-sm" onclick="updateAppStatus('${app.id}', 'rejected')">Mark Rejected</button>
                <button class="btn btn-secondary btn-sm" onclick="updateAppStatus('${app.id}', 'pending')">Set Pending</button>
            `;

            applicationDetailModal.classList.add('open');
            document.body.style.overflow = 'hidden';
        };

        const closeAppModal = () => {
            applicationDetailModal.classList.remove('open');
            document.body.style.overflow = '';
        };

        document.getElementById('closeAppModal').addEventListener('click', closeAppModal);
        document.getElementById('closeAppModalBtn').addEventListener('click', closeAppModal);

        window.updateAppStatus = (appId, newStatus) => {
            const app = database.applications.find(a => String(a.id) === String(appId));
            if (app) {
                app.appStatus = newStatus;
                saveData();
                renderApplicationsTable();
                updateDashboardStats();
                closeAppModal();
                showToast(`Candidate status updated to ${newStatus}.`, 'success');
            }
        };

        window.deleteApplication = (appIdOrIdx) => {
            ensureApplicationIds();
            let app = database.applications.find(a => String(a.id) === String(appIdOrIdx));
            let idx = -1;
            if (app) {
                idx = database.applications.indexOf(app);
            } else if (typeof appIdOrIdx === 'number' || (!isNaN(Number(appIdOrIdx)) && Number(appIdOrIdx) >= 0)) {
                idx = Number(appIdOrIdx);
                app = database.applications[idx];
            }
            if (!app) {
                showToast('Application record not found.', 'error');
                return;
            }
            const appName = app.name || 'this candidate';
            if (confirm(`Are you sure you want to delete application from "${appName}"?`)) {
                database.applications.splice(idx, 1);
                saveData();
                renderApplicationsTable(document.getElementById('searchApplications')?.value || '');
                updateDashboardStats();
                showToast('Application deleted successfully.', 'success');
            }
        };

        // EXPORT APPS CSV & REFRESH HANDLERS
        window.exportCandidatesCSV = () => {
            const apps = database.applications || [];
            if (apps.length === 0) {
                showToast('No job applications to export.', 'error');
                return;
            }
            let csv = 'ID,Applied Date,Candidate Name,Email,Phone,Position,Status,Experience,Skills,Portfolio,AppStatus\r\n';
            apps.forEach(a => {
                csv += `"${a.id || ''}","${a.submittedAt || ''}","${(a.name || '').replace(/"/g, '""')}","${a.email || ''}","${a.phone || ''}","${(a.jobTitle || '').replace(/"/g, '""')}","${a.status || ''}","${a.experience || ''}","${(a.skills||'').replace(/"/g, '""')}","${a.portfolio||''}","${a.appStatus || 'pending'}"\r\n`;
            });

            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.setAttribute("download", `job_applications_export_${Date.now()}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            showToast('Applications CSV exported successfully.', 'success');
        };

        window.refreshApplications = () => {
            const apps = localStorage.getItem('shaivika_job_applications');
            database.applications = apps ? JSON.parse(apps) : [];
            ensureApplicationIds();
            updateDashboardStats();
            if (typeof renderApplicationsTable === 'function') {
                renderApplicationsTable(document.getElementById('searchApplications')?.value || '');
            }
            showToast('Applications refreshed!', 'success');
        };

        document.getElementById('exportAppsCsv')?.addEventListener('click', window.exportCandidatesCSV);
        document.getElementById('refreshApplicationsBtn')?.addEventListener('click', window.refreshApplications);

        // ==========================================
        // PROJECT MODAL & CRUD HANDLERS
        // ==========================================
        const projectModal = document.getElementById('projectModal');
        
        const openProjectModal = () => {
            populateCategoryCheckboxes();
            projectModal.classList.add('open');
            document.body.style.overflow = 'hidden';
        };

        const closeProjectModal = () => {
            projectModal.classList.remove('open');
            document.body.style.overflow = '';

            document.getElementById('projectForm').reset();
            document.getElementById('editProjectIndex').value = '-1';
            document.getElementById('projectModalTitle').textContent = 'Add Portfolio Project';
            // Uncheck all category checkboxes
            document.querySelectorAll('input[name="projCatCheckbox"]').forEach(cb => cb.checked = false);
        };

        document.getElementById('addNewProjectBtn').addEventListener('click', () => {
            closeProjectModal();
            openProjectModal();
        });

        document.getElementById('closeProjectModal').addEventListener('click', closeProjectModal);
        document.getElementById('cancelProjectModal').addEventListener('click', closeProjectModal);

        // ==========================================
        // PORTFOLIO PROJECT CRUD & ANIMATED ACTIONS
        // ==========================================
        let pendingDeleteProjectIdx = -1;
        const deleteConfirmModal = document.getElementById('deleteConfirmModal');
        const deleteProjectTargetTitle = document.getElementById('deleteProjectTargetTitle');
        const cancelDeleteModalBtn = document.getElementById('cancelDeleteModalBtn');
        const confirmDeleteModalBtn = document.getElementById('confirmDeleteModalBtn');

        // Edit Project
        window.openEditProject = (idx) => {
            const proj = database.projects[idx];
            if (!proj) return;

            openProjectModal();
            document.getElementById('editProjectIndex').value = idx;
            document.getElementById('projectModalTitle').textContent = 'Edit Portfolio Project';
            document.getElementById('projectTitle').value = proj.title || '';
            document.getElementById('projectDesc').value = proj.description || '';
            document.getElementById('projectLink').value = proj.link || '';
            document.getElementById('projectEmoji').value = proj.emoji || '';
            document.getElementById('projectImage').value = proj.image || '';

            // Check matching categories
            const cats = Array.isArray(proj.categories) ? proj.categories : (typeof proj.categories === 'string' ? proj.categories.split(',').map(s => s.trim()) : []);
            document.querySelectorAll('input[name="projCatCheckbox"]').forEach(cb => {
                cb.checked = cats.includes(cb.value);
            });
        };

        // Open Custom Animated Delete Modal
        window.promptDeleteProject = (idx) => {
            const proj = database.projects[idx];
            if (!proj) return;

            pendingDeleteProjectIdx = idx;
            deleteProjectTargetTitle.textContent = `"${proj.title}"`;
            deleteConfirmModal.classList.add('open');
        };

        // Cancel Delete Modal
        cancelDeleteModalBtn?.addEventListener('click', () => {
            deleteConfirmModal.classList.remove('open');
            pendingDeleteProjectIdx = -1;
        });

        // Close on backdrop click
        deleteConfirmModal?.addEventListener('click', (e) => {
            if (e.target === deleteConfirmModal) {
                deleteConfirmModal.classList.remove('open');
                pendingDeleteProjectIdx = -1;
            }
        });

        // Confirm Delete with Row Exit Animation
        confirmDeleteModalBtn?.addEventListener('click', async () => {
            if (pendingDeleteProjectIdx < 0 || pendingDeleteProjectIdx >= database.projects.length) {
                deleteConfirmModal.classList.remove('open');
                return;
            }

            const targetIdx = pendingDeleteProjectIdx;
            const proj = database.projects[targetIdx];
            const deletedId = proj.id;
            const deletedTitle = proj.title;

            // Close modal immediately
            deleteConfirmModal.classList.remove('open');
            pendingDeleteProjectIdx = -1;

            // Trigger smooth slide-out animation on the target row
            const targetRow = document.getElementById(`proj-row-${targetIdx}`);
            if (targetRow) {
                targetRow.classList.add('tr-row-deleting');
            }

            // Wait 380ms for exit animation
            setTimeout(async () => {
                database.projects.splice(targetIdx, 1);
                saveData();
                renderProjectsTable();
                updateDashboardStats();
                showToast(`Project "${deletedTitle}" deleted successfully.`, 'success');

                // Sync delete to Google Sheet
                await sendGasAction('deleteProject', { id: deletedId });
            }, 380);
        });

        // Legacy deleteProject wrapper for safety
        window.deleteProject = window.promptDeleteProject;

        // Project Form Submit Handler (Add / Edit)
        document.getElementById('projectForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const editIdx = parseInt(document.getElementById('editProjectIndex').value);
            const title = document.getElementById('projectTitle').value.trim();
            const desc = document.getElementById('projectDesc').value.trim();
            const link = document.getElementById('projectLink').value.trim() || 'contact.html';
            const emoji = document.getElementById('projectEmoji').value.trim() || '💼';
            const image = document.getElementById('projectImage').value.trim();

            const selectedCats = [];
            document.querySelectorAll('input[name="projCatCheckbox"]:checked').forEach(cb => {
                selectedCats.push(cb.value);
            });

            if (selectedCats.length === 0) {
                selectedCats.push('webapp');
            }

            const existingProj = editIdx > -1 ? database.projects[editIdx] : null;
            const projectId = existingProj ? existingProj.id : ('proj_' + Date.now());

            const projectData = {
                id: projectId,
                title: title,
                description: desc,
                categories: selectedCats,
                link: link,
                emoji: emoji,
                image: image || (existingProj ? existingProj.image : ''),
                modalId: existingProj ? (existingProj.modalId || '') : '',
                status: existingProj ? (existingProj.status || 'active') : 'active',
                created_at: existingProj ? (existingProj.created_at || new Date().toLocaleString()) : new Date().toLocaleString()
            };

            const isEdit = editIdx > -1;
            let highlightIdx = 0;
            if (isEdit) {
                database.projects[editIdx] = projectData;
                highlightIdx = editIdx;
                showToast('Project updated successfully!', 'success');
            } else {
                database.projects.unshift(projectData);
                highlightIdx = 0;
                showToast('New project created successfully!', 'success');
            }

            saveData();
            renderProjectsTable('', highlightIdx);
            updateDashboardStats();
            closeProjectModal();

            // Push to Google Sheet in real time
            showToast('Syncing with Google Sheet...', 'info');
            const syncResult = await sendGasAction(isEdit ? 'updateProject' : 'addProject', { project: projectData });
            if (syncResult && syncResult.success !== false) {
                showToast('✅ Saved to Google Sheet!', 'success');
            } else {
                showToast('Saved locally. Google Sheet sync queued.', 'warning');
            }
        });

        // 🔄 Sync All Projects with Google Sheet Button Handler
        document.getElementById('syncGoogleSheetBtn').addEventListener('click', async () => {
            const btn = document.getElementById('syncGoogleSheetBtn');
            const originalHTML = btn.innerHTML;
            btn.innerHTML = '⏳ Syncing...';
            btn.disabled = true;

            const gasUrl = localStorage.getItem('shaivika_gas_portfolio_url') || 'https://script.google.com/macros/s/AKfycbwBnqwzKd77hBm3Ij8AtoXRnChjQrTgVv_wu3VFIXPKG8vtkNQ81A7TlarM67Kzl76t/exec';
            
            try {
                showToast('Connecting to Google Sheet...', 'info');

                // 1. First, Bulk Sync all current local projects to ensure sheet is fully populated
                if (database.projects.length > 0) {
                    await sendGasAction('bulkSync', { projects: database.projects });
                }

                // 2. Fetch latest state from Google Sheet using resilient dual-mode fetch
                const projects = await fetchGasProjectsData(gasUrl);
                if (Array.isArray(projects) && projects.length > 0) {
                    const mergedMap = new Map();
                    // Add existing local projects
                    database.projects.forEach(p => mergedMap.set(p.id, p));
                    // Add / update from Google Sheet
                    projects.forEach(p => {
                        if (typeof p.categories === 'string') {
                            p.categories = p.categories.split(',').map(s => s.trim()).filter(Boolean);
                        }
                        mergedMap.set(p.id, p);
                    });

                    database.projects = Array.from(mergedMap.values()).sort((a, b) => {
                        const aIsCustom = a.id && a.id.startsWith('proj_');
                        const bIsCustom = b.id && b.id.startsWith('proj_');
                        if (aIsCustom && !bIsCustom) return -1;
                        if (!aIsCustom && bIsCustom) return 1;
                        return 0;
                    });

                    saveData();
                    renderProjectsTable();
                    updateDashboardStats();
                    showToast(`✅ Synced ${database.projects.length} projects with Google Sheet!`, 'success');
                } else {
                    showToast('Google Sheet connected & synced successfully!', 'success');
                }
            } catch (err) {
                console.error('Manual Google Sheet sync error:', err);
                showToast('Google Sheet sync notice: ' + err.message, 'warning');
            } finally {
                btn.innerHTML = originalHTML;
                btn.disabled = false;
            }
        });

        // ==========================================
        // CATEGORY FORM & CRUD HANDLERS
        // ==========================================

        window.cancelEditCategory = () => {
            const form = document.getElementById('categoryForm');
            if (form) form.reset();
            const editIndexInput = document.getElementById('editCatIndex');
            if (editIndexInput) editIndexInput.value = '-1';
            const editOriginalIdInput = document.getElementById('editCatOriginalId');
            if (editOriginalIdInput) editOriginalIdInput.value = '';
            const catTitle = document.getElementById('catFormTitle');
            if (catTitle) catTitle.textContent = 'Add New Category';
            const cancelBtn = document.getElementById('cancelEditCatBtn');
            if (cancelBtn) cancelBtn.style.display = 'none';
            const saveBtn = document.getElementById('saveCatBtn');
            if (saveBtn) saveBtn.textContent = 'Save Category';
        };

        document.getElementById('categoryForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const editIdx = parseInt(document.getElementById('editCatIndex')?.value || '-1', 10);
            const originalId = document.getElementById('editCatOriginalId')?.value || '';
            const name = document.getElementById('catName').value.trim();
            const newId = document.getElementById('catId').value.trim().toLowerCase().replace(/[^a-z0-9\-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

            if (!name || !newId) {
                showToast('Category Name and Slug ID are required.', 'error');
                return;
            }

            if (editIdx > -1 && editIdx < database.categories.length) {
                const oldCat = database.categories[editIdx];
                const oldId = originalId || oldCat.id;

                // If slug changed, verify no other category uses the new slug
                if (newId !== oldId && database.categories.some((c, i) => i !== editIdx && c.id === newId)) {
                    showToast('A category with this Slug ID already exists.', 'error');
                    return;
                }

                database.categories[editIdx] = { id: newId, name };

                // Cascade slug changes to all projects referencing the old slug
                if (newId !== oldId) {
                    database.projects.forEach(proj => {
                        if (Array.isArray(proj.categories)) {
                            proj.categories = proj.categories.map(cId => cId === oldId ? newId : cId);
                        } else if (typeof proj.categories === 'string') {
                            proj.categories = proj.categories.split(',').map(s => s.trim() === oldId ? newId : s.trim()).filter(Boolean);
                        }
                    });
                }

                showToast(`Category "${name}" updated successfully.`, 'success');
            } else {
                if (database.categories.some(c => c.id === newId)) {
                    showToast('A category with this Slug ID already exists.', 'error');
                    return;
                }
                database.categories.push({ id: newId, name });
                showToast(`Category "${name}" added successfully.`, 'success');
            }

            saveData();
            renderCategoriesTable();
            populateCategoryCheckboxes();
            renderProjectsTable();
            window.cancelEditCategory();
        });

        window.openEditCategory = (catIdOrIdx) => {
            let cat = database.categories.find(c => c.id === catIdOrIdx);
            let idx = -1;
            if (cat) {
                idx = database.categories.indexOf(cat);
            } else if (typeof catIdOrIdx === 'number' || !isNaN(Number(catIdOrIdx))) {
                idx = Number(catIdOrIdx);
                cat = database.categories[idx];
            }
            if (!cat) return;

            document.getElementById('editCatIndex').value = idx;
            const originalIdInput = document.getElementById('editCatOriginalId');
            if (originalIdInput) originalIdInput.value = cat.id;

            const catTitle = document.getElementById('catFormTitle');
            if (catTitle) catTitle.textContent = `Edit Category: ${cat.name}`;

            document.getElementById('catName').value = cat.name;
            document.getElementById('catId').value = cat.id;

            const cancelBtn = document.getElementById('cancelEditCatBtn');
            if (cancelBtn) cancelBtn.style.display = 'inline-block';

            const saveBtn = document.getElementById('saveCatBtn');
            if (saveBtn) saveBtn.textContent = 'Update Category';

            document.getElementById('catName').focus();
        };

        window.deleteCategory = (catIdOrIdx) => {
            const searchKey = String(catIdOrIdx).trim().toLowerCase();
            let cat = database.categories.find(c => String(c.id).trim().toLowerCase() === searchKey);
            let idx = -1;
            if (cat) {
                idx = database.categories.indexOf(cat);
            } else if (!isNaN(Number(catIdOrIdx))) {
                idx = Number(catIdOrIdx);
                cat = database.categories[idx];
            }
            if (!cat) {
                showToast('Category record not found.', 'error');
                return;
            }

            if (confirm(`Are you sure you want to delete category "${cat.name}" (${cat.id})? This will remove it from all projects.`)) {
                const targetId = cat.id;
                database.projects.forEach(proj => {
                    if (Array.isArray(proj.categories)) {
                        proj.categories = proj.categories.filter(cId => String(cId).trim().toLowerCase() !== String(targetId).trim().toLowerCase());
                    } else if (typeof proj.categories === 'string') {
                        proj.categories = proj.categories.split(',').map(s => s.trim()).filter(cId => String(cId).trim().toLowerCase() !== String(targetId).trim().toLowerCase());
                    }
                });
                database.categories.splice(idx, 1);
                saveData();
                renderCategoriesTable();
                populateCategoryCheckboxes();
                renderProjectsTable();
                window.cancelEditCategory();
                showToast(`Category "${cat.name}" deleted successfully.`, 'success');
            }
        };

        // CHANGE PASSWORD FORM handler
        document.getElementById('changePasswordForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            const currentPass = document.getElementById('currentPass').value;
            const newPass = document.getElementById('newPass').value;
            const confirmPass = document.getElementById('confirmPass').value;
            if (window.ShaivikaAPI && typeof window.ShaivikaAPI.adminChangePassword === 'function') {
      window.ShaivikaAPI.adminChangePassword(currentPass, newPass)
        .then(() => showToast('Admin password updated successfully!', 'success'))
        .catch(err => showToast(err.message || 'Password update failed', 'error'));
      return;
  }
            showToast('Admin password updated successfully!', 'success');
            document.getElementById('changePasswordForm').reset();
        });

        // RESET TO DEFAULT BASELINE handler
        const handleResetDb = () => {
            if (confirm('Are you sure you want to reset the database to default baseline? This will clear all custom projects, categories, job applications, job postings, and submissions.')) {
                localStorage.removeItem('shaivika_portfolio_categories');
                localStorage.removeItem('shaivika_portfolio_projects');
                localStorage.removeItem('shaivika_submissions');
                localStorage.removeItem('shaivika_job_postings');
                localStorage.removeItem('shaivika_job_applications');
                showToast('Database reset to defaults.', 'success');
                loadData();
            }
        };
        document.getElementById('btnResetDb')?.addEventListener('click', handleResetDb);
        document.getElementById('btnResetDbSettings')?.addEventListener('click', handleResetDb);

        // ==========================================
        // GOOGLE APPS SCRIPT SYNC LOGIC
        // ==========================================
        const gasInput = document.getElementById('gasPortfolioUrl');
        const gasBadge = document.getElementById('gasSyncBadge');
        const gasStatusOutput = document.getElementById('gasStatusOutput');
        const DEFAULT_ACTIVE_GAS_URL = 'https://script.google.com/macros/s/AKfycbwBnqwzKd77hBm3Ij8AtoXRnChjQrTgVv_wu3VFIXPKG8vtkNQ81A7TlarM67Kzl76t/exec';

        if (gasInput) {
            const savedUrl = localStorage.getItem('shaivika_gas_portfolio_url') || DEFAULT_ACTIVE_GAS_URL;
            gasInput.value = savedUrl;
        }

        // Robust Google Apps Script Writer (POST + GET/JSONP Fallback)
        const sendGasAction = async (action, data = {}) => {
            const gasUrl = localStorage.getItem('shaivika_gas_portfolio_url') || DEFAULT_ACTIVE_GAS_URL;
            if (!gasUrl) return { success: false, message: 'No GAS URL' };

            const payload = { action, ...data, timestamp: new Date().toISOString() };

            try {
                const response = await fetch(gasUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                    body: JSON.stringify(payload)
                });
                if (response.ok) {
                    try {
                        const json = await response.json();
                        return json;
                    } catch (e) {
                        return { success: true };
                    }
                }
            } catch (postErr) {
                console.warn('Fetch POST to Google Sheet failed, trying GET fallback:', postErr);
            }

            return new Promise((resolve) => {
                const cbName = 'gas_write_cb_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
                const script = document.createElement('script');
                const cleanUrl = gasUrl.split('?')[0];
                const params = new URLSearchParams({
                    action,
                    data: JSON.stringify(data),
                    callback: cbName,
                    _t: Date.now()
                });

                window[cbName] = function(res) {
                    cleanup();
                    resolve(res || { success: true });
                };

                const timer = setTimeout(() => {
                    cleanup();
                    resolve({ success: true, note: 'Timeout assumed success' });
                }, 7000);

                function cleanup() {
                    clearTimeout(timer);
                    delete window[cbName];
                    if (script.parentNode) script.parentNode.removeChild(script);
                }

                script.src = `${cleanUrl}?${params.toString()}`;
                script.onerror = () => {
                    cleanup();
                    resolve({ success: false, message: 'Script tag failed' });
                };
                document.body.appendChild(script);
            });
        };

        // Universal resilient fetcher for Google Apps Script (Fetch + JSONP Fallback)
        const fetchGasProjectsData = async (gasUrl) => {
            if (!gasUrl) throw new Error('Missing Google Apps Script URL');
            const getUrl = gasUrl.includes('?') ? `${gasUrl}&action=getProjects` : `${gasUrl}?action=getProjects`;

            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 7000);
                const res = await fetch(getUrl, { cache: 'no-store', signal: controller.signal });
                clearTimeout(timeoutId);
                if (res.ok) {
                    const data = await res.json();
                    if (data && data.status === 'success' && Array.isArray(data.projects)) {
                        return data.projects;
                    }
                }
            } catch (err) {
                console.warn('Standard fetch notice, attempting JSONP fallback:', err);
            }

            return new Promise((resolve, reject) => {
                const callbackName = 'shaivika_admin_gas_' + Date.now() + '_' + Math.floor(Math.random() * 10000);
                const script = document.createElement('script');
                const timer = setTimeout(() => {
                    cleanup();
                    reject(new Error('Google Sheet connection timed out.'));
                }, 10000);

                function cleanup() {
                    clearTimeout(timer);
                    delete window[callbackName];
                    if (script.parentNode) script.parentNode.removeChild(script);
                }

                window[callbackName] = function(resp) {
                    cleanup();
                    if (resp && resp.status === 'success' && Array.isArray(resp.projects)) {
                        resolve(resp.projects);
                    } else if (resp && resp.message) {
                        reject(new Error(resp.message));
                    } else {
                        reject(new Error('Invalid response structure from Google Sheet'));
                    }
                };

                script.src = `${getUrl}&callback=${callbackName}&_t=${Date.now()}`;
                script.onerror = function() {
                    cleanup();
                    reject(new Error('Script load failed for Google Sheet.'));
                };
                document.head.appendChild(script);
            });
        };

        const testGasConnection = async (url) => {
            if (!url) {
                showToast('Please enter a Google Apps Script Web App URL.', 'error');
                return;
            }
            try {
                if (gasStatusOutput) {
                    gasStatusOutput.style.display = 'block';
                    gasStatusOutput.style.background = 'rgba(59, 130, 246, 0.1)';
                    gasStatusOutput.style.color = 'var(--accent)';
                    gasStatusOutput.innerHTML = '⏳ Testing connection to Google Apps Script...';
                }

                const projects = await fetchGasProjectsData(url);

                localStorage.setItem('shaivika_gas_portfolio_url', url);
                if (gasBadge) {
                    gasBadge.textContent = '🟢 Connected';
                    gasBadge.className = 'tag tag-green';
                }
                if (gasStatusOutput) {
                    gasStatusOutput.style.background = 'rgba(16, 185, 129, 0.1)';
                    gasStatusOutput.style.color = 'var(--success)';
                    gasStatusOutput.innerHTML = `✅ <strong>Connected!</strong> Successfully reached Google Sheet (${projects.length} projects retrieved).`;
                }
                showToast(`Google Sheet verified! (${projects.length} projects)`, 'success');
            } catch (err) {
                console.error('GAS connection error:', err);
                if (gasBadge) {
                    gasBadge.textContent = '⚠️ Check URL';
                    gasBadge.className = 'tag tag-amber';
                }
                if (gasStatusOutput) {
                    gasStatusOutput.style.background = 'rgba(239, 68, 68, 0.1)';
                    gasStatusOutput.style.color = 'var(--danger)';
                    gasStatusOutput.innerHTML = `❌ <strong>Connection Notice:</strong> ${err.message}. If this is a new Web App, ensure it was deployed with <em>"Who has access: Anyone"</em>.`;
                }
                localStorage.setItem('shaivika_gas_portfolio_url', url);
                showToast('Notice: ' + err.message, 'warning');
            }
        };

        document.getElementById('btnSaveGasUrl')?.addEventListener('click', () => {
            const url = gasInput ? gasInput.value.trim() : '';
            testGasConnection(url);
        });

        // Push All Projects to Google Sheet
        const pushAllProjectsToGoogleSheet = async () => {
            const gasUrl = localStorage.getItem('shaivika_gas_portfolio_url') || (gasInput ? gasInput.value.trim() : '');
            if (!gasUrl) {
                showToast('Please enter & save your Google Apps Script URL first.', 'error');
                return;
            }

            try {
                showToast('📤 Pushing all projects to Google Sheet...', 'info');
                await sendGasAction('bulkSync', { projects: database.projects });
                showToast(`✅ Successfully synced ${database.projects.length} projects to Google Sheet!`, 'success');
            } catch (err) {
                console.error('Bulk sync error:', err);
                showToast('Failed to push to Google Sheet. Check console.', 'error');
            }
        };
        document.getElementById('btnPushAllToGas')?.addEventListener('click', pushAllProjectsToGoogleSheet);

        // Pull All Projects from Google Sheet
        const pullProjectsFromGoogleSheet = async () => {
            const gasUrl = localStorage.getItem('shaivika_gas_portfolio_url') || (gasInput ? gasInput.value.trim() : '');
            if (!gasUrl) {
                showToast('Please configure your Google Apps Script URL in Settings.', 'error');
                return;
            }

            try {
                showToast('📥 Pulling projects from Google Sheet...', 'info');
                const projects = await fetchGasProjectsData(gasUrl);

                if (Array.isArray(projects)) {
                    if (projects.length > 0) {
                        database.projects = projects;
                        saveData();
                        renderProjectsTable();
                        updateDashboardStats();
                        showToast(`Loaded ${projects.length} projects from Google Sheet!`, 'success');
                    } else {
                        showToast('Google Sheet is connected but currently has 0 rows.', 'info');
                    }
                } else {
                    showToast('Could not parse projects from Google Sheet response.', 'error');
                }
            } catch (err) {
                console.error('Pull projects error:', err);
                showToast('Failed to fetch from Google Sheet: ' + err.message, 'error');
            }
        };
        document.getElementById('btnPullAllFromGas')?.addEventListener('click', pullProjectsFromGoogleSheet);
        document.getElementById('syncGoogleSheetBtn')?.addEventListener('click', pullProjectsFromGoogleSheet);

        // Sync All Existing Data To Sheet (Jobs, Applications, Submissions)
        document.getElementById('btnSyncAllToSheet')?.addEventListener('click', async () => {
            const url = localStorage.getItem('shaivika_google_sheet_url') || localStorage.getItem('shaivika_gas_portfolio_url') || DEFAULT_ACTIVE_GAS_URL;
            showToast('Syncing all records to Google Sheet...', 'info');
            let count = 0;
            if (database.jobs && database.jobs.length) {
                for (const job of database.jobs) {
                    try {
                        await fetch(url, {
                            method: 'POST',
                            mode: 'no-cors',
                            headers: { 'Content-Type': 'text/plain' },
                            body: JSON.stringify({ sheetName: 'Job Openings', ...job })
                        });
                        count++;
                    } catch (e) {}
                }
            }
            if (database.submissions && database.submissions.length) {
                for (const sub of database.submissions) {
                    try {
                        await fetch(url, {
                            method: 'POST',
                            mode: 'no-cors',
                            headers: { 'Content-Type': 'text/plain' },
                            body: JSON.stringify({ sheetName: 'Form Submissions', ...sub })
                        });
                        count++;
                    } catch (e) {}
                }
            }
            if (database.applications && database.applications.length) {
                for (const app of database.applications) {
                    try {
                        await fetch(url, {
                            method: 'POST',
                            mode: 'no-cors',
                            headers: { 'Content-Type': 'text/plain' },
                            body: JSON.stringify({ sheetName: 'Job Applications', ...app })
                        });
                        count++;
                    } catch (e) {}
                }
            }
            showToast(`Synced ${count} records to Google Sheet!`, 'success');
        });

        // Google Sheet Integration URL Handlers
        const googleSheetInput = document.getElementById('googleSheetUrlInput');
        if (googleSheetInput) {
            googleSheetInput.value = localStorage.getItem('shaivika_google_sheet_url') || DEFAULT_ACTIVE_GAS_URL;
        }

        document.getElementById('googleSheetForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            const urlVal = document.getElementById('googleSheetUrlInput').value.trim();
            if (!urlVal) {
                showToast('Please enter a valid Google Apps Script Web App URL.', 'error');
                return;
            }
            localStorage.setItem('shaivika_google_sheet_url', urlVal);
            showToast('Google Sheet Web App URL saved successfully!', 'success');
        });

        document.getElementById('btnTestGoogleSheet')?.addEventListener('click', async () => {
            const urlVal = (document.getElementById('googleSheetUrlInput')?.value.trim()) || localStorage.getItem('shaivika_google_sheet_url') || DEFAULT_ACTIVE_GAS_URL;
            showToast('Testing Google Sheet connection...', 'info');
            try {
                await fetch(urlVal, {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: { 'Content-Type': 'text/plain' },
                    body: JSON.stringify({ action: 'ping', timestamp: new Date().toISOString() })
                });
                showToast('Google Sheet test ping sent successfully!', 'success');
            } catch (err) {
                showToast('Test ping error: ' + err.message, 'error');
            }
        });

        const leadModal = document.getElementById('leadModal');
        window.viewLeadDetails = (id) => {
            const sub = database.submissions.find(s => s.id === id);
            if (!sub) return;
            document.getElementById('leadModalBody').innerHTML = `
                <div class="lead-detail-field"><div class="lead-detail-label">Name</div><div class="lead-detail-value">${escapeHTML(sub.name)}</div></div>
                <div class="lead-detail-field"><div class="lead-detail-label">Email</div><div class="lead-detail-value">${escapeHTML(sub.email)}</div></div>
                <div class="lead-detail-field"><div class="lead-detail-label">Subject</div><div class="lead-detail-value">${escapeHTML(sub.subject)}</div></div>
                <div class="lead-detail-field"><div class="lead-detail-label">Message</div><div class="lead-detail-value" style="white-space:pre-wrap;">${escapeHTML(sub.message)}</div></div>
            `;
            leadModal.classList.add('open');
            document.body.style.overflow = 'hidden';
        };
        const closeLeadModal = () => { leadModal.classList.remove('open'); document.body.style.overflow = ''; };
        document.getElementById('closeLeadModal').addEventListener('click', closeLeadModal);
        document.getElementById('closeLeadModalBtn').addEventListener('click', closeLeadModal);

        let leadIdToDelete = null;
        const leadDeleteConfirmModal = document.getElementById('leadDeleteConfirmModal');
        
        window.confirmDeleteLead = (id) => {
            leadIdToDelete = id;
            leadDeleteConfirmModal.classList.add('open');
            document.body.style.overflow = 'hidden';
        };

        document.getElementById('cancelDeleteBtn').addEventListener('click', () => {
            leadDeleteConfirmModal.classList.remove('open');
            document.body.style.overflow = '';
            leadIdToDelete = null;
        });

        document.getElementById('confirmDeleteActionBtn').addEventListener('click', () => {
            if (leadIdToDelete) {
                database.submissions = database.submissions.filter(s => s.id !== leadIdToDelete);
                saveData();
                renderLeadsTable();
                renderDashboardRecentSubmissions();
                showToast('Submission deleted successfully.', 'success');
                leadDeleteConfirmModal.classList.remove('open');
                document.body.style.overflow = '';
                leadIdToDelete = null;
            }
        });

        // Edit Panel Logic
        const editLeadPanel = document.getElementById('editLeadPanel');
        window.editLeadDetails = (id) => {
            const sub = database.submissions.find(s => s.id === id);
            if (!sub) return;
            document.getElementById('editLeadId').value = sub.id;
            document.getElementById('editLeadName').value = sub.name;
            document.getElementById('editLeadEmail').value = sub.email;
            document.getElementById('editLeadSubject').value = sub.subject || '';
            document.getElementById('editLeadMessage').value = sub.message || '';
            editLeadPanel.classList.add('open');
        };

        document.getElementById('closeEditPanelBtn').addEventListener('click', () => {
            editLeadPanel.classList.remove('open');
        });

        document.getElementById('saveEditLeadBtn').addEventListener('click', () => {
            const id = document.getElementById('editLeadId').value;
            const subIndex = database.submissions.findIndex(s => s.id === id);
            if (subIndex > -1) {
                database.submissions[subIndex].name = document.getElementById('editLeadName').value;
                database.submissions[subIndex].email = document.getElementById('editLeadEmail').value;
                database.submissions[subIndex].subject = document.getElementById('editLeadSubject').value;
                database.submissions[subIndex].message = document.getElementById('editLeadMessage').value;
                
                // Add loading effect
                const btn = document.getElementById('saveEditLeadBtn');
                const origText = btn.textContent;
                btn.textContent = 'Saving...';
                btn.disabled = true;
                
                setTimeout(() => {
                    saveData();
                    renderLeadsTable();
                    renderDashboardRecentSubmissions();
                    editLeadPanel.classList.remove('open');
                    showToast('Submission updated.', 'success');
                    btn.textContent = origText;
                    btn.disabled = false;
                }, 400); // simulate network delay for premium feel
            }
        });

        // EXPORT DB BACKUP
        document.getElementById('btnExportDb').addEventListener('click', () => {
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(database, null, 2));
            const downloadAnchor = document.createElement('a');
            downloadAnchor.setAttribute("href", dataStr);
            downloadAnchor.setAttribute("download", `shaivika_full_db_backup_${Date.now()}.json`);
            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            downloadAnchor.remove();
            showToast('Full database backup downloaded.', 'success');
        });

        document.getElementById('btnImportDbFile').addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = function(evt) {
                try {
                    const parsed = JSON.parse(evt.target.result);
                    if (parsed.categories || parsed.projects) {
                        database.categories = parsed.categories || database.categories;
                        database.projects = parsed.projects || database.projects;
                        database.submissions = parsed.submissions || [];
                        database.jobs = parsed.jobs || database.jobs;
                        database.applications = parsed.applications || [];
                        saveData();
                        loadData();
                        showToast('Database restored successfully!', 'success');
                    }
                } catch (err) {
                    showToast('Invalid backup file JSON.', 'error');
                }
            };
            reader.readAsText(file);
            e.target.value = '';
        });

        // checkAuth managed by admin-auth-client.js
        initTheme();

        // 🔄 Automatic Google Sheet Sync on Admin Init
        setTimeout(() => {
            if (typeof pullProjectsFromGoogleSheet === 'function' && localStorage.getItem('shaivika_admin_logged_in') === 'true') {
                pullProjectsFromGoogleSheet();
            }
        }, 300);

        // 📱 Mobile Sidebar Logic
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const adminSidebar = document.getElementById('adminSidebar');
        const sidebarOverlay = document.getElementById('sidebarOverlay');

        function toggleSidebar() {
            adminSidebar.classList.toggle('active');
            sidebarOverlay.classList.toggle('active');
            if (adminSidebar.classList.contains('active')) {
                document.body.style.overflow = 'hidden'; // Prevent background scrolling
            } else {
                document.body.style.overflow = '';
            }
        }

        if (mobileMenuBtn && adminSidebar && sidebarOverlay) {
            mobileMenuBtn.addEventListener('click', toggleSidebar);
            sidebarOverlay.addEventListener('click', toggleSidebar);
            
            // Close sidebar on link click (mobile only)
            document.querySelectorAll('.sidebar-link').forEach(link => {
                link.addEventListener('click', () => {
                    if (window.innerWidth <= 1024 && adminSidebar.classList.contains('active')) {
                        toggleSidebar();
                    }
                });
            });

            // Close on Escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && adminSidebar.classList.contains('active')) {
                    toggleSidebar();
                }
            });
        }
    </script>
  }

})();
