// The Unemployed Club - Dedicated Shorts Player Controller
// 3-Box Balanced Stage: Left Info Panel, Center Video Player with Hover Scrubber, Right Companion Panel.
// Supports Direct MP4, WebM, Adaptive HLS (.m3u8), Wheel Navigation, Frosted Action Controls, and Animated CD.

const fallbackShorts = [
  {
    id: "s1",
    title: "Everyday minimalism in editorial design",
    description: "Architectural exploration of monolithic raw concrete surfaces and geometric shadows. High fidelity pacing with zero compression degradation.",
    author: "The Unemployed Club",
    avatar: "images/avatar.jpg",
    tags: ["Shorts", "Editorial", "Minimalism", "4K"],
    views: "520K views",
    likes: "38K",
    comments: "0",
    image: "images/pic03.jpg",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
  },
  {
    id: "s2",
    title: "Behind the darkroom prints & film",
    description: "Silver gelatin optical prints developed by hand under red safety lights. Vintage grain pacing and analog texture.",
    author: "Studio Minimal",
    avatar: "images/avatar.jpg",
    tags: ["Darkroom", "35mm", "Analog", "Monochrome"],
    views: "340K views",
    likes: "25K",
    comments: "0",
    image: "images/pic03.jpg",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4"
  },
  {
    id: "s3",
    title: "Typographic rhythm in under 60 seconds",
    description: "High-contrast Swiss grid alignments and monospace typography. Zero extraneous decoration, pure function.",
    author: "Editorial Arch",
    avatar: "images/avatar.jpg",
    tags: ["Typography", "Design", "SwissGrid", "Motion"],
    views: "1.2M views",
    likes: "89K",
    comments: "0",
    image: "images/pic03.jpg",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4"
  },
  {
    id: "s4",
    title: "Analog camera walk through autumn streets",
    description: "Autumn leaves falling through golden hour backlighting. Captured on vintage 16mm Bolex camera.",
    author: "The Unemployed Club",
    avatar: "images/avatar.jpg",
    tags: ["Cinematic", "Autumn", "16mm", "Vlog"],
    views: "890K views",
    likes: "61K",
    comments: "0",
    image: "images/pic03.jpg",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4"
  },
  {
    id: "s5",
    title: "Soundscapes of the foggy coastline",
    description: "Deep oceanic bass drones and tape saturation field recordings captured at Big Sur, California.",
    author: "Sound & Pacing",
    avatar: "images/avatar.jpg",
    tags: ["Soundscapes", "Ambient", "Ocean", "Calm"],
    views: "670K views",
    likes: "45K",
    comments: "0",
    image: "images/pic03.jpg",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4"
  },
  {
    id: "s6",
    title: "Future Imperfect: 10 years later",
    description: "Retrospective examination of classical web design frameworks versus modern brutalist minimalism.",
    author: "The Unemployed Club",
    avatar: "images/avatar.jpg",
    tags: ["Documentary", "Tech", "Minimalism"],
    views: "430K views",
    likes: "31K",
    comments: "0",
    image: "images/pic03.jpg",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4"
  }
];

let currentIndex = 0;
let isMuted = true;
let currentVolume = 0.8;
let hlsInstance = null;
let isScrubbing = false;

const VOL_ICONS = {
  muted: '<path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"/><line x1="22" x2="16" y1="9" y2="15"/><line x1="16" x2="22" y1="9" y2="15"/>',
  unmuted: '<path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"/><path d="M16 9a5 5 0 0 1 0 6"/><path d="M19.364 18.364a9 9 0 0 0 0-12.728"/>'
};

document.addEventListener("DOMContentLoaded", () => {
  // 1. Resolve active shorts from Catalog or fallback
  let catalogShorts = [];
  if (window.Catalog && typeof Catalog.getShorts === "function") {
    const raw = Catalog.getShorts();
    if (Array.isArray(raw) && raw.length > 0) {
      catalogShorts = raw.map(s => ({
        id: s.id,
        title: s.title || "Untitled Short",
        description: s.description || "High fidelity editorial curation • Pacing, typography, and pure brutalist aesthetic with zero compression degradation.",
        author: s.author || "The Unemployed Club",
        avatar: s.avatar || "images/avatar.jpg",
        tags: Array.isArray(s.tags) && s.tags.length > 0 ? s.tags : ["Shorts", "Editorial", "Minimalism"],
        views: s.views || "450K views",
        likes: "42K",
        comments: "0",
        image: s.artworkUrl || s.image || "images/pic03.jpg",
        videoUrl: s.videoUrl || ""
      }));
    }
  }

  const activeShorts = catalogShorts.length > 0 ? catalogShorts : fallbackShorts;

  // 2. Parse current short from URL
  const params = new URLSearchParams(window.location.search);
  const paramId = params.get("id");
  const paramTitle = params.get("title");
  const paramCdn = params.get("cdn") || params.get("video") || params.get("src");

  if (paramId) {
    const foundIdx = activeShorts.findIndex(s => String(s.id) === String(paramId));
    if (foundIdx !== -1) currentIndex = foundIdx;
  } else if (paramTitle) {
    const foundIdx = activeShorts.findIndex(s => s.title === paramTitle);
    if (foundIdx !== -1) currentIndex = foundIdx;
  }

  // 3. UI Element Queries
  const stageEl = document.getElementById("shorts-stage");
  const shortsBox = document.getElementById("shorts-box");
  const video = document.getElementById("shorts-video");
  const playOverlay = document.getElementById("shorts-play-overlay");
  const screenPlayBtn = document.getElementById("shorts-screen-play-btn");

  // Left Info Panel Elements
  const infoTitle = document.getElementById("shorts-info-title");
  const infoDesc = document.getElementById("shorts-info-desc");
  const infoChannel = document.getElementById("shorts-info-channel");
  const infoViews = document.getElementById("shorts-info-views");
  const infoAvatar = document.getElementById("shorts-info-avatar");
  const soundTitle = document.getElementById("shorts-sound-title");
  // In-Player Video Details Elements (for compact / shorter screen views)
  const playerTitle = document.getElementById("shorts-player-title");
  const playerDesc = document.getElementById("shorts-player-desc");
  const playerAuthor = document.getElementById("shorts-player-author");
  const playerAvatar = document.getElementById("shorts-player-avatar");
  const playerSound = document.getElementById("shorts-player-sound-title");
  const btnSubPlayer = document.getElementById("btn-shorts-subscribe");
  const infoTags = document.getElementById("shorts-info-tags");
  const btnSub = document.getElementById("btn-shorts-sub");

  // Bottom Hover Controls & Interactive Scrubber Elements
  const hoverControls = document.getElementById("shorts-hover-controls");
  const scrubberTrack = document.getElementById("shorts-scrubber-track");
  const scrubberFill = document.getElementById("shorts-scrubber-fill");
  const scrubberBuffered = document.getElementById("shorts-scrubber-buffered");
  const scrubberHandle = document.getElementById("shorts-scrubber-handle");
  const currentTimeEl = document.getElementById("shorts-current-time");
  const durationEl = document.getElementById("shorts-duration");
  const miniPlayBtn = document.getElementById("shorts-mini-play-btn");
  const miniPlayIcon = document.getElementById("shorts-mini-play-icon");
  const progressBar = document.getElementById("shorts-progress-bar");

  // Action Toolbar Elements
  const likeCountEl = document.getElementById("short-like-count");
  const commentCountEl = document.getElementById("short-comment-count");
  const volIcon = document.getElementById("short-vol-icon");
  const btnPrev = document.getElementById("btn-short-prev");
  const btnNext = document.getElementById("btn-short-next");
  const btnLike = document.getElementById("btn-short-like");
  const btnVol = document.getElementById("btn-short-volume");
  const volSlider = document.getElementById("shorts-volume-slider");
  const volPctEl = document.getElementById("shorts-vol-pct");
  const btnComment = document.getElementById("btn-short-comment");
  const btnShare = document.getElementById("btn-short-share");

  // Right Companion Panel Tabs & Lists
  const tabComments = document.getElementById("tab-btn-comments");
  const tabQueue = document.getElementById("tab-btn-queue");
  const contentComments = document.getElementById("tab-content-comments");
  const contentQueue = document.getElementById("tab-content-queue");
  const commentsList = document.getElementById("comments-list");
  const queueList = document.getElementById("shorts-queue-list");
  const commentInput = document.getElementById("new-comment-input");
  const btnPostComment = document.getElementById("btn-post-comment");
  const commentNotice = document.getElementById("comment-notice");

  function switchTab(tab) {
    if (tab === "comments") {
      if (tabComments) tabComments.classList.add("is-active");
      if (tabQueue) tabQueue.classList.remove("is-active");
      if (contentComments) contentComments.classList.add("is-active");
      if (contentQueue) contentQueue.classList.remove("is-active");
    } else {
      if (tabQueue) tabQueue.classList.add("is-active");
      if (tabComments) tabComments.classList.remove("is-active");
      if (contentQueue) contentQueue.classList.add("is-active");
      if (contentComments) contentComments.classList.remove("is-active");
    }
  }

  if (tabComments) tabComments.addEventListener("click", () => switchTab("comments"));
  if (tabQueue) tabQueue.addEventListener("click", () => switchTab("queue"));

  if (btnComment) {
    btnComment.addEventListener("click", (e) => {
      e.stopPropagation();
      switchTab("comments");
      if (commentInput) commentInput.focus();
    });
  }

  // Time Formatter (mm:ss)
  function formatTime(sec) {
    if (isNaN(sec) || sec < 0) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }

  // Render Zero Comments with Editorial Empty State
  function renderComments() {
    if (!commentsList) return;
    commentsList.innerHTML = `
      <li class="comment-empty-notice">
        <h5>0 Comments</h5>
        <p>No comments on this short yet.<br/>Be the first to join the conversation when comments launch.</p>
      </li>
    `;
    if (tabComments) tabComments.textContent = "Comments (0)";
    if (commentCountEl) commentCountEl.textContent = "0";
  }

  function renderQueue() {
    if (!queueList) return;
    queueList.innerHTML = "";
    activeShorts.forEach((s, idx) => {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.className = `queue-item-card ${idx === currentIndex ? "is-active" : ""}`;
      a.href = `shorts.html?id=${encodeURIComponent(s.id)}&title=${encodeURIComponent(s.title)}`;
      a.innerHTML = `
        <div class="queue-thumb">
          <img src="${s.image}" alt="${s.title}" />
        </div>
        <div class="queue-info">
          <h4 class="queue-title">${s.title}</h4>
          <span class="queue-views">${s.views}</span>
        </div>
      `;
      a.addEventListener("click", (e) => {
        e.preventDefault();
        window.history.pushState({}, "", a.href);
        loadShort(idx);
      });
      li.appendChild(a);
      queueList.appendChild(li);
    });
    if (tabQueue) tabQueue.textContent = `Up Next (${activeShorts.length})`;
  }

  // Under-Construction Reminder for Comments
  function flashConstructionNotice() {
    if (!commentNotice) return;
    commentNotice.classList.add("notice-flash");
    setTimeout(() => {
      commentNotice.classList.remove("notice-flash");
    }, 1200);
  }

  if (commentInput) {
    commentInput.addEventListener("focus", () => {
      flashConstructionNotice();
    });
  }

  if (btnPostComment && commentInput) {
    const handlePostAttempt = () => {
      flashConstructionNotice();
      if (commentInput.value.trim()) {
        commentInput.value = "";
      }
    };
    btnPostComment.addEventListener("click", handlePostAttempt);
    commentInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") handlePostAttempt();
    });
  }

  // 4. Stream Loader with HLS and MP4 Support
  function loadStreamUrl(streamUrl) {
    if (!video) return;

    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }

    if (!streamUrl) {
      streamUrl = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4";
    }

    const isHls = streamUrl.includes(".m3u8");

    if (isHls && window.Hls && Hls.isSupported()) {
      hlsInstance = new Hls({
        capLevelToPlayerSize: true,
        autoStartLoad: true
      });
      hlsInstance.loadSource(streamUrl);
      hlsInstance.attachMedia(video);
      hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
        attemptAutoplay();
      });
      hlsInstance.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hlsInstance.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hlsInstance.recoverMediaError();
              break;
            default:
              hlsInstance.destroy();
              break;
          }
        }
      });
    } else {
      video.src = streamUrl;
      video.load();
      video.addEventListener("loadedmetadata", onMetadataReady, { once: true });
      attemptAutoplay();
    }
  }

  function onMetadataReady() {
    if (durationEl && video.duration && !isNaN(video.duration)) {
      durationEl.textContent = formatTime(video.duration);
    }
    attemptAutoplay();
  }

  function attemptAutoplay() {
    if (!video) return;
    video.muted = isMuted;
    video.volume = currentVolume;
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        if (!isMuted) {
          isMuted = true;
          video.muted = true;
          updateVolumeUI();
          video.play().catch(() => updatePlayUI(false));
        } else {
          updatePlayUI(false);
        }
      });
    }
  }

  // 5. Load Short & Update Left Box, Center Video, and Right Queue
  function loadShort(idx) {
    currentIndex = (idx + activeShorts.length) % activeShorts.length;
    const currentShort = activeShorts[currentIndex];

    // Populate Left Box (Name & Description)
    if (infoTitle) infoTitle.textContent = currentShort.title;
    if (infoDesc) infoDesc.textContent = currentShort.description || "High fidelity editorial curation • Pacing, typography, and pure brutalist aesthetic with zero compression degradation.";
    if (infoChannel) infoChannel.textContent = `@${(currentShort.author || "theunemployedclub").toLowerCase().replace(/[^a-z0-9]/g, "")}`;
    if (infoViews) infoViews.textContent = currentShort.views || "520K views";
    if (infoAvatar) infoAvatar.src = currentShort.avatar || "images/avatar.jpg";
    if (soundTitle) soundTitle.textContent = `${currentShort.author || "The Unemployed Club"} • Original Sound`;
    
    // Also sync in-player video details overlay
    if (playerTitle) playerTitle.textContent = currentShort.title;
    if (playerDesc) playerDesc.textContent = currentShort.description || "Everyday minimalism in editorial design.";
    if (playerAuthor) playerAuthor.textContent = `@${(currentShort.author || "theunemployedclub").toLowerCase().replace(/[^a-z0-9]/g, "")}`;
    if (playerAvatar) playerAvatar.src = currentShort.avatar || "images/avatar.jpg";
    if (playerSound) playerSound.textContent = `${currentShort.author || "The Unemployed Club"} • Original Sound`;

    if (infoTags) {
      infoTags.innerHTML = "";
      const tags = Array.isArray(currentShort.tags) && currentShort.tags.length > 0
        ? currentShort.tags
        : ["Shorts", "Editorial", "Minimalism"];
      tags.forEach(t => {
        const span = document.createElement("span");
        span.className = "shorts-tag-pill";
        span.textContent = `#${t.replace(/^#/, "")}`;
        infoTags.appendChild(span);
      });
    }

    // Populate Center Video Player
    if (likeCountEl) likeCountEl.textContent = currentShort.likes || "38K";
    updateScrubber(0);

    if (currentShort.image && video) {
      video.poster = currentShort.image;
    }

    const streamUrl = currentShort.videoUrl || (idx === 0 ? paramCdn : "") || "";
    loadStreamUrl(streamUrl);

    document.title = `${currentShort.title} - Shorts`;
    renderQueue();
  }

  // 6. Interactive Scrubber & Hover Control Logic
  function updateScrubber(pct) {
    pct = Math.max(0, Math.min(100, pct));
    if (scrubberFill) scrubberFill.style.width = `${pct}%`;
    if (scrubberHandle) scrubberHandle.style.left = `${pct}%`;
    if (progressBar) progressBar.style.width = `${pct}%`;
  }

  function seekFromEvent(e) {
    if (!scrubberTrack) return;
    const rect = scrubberTrack.getBoundingClientRect();
    const clickX = (e.touches && e.touches[0]) ? e.touches[0].clientX : e.clientX;
    const ratio = Math.max(0, Math.min(1, (clickX - rect.left) / rect.width));
    updateScrubber(ratio * 100);
    if (video && video.duration && !isNaN(video.duration)) {
      video.currentTime = ratio * video.duration;
      if (currentTimeEl) currentTimeEl.textContent = formatTime(video.currentTime);
    }
  }

  if (scrubberTrack) {
    scrubberTrack.addEventListener("mousedown", (e) => {
      e.stopPropagation();
      isScrubbing = true;
      if (hoverControls) hoverControls.classList.add("is-scrubbing");
      seekFromEvent(e);
    });

    window.addEventListener("mousemove", (e) => {
      if (!isScrubbing) return;
      seekFromEvent(e);
    });

    window.addEventListener("mouseup", () => {
      if (isScrubbing) {
        isScrubbing = false;
        if (hoverControls) hoverControls.classList.remove("is-scrubbing");
      }
    });

    scrubberTrack.addEventListener("touchstart", (e) => {
      e.stopPropagation();
      isScrubbing = true;
      seekFromEvent(e);
    }, { passive: false });

    window.addEventListener("touchmove", (e) => {
      if (!isScrubbing) return;
      seekFromEvent(e);
    }, { passive: false });

    window.addEventListener("touchend", () => {
      isScrubbing = false;
    });
  }

  if (miniPlayBtn) {
    miniPlayBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      togglePlayPause();
    });
  }

  // 7. Playback Synchronization & UI
  function updatePlayUI(playing) {
    if (!playOverlay) return;
    if (playing) {
      playOverlay.classList.add("is-playing");
      if (stageEl) stageEl.classList.add("is-playing");
      if (shortsBox) shortsBox.classList.add("is-playing");
      if (miniPlayIcon) {
        miniPlayIcon.innerHTML = '<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>';
      }
    } else {
      playOverlay.classList.remove("is-playing");
      if (stageEl) stageEl.classList.remove("is-playing");
      if (shortsBox) shortsBox.classList.remove("is-playing");
      if (miniPlayIcon) {
        miniPlayIcon.innerHTML = '<polygon points="5 3 19 12 5 21 5 3"/>';
      }
    }
  }

  if (video) {
    video.addEventListener("play", () => updatePlayUI(true));
    video.addEventListener("playing", () => updatePlayUI(true));
    video.addEventListener("pause", () => updatePlayUI(false));
    video.addEventListener("ended", () => {
      updatePlayUI(false);
      if (!video.loop) {
        loadShort(currentIndex + 1);
      }
    });

    video.addEventListener("timeupdate", () => {
      if (!isScrubbing && video.duration && !isNaN(video.duration)) {
        const pct = (video.currentTime / video.duration) * 100;
        updateScrubber(pct);
        if (currentTimeEl) currentTimeEl.textContent = formatTime(video.currentTime);
        if (durationEl) durationEl.textContent = formatTime(video.duration);

        // Update buffered range
        if (scrubberBuffered && video.buffered.length > 0) {
          const bufEnd = video.buffered.end(video.buffered.length - 1);
          const bufPct = (bufEnd / video.duration) * 100;
          scrubberBuffered.style.width = `${Math.min(100, bufPct)}%`;
        }
      }
    });
  }

  function togglePlayPause() {
    if (!video) return;
    if (video.paused) {
      video.play().catch(err => console.warn("[Shorts] Play error:", err));
    } else {
      video.pause();
    }
  }

  // Screen Box / Play Overlay Click Handlers
  if (shortsBox) {
    shortsBox.addEventListener("click", (e) => {
      if (e.target && typeof e.target.closest === "function") {
        if (e.target.closest("#shorts-hover-controls") || e.target.closest(".shorts-actions-column")) {
          return;
        }
      }
      togglePlayPause();
    });
  }

  if (playOverlay) {
    playOverlay.addEventListener("click", (e) => {
      e.stopPropagation();
      togglePlayPause();
    });
  }

  if (screenPlayBtn) {
    screenPlayBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      togglePlayPause();
    });
  }

  // ==============================================================
  // 8. SCROLL UP AND DOWN MOVES TO DIFFERENT SHORTS
  // ==============================================================
  let isWheeling = false;

  const handleWheelScroll = (e) => {
    // Ignore wheel events if scrolling inside the comments or up next lists
    if (e.target && typeof e.target.closest === "function") {
      if (e.target.closest("#tab-content-comments") || e.target.closest("#tab-content-queue") || e.target.closest("#shorts-companion-panel") || e.target.closest(".shorts-info-body")) {
        return;
      }
    }

    if (isWheeling) return;

    if (Math.abs(e.deltaY) > 15) {
      isWheeling = true;
      if (e.deltaY > 0) {
        // Scroll down -> Next short
        loadShort(currentIndex + 1);
      } else {
        // Scroll up -> Previous short
        loadShort(currentIndex - 1);
      }

      setTimeout(() => {
        isWheeling = false;
      }, 550);
    }
  };

  window.addEventListener("wheel", handleWheelScroll, { passive: true });
  document.addEventListener("wheel", handleWheelScroll, { passive: true });

  // Touch Swipe for Mobile & Trackpads
  let touchStartY = 0;
  if (shortsBox) {
    shortsBox.addEventListener("touchstart", (e) => {
      touchStartY = e.touches[0].clientY;
    }, { passive: true });

    shortsBox.addEventListener("touchend", (e) => {
      const touchEndY = e.changedTouches[0].clientY;
      const diffY = touchStartY - touchEndY;
      if (Math.abs(diffY) > 45) {
        if (diffY > 0) {
          // Swipe up -> Next short
          loadShort(currentIndex + 1);
        } else {
          // Swipe down -> Previous short
          loadShort(currentIndex - 1);
        }
      }
    }, { passive: true });
  }

  // 9. Up / Down Navigation Buttons
  if (btnPrev) {
    btnPrev.addEventListener("click", (e) => {
      e.stopPropagation();
      loadShort(currentIndex - 1);
    });
  }
  if (btnNext) {
    btnNext.addEventListener("click", (e) => {
      e.stopPropagation();
      loadShort(currentIndex + 1);
    });
  }

  // Keyboard Navigation: ArrowUp / ArrowDown / Space / M
  document.addEventListener("keydown", (e) => {
    if (["input", "textarea"].includes(document.activeElement.tagName.toLowerCase())) return;
    if (e.key === "ArrowUp") {
      e.preventDefault();
      loadShort(currentIndex - 1);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      loadShort(currentIndex + 1);
    } else if (e.key === " " && document.activeElement !== commentInput) {
      e.preventDefault();
      togglePlayPause();
    } else if (e.key === "m" || e.key === "M") {
      e.preventDefault();
      toggleMute();
    }
  });

  // ==============================================================
  // 10. VOLUME FLYOUT SLIDER & MUTE CONTROLS
  // ==============================================================
  function updateVolumeUI() {
    if (volIcon) {
      volIcon.innerHTML = isMuted ? VOL_ICONS.muted : VOL_ICONS.unmuted;
    }
    if (btnVol) {
      btnVol.setAttribute("title", isMuted ? "Unmute Sound" : "Mute Sound (Hover for Volume)");
    }
    if (volSlider) {
      volSlider.value = isMuted ? 0 : currentVolume;
    }
    if (volPctEl) {
      volPctEl.textContent = isMuted ? "0%" : `${Math.round(currentVolume * 100)}%`;
    }
  }

  function toggleMute() {
    isMuted = !isMuted;
    if (video) {
      video.muted = isMuted;
      if (!isMuted) {
        if (currentVolume <= 0.05) currentVolume = 0.8;
        video.volume = currentVolume;
      }
    }
    updateVolumeUI();
  }

  if (btnVol) {
    btnVol.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleMute();
    });
  }

  if (volSlider) {
    volSlider.addEventListener("input", (e) => {
      const val = parseFloat(e.target.value);
      currentVolume = val;
      if (video) {
        video.volume = val;
        if (val === 0) {
          isMuted = true;
          video.muted = true;
        } else {
          isMuted = false;
          video.muted = false;
        }
      }
      updateVolumeUI();
    });

    volSlider.addEventListener("click", (e) => {
      e.stopPropagation();
    });
  }

  // 11. Like Button
  let liked = false;
  if (btnLike) {
    btnLike.addEventListener("click", (e) => {
      e.stopPropagation();
      liked = !liked;
      btnLike.style.color = liked ? "var(--color-accent)" : "";
      btnLike.style.borderColor = liked ? "var(--color-accent)" : "";
      if (likeCountEl) {
        likeCountEl.textContent = liked ? "38.1K" : "38K";
      }
    });
  }

  // 12. Share Button
  if (btnShare) {
    btnShare.addEventListener("click", (e) => {
      e.stopPropagation();
      if (navigator.clipboard) {
        navigator.clipboard.writeText(window.location.href);
        const countSpan = btnShare.parentElement.querySelector(".shorts-action-count");
        if (countSpan) {
          const original = countSpan.textContent;
          countSpan.textContent = "Copied!";
          setTimeout(() => { countSpan.textContent = original; }, 1500);
        }
      }
    });
  }

  // 13. Subscribe Button
  if (btnSub) {
    btnSub.addEventListener("click", (e) => {
      e.stopPropagation();
      btnSub.textContent = btnSub.textContent === "Subscribe" ? "Subscribed" : "Subscribe";
      btnSub.style.background = btnSub.textContent === "Subscribed" ? "#444444" : "var(--color-fg-bold)";
      btnSub.style.color = "#ffffff";
    });
  }

  // Initial Load
  if (new URLSearchParams(window.location.search).get('hover') === 'true') {
    if (shortsBox) shortsBox.classList.add('is-hovered');
  }
  updateVolumeUI();
  
  // Under-Construction Flash Trigger for Shorts Player
  const playerConstructionBanner = document.getElementById("shorts-player-construction-banner");
  const playbackToast = document.getElementById("shorts-playback-toast");
  let toastTimer = null;

  function flashPlayerConstructionNotice(msg) {
    if (playerConstructionBanner) {
      playerConstructionBanner.classList.add("notice-flash");
      setTimeout(() => playerConstructionBanner.classList.remove("notice-flash"), 800);
    }
    if (playbackToast) {
      const span = playbackToast.querySelector("span");
      if (span && msg) span.textContent = msg;
      playbackToast.classList.add("is-active");
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => {
        playbackToast.classList.remove("is-active");
      }, 2500);
    }
  }

  if (playerConstructionBanner) {
    playerConstructionBanner.addEventListener("click", (e) => {
      e.stopPropagation();
      flashPlayerConstructionNotice("Shorts playback is currently under construction.");
    });
  }

  // Flash when attempting to toggle play or tap screen
  if (screenPlayBtn) {
    screenPlayBtn.addEventListener("click", () => {
      flashPlayerConstructionNotice("Shorts player is under construction. Playing preview.");
    });
  }
  if (playOverlay) {
    playOverlay.addEventListener("click", () => {
      flashPlayerConstructionNotice("Shorts player is under construction. Playing preview.");
    });
  }
  if (shortsBox) {
    shortsBox.addEventListener("click", (e) => {
      if (e.target.closest(".shorts-actions-column") || e.target.closest(".shorts-hover-controls") || e.target.closest(".shorts-player-overlay-info")) {
        return;
      }
      flashPlayerConstructionNotice("Shorts player is under construction. Playing preview.");
    });
  }

  loadShort(currentIndex);
  renderComments();
  renderQueue();
});
