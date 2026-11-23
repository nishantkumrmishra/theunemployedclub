// The Unemployed Club - Main App Logic
// 5-Tier Editorial Section Pipeline & Dynamic Content Tags Filter Engine

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

document.addEventListener('DOMContentLoaded', () => {
  // Grids and Containers
  const topGrid = document.getElementById('video-grid-top');
  const shortsSection1 = document.getElementById('shorts-section-1');
  const shortsGrid1 = document.getElementById('shorts-grid-1');
  const midGrid = document.getElementById('video-grid-mid');
  const shortsSection2 = document.getElementById('shorts-section-2');
  const shortsGrid2 = document.getElementById('shorts-grid-2');
  const bottomGrid = document.getElementById('video-grid-bottom');
  const infiniteSentinel = document.getElementById('infinite-sentinel');
  const infiniteLoader = document.getElementById('infinite-loader');
  const tagsBar = document.getElementById('content-tags-bar');

  let activeTagFilter = null;
  let poolIdx = 0;
  let isLoading = false;

  function getGridCols(gridEl) {
    if (!gridEl) return 4;
    const style = window.getComputedStyle(gridEl);
    const colsStr = style.gridTemplateColumns;
    if (colsStr && colsStr !== 'none') {
      return colsStr.trim().split(/\s+/).length;
    }
    return 4;
  }

  function createVideoCard(v) {
    const card = document.createElement('a');
    const idParam = v.id ? `id=${encodeURIComponent(v.id)}&` : '';
    const titleParam = `title=${encodeURIComponent(v.title || '')}`;
    const dateParam = `&date=${encodeURIComponent(v.date || 'Recent')}`;
    const cdnParam = v.videoUrl ? `&cdn=${encodeURIComponent(v.videoUrl)}` : (v.cdn ? `&cdn=${encodeURIComponent(v.cdn)}` : '');
    const posterParam = v.artworkUrl ? `&poster=${encodeURIComponent(v.artworkUrl)}` : (v.image ? `&poster=${encodeURIComponent(v.image)}` : '');

    card.href = `player.html?${idParam}${titleParam}${dateParam}${cdnParam}${posterParam}`;
    card.className = 'mini-post';
    card.innerHTML = `
      <header>
        <h3>${escapeHtml(v.title)}</h3>
        <time class="published">${escapeHtml(v.date || 'Recent')}</time>
        <span class="author"><img src="${v.avatar || 'images/avatar.jpg'}" alt="Author" /></span>
      </header>
      <div class="image"><img src="${v.artworkUrl || v.image || 'images/pic01.jpg'}" alt="${escapeHtml(v.title)}" /></div>
    `;
    return card;
  }

  function createShortCard(s) {
    const card = document.createElement('a');
    const idParam = s.id ? `id=${encodeURIComponent(s.id)}&` : '';
    const titleParam = `title=${encodeURIComponent(s.title || '')}`;
    const cdnParam = s.videoUrl ? `&cdn=${encodeURIComponent(s.videoUrl)}` : '';

    card.href = `shorts.html?${idParam}${titleParam}${cdnParam}`;
    card.className = 'short-card';
    card.innerHTML = `
      <div class="short-thumbnail">
        <img src="${s.artworkUrl || s.image || 'images/pic01.jpg'}" alt="${escapeHtml(s.title)}" />
        <div class="short-badge">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke">
            <polygon points="6 3 20 12 6 21 6 3"/>
          </svg>
          <span>Shorts</span>
        </div>
      </div>
      <div class="short-info">
        <h3 class="short-title">${escapeHtml(s.title)}</h3>
        <span class="short-views">${escapeHtml(s.views || '1.4K views')}</span>
      </div>
    `;
    return card;
  }

  // ==============================================================
  // 1. DYNAMIC CONTENT TAGS BAR
  // ==============================================================
  function renderDynamicTagsBar() {
    if (!tagsBar || typeof Catalog === 'undefined') return;
    const allTags = Catalog.getAllTags();
    tagsBar.innerHTML = '';

    if (allTags.length === 0) return;

    allTags.forEach(tag => {
      const pill = document.createElement('button');
      pill.type = 'button';
      pill.className = `content-tag-pill ${activeTagFilter === tag ? 'is-active' : ''}`;
      pill.textContent = `#${tag}`;

      pill.addEventListener('click', () => {
        if (activeTagFilter === tag) {
          activeTagFilter = null; // Toggle off
        } else {
          activeTagFilter = tag; // Filter by tag
        }
        renderDynamicTagsBar();
        renderAllSections();
      });

      tagsBar.appendChild(pill);
    });
  }

  // ==============================================================
  // 2. 5-TIER SECTION RENDERING ENGINE
  // ==============================================================
  function renderAllSections() {
    if (typeof Catalog === 'undefined') return;

    // Reset grids
    if (topGrid) topGrid.innerHTML = '';
    if (shortsGrid1) shortsGrid1.innerHTML = '';
    if (midGrid) midGrid.innerHTML = '';
    if (shortsGrid2) shortsGrid2.innerHTML = '';
    if (bottomGrid) bottomGrid.innerHTML = '';

    // If Tag filter is active, display matching filtered videos in topGrid
    if (activeTagFilter) {
      const filtered = Catalog.getByTag(activeTagFilter);
      if (filtered.length === 0) {
        if (topGrid) topGrid.innerHTML = `<p style="padding: 24px; color: var(--color-fg-light);">No videos found for #${escapeHtml(activeTagFilter)}.</p>`;
      } else {
        filtered.forEach(v => {
          if (v.type === 'short' || v.section === 'shorts1' || v.section === 'shorts2') {
            if (topGrid) topGrid.appendChild(createShortCard(v));
          } else {
            if (topGrid) topGrid.appendChild(createVideoCard(v));
          }
        });
      }

      // Hide secondary shelves when filtering by specific tag
      if (shortsSection1) shortsSection1.style.display = 'none';
      if (midGrid) midGrid.style.display = 'none';
      if (shortsSection2) shortsSection2.style.display = 'none';
      if (bottomGrid) bottomGrid.style.display = 'none';
      return;
    }

    // Restore visible shelves
    if (shortsSection1) shortsSection1.style.display = '';
    if (midGrid) midGrid.style.display = '';
    if (shortsSection2) shortsSection2.style.display = '';
    if (bottomGrid) bottomGrid.style.display = '';

    // Tier 1: Top 20 Entries
    const top20 = Catalog.getTop20();
    if (topGrid && top20.length > 0) {
      top20.forEach(v => topGrid.appendChild(createVideoCard(v)));
    }

    // Tier 2: First Shorts Shelf
    const shorts1 = Catalog.getShorts1();
    if (shortsGrid1) {
      if (shorts1.length > 0) {
        shorts1.forEach(s => shortsGrid1.appendChild(createShortCard(s)));
        if (shortsSection1) shortsSection1.style.display = '';
      } else if (shortsSection1) {
        shortsSection1.style.display = 'none';
      }
    }

    // Tier 3: Curated Video Stream (Mid-Tier)
    const mid = Catalog.getMid();
    if (midGrid && mid.length > 0) {
      mid.forEach(v => midGrid.appendChild(createVideoCard(v)));
    }

    // Tier 4: Trending Shorts Shelf 2
    const shorts2 = Catalog.getShorts2();
    if (shortsGrid2) {
      if (shorts2.length > 0) {
        shorts2.forEach(s => shortsGrid2.appendChild(createShortCard(s)));
        if (shortsSection2) shortsSection2.style.display = '';
      } else if (shortsSection2) {
        shortsSection2.style.display = 'none';
      }
    }

    // Tier 5: Endless Default Video Feed
    poolIdx = 0;
    appendDefaultRows(2);

    adjustAllGrids();
  }

  function appendDefaultRows(rowCount = 2) {
    if (!bottomGrid || typeof Catalog === 'undefined') return;
    const defaultPool = Catalog.getDefaultFeed();
    if (defaultPool.length === 0) return;

    const cols = getGridCols(bottomGrid);
    const countToAppend = cols * rowCount;

    for (let i = 0; i < countToAppend; i++) {
      const item = defaultPool[poolIdx % defaultPool.length];
      poolIdx++;
      bottomGrid.appendChild(createVideoCard(item));
    }
  }

  function adjustAllGrids() {
    const cols = getGridCols(topGrid || midGrid);

    // Top Grid auto-fit adjustment
    if (topGrid) {
      const topCards = Array.from(topGrid.querySelectorAll('.mini-post'));
      topCards.forEach(c => c.classList.remove('grid-card-hidden'));
    }

    // Mid Grid auto-fit adjustment
    if (midGrid) {
      const midCards = Array.from(midGrid.querySelectorAll('.mini-post'));
      midCards.forEach(c => c.classList.remove('grid-card-hidden'));
    }
  }

  // Initial renders
  renderDynamicTagsBar();
  renderAllSections();

  window.addEventListener('resize', adjustAllGrids);

  // Infinite Scroll Trigger for Endless Default Feed
  if (window.IntersectionObserver && infiniteSentinel) {
    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (entry && entry.isIntersecting && !isLoading && !activeTagFilter) {
        isLoading = true;
        if (infiniteLoader) infiniteLoader.style.display = 'flex';

        setTimeout(() => {
          appendDefaultRows(1);
          isLoading = false;
          if (infiniteLoader) infiniteLoader.style.display = 'none';
        }, 160);
      }
    }, {
      rootMargin: '350px'
    });
    observer.observe(infiniteSentinel);
  }

  // Live search filtering handler
  function filterHomeGrid(query) {
    const q = (query || '').toLowerCase().trim();
    const allCards = document.querySelectorAll('.video-grid .mini-post, .shorts-grid .short-card');
    allCards.forEach(card => {
      const title = card.querySelector('h3')?.textContent?.toLowerCase() || '';
      if (!q || title.includes(q)) {
        card.style.display = '';
      } else {
        card.style.display = 'none';
      }
    });
  }

  window.addEventListener('site-search', (e) => {
    filterHomeGrid(e.detail.query);
  });

  const initialQ = new URLSearchParams(window.location.search).get('q');
  if (initialQ) {
    filterHomeGrid(initialQ);
  }
});
