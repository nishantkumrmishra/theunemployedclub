// Dedicated Shorts Player Logic with Comments & Up Next Queue + Dynamic Catalog Support
const fallbackShorts = [
  {
    id: "s1",
    title: "Everyday minimalism in editorial design",
    views: "520K views",
    likes: "38K",
    comments: "642",
    image: "images/pic03.jpg",
    videoUrl: ""
  },
  {
    id: "s2",
    title: "Behind the darkroom prints & film",
    views: "340K views",
    likes: "25K",
    comments: "380",
    image: "images/pic03.jpg",
    videoUrl: ""
  },
  {
    id: "s3",
    title: "Typographic rhythm in under 60 seconds",
    views: "1.2M views",
    likes: "89K",
    comments: "1.4K",
    image: "images/pic03.jpg",
    videoUrl: ""
  },
  {
    id: "s4",
    title: "Analog camera walk through autumn streets",
    views: "890K views",
    likes: "61K",
    comments: "720",
    image: "images/pic03.jpg",
    videoUrl: ""
  },
  {
    id: "s5",
    title: "Soundscapes of the foggy coastline",
    views: "670K views",
    likes: "45K",
    comments: "512",
    image: "images/pic03.jpg",
    videoUrl: ""
  },
  {
    id: "s6",
    title: "Future Imperfect: 10 years later",
    views: "430K views",
    likes: "31K",
    comments: "295",
    image: "images/pic03.jpg",
    videoUrl: ""
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
let isPlaying = false;
let isMuted = false;
let progressTimer = null;
let currentProgress = 0;

document.addEventListener("DOMContentLoaded", () => {
  // Resolve active shorts from Catalog or fallback
  const activeShorts = (window.Catalog && typeof Catalog.getShorts === "function" && Catalog.getShorts().length > 0)
    ? Catalog.getShorts().map((s) => ({
        id: s.id,
        title: s.title,
        views: s.views || "450K views",
        likes: "42K",
        comments: "580",
        image: s.artworkUrl || "images/pic03.jpg",
        videoUrl: s.videoUrl || ""
      }))
    : fallbackShorts;

  // Parse current short from URL
  const params = new URLSearchParams(window.location.search);
  const paramId = params.get("id");
  const paramTitle = params.get("title");
  const cdnUrl = params.get("cdn");

  if (paramId) {
    const foundIdx = activeShorts.findIndex((s) => s.id === paramId);
    if (foundIdx !== -1) currentIndex = foundIdx;
  } else if (paramTitle) {
    const foundIdx = activeShorts.findIndex((s) => s.title === paramTitle);
    if (foundIdx !== -1) currentIndex = foundIdx;
  }

  // Elements
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
    btnComment.addEventListener("click", () => {
      switchTab("comments");
      if (commentInput) commentInput.focus();
    });
  }

  function renderComments() {
    if (!commentsList) return;
    commentsList.innerHTML = "";
    mockComments.forEach((c) => {
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

  function loadShort(idx) {
    currentIndex = (idx + activeShorts.length) % activeShorts.length;
    const currentShort = activeShorts[currentIndex];

    if (captionEl) captionEl.textContent = currentShort.title;
    if (likeCountEl) likeCountEl.textContent = currentShort.likes || "38K";
    currentProgress = 0;
    if (progressBar) progressBar.style.width = "0%";

    if (currentShort.image && video) {
      video.poster = currentShort.image;
    }

    const streamUrl = currentShort.videoUrl || cdnUrl;
    if (streamUrl && video) {
      video.src = streamUrl;
      if (videoSource) videoSource.src = streamUrl;
      video.load();
    }

    document.title = `${currentShort.title} - Shorts`;
    setPlaying(true);
    renderQueue();
  }

  function setPlaying(play) {
    isPlaying = play;
    if (isPlaying) {
      if (playOverlay) playOverlay.classList.add("is-playing");
      if (video && video.currentSrc && video.currentSrc !== window.location.href) {
        video.play().catch(() => {});
      }
      clearInterval(progressTimer);
      progressTimer = setInterval(() => {
        currentProgress = (currentProgress + 1.2) % 100;
        if (progressBar) progressBar.style.width = `${currentProgress}%`;
      }, 250);
    } else {
      if (playOverlay) playOverlay.classList.remove("is-playing");
      if (video) video.pause();
      clearInterval(progressTimer);
    }
  }

  // Toggle play/pause
  if (playOverlay) {
    playOverlay.addEventListener("click", () => setPlaying(!isPlaying));
  }
  if (screenPlayBtn) {
    screenPlayBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      setPlaying(true);
    });
  }

  // Navigation Arrows
  if (btnPrev) {
    btnPrev.addEventListener("click", () => loadShort(currentIndex - 1));
  }
  if (btnNext) {
    btnNext.addEventListener("click", () => loadShort(currentIndex + 1));
  }

  // Keyboard Navigation: ArrowUp / ArrowDown
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
      setPlaying(!isPlaying);
    }
  });

  // Like interaction
  let liked = false;
  if (btnLike) {
    btnLike.addEventListener("click", () => {
      liked = !liked;
      btnLike.style.color = liked ? "var(--color-accent)" : "";
      btnLike.style.borderColor = liked ? "var(--color-accent)" : "";
    });
  }

  // Volume interaction
  if (btnVol && volIcon) {
    btnVol.addEventListener("click", () => {
      isMuted = !isMuted;
      if (video) video.muted = isMuted;
      volIcon.innerHTML = isMuted
        ? '<path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"/><line x1="22" x2="16" y1="9" y2="15"/><line x1="16" x2="22" y1="9" y2="15"/>'
        : '<path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"/><path d="M16 9a5 5 0 0 1 0 6"/><path d="M19.364 18.364a9 9 0 0 0 0-12.728"/>';
    });
  }

  // Subscribe button
  if (btnSub) {
    btnSub.addEventListener("click", () => {
      btnSub.textContent = btnSub.textContent === "Subscribe" ? "Subscribed" : "Subscribe";
      btnSub.style.background = btnSub.textContent === "Subscribed" ? "#444444" : "#ffffff";
      btnSub.style.color = btnSub.textContent === "Subscribed" ? "#ffffff" : "#000000";
    });
  }

  // Initial load
  loadShort(currentIndex);
  renderComments();
  renderQueue();
});
