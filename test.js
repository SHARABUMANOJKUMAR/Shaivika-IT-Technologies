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

        if (!localStorage.getItem('shaivika_admin_password') || localStorage.getItem('shaivika_admin_password') === 'adminpassword123') {
            localStorage.setItem('shaivika_admin_password', 'googlemanoj');
        }

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
            const user = document.getElementById('username').value.trim();
            const pass = document.getElementById('password').value.trim();
            const storedPass = localStorage.getItem('shaivika_admin_password');

            if (user === 'shaivika' && pass === storedPass) {
                localStorage.setItem('shaivika_admin_logged_in', 'true');
                showToast('Login successful!', 'success');
                checkAuth();
            } else {
                showToast('Invalid credentials.', 'error');
            }
        });

        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('shaivika_admin_logged_in');
            showToast('Logged out successfully.', 'success');
            checkAuth();
        });

        sidebarLinks.forEach(link => {
            link.addEventListener('click', () => {
                const targetTab = link.dataset.tab;
                sidebarLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
                tabContents.forEach(tc => tc.classList.remove('active'));
                document.getElementById(targetTab).classList.add('active');
                contentTitle.textContent = link.textContent.trim().replace(/^[\p{Emoji}\s]+/u, '');
                currentActiveTab = targetTab;
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

            toastMsg.textContent = msg;
            toastBox.classList.add('show');
            if (window._toastTimeout) clearTimeout(window._toastTimeout);
            window._toastTimeout = setTimeout(() => toastBox.classList.remove('show'), 3500);
        };

        const loadData = async () => {
            try {
                // Categories
                let cats = localStorage.getItem('shaivika_portfolio_categories');
                if (cats) {
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

                // Projects
                let projs = localStorage.getItem('shaivika_portfolio_projects');
                if (projs) {
                    database.projects = JSON.parse(projs);
                } else {
                    const fallback = await fetch('../data/portfolio.json');
                    if (fallback.ok) {
                        const data = await fallback.json();
                        database.projects = data.projects;
                    }
                    localStorage.setItem('shaivika_portfolio_projects', JSON.stringify(database.projects));
                }

                // Submissions
                try {
                    let subs = localStorage.getItem('shaivika_submissions');
                    database.submissions = subs ? JSON.parse(subs) : [];
                    // Ensure newest first
                    database.submissions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                } catch(e) {
                    console.error("Failed to load submissions", e);
                    database.submissions = [];
                }

                // Jobs
                let jbs = localStorage.getItem('shaivika_job_postings');
                database.jobs = jbs ? JSON.parse(jbs) : [];

                // Applications (Fetch from Google Apps Script)
                const appsGasUrl = 'https://script.google.com/macros/s/AKfycbzmRvImPbmXCG_Y0jKWkq6LZP1JyPWN3tfQlSl6br0-70fr0JTH93ro9JMD46xPSzZ2/exec';
                try {
                    const response = await fetch(appsGasUrl);
                    if (response.ok) {
                        const gasApps = await response.json();
                        database.applications = Array.isArray(gasApps) ? gasApps : [];
                        // Ensure newest first (Google sheets appends at the bottom)
                        database.applications.reverse();
                    } else {
                        // Fallback to local
                        let apps = localStorage.getItem('shaivika_job_applications');
                        database.applications = apps ? JSON.parse(apps) : [];
                    }
                } catch(e) {
                    console.error("Failed to fetch applications from Google Sheets", e);
                    let apps = localStorage.getItem('shaivika_job_applications');
                    database.applications = apps ? JSON.parse(apps) : [];
                }

                updateDashboardStats();
                renderDashboardRecentSubmissions();
                renderProjectsTable();
                renderCategoriesTable();
                renderLeadsTable();
                renderJobsTable();
                renderApplicationsTable();
                populateCategoryCheckboxes();
            } catch (err) {
                console.error(err);
                showToast('Error syncing database.', 'error');
            }
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

        const updateDashboardStats = () => {
            document.getElementById('statTotalProjects').textContent = database.projects.length;
            document.getElementById('statTotalCategories').textContent = database.categories.length;
            document.getElementById('statTotalSubmissions').textContent = database.submissions.length;
            document.getElementById('statTotalJobs').textContent = database.jobs.filter(j => j.status !== 'inactive').length;
            document.getElementById('statTotalApplications').textContent = database.applications.length;

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
                    <td>${date}</td>
                    <td><span class="tag ${typeTag}">${sub.type}</span></td>
                    <td>${sub.name}</td>
                    <td>${sub.email}</td>
                    <td>${sub.subject}</td>
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

            filtered.forEach((proj, idx) => {
                const tr = document.createElement('tr');
                tr.className = `tr-project-row ${highlightIndex === idx ? 'tr-row-highlight' : ''}`;
                tr.id = `proj-row-${idx}`;
                
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
                            <button type="button" class="action-btn-edit" onclick="openEditProject(${idx})" title="Edit Project">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                </svg>
                                <span>Edit</span>
                            </button>
                            <button type="button" class="action-btn-delete" onclick="promptDeleteProject(${idx})" title="Delete Project">
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
            if (!tbody) return;
            tbody.innerHTML = '';
            if (database.categories.length === 0) {
                tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: var(--text-muted);">No categories created.</td></tr>';
                return;
            }
            database.categories.forEach((cat, idx) => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><input type="checkbox" class="custom-checkbox category-checkbox" data-index="${idx}"></td>
                    <td><code style="color:var(--primary);">${cat.id}</code></td>
                    <td style="font-weight:600;">${cat.name}</td>
                    <td>
                        <div class="premium-actions">
                            <div class="tooltip-wrap" data-tooltip="Edit Category">
                                <button class="premium-btn edit-btn" onclick="openEditCategory(${idx})">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg> Edit
                                </button>
                            </div>
                            <div class="tooltip-wrap" data-tooltip="Delete Category">
                                <button class="premium-btn delete-btn" onclick="deleteCategory(${idx})">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg> Delete
                                </button>
                            </div>
                        </div>
                    </td>
                `;
                tbody.appendChild(tr);
            });
            if (typeof updateBulkToolbar === 'function') updateBulkToolbar();
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
                tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: var(--text-muted);">No form submissions.</td></tr>';
                return;
            }
            filtered.forEach(sub => {
                const tr = document.createElement('tr');
                const date = new Date(sub.timestamp).toLocaleString();
                const typeTag = sub.type === 'Newsletter' ? 'tag-purple' : 'tag-blue';
                tr.innerHTML = `
                    <td><input type="checkbox" class="custom-checkbox lead-checkbox" data-id="${sub.id}"></td>
                    <td>${date}</td>
                    <td><span class="tag ${typeTag}">${sub.type}</span></td>
                    <td>${sub.name}</td>
                    <td>${sub.email}</td>
                    <td>${sub.subject}</td>
                    <td>
                        <div class="premium-actions">
                            <div class="tooltip-wrap" data-tooltip="View Submission">
                                <button class="premium-btn view-btn" onclick="viewLeadDetails('${sub.id}')">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg> View
                                </button>
                            </div>
                            <div class="tooltip-wrap" data-tooltip="Edit Submission">
                                <button class="premium-btn edit-btn" onclick="editLeadDetails('${sub.id}')">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg> Edit
                                </button>
                            </div>
                            <div class="tooltip-wrap" data-tooltip="Delete Submission">
                                <button class="premium-btn delete-btn" onclick="confirmDeleteLead('${sub.id}')">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg> Delete
                                </button>
                            </div>
                        </div>
                    </td>
                `;
                tbody.appendChild(tr);
            });
            if (typeof updateBulkToolbar === 'function') updateBulkToolbar();
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
                tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: var(--text-muted);">No job postings active. Click "Post New Job" to add one.</td></tr>';
                return;
            }

            filtered.forEach((job, idx) => {
                const tr = document.createElement('tr');
                const statusBadge = job.status === 'inactive' ? '<span class="status-badge badge-danger">Inactive</span>' : '<span class="status-badge badge-success">Active</span>';

                tr.innerHTML = `
                    <td style="font-size:1.4rem;text-align:center;">${job.emoji || '💼'}</td>
                    <td style="font-weight:700;">${job.title}</td>
                    <td><span class="tag tag-purple">${job.departmentName || job.department}</span></td>
                    <td>📍 ${job.location || 'Remote'}</td>
                    <td>${job.type || 'Full-Time'}</td>
                    <td>${statusBadge}</td>
                    <td>
                        <div class="action-btns">
                            <button class="action-btn" onclick="openEditJob(${idx})" title="Edit Job">✏️</button>
                            <button class="action-btn" onclick="toggleJobStatus(${idx})" title="Toggle Active Status">🔄</button>
                            <button class="action-btn delete" onclick="deleteJob(${idx})" title="Delete Job">🗑️</button>
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
            tbody.innerHTML = '';

            const statusFilter = document.getElementById('filterAppStatus').value;
            let filtered = [...database.applications].sort((a,b) => new Date(b.submittedAt) - new Date(a.submittedAt));

            if (statusFilter !== 'all') {
                filtered = filtered.filter(a => a.appStatus === statusFilter);
            }

            if (searchQuery) {
                const q = searchQuery.toLowerCase();
                filtered = filtered.filter(a => 
                    a.name.toLowerCase().includes(q) || 
                    a.email.toLowerCase().includes(q) || 
                    a.jobTitle.toLowerCase().includes(q) || 
                    (a.skills || '').toLowerCase().includes(q)
                );
            }

            if (filtered.length === 0) {
                tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: var(--text-muted);">No candidate job applications found.</td></tr>';
                return;
            }

            filtered.forEach((app) => {
                const tr = document.createElement('tr');
                const dateStr = app.submittedAt ? new Date(app.submittedAt).toLocaleDateString() : 'N/A';

                let statusBadge = '<span class="status-badge badge-warning">Pending</span>';
                if (app.appStatus === 'shortlisted') statusBadge = '<span class="status-badge badge-success">Shortlisted</span>';
                if (app.appStatus === 'rejected') statusBadge = '<span class="status-badge badge-danger">Rejected</span>';

                const hasResume = app.resumeBase64 ? `<span style="color:var(--success);font-weight:600;">📎 ${app.resumeFileName}</span>` : '<span style="color:var(--text-muted);">No file</span>';

                tr.innerHTML = `
                    <td>${dateStr}</td>
                    <td style="font-weight:700;">${app.name}</td>
                    <td><span class="tag tag-cyan">${app.jobTitle}</span></td>
                    <td>
                        <div style="font-size:0.85rem;">📧 ${app.email}</div>
                        <div style="font-size:0.8rem;color:var(--text-secondary);">📱 ${app.phone}</div>
                    </td>
                    <td>${app.status || 'N/A'} <br><small style="color:var(--text-muted);">${app.experience || ''}</small></td>
                    <td>${hasResume}</td>
                    <td>${statusBadge}</td>
                    <td>
                        <div class="action-btns">
                            <button class="action-btn" onclick="viewApplicationDetails('${app.id}')" title="View Full Candidate Profile & Resume">👁️ Profile</button>
                            <button class="action-btn delete" onclick="deleteApplication('${app.id}')" title="Delete Application">🗑️</button>
                        </div>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        };

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

        // Auto-detect new applications from other tabs/pages (Careers page submission)
        window.addEventListener('storage', (e) => {
            if (e.key === 'shaivika_job_applications') {
                database.applications = e.newValue ? JSON.parse(e.newValue) : [];
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
            } else {
                database.jobs.unshift(jobData);
                showToast('New job posted successfully!', 'success');
            }

            saveData();
            renderJobsTable();
            closeJobModal();
        });

        window.openEditJob = (idx) => {
            const job = database.jobs[idx];
            document.getElementById('editJobIndex').value = idx;
            document.getElementById('jobModalTitle').textContent = 'Edit Job Opening';

            document.getElementById('jobTitle').value = job.title;
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

        window.toggleJobStatus = (idx) => {
            database.jobs[idx].status = database.jobs[idx].status === 'inactive' ? 'active' : 'inactive';
            saveData();
            renderJobsTable();
            showToast(`Job status changed to ${database.jobs[idx].status}.`, 'success');
        };

        window.deleteJob = (idx) => {
            if (confirm(`Are you sure you want to delete "${database.jobs[idx].title}"?`)) {
                database.jobs.splice(idx, 1);
                saveData();
                renderJobsTable();
                showToast('Job posting deleted.', 'success');
            }
        };

        // CANDIDATE APPLICATION MODAL LOGIC
        const applicationDetailModal = document.getElementById('applicationDetailModal');

        window.viewApplicationDetails = (appId) => {
            const app = database.applications.find(a => a.id === appId);
            if (!app) return;

            const modalBody = document.getElementById('appModalBody');
            const actionContainer = document.getElementById('appStatusActionBtns');

            let resumeSectionHTML = '';
            if (app.resumeBase64) {
                resumeSectionHTML = `
                    <div style="background:rgba(16,185,129,0.06);border:1px solid rgba(16,185,129,0.3);padding:16px;border-radius:12px;margin-top:16px;">
                        <div style="font-weight:700;font-size:14px;color:var(--success);margin-bottom:8px;">📄 Resume File Attached</div>
                        <div style="font-size:13px;color:var(--text-secondary);margin-bottom:12px;">Filename: <strong>${app.resumeFileName}</strong></div>
                        <div style="display:flex;gap:10px;flex-wrap:wrap;">
                            <a href="${app.resumeBase64}" download="${app.resumeFileName}" class="btn btn-success btn-sm">📥 Download Resume</a>
                            <button onclick="window.open('${app.resumeBase64}')" class="btn btn-secondary btn-sm">👁️ Open Resume Preview</button>
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
                    <div class="lead-detail-value" style="font-size:1.1rem;font-weight:800;color:var(--primary);">${app.name}</div>
                </div>
                <div class="lead-detail-field">
                    <div class="lead-detail-label">Applied Position</div>
                    <div class="lead-detail-value"><span class="tag tag-cyan">${app.jobTitle}</span></div>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                    <div class="lead-detail-field">
                        <div class="lead-detail-label">Email Address</div>
                        <div class="lead-detail-value"><a href="mailto:${app.email}" style="color:var(--accent);">${app.email}</a></div>
                    </div>
                    <div class="lead-detail-field">
                        <div class="lead-detail-label">Mobile (WhatsApp)</div>
                        <div class="lead-detail-value"><a href="https://wa.me/${app.phone.replace(/[^0-9]/g,'')}" target="_blank" style="color:var(--success);">📱 ${app.phone} (Chat)</a></div>
                    </div>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                    <div class="lead-detail-field">
                        <div class="lead-detail-label">Current Status</div>
                        <div class="lead-detail-value">${app.status || 'N/A'}</div>
                    </div>
                    <div class="lead-detail-field">
                        <div class="lead-detail-label">Passout / Experience</div>
                        <div class="lead-detail-value">${app.experience || 'N/A'}</div>
                    </div>
                </div>
                <div class="lead-detail-field">
                    <div class="lead-detail-label">Primary Skills</div>
                    <div class="lead-detail-value">${app.skills || 'N/A'}</div>
                </div>
                ${app.portfolio ? `
                <div class="lead-detail-field">
                    <div class="lead-detail-label">Portfolio / LinkedIn</div>
                    <div class="lead-detail-value"><a href="${app.portfolio}" target="_blank" style="color:var(--accent);">${app.portfolio}</a></div>
                </div>` : ''}
                ${app.message ? `
                <div class="lead-detail-field">
                    <div class="lead-detail-label">Cover Statement / Note</div>
                    <div class="lead-detail-value" style="white-space:pre-wrap;">${app.message}</div>
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
            const app = database.applications.find(a => a.id === appId);
            if (app) {
                app.appStatus = newStatus;
                saveData();
                renderApplicationsTable();
                closeAppModal();
                showToast(`Candidate status updated to ${newStatus}.`, 'success');
            }
        };

        window.deleteApplication = (appId) => {
            if (confirm('Are you sure you want to delete this job application?')) {
                database.applications = database.applications.filter(a => a.id !== appId);
                saveData();
                renderApplicationsTable();
                showToast('Application deleted.', 'success');
            }
        };

        // EXPORT APPS CSV
        document.getElementById('exportAppsCsv').addEventListener('click', () => {
            if (database.applications.length === 0) {
                showToast('No job applications to export.', 'error');
                return;
            }
            let csv = 'ID,Applied Date,Candidate Name,Email,Phone,Position,Status,Experience,Skills,Portfolio,AppStatus\r\n';
            database.applications.forEach(a => {
                csv += `"${a.id}","${a.submittedAt}","${a.name}","${a.email}","${a.phone}","${a.jobTitle}","${a.status || ''}","${a.experience || ''}","${(a.skills||'').replace(/"/g, '""')}","${a.portfolio||''}","${a.appStatus}"\r\n`;
            });

            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.setAttribute("download", `job_applications_export_${Date.now()}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            showToast('Applications CSV exported successfully.', 'success');
        });

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
        const catForm = document.getElementById('categoryForm');
        if (catForm) {
            catForm.addEventListener('submit', (e) => {
                e.preventDefault();
            const editIdx = parseInt(document.getElementById('editCatIndex').value);
            const name = document.getElementById('catName').value.trim();
            const id = document.getElementById('catId').value.trim().toLowerCase().replace(/\s+/g, '-');

            if (editIdx > -1) {
                database.categories[editIdx] = { id, name };
                showToast('Category updated.', 'success');
            } else {
                if (database.categories.some(c => c.id === id)) {
                    showToast('Category slug already exists!', 'error');
                    return;
                }
                database.categories.push({ id, name });
                showToast('New category added.', 'success');
            }

            saveData();
            renderCategoriesTable();
            populateCategoryCheckboxes();
            document.getElementById('categoryForm').reset();
            document.getElementById('editCatIndex').value = '-1';
        });

        window.openEditCategory = (idx) => {
            const cat = database.categories[idx];
            if (!cat) return;
            document.getElementById('editCatIndex').value = idx;
            document.getElementById('catName').value = cat.name;
            document.getElementById('catId').value = cat.id;
            document.getElementById('catName').focus();
        };

        window.deleteCategory = (idx) => {
            const cat = database.categories[idx];
            if (!cat) return;
            if (confirm(`Delete category "${cat.name}"?`)) {
                database.categories.splice(idx, 1);
                saveData();
                renderCategoriesTable();
                populateCategoryCheckboxes();
                showToast('Category deleted.', 'success');
            }
        };

        // ==========================================
        // GOOGLE APPS SCRIPT SYNC LOGIC
        // ==========================================
        const gasInput = document.getElementById('gasPortfolioUrl');
        const gasBadge = document.getElementById('gasSyncBadge');
        const gasStatusOutput = document.getElementById('gasStatusOutput');

        // Load saved GAS URL
        const DEFAULT_ACTIVE_GAS_URL = 'https://script.google.com/macros/s/AKfycbwBnqwzKd77hBm3Ij8AtoXRnChjQrTgVv_wu3VFIXPKG8vtkNQ81A7TlarM67Kzl76t/exec';
        const savedGasUrl = localStorage.getItem('shaivika_gas_portfolio_url') || DEFAULT_ACTIVE_GAS_URL;
        if (gasInput) {
            gasInput.value = savedGasUrl;
            localStorage.setItem('shaivika_gas_portfolio_url', savedGasUrl);
            gasBadge.textContent = '🟢 Connected';
            gasBadge.className = 'tag tag-green';
        }

        // Robust Google Apps Script Writer (POST + GET/JSONP Fallback)
        const sendGasAction = async (action, data = {}) => {
            const gasUrl = localStorage.getItem('shaivika_gas_portfolio_url') || DEFAULT_ACTIVE_GAS_URL;
            if (!gasUrl) return { success: false, message: 'No GAS URL' };

            const payload = { action, ...data };

            // 1. Primary: Fetch POST (mode: no-cors with text/plain)
            try {
                await fetch(gasUrl, {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                    body: JSON.stringify(payload)
                });
                return { success: true };
            } catch (postErr) {
                console.warn('Fetch POST to Google Sheet failed, trying GET fallback:', postErr);
            }

            // 2. Fallback: JSONP / GET
            return new Promise((resolve) => {
                const cbName = 'gasWriteCb_' + Date.now() + '_' + Math.floor(Math.random() * 10000);
                const script = document.createElement('script');
                const cleanUrl = gasUrl.split('?')[0];
                const params = new URLSearchParams({
                    action: action,
                    payload: JSON.stringify(payload),
                    callback: cbName,
                    _t: Date.now()
                });

                window[cbName] = (res) => {
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

            // 1. Try standard fetch with 7s timeout
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

            // 2. Resilient JSONP fallback (guarantees cross-origin script execution)
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
                gasStatusOutput.style.display = 'block';
                gasStatusOutput.style.background = 'rgba(59, 130, 246, 0.1)';
                gasStatusOutput.style.color = 'var(--accent)';
                gasStatusOutput.innerHTML = '⏳ Testing connection to Google Apps Script...';

                const projects = await fetchGasProjectsData(url);

                localStorage.setItem('shaivika_gas_portfolio_url', url);
                gasBadge.textContent = '🟢 Connected';
                gasBadge.className = 'tag tag-green';
                gasStatusOutput.style.background = 'rgba(16, 185, 129, 0.1)';
                gasStatusOutput.style.color = 'var(--success)';
                gasStatusOutput.innerHTML = `✅ <strong>Connected!</strong> Successfully reached Google Sheet (${projects.length} projects retrieved).`;
                showToast(`Google Sheet verified! (${projects.length} projects)`, 'success');
            } catch (err) {
                console.error('GAS connection error:', err);
                gasBadge.textContent = '⚠️ Check URL';
                gasBadge.className = 'tag tag-amber';
                gasStatusOutput.style.background = 'rgba(239, 68, 68, 0.1)';
                gasStatusOutput.style.color = 'var(--danger)';
                gasStatusOutput.innerHTML = `❌ <strong>Connection Notice:</strong> ${err.message}. If this is a new Web App, ensure it was deployed with <em>"Who has access: Anyone"</em>.`;
                localStorage.setItem('shaivika_gas_portfolio_url', url);
                showToast('Notice: ' + err.message, 'warning');
            }
        };

        document.getElementById('btnSaveGasUrl')?.addEventListener('click', () => {
            const url = gasInput.value.trim();
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
                        showToast(`✅ Loaded ${projects.length} projects from Google Sheet!`, 'success');
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


        const leadModal = document.getElementById('leadModal');
        window.viewLeadDetails = (id) => {
            const sub = database.submissions.find(s => s.id === id);
            if (!sub) return;
            document.getElementById('leadModalBody').innerHTML = `
                <div class="lead-detail-field"><div class="lead-detail-label">Name</div><div class="lead-detail-value">${sub.name}</div></div>
                <div class="lead-detail-field"><div class="lead-detail-label">Email</div><div class="lead-detail-value">${sub.email}</div></div>
                <div class="lead-detail-field"><div class="lead-detail-label">Subject</div><div class="lead-detail-value">${sub.subject}</div></div>
                <div class="lead-detail-field"><div class="lead-detail-label">Message</div><div class="lead-detail-value" style="white-space:pre-wrap;">${sub.message}</div></div>
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

        checkAuth();
        initTheme();

        // 🔄 Automatic Google Sheet Sync on Admin Init
        setTimeout(() => {
            if (typeof pullProjectsFromGoogleSheet === 'function' && localStorage.getItem('shaivika_admin_logged_in') === 'true') {
                pullProjectsFromGoogleSheet();
            }
        }, 300);

        // ==========================================
        // BULK ACTIONS & ADVANCED EXPORT LOGIC
        // ==========================================
        let currentActiveTabForBulk = null; 

        const updateBulkToolbar = () => {
            const leadsSelected = document.querySelectorAll('.lead-checkbox:checked').length;
            const categoriesSelected = document.querySelectorAll('.category-checkbox:checked').length;
            const bulkToolbar = document.getElementById('bulkActionsToolbar');
            const bulkCount = document.getElementById('bulkCountDisplay');
            
            let totalSelected = 0;
            if (document.getElementById('leads-manager-tab')?.classList.contains('active')) {
                totalSelected = leadsSelected;
                currentActiveTabForBulk = 'leads';
            } else if (document.getElementById('category-manager-tab')?.classList.contains('active')) {
                totalSelected = categoriesSelected;
                currentActiveTabForBulk = 'categories';
            }

            if (totalSelected > 0) {
                bulkCount.textContent = `${totalSelected} Selected`;
                bulkToolbar.classList.add('visible');
            } else {
                bulkToolbar.classList.remove('visible');
            }
        };

        // Tab click observer for bulk toolbar
        document.querySelectorAll('.sidebar-link').forEach(link => {
            link.addEventListener('click', () => {
                setTimeout(updateBulkToolbar, 100);
            });
        });

        // Select All Logic - Leads
        const selectAllLeads = document.getElementById('selectAllLeads');
        if(selectAllLeads) {
            selectAllLeads.addEventListener('change', (e) => {
                document.querySelectorAll('.lead-checkbox').forEach(cb => cb.checked = e.target.checked);
                updateBulkToolbar();
            });
        }

        // Select All Logic - Categories
        const selectAllCategories = document.getElementById('selectAllCategories');
        if(selectAllCategories) {
            selectAllCategories.addEventListener('change', (e) => {
                document.querySelectorAll('.category-checkbox').forEach(cb => cb.checked = e.target.checked);
                updateBulkToolbar();
            });
        }

        // Event delegation for individual checkboxes
        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('lead-checkbox') || e.target.classList.contains('category-checkbox')) {
                updateBulkToolbar();
            }
        });

        // Bulk Delete Action
        const bulkDeleteBtn = document.getElementById('bulkDeleteBtn');
        if(bulkDeleteBtn) {
            bulkDeleteBtn.addEventListener('click', () => {
                console.log('bulkDeleteBtn clicked. currentActiveTabForBulk:', currentActiveTabForBulk);
                if (currentActiveTabForBulk === 'leads') {
                    const selectedIds = Array.from(document.querySelectorAll('.lead-checkbox:checked')).map(cb => cb.getAttribute('data-id'));
                    if (confirm(`Are you sure you want to delete ${selectedIds.length} leads?`)) {
                        database.submissions = database.submissions.filter(s => !selectedIds.includes(String(s.id)));
                        saveData();
                        renderLeadsTable();
                        if (typeof renderDashboardRecentSubmissions === 'function') renderDashboardRecentSubmissions();
                        showToast(`${selectedIds.length} leads deleted successfully.`, 'success');
                    }
                } else if (currentActiveTabForBulk === 'categories') {
                    const selectedIndexes = Array.from(document.querySelectorAll('.category-checkbox:checked')).map(cb => parseInt(cb.getAttribute('data-index'))).sort((a,b)=>b-a);
                    if (confirm(`Are you sure you want to delete ${selectedIndexes.length} categories?`)) {
                        selectedIndexes.forEach(idx => database.categories.splice(idx, 1));
                        saveData();
                        renderCategoriesTable();
                        showToast(`${selectedIndexes.length} categories deleted successfully.`, 'success');
                    }
                }
                updateBulkToolbar();
            });
        }

        // Export Dropdown Logic
        const exportMenuBtn = document.getElementById('exportMenuBtn');
        const exportDropdownContent = document.getElementById('exportDropdownContent');
        
        if (exportMenuBtn && exportDropdownContent) {
            exportMenuBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                exportDropdownContent.classList.toggle('show');
            });

            document.addEventListener('click', () => {
                exportDropdownContent.classList.remove('show');
            });
        }

        // Helper: Get selected leads or all if none selected
        const getLeadsForExport = () => {
            const selectedIds = Array.from(document.querySelectorAll('.lead-checkbox:checked')).map(cb => cb.getAttribute('data-id'));
            if (selectedIds.length > 0) {
                return database.submissions.filter(s => selectedIds.includes(s.id));
            }
            return database.submissions; // fallback to all
        };

        // Export Leads - Excel (.xlsx) using SheetJS
        document.getElementById('exportLeadsExcel')?.addEventListener('click', () => {
            const leads = getLeadsForExport();
            if (leads.length === 0) return showToast('No data to export.', 'error');
            
            const ws = XLSX.utils.json_to_sheet(leads);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Leads");
            XLSX.writeFile(wb, `leads_export_${Date.now()}.xlsx`);
            showToast('Excel file generated successfully.', 'success');
        });

        // Export Leads - CSV
        document.getElementById('exportLeadsCsv')?.addEventListener('click', () => {
            const leads = getLeadsForExport();
            if (leads.length === 0) return showToast('No data to export.', 'error');
            
            const headers = ['id', 'timestamp', 'name', 'email', 'phone', 'company', 'subject', 'message', 'type'];
            const csvRows = [headers.join(',')];
            
            leads.forEach(lead => {
                const values = headers.map(header => {
                    const val = lead[header] ? String(lead[header]).replace(/"/g, '""') : '';
                    return `"${val}"`;
                });
                csvRows.push(values.join(','));
            });
            
            const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.setAttribute('href', url);
            a.setAttribute('download', `leads_export_${Date.now()}.csv`);
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            showToast('CSV downloaded successfully.', 'success');
        });

        // Export Leads - JSON
        document.getElementById('exportLeadsJson')?.addEventListener('click', () => {
            const leads = getLeadsForExport();
            if (leads.length === 0) return showToast('No data to export.', 'error');
            
            const blob = new Blob([JSON.stringify(leads, null, 2)], { type: 'application/json' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.setAttribute('href', url);
            a.setAttribute('download', `leads_export_${Date.now()}.json`);
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            showToast('JSON downloaded successfully.', 'success');
        });

        // Export Leads - Google Sheets (Downloads as CSV for Sheets)
        document.getElementById('exportLeadsGoogleSheets')?.addEventListener('click', () => {
            const leads = getLeadsForExport();
            if (leads.length === 0) return showToast('No data to export.', 'error');
            
            if (exportMenuBtn) exportMenuBtn.innerText = 'Syncing...';
            setTimeout(() => {
                const headers = ['id', 'timestamp', 'name', 'email', 'phone', 'company', 'subject', 'message', 'type'];
                const csvRows = [headers.join(',')];
                
                leads.forEach(lead => {
                    const values = headers.map(header => {
                        const val = lead[header] ? String(lead[header]).replace(/"/g, '""') : '';
                        return `"${val}"`;
                    });
                    csvRows.push(values.join(','));
                });
                
                const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.setAttribute('href', url);
                a.setAttribute('download', `leads_googlesheets_format_${Date.now()}.csv`);
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                
                showToast(`✅ Downloaded ${leads.length} rows for Google Sheets.`, 'success');
                if (exportMenuBtn) exportMenuBtn.innerText = 'Export ▼';
            }, 800);
        });

        // Bulk Export Action (redirects to Excel)
        const bulkExportBtn = document.getElementById('bulkExportBtn');
        if(bulkExportBtn) {
            bulkExportBtn.addEventListener('click', () => {
                if (currentActiveTabForBulk === 'leads') {
                    document.getElementById('exportLeadsExcel')?.click();
                } else {
                    showToast('Bulk export for categories not supported yet.', 'error');
                }
            });
        }
