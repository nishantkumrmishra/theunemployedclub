/**
 * The Unemployed Club - Master Video Catalog & Staging Data Store
 * =========================================================================
 * Manages:
 *   1. Published Catalog Feed (5-Tier Editorial Shelves)
 *      - top20:    "Top 20 Entries" (Top 2 Featured Rows, max 20)
 *      - shorts1:  "Shorts Shelf 1" (9:14 Vertical Reels, Row 1)
 *      - mid:      "Curated Video Stream" (Middle Featured Shelf)
 *      - shorts2:  "Trending Shorts Shelf 2" (9:14 Vertical Reels, Row 2)
 *      - default:  "Endless Default Video Feed" (Fallback pool, bottom infinite grid)
 *   2. Editorial Staging & Review Queue (window.WEBVIDEO_STAGING)
 *      - Auto-populated by python tools/main.py & extractor.bat
 *      - Interactive Review Deck in admin.html with Duplicate Detection
 *      - 1-Click Approve -> Publishes directly to designated shelf
 *      - 1-Click Dismiss/Delete -> Removes draft permanently
 *   3. Dynamic Content Tags
 *      - Tags stored per item, collected dynamically, filterable on homepage
 *   4. Zero-Knowledge 1-File GitHub Export
 *      - Downloads updated catalog-feed.js for 1-click GitHub drag-and-drop
 */

(function (window) {
  'use strict';

  const STORAGE_KEY = 'webvideo_catalog_v5';
  const STAGING_KEY = 'webvideo_staging_v5';
  const PROCESSED_KEY = 'webvideo_staging_processed_v5';

  // Allowed editorial section slugs
  const VALID_SECTIONS = ['top20', 'shorts1', 'mid', 'shorts2', 'default'];

  function normalizeSection(sec, type) {
    if (sec && VALID_SECTIONS.includes(sec)) return sec;
    if (type === 'short') return 'shorts1';
    return 'default';
  }

  function normalizeTags(raw) {
    if (Array.isArray(raw)) {
      return raw.map(t => String(t).trim()).filter(Boolean);
    }
    if (typeof raw === 'string') {
      return raw.split(',').map(t => t.trim()).filter(Boolean);
    }
    return [];
  }

  // --- Published Catalog Storage & Synchronization ---
  function initCatalog() {
    let items = [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored !== null) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          items = parsed;
        }
      }
    } catch (e) {
      console.warn('[Catalog] LocalStorage parse error, falling back to feed:', e);
    }

    if (items.length === 0 && Array.isArray(window.WEBVIDEO_FEED)) {
      items = JSON.parse(JSON.stringify(window.WEBVIDEO_FEED));
    }

    // Ensure all items conform to the 5-tier schema
    items.forEach((item, idx) => {
      if (!item.section) {
        item.section = normalizeSection(item.section, item.type);
      }
      if (!Array.isArray(item.tags)) {
        item.tags = normalizeTags(item.tags);
      }
      if (!item.id) {
        item.id = 'vid_' + (idx + 1);
      }
    });

    saveToStorage(items);
    return items;
  }

  function saveToStorage(items) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('[Catalog] Failed to save catalog:', e);
    }
  }

  // --- Processed Registry: prevents cleared drafts from reappearing ---
  function getProcessedSet() {
    try {
      const stored = localStorage.getItem(PROCESSED_KEY);
      if (stored) {
        const arr = JSON.parse(stored);
        if (Array.isArray(arr)) return new Set(arr);
      }
    } catch(e) {}
    return new Set();
  }

  function markDraftProcessed(id, videoUrl, sourceUrl) {
    try {
      const set = getProcessedSet();
      if (id) set.add(String(id));
      if (videoUrl) set.add(String(videoUrl));
      if (sourceUrl) set.add(String(sourceUrl));
      localStorage.setItem(PROCESSED_KEY, JSON.stringify([...set]));
    } catch(e) {}
  }

  // --- Staging Queue Storage & Synchronization ---
  function initStaging() {
    let staged = [];
    try {
      const stored = localStorage.getItem(STAGING_KEY);
      if (stored !== null) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) staged = parsed;
      }
    } catch (e) {
      console.warn('[Catalog] Staging LocalStorage parse error:', e);
    }

    const processed = getProcessedSet();

    // If staged queue is completely empty in localStorage, seed with sample drafts from window.WEBVIDEO_STAGING
    if (staged.length === 0 && Array.isArray(window.WEBVIDEO_STAGING) && window.WEBVIDEO_STAGING.length > 0) {
      window.WEBVIDEO_STAGING.forEach(item => {
        staged.push(item);
      });
      saveStagingToStorage(staged);
      return staged;
    }

    // Merge static feed window.WEBVIDEO_STAGING only for genuinely new unreviewed drafts
    if (Array.isArray(window.WEBVIDEO_STAGING)) {
      window.WEBVIDEO_STAGING.forEach(item => {
        const id = String(item.id || '');
        if (processed.has(id)) {
          return; // Already approved, reviewed, or dismissed
        }

        const exists = staged.some(s => s.id === item.id);
        if (!exists) {
          staged.push(item);
        }
      });
      saveStagingToStorage(staged);
    }

    return staged;
  }

  function saveStagingToStorage(items) {
    try {
      localStorage.setItem(STAGING_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('[Catalog] Failed to save staging:', e);
    }
  }

  let catalogItems = initCatalog();
  let stagingItems = initStaging();

  const Catalog = {
    getAll() {
      return [...catalogItems];
    },

    // --- Dynamic Content Tags System ---
    getAllTags() {
      const counts = {};
      catalogItems.forEach(item => {
        const tags = Array.isArray(item.tags) ? item.tags : [];
        tags.forEach(t => {
          const clean = String(t).trim();
          if (clean) counts[clean] = (counts[clean] || 0) + 1;
        });
      });
      return Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
    },

    getByTag(tag) {
      if (!tag) return this.getAll();
      const lower = String(tag).toLowerCase().replace(/^[#\s]+/, '').trim();
      return catalogItems.filter(item => {
        const tags = Array.isArray(item.tags) ? item.tags : [];
        return tags.some(t => String(t).toLowerCase().replace(/^[#\s]+/, '').trim() === lower);
      });
    },

    // --- 5-Tier Section Query Methods ---
    getTop20() {
      return catalogItems.filter(v => v.section === 'top20').slice(0, 20);
    },

    getShorts1() {
      return catalogItems.filter(v => v.section === 'shorts1');
    },

    getMid() {
      return catalogItems.filter(v => v.section === 'mid');
    },

    getShorts2() {
      return catalogItems.filter(v => v.section === 'shorts2');
    },

    getDefaultFeed() {
      const tiers = new Set(['top20', 'shorts1', 'mid', 'shorts2']);
      return catalogItems.filter(v => !v.section || v.section === 'default' || !tiers.has(v.section));
    },

    // Legacy method aliases for backward compatibility
    getTopVideos() {
      const top = this.getTop20();
      return top.length > 0 ? top : catalogItems.filter(v => v.type !== 'short').slice(0, 12);
    },

    getMidVideos() {
      const mid = this.getMid();
      return mid.length > 0 ? mid : catalogItems.filter(v => v.type !== 'short').slice(12, 18);
    },

    getShorts(offset = 0, limit = 100) {
      const allShorts = catalogItems.filter(v => v.section === 'shorts1' || v.section === 'shorts2' || v.type === 'short');
      return allShorts.slice(offset, offset + limit);
    },

    getEndlessPool() {
      const pool = this.getDefaultFeed();
      if (pool.length > 0) return pool;
      return catalogItems.filter(v => v.type !== 'short');
    },

    getVideoById(id) {
      if (!id) return null;
      return catalogItems.find(v => String(v.id) === String(id)) || null;
    },

    getRelated(currentId, limit = 6) {
      return catalogItems
        .filter(v => v.type !== 'short' && String(v.id) !== String(currentId))
        .slice(0, limit);
    },

    addVideo(videoData) {
      const id = 'vid_' + Date.now();
      const section = normalizeSection(videoData.section, videoData.type);
      const isShort = section === 'shorts1' || section === 'shorts2';

      const newVideo = {
        id,
        section,
        type: isShort ? 'short' : (videoData.type || 'video'),
        title: videoData.title || 'Untitled Video',
        description: videoData.description || '',
        tags: normalizeTags(videoData.tags),
        date: videoData.date || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        author: videoData.author || 'The Unemployed Club',
        avatar: videoData.avatar || 'images/avatar.jpg',
        artworkUrl: videoData.artworkUrl || 'images/pic01.jpg',
        videoUrl: videoData.videoUrl || '',
        views: videoData.views || '1.2K views',
        duration: videoData.duration || (isShort ? '0:45' : '12:00')
      };

      catalogItems.unshift(newVideo);
      saveToStorage(catalogItems);
      return newVideo;
    },

    updateVideo(id, updatedData) {
      const idx = catalogItems.findIndex(v => String(v.id) === String(id));
      if (idx !== -1) {
        const cur = catalogItems[idx];
        const section = updatedData.section !== undefined ? normalizeSection(updatedData.section, updatedData.type) : cur.section;
        const isShort = section === 'shorts1' || section === 'shorts2';

        catalogItems[idx] = {
          ...cur,
          ...updatedData,
          section,
          type: isShort ? 'short' : 'video',
          tags: updatedData.tags !== undefined ? normalizeTags(updatedData.tags) : cur.tags
        };
        saveToStorage(catalogItems);
        return catalogItems[idx];
      }
      return null;
    },

    deleteVideo(id) {
      catalogItems = catalogItems.filter(v => String(v.id) !== String(id));
      saveToStorage(catalogItems);
    },

    moveSection(id, newSection) {
      const vid = this.getVideoById(id);
      if (vid) {
        vid.section = normalizeSection(newSection, vid.type);
        saveToStorage(catalogItems);
      }
    },

    // --- Duplicate Content Detection ---
    checkDuplicate(item) {
      if (!item) return null;
      const vUrl = String(item.videoUrl || item.video_url || '').trim();
      const sUrl = String(item.sourceUrl || item.source_url || '').trim();
      const normTitle = String(item.title || '').toLowerCase().replace(/[^a-z0-9]/g, '');

      const norm = (url) => {
        if (!url) return '';
        try {
          const u = new URL(url);
          return (u.hostname.replace(/^www\./, '') + u.pathname.replace(/\/$/, '')).toLowerCase();
        } catch(e) {
          return url.toLowerCase().replace(/\/$/, '');
        }
      };

      const nVUrl = norm(vUrl);
      const nSUrl = norm(sUrl);

      // 1. Check against Live Published Catalog
      for (const cat of catalogItems) {
        if (item.id && String(cat.id) === String(item.id)) continue;
        const catV = norm(cat.videoUrl);
        const catS = norm(cat.sourceUrl);
        const catTitle = String(cat.title || '').toLowerCase().replace(/[^a-z0-9]/g, '');

        let matchedBy = null;
        if (nVUrl && catV && nVUrl === catV) {
          matchedBy = 'Stream CDN URL';
        } else if (nSUrl && catS && nSUrl === catS) {
          matchedBy = 'Original Source Webpage';
        } else if (normTitle && catTitle && normTitle.length > 8 && normTitle === catTitle) {
          matchedBy = 'Exact Video Title';
        }

        if (matchedBy) {
          return {
            isDuplicate: true,
            location: 'Live Published Catalog',
            shelf: cat.section || 'default',
            matchedBy,
            existing: cat,
            reason: `Stream matches existing entry in Live Catalog (${matchedBy})`
          };
        }
      }

      // 2. Check against other items in Staging Queue
      for (const st of stagingItems) {
        if (item.id && String(st.id) === String(item.id)) continue;
        const stV = norm(st.videoUrl);
        const stS = norm(st.sourceUrl);

        let matchedBy = null;
        if (nVUrl && stV && nVUrl === stV) {
          matchedBy = 'Stream CDN URL';
        } else if (nSUrl && stS && nSUrl === stS) {
          matchedBy = 'Original Source Webpage';
        }

        if (matchedBy) {
          return {
            isDuplicate: true,
            location: 'Pending Review Queue',
            shelf: 'Draft',
            matchedBy,
            existing: st,
            reason: `Stream matches another draft in Review Queue (${matchedBy})`
          };
        }
      }

      return null;
    },

    // --- Staging Review Queue Interface ---
    getStaging() {
      return [...stagingItems];
    },

    addStaged(item) {
      const id = item.id || ('draft_' + Date.now());
      const stagedItem = {
        id,
        title: item.title || 'Extracted Stream',
        videoUrl: item.videoUrl || item.video_url || '',
        artworkUrl: item.artworkUrl || item.artwork_url || 'images/pic01.jpg',
        description: item.description || '',
        tags: normalizeTags(item.tags),
        author: item.author || 'The Unemployed Club',
        sourceUrl: item.sourceUrl || item.source_url || '',
        status: 'pending_review',
        extractedAt: item.extractedAt || item.extracted_at || new Date().toLocaleString()
      };
      stagingItems = stagingItems.filter(s => s.videoUrl !== stagedItem.videoUrl && s.id !== stagedItem.id);
      stagingItems.unshift(stagedItem);
      saveStagingToStorage(stagingItems);
      return stagedItem;
    },

    approveStaged(id, targetSection = 'default', overrides = {}) {
      const idx = stagingItems.findIndex(s => String(s.id) === String(id));
      if (idx === -1) return null;

      const staged = stagingItems[idx];
      markDraftProcessed(staged.id, staged.videoUrl, staged.sourceUrl);

      const resolvedSection = normalizeSection(targetSection);
      const isShort = resolvedSection === 'shorts1' || resolvedSection === 'shorts2';

      const videoData = {
        title: overrides.title !== undefined ? overrides.title : staged.title,
        description: overrides.description !== undefined ? overrides.description : staged.description,
        tags: overrides.tags !== undefined ? normalizeTags(overrides.tags) : (staged.tags || []),
        videoUrl: overrides.videoUrl !== undefined ? overrides.videoUrl : staged.videoUrl,
        artworkUrl: overrides.artworkUrl !== undefined ? overrides.artworkUrl : staged.artworkUrl,
        author: overrides.author !== undefined ? overrides.author : staged.author,
        section: resolvedSection,
        type: isShort ? 'short' : 'video',
        views: '1.4K views',
        duration: isShort ? '0:45' : '12:00'
      };

      const published = this.addVideo(videoData);

      // Permanently remove from staging
      stagingItems.splice(idx, 1);
      saveStagingToStorage(stagingItems);

      return published;
    },

    rejectStaged(id) {
      const target = stagingItems.find(s => String(s.id) === String(id));
      if (target) {
        markDraftProcessed(target.id, target.videoUrl, target.sourceUrl);
      }
      stagingItems = stagingItems.filter(s => String(s.id) !== String(id));
      saveStagingToStorage(stagingItems);
      return true;
    },

    dismissStaged(id) {
      return this.rejectStaged(id);
    },

    clearStaging() {
      stagingItems.forEach(s => {
        markDraftProcessed(s.id, s.videoUrl, s.sourceUrl);
      });
      stagingItems = [];
      saveStagingToStorage(stagingItems);
    },

    resetToDefaults() {
      if (Array.isArray(window.WEBVIDEO_FEED)) {
        catalogItems = JSON.parse(JSON.stringify(window.WEBVIDEO_FEED));
        catalogItems.forEach(v => {
          v.section = normalizeSection(v.section, v.type);
          v.tags = normalizeTags(v.tags);
        });
        saveToStorage(catalogItems);
      }
      return catalogItems;
    },

    // Clean out demo placeholder videos
    clearDemoPlaceholders() {
      catalogItems = catalogItems.filter(v => {
        const art = String(v.artworkUrl || '');
        const title = String(v.title || '').toLowerCase();
        if (art.includes('pic01.jpg') || art.includes('pic02.jpg') || art.includes('pic03.jpg')) {
          if (title.includes('vitae sed') || title.includes('magna sed') || title.includes('lorem ipsum')) {
            return false;
          }
        }
        return true;
      });
      saveToStorage(catalogItems);
      return catalogItems;
    },

    // Zero-Knowledge 1-File Export for GitHub Pages
    exportFeedJS() {
      const json = JSON.stringify(catalogItems, null, 2);
      return `// The Unemployed Club - Master Editorial Catalog Feed\n// Auto-generated by Admin Studio\nwindow.WEBVIDEO_FEED = ${json};\n`;
    },

    exportJSON() {
      return JSON.stringify(catalogItems, null, 2);
    }
  };

  window.Catalog = Catalog;

})(window);
