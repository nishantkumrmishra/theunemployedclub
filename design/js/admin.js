// The Unemployed Club - Admin Studio Controller
// Features: Sequential 1-by-1 Review Deck, Compact Catalog Table with Inline Drawer,
// 5-Tier Shelves Manager, Dynamic Content Tags, and GitHub Pages Export.

document.addEventListener('DOMContentLoaded', () => {
  // Navigation Tabs & Panes
  const tabViewReview = document.getElementById('tab-nav-review');
  const tabViewCatalog = document.getElementById('tab-nav-catalog');
  const tabViewShelves = document.getElementById('tab-nav-shelves');
  const tabViewUpload = document.getElementById('tab-nav-upload');

  const paneReview = document.getElementById('view-review-pane');
  const paneCatalog = document.getElementById('view-catalog-pane');
  const paneShelves = document.getElementById('view-shelves-pane');
  const paneUpload = document.getElementById('view-upload-pane');

  const tabReviewBadge = document.getElementById('tab-review-count');
  const tabCatalogCount = document.getElementById('tab-catalog-count');
  const sidebarReviewBadge = document.getElementById('sidebar-review-badge');

  // Deck Review Elements
  const deckCard = document.getElementById('deck-card');
  const deckEmptyState = document.getElementById('deck-empty-state');
  const deckCurrentNum = document.getElementById('deck-current-num');
  const deckTotalNum = document.getElementById('deck-total-num');
  const btnDeckPrev = document.getElementById('btn-deck-prev');
  const btnDeckNext = document.getElementById('btn-deck-next');
  const btnImportStageUrl = document.getElementById('btn-import-stage-url');
  const btnClearStaging = document.getElementById('btn-clear-staging');
  const btnEmptyStage = document.getElementById('btn-empty-stage');
  const btnEmptyCatalog = document.getElementById('btn-empty-catalog');

  const deckPlayerBox = document.getElementById('deck-player-box');
  const deckVideoPlayer = document.getElementById('deck-video-player');
  const deckStreamType = document.getElementById('deck-stream-type');
  const deckAspectBadge = document.getElementById('deck-aspect-badge');
  const deckThumbImg = document.getElementById('deck-thumb-img');
  const deckThumbInput = document.getElementById('deck-thumb-input');
  const deckTitleInput = document.getElementById('deck-title-input');
  const deckSectionSelect = document.getElementById('deck-section-select');
  const deckAutodetectBadge = document.getElementById('deck-autodetect-badge');
  const deckTagsInput = document.getElementById('deck-tags-input');
  const deckTagQuickBar = document.getElementById('deck-tag-quick-bar');
  const deckDescInput = document.getElementById('deck-desc-input');
  const deckStagedDate = document.getElementById('deck-staged-date');
  const deckSourceLink = document.getElementById('deck-source-link');
  const btnDeckDismiss = document.getElementById('btn-deck-dismiss');
  const btnDeckApprove = document.getElementById('btn-deck-approve');
  let deckHls = null;

  // Catalog Table Elements
  const catalogTableBody = document.getElementById('catalog-table-body');
  const totalCatalogCount = document.getElementById('total-catalog-count');
  const catalogSearchInput = document.getElementById('catalog-search-input');
  const btnPurgePlaceholders = document.getElementById('btn-purge-placeholders');

  // Edit Drawer Elements
  const editDrawerBackdrop = document.getElementById('edit-drawer-backdrop');
  const btnCloseDrawer = document.getElementById('btn-close-drawer');
  const btnCancelDrawer = document.getElementById('btn-cancel-drawer');
  const btnSaveDrawer = document.getElementById('btn-save-drawer');
  const drawerVideoId = document.getElementById('drawer-video-id');
  const drawerTitle = document.getElementById('drawer-title');
  const drawerVideoUrl = document.getElementById('drawer-video-url');
  const drawerArtworkUrl = document.getElementById('drawer-artwork-url');
  const drawerArtworkPreview = document.getElementById('drawer-artwork-preview');
  const drawerShelfSelect = document.getElementById('drawer-shelf-select');
  const drawerTags = document.getElementById('drawer-tags');
  const drawerDesc = document.getElementById('drawer-desc');

  // Stream Preview Modal
  const previewModal = document.getElementById('stream-preview-modal');
  const modalVideoPlayer = document.getElementById('modal-video-player');
  const modalStreamTitle = document.getElementById('modal-stream-title');
  const btnCloseModal = document.getElementById('btn-close-modal');
  let modalHls = null;

  // Direct Upload Form
  const directUploadForm = document.getElementById('direct-upload-form');

  // Top Banner Actions
  const btnExportFeed = document.getElementById('btn-export-feed');
  const btnResetCatalog = document.getElementById('btn-reset-catalog');
  const btnAdminLogout = document.getElementById('btn-admin-logout');

  // State
  let currentView = 'review';
  const urlDraftParam = parseInt(new URLSearchParams(window.location.search).get('draft'), 10);
  let currentDeckIndex = (!isNaN(urlDraftParam) && urlDraftParam >= 1) ? urlDraftParam - 1 : 0;
  let currentCatalogFilter = 'all';
  let catalogTypeFilter = null; // 'video' | 'short' | null

  // ==============================================================
  // 1. PRIMARY VIEW CONTROLLER
  // ==============================================================
  function switchAdminView(view) {
    currentView = view;

    // Toggle Tab Buttons
    [tabViewReview, tabViewCatalog, tabViewShelves, tabViewUpload].forEach(btn => {
      if (btn) btn.classList.remove('is-active');
    });

    if (view === 'review' && tabViewReview) tabViewReview.classList.add('is-active');
    if (view === 'catalog' && tabViewCatalog) tabViewCatalog.classList.add('is-active');
    if (view === 'shelves' && tabViewShelves) tabViewShelves.classList.add('is-active');
    if (view === 'upload' && tabViewUpload) tabViewUpload.classList.add('is-active');

    // Toggle Panes
    if (paneReview) paneReview.style.display = view === 'review' ? 'block' : 'none';
    if (paneCatalog) paneCatalog.style.display = view === 'catalog' ? 'block' : 'none';
    if (paneShelves) paneShelves.style.display = view === 'shelves' ? 'block' : 'none';
    if (paneUpload) paneUpload.style.display = view === 'upload' ? 'block' : 'none';

    // Sync Sidebar
    const sideReview = document.getElementById('admin-nav-review');
    const sideVideos = document.getElementById('admin-nav-videos');
    const sideShorts = document.getElementById('admin-nav-shorts');
    const sideTags = document.getElementById('admin-nav-tags');
    [sideReview, sideVideos, sideShorts, sideTags].forEach(a => a && a.classList.remove('active'));

    if (view === 'review' && sideReview) sideReview.classList.add('active');
    if (view === 'shelves' && sideTags) sideTags.classList.add('active');
    if (view === 'catalog') {
      if (catalogTypeFilter === 'short' && sideShorts) sideShorts.classList.add('active');
      else if (sideVideos) sideVideos.classList.add('active');
    }

    if (view === 'review') renderDeck();
    if (view === 'catalog') renderCatalogTable();
    if (view === 'shelves') renderShelvesOverview();
  }

  window.switchAdminView = switchAdminView;

  function filterCatalogByType(type) {
    catalogTypeFilter = type;
    currentCatalogFilter = 'all';
    switchAdminView('catalog');
  }
  window.filterCatalogByType = filterCatalogByType;

  if (tabViewReview) tabViewReview.addEventListener('click', () => switchAdminView('review'));
  if (tabViewCatalog) tabViewCatalog.addEventListener('click', () => {
    catalogTypeFilter = null;
    switchAdminView('catalog');
  });
  if (tabViewShelves) tabViewShelves.addEventListener('click', () => switchAdminView('shelves'));
  if (tabViewUpload) tabViewUpload.addEventListener('click', () => switchAdminView('upload'));

  // ==============================================================
  // 2. SEQUENTIAL 1-BY-1 REVIEW DECK ENGINE
  // ==============================================================
  function detectDefaultShelf(item) {
    const url = (item.videoUrl || item.sourceUrl || '').toLowerCase();
    const title = (item.title || '').toLowerCase();
    const desc = (item.description || '').toLowerCase();

    // Auto-detect Vertical Shorts
    if (
      item.isShort || item.is_short ||
      item.section === 'shorts' || item.section === 'shorts1' || item.section === 'shorts2' ||
      url.includes('/shorts/') || url.includes('/reel/') || url.includes('/tiktok/') ||
      title.includes('#short') || title.includes('shorts') ||
      desc.includes('#shorts') || desc.includes('9:16')
    ) {
      return 'shorts1';
    }

    // Standard landscape defaults to Top 20 Entries
    return 'top20';
  }

  function updateDeckCounters() {
    const staging = Catalog.getStaging();
    const count = staging.length;

    if (deckTotalNum) deckTotalNum.textContent = count;
    if (tabReviewBadge) {
      tabReviewBadge.textContent = `${count} Pending`;
      tabReviewBadge.style.display = count > 0 ? 'inline-block' : 'none';
    }
    if (sidebarReviewBadge) {
      sidebarReviewBadge.textContent = count;
      sidebarReviewBadge.style.display = count > 0 ? 'inline-block' : 'none';
    }
  }

  function renderDeck() {
    updateDeckCounters();
    const staging = Catalog.getStaging();

    if (staging.length === 0) {
      if (deckCard) deckCard.style.display = 'none';
      if (deckEmptyState) deckEmptyState.style.display = 'block';
      if (deckCurrentNum) deckCurrentNum.textContent = '0';
      if (btnDeckPrev) btnDeckPrev.disabled = true;
      if (btnDeckNext) btnDeckNext.disabled = true;

      if (deckHls) {
        deckHls.destroy();
        deckHls = null;
      }
      if (deckVideoPlayer) {
        deckVideoPlayer.pause();
        deckVideoPlayer.src = '';
      }
      return;
    }

    if (deckCard) deckCard.style.display = 'grid';
    if (deckEmptyState) deckEmptyState.style.display = 'none';

    // Clamp currentDeckIndex
    if (currentDeckIndex >= staging.length) currentDeckIndex = staging.length - 1;
    if (currentDeckIndex < 0) currentDeckIndex = 0;

    const currentDraft = staging[currentDeckIndex];
    if (deckCurrentNum) deckCurrentNum.textContent = currentDeckIndex + 1;

    // Navigation buttons state
    if (btnDeckPrev) btnDeckPrev.disabled = currentDeckIndex <= 0;
    if (btnDeckNext) btnDeckNext.disabled = currentDeckIndex >= staging.length - 1;

    // Populate Fields
    if (deckTitleInput) deckTitleInput.value = currentDraft.title || '';
    if (deckDescInput) deckDescInput.value = currentDraft.description || '';
    if (deckTagsInput) {
      const tagsArr = Array.isArray(currentDraft.tags) ? currentDraft.tags : [];
      deckTagsInput.value = tagsArr.join(', ');
    }
    if (deckThumbInput) deckThumbInput.value = currentDraft.artworkUrl || 'images/pic01.jpg';
    if (deckThumbImg) deckThumbImg.src = currentDraft.artworkUrl || 'images/pic01.jpg';
    if (deckStagedDate) deckStagedDate.textContent = currentDraft.extractedAt || 'Recent';
    if (deckSourceLink) {
      deckSourceLink.href = currentDraft.sourceUrl || '#';
      deckSourceLink.style.display = currentDraft.sourceUrl ? 'inline' : 'none';
    }

    // Duplicate Detection Check
    const deckDuplicateBanner = document.getElementById('deck-duplicate-banner');
    const deckDuplicateDesc = document.getElementById('deck-duplicate-desc');
    const dup = Catalog.checkDuplicate(currentDraft);
    if (dup && dup.isDuplicate) {
      if (deckDuplicateBanner) deckDuplicateBanner.classList.remove('hidden');
      if (deckDuplicateDesc) {
        const existingTitle = dup.existing ? dup.existing.title : 'an existing video';
        const shelfLabel = dup.location.includes('Catalog') ? getShelfLabel(dup.shelf) : 'Review Queue';
        deckDuplicateDesc.textContent = `Warning: ${dup.matchedBy} matches "${existingTitle}" in ${dup.location} (${shelfLabel}).`;
      }
    } else {
      if (deckDuplicateBanner) deckDuplicateBanner.classList.add('hidden');
    }

    // Auto-detect Shelf
    const autoShelf = detectDefaultShelf(currentDraft);
    if (deckSectionSelect) deckSectionSelect.value = autoShelf;
    if (deckAutodetectBadge) {
      if (autoShelf === 'shorts1') {
        deckAutodetectBadge.textContent = 'Auto: Shorts Shelf 1';
        deckAutodetectBadge.style.color = '#e0245e';
        deckAutodetectBadge.style.background = 'rgba(224, 36, 94, 0.12)';
      } else {
        deckAutodetectBadge.textContent = 'Auto: Top 20 Grid';
        deckAutodetectBadge.style.color = '#2563eb';
        deckAutodetectBadge.style.background = 'rgba(37, 99, 235, 0.12)';
      }
    }

    // Video Player & Aspect Ratio
    const isVertical = autoShelf === 'shorts1' || autoShelf === 'shorts2';
    if (deckPlayerBox) {
      if (isVertical) deckPlayerBox.classList.add('is-vertical');
      else deckPlayerBox.classList.remove('is-vertical');
    }
    if (deckAspectBadge) {
      deckAspectBadge.textContent = isVertical ? '9:16 Vertical Reel' : '16:9 Landscape';
    }

    const streamUrl = currentDraft.videoUrl || '';
    const isHls = streamUrl.includes('.m3u8');
    if (deckStreamType) {
      deckStreamType.textContent = isHls ? 'Adaptive HLS (.m3u8)' : 'Direct MP4 Stream';
    }

    // Load Stream into Deck Player
    if (deckVideoPlayer) {
      if (deckHls) {
        deckHls.destroy();
        deckHls = null;
      }

      if (isHls && window.Hls && Hls.isSupported()) {
        deckHls = new Hls({ autoStartLoad: true });
        deckHls.loadSource(streamUrl);
        deckHls.attachMedia(deckVideoPlayer);
      } else {
        deckVideoPlayer.src = streamUrl;
      }
    }

    // Render Quick Tag Suggestion Chips
    if (deckTagQuickBar) {
      const activeTags = Catalog.getAllTags().slice(0, 8);
      deckTagQuickBar.innerHTML = '';
      activeTags.forEach(t => {
        const chip = document.createElement('span');
        chip.className = 'deck-tag-chip';
        chip.textContent = `+ ${t}`;
        chip.addEventListener('click', () => {
          const current = (deckTagsInput.value || '').split(',').map(x => x.trim()).filter(Boolean);
          if (!current.includes(t)) {
            current.push(t);
            deckTagsInput.value = current.join(', ');
          }
        });
        deckTagQuickBar.appendChild(chip);
      });
    }
  }

  window.renderDeck = renderDeck;
  window.renderReviewQueue = renderDeck; // Alias for backward compatibility

  // Thumbnail URL live preview
  if (deckThumbInput && deckThumbImg) {
    deckThumbInput.addEventListener('input', (e) => {
      deckThumbImg.src = e.target.value.trim() || 'images/pic01.jpg';
    });
  }

  // Prev / Next Navigation
  if (btnDeckPrev) {
    btnDeckPrev.addEventListener('click', () => {
      if (currentDeckIndex > 0) {
        currentDeckIndex--;
        renderDeck();
      }
    });
  }
  if (btnDeckNext) {
    btnDeckNext.addEventListener('click', () => {
      const staging = Catalog.getStaging();
      if (currentDeckIndex < staging.length - 1) {
        currentDeckIndex++;
        renderDeck();
      }
    });
  }

  // Approve & Advance to Next
  if (btnDeckApprove) {
    btnDeckApprove.addEventListener('click', () => {
      const staging = Catalog.getStaging();
      if (staging.length === 0) return;

      const currentDraft = staging[currentDeckIndex];
      const dup = Catalog.checkDuplicate(currentDraft);
      if (dup && dup.isDuplicate) {
        if (!confirm(`Warning: This video is detected as duplicate of "${dup.existing?.title || 'an existing video'}" in ${dup.location}. Are you sure you want to approve and publish anyway?`)) {
          return;
        }
      }
      const title = deckTitleInput.value.trim() || currentDraft.title;
      const shelf = deckSectionSelect.value;
      const tags = (deckTagsInput.value || '').split(',').map(t => t.trim()).filter(Boolean);
      const desc = deckDescInput.value.trim();
      const artwork = deckThumbInput.value.trim() || currentDraft.artworkUrl;

      // Save to public catalog & remove from staging
      Catalog.approveStaged(currentDraft.id, shelf, {
        title,
        artworkUrl: artwork,
        tags,
        description: desc
      });

      showToast(`Approved "${title}" to ${getShelfLabel(shelf)}! Advanced to next.`);

      // Smooth card transition
      if (deckCard) {
        deckCard.style.opacity = '0.4';
        deckCard.style.transform = 'translateX(-12px)';
        setTimeout(() => {
          renderDeck();
          deckCard.style.opacity = '1';
          deckCard.style.transform = 'translateX(0)';
        }, 160);
      } else {
        renderDeck();
      }

      renderCatalogTable();
    });
  }

  // Delete Duplicate 1-Click Action
  const btnDeckDeleteDup = document.getElementById('btn-deck-delete-duplicate');
  if (btnDeckDeleteDup) {
    btnDeckDeleteDup.addEventListener('click', () => {
      const staging = Catalog.getStaging();
      if (staging.length === 0) return;
      const currentDraft = staging[currentDeckIndex];
      if (confirm(`Permanently delete duplicate draft "${currentDraft.title}" from review queue?`)) {
        Catalog.rejectStaged(currentDraft.id);
        showToast('Duplicate draft deleted from review queue.');
        renderDeck();
      }
    });
  }

  // Dismiss / Discard Draft
  if (btnDeckDismiss) {
    btnDeckDismiss.addEventListener('click', () => {
      const staging = Catalog.getStaging();
      if (staging.length === 0) return;

      const currentDraft = staging[currentDeckIndex];
      if (confirm(`Dismiss draft "${currentDraft.title}" from review?`)) {
        Catalog.rejectStaged(currentDraft.id);
        showToast(`Discarded draft "${currentDraft.title}"`);
        renderDeck();
      }
    });
  }

  // Quick Stage URL Prompt
  if (btnImportStageUrl) {
    btnImportStageUrl.addEventListener('click', () => {
      const url = prompt('Enter video stream CDN URL (.mp4 or .m3u8):');
      if (!url || !url.trim()) return;
      const title = prompt('Enter video title:', 'Curated Video Stream') || 'Curated Video Stream';
      const artwork = prompt('Enter artwork cover photo CDN URL (optional):', 'images/pic01.jpg') || 'images/pic01.jpg';

      Catalog.addStaged({
        title: title.trim(),
        videoUrl: url.trim(),
        artworkUrl: artwork.trim(),
        description: 'Directly staged stream waiting for review.'
      });

      showToast(`Staged "${title}" in Review Deck!`);
      currentDeckIndex = 0;
      renderDeck();
      switchAdminView('review');
    });
  }

  // Clear Staging
  if (btnClearStaging) {
    btnClearStaging.addEventListener('click', () => {
      if (confirm('Clear all pending drafts from review queue?')) {
        Catalog.clearStaging();
        showToast('Cleared review queue');
        renderDeck();
      }
    });
  }

  if (btnEmptyStage) btnEmptyStage.addEventListener('click', () => btnImportStageUrl && btnImportStageUrl.click());
  if (btnEmptyCatalog) btnEmptyCatalog.addEventListener('click', () => switchAdminView('catalog'));

  // ==============================================================
  // 3. COMPACT CATALOG TABLE & INLINE EDIT DRAWER
  // ==============================================================
  function getShelfLabel(sec) {
    switch (sec) {
      case 'top20': return 'Top 20 Entries';
      case 'shorts1': return 'Shorts Shelf 1';
      case 'mid': return 'Curated Mid Stream';
      case 'shorts2': return 'Trending Shorts 2';
      case 'default': return 'Endless Default Feed';
      default: return 'Endless Default Feed';
    }
  }

  function getShelfBadgeClass(sec) {
    switch (sec) {
      case 'top20': return 'shelf-top20';
      case 'shorts1': return 'shelf-shorts1';
      case 'mid': return 'shelf-mid';
      case 'shorts2': return 'shelf-shorts2';
      default: return 'shelf-default';
    }
  }

  function updateCatalogCounts() {
    const all = Catalog.getAll();
    if (totalCatalogCount) totalCatalogCount.textContent = all.length;
    if (tabCatalogCount) tabCatalogCount.textContent = all.length;

    const countAll = document.getElementById('count-all');
    const countTop20 = document.getElementById('count-top20');
    const countShorts1 = document.getElementById('count-shorts1');
    const countMid = document.getElementById('count-mid');
    const countShorts2 = document.getElementById('count-shorts2');
    const countDefault = document.getElementById('count-default');

    if (countAll) countAll.textContent = all.length;
    if (countTop20) countTop20.textContent = Catalog.getTop20().length;
    if (countShorts1) countShorts1.textContent = Catalog.getShorts1().length;
    if (countMid) countMid.textContent = Catalog.getMid().length;
    if (countShorts2) countShorts2.textContent = Catalog.getShorts2().length;
    if (countDefault) countDefault.textContent = Catalog.getDefaultFeed().length;
  }

  function renderCatalogTable() {
    updateCatalogCounts();
    if (!catalogTableBody) return;

    let items = Catalog.getAll();

    // Shelf filter
    if (currentCatalogFilter && currentCatalogFilter !== 'all') {
      if (currentCatalogFilter === 'top20') items = Catalog.getTop20();
      else if (currentCatalogFilter === 'shorts1') items = Catalog.getShorts1();
      else if (currentCatalogFilter === 'mid') items = Catalog.getMid();
      else if (currentCatalogFilter === 'shorts2') items = Catalog.getShorts2();
      else if (currentCatalogFilter === 'default') items = Catalog.getDefaultFeed();
    }

    // Type filter from sidebar (Videos vs Shorts)
    if (catalogTypeFilter) {
      items = items.filter(v => v.type === catalogTypeFilter);
    }

    // Search query
    const q = (catalogSearchInput ? catalogSearchInput.value : '').toLowerCase().trim();
    if (q) {
      items = items.filter(v => {
        const titleMatch = (v.title || '').toLowerCase().includes(q);
        const tagsMatch = (v.tags || []).some(t => String(t).toLowerCase().includes(q));
        return titleMatch || tagsMatch;
      });
    }

    catalogTableBody.innerHTML = '';

    if (items.length === 0) {
      catalogTableBody.innerHTML = `
        <tr>
          <td colspan="6" style="padding: 36px; text-align: center; color: var(--color-fg-light);">
            No videos found matching the selected filter.
          </td>
        </tr>
      `;
      return;
    }

    items.forEach(v => {
      const tr = document.createElement('tr');
      const isShort = v.type === 'short' || v.section === 'shorts1' || v.section === 'shorts2';
      const tagsList = (v.tags || []).map(t => `<span class="tag-chip-sm">#${escapeHtml(t)}</span>`).join('');

      tr.innerHTML = `
        <td class="catalog-thumb-cell" title="Click to test live video stream">
          <img src="${v.artworkUrl || 'images/pic01.jpg'}" alt="${escapeHtml(v.title)}" />
          <div class="catalog-thumb-overlay">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="6 3 20 12 6 21 6 3"/></svg>
          </div>
        </td>
        <td>
          <a class="catalog-title-link" title="Click to edit">${escapeHtml(v.title)}</a>
          <div style="font-size: 0.72rem; color: var(--color-fg-light); margin-top: 2px;">
            <span>${escapeHtml(v.date || 'Recent')}</span>
            <span>&bull;</span>
            <span style="max-width: 200px; display: inline-block; overflow: hidden; text-overflow: ellipsis; vertical-align: bottom;">
              ${escapeHtml(v.videoUrl)}
            </span>
          </div>
        </td>
        <td>
          <span class="shelf-badge-pill ${getShelfBadgeClass(v.section)}">
            ${getShelfLabel(v.section)}
          </span>
        </td>
        <td>
          <span style="font-size: 0.75rem; color: ${isShort ? '#e0245e' : 'var(--color-fg-bold)'};">
            ${isShort ? '9:16 Short' : '16:9 Video'}
          </span>
        </td>
        <td>
          <div style="max-width: 220px; overflow: hidden;">
            ${tagsList || '<span style="color: var(--color-fg-light); font-size: 0.72rem;">No tags</span>'}
          </div>
        </td>
        <td style="text-align: right; white-space: nowrap;">
          <button class="table-action-btn btn-edit" title="Edit inside content">Edit</button>
          <button class="table-action-btn btn-prev" title="Preview stream">Preview</button>
          <button class="table-action-btn btn-del" title="Delete from catalog">Delete</button>
        </td>
      `;

      // Events
      const thumbCell = tr.querySelector('.catalog-thumb-cell');
      const titleLink = tr.querySelector('.catalog-title-link');
      const btnEdit = tr.querySelector('.btn-edit');
      const btnPrev = tr.querySelector('.btn-prev');
      const btnDel = tr.querySelector('.btn-del');

      const openPrev = () => openStreamPreview(v.title, v.videoUrl);
      const openEdit = () => openEditDrawer(v);

      if (thumbCell) thumbCell.addEventListener('click', openPrev);
      if (btnPrev) btnPrev.addEventListener('click', openPrev);
      if (titleLink) titleLink.addEventListener('click', openEdit);
      if (btnEdit) btnEdit.addEventListener('click', openEdit);

      if (btnDel) {
        btnDel.addEventListener('click', () => {
          if (confirm(`Delete "${v.title}" from catalog?`)) {
            Catalog.deleteVideo(v.id);
            showToast(`Deleted "${v.title}"`);
            renderCatalogTable();
          }
        });
      }

      catalogTableBody.appendChild(tr);
    });
  }

  window.renderCatalogList = renderCatalogTable;

  // Filter Tabs
  const filterBtns = document.querySelectorAll('.catalog-tab-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      currentCatalogFilter = btn.dataset.filter;
      renderCatalogTable();
    });
  });

  if (catalogSearchInput) {
    catalogSearchInput.addEventListener('input', () => renderCatalogTable());
  }

  // Purge Demo Placeholders
  if (btnPurgePlaceholders) {
    btnPurgePlaceholders.addEventListener('click', () => {
      if (confirm('Purge all initial demo placeholder videos (pic01-pic12) from your catalog?')) {
        Catalog.clearDemoPlaceholders();
        showToast('Purged demo placeholders from catalog');
        renderCatalogTable();
      }
    });
  }

  // ==============================================================
  // 4. INLINE EDIT DRAWER CONTROLLER
  // ==============================================================
  function openEditDrawer(video) {
    if (!editDrawerBackdrop) return;
    drawerVideoId.value = video.id;
    drawerTitle.value = video.title || '';
    drawerVideoUrl.value = video.videoUrl || '';
    drawerArtworkUrl.value = video.artworkUrl || '';
    if (drawerArtworkPreview) drawerArtworkPreview.src = video.artworkUrl || 'images/pic01.jpg';
    drawerShelfSelect.value = video.section || 'default';
    drawerTags.value = (video.tags || []).join(', ');
    drawerDesc.value = video.description || '';

    editDrawerBackdrop.classList.add('is-open');
  }

  function closeEditDrawer() {
    if (!editDrawerBackdrop) return;
    editDrawerBackdrop.classList.remove('is-open');
  }

  if (btnCloseDrawer) btnCloseDrawer.addEventListener('click', closeEditDrawer);
  if (btnCancelDrawer) btnCancelDrawer.addEventListener('click', closeEditDrawer);
  if (editDrawerBackdrop) {
    editDrawerBackdrop.addEventListener('click', (e) => {
      if (e.target === editDrawerBackdrop) closeEditDrawer();
    });
  }

  if (drawerArtworkUrl && drawerArtworkPreview) {
    drawerArtworkUrl.addEventListener('input', (e) => {
      drawerArtworkPreview.src = e.target.value.trim() || 'images/pic01.jpg';
    });
  }

  if (btnSaveDrawer) {
    btnSaveDrawer.addEventListener('click', () => {
      const id = drawerVideoId.value;
      if (!id) return;

      const title = drawerTitle.value.trim();
      const videoUrl = drawerVideoUrl.value.trim();
      const artworkUrl = drawerArtworkUrl.value.trim() || 'images/pic01.jpg';
      const section = drawerShelfSelect.value;
      const tags = drawerTags.value.split(',').map(t => t.trim()).filter(Boolean);
      const description = drawerDesc.value.trim();

      if (!title || !videoUrl) {
        alert('Please provide both Title and Video URL');
        return;
      }

      Catalog.updateVideo(id, {
        title,
        videoUrl,
        artworkUrl,
        section,
        tags,
        description
      });

      showToast(`Updated "${title}" successfully!`);
      closeEditDrawer();
      renderCatalogTable();
    });
  }

  // ==============================================================
  // 5. SHELVES & DYNAMIC TAGS OVERVIEW CONTROLLER
  // ==============================================================
  function renderShelvesOverview() {
    const statTop = document.getElementById('stat-count-top20');
    const statShorts1 = document.getElementById('stat-count-shorts1');
    const statMid = document.getElementById('stat-count-mid');
    const statShorts2 = document.getElementById('stat-count-shorts2');
    const statDefault = document.getElementById('stat-count-default');
    const tagCloud = document.getElementById('overview-tag-cloud');

    if (statTop) statTop.textContent = `${Catalog.getTop20().length} / 20`;
    if (statShorts1) statShorts1.textContent = Catalog.getShorts1().length;
    if (statMid) statMid.textContent = Catalog.getMid().length;
    if (statShorts2) statShorts2.textContent = Catalog.getShorts2().length;
    if (statDefault) statDefault.textContent = Catalog.getDefaultFeed().length;

    if (tagCloud) {
      const allTags = Catalog.getAllTags();
      tagCloud.innerHTML = '';
      if (allTags.length === 0) {
        tagCloud.innerHTML = '<span style="color: var(--color-fg-light); font-size: 0.82rem;">No tags defined yet. Add tags while reviewing or editing videos.</span>';
        return;
      }

      allTags.forEach(t => {
        const count = Catalog.getByTag(t).length;
        const pill = document.createElement('button');
        pill.className = 'btn-secondary';
        pill.style.height = '32px';
        pill.style.fontSize = '0.78rem';
        pill.textContent = `#${t} (${count})`;
        pill.addEventListener('click', () => {
          if (catalogSearchInput) catalogSearchInput.value = t;
          switchAdminView('catalog');
        });
        tagCloud.appendChild(pill);
      });
    }
  }

  // ==============================================================
  // 6. DIRECT UPLOAD FORM
  // ==============================================================
  if (directUploadForm) {
    directUploadForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = document.getElementById('upload-title').value.trim();
      const videoUrl = document.getElementById('upload-cdn-url').value.trim();
      const artworkUrl = document.getElementById('upload-artwork-url').value.trim() || 'images/pic01.jpg';
      const section = document.getElementById('upload-shelf-select').value;
      const tags = (document.getElementById('upload-tags').value || '').split(',').map(t => t.trim()).filter(Boolean);
      const description = document.getElementById('upload-desc').value.trim();

      Catalog.addVideo({
        title,
        videoUrl,
        artworkUrl,
        section,
        tags,
        description
      });

      showToast(`Published "${title}" to ${getShelfLabel(section)}!`);
      directUploadForm.reset();
      switchAdminView('catalog');
    });
  }

  // ==============================================================
  // 7. STREAM PREVIEW MODAL
  // ==============================================================
  function openStreamPreview(title, streamUrl) {
    if (!previewModal || !modalVideoPlayer) return;
    if (modalStreamTitle) modalStreamTitle.textContent = `Preview: ${title}`;
    previewModal.classList.add('is-open');

    if (modalHls) {
      modalHls.destroy();
      modalHls = null;
    }

    const isHls = streamUrl && streamUrl.includes('.m3u8');
    if (isHls && window.Hls && Hls.isSupported()) {
      modalHls = new Hls({ autoStartLoad: true });
      modalHls.loadSource(streamUrl);
      modalHls.attachMedia(modalVideoPlayer);
      modalHls.on(Hls.Events.MANIFEST_PARSED, () => {
        modalVideoPlayer.play().catch(() => {});
      });
    } else {
      modalVideoPlayer.src = streamUrl;
      modalVideoPlayer.load();
      modalVideoPlayer.play().catch(() => {});
    }
  }

  function closeStreamPreview() {
    if (!previewModal || !modalVideoPlayer) return;
    previewModal.classList.remove('is-open');
    modalVideoPlayer.pause();
    modalVideoPlayer.src = '';
    if (modalHls) {
      modalHls.destroy();
      modalHls = null;
    }
  }

  if (btnCloseModal) btnCloseModal.addEventListener('click', closeStreamPreview);
  if (previewModal) {
    previewModal.addEventListener('click', (e) => {
      if (e.target === previewModal) closeStreamPreview();
    });
  }

  // ==============================================================
  // 8. EXPORT FOR GITHUB & RESET
  // ==============================================================
  if (btnExportFeed) {
    btnExportFeed.addEventListener('click', () => {
      const code = Catalog.exportFeedJS();
      const blob = new Blob([code], { type: 'application/javascript;charset=utf-8' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'catalog-feed.js';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      showToast('Downloaded updated catalog-feed.js! Drag into your repo js/ folder.');
    });
  }

  if (btnResetCatalog) {
    btnResetCatalog.addEventListener('click', () => {
      if (confirm('Reset your catalog to the default master feed?')) {
        Catalog.resetToDefaults();
        showToast('Reset catalog to master feed');
        renderCatalogTable();
        renderDeck();
      }
    });
  }

  if (btnAdminLogout) {
    btnAdminLogout.addEventListener('click', () => {
      try {
        sessionStorage.removeItem('tuc_admin_auth');
        localStorage.removeItem('tuc_admin_auth');
        localStorage.removeItem('tuc_user');
      } catch(e) {}
      window.location.href = 'index.html';
    });
  }

  // Keyboard navigation for Deck: ArrowLeft / ArrowRight
  window.addEventListener('keydown', (e) => {
    if (currentView !== 'review') return;
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) return;
    if (e.key === 'ArrowLeft' && btnDeckPrev && !btnDeckPrev.disabled) {
      btnDeckPrev.click();
    } else if (e.key === 'ArrowRight' && btnDeckNext && !btnDeckNext.disabled) {
      btnDeckNext.click();
    }
  });

  function showToast(msg) {
    const toast = document.getElementById('admin-toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(12px)';
    }, 3200);
  }

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // Initial renders
  renderDeck();
  renderCatalogTable();
  switchAdminView('review');
});
