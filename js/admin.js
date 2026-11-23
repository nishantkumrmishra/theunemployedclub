// The Unemployed Club - Admin Studio Controller
// Matches the exact editorial styling and provides zero-technical-knowledge GitHub catalog export.

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
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

  let currentFilter = 'all';

  // 1. Placement Radio Pills Logic
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

  // 2. Artwork Live Preview Sync
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

  // Artwork File Drag & Drop / File Selector
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

  // 3. Form Submit (Add or Update)
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
      showToast(`Added "${title}" to ${getPlacementLabel(placement)}`);
      resetForm();
    }

    renderCatalogList();
  });

  // Cancel / Reset Form Button
  if (btnCancel) {
    btnCancel.addEventListener('click', resetForm);
  }

  function resetForm() {
    form.reset();
    editIdInput.value = '';
    formHeading.textContent = 'Add Video to Stream';
    editIndicator.textContent = 'New Entry';
    btnSubmit.innerHTML = '<span>+ Add Video to Stream</span>';
    setSelectedPlacement('top');
    updateArtworkPreview('');
  }

  // 4. Render Catalog Management List
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
          No videos found for this filter. Click "+ Add Video" above to publish one.
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
        <div class="${thumbClass}">
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
          <button class="btn-item-action btn-edit" data-id="${v.id}" title="Edit metadata">Edit</button>
          <button class="btn-item-action btn-del" data-id="${v.id}" title="Delete video">Delete</button>
        </div>
      `;

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

    // Scroll smoothly to form
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

  // 5. Filter Tabs
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

  // 6. Zero-Knowledge 1-Click Download for GitHub Pages
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

  // Initial list render
  renderCatalogList();
});
