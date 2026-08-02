/**
 * SHAIVIKA IT TECHNOLOGIES - Dynamic Portfolio Manager
 * Loads categories and portfolio projects from LocalStorage (with JSON & Inline Fallback),
 * renders filters dynamically, and implements full pagination and filtering.
 */
document.addEventListener('DOMContentLoaded', () => {
  const filterBar = document.querySelector('.filter-bar');
  const projectsGrid = document.querySelector('.projects-grid');
  const paginationContainer = document.querySelector('.pagination');

  if (!projectsGrid) return; // Only run on portfolio pages

  let categories = [];
  let projects = [];
  let currentFilter = 'all';
  let currentPage = 1;
  const itemsPerPage = 6;

  // Gradients for project thumbs without custom images
  const thumbGradients = [
    'linear-gradient(135deg, rgba(0, 102, 255, 0.3), rgba(124, 58, 237, 0.3))',
    'linear-gradient(135deg, rgba(0, 212, 255, 0.2), rgba(0, 102, 255, 0.3))',
    'linear-gradient(135deg, rgba(124, 58, 237, 0.3), rgba(0, 245, 212, 0.2))',
    'linear-gradient(135deg, rgba(0, 180, 255, 0.2), rgba(124, 58, 237, 0.2))',
    'linear-gradient(135deg, rgba(0, 245, 212, 0.2), rgba(0, 102, 255, 0.2))',
    'linear-gradient(135deg, rgba(248, 37, 133, 0.15), rgba(124, 58, 237, 0.3))'
  ];

  // Map category IDs to styling classes
  const tagClassMap = {
    webapp: 'tag-blue',
    ai: 'tag-purple',
    ui: 'tag-purple',
    saas: 'tag-cyan',
    enterprise: 'tag-green'
  };

  // Inline Fallback Dataset for File Protocol & Offline Access
  const DEFAULT_CATEGORIES = [
    { id: "webapp", name: "Web Apps" },
    { id: "ai", name: "AI & Automation" },
    { id: "ui", name: "UI Design" },
    { id: "saas", name: "SaaS" },
    { id: "enterprise", name: "Enterprise" }
  ];

  const DEFAULT_PROJECTS = [
    {
      id: "p1",
      title: "Manspharshcare Platform",
      description: "Comprehensive healthcare web platform built for Manspharshcare.xyz — featuring patient portal, appointment booking, and telemedicine.",
      categories: ["webapp", "ui"],
      link: "https://mansparshcare.xyz/",
      image: "",
      emoji: "🏥",
      modalId: "#modal-manspharsh"
    },
    {
      id: "p2",
      title: "Siddartha Hostel Management",
      description: "Smart hostel management with room allocation, fee automation, and WhatsApp notification integration.",
      categories: ["webapp", "enterprise"],
      link: "https://siddarthainstitutions-boys-hostel.netlify.app/",
      image: "",
      emoji: "🏠",
      modalId: "#modal-hostel"
    },
    {
      id: "p3",
      title: "AI Lead Automation CRM",
      description: "Intelligent lead scoring, WhatsApp follow-ups, pipeline management and conversion analytics.",
      categories: ["ai", "saas"],
      link: "contact.html",
      image: "",
      emoji: "🤖"
    },
    {
      id: "p4",
      title: "Business Analytics Dashboard",
      description: "Real-time data visualization platform with Google Sheets integration, KPI tracking, and automated reports.",
      categories: ["saas", "enterprise"],
      link: "contact.html",
      image: "",
      emoji: "📊"
    },
    {
      id: "p5",
      title: "Real Estate WhatsApp Bot",
      description: "Intelligent WhatsApp bot that qualifies property leads, shares listings, and schedules site visits automatically.",
      categories: ["ai", "webapp"],
      link: "contact.html",
      image: "",
      emoji: "💬"
    },
    {
      id: "p6",
      title: "EdTech Learning Platform",
      description: "Dark-themed e-learning platform with video courses, progress tracking, gamification, and certificate generation.",
      categories: ["ui", "webapp"],
      link: "contact.html",
      image: "",
      emoji: "🎓"
    },
    {
      id: "p7",
      title: "Smart Clinic AI Triage & Slotting",
      description: "AI-driven triage assistant for medical clinics automating slot booking, patient queries, and lab status updates.",
      categories: ["ai", "webapp"],
      link: "contact.html",
      image: "",
      emoji: "🩺"
    },
    {
      id: "p8",
      title: "Cloud Fleet Telematics & GPS Portal",
      description: "Real-time fleet tracking, live GPS map streaming, driver safety analytics, and automated fuel reporting.",
      categories: ["enterprise", "saas"],
      link: "contact.html",
      image: "",
      emoji: "🚚"
    },
    {
      id: "p9",
      title: "E-Commerce Multi-Vendor Marketplace",
      description: "High-speed multi-vendor shopping engine with UPI instant checkout, vendor dashboard, and order sync.",
      categories: ["webapp", "ui"],
      link: "contact.html",
      image: "",
      emoji: "🛍️"
    },
    {
      id: "p10",
      title: "FinTech Investment & Crypto Tracker",
      description: "Next-gen wealth management app with stock API integration, crypto portfolio rebalancing, and tax reporting.",
      categories: ["saas", "ui"],
      link: "contact.html",
      image: "",
      emoji: "📈"
    },
    {
      id: "p11",
      title: "Hospital Bed & Pharmacy ERP",
      description: "Enterprise resource planning system for regional hospitals covering ICU beds, emergency queuing, and pharmacy stock.",
      categories: ["enterprise", "webapp"],
      link: "contact.html",
      image: "",
      emoji: "🏥"
    },
    {
      id: "p12",
      title: "AI Document OCR & Extraction Engine",
      description: "Automated document intelligence tool reading invoices, receipts, and government IDs with 99.4% precision.",
      categories: ["ai", "saas"],
      link: "contact.html",
      image: "",
      emoji: "📄"
    },
    {
      id: "p13",
      title: "Smart City IoT Traffic Console",
      description: "Real-time urban telemetry processing live camera feeds, signal optimization, and emergency vehicle priority.",
      categories: ["enterprise", "ai"],
      link: "contact.html",
      image: "",
      emoji: "🚦"
    },
    {
      id: "p14",
      title: "Restaurant Digital POS & QR Ordering",
      description: "Touchless QR table ordering, kitchen display system (KDS), cloud inventory, and WhatsApp receipt delivery.",
      categories: ["webapp", "ui"],
      link: "contact.html",
      image: "",
      emoji: "🍔"
    },
    {
      id: "p15",
      title: "SaaS Subscription & Invoicing Engine",
      description: "Automated recurring billing gateway handling multi-currency invoices, dunning recovery, and Stripe tax logic.",
      categories: ["saas", "enterprise"],
      link: "contact.html",
      image: "",
      emoji: "💳"
    },
    {
      id: "p16",
      title: "AI Conversational Support Voice Bot",
      description: "Voice-enabled AI customer representative handling inbound support, call routing, and CRM ticket creation.",
      categories: ["ai", "enterprise"],
      link: "contact.html",
      image: "",
      emoji: "🎙️"
    },
    {
      id: "p17",
      title: "Neobank Mobile Banking Interface",
      description: "Glassmorphism design system for modern banking apps with biometric login, card lock controls, and visual budget analytics.",
      categories: ["ui", "webapp"],
      link: "contact.html",
      image: "",
      emoji: "📱"
    },
    {
      id: "p18",
      title: "Supply Chain & Warehouse Manager",
      description: "Industrial warehouse tracking with barcode integration, automated reorder thresholds, and dispatch manifests.",
      categories: ["enterprise", "saas"],
      link: "contact.html",
      image: "",
      emoji: "📦"
    }
  ];

  // Load data
  initPortfolio();

  async function initPortfolio() {
    try {
      let loadedCategories = DEFAULT_CATEGORIES;
      let loadedProjects = DEFAULT_PROJECTS;

      try {
        const response = await fetch('data/portfolio.json');
        if (response.ok) {
          const data = await response.json();
          if (data.categories && data.categories.length > 0) loadedCategories = data.categories;
          if (data.projects && data.projects.length > 0) loadedProjects = data.projects;
        }
      } catch (err) {
        console.warn('Using inline default portfolio dataset (file:// CORS fallback)');
      }

      const initialized = localStorage.getItem('shaivika_portfolio_initialized');
      const cachedCategories = localStorage.getItem('shaivika_portfolio_categories');
      const cachedProjects = localStorage.getItem('shaivika_portfolio_projects');

      if (initialized === 'true' && cachedCategories && cachedProjects) {
        categories = JSON.parse(cachedCategories);
        projects = JSON.parse(cachedProjects);
      } else {
        categories = loadedCategories;
        projects = loadedProjects;
        localStorage.setItem('shaivika_portfolio_categories', JSON.stringify(categories));
        localStorage.setItem('shaivika_portfolio_projects', JSON.stringify(projects));
        localStorage.setItem('shaivika_portfolio_initialized', 'true');
      }

      render();
    } catch (e) {
      console.error('Error initializing portfolio:', e);
    }
  }

  function render() {
    renderFilterBar();
    renderProjects();
  }

  function renderFilterBar() {
    if (!filterBar) return;
    
    // Clear and build filter bar
    filterBar.innerHTML = '';
    
    // Always add "All Projects"
    const allBtn = document.createElement('button');
    allBtn.className = `filter-btn ${currentFilter === 'all' ? 'active' : ''}`;
    allBtn.textContent = 'All Projects';
    allBtn.dataset.filter = 'all';
    filterBar.appendChild(allBtn);

    // Add rest of categories
    categories.forEach(cat => {
      const btn = document.createElement('button');
      btn.className = `filter-btn ${currentFilter === cat.id ? 'active' : ''}`;
      btn.textContent = cat.name;
      btn.dataset.filter = cat.id;
      filterBar.appendChild(btn);
    });

    // Add event listeners using delegation
    filterBar.querySelectorAll('.filter-btn').forEach(btn => {
      btn.onclick = () => {
        filterBar.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        currentPage = 1; // Reset to page 1 on filter change
        renderProjects();
      };
    });
  }

  function renderProjects() {
    projectsGrid.innerHTML = '';

    // Filter projects
    const filteredProjects = projects.filter(proj => {
      if (currentFilter === 'all') return true;
      return proj.categories && proj.categories.includes(currentFilter);
    });

    // Pagination calculations
    const totalItems = filteredProjects.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    
    // Clamp currentPage
    if (currentPage > totalPages && totalPages > 0) {
      currentPage = totalPages;
    }

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageItems = filteredProjects.slice(startIndex, endIndex);

    // Render items
    if (pageItems.length === 0) {
      projectsGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-secondary);">
          <span style="font-size: 2.5rem; display: block; margin-bottom: 10px;">🔍</span>
          <p>No projects found in this category.</p>
        </div>
      `;
    } else {
      pageItems.forEach((proj, idx) => {
        const card = document.createElement('div');
        card.className = 'project-card';
        card.style.animation = 'fadeInUp 0.4s ease forwards';
        
        // Modal support for default ones
        if (proj.modalId) {
          card.setAttribute('data-modal-open', proj.modalId);
        } else if (proj.link) {
          // Newly added projects open link on card click (except when clicking buttons)
          card.onclick = () => {
            window.open(proj.link, '_blank');
          };
          card.style.cursor = 'pointer';
        }

        // Project thumbnail background setup (image or gradient + emoji)
        let thumbStyle = '';
        let thumbContent = '';

        if (proj.image) {
          thumbStyle = `background: url('${proj.image}') no-repeat center center; background-size: cover;`;
        } else {
          const gradient = thumbGradients[idx % thumbGradients.length];
          thumbStyle = `background: ${gradient};`;
          thumbContent = `<span style="position:relative;z-index:2;font-size:2.5rem;">${proj.emoji || '💻'}</span>`;
        }

        // Render category tags
        const tagsHTML = (proj.categories || []).map(catId => {
          const cat = categories.find(c => c.id === catId);
          const name = cat ? cat.name : catId;
          const tagClass = tagClassMap[catId] || 'tag-blue';
          return `<span class="tag ${tagClass}">${name}</span>`;
        }).join('');

        // Action button details
        let actionButtonHTML = '';
        if (proj.modalId) {
          actionButtonHTML = `<span class="read-more">View Case Study →</span>`;
        } else {
          actionButtonHTML = `<span class="read-more">View Details →</span>`;
        }

        let liveButtonHTML = '';
        if (proj.link) {
          const isLive = proj.link.startsWith('http');
          const label = isLive ? 'Live →' : 'Inquire →';
          const target = isLive ? '_blank' : '_self';
          liveButtonHTML = `
            <a href="${proj.link}" target="${target}" class="btn btn-ghost btn-sm"
               onclick="event.stopPropagation()">${label}</a>
          `;
        }

        card.innerHTML = `
          <div class="project-thumb" style="${thumbStyle}">
            ${thumbContent}
          </div>
          <div class="project-info">
            <div style="display:flex;gap:6px;margin-bottom:10px;flex-wrap:wrap;">
              ${tagsHTML}
            </div>
            <h3 class="project-title">${proj.title}</h3>
            <p class="project-desc">${proj.description}</p>
            <div style="display:flex;justify-content:space-between;align-items:center;">
              ${actionButtonHTML}
              ${liveButtonHTML}
            </div>
          </div>
        `;
        
        // Re-attach modal trigger event listener if modal exists
        if (proj.modalId) {
          card.onclick = () => {
            const modal = document.querySelector(proj.modalId);
            if (modal) {
              modal.classList.add('open');
              document.body.style.overflow = 'hidden';
            }
          };
        }

        projectsGrid.appendChild(card);
      });
    }

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
    prevBtn.innerHTML = '‹ Prev';
    prevBtn.disabled = currentPage === 1;
    prevBtn.onclick = () => {
      if (currentPage > 1) {
        currentPage--;
        renderProjects();
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
        renderProjects();
        scrollToGrid();
      };
      paginationContainer.appendChild(pageBtn);
    }

    // Next Button
    const nextBtn = document.createElement('button');
    nextBtn.className = 'page-btn';
    nextBtn.innerHTML = 'Next ›';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.onclick = () => {
      if (currentPage < totalPages) {
        currentPage++;
        renderProjects();
        scrollToGrid();
      }
    };
    paginationContainer.appendChild(nextBtn);
  }

  function scrollToGrid() {
    const rect = projectsGrid.getBoundingClientRect();
    const top = rect.top + window.scrollY - 120;
    window.scrollTo({ top, behavior: 'smooth' });
  }
});
