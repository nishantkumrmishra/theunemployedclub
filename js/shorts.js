// The Unemployed Club - Dedicated Shorts Player Logic
// Supports Direct MP4, WebM, and Adaptive HLS (.m3u8) streams + Dynamic Catalog Integration

const fallbackShorts = [
  {
    id: "s1",
    title: "Everyday minimalism in editorial design",
    views: "520K views",
    likes: "38K",
    comments: "642",
    image: "images/pic03.jpg",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
  },
  {
    id: "s2",
    title: "Behind the darkroom prints & film",
    views: "340K views",
    likes: "25K",
    comments: "380",
    image: "images/pic03.jpg",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4"
  },
  {
    id: "s3",
    title: "Typographic rhythm in under 60 seconds",
    views: "1.2M views",
    likes: "89K",
    comments: "1.4K",
    image: "images/pic03.jpg",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4"
  },
  {
    id: "s4",
    title: "Analog camera walk through autumn streets",
    views: "890K views",
    likes: "61K",
    comments: "720",
    image: "images/pic03.jpg",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4"
  },
  {
    id: "s5",
    title: "Soundscapes of the foggy coastline",
    views: "670K views",
    likes: "45K",
    comments: "512",
    image: "images/pic03.jpg",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4"
  },
  {
    id: "s6",
    title: "Future Imperfect: 10 years later",
    views: "430K views",
    likes: "31K",
    comments: "295",
    image: "images/pic03.jpg",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4"
  }
];

const mockComments = [
  {
    user: "Elena Vance",
    time: "2 hours ago",
    text: "The composition in this clip is sublime. That autumn lighting through the vintage lens is breathtaking.",
    likes: "142",
    avatar: "images/avatar.jpg"
  },
  {
    user: "Marcus Thorne",
    time: "5 hours ago",
    text: "Where did you source that vintage 35mm film stock? The natural grain structure and tones are gorgeous.",
    likes: "89",
    avatar: "images/avatar.jpg"
  },
  {
    user: "Studio Atelier",
    time: "8 hours ago",
    text: "Minimalism done right. The typography and quiet pacing match Future Imperfect so well.",
    likes: "54",
    avatar: "images/avatar.jpg"
  },
  {
    user: "David K.",
    time: "1 day ago",
    text: "Watched this three times in a row. Inspiring micro-documentary work!",
    likes: "28",
    avatar: "images/avatar.jpg"
  }
];

let currentIndex = 0;
let isMuted = true;
let hlsInstance = null;

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
        views: s.views || "450K views",
        likes: "42K",
        comments: "580",
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

  // 3. Elements
  const shortsBox = document.getElementById("shorts-box");
  const video = document.getElementById("shorts-video");
  const videoSource = document.getElementById("shorts-source");
  const playOverlay = document.getElementById("shorts-play-overlay");
  const screenPlayBtn = document.getElementById("shorts-screen-play-btn");
  const captionEl = document.getElementById("shorts-caption");
  const likeCountEl = document.getElementById("short-like-count");
  const progressBar = document.getElementById("shorts-progress-bar");
  const volIcon = document.getElementById("short-vol-icon");
  const btnPrev = document.getElementById("btn-short-prev");
  const btnNext = document.getElementById("btn-short-next");
  const btnLike = document.getElementById("btn-short-like");
  const btnVol = document.getElementById("btn-short-volume");
  const btnSub = document.getElementById("btn-shorts-sub");
  const btnComment = document.getElementById("btn-short-comment");

  // Tabs & Lists
  const tabComments = document.getElementById("tab-btn-comments");
  const tabQueue = document.getElementById("tab-btn-queue");
  const contentComments = document.getElementById("tab-content-comments");
  const contentQueue = document.getElementById("tab-content-queue");
  const commentsList = document.getElementById("comments-list");
  const queueList = document.getElementById("shorts-queue-list");
  const commentInput = document.getElementById("new-comment-input");
  const btnPostComment = document.getElementById("btn-post-comment");

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

  function renderComments() {
    if (!commentsList) return;
    commentsList.innerHTML = "";
    mockComments.forEach(c => {
      const li = document.createElement("li");
      li.className = "comment-item";
      li.innerHTML = `
        <img src="${c.avatar}" alt="${c.user}" class="comment-author-avatar" />
        <div class="comment-content">
          <div class="comment-meta">
            <span class="comment-user">${c.user}</span>
            <span class="comment-time">${c.time}</span>
          </div>
          <p class="comment-text">${c.text}</p>
          <div class="comment-actions">
            <button class="comment-like-btn">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"><path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h3"/><path d="M14 10V4.5a2.5 2.5 0 0 0-5 0v1.5"/></svg>
              <span>${c.likes}</span>
            </button>
            <span>Reply</span>
          </div>
        </div>
      `;
      commentsList.appendChild(li);
    });
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
  }

  if (btnPostComment && commentInput) {
    btnPostComment.addEventListener("click", () => {
      const val = commentInput.value.trim();
      if (!val) return;
      mockComments.unshift({
        user: "User",
        time: "Just now",
        text: val,
        likes: "0",
        avatar: "images/avatar.jpg"
      });
      commentInput.value = "";
      renderComments();
    });
    commentInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") btnPostComment.click();
    });
  }

  // 4. Stream Loader with HLS and MP4 Support
  function loadStreamUrl(streamUrl) {
    if (!video) return;

    // Destroy existing Hls instance if any
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }

    if (!streamUrl) {
      // Fallback sample if streamUrl is empty
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
      if (videoSource) videoSource.src = streamUrl;
      video.load();
      video.addEventListener("loadedmetadata", onMetadataReady, { once: true });
      attemptAutoplay();
    }
  }

  function onMetadataReady() {
    attemptAutoplay();
  }

  function attemptAutoplay() {
    if (!video) return;
    video.muted = isMuted;
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        // If unmuted autoplay rejected, retry muted
        if (!isMuted) {
          isMuted = true;
          video.muted = true;
          updateVolumeUI();
          video.play().catch(() => {
            // Autoplay completely blocked: show play button
            updatePlayUI(false);
          });
        } else {
          updatePlayUI(false);
        }
      });
    }
  }

  function loadShort(idx) {
    currentIndex = (idx + activeShorts.length) % activeShorts.length;
    const currentShort = activeShorts[currentIndex];

    if (captionEl) captionEl.textContent = currentShort.title;
    if (likeCountEl) likeCountEl.textContent = currentShort.likes || "38K";
    if (progressBar) progressBar.style.width = "0%";

    if (currentShort.image && video) {
      video.poster = currentShort.image;
    }

    const streamUrl = currentShort.videoUrl || (idx === 0 ? paramCdn : "") || "";
    loadStreamUrl(streamUrl);

    document.title = `${currentShort.title} - Shorts`;
    renderQueue();
  }

  // 5. Native Video Event Listeners for Perfect Playback Synchronization
  function updatePlayUI(playing) {
    if (!playOverlay) return;
    if (playing) {
      playOverlay.classList.add("is-playing");
    } else {
      playOverlay.classList.remove("is-playing");
    }
  }

  if (video) {
    video.addEventListener("play", () => updatePlayUI(true));
    video.addEventListener("playing", () => updatePlayUI(true));
    video.addEventListener("pause", () => updatePlayUI(false));
    video.addEventListener("ended", () => {
      updatePlayUI(false);
      // Auto-advance to next short or loop
      if (!video.loop) {
        loadShort(currentIndex + 1);
      }
    });

    // Real-time timeline progress
    video.addEventListener("timeupdate", () => {
      if (progressBar && video.duration && !isNaN(video.duration)) {
        const pct = (video.currentTime / video.duration) * 100;
        progressBar.style.width = `${pct}%`;
      }
    });
  }

  // Toggle Play / Pause on user click
  function togglePlayPause() {
    if (!video) return;
    if (video.paused) {
      // User gesture initiated play: if muted and user desires sound, allow unmuting
      video.play().catch(err => console.warn("[Shorts] Play error:", err));
    } else {
      video.pause();
    }
  }

  // Click on Screen Box or Video element triggers play/pause
  if (shortsBox) {
    shortsBox.addEventListener("click", (e) => {
      // Prevent clicking actions, channel row, or buttons from toggling play
      if (e.target.closest(".shorts-bottom-info") || e.target.closest(".shorts-actions-column")) {
        return;
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

  // 6. Navigation Buttons
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

  // Keyboard Navigation: ArrowUp / ArrowDown / Space
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

  // 7. Volume / Mute Interaction
  function updateVolumeUI() {
    if (!volIcon) return;
    volIcon.innerHTML = isMuted ? VOL_ICONS.muted : VOL_ICONS.unmuted;
    if (btnVol) {
      btnVol.setAttribute("title", isMuted ? "Unmute Sound" : "Mute Sound");
    }
  }

  function toggleMute() {
    isMuted = !isMuted;
    if (video) video.muted = isMuted;
    updateVolumeUI();
  }

  if (btnVol) {
    btnVol.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleMute();
    });
  }

  // 8. Like Button
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

  // 9. Subscribe Button
  if (btnSub) {
    btnSub.addEventListener("click", (e) => {
      e.stopPropagation();
      btnSub.textContent = btnSub.textContent === "Subscribe" ? "Subscribed" : "Subscribe";
      btnSub.style.background = btnSub.textContent === "Subscribed" ? "#444444" : "#ffffff";
      btnSub.style.color = btnSub.textContent === "Subscribed" ? "#ffffff" : "#000000";
    });
  }

  // Initial Load
  updateVolumeUI();
  loadShort(currentIndex);
  renderComments();
  renderQueue();
});
