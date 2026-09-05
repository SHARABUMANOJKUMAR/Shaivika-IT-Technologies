/**
 * SHAIVIKA IT TECHNOLOGIES - Careers Manager
 * Dynamic job listings, category filtering, job detail modals,
 * and comprehensive job application submission with resume file upload.
 */
document.addEventListener('DOMContentLoaded', () => {
  // Security Sanitization Utility
  function escapeHTML(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  const jobsGrid = document.querySelector('.jobs-grid');
  const filterBar = document.querySelector('.careers-filter-bar');
  const jobDetailModal = document.getElementById('jobDetailModal');
  const applyModal = document.getElementById('applyModal');
  const paginationContainer = document.querySelector('.pagination');

  if (!jobsGrid) return; // Only run on careers page

  let currentCategory = 'all';
  let activeJobs = [];
  let selectedJob = null;
  let resumeBase64 = '';
  let resumeFileName = '';
  let currentPage = 1;
  const itemsPerPage = 6;

  const DEFAULT_JOBS = [
    {
      id: "job_bdp",
      title: "Business Development Partner",
      department: "sales",
      departmentName: "Sales & Partnership",
      location: "Remote (India) / Hybrid",
      type: "Commission / Partnership",
      experience: "1+ Years in B2B / Sales",
      salary: "High Performance Incentives + Commission",
      status: "active",
      emoji: "💼",
      overview: "Shaivika IT Technologies invites ambitious business development professionals to join our BD Partner Program. You will identify, engage, and close qualified digital solution opportunities with startups, SMEs, and enterprise clients.",
      responsibilities: [
        "Identify and engage prospective business clients across targeted industries.",
        "Build relationships with founders, directors, CXOs, and key decision-makers.",
        "Generate qualified opportunities through networking, strategic outreach, and industry connections.",
        "Understand client digital challenges and align Shaivika IT solutions.",
        "Support proposal discussions, commercial negotiations, and project onboarding."
      ],
      skills: ["B2B Sales", "Client Acquisition", "IT Consulting", "Strategic Communication", "Deal Closure"],
      postedDate: "Active Hiring"
    },
    {
      id: "job_fullstack",
      title: "Full-Stack Web Developer",
      department: "engineering",
      departmentName: "Engineering",
      location: "Kadapa / Hybrid",
      type: "Full-Time",
      experience: "0-2 Years (Freshers Welcome)",
      salary: "Competitive + Performance Bonus",
      status: "active",
      emoji: "💻",
      overview: "We are seeking a talented Full-Stack Web Developer proficient in modern frontend frameworks, Node.js/Python backend systems, REST APIs, and database architecture to build high-converting web applications.",
      responsibilities: [
        "Develop high-performance, responsive web applications using modern JavaScript/React and backend stacks.",
        "Integrate RESTful APIs, payment gateways, and third-party SaaS services.",
        "Optimize web performance, SEO, accessibility, and security standards.",
        "Collaborate with UI/UX designers and product managers to deliver state-of-the-art digital products."
      ],
      skills: ["JavaScript (ES6+)", "React / HTML5 / CSS3", "Node.js / Express", "MongoDB / PostgreSQL", "Git / REST APIs"],
      postedDate: "Active Hiring"
    },
    {
      id: "job_ai",
      title: "AI & Automation Engineer",
      department: "ai",
      departmentName: "AI & Automation",
      location: "Remote / Hybrid",
      type: "Full-Time / Part-Time",
      experience: "1+ Years in AI/NLP",
      salary: "Industry Standard + Perks",
      status: "active",
      emoji: "🤖",
      overview: "Join our core AI team to design and build intelligent automation bots, LLM integrations, WhatsApp API workflows, and document OCR pipelines for enterprise clients.",
      responsibilities: [
        "Design AI agent workflows, conversational bots, and automated CRM pipelines.",
        "Integrate OpenAI/Gemini APIs, LangChain, and WhatsApp Business API.",
        "Build custom OCR and data extraction microservices.",
        "Monitor model telemetry, latency, and response precision."
      ],
      skills: ["Python / FastAPI", "OpenAI / LLM APIs", "WhatsApp Business API", "LangChain / Vector DBs", "OCR & NLP"],
      postedDate: "Active Hiring"
    },
    {
      id: "job_uiux",
      title: "UI/UX & Product Designer",
      department: "design",
      departmentName: "Design",
      location: "Remote (India)",
      type: "Full-Time / Project-Based",
      experience: "1+ Years Portfolio Required",
      salary: "Competitive",
      status: "active",
      emoji: "🎨",
      overview: "Craft visually stunning, high-converting digital interfaces, dark-mode glassmorphic themes, and responsive design systems for our web apps, SaaS dashboards, and client products.",
      responsibilities: [
        "Design high-fidelity interactive wireframes, user flows, and Figma prototypes.",
        "Build consistent design systems, color palettes, and custom icon sets.",
        "Conduct user research and visual audits to maximize conversion and usability."
      ],
      skills: ["Figma / Adobe XD", "Responsive Web Design", "Glassmorphism & Micro-animations", "Design Systems", "User Research"],
      postedDate: "Active Hiring"
    },
    {
      id: "job_mobile",
      title: "Flutter / Mobile App Developer",
      department: "engineering",
      departmentName: "Engineering",
      location: "Hybrid / Remote",
      type: "Full-Time",
      experience: "1+ Years",
      salary: "Competitive",
      status: "active",
      emoji: "📱",
      overview: "Build cross-platform mobile apps for Android and iOS using Flutter/React Native. Focus on smooth 60fps UI, offline sync, biometric security, and push notifications.",
      responsibilities: [
        "Develop high-performance Flutter / React Native applications.",
        "Integrate state management (Provider/Riverpod/Redux) and native device APIs.",
        "Publish apps to Google Play Store and Apple App Store."
      ],
      skills: ["Flutter / Dart", "React Native", "REST & GraphQL APIs", "Firebase / App Publishing", "Mobile Security"],
      postedDate: "Active Hiring"
    }
  ];

  let handlersAttached = false;

  initCareers();

  function initCareers() {
    try {
      const cached = localStorage.getItem('shaivika_job_postings');

      if (cached) {
        activeJobs = JSON.parse(cached);
      } else {
        activeJobs = DEFAULT_JOBS;
        localStorage.setItem('shaivika_job_postings', JSON.stringify(activeJobs));
      }
      localStorage.setItem('shaivika_careers_initialized', 'true');
    } catch (e) {
      console.warn('Error reading job postings, using default list:', e);
      activeJobs = DEFAULT_JOBS;
    }

    renderFilterBar();
    renderJobs();
    if (!handlersAttached) {
      attachFormHandlers();
      handlersAttached = true;
    }
  }

  function renderFilterBar() {
    if (!filterBar) return;
    filterBar.innerHTML = '';

    const categories = [
      { id: 'all', label: 'All Openings' },
      { id: 'sales', label: 'Sales & BD' },
      { id: 'engineering', label: 'Engineering' },
      { id: 'ai', label: 'AI & Data' },
      { id: 'design', label: 'Design' }
    ];

    categories.forEach(cat => {
      const btn = document.createElement('button');
      btn.className = `filter-btn ${currentCategory === cat.id ? 'active' : ''}`;
      btn.textContent = cat.label;
      btn.dataset.category = cat.id;
      btn.onclick = () => {
        filterBar.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentCategory = cat.id;
        currentPage = 1; // Reset to page 1 on filter change
        renderJobs();
      };
      filterBar.appendChild(btn);
    });
  }

  function renderJobs() {
    jobsGrid.innerHTML = '';

    const filtered = activeJobs.filter(job => {
      if (job.status === 'inactive') return false;
      if (currentCategory === 'all') return true;
      return job.department === currentCategory;
    });

    if (filtered.length === 0) {
      jobsGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: var(--text-secondary);">
          <span style="font-size: 3rem; display: block; margin-bottom: 12px;">🚀</span>
          <h3 style="font-size: 1.4rem; margin-bottom: 8px;">No Current Openings in this Department</h3>
          <p>Send your resume to <a href="mailto:shaivikagroups@gmail.com" style="color:var(--primary);font-weight:600;">shaivikagroups@gmail.com</a> for future opportunities.</p>
        </div>
      `;
      if (paginationContainer) {
        paginationContainer.style.display = 'none';
      }
      return;
    }

    // Pagination calculations
    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    // Clamp currentPage
    if (currentPage > totalPages && totalPages > 0) {
      currentPage = totalPages;
    }

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageItems = filtered.slice(startIndex, endIndex);

    pageItems.forEach(job => {
      const card = document.createElement('div');
      card.className = 'job-card glass-card';
      card.style.animation = 'fadeInUp 0.4s ease forwards';

      const skillsHTML = (job.skills || []).slice(0, 3).map(s => `<span class="tag tag-blue">${escapeHTML(s)}</span>`).join('');
      const safeEmoji = escapeHTML(job.emoji || '💼');
      const safeDept = escapeHTML(job.departmentName || 'General');
      const safeTitle = escapeHTML(job.title || 'Career Opportunity');
      const safeOverview = escapeHTML(job.overview ? job.overview.substring(0, 130) + '...' : '');
      const safeLocation = escapeHTML(job.location || 'Remote');
      const safeType = escapeHTML(job.type || 'Full-Time');
      const safeExp = escapeHTML(job.experience || 'Entry Level');

      card.innerHTML = `
        <div class="job-card-header">
          <div class="job-icon">${safeEmoji}</div>
          <div>
            <span class="job-department-tag">${safeDept}</span>
            <h3 class="job-title">${safeTitle}</h3>
          </div>
        </div>
        <p class="job-desc">${safeOverview}</p>
        <div class="job-meta">
          <span>📍 ${safeLocation}</span>
          <span>⏰ ${safeType}</span>
          <span>🎓 ${safeExp}</span>
        </div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:16px;">
          ${skillsHTML}
        </div>
        <div class="job-actions">
          <button class="btn btn-ghost btn-sm btn-view-details" data-job-id="${escapeHTML(job.id)}">Position Overview →</button>
          <button class="btn btn-primary btn-sm btn-apply-now" data-job-id="${escapeHTML(job.id)}">Apply Now 🚀</button>
        </div>
      `;

      card.querySelector('.btn-view-details').onclick = (e) => {
        e.stopPropagation();
        openJobDetailModal(job);
      };

      card.querySelector('.btn-apply-now').onclick = (e) => {
        e.stopPropagation();
        openApplyModal(job);
      };

      jobsGrid.appendChild(card);
    });

    renderPagination(totalPages);
  }

  function renderPagination(totalPages) {
    if (!paginationContainer) return;

    if (totalPages <= 1) {
      paginationContainer.style.display = 'none';
      return;
    }

    paginationContainer.style.display = 'flex';
    paginationContainer.innerHTML = '';

    // Prev Button
    const prevBtn = document.createElement('button');
    prevBtn.className = 'page-btn';
    prevBtn.innerHTML = '‹';
    prevBtn.disabled = currentPage === 1;
    prevBtn.onclick = () => {
      if (currentPage > 1) {
        currentPage--;
        renderJobs();
        scrollToGrid();
      }
    };
    paginationContainer.appendChild(prevBtn);

    // Number Buttons
    for (let i = 1; i <= totalPages; i++) {
      const pageBtn = document.createElement('button');
      pageBtn.className = `page-btn ${currentPage === i ? 'active' : ''}`;
      pageBtn.textContent = i;
      pageBtn.onclick = () => {
        currentPage = i;
        renderJobs();
        scrollToGrid();
      };
      paginationContainer.appendChild(pageBtn);
    }

    // Next Button
    const nextBtn = document.createElement('button');
    nextBtn.className = 'page-btn';
    nextBtn.innerHTML = '›';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.onclick = () => {
      if (currentPage < totalPages) {
        currentPage++;
        renderJobs();
        scrollToGrid();
      }
    };
    paginationContainer.appendChild(nextBtn);
  }

  function scrollToGrid() {
    const rect = jobsGrid.getBoundingClientRect();
    const top = rect.top + window.scrollY - 120;
    window.scrollTo({ top, behavior: 'smooth' });
  }

  function openJobDetailModal(job) {
    selectedJob = job;
    if (!jobDetailModal) return;

    const modalBody = jobDetailModal.querySelector('.modal-body-content');
    if (modalBody) {
      const respHTML = (job.responsibilities || []).map(r => `<li>${escapeHTML(r)}</li>`).join('');
      const skillsHTML = (job.skills || []).map(s => `<span class="tag tag-purple">${escapeHTML(s)}</span>`).join('');
      const safeEmoji = escapeHTML(job.emoji || '💼');
      const safeDept = escapeHTML(job.departmentName || 'General');
      const safeTitle = escapeHTML(job.title || 'Career Position');
      const safeLocation = escapeHTML(job.location || 'Remote');
      const safeType = escapeHTML(job.type || 'Full-Time');
      const safeExp = escapeHTML(job.experience || 'Entry Level');
      const safeOverview = escapeHTML(job.overview || '');

      modalBody.innerHTML = `
        <div style="display:flex;align-items:center;gap:16px;margin-bottom:20px;">
          <div style="font-size:3rem;background:var(--gradient-card);width:70px;height:70px;border-radius:16px;display:flex;align-items:center;justify-content:center;border:1px solid var(--border-glass);">
            ${safeEmoji}
          </div>
          <div>
            <span class="tag tag-cyan" style="margin-bottom:6px;display:inline-block;">${safeDept}</span>
            <h2 style="font-size:1.6rem;font-weight:800;color:var(--text-primary);">${safeTitle}</h2>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(140px, 1fr));gap:12px;margin-bottom:24px;background:var(--bg-glass);padding:16px;border-radius:12px;border:1px solid var(--border-glass);">
          <div>
            <div style="font-size:11px;color:var(--text-muted);">Location</div>
            <div style="font-weight:700;font-size:14px;color:var(--text-primary);">📍 ${safeLocation}</div>
          </div>
          <div>
            <div style="font-size:11px;color:var(--text-muted);">Employment Type</div>
            <div style="font-weight:700;font-size:14px;color:var(--text-primary);">⏰ ${safeType}</div>
          </div>
          <div>
            <div style="font-size:11px;color:var(--text-muted);">Experience Needed</div>
            <div style="font-weight:700;font-size:14px;color:var(--text-primary);">🎓 ${safeExp}</div>
          </div>
        </div>

        <h3 style="font-size:1.1rem;font-weight:700;margin-bottom:8px;color:var(--accent);">Position Overview</h3>
        <p style="font-size:14px;color:var(--text-secondary);line-height:1.7;margin-bottom:20px;">${safeOverview}</p>

        <h3 style="font-size:1.1rem;font-weight:700;margin-bottom:10px;color:var(--accent);">Key Responsibilities</h3>
        <ul class="results-list" style="margin-bottom:24px;">
          ${respHTML}
        </ul>

        <h3 style="font-size:1.1rem;font-weight:700;margin-bottom:10px;color:var(--accent);">Required Skills & Capabilities</h3>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:28px;">
          ${skillsHTML}
        </div>

        <div style="display:flex;gap:12px;justify-content:flex-end;">
          <button class="btn btn-ghost modal-close-btn">Close</button>
          <button class="btn btn-primary modal-apply-btn">Apply For Position 🚀</button>
        </div>
      `;

      modalBody.querySelector('.modal-close-btn').onclick = closeModals;
      modalBody.querySelector('.modal-apply-btn').onclick = () => {
        closeModals();
        openApplyModal(job);
      };
    }

    jobDetailModal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function openApplyModal(job) {
    selectedJob = job;
    if (!applyModal) return;

    const jobTitleLabel = applyModal.querySelector('#applyJobTitleDisplay');
    if (jobTitleLabel) {
      jobTitleLabel.textContent = job ? job.title : 'Position';
    }
    const applyJobIdInput = applyModal.querySelector('#applyJobId');
    if (applyJobIdInput) {
      applyJobIdInput.value = job ? job.id : '';
    }

    // Clear any previous error styling
    applyModal.querySelectorAll('.field-error').forEach(el => el.classList.remove('field-error'));

    applyModal.classList.add('open');
    document.body.style.overflow = 'hidden';

    // Scroll modal to top
    const modalBox = applyModal.querySelector('.modal-box');
    if (modalBox) modalBox.scrollTop = 0;
  }

  function closeModals() {
    if (jobDetailModal) jobDetailModal.classList.remove('open');
    if (applyModal) applyModal.classList.remove('open');
    document.body.style.overflow = '';
  }

  function attachFormHandlers() {
    // 1. Close modal triggers (buttons, overlay backgrounds, escape key)
    document.querySelectorAll('.modal-close, .modal-close-3d, .modal-close-btn').forEach(el => {
      el.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        closeModals();
      };
    });

    document.querySelectorAll('.modal-overlay').forEach(el => {
      el.addEventListener('click', (e) => {
        if (e.target === el) {
          closeModals();
        }
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeModals();
      }
    });

    // 2. Resume File Upload & Drag-and-Drop Area
    const resumeInput = document.getElementById('applicantResume');
    const uploadArea = document.getElementById('resumeUploadArea');
    const fileStatusLabel = document.getElementById('resumeFileStatus');
    const uploadIcon = document.getElementById('resumeUploadIcon');
    const uploadTitle = document.getElementById('resumeUploadTitle');
    const clearBtn = document.getElementById('clearResumeBtn');

    function resetResumeFile() {
      resumeBase64 = '';
      resumeFileName = '';
      if (resumeInput) resumeInput.value = '';
      if (uploadArea) {
        uploadArea.classList.remove('dragover');
        uploadArea.style.borderColor = '';
      }
      if (uploadIcon) uploadIcon.textContent = '📄';
      if (uploadTitle) uploadTitle.textContent = 'Click or drag & drop resume file here';
      if (fileStatusLabel) fileStatusLabel.textContent = 'Supports PDF, DOC, DOCX, TXT, PNG, JPG (Max 5MB)';
      if (clearBtn) clearBtn.style.display = 'none';
    }

    if (clearBtn) {
      clearBtn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        resetResumeFile();
      };
    }

    function processResumeFile(file) {
      if (!file) return;

      // Extensions whitelist
      const allowedExtRegex = /\.(pdf|docx?|rtf|txt|png|jpe?g)$/i;
      if (!allowedExtRegex.test(file.name)) {
        showErrorField(uploadArea, 'Invalid file format. Please upload PDF, DOC, DOCX, TXT, PNG, or JPG.');
        resetResumeFile();
        return;
      }

      // Max size: 5MB
      if (file.size > 5 * 1024 * 1024) {
        showErrorField(uploadArea, 'File size exceeds 5MB limit. Please choose a smaller resume file.');
        resetResumeFile();
        return;
      }

      if (uploadArea) {
        uploadArea.classList.remove('field-error');
        uploadArea.style.borderColor = '#10b981';
      }

      resumeFileName = file.name;
      const reader = new FileReader();
      reader.onload = (evt) => {
        resumeBase64 = evt.target.result;
        if (uploadIcon) uploadIcon.textContent = '✅';
        if (uploadTitle) uploadTitle.textContent = 'Resume Attached Successfully';
        if (fileStatusLabel) {
          fileStatusLabel.innerHTML = `<strong>${escapeHTML(file.name)}</strong> (${(file.size / 1024).toFixed(1)} KB)`;
        }
        if (clearBtn) clearBtn.style.display = 'inline-block';
      };
      reader.onerror = () => {
        showErrorField(uploadArea, 'Failed to read file. Please try again.');
        resetResumeFile();
      };
      reader.readAsDataURL(file);
    }

    if (uploadArea && resumeInput) {
      uploadArea.onclick = (e) => {
        if (e.target === clearBtn) return;
        resumeInput.click();
      };

      resumeInput.onchange = (e) => {
        if (e.target.files && e.target.files[0]) {
          processResumeFile(e.target.files[0]);
        }
      };

      // Drag & Drop
      ['dragenter', 'dragover'].forEach(eventName => {
        uploadArea.addEventListener(eventName, (e) => {
          e.preventDefault();
          e.stopPropagation();
          uploadArea.classList.add('dragover');
        }, false);
      });

      ['dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, (e) => {
          e.preventDefault();
          e.stopPropagation();
          uploadArea.classList.remove('dragover');
        }, false);
      });

      uploadArea.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt ? dt.files : null;
        if (files && files.length > 0) {
          processResumeFile(files[0]);
        }
      }, false);
    }

    // 3. Clear errors as user inputs
    const jobAppForm = document.getElementById('jobApplicationForm');
    if (jobAppForm) {
      jobAppForm.querySelectorAll('input, select, textarea').forEach(input => {
        input.addEventListener('input', () => {
          input.classList.remove('field-error');
          input.style.borderColor = '';
        });
        input.addEventListener('change', () => {
          input.classList.remove('field-error');
          input.style.borderColor = '';
        });
      });

      // 4. Form Submission
      jobAppForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const nameInput = document.getElementById('applicantName');
        const emailInput = document.getElementById('applicantEmail');
        const phoneInput = document.getElementById('applicantPhone');
        const statusSelect = document.getElementById('applicantStatus');
        const expInput = document.getElementById('applicantExperience');
        const skillsInput = document.getElementById('applicantSkills');
        const portfolioInput = document.getElementById('applicantPortfolio');
        const messageInput = document.getElementById('applicantMessage');
        const submitBtn = document.getElementById('submitAppBtn') || jobAppForm.querySelector('button[type="submit"]');

        const name = nameInput ? nameInput.value.trim() : '';
        const email = emailInput ? emailInput.value.trim() : '';
        const phone = phoneInput ? phoneInput.value.trim() : '';
        const status = statusSelect ? statusSelect.value : '';
        const experience = expInput ? expInput.value.trim() : '';
        const skills = skillsInput ? skillsInput.value.trim() : '';
        const portfolio = portfolioInput ? portfolioInput.value.trim() : '';
        const message = messageInput ? messageInput.value.trim() : '';

        // Validation Checks
        if (!name) {
          showErrorField(nameInput, 'Please enter your Full Name.');
          return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
          showErrorField(emailInput, 'Please enter a valid email address (e.g. name@domain.com).');
          return;
        }

        const phoneClean = phone.replace(/[\s\-\(\)\+]/g, '');
        if (!phone || phoneClean.length < 8) {
          showErrorField(phoneInput, 'Please enter a valid mobile / WhatsApp contact number.');
          return;
        }

        if (!status) {
          showErrorField(statusSelect, 'Please select your current status.');
          return;
        }

        if (!experience) {
          showErrorField(expInput, 'Please specify your Passout Year or Experience Years.');
          return;
        }

        if (!skills) {
          showErrorField(skillsInput, 'Please list your Primary Skills & Tech Stack.');
          return;
        }

        if (!resumeBase64) {
          showErrorField(uploadArea, 'Please attach your Resume / CV (PDF, DOCX, TXT, PNG, JPG).');
          return;
        }

        // Disable submit button & show spinner
        const originalBtnHTML = submitBtn ? submitBtn.innerHTML : 'Submit Application 🚀';
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = `
            <span style="display:inline-block;width:14px;height:14px;border:2px solid #fff;border-top-color:transparent;border-radius:50%;animation:spin 0.6s linear infinite;margin-right:8px;vertical-align:middle;"></span>
            Submitting Application...
          `;
        }

        try {
          // Cloudinary Upload (with 8s timeout safeguard)
          let uploadedResumeUrl = '';
          const CLOUDINARY_CLOUD_NAME = 'dzfntkzce';
          const CLOUDINARY_UPLOAD_PRESET = 'shaivika_social_uploads';

          if (resumeBase64 && CLOUDINARY_CLOUD_NAME !== 'YOUR_CLOUD_NAME_HERE') {
            try {
              const formData = new FormData();
              formData.append('file', resumeBase64);
              formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

              const cloudController = new AbortController();
              const cloudTimeout = setTimeout(() => cloudController.abort(), 8000);

              const cloudinaryRes = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`, {
                method: 'POST',
                body: formData,
                signal: cloudController.signal
              });
              clearTimeout(cloudTimeout);

              const cloudinaryData = await cloudinaryRes.json();
              if (cloudinaryData && cloudinaryData.secure_url) {
                uploadedResumeUrl = cloudinaryData.secure_url;
              }
            } catch (cloudErr) {
              console.warn('Cloudinary upload warning (using fallback base64):', cloudErr);
            }
          }

          const applicationData = {
            id: 'app_' + Date.now(),
            jobId: selectedJob ? selectedJob.id : 'general',
            jobTitle: selectedJob ? selectedJob.title : 'General Application',
            name,
            email,
            phone,
            status,
            experience,
            skills,
            portfolio,
            message,
            resumeFileName: resumeFileName || 'Resume.pdf',
            resumeBase64: resumeBase64 || '',
            resumeUrl: uploadedResumeUrl || '',
            submittedAt: new Date().toISOString(),
            appStatus: 'pending'
          };

          // 1. Save to Local Storage (Admin Panel Database)
          try {
            const cachedApps = localStorage.getItem('shaivika_job_applications');
            let apps = cachedApps ? JSON.parse(cachedApps) : [];
            apps.unshift(applicationData);
            localStorage.setItem('shaivika_job_applications', JSON.stringify(apps));
          } catch (storageErr) {
            console.error('LocalStorage save error:', storageErr);
          }

          // 2. Google Apps Script Sync
          const gasUrl = 'https://script.google.com/macros/s/AKfycbzmRvImPbmXCG_Y0jKWkq6LZP1JyPWN3tfQlSl6br0-70fr0JTH93ro9JMD46xPSzZ2/exec';
          if (gasUrl) {
            try {
              const { resumeBase64: _b64, ...dataToSync } = applicationData;
              let gasIframe = document.getElementById('_gasIframe');
              if (!gasIframe) {
                gasIframe = document.createElement('iframe');
                gasIframe.name = '_gasIframe';
                gasIframe.id = '_gasIframe';
                gasIframe.style.cssText = 'position:absolute;width:0;height:0;border:0;visibility:hidden;';
                document.body.appendChild(gasIframe);
              }

              const hiddenForm = document.createElement('form');
              hiddenForm.method = 'POST';
              hiddenForm.action = gasUrl;
              hiddenForm.target = '_gasIframe';
              hiddenForm.style.cssText = 'display:none;';
              hiddenForm.enctype = 'application/x-www-form-urlencoded';

              const input = document.createElement('input');
              input.type = 'hidden';
              input.name = 'data';
              input.value = JSON.stringify(dataToSync);
              hiddenForm.appendChild(input);

              document.body.appendChild(hiddenForm);
              hiddenForm.submit();
              setTimeout(() => hiddenForm.remove(), 1000);
            } catch (gasErr) {
              console.warn('GAS form submit warning:', gasErr);
            }
          }

          // 3. Show Success Celebration Toast
          showSubmitSuccessToast(name, selectedJob ? selectedJob.title : 'Position');

          // 4. Reset form & close modal
          jobAppForm.reset();
          resetResumeFile();
          closeModals();
        } catch (err) {
          console.error('Error submitting application:', err);
          showSubmitSuccessToast(name, selectedJob ? selectedJob.title : 'Position');
          jobAppForm.reset();
          resetResumeFile();
          closeModals();
        } finally {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnHTML;
          }
        }
      });
    }
  }

  function showErrorField(el, message) {
    if (!el) return;
    el.classList.add('field-error');
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    if (typeof el.focus === 'function') {
      el.focus();
    }
    showNotification(message, 'error');
  }

  function showNotification(message, type = 'info') {
    const existing = document.querySelector('.custom-form-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'custom-form-toast';
    const isError = type === 'error';
    const safeMsg = escapeHTML(message);

    toast.innerHTML = `
      <div style="display:flex;align-items:center;gap:10px;">
        <span style="font-size:1.2rem;">${isError ? '⚠️' : 'ℹ️'}</span>
        <span style="font-size:13px;font-weight:600;">${safeMsg}</span>
      </div>
    `;
    toast.style.cssText = `
      position: fixed;
      top: 24px;
      left: 50%;
      transform: translateX(-50%) translateY(-30px);
      background: ${isError ? '#ef4444' : '#2563eb'};
      color: white;
      padding: 12px 22px;
      border-radius: 12px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.25);
      z-index: 10001;
      opacity: 0;
      transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
      font-family: var(--font-primary, sans-serif);
      pointer-events: none;
    `;
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
      toast.style.transform = 'translateX(-50%) translateY(0)';
      toast.style.opacity = '1';
    });

    setTimeout(() => {
      toast.style.transform = 'translateX(-50%) translateY(-30px)';
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 400);
    }, 4000);
  }

  function showSubmitSuccessToast(candidateName, jobTitle) {
    const existing = document.querySelector('.custom-toast-notification');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'custom-toast-notification';
    const safeName = escapeHTML(candidateName);
    const safeTitle = escapeHTML(jobTitle);
    toast.innerHTML = `
      <div style="display:flex;align-items:center;gap:14px;">
        <span style="font-size:2rem;">🎉</span>
        <div>
          <strong style="display:block;font-size:15px;color:#fff;margin-bottom:2px;">Application Submitted Successfully!</strong>
          <span style="font-size:13px;color:rgba(255,255,255,0.9);">Thank you, <strong>${safeName}</strong>. Your application for <strong>${safeTitle}</strong> has been received.</span>
        </div>
      </div>
    `;
    toast.style.cssText = `
      position: fixed;
      bottom: 30px;
      left: 50%;
      transform: translateX(-50%) translateY(100px);
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      padding: 16px 26px;
      border-radius: 16px;
      box-shadow: 0 12px 35px rgba(16, 185, 129, 0.45);
      z-index: 10002;
      opacity: 0;
      transition: all 0.45s cubic-bezier(0.4, 0, 0.2, 1);
      font-family: var(--font-primary, sans-serif);
    `;
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
      toast.style.transform = 'translateX(-50%) translateY(0)';
      toast.style.opacity = '1';
    });

    setTimeout(() => {
      toast.style.transform = 'translateX(-50%) translateY(100px)';
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 500);
    }, 5500);
  }

  // Reactive listeners to immediately reflect changes from Admin Dashboard
  window.addEventListener('storage', (e) => {
    if (e.key === 'shaivika_job_postings') {
      try {
        const cached = localStorage.getItem('shaivika_job_postings');
        if (cached) {
          activeJobs = JSON.parse(cached);
          renderJobs();
        }
      } catch (err) {
        console.warn('Error reloading job postings from storage:', err);
      }
    }
  });

  window.addEventListener('focus', () => {
    try {
      const cached = localStorage.getItem('shaivika_job_postings');
      if (cached) {
        activeJobs = JSON.parse(cached);
        renderJobs();
      }
    } catch (err) {}
  });

  document.addEventListener('shaivika_jobs_updated', (e) => {
    if (e.detail && Array.isArray(e.detail)) {
      activeJobs = e.detail;
      renderJobs();
    } else {
      try {
        const cached = localStorage.getItem('shaivika_job_postings');
        if (cached) {
          activeJobs = JSON.parse(cached);
          renderJobs();
        }
      } catch (err) {}
    }
  });
});
