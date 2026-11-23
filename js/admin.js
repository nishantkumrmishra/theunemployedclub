// The Unemployed Club - Admin Studio Controller
// Dedicated Review Inbox View, Pro Review Cards with Inline Editing,
// Auto-Detected Section Placement,, manages the Editorial Staging Review Queue,
// and Instant Deletion on Approval/Dismiss.

document.addEventListener('DOMContentLoaded', () => {
  // Primary Studio View Tabs
  const tabViewReview = document.getElementById('tab-nav-review');
  const tabViewCatalog = document.getElementById('tab-nav-catalog');
  const tabViewUpload = document.getElementById('tab-nav-upload');

  const paneReview = document.getElementById('view-review-pane');
  const paneCatalog = document.getElementById('view-catalog-pane');
  const paneUpload = document.getElementById('view-upload-pane');

  const stagedBadge = document.getElementById('tab-review-count');
  const stagedCountHeader = document.getElementById('staged-count-header');
  const catalogCountPill = document.getElementById('tab-catalog-count');
  const sidebarReviewBadge = document.getElementById('sidebar-review-badge');

  // Staging Review Queue Elements
  const stagedContainer = document.getElementById('staged-items-container');
  const btnImportStageUrl = document.getElementById('btn-import-stage-url');
  const btnClearStaging = document.getElementById('btn-clear-staging');

  // Main Form Elements (Upload / Edit)
  const form = document.getElementById('admin-video-form');
  const formHeading = document.getElementById('form-heading');
  const editIndicator = document.getElementById('edit-indicator');
  const editIdInput = document.getElementById('edit-video-id');
  const titleInput = document.getElementById('video-title');
  const descInput = document.getElementById('video-desc');
  const videoUrlInput = document.getElementById('video-cdn-url');
  const artworkUrlInput = document.getElementById('video-artwork-url');
  const artworkPreviewBox = document.getElementById('artwork-preview-box');
  const artworkPreviewImg = document.getElementById('artwork-preview-img');
  const artworkEmptyLabel = document.getElementById('artwork-empty-label');
  const artworkFileInput = document.getElementById('artwork-file-input');
  const artworkDropZone = document.getElementById('artwork-drop-zone');
  const btnSubmit = document.getElementById('btn-submit-form');
  const btnCancel = document.getElementById('btn-cancel-edit');
  const btnExport = document.getElementById('btn-export-feed');
  const btnReset = document.getElementById('btn-reset-catalog');
  const searchInput = document.getElementById('admin-search-input') || document.getElementById('header-search-input');
  const listContainer = document.getElementById('catalog-list-container');

  // Preview Modal Elements
  const previewModal = document.getElementById('stream-preview-modal');
  const modalVideo = document.getElementById('modal-video-player');
  const modalTitle = document.getElementById('modal-stream-title');
  const btnCloseModal = document.getElementById('btn-close-modal');
  let modalHls = null;

  let currentView = 'review';
  let currentFilter = 'all';

  // ==============================================================
  // 1. DEDICATED STUDIO VIEW SWITCHER
  // ==============================================================
  function switchAdminView(view) {
    currentView = view;

    // Toggle Tab Buttons
    [tabViewReview, tabViewCatalog, tabViewUpload].forEach(btn => {
      if (btn) btn.classList.remove('is-active');
    });

    if (view === 'review' && tabViewReview) tabViewReview.classList.add('is-active');
    if (view === 'catalog' && tabViewCatalog) tabViewCatalog.classList.add('is-active');
    if (view === 'upload' && tabViewUpload) tabViewUpload.classList.add('is-active');

    // Toggle Panes
    if (paneReview) paneReview.style.display = view === 'review' ? 'block' : 'none';
    if (paneCatalog) paneCatalog.style.display = view === 'catalog' ? 'block' : 'none';
    if (paneUpload) paneUpload.style.display = view === 'upload' ? 'block' : 'none';

    // Sync Sidebar
    const sideReview = document.getElementById('admin-nav-review');
    const sideCatalog = document.getElementById('admin-nav-catalog');
    const sideAdd = document.getElementById('admin-nav-add');
    [sideReview, sideCatalog, sideAdd].forEach(a => a && a.classList.remove('active'));

    if (view === 'review' && sideReview) sideReview.classList.add('active');
    if (view === 'catalog' && sideCatalog) sideCatalog.classList.add('active');
    if (view === 'upload' && sideAdd) sideAdd.classList.add('active');

    if (view === 'catalog') renderCatalogList();
    if (view === 'review') renderReviewQueue();
  }

  window.switchAdminView = switchAdminView;

  if (tabViewReview) tabViewReview.addEventListener('click', () => switchAdminView('review'));
  if (tabViewCatalog) tabViewCatalog.addEventListener('click', () => switchAdminView('catalog'));
  if (tabViewUpload) tabViewUpload.addEventListener('click', () => switchAdminView('upload'));

  // ==============================================================
  // 2. SMART SECTION AUTO-DETECTION HELPER
  // ==============================================================
  function detectDefaultSection(item) {
    const url = (item.videoUrl || item.sourceUrl || '').toLowerCase();
    const title = (item.title || '').toLowerCase();
    const desc = (item.description || '').toLowerCase();

    // Auto-detect Shorts (9:16 vertical video keywords or aspect indicators)
    if (
      item.isShort || item.is_short ||
      item.section === 'shorts' ||
      url.includes('/shorts/') || url.includes('/reel/') || url.includes('/tiktok/') ||
      title.includes('#short') || title.includes('shorts') ||
      desc.includes('#shorts') || desc.includes('9:16')
    ) {
      return 'shorts';
    }

    // Default to Top 2 Rows for standard landscape video
    return 'top';
  }

  // ==============================================================
  // 3. EDITORIAL REVIEW QUEUE WITH INLINE EDIT & INSTANT DELETION
  // ==============================================================
  function updateStagingCounts() {
    const staged = Catalog.getStaging();
    const count = staged.length;

    if (stagedBadge) stagedBadge.textContent = `${count} Pending`;
    if (stagedCountHeader) stagedCountHeader.textContent = count;
    if (sidebarReviewBadge) {
      sidebarReviewBadge.textContent = count;
      sidebarReviewBadge.style.display = count > 0 ? 'inline-block' : 'none';
    }
  }

  function checkReviewEmptyState() {
    const staged = Catalog.getStaging();
    if (staged.length === 0 && stagedContainer) {
      stagedContainer.innerHTML = `
        <div class="review-empty-state">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 12px;">
            <circle cx="12" cy="12" r="10"/><polyline points="9 12 11 14 15 10"/>
          </svg>
          <h3>All Caught Up!</h3>
          <p>There are currently zero video drafts waiting for review.</p>
          <p style="font-size: 0.8rem; color: var(--color-fg-light); margin-top: 6px;">
            Run <code>tools/extractor.bat</code> to extract new videos, or click below to stage a video stream link directly.
          </p>
          <div style="margin-top: 18px;">
            <button class="btn-primary" id="btn-empty-stage-url" style="height: 38px; padding: 0 20px;">
              + Stage URL Directly
            </button>
          </div>
        </div>
      `;
      const btnEmpty = document.getElementById('btn-empty-stage-url');
      if (btnEmpty) {
        btnEmpty.addEventListener('click', () => {
          if (btnImportStageUrl) btnImportStageUrl.click();
        });
      }
    }
  }

  function renderReviewQueue() {
    if (!stagedContainer) return;
    updateStagingCounts();

    const staged = Catalog.getStaging();
    stagedContainer.innerHTML = '';

    if (staged.length === 0) {
      checkReviewEmptyState();
      return;
    }

    staged.forEach((item) => {
      const detectedSection = detectDefaultSection(item);
      const isShortDetected = detectedSection === 'shorts';

      const card = document.createElement('div');
      card.className = 'review-card-pro';
      card.setAttribute('data-draft-id', item.id);

      card.innerHTML = `
        <!-- Left Column: Video Thumbnail & Stream Preview -->
        <div class="review-thumb-col">
          <div class="review-thumb-box ${isShortDetected ? 'is-short' : ''}" title="Click to test live video stream">
            <img src="${item.artworkUrl || 'images/pic01.jpg'}" alt="${escapeHtml(item.title)}" />
            <div class="review-thumb-overlay">
              <div class="review-play-badge">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="6 3 20 12 6 21 6 3"/></svg>
                <span>Preview Stream</span>
              </div>
            </div>
          </div>
          <div style="font-size: 0.72rem; color: var(--color-fg-light); text-align: center; word-break: break-all;">
            <code>${item.videoUrl.includes('.m3u8') ? 'Adaptive HLS (.m3u8)' : 'Direct MP4 Stream'}</code>
          </div>
        </div>

        <!-- Center Column: Inline Editing (Title & Description) -->
        <div class="review-edit-col">
          <div class="review-input-group">
            <label>Video Title (Click to edit):</label>
            <input type="text" class="review-title-input" value="${escapeHtml(item.title)}" placeholder="Enter video title..." />
          </div>

          <div class="review-input-group">
            <label>Description:</label>
            <textarea class="review-desc-input" rows="2" placeholder="Video description...">${escapeHtml(item.description || 'Direct CDN video stream.')}</textarea>
          </div>

          <div class="review-meta-row">
            <span>Staged: ${escapeHtml(item.extractedAt || 'Recent')}</span>
            <span>&bull;</span>
            <span style="max-width: 260px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
              CDN: <a href="${item.videoUrl}" target="_blank" style="color: var(--color-accent); text-decoration: none;">${escapeHtml(item.videoUrl)}</a>
            </span>
            ${item.sourceUrl ? `<span>&bull;</span><a href="${item.sourceUrl}" target="_blank" style="color: var(--color-fg-light); text-decoration: none;">Original Source</a>` : ''}
          </div>
        </div>

        <!-- Right Column: Section Placement Dropdown & Action Buttons -->
        <div class="review-actions-col">
          <div class="review-placement-label">
            <span>Where should this go?</span>
            ${isShortDetected ? '<span class="auto-detected-tag">Auto: Shorts</span>' : '<span class="auto-detected-tag">Auto: Top Grid</span>'}
          </div>

          <select class="select-review-placement" title="Select website section">
            <option value="shorts" ${detectedSection === 'shorts' ? 'selected' : ''}>📱 Shorts Shelf (9:14 Vertical)</option>
            <option value="top" ${detectedSection === 'top' ? 'selected' : ''}>⭐ Top 2 Rows (Featured Grid)</option>
            <option value="mid">🎬 Middle Row (Curated Break)</option>
            <option value="bottom">📜 Bottom Feed (Endless Scroll)</option>
          </select>

          <!-- 40px High-Contrast Approve & Publish Button -->
          <button class="btn-approve-pro" title="Publish live and immediately remove from review queue">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="20 6 9 17 4 12"/></svg>
            <span>Approve &amp; Publish</span>
          </button>

          <!-- Sub-Actions: Preview & Dismiss -->
          <div class="review-sub-actions">
            <button class="review-sub-btn btn-preview-stream" title="Watch stream in modal">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="6 3 20 12 6 21 6 3"/></svg>
              <span>Preview</span>
            </button>
            <button class="review-sub-btn btn-dismiss-pro" title="Delete draft immediately">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              <span>Dismiss</span>
            </button>
          </div>
        </div>
      `;

      // Elements inside card
      const thumbBox = card.querySelector('.review-thumb-box');
      const btnPreview = card.querySelector('.btn-preview-stream');
      const btnApprove = card.querySelector('.btn-approve-pro');
      const btnDismiss = card.querySelector('.btn-dismiss-pro');
      const titleInputCard = card.querySelector('.review-title-input');
      const descInputCard = card.querySelector('.review-desc-input');
      const selectPlacement = card.querySelector('.select-review-placement');

      // 1. Preview Stream Handlers
      const triggerPreview = () => openStreamPreview(titleInputCard.value.trim() || item.title, item.videoUrl);
      thumbBox.addEventListener('click', triggerPreview);
      btnPreview.addEventListener('click', triggerPreview);

      // 2. Placement Dropdown Change: adjust thumbnail aspect ratio if user selects Shorts
      selectPlacement.addEventListener('change', () => {
        if (selectPlacement.value === 'shorts') {
          thumbBox.classList.add('is-short');
        } else {
          thumbBox.classList.remove('is-short');
        }
      });

      // 3. Approve & Publish: Saves to Catalog & AUTOMATICALLY DELETES FROM REVIEW QUEUE
      btnApprove.addEventListener('click', () => {
        const chosenSec = selectPlacement.value;
        const finalTitle = titleInputCard.value.trim() || item.title;
        const finalDesc = descInputCard.value.trim() || item.description;

        // Publish into active catalog and purge from staging
        const published = Catalog.approveStaged(item.id, chosenSec, {
          title: finalTitle,
          description: finalDesc
        });

        if (published) {
          // Animate card removal smoothly
          card.style.opacity = '0';
          card.style.transform = 'translateX(24px)';
          setTimeout(() => {
            card.remove();
            updateStagingCounts();
            checkReviewEmptyState();
          }, 220);

          showToast(`Approved "${finalTitle}" to ${getPlacementLabel(chosenSec)}! Draft deleted from review.`);
          renderCatalogList();
        }
      });

      // 4. Dismiss / Delete Draft: Permanently deletes from review queue on the spot
      btnDismiss.addEventListener('click', () => {
        if (confirm(`Delete draft "${item.title}" from review queue?`)) {
          Catalog.rejectStaged(item.id);

          card.style.opacity = '0';
          card.style.transform = 'translateX(24px)';
          setTimeout(() => {
            card.remove();
            updateStagingCounts();
            checkReviewEmptyState();
          }, 220);

          showToast(`Deleted draft "${item.title}"`);
        }
      });

      stagedContainer.appendChild(card);
    });
  }

  // Quick Stage URL Direct prompt
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
        description: 'Directly staged stream waiting for section review.',
        author: 'The Unemployed Club'
      });

      showToast(`Staged "${title}" in Review Queue!`);
      renderReviewQueue();
      switchAdminView('review');
    });
  }

  // Clear all staged
  if (btnClearStaging) {
    btnClearStaging.addEventListener('click', () => {
      if (confirm('Clear all pending drafts from the review queue?')) {
        Catalog.clearStaging();
        showToast('Cleared review queue');
        renderReviewQueue();
      }
    });
  }

  // ==============================================================
  // 4. STREAM PREVIEW MODAL
  // ==============================================================
  function openStreamPreview(title, streamUrl) {
    if (!previewModal || !modalVideo) return;
    modalTitle.textContent = `Preview: ${title}`;
    previewModal.classList.add('is-open');

    if (modalHls) {
      modalHls.destroy();
      modalHls = null;
    }

    const isHls = streamUrl && streamUrl.includes('.m3u8');
    if (isHls && window.Hls && Hls.isSupported()) {
      modalHls = new Hls({ autoStartLoad: true });
      modalHls.loadSource(streamUrl);
      modalHls.attachMedia(modalVideo);
      modalHls.on(Hls.Events.MANIFEST_PARSED, () => {
        modalVideo.play().catch(() => {});
      });
    } else {
      modalVideo.src = streamUrl;
      modalVideo.load();
      modalVideo.play().catch(() => {});
    }
  }

  function closeStreamPreview() {
    if (!previewModal || !modalVideo) return;
    previewModal.classList.remove('is-open');
    modalVideo.pause();
    modalVideo.src = '';
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
  // 5. DIRECT UPLOAD / EDIT FORM SUBMIT
  // ==============================================================
  // Placement Pills in Upload View
  const placementPills = document.querySelectorAll('.placement-pill-btn');
  placementPills.forEach(pill => {
    pill.addEventListener('click', () => {
      placementPills.forEach(p => p.classList.remove('is-active'));
      pill.classList.add('is-active');
      const radio = pill.querySelector('input[type="radio"]');
      if (radio) radio.checked = true;

      const selectedVal = getSelectedPlacement();
      if (selectedVal === 'shorts') {
        artworkPreviewBox.classList.add('is-short');
      } else {
        artworkPreviewBox.classList.remove('is-short');
      }
    });
  });

  function getSelectedPlacement() {
    const checked = document.querySelector('input[name="video-placement"]:checked');
    return checked ? checked.value : 'top';
  }

  function setSelectedPlacement(val) {
    placementPills.forEach(p => {
      const radio = p.querySelector('input[type="radio"]');
      if (radio && radio.value === val) {
        radio.checked = true;
        p.classList.add('is-active');
      } else {
        p.classList.remove('is-active');
      }
    });
    if (val === 'shorts') {
      artworkPreviewBox.classList.add('is-short');
    } else {
      artworkPreviewBox.classList.remove('is-short');
    }
  }

  if (artworkUrlInput) {
    ['input', 'change'].forEach(evt => {
      artworkUrlInput.addEventListener(evt, () => {
        updateArtworkPreview(artworkUrlInput.value.trim());
      });
    });
  }

  function updateArtworkPreview(src) {
    if (src) {
      artworkPreviewImg.src = src;
      artworkPreviewImg.style.display = 'block';
      artworkEmptyLabel.style.display = 'none';
    } else {
      artworkPreviewImg.src = '';
      artworkPreviewImg.style.display = 'none';
      artworkEmptyLabel.style.display = 'block';
    }
  }

  if (artworkDropZone && artworkFileInput) {
    artworkDropZone.addEventListener('click', () => artworkFileInput.click());
    artworkFileInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        handleImageFile(e.target.files[0]);
      }
    });

    ['dragenter', 'dragover'].forEach(name => {
      artworkDropZone.addEventListener(name, (e) => {
        e.preventDefault();
        artworkDropZone.style.borderColor = 'var(--color-accent)';
      });
    });

    ['dragleave', 'drop'].forEach(name => {
      artworkDropZone.addEventListener(name, (e) => {
        e.preventDefault();
        artworkDropZone.style.borderColor = '';
      });
    });

    artworkDropZone.addEventListener('drop', (e) => {
      if (e.dataTransfer.files.length > 0) {
        handleImageFile(e.dataTransfer.files[0]);
      }
    });

    function handleImageFile(file) {
      if (!file.type.startsWith('image/')) {
        showToast('Please select an image file (.jpg, .png, .webp)');
        return;
      }
      const reader = new FileReader();
      reader.onload = (evt) => {
        const dataUrl = evt.target.result;
        artworkUrlInput.value = dataUrl;
        updateArtworkPreview(dataUrl);
        showToast(`Loaded ${file.name} into artwork preview`);
      };
      reader.readAsDataURL(file);
    }
  }

  // ==============================================================
  // 5. MAIN FORM SUBMIT (ADD OR UPDATE)
  // ==============================================================
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const title = titleInput.value.trim();
    const desc = descInput.value.trim();
    const videoUrl = videoUrlInput.value.trim();
    const artworkUrl = artworkUrlInput.value.trim() || 'images/pic01.jpg';
    const placement = getSelectedPlacement();
    const editId = editIdInput.value.trim();

    if (!title || !videoUrl) {
      showToast('Please enter both Title and Video Stream URL');
      return;
    }

    if (editId) {
      Catalog.updateVideo(editId, {
        title,
        description: desc,
        videoUrl,
        artworkUrl,
        section: placement
      });
      showToast(`Updated "${title}" successfully`);
      resetForm();
    } else {
      Catalog.addVideo({
        title,
        description: desc,
        videoUrl,
        artworkUrl,
        section: placement,
        type: placement === 'shorts' ? 'short' : 'video'
      });

      // If this was loaded from a staged draft, remove it from staging
      if (form._stagedIdToDismiss) {
        Catalog.rejectStaged(form._stagedIdToDismiss);
        form._stagedIdToDismiss = null;
        renderReviewQueue();
      }

      showToast(`Added "${title}" to ${getPlacementLabel(placement)}`);
      resetForm();
    }

    renderCatalogList();
    switchAdminView('catalog');
  });

  if (btnCancel) {
    btnCancel.addEventListener('click', resetForm);
  }

  function resetForm() {
    form.reset();
    form._stagedIdToDismiss = null;
    editIdInput.value = '';
    formHeading.textContent = 'Add Video to Stream';
    editIndicator.textContent = 'New Entry';
    btnSubmit.innerHTML = '<span>+ Add Video to Stream</span>';
    setSelectedPlacement('top');
    updateArtworkPreview('');
  }

  // ==============================================================
  // 6==============================================================
  // 6. RENDERRENDER CATALOGCATALOG MANAGEMENTMANAGEMENT LIST
  // ==============================================================LIST
  // ==============================================================
  function renderCatalogList() {
    if (!listContainer) return;

    let items = Catalog.getAll();
    updateCounts(items);

    if (currentFilter !== 'all') {
      if (currentFilter === 'shorts') {
        items = items.filter(v => v.section === 'shorts' || v.type === 'short');
      } else {
        items = items.filter(v => v.section === currentFilter);
      }
    }

    const searchVal = searchInput ? searchInput.value.trim().toLowerCase() : '';
    if (searchVal) {
      items = items.filter(v => 
        (v.title && v.title.toLowerCase().includes(searchVal)) ||
        (v.description && v.description.toLowerCase().includes(searchVal)) ||
        (v.id && v.id.toLowerCase().includes(searchVal))
      );
    }

    listContainer.innerHTML = '';

    if (items.length === 0) {
      listContainer.innerHTML = `
        <div style="padding: 40px; text-align: center; color: var(--color-fg-light); background: var(--bg-card); border: 1px solid var(--color-border);">
          No published videos found for this filter.
        </div>
      `;
      return;
    }

    items.forEach(v => {
      const row = document.createElement('div');
      row.className = 'catalog-item-row';
      const isShort = v.section === 'shorts' || v.type === 'short';
      const thumbClass = isShort ? 'catalog-item-thumb is-short-thumb' : 'catalog-item-thumb';
      const badgeClass = isShort ? 'catalog-badge-sec shorts-badge' : 'catalog-badge-sec';
      const secLabel = getPlacementLabel(v.section);

      row.innerHTML = `
        <div class="${thumbClass}" style="cursor: pointer;" title="Preview video">
          <img src="${v.artworkUrl || v.image || 'images/pic01.jpg'}" alt="${escapeHtml(v.title)}" />
        </div>
        <div class="catalog-item-details">
          <div style="display: flex; align-items: center; gap: 8px;">
            <h4 class="catalog-item-title">${escapeHtml(v.title)}</h4>
            <span class="${badgeClass}">${secLabel}</span>
          </div>
          <div class="catalog-item-desc">${escapeHtml(v.description || 'No description provided')}</div>
          <div class="catalog-item-meta">
            <span>ID: <code>${v.id}</code></span>
            <span>&bull;</span>
            <span>${escapeHtml(v.date || 'Recent')}</span>
            <span>&bull;</span>
            <span style="max-width: 280px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
              CDN: <a href="${v.videoUrl}" target="_blank" style="color: var(--color-accent); text-decoration: none;">${escapeHtml(v.videoUrl)}</a>
            </span>
          </div>
        </div>
        <div class="catalog-item-actions">
          <select class="select-section-move" data-id="${v.id}" title="Move section">
            <option value="top" ${v.section === 'top' ? 'selected' : ''}>Top 2 Rows</option>
            <option value="mid" ${v.section === 'mid' ? 'selected' : ''}>Middle Row</option>
            <option value="shorts" ${v.section === 'shorts' ? 'selected' : ''}>Shorts</option>
            <option value="bottom" ${v.section === 'bottom' ? 'selected' : ''}>Bottom Feed</option>
          </select>
          <button class="btn-item-action btn-preview-cat" data-id="${v.id}" title="Preview stream">Preview</button>
          <button class="btn-item-action btn-edit" data-id="${v.id}" title="Edit metadata">Edit</button>
          <button class="btn-item-action btn-del" data-id="${v.id}" title="Delete video">Delete</button>
        </div>
      `;

      // Event: Preview
      const thumb = row.querySelector('.catalog-item-thumb');
      const btnPrev = row.querySelector('.btn-preview-cat');
      const prevHandler = () => openStreamPreview(v.title, v.videoUrl);
      if (thumb) thumb.addEventListener('click', prevHandler);
      if (btnPrev) btnPrev.addEventListener('click', prevHandler);

      const selectMove = row.querySelector('.select-section-move');
      selectMove.addEventListener('change', (e) => {
        const newSec = e.target.value;
        Catalog.moveSection(v.id, newSec);
        showToast(`Moved "${v.title}" to ${getPlacementLabel(newSec)}`);
        renderCatalogList();
      });

      const btnEdit = row.querySelector('.btn-edit');
      btnEdit.addEventListener('click', () => {
        loadVideoIntoForm(v);
        switchAdminView('upload');
      });

      const btnDel = row.querySelector('.btn-del');
      btnDel.addEventListener('click', () => {
        if (confirm(`Delete "${v.title}" from catalog?`)) {
          Catalog.deleteVideo(v.id);
          showToast(`Deleted "${v.title}"`);
          renderCatalogList();
        }
      });

      listContainer.appendChild(row);
    });
  }

  function loadVideoIntoForm(v) {
    editIdInput.value = v.id;
    titleInput.value = v.title || '';
    descInput.value = v.description || '';
    videoUrlInput.value = v.videoUrl || '';
    artworkUrlInput.value = v.artworkUrl || v.image || '';
    setSelectedPlacement(v.section || 'top');
    updateArtworkPreview(v.artworkUrl || v.image || '');

    formHeading.textContent = `Edit Video: ${v.title}`;
    editIndicator.textContent = `Editing ID: ${v.id}`;
    btnSubmit.innerHTML = '<span>Save Changes</span>';

    titleInput.focus();
  }

  function updateCounts(allVideos) {
    const totalEl = document.getElementById('total-video-count');
    const countAll = document.getElementById('count-all');
    const countTop = document.getElementById('count-top');
    const countMid = document.getElementById('count-mid');
    const countShorts = document.getElementById('count-shorts');
    const countBottom = document.getElementById('count-bottom');

    const topCount = allVideos.filter(v => v.section === 'top').length;
    const midCount = allVideos.filter(v => v.section === 'mid').length;
    const shortsCount = allVideos.filter(v => v.section === 'shorts' || v.type === 'short').length;
    const bottomCount = allVideos.filter(v => v.section === 'bottom').length;

    if (totalEl) totalEl.textContent = allVideos.length;
    if (countAll) countAll.textContent = allVideos.length;
    if (countTop) countTop.textContent = topCount;
    if (countMid) countMid.textContent = midCount;
    if (countShorts) countShorts.textContent = shortsCount;
    if (countBottom) countBottom.textContent = bottomCount;
    if (catalogCountPill) catalogCountPill.textContent = allVideos.length;
  }

  // Filter tabstabs
  document.querySelectorAll('.catalog-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.catalog-tab-btn').forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      currentFilter = btn.getAttribute('data-filter');
      renderCatalogList();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', renderCatalogList);
  }

  // Export& Reset
  if (btnExport) {
    btnExport.addEventListener('click', () => {
      const jsContent = Catalog.exportFeedJS();
      const blob = new Blob([jsContent], { type: 'application/javascript;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'catalog-feed.js';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showToast('Downloaded catalog-feed.js! Drag it into your GitHub repo\'s js/ folder.');
    });
  }

  if (btnReset) {
    btnReset.addEventListener('click', () => {
      if (confirm('Reset catalog back to initial defaults?')) {
        Catalog.resetToDefaults();
        showToast('Catalog reset to initial feed defaults');
        renderCatalogList();
      }
    });
  }

  // Logout
  const btnLogout = document.getElementById('btn-admin-logout');
  if (btnLogout) {
    btnLogout.addEventListener('click', () => {
      try {
        sessionStorage.removeItem('tuc_admin_auth');
        localStorage.removeItem('tuc_admin_auth');
        localStorage.removeItem('tuc_user');
      } catch(e) {}
      window.location.href = 'index.html';
    });
  }

  function getPlacementLabel(sec) {
    switch (sec) {
      case 'top': return 'Top 2 Rows';
      case 'mid': return 'Middle Row';
      case 'shorts': return 'Shorts Shelf';
      case 'bottom': return 'Bottom Feed';
      default: return 'Top 2 Rows';
    }
  }

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
  renderReviewQueue();
  switchAdminView('review');
  window.renderReviewQueue = renderReviewQueue;
  window.updateStagingCounts = updateStagingCounts;
});
