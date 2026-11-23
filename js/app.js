// The Unemployed Club - Main App Logic
// Dynamic Catalog Integration with Layout Formula: 11 (2 rows), 0 (shorts), 1 (1 row), 0 (shorts), 111... (endless)

// Reads dynamically from Catalog (with static fallback)
const topVideos = (typeof Catalog !== 'undefined') ? Catalog.getTopVideos() : [
  { id: 1, title: 'Vitae sed condimentum', date: 'October 20, 2015', image: 'images/pic03.jpg', avatar: 'images/avatar.jpg' },
  { id: 2, title: 'Magna sed adipiscing', date: 'November 1, 2015', image: 'images/pic03.jpg', avatar: 'images/avatar.jpg' },
  { id: 3, title: 'Lorem ipsum fermentum', date: 'October 25, 2015', image: 'images/pic03.jpg', avatar: 'images/avatar.jpg' },
  { id: 4, title: 'Feugiat veroeros dolor', date: 'October 18, 2015', image: 'images/pic03.jpg', avatar: 'images/avatar.jpg' },
  { id: 5, title: 'Rutrum sed vitae justo', date: 'October 12, 2015', image: 'images/pic03.jpg', avatar: 'images/avatar.jpg' },
  { id: 6, title: 'Convallis maximus nisl', date: 'October 08, 2015', image: 'images/pic03.jpg', avatar: 'images/avatar.jpg' },
  { id: 7, title: 'Nullam consequat etiam', date: 'October 02, 2015', image: 'images/pic03.jpg', avatar: 'images/avatar.jpg' },
  { id: 8, title: 'Porta lectus amet ultricies', date: 'September 28, 2015', image: 'images/pic03.jpg', avatar: 'images/avatar.jpg' },
  { id: 9, title: 'Praesent eu tortor viverra', date: 'September 22, 2015', image: 'images/pic03.jpg', avatar: 'images/avatar.jpg' },
  { id: 10, title: 'Fusce ullamcorper tellus', date: 'September 15, 2015', image: 'images/pic03.jpg', avatar: 'images/avatar.jpg' },
  { id: 11, title: 'Curabitur nec leo turpis', date: 'September 10, 2015', image: 'images/pic03.jpg', avatar: 'images/avatar.jpg' },
  { id: 12, title: 'Integer sed sapien fringilla', date: 'September 04, 2015', image: 'images/pic03.jpg', avatar: 'images/avatar.jpg' }
];

const shortsList1 = (typeof Catalog !== 'undefined') ? Catalog.getShorts(0, 6) : [
  { id: 's1', title: 'Everyday minimalism in editorial design', views: '520K views', image: 'images/pic03.jpg' },
  { id: 's2', title: 'Behind the darkroom prints and film', views: '340K views', image: 'images/pic03.jpg' },
  { id: 's3', title: 'Typographic rhythm in under 60 seconds', views: '1.2M views', image: 'images/pic03.jpg' },
  { id: 's4', title: 'Analog camera walk through autumn streets', views: '890K views', image: 'images/pic03.jpg' },
  { id: 's5', title: 'Soundscapes of the foggy coastline', views: '670K views', image: 'images/pic03.jpg' },
  { id: 's6', title: 'Future Imperfect: 10 years later', views: '430K views', image: 'images/pic03.jpg' }
];

const midVideos = (typeof Catalog !== 'undefined') ? Catalog.getMidVideos() : [
  { id: 21, title: 'Aenean lacinia bibendum nulla', date: 'August 30, 2015', image: 'images/pic03.jpg', avatar: 'images/avatar.jpg' },
  { id: 22, title: 'Duis mollis est non commodo', date: 'August 24, 2015', image: 'images/pic03.jpg', avatar: 'images/avatar.jpg' },
  { id: 23, title: 'Sed posuere consectetur est', date: 'August 18, 2015', image: 'images/pic03.jpg', avatar: 'images/avatar.jpg' },
  { id: 24, title: 'Vivamus hendrerit arcu sed erat', date: 'August 12, 2015', image: 'images/pic03.jpg', avatar: 'images/avatar.jpg' },
  { id: 25, title: 'Pellentesque habitant morbi', date: 'August 05, 2015', image: 'images/pic03.jpg', avatar: 'images/avatar.jpg' },
  { id: 26, title: 'Tristique senectus et netus', date: 'July 29, 2015', image: 'images/pic03.jpg', avatar: 'images/avatar.jpg' }
];

const shortsList2 = (typeof Catalog !== 'undefined') ? Catalog.getShorts(6, 6) : [
  { id: 's7', title: 'Street photography with vintage rangefinder', views: '950K views', image: 'images/pic03.jpg' },
  { id: 's8', title: 'Mono ink printing in industrial Tokyo', views: '610K views', image: 'images/pic03.jpg' },
  { id: 's9', title: 'Architectural shadows in brutalist concrete', views: '780K views', image: 'images/pic03.jpg' },
  { id: 's10', title: 'How to frame motion on 16mm reel', views: '1.5M views', image: 'images/pic03.jpg' },
  { id: 's11', title: 'Ambient tape loop sounds for editing', views: '410K views', image: 'images/pic03.jpg' },
  { id: 's12', title: 'Editorial grid layouts in real life', views: '820K views', image: 'images/pic03.jpg' }
];

const endlessPool = (typeof Catalog !== 'undefined') ? Catalog.getEndlessPool() : [
  { title: 'Maldonado cinematic impressions', date: 'July 22, 2015', image: 'images/pic03.jpg' },
  { title: 'Atmospheres in monochrome print', date: 'July 16, 2015', image: 'images/pic03.jpg' },
  { title: 'Notes from an abandoned studio', date: 'July 10, 2015', image: 'images/pic03.jpg' },
  { title: 'Minimalist architectural form', date: 'July 03, 2015', image: 'images/pic03.jpg' },
  { title: 'Silent light through textured glass', date: 'June 26, 2015', image: 'images/pic03.jpg' },
  { title: 'Nordic rhythm and landscape film', date: 'June 20, 2015', image: 'images/pic03.jpg' },
  { title: 'Typography of the early press', date: 'June 14, 2015', image: 'images/pic03.jpg' },
  { title: 'Subtle grading in 35mm motion', date: 'June 08, 2015', image: 'images/pic03.jpg' },
  { title: 'The craft of slow journalism', date: 'May 30, 2015', image: 'images/pic03.jpg' },
  { title: 'Quiet intervals in modern sound', date: 'May 24, 2015', image: 'images/pic03.jpg' },
  { title: 'Reflections on editorial layout', date: 'May 18, 2015', image: 'images/pic03.jpg' },
  { title: 'Archival prints from the North Sea', date: 'May 12, 2015', image: 'images/pic03.jpg' }
];

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

document.addEventListener('DOMContentLoaded', () => {
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
      <div class="image"><img src="${v.artworkUrl || v.image || 'images/pic03.jpg'}" alt="${escapeHtml(v.title)}" /></div>
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
        <img src="${s.artworkUrl || s.image || 'images/pic03.jpg'}" alt="${escapeHtml(s.title)}" />
        <div class="short-badge">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke">
            <polygon points="6 3 20 12 6 21 6 3"/>
          </svg>
          <span>Shorts</span>
        </div>
      </div>
      <div class="short-info">
        <h3 class="short-title">${escapeHtml(s.title)}</h3>
        <span class="short-views">${escapeHtml(s.views || '500K views')}</span>
      </div>
    `;
    return card;
  }

  // 1. Render 11: Top 2 Rows Video Grid
  const topGrid = document.getElementById('video-grid-top');
  if (topGrid) {
    topVideos.forEach(v => topGrid.appendChild(createVideoCard(v)));
  }

  // 2. Render 0: First Shorts Shelf
  const shortsGrid1 = document.getElementById('shorts-grid-1');
  if (shortsGrid1 && shortsList1.length > 0) {
    shortsList1.forEach(s => shortsGrid1.appendChild(createShortCard(s)));
  }

  // 3. Render 1: Mid 1 Row Video Grid
  const midGrid = document.getElementById('video-grid-mid');
  if (midGrid) {
    midVideos.forEach(v => midGrid.appendChild(createVideoCard(v)));
  }

  // 4. Render 0: Second Shorts Shelf
  const shortsGrid2 = document.getElementById('shorts-grid-2');
  if (shortsGrid2) {
    const listToRender = shortsList2.length > 0 ? shortsList2 : shortsList1;
    listToRender.forEach(s => shortsGrid2.appendChild(createShortCard(s)));
  }

  // Dynamic Row Calculation:
  // - Top grid gets exactly 2 full rows (11)
  // - Mid grid gets exactly 1 full row (1)
  function adjustAllGrids() {
    const cols = getGridCols(topGrid || midGrid);

    // Top Grid (11: 2 rows)
    if (topGrid) {
      const topCards = Array.from(topGrid.querySelectorAll('.mini-post'));
      const allowedTop = Math.max(cols * 2, 2);
      topCards.forEach((card, idx) => {
        if (idx < allowedTop) {
          card.classList.remove('grid-card-hidden');
        } else {
          card.classList.add('grid-card-hidden');
        }
      });
    }

    // Mid Grid (1: 1 row)
    if (midGrid) {
      const midCards = Array.from(midGrid.querySelectorAll('.mini-post'));
      const allowedMid = Math.max(cols * 1, 1);
      midCards.forEach((card, idx) => {
        if (idx < allowedMid) {
          card.classList.remove('grid-card-hidden');
        } else {
          card.classList.add('grid-card-hidden');
        }
      });
    }
  }

  // Initial adjustment and observers
  adjustAllGrids();
  window.addEventListener('resize', adjustAllGrids);

  const mainContent = document.getElementById('main-content');
  if (mainContent) {
    mainContent.addEventListener('transitionend', adjustAllGrids);
  }

  if (window.ResizeObserver && (topGrid || midGrid)) {
    const ro = new ResizeObserver(() => adjustAllGrids());
    if (topGrid) ro.observe(topGrid);
    if (midGrid) ro.observe(midGrid);
  }

  // 5. Render 111...: Endless Videos Feed with Infinite Scroll
  const bottomGrid = document.getElementById('video-grid-bottom');
  const infiniteSentinel = document.getElementById('infinite-sentinel');
  const infiniteLoader = document.getElementById('infinite-loader');
  let poolIdx = 0;
  let isLoading = false;

  function appendBottomRows(rowCount = 2) {
    if (!bottomGrid || endlessPool.length === 0) return;
    const cols = getGridCols(bottomGrid);
    const countToAppend = cols * rowCount; // Always full rows!

    for (let i = 0; i < countToAppend; i++) {
      const item = endlessPool[poolIdx % endlessPool.length];
      poolIdx++;
      bottomGrid.appendChild(createVideoCard({
        id: item.id,
        title: item.title,
        date: item.date,
        artworkUrl: item.artworkUrl || item.image,
        videoUrl: item.videoUrl,
        avatar: item.avatar || 'images/avatar.jpg'
      }));
    }
  }

  // Initial render: 2 full rows of endless videos
  if (bottomGrid) {
    appendBottomRows(2);
  }

  // Infinite Scroll Trigger
  if (window.IntersectionObserver && infiniteSentinel) {
    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (entry && entry.isIntersecting && !isLoading) {
        isLoading = true;
        if (infiniteLoader) infiniteLoader.style.display = 'flex';

        setTimeout(() => {
          appendBottomRows(1); // Load 1 more full row each time
          isLoading = false;
          if (infiniteLoader) infiniteLoader.style.display = 'none';
        }, 180);
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
