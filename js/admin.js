// The Unemployed Club - Admin Studio Controller
// Matches the exact editorial styling, manages the Editorial Staging Review Queue,
// and provides zero-technical-knowledge GitHub catalog export.

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements - Main Form
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

  // Staging Review Queue Elements
  const stagedContainer = document.getElementById('staged-items-container');
  const stagedBadge = document.getElementById('staged-badge-count');
  const btnImportStageUrl = document.getElementById('btn-import-stage-url');
  const btnClearStaging = document.getElementById('btn-clear-staging');

  // Preview Modal Elements
  const previewModal = document.getElementById('stream-preview-modal');
  const modalVideo = document.getElementById('modal-video-player');
  const modalTitle = document.getElementById('modal-stream-title');
  const btnCloseModal = document.getElementById('btn-close-modal');
  let modalHls = null;

  let currentFilter = 'all';

  // ==============================================================
  // 1. PLACEMENT RADIO PILLS
  // ==============================================================
  const placementPills = document.querySelectorAll('.placement-pill-btn');
  placementPills.forEach(pill => {
    pill.addEventListener('click', () => {
      placementPills.forEach(p => p.classList.remove('is-active'));
      pill.classList.add('is-active');
      const radio = pill.querySelector('input[type="radio"]');
      if (radio) radio.checked = true;

      // Adjust artwork preview aspect ratio if shorts selected
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

  // ==============================================================
  // 2. ARTWORK LIVE PREVIEW & FILE DRAG-AND-DROP
  // ==============================================================
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
  // 3. EDITORIAL REVIEW QUEUE (STAGED DRAFTS)
  // ==============================================================
  function renderReviewQueue() {
    if (!stagedContainer) return;

    const staged = Catalog.getStaging();
    if (stagedBadge) {
      stagedBadge.textContent = `${staged.length} Pending`;
      stagedBadge.style.background = staged.length > 0 ? '#f59e0b' : '#6b7280';
    }

    stagedContainer.innerHTML = '';

    if (staged.length === 0) {
      stagedContainer.innerHTML = `
        <div style="padding: 32px; text-align: center; color: var(--color-fg-light); background: #ffffff; border: 1px dashed var(--color-border);">
          <div style="font-size: 0.95rem; margin-bottom: 6px; color: var(--color-fg-bold);">No Videos Waiting in Review Queue</div>
          <p style="font-size: 0.8rem; margin: 0; max-width: 500px; margin: 0 auto;">
            Run <code>tools/extractor.bat</code> and paste any video link to automatically stage drafts here for your review and section placement.
          </p>
        </div>
      `;
      return;
    }

    staged.forEach((item) => {
      const card = document.createElement('div');
      card.className = 'staged-item-card';

      card.innerHTML = `
        <div class="staged-thumb-box" style="cursor: pointer;" title="Click to preview stream">
          <img src="${item.artworkUrl || 'images/pic01.jpg'}" alt="${escapeHtml(item.title)}" />
          <div style="position: absolute; bottom: 4px; right: 4px; background: rgba(0,0,0,0.7); color: #fff; font-size: 0.65rem; padding: 1px 4px;">DRAFT</div>
        </div>

        <div class="staged-details">
          <div style="display: flex; align-items: center; gap: 8px;">
            <h4 class="staged-title">${escapeHtml(item.title)}</h4>
            <span style="background: rgba(245, 158, 11, 0.15); color: #b45309; padding: 1px 6px; font-size: 0.7rem; border: 1px solid rgba(245, 158, 11, 0.3);">Pending Review</span>
          </div>
          <div class="staged-desc">${escapeHtml(item.description || 'Extracted video stream draft. Ready for editorial review.')}</div>
          <div class="staged-meta">
            <span>Staged: ${escapeHtml(item.extractedAt || 'Recent')}</span>
            <span>&bull;</span>
            <span style="max-width: 280px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
              Stream: <a href="${item.videoUrl}" target="_blank" style="color: var(--color-accent); text-decoration: none;">${escapeHtml(item.videoUrl)}</a>
            </span>
            ${item.sourceUrl ? `<span>&bull;</span><a href="${item.sourceUrl}" target="_blank" style="color: var(--color-fg-light); text-decoration: none;">Source Link</a>` : ''}
          </div>
        </div>

        <div class="staged-actions-col">
          <label style="font-size: 0.72rem; color: var(--color-fg-light); margin-bottom: -4px;">Target Section:</label>
          <select class="select-staged-placement" data-id="${item.id}">
            <option value="top">Top 2 Rows (Featured Grid)</option>
            <option value="mid">Middle Row (Curated Break)</option>
            <option value="shorts" selected>Shorts Shelf (9:14 Vertical)</option>
            <option value="bottom">Bottom Feed (Endless Scroll)</option>
          </select>

          <button class="btn-approve-staged" data-id="${item.id}" title="Approve and publish to public website">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
            <span>Approve &amp; Publish</span>
          </button>

          <div class="staged-btn-row">
            <button class="staged-sub-btn btn-preview-stream" data-id="${item.id}" title="Test stream playback">Preview</button>
            <button class="staged-sub-btn btn-refine-staged" data-id="${item.id}" title="Edit in form above">Edit</button>
            <button class="staged-sub-btn btn-dismiss" data-id="${item.id}" title="Discard draft">Dismiss</button>
          </div>
        </div>
      `;

      // Event: Thumbnail or Preview button clicks
      const thumbBox = card.querySelector('.staged-thumb-box');
      const btnPreview = card.querySelector('.btn-preview-stream');
      const previewHandler = () => openStreamPreview(item.title, item.videoUrl);
      thumbBox.addEventListener('click', previewHandler);
      btnPreview.addEventListener('click', previewHandler);

      // Event: Approve & Publish
      const btnApprove = card.querySelector('.btn-approve-staged');
      const selectPlacement = card.querySelector('.select-staged-placement');
      btnApprove.addEventListener('click', () => {
        const chosenSec = selectPlacement.value;
        const published = Catalog.approveStaged(item.id, chosenSec);
        if (published) {
          showToast(`Approved "${item.title}" to ${getPlacementLabel(chosenSec)}!`);
          renderReviewQueue();
          renderCatalogList();
        }
      });

      // Event: Edit in main form
      const btnRefine = card.querySelector('.btn-refine-staged');
      btnRefine.addEventListener('click', () => {
        titleInput.value = item.title || '';
        descInput.value = item.description || '';
        videoUrlInput.value = item.videoUrl || '';
        artworkUrlInput.value = item.artworkUrl || '';
        setSelectedPlacement(selectPlacement.value);
        updateArtworkPreview(item.artworkUrl || '');
        editIdInput.value = ''; // Will publish as new video
        formHeading.textContent = `Review Draft: ${item.title}`;
        editIndicator.textContent = `From Staging Queue`;
        btnSubmit.innerHTML = '<span>Approve &amp; Publish to Stream</span>';

        // Scroll to form smoothly
        form.scrollIntoView({ behavior: 'smooth', block: 'start' });
        titleInput.focus();

        // Optional: remove from staging once user saves
        form._stagedIdToDismiss = item.id;
      });

      // Event: Dismiss draft
      const btnDismiss = card.querySelector('.btn-dismiss');
      btnDismiss.addEventListener('click', () => {
        if (confirm(`Dismiss draft "${item.title}"?`)) {
          Catalog.rejectStaged(item.id);
          showToast(`Dismissed draft "${item.title}"`);
          renderReviewQueue();
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
      // Update existing
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
      // Add new
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
  // 6. RENDER CATALOG MANAGEMENT LIST
  // ==============================================================
  function renderCatalogList() {
    if (!listContainer) return;

    let items = Catalog.getAll();
    updateCounts(items);

    // Apply Filter
    if (currentFilter !== 'all') {
      if (currentFilter === 'shorts') {
        items = items.filter(v => v.section === 'shorts' || v.type === 'short');
      } else {
        items = items.filter(v => v.section === currentFilter);
      }
    }

    // Apply Search
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
          No videos found for this filter. Click "+ Add Video" above or approve from the Review Queue.
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
      thumb.addEventListener('click', prevHandler);
      btnPrev.addEventListener('click', prevHandler);

      // Event: Move section
      const selectMove = row.querySelector('.select-section-move');
      selectMove.addEventListener('change', (e) => {
        const newSec = e.target.value;
        Catalog.moveSection(v.id, newSec);
        showToast(`Moved "${v.title}" to ${getPlacementLabel(newSec)}`);
        renderCatalogList();
      });

      // Event: Edit
      const btnEdit = row.querySelector('.btn-edit');
      btnEdit.addEventListener('click', () => {
        loadVideoIntoForm(v);
      });

      // Event: Delete
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

    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
  }

  // Filter tabs
  document.querySelectorAll('.catalog-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.catalog-tab-btn').forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      currentFilter = btn.getAttribute('data-filter');
      renderCatalogList();
    });
  });

  // Search input filter
  if (searchInput) {
    searchInput.addEventListener('input', renderCatalogList);
  }

  // Zero-Knowledge 1-Click Download for GitHub Pages
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

  // Reset to defaults
  if (btnReset) {
    btnReset.addEventListener('click', () => {
      if (confirm('Reset catalog back to initial defaults?')) {
        Catalog.resetToDefaults();
        showToast('Catalog reset to initial feed defaults');
        renderCatalogList();
      }
    });
  }

  // Admin Logout
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

  // Helper labels
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
  renderCatalogList();
});
