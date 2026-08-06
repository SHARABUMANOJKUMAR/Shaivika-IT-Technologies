/**
 * SHAIVIKA IT TECHNOLOGIES - Dynamic Portfolio Manager (Production Grade)
 * 
 * Features:
 * - Real-time synchronization between Admin Portal (LocalStorage) and Google Sheet (GAS Web App)
 * - Dynamic Category Extraction and Interactive Filtering
 * - Smart Sorting (Newest & custom admin projects appear at the top of Page 1)
 * - Intelligent Non-destructive 2-Way Merging (Never loses newly added local projects)
 * - Multi-Tab, Same-Window, & Tab-Switch (Visibility) Event Sync
 * - Dynamic Modal Drawer for Custom Projects
 * - Responsive Pagination & Smooth Scroll
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

  // Curated Gradients for project thumbs without custom images
  const thumbGradients = [
    'linear-gradient(135deg, rgba(0, 102, 255, 0.35), rgba(124, 58, 237, 0.35))',
    'linear-gradient(135deg, rgba(0, 212, 255, 0.25), rgba(0, 102, 255, 0.35))',
    'linear-gradient(135deg, rgba(124, 58, 237, 0.35), rgba(0, 245, 212, 0.25))',
    'linear-gradient(135deg, rgba(0, 180, 255, 0.25), rgba(124, 58, 237, 0.25))',
    'linear-gradient(135deg, rgba(0, 245, 212, 0.25), rgba(0, 102, 255, 0.25))',
    'linear-gradient(135deg, rgba(248, 37, 133, 0.2), rgba(124, 58, 237, 0.35))'
  ];

  // Category ID to Tag Class Map
  const tagClassMap = {
    webapp: 'tag-blue',
    ai: 'tag-purple',
    ui: 'tag-cyan',
    saas: 'tag-cyan',
    enterprise: 'tag-green',
    mobile: 'tag-blue',
    cloud: 'tag-cyan'
  };

  // Base Showcase Categories
  const DEFAULT_CATEGORIES = [
    { id: "webapp", name: "Web Apps" },
    { id: "ai", name: "AI & Automation" },
    { id: "ui", name: "UI Design" },
    { id: "saas", name: "SaaS" },
    { id: "enterprise", name: "Enterprise" }
  ];

  // Base Verified Projects
  const DEFAULT_PROJECTS = [
    {
      id: "p1",
      title: "Manspharshcare Platform",
      description: "Comprehensive healthcare web platform built for Manspharshcare.xyz — featuring patient portal, appointment booking, and telemedicine.",
      categories: ["webapp", "ui"],
      link: "https://mansparshcare.xyz/",
      image: "",
      emoji: "🏥",
      modalId: "#modal-manspharsh",
      status: "active",
      created_at: "2025-01-10 10:00:00"
    },
    {
      id: "p2",
      title: "Siddartha Hostel Management",
      description: "Smart hostel management with room allocation, fee automation, and WhatsApp notification integration.",
      categories: ["webapp", "enterprise"],
      link: "https://siddarthainstitutions-boys-hostel.netlify.app/",
      image: "",
      emoji: "🏠",
      modalId: "#modal-hostel",
      status: "active",
      created_at: "2025-01-12 11:00:00"
    }
  ];

  // Helper: Normalize project schema
  function normalizeProject(p) {
    let cats = [];
    if (Array.isArray(p.categories)) {
      cats = p.categories;
    } else if (typeof p.categories === 'string') {
      cats = p.categories.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
    }
    if (cats.length === 0) cats = ['webapp'];

    return {
      id: String(p.id || ('proj_' + Date.now())),
      title: String(p.title || 'Untitled Project'),
      description: String(p.description || ''),
      categories: cats,
      link: String(p.link || 'contact.html'),
      emoji: String(p.emoji || '💼'),
      image: String(p.image || ''),
      modalId: String(p.modalId || ''),
      status: String(p.status || 'active'),
      created_at: p.created_at || new Date().toISOString()
    };
  }

  // Helper: Smart sorting (Custom projects / newly created projects appear FIRST at top of Page 1)
  function sortProjects(list) {
    return [...list].sort((a, b) => {
      const aIsCustom = a.id && a.id.startsWith('proj_');
      const bIsCustom = b.id && b.id.startsWith('proj_');

      if (aIsCustom && !bIsCustom) return -1;
      if (!aIsCustom && bIsCustom) return 1;

      // Both custom: newest first
      if (aIsCustom && bIsCustom) {
        const timeA = a.id.replace('proj_', '');
        const timeB = b.id.replace('proj_', '');
        return Number(timeB) - Number(timeA);
      }

      // Default projects: order by numerical id (p1, p2, ...)
      const numA = parseInt(String(a.id).replace(/\D/g, '')) || 999;
      const numB = parseInt(String(b.id).replace(/\D/g, '')) || 999;
      return numA - numB;
    });
  }

  // Helper: Dynamic category discovery (extracts all unique category slugs and ensures readable labels)
  function resolveCategories(loadedCats, projectList) {
    const catMap = new Map();

    // 1. Add base categories first
    DEFAULT_CATEGORIES.forEach(c => catMap.set(c.id, c.name));

    // 2. Add loaded categories
    if (Array.isArray(loadedCats)) {
      loadedCats.forEach(c => {
        if (c && c.id) catMap.set(c.id, c.name || c.id);
      });
    }

    // 3. Add any custom categories discovered in projects
    projectList.forEach(p => {
      if (Array.isArray(p.categories)) {
        p.categories.forEach(cId => {
          if (cId && !catMap.has(cId)) {
            // Capitalize title
            const formattedName = cId.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            catMap.set(cId, formattedName);
          }
        });
      }
    });

    const result = [];
    catMap.forEach((name, id) => {
      result.push({ id, name });
    });
    return result;
  }

  // Initialize Portfolio
  initPortfolio();

  // 1. Cross-Tab Sync (Admin Portal <-> Main Website)
  window.addEventListener('storage', (e) => {
    if (e.key === 'shaivika_portfolio_projects' || e.key === 'shaivika_portfolio_categories') {
      reloadFromLocalStorage();
    }
  });

  // 2. Same-Window Custom Event Sync
  window.addEventListener('shaivika_portfolio_updated', () => {
    reloadFromLocalStorage();
  });

  // 3. Tab Visibility Re-sync (when user switches back from Admin tab)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      reloadFromLocalStorage();
    }
  });

  function reloadFromLocalStorage() {
    const cachedProjects = localStorage.getItem('shaivika_portfolio_projects');
    const cachedCats = localStorage.getItem('shaivika_portfolio_categories');
    if (cachedProjects) {
      try {
        const parsed = JSON.parse(cachedProjects);
        if (Array.isArray(parsed) && parsed.length > 0) {
          projects = sortProjects(parsed.map(normalizeProject));
          categories = resolveCategories(cachedCats ? JSON.parse(cachedCats) : DEFAULT_CATEGORIES, projects);
          render();
        }
      } catch (err) {
        console.warn('Error reading updated localStorage:', err);
      }
    }
  }

  async function initPortfolio() {
    try {
      let loadedCategories = DEFAULT_CATEGORIES;
      let loadedProjects = DEFAULT_PROJECTS;

      // Attempt loading baseline from portfolio.json
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

      // Check LocalStorage cache
      const cachedProjects = localStorage.getItem('shaivika_portfolio_projects');
      const cachedCategories = localStorage.getItem('shaivika_portfolio_categories');

      let combinedProjects = [];
      if (cachedProjects) {
        try {
          const parsedCached = JSON.parse(cachedProjects);
          if (Array.isArray(parsedCached) && parsedCached.length > 0) {
            combinedProjects = parsedCached.map(normalizeProject);
          }
        } catch (e) {
          console.warn('Error parsing cached projects:', e);
        }
      }

      // Merge baseline projects if not already present
      const projectMap = new Map();
      loadedProjects.forEach(p => {
        const norm = normalizeProject(p);
        projectMap.set(norm.id, norm);
      });
      // Layer cached / admin projects on top
      combinedProjects.forEach(p => {
        projectMap.set(p.id, p);
      });

      projects = sortProjects(Array.from(projectMap.values()));
      categories = resolveCategories(cachedCategories ? JSON.parse(cachedCategories) : loadedCategories, projects);

      // Save initial resolved state
      localStorage.setItem('shaivika_portfolio_projects', JSON.stringify(projects));
      localStorage.setItem('shaivika_portfolio_categories', JSON.stringify(categories));

      // Initial Render
      render();

      // ==========================================================
      // LIVE GOOGLE SHEET RESILIENT SYNC (Fetch + JSONP Fallback)
      // ==========================================================
      const DEFAULT_GAS_URL = 'https://script.google.com/macros/s/AKfycbwBnqwzKd77hBm3Ij8AtoXRnChjQrTgVv_wu3VFIXPKG8vtkNQ81A7TlarM67Kzl76t/exec';
      const gasUrl = localStorage.getItem('shaivika_gas_portfolio_url') || DEFAULT_GAS_URL;

      async function fetchGasProjects(url) {
        if (!url) return null;
        const getUrl = url.includes('?') ? `${url}&action=getProjects` : `${url}?action=getProjects`;

        // 1. Try standard fetch with 7s timeout
        try {
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), 7000);
          const gasRes = await fetch(getUrl, { cache: 'no-store', signal: controller.signal });
          clearTimeout(timer);
          if (gasRes.ok) {
            const gasData = await gasRes.json();
            if (gasData && gasData.status === 'success' && Array.isArray(gasData.projects)) {
              return gasData.projects;
            }
          }
        } catch (fetchErr) {
          console.info('Fetch notice, trying JSONP channel:', fetchErr.message);
        }

        // 2. Cross-origin JSONP script fallback
        return new Promise((resolve) => {
          const callbackName = 'shaivika_main_gas_' + Date.now() + '_' + Math.floor(Math.random() * 10000);
          const script = document.createElement('script');
          const timeout = setTimeout(() => {
            cleanup();
            resolve(null);
          }, 8000);

          function cleanup() {
            clearTimeout(timeout);
            delete window[callbackName];
            if (script.parentNode) script.parentNode.removeChild(script);
          }

          window[callbackName] = function (resp) {
            cleanup();
            if (resp && resp.status === 'success' && Array.isArray(resp.projects)) {
              resolve(resp.projects);
            } else {
              resolve(null);
            }
          };

          script.src = `${getUrl}&callback=${callbackName}&_t=${Date.now()}`;
          script.onerror = function () {
            cleanup();
            resolve(null);
          };
          document.head.appendChild(script);
        });
      }

      if (gasUrl) {
        fetchGasProjects(gasUrl).then(gasProjects => {
          if (Array.isArray(gasProjects) && gasProjects.length > 0) {
            projects = sortProjects(gasProjects.map(normalizeProject));
            categories = resolveCategories(categories, projects);

            localStorage.setItem('shaivika_portfolio_projects', JSON.stringify(projects));
            localStorage.setItem('shaivika_portfolio_categories', JSON.stringify(categories));
            render();
            console.log(`✅ Synced ${projects.length} portfolio projects from Google Sheet.`);
          }
        });
      }
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

    filterBar.innerHTML = '';

    // 1. "All Projects" Tab
    const allBtn = document.createElement('button');
    allBtn.className = `filter-btn ${currentFilter === 'all' ? 'active' : ''}`;
    allBtn.textContent = 'All Projects';
    allBtn.dataset.filter = 'all';
    filterBar.appendChild(allBtn);

    // 2. Dynamic Categories
    categories.forEach(cat => {
      const btn = document.createElement('button');
      btn.className = `filter-btn ${currentFilter === cat.id ? 'active' : ''}`;
      btn.textContent = cat.name;
      btn.dataset.filter = cat.id;
      filterBar.appendChild(btn);
    });

    // 3. Filter Click Handlers
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

    // Filter projects by category and active status
    const filteredProjects = projects.filter(proj => {
      if (proj.status === 'inactive' || proj.status === 'deleted') return false;
      if (currentFilter === 'all') return true;
      const cats = Array.isArray(proj.categories) ? proj.categories : [proj.categories];
      return cats.includes(currentFilter);
    });

    // Pagination calculations
    const totalItems = filteredProjects.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

    if (currentPage > totalPages) {
      currentPage = totalPages;
    }

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageItems = filteredProjects.slice(startIndex, endIndex);

    // Render items
    if (pageItems.length === 0) {
      projectsGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: var(--text-secondary); background: rgba(255,255,255,0.02); border: 1px dashed var(--border-glass); border-radius: 16px;">
          <span style="font-size: 3rem; display: block; margin-bottom: 14px; animation: float 3s ease-in-out infinite;">🔍</span>
          <h3 style="color: #fff; margin-bottom: 8px;">No projects found in this category</h3>
          <p style="font-size: 0.95rem; color: var(--text-muted);">Try selecting another category or check back shortly.</p>
        </div>
      `;
    } else {
      pageItems.forEach((proj, idx) => {
        const card = document.createElement('div');
        card.className = 'project-card';
        card.style.animation = 'fadeInUp 0.4s ease forwards';

        // Thumbnail Construction
        let thumbHTML = '';
        if (proj.image && proj.image.trim() !== '') {
          thumbHTML = `
            <div class="project-thumb" style="position:relative; overflow:hidden; background:#0f172a;">
              <img src="${proj.image}" alt="${proj.title}" loading="lazy" style="width:100%; height:100%; object-fit:cover; transition:transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
              <div style="display:none; width:100%; height:100%; position:absolute; top:0; left:0; align-items:center; justify-content:center; background:${thumbGradients[idx % thumbGradients.length]};">
                <span style="font-size:2.8rem;">${proj.emoji || '💼'}</span>
              </div>
            </div>
          `;
        } else {
          const gradient = thumbGradients[idx % thumbGradients.length];
          thumbHTML = `
            <div class="project-thumb" style="background:${gradient}; display:flex; align-items:center; justify-content:center; position:relative; overflow:hidden;">
              <span style="position:relative; z-index:2; font-size:2.8rem; filter:drop-shadow(0 4px 10px rgba(0,0,0,0.3));">${proj.emoji || '💼'}</span>
            </div>
          `;
        }

        // Category Tag Badges
        const tagsHTML = (proj.categories || []).map(catId => {
          const cat = categories.find(c => c.id === catId);
          const name = cat ? cat.name : catId;
          const tagClass = tagClassMap[catId] || 'tag-blue';
          return `<span class="tag ${tagClass}" style="font-size: 0.72rem; padding: 4px 10px;">${name}</span>`;
        }).join('');

        // Action Buttons
        let actionButtonHTML = '';
        if (proj.modalId && document.querySelector(proj.modalId)) {
          actionButtonHTML = `<span class="read-more" style="color:var(--accent); font-weight:600; cursor:pointer;">View Case Study →</span>`;
        } else {
          actionButtonHTML = `<span class="read-more" style="color:var(--cyan); font-weight:600; cursor:pointer;">View Details →</span>`;
        }

        let liveButtonHTML = '';
        if (proj.link && proj.link !== '#' && proj.link !== 'contact.html') {
          const isExternal = proj.link.startsWith('http');
          liveButtonHTML = `
            <a href="${proj.link}" target="${isExternal ? '_blank' : '_self'}" rel="${isExternal ? 'noopener noreferrer' : ''}" class="btn btn-ghost btn-sm" style="padding: 6px 14px; font-size: 0.8rem;" onclick="event.stopPropagation()">
              <span>Live Demo</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-left:4px;">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                <polyline points="15 3 21 3 21 9"/>
                <line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
            </a>
          `;
        } else {
          liveButtonHTML = `
            <a href="contact.html" class="btn btn-ghost btn-sm" style="padding: 6px 14px; font-size: 0.8rem;" onclick="event.stopPropagation()">Inquire →</a>
          `;
        }

        card.innerHTML = `
          ${thumbHTML}
          <div class="project-info">
            <div style="display:flex; gap:6px; margin-bottom:10px; flex-wrap:wrap;">
              ${tagsHTML}
            </div>
            <h3 class="project-title">${proj.title}</h3>
            <p class="project-desc">${proj.description}</p>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:auto; padding-top:14px; border-top:1px solid rgba(255,255,255,0.06);">
              ${actionButtonHTML}
              ${liveButtonHTML}
            </div>
          </div>
        `;

        // Card Click Handler
        card.style.cursor = 'pointer';
        card.onclick = () => {
          if (proj.modalId && document.querySelector(proj.modalId)) {
            const modal = document.querySelector(proj.modalId);
            modal.classList.add('open');
            document.body.style.overflow = 'hidden';
          } else if (proj.link && proj.link.startsWith('http')) {
            window.open(proj.link, '_blank');
          } else {
            openDynamicProjectModal(proj);
          }
        };

        projectsGrid.appendChild(card);
      });
    }

    renderPagination(totalPages);
  }

  // Dynamic Modal for Custom Projects Added in Admin
  function openDynamicProjectModal(proj) {
    let modal = document.getElementById('dynamicProjectModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'dynamicProjectModal';
      modal.className = 'modal';
      modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px; padding: 32px; position: relative;">
          <button class="modal-close" style="position:absolute; top:20px; right:20px;" onclick="closeDynamicProjectModal()">✕</button>
          <div id="dynModalContent"></div>
        </div>
      `;
      document.body.appendChild(modal);

      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeDynamicProjectModal();
      });
    }

    const content = document.getElementById('dynModalContent');
    const tagsHTML = (proj.categories || []).map(catId => {
      const cat = categories.find(c => c.id === catId);
      const name = cat ? cat.name : catId;
      const tagClass = tagClassMap[catId] || 'tag-blue';
      return `<span class="tag ${tagClass}">${name}</span>`;
    }).join(' ');

    let imgHeader = '';
    if (proj.image) {
      imgHeader = `<img src="${proj.image}" style="width:100%; height:220px; object-fit:cover; border-radius:12px; margin-bottom:20px; box-shadow:0 8px 24px rgba(0,0,0,0.4);">`;
    } else {
      imgHeader = `<div style="width:100%; height:140px; border-radius:12px; background:linear-gradient(135deg, rgba(0,102,255,0.2), rgba(124,58,237,0.3)); display:flex; align-items:center; justify-content:center; font-size:3.5rem; margin-bottom:20px;">${proj.emoji || '💼'}</div>`;
    }

    content.innerHTML = `
      ${imgHeader}
      <div style="display:flex; gap:8px; margin-bottom:12px; flex-wrap:wrap;">
        ${tagsHTML}
      </div>
      <h2 style="font-size: 1.6rem; color: #fff; margin-bottom: 12px; font-weight: 700;">${proj.title}</h2>
      <p style="color: var(--text-secondary); line-height: 1.7; font-size: 0.95rem; margin-bottom: 24px;">${proj.description}</p>
      <div style="display: flex; gap: 12px; justify-content: flex-end;">
        <button class="btn btn-secondary" onclick="closeDynamicProjectModal()">Close</button>
        <a href="${proj.link || 'contact.html'}" target="${proj.link && proj.link.startsWith('http') ? '_blank' : '_self'}" class="btn btn-primary">
          <span>${proj.link && proj.link.startsWith('http') ? 'Launch Project ↗' : 'Inquire About Similar 💬'}</span>
        </a>
      </div>
    `;

    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  window.closeDynamicProjectModal = function () {
    const modal = document.getElementById('dynamicProjectModal');
    if (modal) {
      modal.classList.remove('open');
      document.body.style.overflow = '';
    }
  };

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
