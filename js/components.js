/**
 * The Unemployed Club - Reusable Web Components
 * Zero-build, standard browser Custom Elements for Header & Sidebar.
 * Eliminates duplicate HTML across all pages while preserving exact styling and 0px editorial rhythm.
 */

(function () {
  'use strict';

  // Reusable 20px Lucide SVGs (1.25px stroke, non-scaling-stroke)
  const ICONS = {
    menu: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>',
    search: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>',
    chevronDown: '<svg class="chevron-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"><path d="m6 9 6 6 6-6"/></svg>',
    upload: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>',
    home: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>',
    shorts: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"><polygon points="6 3 20 12 6 21 6 3"/></svg>',
    explore: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>',
    trending: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>',
    history: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg>',
    admin: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
    login: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" x2="3" y1="12" y2="12"/></svg>',
        videoPlus: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"><path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5"/><rect x="2" y="6" width="14" height="12" rx="0"/><line x1="9" x2="9" y1="10" y2="14"/><line x1="7" x2="11" y1="12" y2="12"/></svg>',
    catalogGrid: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>',
    layers: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"><path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.9a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/></svg>',
    download: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
    externalLink: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>',
    logOut: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>',
    star: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
    register: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></svg>'
  };

  // Immediate sidebar state restoration to avoid layout shifts
  try {
    if (new URLSearchParams(window.location.search).get("collapsed") === "true" || localStorage.getItem("sidebar-collapsed") === "true") {
      document.body.classList.add("sidebar-collapsed");
    }
  } catch (e) {}

  function escapeAttr(str) {
    return String(str || '').replace(/"/g, '&quot;');
  }

  // 1. <site-header> Web Component
  class SiteHeader extends HTMLElement {
    connectedCallback() {
      const currentQuery = new URLSearchParams(window.location.search).get("q") || "";

      this.innerHTML = `
        <header id="header">
          <div class="header-left">
            <button id="menu-toggle" class="menu-toggle-btn" aria-label="Toggle Navigation Menu" title="Toggle Menu">
              ${ICONS.menu}
            </button>
            <h1 class="brand-title"><a href="index.html">The Unemployed Club</a></h1>
          </div>

          <div class="header-center">
            <div class="header-search">
              <input type="text" id="header-search-input" placeholder="Search..." value="${escapeAttr(currentQuery)}" />
              <button class="search-btn" id="header-search-btn" aria-label="Search">
                ${ICONS.search}
              </button>
            </div>
          </div>

          <div class="header-right">
            <div class="user-dropdown-wrapper" id="user-dropdown-wrapper">
              <button class="user-slot-btn" id="user-menu-btn" aria-haspopup="true" aria-expanded="false" title="User Account Menu">
                <img src="images/avatar.jpg" alt="User avatar" class="user-avatar" />
                <span class="user-label">User</span>
                ${ICONS.chevronDown}
              </button>

              <div class="user-dropdown-menu" id="user-dropdown-menu">
                <div class="dropdown-header">Account</div>
                <ul class="dropdown-links">
                  <li>
                    <a href="admin.html" class="dropdown-item">
                      ${ICONS.admin}
                      <span>Admin Studio</span>
                    </a>
                  </li>
                  <li>
                    <a href="login.html" class="dropdown-item">
                      ${ICONS.login}
                      <span>Sign In</span>
                    </a>
                  </li>
                  <li>
                    <a href="register.html" class="dropdown-item">
                      ${ICONS.register}
                      <span>Register</span>
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            <a href="upload.html" class="btn-upload" title="Upload Video">
              ${ICONS.upload}
              <span>Upload</span>
            </a>
          </div>
        </header>
      `;

      this.initEvents();
    }

    initEvents() {
      // Sidebar Toggle
      const toggle = this.querySelector('#menu-toggle');
      if (toggle) {
        toggle.addEventListener('click', () => {
          if (window.innerWidth <= 768) {
            document.body.classList.toggle('mobile-sidebar-open');
          } else {
            const collapsed = document.body.classList.toggle('sidebar-collapsed');
            try { localStorage.setItem('sidebar-collapsed', collapsed); } catch (e) {}
          }
          // Notify any listening layout adjustments (like grid auto-fits)
          window.dispatchEvent(new Event('resize'));
        });
      }

      // User Dropdown Menu
      const userBtn = this.querySelector('#user-menu-btn');
      const dropdown = this.querySelector('#user-dropdown-menu');
      if (userBtn && dropdown) {
        userBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const isActive = dropdown.classList.toggle('is-active');
          userBtn.setAttribute('aria-expanded', isActive);
        });

        document.addEventListener('click', (e) => {
          if (!dropdown.contains(e.target) && !userBtn.contains(e.target)) {
            dropdown.classList.remove('is-active');
            userBtn.setAttribute('aria-expanded', 'false');
          }
        });
      }

      // Search Handler
      const searchInput = this.querySelector('#header-search-input');
      const searchBtn = this.querySelector('#header-search-btn');
      const performSearch = () => {
        const query = searchInput.value.trim();
        const currentPath = window.location.pathname.toLowerCase();
        const isIndex = currentPath.endsWith('index.html') || currentPath.endsWith('/') || currentPath === '';
        if (isIndex) {
          window.dispatchEvent(new CustomEvent('site-search', { detail: { query } }));
        } else {
          window.location.href = `index.html?q=${encodeURIComponent(query)}`;
        }
      };

      if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', performSearch);
        searchInput.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') performSearch();
        });
      }
    }
  }

  // 2. <site-sidebar> Web Component
  // 2. <site-sidebar> Web Component
  // Dynamic Context-Aware Sidebar:
  // - On admin.html: Hubbing Studio Sidebar (Upload, Catalog, Categories/Shelves, Export, View Site, Logout)
  // - On public pages: Editorial Browsing Sidebar (Home, Shorts, Explore, Trending, History)
  class SiteSidebar extends HTMLElement {
    connectedCallback() {
      const mode = (this.getAttribute('mode') || '').toLowerCase();
      const active = (this.getAttribute('active') || '').toLowerCase();
      const currentPath = window.location.pathname.toLowerCase();
      const isAdminPage = mode === 'admin' || currentPath.endsWith('admin.html');

      if (isAdminPage) {
        this.renderAdminSidebar(active);
      } else {
        this.renderPublicSidebar(active);
      }
    }

    renderPublicSidebar(active) {
      this.innerHTML = `
        <aside id="sidebar-nav">
          <ul class="side-links">
            <li>
              <a href="index.html" class="${active === 'home' ? 'active' : ''}" title="Home Feed">
                ${ICONS.home}
                <span>Home</span>
              </a>
            </li>
            <li>
              <a href="shorts.html" class="${active === 'shorts' ? 'active' : ''}" title="Shorts">
                ${ICONS.shorts}
                <span>Shorts</span>
              </a>
            </li>
            <li>
              <a href="#" class="${active === 'explore' ? 'active' : ''}" title="Explore">
                ${ICONS.explore}
                <span>Explore</span>
              </a>
            </li>
            <li>
              <a href="#" class="${active === 'trending' ? 'active' : ''}" title="Trending">
                ${ICONS.trending}
                <span>Trending</span>
              </a>
            </li>
            <li>
              <a href="#" class="${active === 'history' ? 'active' : ''}" title="History">
                ${ICONS.history}
                <span>History</span>
              </a>
            </li>
          </ul>
        </aside>
      `;
    }

    renderAdminSidebar(active) {
      this.innerHTML = `
        <aside id="sidebar-nav">
          <div class="sidebar-section-header">Studio Views</div>
          <ul class="side-links">
            <li>
              <a href="#view-review" id="admin-nav-review" class="${active === 'review' || !active ? 'active' : ''}" title="Review Queue">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                <span>Review Inbox</span>
                <span class="sidebar-pending-badge" id="sidebar-review-badge">0</span>
              </a>
            </li>
            <li>
              <a href="#view-catalog" id="admin-nav-catalog" class="${active === 'catalog' ? 'active' : ''}" title="Video Catalog Manager">
                ${ICONS.catalogGrid}
                <span>Video Catalog</span>
              </a>
            </li>
            <li>
              <a href="#view-upload" id="admin-nav-add" class="${active === 'add' ? 'active' : ''}" title="Upload / Add Video">
                ${ICONS.videoPlus}
                <span>Upload Video</span>
              </a>
            </li>
          </ul>

          <div class="sidebar-section-divider"></div>
          <div class="sidebar-section-header">Categories & Shelves</div>
          <ul class="side-links">
            <li>
              <a href="#view-catalog" id="admin-nav-top" title="Top 2 Rows (Featured)">
                ${ICONS.star}
                <span>Top 2 Rows</span>
              </a>
            </li>
            <li>
              <a href="#view-catalog" id="admin-nav-mid" title="Middle Row (Curated)">
                ${ICONS.layers}
                <span>Middle Row</span>
              </a>
            </li>
            <li>
              <a href="#view-catalog" id="admin-nav-shorts" title="Shorts Shelf (9:16)">
                ${ICONS.shorts}
                <span>Shorts Shelf</span>
              </a>
            </li>
            <li>
              <a href="#view-catalog" id="admin-nav-bottom" title="Bottom Feed">
                ${ICONS.trending}
                <span>Bottom Feed</span>
              </a>
            </li>
          </ul>

          <div class="sidebar-section-divider"></div>
          <div class="sidebar-section-header">Distribution & Exit</div>
          <ul class="side-links">
            <li>
              <a href="#" id="admin-nav-export" title="Download Updated catalog-feed.js">
                ${ICONS.download}
                <span>Export for GitHub</span>
              </a>
            </li>
            <li>
              <a href="index.html" id="admin-nav-site" title="Return to Public Site">
                ${ICONS.externalLink}
                <span>View Public Site</span>
              </a>
            </li>
            <li>
              <a href="#" id="admin-nav-logout" title="Sign Out of Admin Studio" style="color: #b91c1c;">
                ${ICONS.logOut}
                <span>Sign Out</span>
              </a>
            </li>
          </ul>
        </aside>
      `;

      this.initAdminEvents();
    }

    initAdminEvents() {
      const navReview = this.querySelector('#admin-nav-review');
      const navCatalog = this.querySelector('#admin-nav-catalog');
      const navAdd = this.querySelector('#admin-nav-add');

      if (navReview) {
        navReview.addEventListener('click', (e) => {
          e.preventDefault();
          this.setActiveLink(navReview);
          if (window.switchAdminView) window.switchAdminView('review');
        });
      }

      if (navCatalog) {
        navCatalog.addEventListener('click', (e) => {
          e.preventDefault();
          this.setActiveLink(navCatalog);
          if (window.switchAdminView) window.switchAdminView('catalog');
        });
      }

      if (navAdd) {
        navAdd.addEventListener('click', (e) => {
          e.preventDefault();
          this.setActiveLink(navAdd);
          if (window.switchAdminView) window.switchAdminView('upload');
        });
      }

      // Shelf filter shortcuts
      const shelves = [
        { id: '#admin-nav-top', filter: 'top' },
        { id: '#admin-nav-mid', filter: 'mid' },
        { id: '#admin-nav-shorts', filter: 'shorts' },
        { id: '#admin-nav-bottom', filter: 'bottom' }
      ];
      shelves.forEach(sh => {
        const a = this.querySelector(sh.id);
        if (a) {
          a.addEventListener('click', (e) => {
            e.preventDefault();
            this.setActiveLink(a);
            if (window.switchAdminView) window.switchAdminView('catalog');
            const catBtn = document.querySelector(`.catalog-tab-btn[data-filter="${sh.filter}"]`);
            if (catBtn) catBtn.click();
          });
        }
      });

      // Export for GitHub
      const navExport = this.querySelector('#admin-nav-export');
      if (navExport) {
        navExport.addEventListener('click', (e) => {
          e.preventDefault();
          const btnExport = document.getElementById('btn-export-feed');
          if (btnExport) btnExport.click();
        });
      }

      // Sign Out
      const navLogout = this.querySelector('#admin-nav-logout');
      if (navLogout) {
        navLogout.addEventListener('click', (e) => {
          e.preventDefault();
          try {
            sessionStorage.removeItem('tuc_admin_auth');
            localStorage.removeItem('tuc_admin_auth');
            localStorage.removeItem('tuc_user');
          } catch(err) {}
          window.location.href = 'index.html';
        });
      }
    }

    setActiveLink(activeEl) {
      this.querySelectorAll('.side-links a').forEach(a => a.classList.remove('active'));
      if (activeEl) activeEl.classList.add('active');
    }

    scrollToCatalog() {
      const catalogSection = document.querySelector('.catalog-filter-tabs') || document.getElementById('catalog-list-container');
      if (catalogSection) {
        window.scrollTo({ top: Math.max(0, catalogSection.offsetTop - 90), behavior: 'smooth' });
      }
    }
  }

  // Register Custom Elements
  if (!customElements.get('site-header')) {
    customElements.define('site-header', SiteHeader);
  }
  if (!customElements.get('site-sidebar')) {
    customElements.define('site-sidebar', SiteSidebar);
  }

  // Floating In-App Picture-in-Picture Miniplayer (Bottom Right)
  function initFloatingMiniPlayer() {
    const isPlayerPage = window.location.pathname.toLowerCase().endsWith('player.html');
    if (isPlayerPage) return;

    let state = null;
    try {
      const raw = sessionStorage.getItem('tuc_miniplayer') || localStorage.getItem('tuc_miniplayer');
      if (raw) state = JSON.parse(raw);
    } catch(e) {}

    if (!state && new URLSearchParams(window.location.search).get('pip') === 'preview') {
      state = {
        active: true,
        id: 'vid_top_1',
        title: 'Vitae sed condimentum',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        currentTime: 42
      };
    }

    if (!state || !state.active) return;
    if (document.getElementById('floating-miniplayer')) return;

    const miniContainer = document.createElement('div');
    miniContainer.id = 'floating-miniplayer';
    miniContainer.className = 'floating-miniplayer';
    miniContainer.innerHTML = `
      <div class="miniplayer-header">
        <span class="miniplayer-title" title="${state.title || 'Video'}">${state.title || 'Video'}</span>
        <div class="miniplayer-actions">
          <button id="miniplayer-expand-btn" class="mini-act-btn" title="Expand to Full Player" aria-label="Expand to Full Player">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>
          </button>
          <button id="miniplayer-close-btn" class="mini-act-btn" title="Close Miniplayer" aria-label="Close Miniplayer">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      </div>
      <div class="miniplayer-video-box">
        <video id="miniplayer-video" src="${state.videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'}" playsinline autoplay></video>
        <div class="miniplayer-overlay">
          <button id="miniplayer-play-btn" class="miniplayer-center-play" title="Play/Pause" aria-label="Play/Pause">
            <svg id="mini-play-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(miniContainer);

    const miniVideo = miniContainer.querySelector('#miniplayer-video');
    const expandBtn = miniContainer.querySelector('#miniplayer-expand-btn');
    const closeBtn = miniContainer.querySelector('#miniplayer-close-btn');
    const playBtn = miniContainer.querySelector('#miniplayer-play-btn');
    const playIcon = miniContainer.querySelector('#mini-play-icon');

    if (miniVideo) {
      if (state.currentTime) {
        miniVideo.currentTime = state.currentTime;
      }
      miniVideo.play().catch(console.warn);

      miniVideo.addEventListener('play', () => {
        playIcon.innerHTML = '<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>';
      });
      miniVideo.addEventListener('pause', () => {
        playIcon.innerHTML = '<polygon points="6 3 20 12 6 21 6 3"/>';
      });
    }

    if (playBtn && miniVideo) {
      playBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (miniVideo.paused) {
          miniVideo.play().catch(console.warn);
        } else {
          miniVideo.pause();
        }
      });
    }

    if (expandBtn && miniVideo) {
      expandBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const t = Math.floor(miniVideo.currentTime || 0);
        try { sessionStorage.removeItem('tuc_miniplayer'); localStorage.removeItem('tuc_miniplayer'); } catch(err) {}
        window.location.href = `player.html?id=${encodeURIComponent(state.id || '')}&title=${encodeURIComponent(state.title || '')}&t=${t}&autoplay=true`;
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        try { sessionStorage.removeItem('tuc_miniplayer'); localStorage.removeItem('tuc_miniplayer'); } catch(err) {}
        miniContainer.remove();
      });
    }
  }

  window.initFloatingMiniPlayer = initFloatingMiniPlayer;
  window.addEventListener('storage', (e) => { if (e.key === 'tuc_miniplayer') initFloatingMiniPlayer(); });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFloatingMiniPlayer);
  } else {
    initFloatingMiniPlayer();
  }

})();
