/**
 * SHAIVIKA IT TECHNOLOGIES - Careers Manager
 * Dynamic job listings, category filtering, job detail modals,
 * and comprehensive job application submission with resume file upload.
 */
document.addEventListener('DOMContentLoaded', () => {
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
    attachFormHandlers();
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

      const skillsHTML = (job.skills || []).slice(0, 3).map(s => `<span class="tag tag-blue">${s}</span>`).join('');

      card.innerHTML = `
        <div class="job-card-header">
          <div class="job-icon">${job.emoji || '💼'}</div>
          <div>
            <span class="job-department-tag">${job.departmentName || 'General'}</span>
            <h3 class="job-title">${job.title}</h3>
          </div>
        </div>
        <p class="job-desc">${job.overview ? job.overview.substring(0, 130) + '...' : ''}</p>
        <div class="job-meta">
          <span>📍 ${job.location || 'Remote'}</span>
          <span>⏰ ${job.type || 'Full-Time'}</span>
          <span>🎓 ${job.experience || 'Entry Level'}</span>
        </div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:16px;">
          ${skillsHTML}
        </div>
        <div class="job-actions">
          <button class="btn btn-ghost btn-sm btn-view-details" data-job-id="${job.id}">Position Overview →</button>
          <button class="btn btn-primary btn-sm btn-apply-now" data-job-id="${job.id}">Apply Now 🚀</button>
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
      const respHTML = (job.responsibilities || []).map(r => `<li>${r}</li>`).join('');
      const skillsHTML = (job.skills || []).map(s => `<span class="tag tag-purple">${s}</span>`).join('');

      modalBody.innerHTML = `
        <div style="display:flex;align-items:center;gap:16px;margin-bottom:20px;">
          <div style="font-size:3rem;background:var(--gradient-card);width:70px;height:70px;border-radius:16px;display:flex;align-items:center;justify-content:center;border:1px solid var(--border-glass);">
            ${job.emoji || '💼'}
          </div>
          <div>
            <span class="tag tag-cyan" style="margin-bottom:6px;display:inline-block;">${job.departmentName || 'General'}</span>
            <h2 style="font-size:1.6rem;font-weight:800;color:var(--text-primary);">${job.title}</h2>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(140px, 1fr));gap:12px;margin-bottom:24px;background:var(--bg-glass);padding:16px;border-radius:12px;border:1px solid var(--border-glass);">
          <div>
            <div style="font-size:11px;color:var(--text-muted);">Location</div>
            <div style="font-weight:700;font-size:14px;color:var(--text-primary);">📍 ${job.location}</div>
          </div>
          <div>
            <div style="font-size:11px;color:var(--text-muted);">Employment Type</div>
            <div style="font-weight:700;font-size:14px;color:var(--text-primary);">⏰ ${job.type}</div>
          </div>
          <div>
            <div style="font-size:11px;color:var(--text-muted);">Experience Needed</div>
            <div style="font-weight:700;font-size:14px;color:var(--text-primary);">🎓 ${job.experience}</div>
          </div>
        </div>

        <h3 style="font-size:1.1rem;font-weight:700;margin-bottom:8px;color:var(--accent);">Position Overview</h3>
        <p style="font-size:14px;color:var(--text-secondary);line-height:1.7;margin-bottom:20px;">${job.overview}</p>

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
      jobTitleLabel.textContent = job.title;
    }
    const applyJobIdInput = applyModal.querySelector('#applyJobId');
    if (applyJobIdInput) {
      applyJobIdInput.value = job.id;
    }

    // Reset resume variables
    resumeBase64 = '';
    resumeFileName = '';
    const fileLabel = applyModal.querySelector('#resumeFileStatus');
    if (fileLabel) fileLabel.textContent = 'No file selected (PDF, DOCX, JPG, PNG)';

    applyModal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModals() {
    if (jobDetailModal) jobDetailModal.classList.remove('open');
    if (applyModal) applyModal.classList.remove('open');
    document.body.style.overflow = '';
  }

  function attachFormHandlers() {
    // Close modal triggers
    document.querySelectorAll('.modal-close, .modal-overlay').forEach(el => {
      el.addEventListener('click', (e) => {
        if (e.target === el || e.target.classList.contains('modal-close')) {
          closeModals();
        }
      });
    });

    // Resume file input change listener
    const resumeInput = document.getElementById('applicantResume');
    const fileStatusLabel = document.getElementById('resumeFileStatus');

    if (resumeInput) {
      resumeInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
          alert('File size exceeds 5MB limit. Please choose a smaller resume file.');
          resumeInput.value = '';
          if (fileStatusLabel) fileStatusLabel.textContent = 'File too large (>5MB)';
          return;
        }

        resumeFileName = file.name;
        const reader = new FileReader();
        reader.onload = (evt) => {
          resumeBase64 = evt.target.result;
          if (fileStatusLabel) {
            fileStatusLabel.innerHTML = `✓ Selected: <strong>${file.name}</strong> (${(file.size / 1024).toFixed(1)} KB)`;
          }
        };
        reader.readAsDataURL(file);
      });
    }

    // Application Form Submission
    const jobAppForm = document.getElementById('jobApplicationForm');
    if (jobAppForm) {
      jobAppForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('applicantName').value.trim();
        const email = document.getElementById('applicantEmail').value.trim();
        const phone = document.getElementById('applicantPhone').value.trim();
        const status = document.getElementById('applicantStatus').value;
        const experience = document.getElementById('applicantExperience').value.trim();
        const skills = document.getElementById('applicantSkills').value.trim();
        const portfolio = document.getElementById('applicantPortfolio').value.trim();
        const message = document.getElementById('applicantMessage').value.trim();

        if (!name || !email || !phone) {
          alert('Please fill in required fields: Name, Email, and Phone number.');
          return;
        }

        // ==========================================
        // CLOUDINARY UPLOAD CONFIGURATION
        // ==========================================
        // IMPORTANT: Replace these with your actual Cloudinary details
        const CLOUDINARY_CLOUD_NAME = 'dzfntkzce'; 
        const CLOUDINARY_UPLOAD_PRESET = 'shaivika_social_uploads'; 
        
        let uploadedResumeUrl = '';
        
        if (resumeBase64 && CLOUDINARY_CLOUD_NAME !== 'YOUR_CLOUD_NAME_HERE') {
            try {
                // Show uploading state on button
                const submitBtn = jobAppForm.querySelector('button[type="submit"]');
                const originalText = submitBtn.innerHTML;
                submitBtn.innerHTML = 'Uploading Resume...';
                submitBtn.disabled = true;

                const formData = new FormData();
                formData.append('file', resumeBase64);
                formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
                
                const cloudinaryRes = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`, {
                    method: 'POST',
                    body: formData
                });
                
                const cloudinaryData = await cloudinaryRes.json();
                if (cloudinaryData.secure_url) {
                    uploadedResumeUrl = cloudinaryData.secure_url;
                } else {
                    console.error("Cloudinary error:", cloudinaryData);
                }
                
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            } catch (err) {
                console.error("Cloudinary upload error:", err);
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
          resumeFileName: resumeFileName || 'No resume uploaded',
          resumeBase64: resumeBase64 || '',
          resumeUrl: uploadedResumeUrl || '', // The Cloudinary link
          submittedAt: new Date().toISOString(),
          appStatus: 'pending' // pending, shortlisted, rejected, hired
        };

        try {
          // 1. Save to Local Storage (Admin Panel Database)
          const cachedApps = localStorage.getItem('shaivika_job_applications');
          let apps = cachedApps ? JSON.parse(cachedApps) : [];
          apps.unshift(applicationData);
          localStorage.setItem('shaivika_job_applications', JSON.stringify(apps));

          // 2. Send to Google Apps Script via hidden form (bypasses CORS + redirect issues)
          const gasUrl = 'https://script.google.com/macros/s/AKfycbzmRvImPbmXCG_Y0jKWkq6LZP1JyPWN3tfQlSl6br0-70fr0JTH93ro9JMD46xPSzZ2/exec';
          if (gasUrl) {
            try {
              const { resumeBase64: _b64, ...dataToSync } = applicationData;

              // Use an invisible iframe as form target so no page navigation occurs
              let gasIframe = document.getElementById('_gasIframe');
              if (!gasIframe) {
                gasIframe = document.createElement('iframe');
                gasIframe.name = '_gasIframe';
                gasIframe.id   = '_gasIframe';
                gasIframe.style.cssText = 'position:absolute;width:0;height:0;border:0;visibility:hidden;';
                document.body.appendChild(gasIframe);
              }

              const hiddenForm = document.createElement('form');
              hiddenForm.method  = 'POST';
              hiddenForm.action  = gasUrl;
              hiddenForm.target  = '_gasIframe';
              hiddenForm.style.cssText = 'display:none;';
              hiddenForm.enctype = 'application/x-www-form-urlencoded';

              // Attach payload as a single field called 'data'
              const input = document.createElement('input');
              input.type  = 'hidden';
              input.name  = 'data';
              input.value = JSON.stringify(dataToSync);
              hiddenForm.appendChild(input);

              document.body.appendChild(hiddenForm);
              hiddenForm.submit();
              document.body.removeChild(hiddenForm);
            } catch(gasErr) {
              console.error('GAS form submit error:', gasErr);
            }

            // Dual mode: direct JSON fetch to Google Sheet
            fetch(gasUrl, {
              method: 'POST',
              body: JSON.stringify({
                jobId:          applicationData.jobId,
                jobTitle:       applicationData.jobTitle,
                name:           applicationData.name,
                email:          applicationData.email,
                phone:          applicationData.phone,
                status:         applicationData.status,
                experience:     applicationData.experience,
                skills:         applicationData.skills,
                portfolio:      applicationData.portfolio,
                message:        applicationData.message,
                resumeFileName: applicationData.resumeFileName,
                resumeUrl:      applicationData.resumeUrl,
                submittedAt:    applicationData.submittedAt
              })
            }).catch(err => console.log('Dual-mode GAS fetch notice:', err));
          }

          // Toast feedback
          showSubmitSuccessToast(name, selectedJob ? selectedJob.title : 'Position');

          // Reset form & close
          jobAppForm.reset();
          closeModals();
        } catch (err) {
          console.error('Error saving application:', err);
          alert('Application saved! Thank you for applying.');
          jobAppForm.reset();
          closeModals();
        }
      });
    }
  }

  function showSubmitSuccessToast(candidateName, jobTitle) {
    const toast = document.createElement('div');
    toast.className = 'custom-toast-notification';
    toast.innerHTML = `
      <div style="display:flex;align-items:center;gap:12px;">
        <span style="font-size:1.8rem;">🎉</span>
        <div>
          <strong style="display:block;font-size:15px;color:#fff;">Application Submitted!</strong>
          <span style="font-size:13px;color:rgba(255,255,255,0.85);">Thank you ${candidateName}. We have received your application for <strong>${jobTitle}</strong>.</span>
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
      padding: 16px 24px;
      border-radius: 16px;
      box-shadow: 0 10px 30px rgba(16, 185, 129, 0.4);
      z-index: 10000;
      transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    `;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.transform = 'translateX(-50%) translateY(0)';
    }, 100);

    setTimeout(() => {
      toast.style.transform = 'translateX(-50%) translateY(100px)';
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 500);
    }, 5000);
  }
});
