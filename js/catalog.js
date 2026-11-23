/**
 * The Unemployed Club - Unified Editorial Catalog Data Store
 * Manages video metadata, stream links, artwork CDN URLs, section placement,
 * staging / review queue pipeline, and zero-technical-knowledge export for GitHub Pages.
 */

(function (window) {
  'use strict';

  const STORAGE_KEY = 'webvideo_catalog_v1';
  const STAGING_KEY = 'webvideo_staging_v1';
  const PROCESSED_KEY = 'webvideo_staging_processed_v1';

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

    getSection(section) {
      return catalogItems.filter(v => (v.section || 'top').toLowerCase() === section.toLowerCase());
    },

    getTopVideos() {
      const vids = this.getSection('top');
      return vids.length > 0 ? vids : catalogItems.filter(v => v.type !== 'short').slice(0, 12);
    },

    getMidVideos() {
      const vids = this.getSection('mid');
      return vids.length > 0 ? vids : catalogItems.filter(v => v.type !== 'short').slice(12, 18);
    },

    getShorts(offset = 0, limit = 100) {
      const shorts = catalogItems.filter(v => v.section === 'shorts' || v.type === 'short');
      return shorts.slice(offset, offset + limit);
    },

    getEndlessPool() {
      const pool = this.getSection('bottom');
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
      const newVideo = {
        id,
        section: videoData.section || 'top',
        type: videoData.section === 'shorts' ? 'short' : (videoData.type || 'video'),
        title: videoData.title || 'Untitled Video',
        description: videoData.description || '',
        date: videoData.date || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        author: videoData.author || 'The Unemployed Club',
        avatar: videoData.avatar || 'images/avatar.jpg',
        artworkUrl: videoData.artworkUrl || 'images/pic01.jpg',
        videoUrl: videoData.videoUrl || '',
        views: videoData.views || '1.2K views',
        duration: videoData.duration || '12:00'
      };

      // Add to beginning of catalog
      catalogItems.unshift(newVideo);
      saveToStorage(catalogItems);
      return newVideo;
    },

    updateVideo(id, updatedData) {
      const idx = catalogItems.findIndex(v => String(v.id) === String(id));
      if (idx !== -1) {
        catalogItems[idx] = {
          ...catalogItems[idx],
          ...updatedData,
          type: updatedData.section === 'shorts' ? 'short' : 'video'
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
        vid.section = newSection;
        if (newSection === 'shorts') vid.type = 'short';
        else vid.type = 'video';
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

    approveStaged(id, targetSection = 'top', overrides = {}) {
      const idx = stagingItems.findIndex(s => String(s.id) === String(id));
      if (idx === -1) return null;

      const staged = stagingItems[idx];
      markDraftProcessed(staged.id, staged.videoUrl, staged.sourceUrl);

      const videoData = {
        title: overrides.title !== undefined ? overrides.title : staged.title,
        description: overrides.description !== undefined ? overrides.description : staged.description,
        videoUrl: overrides.videoUrl !== undefined ? overrides.videoUrl : staged.videoUrl,
        artworkUrl: overrides.artworkUrl !== undefined ? overrides.artworkUrl : staged.artworkUrl,
        author: overrides.author !== undefined ? overrides.author : staged.author,
        section: targetSection,
        type: targetSection === 'shorts' ? 'short' : 'video',
        views: '1.4K views',
        duration: targetSection === 'shorts' ? '0:45' : '12:00'
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
        saveToStorage(catalogItems);
      }
      return catalogItems;
    },

    // Zero-Knowledge 1-File Export for GitHub Pages
    exportFeedJS() {
      const json = JSON.stringify(catalogItems, null, 2);
      return `// The Unemployed Club - Master Editorial Catalog Feed\n// Auto-generated by Admin Panel\nwindow.WEBVIDEO_FEED = ${json};\n`;
    },

    exportJSON() {
      return JSON.stringify(catalogItems, null, 2);
    }
  };

  window.Catalog = Catalog;

})(window);
