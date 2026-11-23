/**
 * The Unemployed Club - Reusable Web Components (Design Sandbox)
 * Modernized with Stitch UI Design Enhancements (Newsreader, Geist, JetBrains Mono, Tactile Interactions)
 */

(function () {
  'use strict';

  // Inject Google Fonts: Geist, Newsreader, JetBrains Mono
  if (!document.getElementById('tuc-stitch-fonts')) {
    const link = document.createElement('link');
    link.id = 'tuc-stitch-fonts';
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600&family=Newsreader:ital,opsz,wght@0,6..72,300;0,6..72,400;0,6..72,500;1,6..72,400&family=JetBrains+Mono:wght@400;500&display=swap';
    document.head.appendChild(link);
  }

  // Restore collapsed sidebar state
  try {
    if (new URLSearchParams(window.location.search).get('collapsed') === 'true' || localStorage.getItem('sidebar-collapsed') === 'true') {
      document.body.classList.add('sidebar-collapsed');
    }
  } catch (e) {}

  // Restore theme state
  try {
    if (localStorage.getItem('tuc-theme') === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    }
  } catch (e) {}

  function escapeAttr(str) {
    return String(str || '').replace(/"/g, '&quot;');
  }

  // 1. <site-header> Web Component
  class SiteHeader extends HTMLElement {
    connectedCallback() {
      const currentQuery = new URLSearchParams(window.location.search).get('q') || '';

      this.innerHTML = `
        <header id="header" class="fixed top-0 left-0 right-0 w-full h-16 bg-surface/90 backdrop-blur-xl z-50 flex items-center justify-between px-space-lg border-b border-surface-container-high shadow-sm stitch-header">
          <!-- Left: Menu Toggle & Brand Title with Live Status Dot -->
          <div class="flex items-center gap-4 min-w-[240px] header-left-brand">
            <button id="menu-toggle" class="p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded-lg transition-colors flex items-center justify-center tactile-btn" title="Toggle Sidebar" aria-label="Toggle Navigation">
              <svg width="20" height="20" class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16"></path></svg>
            </button>
            <div class="flex items-center gap-2">
              <a href="index.html" class="brand-title-link flex items-center gap-2">
                <span class="font-headline-md text-headline-md tracking-tight text-on-surface font-normal whitespace-nowrap brand-title-stitch">The Unemployed Club</span>
                <span class="w-2 h-2 rounded-full bg-on-surface flex-shrink-0 live-status-dot" title="Live status"></span>
              </a>
            </div>
          </div>

          <!-- Center: Search Input with Kbd Command Shortcut -->
          <div class="flex-1 max-w-xl mx-space-lg header-center-search">
            <div class="flex items-center gap-2.5 px-3.5 h-10 bg-white hover:border-outline rounded-xl text-on-surface-variant font-body-md text-body-md shadow-sm border border-surface-container-high transition-all cursor-pointer group search-box-stitch">
              <svg width="18" height="18" class="w-[18px] h-[18px] text-outline group-hover:text-on-surface transition-colors flex-shrink-0" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.85" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"></circle><path d="M20 20l-4-4"></path></svg>
              <input type="text" id="header-search-input" class="bg-transparent border-none outline-none flex-1 text-on-surface-variant font-body-md text-[13px]" placeholder="Search cinematic videos, creators, tags..." value="${escapeAttr(currentQuery)}" autocomplete="off" />
              <kbd class="px-1.5 py-0.5 rounded bg-surface-container font-metadata-mono text-metadata-mono text-on-surface-variant text-[11px] border border-surface-container-high flex-shrink-0" id="search-kbd-badge">⌘K</kbd>
            </div>
          </div>

          <!-- Right: Notifications & User Profile Menu Dropdown -->
          <div class="flex items-center gap-space-md header-right-actions">
            <button class="relative p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded-full transition-colors flex items-center justify-center tactile-btn" title="Notifications" id="notifications-btn" aria-label="Notifications">
              <svg width="20" height="20" class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
              <span class="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-on-surface unread-dot"></span>
            </button>

            <!-- User Menu Slot & Dropdown -->
            <div class="relative flex items-center gap-2 pl-1 group" id="profile-dropdown-wrapper">
              <button id="user-menu-btn" aria-expanded="false" aria-haspopup="true" class="flex items-center gap-2 cursor-pointer tactile-btn p-1 rounded-full hover:bg-surface-container-high transition-colors focus:outline-none" title="Account menu">
                <div class="w-8 h-8 rounded-full bg-surface-container-high border border-surface-container-high flex items-center justify-center text-on-surface font-medium text-label-sm ring-1 ring-outline/20 user-avatar-badge">
                  <span>U</span>
                </div>
                <svg width="16" height="16" class="w-4 h-4 text-outline group-hover:text-on-surface transition-transform duration-200" id="user-menu-chevron" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"></path></svg>
              </button>

              <div id="user-dropdown-menu" class="hidden absolute right-0 top-12 w-80 bg-surface/95 backdrop-blur-xl border border-surface-container-high shadow-xl rounded-2xl p-3 z-50 text-left transition-all duration-200 select-none user-dropdown-stitch">
                <!-- Member Tier Card -->
                <div class="p-3 bg-surface-container-low rounded-xl border border-surface-container-high/60 flex items-start gap-3 user-member-card">
                  <div class="w-10 h-10 rounded-full bg-surface-container-highest border border-surface-container-high flex items-center justify-center text-on-surface font-medium text-sm flex-shrink-0">
                    <span>UC</span>
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center justify-between gap-1">
                      <span class="font-label-md text-on-surface font-medium truncate">Member #084</span>
                      <span class="px-1.5 py-0.5 rounded text-[10px] font-metadata-mono uppercase tracking-wider bg-surface-container-high text-on-surface-variant font-medium">Active</span>
                    </div>
                    <p class="text-xs text-on-surface-variant truncate font-body-sm mt-0.5">curator@stillness.org</p>
                    <div class="mt-2 pt-2 border-t border-surface-container-high/70 flex items-center justify-between">
                      <span class="text-[11px] font-metadata-mono text-outline">Quiet Pass Tier</span>
                      <button class="text-[11px] font-label-sm text-primary hover:underline hover:text-on-surface transition-colors font-medium">Manage</button>
                    </div>
                  </div>
                </div>

                <!-- Theme Toggle Switch -->
                <div class="mt-2.5 px-1">
                  <div class="flex items-center justify-between py-2 px-2 rounded-xl bg-surface-container/50 border border-surface-container-high/40 theme-toggle-row">
                    <div class="flex items-center gap-2">
                      <svg width="16" height="16" class="w-4 h-4 text-outline" id="theme-status-icon" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"></path></svg>
                      <span class="font-label-sm text-xs text-on-surface" id="theme-mode-label">Light Sanctuary</span>
                    </div>
                    <button id="theme-toggle-btn" class="relative flex items-center gap-1.5 px-2 py-1 rounded-lg bg-surface-container-high hover:bg-surface-variant text-on-surface font-metadata-mono text-[11px] transition-colors tactile-btn">
                      <span class="w-2 h-2 rounded-full bg-primary inline-block" id="theme-indicator-dot"></span>
                      <span id="theme-toggle-text">Dark</span>
                    </button>
                  </div>
                </div>

                <div class="my-2 border-t border-surface-container-high/60"></div>

                <!-- Navigation Links inside Dropdown -->
                <div class="flex flex-col gap-0.5">
                  <a href="#" class="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors text-xs font-label-md">
                    <svg width="16" height="16" class="w-4 h-4 text-outline flex-shrink-0" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"></circle><path d="M6 21v-2a6 6 0 0 1 12 0v2"></path></svg>
                    <span class="flex-1">Account &amp; Profile</span>
                    <span class="text-[11px] font-metadata-mono text-outline">⌘P</span>
                  </a>
                  <a href="admin.html" class="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors text-xs font-label-md">
                    <svg width="16" height="16" class="w-4 h-4 text-outline flex-shrink-0" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                    <span class="flex-1">Admin Studio</span>
                  </a>
                  <a href="upload.html" class="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors text-xs font-label-md">
                    <svg width="16" height="16" class="w-4 h-4 text-outline flex-shrink-0" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" viewBox="0 0 24 24"><path d="m19 21-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
                    <span class="flex-1">Upload Deck</span>
                    <span class="w-1.5 h-1.5 rounded-full bg-secondary-container"></span>
                  </a>
                  <a href="#" class="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors text-xs font-label-md">
                    <svg width="16" height="16" class="w-4 h-4 text-outline flex-shrink-0" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                    <span class="flex-1">Silence &amp; Ambient Alerts</span>
                    <span class="text-[10px] font-metadata-mono text-outline">Off</span>
                  </a>
                </div>

                <div class="my-2 border-t border-surface-container-high/60"></div>

                <!-- Account Actions -->
                <div class="flex flex-col gap-0.5">
                  <a href="login.html" class="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors text-xs font-label-md">
                    <svg width="16" height="16" class="w-4 h-4 text-outline flex-shrink-0" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" viewBox="0 0 24 24"><path d="M16 17l5-5-5-5M21 12H9"></path><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path></svg>
                    <span class="flex-1">Switch Account</span>
                  </a>
                  <a href="login.html" class="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-error hover:bg-error-container/40 transition-colors text-xs font-label-md text-left">
                    <svg width="16" height="16" class="w-4 h-4 flex-shrink-0 text-error" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                    <span class="flex-1 font-medium">Sign Out</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </header>
      `;

      this.initEvents();
      if (new URLSearchParams(window.location.search).get('menu') === 'open') {
        const menuBtn = this.querySelector('#user-menu-btn');
        if (menuBtn) menuBtn.click();
      }
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
          window.dispatchEvent(new Event('resize'));
        });
      }

      // User Dropdown Menu
      const menuBtn = this.querySelector('#user-menu-btn');
      const menu = this.querySelector('#user-dropdown-menu');
      const chevron = this.querySelector('#user-menu-chevron');
      const themeBtn = this.querySelector('#theme-toggle-btn');
      const themeLabel = this.querySelector('#theme-mode-label');
      const themeToggleText = this.querySelector('#theme-toggle-text');
      const themeIcon = this.querySelector('#theme-status-icon');

      if (menuBtn && menu) {
        const toggleDropdown = (e) => {
          if (e) e.stopPropagation();
          const isOpen = !menu.classList.contains('hidden');
          if (isOpen) {
            menu.classList.add('hidden');
            menuBtn.setAttribute('aria-expanded', 'false');
            if (chevron) chevron.style.transform = 'rotate(0deg)';
          } else {
            menu.classList.remove('hidden');
            menuBtn.setAttribute('aria-expanded', 'true');
            if (chevron) chevron.style.transform = 'rotate(180deg)';
          }
        };

        const closeDropdown = () => {
          menu.classList.add('hidden');
          menuBtn.setAttribute('aria-expanded', 'false');
          if (chevron) chevron.style.transform = 'rotate(0deg)';
        };

        menuBtn.addEventListener('click', toggleDropdown);

        document.addEventListener('click', (e) => {
          const wrapper = document.getElementById('profile-dropdown-wrapper');
          if (wrapper && !wrapper.contains(e.target)) {
            closeDropdown();
          }
        });

        document.addEventListener('keydown', (e) => {
          if (e.key === 'Escape') closeDropdown();
          if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'p') {
            e.preventDefault();
            toggleDropdown();
          }
        });
      }

      // Theme Toggle Handler
      if (themeBtn) {
        const isCurrentlyDark = document.documentElement.classList.contains('dark') || document.body.classList.contains('dark');
        if (isCurrentlyDark) {
          if (themeLabel) themeLabel.textContent = 'Dim Sanctuary';
          if (themeToggleText) themeToggleText.textContent = 'Light';
          if (themeIcon) themeIcon.innerHTML = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>';
        }

        themeBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const isDark = document.documentElement.classList.toggle('dark');
          document.body.classList.toggle('dark', isDark);
          try { localStorage.setItem('tuc-theme', isDark ? 'dark' : 'light'); } catch (err) {}

          if (isDark) {
            if (themeLabel) themeLabel.textContent = 'Dim Sanctuary';
            if (themeToggleText) themeToggleText.textContent = 'Light';
            if (themeIcon) {
              themeIcon.innerHTML = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>';
            }
          } else {
            if (themeLabel) themeLabel.textContent = 'Light Sanctuary';
            if (themeToggleText) themeToggleText.textContent = 'Dark';
            if (themeIcon) {
              themeIcon.innerHTML = '<circle cx="12" cy="12" r="4"></circle><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"></path>';
            }
          }
        });
      }

      // Search Handler & Keyboard ⌘K shortcut
      const searchInput = this.querySelector('#header-search-input');
      const searchBox = this.querySelector('.search-box-stitch');

      const performSearch = () => {
        if (!searchInput) return;
        const query = searchInput.value.trim();
        const currentPath = window.location.pathname.toLowerCase();
        const isIndex = currentPath.endsWith('index.html') || currentPath.endsWith('/') || currentPath.endsWith('design.html') || currentPath === '';
        if (isIndex) {
          window.dispatchEvent(new CustomEvent('site-search', { detail: { query } }));
        } else {
          window.location.href = `index.html?q=${encodeURIComponent(query)}`;
        }
      };

      if (searchInput) {
        searchInput.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') performSearch();
        });
      }

      if (searchBox) {
        searchBox.addEventListener('click', (e) => {
          if (searchInput && e.target !== searchInput) searchInput.focus();
        });
      }

      document.addEventListener('keydown', (e) => {
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
          e.preventDefault();
          if (searchInput) {
            searchInput.focus();
            searchInput.select();
          }
        }
      });
    }
  }

  // 2. <site-sidebar> Web Component
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
        <aside id="sidebar-nav" class="fixed left-0 top-16 bottom-0 w-64 bg-surface-container-low/80 backdrop-blur-md z-40 flex flex-col justify-between py-space-lg px-space-md border-r border-surface-container-high overflow-y-auto stitch-sidebar">
          <div class="flex flex-col gap-space-lg sidebar-main-body">
            <!-- Primary Navigation Links -->
            <nav class="flex flex-col gap-1 sidebar-nav-group" data-active-classes="bg-surface-container-high text-on-surface font-label-md">
              <a aria-current="${active === 'home' || !active ? 'page' : 'false'}" class="flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${active === 'home' || !active ? 'bg-surface-container-high text-on-surface font-label-md' : 'text-on-surface-variant font-body-md text-body-md hover:bg-surface-container hover:text-on-surface'} whitespace-nowrap" data-path="home" href="index.html">
                <svg width="20" height="20" class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.85" viewBox="0 0 24 24"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><path d="M9 22V12h6v10"></path></svg>
                <span>Home</span>
              </a>
              <a aria-current="${active === 'shorts' ? 'page' : 'false'}" class="flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${active === 'shorts' ? 'bg-surface-container-high text-on-surface font-label-md' : 'text-on-surface-variant font-body-md text-body-md hover:bg-surface-container hover:text-on-surface'} whitespace-nowrap" data-path="shorts" href="shorts.html">
                <svg width="20" height="20" class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.85" viewBox="0 0 24 24"><rect height="18" rx="2" width="14" x="5" y="3"></rect><path d="m10 9 5 3-5 3z" fill="currentColor" stroke="none"></path></svg>
                <span>Shorts</span>
              </a>
              <a aria-current="${active === 'rhythm' || active === 'audio-lounge' ? 'page' : 'false'}" class="flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${active === 'rhythm' || active === 'audio-lounge' ? 'bg-surface-container-high text-on-surface font-label-md' : 'text-on-surface-variant font-body-md text-body-md hover:bg-surface-container hover:text-on-surface'} whitespace-nowrap" data-path="audio-lounge" href="player.html">
                <svg width="20" height="20" class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.85" viewBox="0 0 24 24"><path d="M2 10v4M6 6v12M10 3v18M14 8v8M18 5v14M22 10v4"></path></svg>
                <span>Rhythm</span>
              </a>
              <a aria-current="${active === 'explore' ? 'page' : 'false'}" class="flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${active === 'explore' ? 'bg-surface-container-high text-on-surface font-label-md' : 'text-on-surface-variant font-body-md text-body-md hover:bg-surface-container hover:text-on-surface'} whitespace-nowrap" data-path="explore" href="index.html#explore">
                <svg width="20" height="20" class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.85" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon></svg>
                <span>Explore</span>
              </a>
              <a aria-current="${active === 'trending' ? 'page' : 'false'}" class="flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${active === 'trending' ? 'bg-surface-container-high text-on-surface font-label-md' : 'text-on-surface-variant font-body-md text-body-md hover:bg-surface-container hover:text-on-surface'} whitespace-nowrap" data-path="trending" href="index.html#trending">
                <svg width="20" height="20" class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.85" viewBox="0 0 24 24"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path></svg>
                <span>Trending</span>
              </a>
            </nav>

            <!-- Curated Feeds Section -->
            <div class="pt-space-xs curated-feeds-group">
              <div class="px-3 pb-2 text-on-surface-variant font-metadata-mono text-metadata-mono uppercase tracking-wider whitespace-nowrap sidebar-section-label">Curated Feeds</div>
              <nav class="flex flex-col gap-1 sidebar-nav-group" data-active-classes="bg-surface-container-high text-on-surface font-label-md">
                <a class="flex items-center gap-3 px-3 py-1.5 rounded-lg text-on-surface-variant font-body-md text-body-md hover:bg-surface-container hover:text-on-surface transition-all whitespace-nowrap ${active === 'feed-35mm-cinema' ? 'bg-surface-container-high text-on-surface font-label-md' : ''}" data-path="feed-35mm-cinema" href="index.html?feed=35mm-cinema">
                  <svg width="18" height="18" class="w-[18px] h-[18px] flex-shrink-0" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" viewBox="0 0 24 24"><rect height="18" rx="2" width="20" x="2" y="3"></rect><path d="M7 3v18M17 3v18M2 8h5M2 16h5M17 8h5M17 16h5M7 12h10"></path></svg>
                  <span>35mm Cinema</span>
                </a>
                <a class="flex items-center gap-3 px-3 py-1.5 rounded-lg text-on-surface-variant font-body-md text-body-md hover:bg-surface-container hover:text-on-surface transition-all whitespace-nowrap ${active === 'feed-tokyo-drift' ? 'bg-surface-container-high text-on-surface font-label-md' : ''}" data-path="feed-tokyo-drift-audio" href="index.html?feed=tokyo-drift">
                  <svg width="18" height="18" class="w-[18px] h-[18px] flex-shrink-0" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="2"></circle><path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14"></path></svg>
                  <span>Tokyo Drift Audio</span>
                </a>
                <a class="flex items-center gap-3 px-3 py-1.5 rounded-lg text-on-surface-variant font-body-md text-body-md hover:bg-surface-container hover:text-on-surface transition-all whitespace-nowrap ${active === 'feed-architectural-digest' ? 'bg-surface-container-high text-on-surface font-label-md' : ''}" data-path="feed-architectural-digest" href="index.html?feed=architectural-digest">
                  <svg width="18" height="18" class="w-[18px] h-[18px] flex-shrink-0" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" viewBox="0 0 24 24"><rect height="16" rx="1" width="16" x="4" y="4"></rect><path d="M9 4v16M15 4v16M4 9h16M4 15h16"></path></svg>
                  <span>Architectural Digest</span>
                </a>
                <a class="flex items-center gap-3 px-3 py-1.5 rounded-lg text-on-surface-variant font-body-md text-body-md hover:bg-surface-container hover:text-on-surface transition-all whitespace-nowrap ${active === 'feed-nordic-ambient' ? 'bg-surface-container-high text-on-surface font-label-md' : ''}" data-path="feed-nordic-ambient" href="index.html?feed=nordic-ambient">
                  <svg width="18" height="18" class="w-[18px] h-[18px] flex-shrink-0" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" viewBox="0 0 24 24"><path d="M12 22C6.5 22 2 17.5 2 12c0-4.5 3-8.5 7.5-9.8 1-.3 1.9.4 1.9 1.4v2.7c0 3.1 2.5 5.7 5.7 5.7h2.7c1 0 1.7.9 1.4 1.9C20.5 19 16.5 22 12 22z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  <span>Nordic Ambient</span>
                </a>
              </nav>
            </div>
          </div>

          <!-- Bottom Footer Information -->
          <div class="px-3 pt-space-md border-t border-surface-container-high flex flex-col gap-space-xs sidebar-footer-wrap">
            <div class="flex flex-wrap gap-x-3 gap-y-1">
              <a class="text-on-surface-variant hover:text-on-surface font-label-sm text-label-sm transition-colors" data-path="manifesto" href="#">Manifesto</a>
              <a class="text-on-surface-variant hover:text-on-surface font-label-sm text-label-sm transition-colors" data-path="creators" href="#">Creators</a>
              <a class="text-on-surface-variant hover:text-on-surface font-label-sm text-label-sm transition-colors" data-path="terms" href="#">Terms</a>
              <a class="text-on-surface-variant hover:text-on-surface font-label-sm text-label-sm transition-colors" data-path="api" href="#">API</a>
            </div>
            <span class="font-metadata-mono text-metadata-mono text-outline whitespace-nowrap text-[11px] copyright-line">The Unemployed Club © 2025</span>
          </div>
        </aside>
      `;
    }

    renderAdminSidebar(active) {
      this.innerHTML = `
        <aside id="sidebar-nav" class="fixed left-0 top-16 bottom-0 w-64 bg-surface-container-low/80 backdrop-blur-md z-40 flex flex-col justify-between py-space-lg px-space-md border-r border-surface-container-high overflow-y-auto stitch-sidebar">
          <div class="flex flex-col gap-space-lg sidebar-main-body">
            <div class="sidebar-section-header font-metadata-mono text-metadata-mono text-on-surface-variant uppercase tracking-wider px-3">Content Studio</div>
            <nav class="flex flex-col gap-1 sidebar-nav-group">
              <a href="#view-review" id="admin-nav-review" class="flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${active === 'review' || !active ? 'bg-surface-container-high text-on-surface font-label-md' : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface font-body-md'}" title="Sequential 1-by-1 Review Deck">
                <svg width="20" height="20" class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                <span class="flex-1">Review Deck</span>
                <span class="sidebar-pending-badge px-1.5 py-0.5 rounded text-[10px] font-metadata-mono bg-surface-container-high text-on-surface-variant" id="sidebar-review-badge">0</span>
              </a>
              <a href="#view-videos" id="admin-nav-videos" class="flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${active === 'videos' ? 'bg-surface-container-high text-on-surface font-label-md' : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface font-body-md'}" title="Landscape Video Catalog">
                <svg width="20" height="20" class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                <span>Videos</span>
              </a>
              <a href="#view-shorts" id="admin-nav-shorts" class="flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${active === 'shorts' ? 'bg-surface-container-high text-on-surface font-label-md' : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface font-body-md'}" title="Vertical Shorts Catalog">
                <svg width="20" height="20" class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><rect height="18" rx="2" width="14" x="5" y="3"></rect><path d="m10 9 5 3-5 3z" fill="currentColor" stroke="none"></path></svg>
                <span>Shorts</span>
              </a>
              <a href="#view-shelves" id="admin-nav-tags" class="flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${active === 'shelves' ? 'bg-surface-container-high text-on-surface font-label-md' : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface font-body-md'}" title="Content Tags and Shelves">
                <svg width="20" height="20" class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
                <span>Tags &amp; Shelves</span>
              </a>
            </nav>

            <div class="my-2 border-t border-surface-container-high/60"></div>
            <div class="sidebar-section-header font-metadata-mono text-metadata-mono text-on-surface-variant uppercase tracking-wider px-3">Distribution &amp; Exit</div>
            <nav class="flex flex-col gap-1 sidebar-nav-group">
              <a href="#" id="admin-nav-export" class="flex items-center gap-3 px-3 py-2 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-all font-body-md" title="Download Updated catalog-feed.js">
                <svg width="20" height="20" class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                <span>Export for GitHub</span>
              </a>
              <a href="index.html" id="admin-nav-site" class="flex items-center gap-3 px-3 py-2 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-all font-body-md" title="Return to Public Site">
                <svg width="20" height="20" class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M15 3h6v6"></path><path d="M10 14 21 3"></path><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path></svg>
                <span>View Public Site</span>
              </a>
              <a href="#" id="admin-nav-logout" class="flex items-center gap-3 px-3 py-2 rounded-lg text-error hover:bg-error-container/40 transition-all font-body-md" title="Sign Out of Admin Studio">
                <svg width="20" height="20" class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                <span>Sign Out</span>
              </a>
            </nav>
          </div>
        </aside>
      `;

      this.initAdminEvents();
    }

    initAdminEvents() {
      const navReview = this.querySelector('#admin-nav-review');
      const navVideos = this.querySelector('#admin-nav-videos');
      const navShorts = this.querySelector('#admin-nav-shorts');
      const navTags = this.querySelector('#admin-nav-tags');

      if (navReview) {
        navReview.addEventListener('click', (e) => {
          e.preventDefault();
          this.setActiveLink(navReview);
          if (window.switchAdminView) window.switchAdminView('review');
        });
      }

      if (navVideos) {
        navVideos.addEventListener('click', (e) => {
          e.preventDefault();
          this.setActiveLink(navVideos);
          if (window.filterCatalogByType) window.filterCatalogByType('video');
        });
      }

      if (navShorts) {
        navShorts.addEventListener('click', (e) => {
          e.preventDefault();
          this.setActiveLink(navShorts);
          if (window.filterCatalogByType) window.filterCatalogByType('short');
        });
      }

      if (navTags) {
        navTags.addEventListener('click', (e) => {
          e.preventDefault();
          this.setActiveLink(navTags);
          if (window.switchAdminView) window.switchAdminView('shelves');
        });
      }

      const navExport = this.querySelector('#admin-nav-export');
      if (navExport) {
        navExport.addEventListener('click', (e) => {
          e.preventDefault();
          const btnExport = document.getElementById('btn-export-feed');
          if (btnExport) btnExport.click();
        });
      }

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
      this.querySelectorAll('#sidebar-nav a').forEach(a => {
        a.classList.remove('bg-surface-container-high', 'text-on-surface', 'font-label-md');
        a.classList.add('text-on-surface-variant');
      });
      if (activeEl) {
        activeEl.classList.remove('text-on-surface-variant');
        activeEl.classList.add('bg-surface-container-high', 'text-on-surface', 'font-label-md');
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
