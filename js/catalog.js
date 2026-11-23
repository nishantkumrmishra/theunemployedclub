/**
 * The Unemployed Club - Unified Editorial Catalog Data Store
 * Manages video metadata, stream links, artwork CDN URLs, 5-tier section placement,
 * dynamic content tags, sequential review deck pipeline, and GitHub Pages sync.
 */

(function (window) {
  'use strict';

  const STORAGE_KEY = 'webvideo_catalog_v1';
  const STAGING_KEY = 'webvideo_staging_v1';
  const PROCESSED_KEY = 'webvideo_staging_processed_v1';

  // Helper: Normalize tags into a clean string array
  function normalizeTags(rawTags) {
    if (!rawTags) return [];
    if (Array.isArray(rawTags)) {
      return rawTags.map(t => String(t).trim()).filter(Boolean);
    }
    if (typeof rawTags === 'string') {
      return rawTags
        .split(',')
        .map(t => t.replace(/^[#\s]+/, '').trim())
        .filter(Boolean);
    }
    return [];
  }

  // Helper: Normalize 5-tier section identifiers
  function normalizeSection(sec, type) {
    const s = String(sec || '').toLowerCase().trim();
    if (s === 'top' || s === 'top20' || s === 'featured') return 'top20';
    if (s === 'shorts' || s === 'shorts1' || s === 'short') return 'shorts1';
    if (s === 'mid' || s === 'middle' || s === 'curated') return 'mid';
    if (s === 'shorts2' || s === 'trending_shorts') return 'shorts2';
    if (s === 'bottom' || s === 'default' || s === 'feed') return 'default';
    if (type === 'short') return 'shorts1';
    return 'default'; // Unassigned videos default to the endless bottom feed
  }

  function initCatalog() {
    let items = [];

    // 1. Try reading from browser LocalStorage
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          items = parsed;
        }
      }
    } catch (e) {
      console.warn('[Catalog] LocalStorage parse error:', e);
    }

    // 2. Fall back to static master feed window.WEBVIDEO_FEED
    if (items.length === 0 && Array.isArray(window.WEBVIDEO_FEED)) {
      items = JSON.parse(JSON.stringify(window.WEBVIDEO_FEED));
      saveToStorage(items);
    }

    // Normalize items
    items.forEach(v => {
      v.section = normalizeSection(v.section, v.type);
      v.tags = normalizeTags(v.tags);
    });

    return items;
  }

  function saveToStorage(items) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('[Catalog] Failed to save to LocalStorage:', e);
    }
  }

  // --- Processed / Dismissed Draft Tracking ---
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
    const publishedUrls = new Set((catalogItems || []).map(v => v.videoUrl).filter(Boolean));

    // Merge static feed window.WEBVIDEO_STAGING only for genuinely new unreviewed drafts
    if (Array.isArray(window.WEBVIDEO_STAGING)) {
      window.WEBVIDEO_STAGING.forEach(item => {
        const id = String(item.id || '');
        const vUrl = String(item.videoUrl || '');
        const sUrl = String(item.sourceUrl || '');

        if (processed.has(id) || (vUrl && processed.has(vUrl)) || (sUrl && processed.has(sUrl))) {
          return; // Already approved, reviewed, or dismissed
        }
        if (vUrl && publishedUrls.has(vUrl)) {
          return; // Already in live public catalog
        }

        const exists = staged.some(s => s.id === item.id || (s.videoUrl && s.videoUrl === item.videoUrl));
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
        vid.type = (vid.section === 'shorts1' || vid.section === 'shorts2') ? 'short' : 'video';
        saveToStorage(catalogItems);
        return true;
      }
      return false;
    },

    // --- Staging & Review Pipeline Methods ---
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
