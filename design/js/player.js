// Player page logic - Supports CDN video embedding, Catalog lookup, quality control, volume slider, PiP, and keyboard shortcuts
const FALLBACK_RELATED = [
  { id: "rel-1", title: "Magna sed adipiscing", date: "November 1, 2015", author: "Jane Doe", image: "images/pic03.jpg", avatar: "images/avatar.jpg" },
  { id: "rel-2", title: "Lorem ipsum fermentum", date: "October 25, 2015", author: "Jane Doe", image: "images/pic03.jpg", avatar: "images/avatar.jpg" },
  { id: "rel-3", title: "Feugiat veroeros dolor", date: "October 18, 2015", author: "Jane Doe", image: "images/pic03.jpg", avatar: "images/avatar.jpg" },
  { id: "rel-4", title: "Rutrum sed vitae justo", date: "October 12, 2015", author: "Jane Doe", image: "images/pic03.jpg", avatar: "images/avatar.jpg" },
  { id: "rel-5", title: "Convallis maximus nisl", date: "October 08, 2015", author: "Jane Doe", image: "images/pic03.jpg", avatar: "images/avatar.jpg" },
  { id: "rel-6", title: "Nullam consequat etiam", date: "October 02, 2015", author: "Jane Doe", image: "images/pic03.jpg", avatar: "images/avatar.jpg" }
];

// 20px Lucide SVG templates with 1.25px stroke
const ICONS = {
  play: '<polygon points="6 3 20 12 6 21 6 3"/>',
  pause: '<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>',
  volume: '<path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"/><path d="M16 9a5 5 0 0 1 0 6"/><path d="M19.364 18.364a9 9 0 0 0 0-12.728"/>',
  volumeLow: '<path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"/><path d="M16 9a5 5 0 0 1 0 6"/>',
  mute: '<path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"/><line x1="22" x2="16" y1="9" y2="15"/><line x1="16" x2="22" y1="9" y2="15"/>'
};

document.addEventListener("DOMContentLoaded", () => {
  // Clear miniplayer session while on full player view
  try { sessionStorage.removeItem("tuc_miniplayer"); try { localStorage.removeItem("tuc_miniplayer"); } catch(err){} } catch(e) {}

  // Video Element & Core Controls
  const video = document.getElementById("player-video");
  const videoSource = document.getElementById("video-source");
  const screenOverlay = document.getElementById("screen-overlay");
  const screenPlayBtn = document.getElementById("play-btn");
  const ctrlPlayBtn = document.getElementById("ctrl-play-btn");
  const iconPlayState = document.getElementById("icon-play-state");
  const ctrlVolumeBtn = document.getElementById("ctrl-volume-btn");
  const iconVolumeState = document.getElementById("icon-volume-state");
  const volumeSlider = document.getElementById("volume-slider");
  const volumeTrackFill = document.getElementById("volume-track-fill");
  const volumeTrackThumb = document.getElementById("volume-track-thumb");
  const volumeSliderWrapper = document.getElementById("volume-slider-wrapper");
  const ctrlPipBtn = document.getElementById("ctrl-pip-btn");
  const ctrlSettingsBtn = document.getElementById("ctrl-settings-btn");
  const settingsMenu = document.getElementById("player-settings-menu");
  const ctrlFullscreenBtn = document.getElementById("ctrl-fullscreen-btn");
  const scrubTimeline = document.getElementById("scrub-timeline");
  const scrubProgress = document.getElementById("scrub-progress");
  const controlTime = document.getElementById("control-time");
  const videoScreenBox = document.getElementById("video-screen-box");
  const titleEl = document.getElementById("player-title");
  const dateEl = document.getElementById("player-date");
  const descEl = document.getElementById("player-description-box");
  const channelNameEl = document.getElementById("player-channel-name");

  // Settings Panels & Controls
  const settingsMainPanel = document.getElementById("settings-main-panel");
  const settingsQualityPanel = document.getElementById("settings-quality-panel");
  const settingsSpeedPanel = document.getElementById("settings-speed-panel");
  const btnOpenQuality = document.getElementById("settings-btn-quality");
  const btnOpenSpeed = document.getElementById("settings-btn-speed");
  const qualityBackBtn = document.getElementById("quality-back-btn");
  const speedBackBtn = document.getElementById("speed-back-btn");
  const currentQualityLabel = document.getElementById("current-quality-label");
  const currentSpeedLabel = document.getElementById("current-speed-label");
  const autoDetectedResEl = document.getElementById("auto-detected-res");
  const qualityOptionBtns = document.querySelectorAll(".settings-option-btn[data-quality]");
  const speedOptionBtns = document.querySelectorAll(".settings-option-btn[data-speed]");

  // Parse URL query params and Catalog resolution
  const params = new URLSearchParams(window.location.search);
  const videoId = params.get("id");
  let currentItem = null;

  if (window.Catalog && videoId) {
    currentItem = Catalog.getVideoById(videoId);
  }

  // Resolve metadata
  const title = currentItem ? currentItem.title : (params.get("title") || "Vitae sed condimentum");
  const date = currentItem ? currentItem.date : (params.get("date") || "October 20, 2015");
  const views = currentItem ? currentItem.views : "1,420,890 views";
  const author = currentItem ? currentItem.author : "The Unemployed Club";
  const description = currentItem ? currentItem.description : "An exploration of minimal editorial aesthetics and atmospheric rhythm. Curated stream matching the classic Future Imperfect philosophy • Zero compression degradation • High fidelity audio pacing.";
  const cdnUrl = currentItem ? currentItem.videoUrl : (params.get("cdn") || params.get("src") || params.get("video") || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4");
  const artworkUrl = currentItem ? currentItem.artworkUrl : (params.get("poster") || params.get("artwork") || params.get("image") || "images/pic01.jpg");

  if (titleEl) titleEl.textContent = title;
  if (dateEl) dateEl.innerHTML = `${date} &bull; ${views}`;
  if (descEl) descEl.textContent = description;
  if (channelNameEl) channelNameEl.textContent = author;
  document.title = `${title} - The Unemployed Club`;

  let isPlaying = false;
  let simulatedTimer = null;
  let simulatedSeconds = 258; // 04:18 fallback
  const totalSeconds = 1105; // 18:25 fallback
  let hlsInstance = null;

  function formatTime(secs) {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  function setPlayState(play) {
    isPlaying = play;
    if (isPlaying) {
      if (iconPlayState) iconPlayState.innerHTML = ICONS.pause;
      if (screenOverlay) screenOverlay.classList.add("is-hidden");
    } else {
      if (iconPlayState) iconPlayState.innerHTML = ICONS.play;
      if (screenOverlay) screenOverlay.classList.remove("is-hidden");
    }
  }

  // ========================================================
  // 1. SMART QUALITY RESOLUTION & ADAPTIVE PLAYBACK
  // Rule: If video is available in 720p or other resolution,
  // it plays in the top resolution available if device supports higher.
  // ========================================================
  let availableVideoResolutions = ["1080p", "720p", "480p", "360p"];

  function resolveAutoQuality(available = availableVideoResolutions) {
    const width = window.screen.width || window.innerWidth;
    const isMobile = window.innerWidth <= 768 || /Mobi|Android|iPhone/i.test(navigator.userAgent);

    let deviceMax = "1080p";
    if (isMobile || width <= 480) {
      deviceMax = "480p";
    } else if (width <= 1024) {
      deviceMax = "720p";
    } else {
      deviceMax = "1080p";
    }

    const resToNum = r => parseInt(String(r).replace("p", ""), 10) || 720;
    const deviceMaxNum = resToNum(deviceMax);
    const availableNums = available.map(resToNum).sort((a, b) => b - a);
    const highestAvailable = availableNums[0] || 720;

    let chosenNum = highestAvailable;
    for (const num of availableNums) {
      if (num <= deviceMaxNum) {
        chosenNum = num;
        break;
      }
    }
    return `${chosenNum}p`;
  }

  let activeQuality = localStorage.getItem("tuc_player_quality") || "auto";
  let detectedOptimal = resolveAutoQuality();
  if (autoDetectedResEl) autoDetectedResEl.textContent = `(${detectedOptimal})`;

  function updateQualityUI(quality) {
    activeQuality = quality;
    try { localStorage.setItem("tuc_player_quality", quality); } catch (e) {}

    qualityOptionBtns.forEach(btn => {
      btn.classList.toggle("is-selected", btn.dataset.quality === quality);
    });

    if (currentQualityLabel) {
      if (quality === "auto") {
        currentQualityLabel.textContent = `Auto (${detectedOptimal}) ›`;
      } else {
        currentQualityLabel.textContent = `${quality} ›`;
      }
    }
  }

  updateQualityUI(activeQuality);

  function applyQualityToStream(targetQuality) {
    updateQualityUI(targetQuality);

    // HLS Adaptive level switching
    if (hlsInstance && hlsInstance.levels && hlsInstance.levels.length > 0) {
      if (targetQuality === "auto") {
        hlsInstance.currentLevel = -1;
      } else {
        const heightNum = parseInt(targetQuality.replace("p", ""), 10);
        let foundIdx = -1;
        let minDiff = Infinity;
        hlsInstance.levels.forEach((lvl, idx) => {
          const diff = Math.abs((lvl.height || 0) - heightNum);
          if (diff < minDiff) {
            minDiff = diff;
            foundIdx = idx;
          }
        });
        if (foundIdx !== -1) {
          hlsInstance.currentLevel = foundIdx;
        }
      }
      return;
    }

    // Direct MP4 quality variants resolution (e.g. video_720p.mp4 or ?res=720p)
    if (video && video.src) {
      const curTime = video.currentTime;
      const wasPlaying = !video.paused;
      let newSrc = video.src;

      if (targetQuality !== "auto" && /(1080p|720p|480p|360p)/i.test(newSrc)) {
        newSrc = newSrc.replace(/(1080p|720p|480p|360p)/i, targetQuality);
        if (newSrc !== video.src) {
          video.src = newSrc;
          video.currentTime = curTime;
          if (wasPlaying) video.play().catch(console.warn);
        }
      }
    }
  }

  // ========================================================
  // 2. VIDEO STREAM LOADING & RESUME POSITION
  // ========================================================
  if (video) {
    if (artworkUrl) video.poster = artworkUrl;

    if (cdnUrl) {
      const isHls = cdnUrl.includes(".m3u8");

      if (isHls && window.Hls && Hls.isSupported()) {
        hlsInstance = new Hls({ autoStartLoad: true, capLevelToPlayerSize: true });
        hlsInstance.loadSource(cdnUrl);
        hlsInstance.attachMedia(video);

        hlsInstance.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
          if (data && data.levels && data.levels.length > 0) {
            availableVideoResolutions = data.levels.map(l => `${l.height}p`);
            detectedOptimal = resolveAutoQuality(availableVideoResolutions);
            if (autoDetectedResEl) autoDetectedResEl.textContent = `(${detectedOptimal})`;
            if (activeQuality === "auto") updateQualityUI("auto");
          }
        });
      } else if (isHls && video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = cdnUrl;
      } else {
        video.src = cdnUrl;
        if (videoSource) videoSource.src = cdnUrl;
      }
      video.load();
    }

    // Resume timestamp if coming back from floating miniplayer
    const resumeTime = parseFloat(params.get("t") || "0");
    if (resumeTime > 0) {
      video.addEventListener("loadedmetadata", () => {
        video.currentTime = resumeTime;
        if (params.get("autoplay") === "true") {
          video.play().catch(console.warn);
        }
      }, { once: true });
    }
  }

  function togglePlay() {
    const hasSource = video && (video.src || video.currentSrc) && video.src !== window.location.href;
    if (hasSource) {
      if (video.paused) {
        video.play()
          .then(() => setPlayState(true))
          .catch((err) => {
            console.warn("Autoplay policy warning:", err);
            setPlayState(false);
          });
      } else {
        video.pause();
        setPlayState(false);
      }
    } else {
      setPlayState(!isPlaying);
      if (isPlaying) {
        clearInterval(simulatedTimer);
        simulatedTimer = setInterval(() => {
          simulatedSeconds = (simulatedSeconds + 1) % totalSeconds;
          const pct = ((simulatedSeconds / totalSeconds) * 100).toFixed(1);
          if (scrubProgress) scrubProgress.style.width = `${pct}%`;
          if (controlTime) controlTime.textContent = `${formatTime(simulatedSeconds)} / ${formatTime(totalSeconds)}`;
        }, 1000);
      } else {
        clearInterval(simulatedTimer);
      }
    }
  }

  // Play button & screen overlay click
  if (screenPlayBtn) screenPlayBtn.addEventListener("click", togglePlay);
  if (ctrlPlayBtn) ctrlPlayBtn.addEventListener("click", togglePlay);
  if (screenOverlay) {
    screenOverlay.addEventListener("click", (e) => {
      if (e.target !== screenPlayBtn && !screenPlayBtn.contains(e.target)) {
        togglePlay();
      }
    });
  }
  if (video) {
    video.addEventListener("click", togglePlay);
  }

  // Time & scrubber
  if (video) {
    video.addEventListener("timeupdate", () => {
      if (video.duration && !isNaN(video.duration)) {
        const pct = ((video.currentTime / video.duration) * 100).toFixed(1);
        if (scrubProgress) scrubProgress.style.width = `${pct}%`;
        if (controlTime) controlTime.textContent = `${formatTime(video.currentTime)} / ${formatTime(video.duration)}`;
      }
    });
    video.addEventListener("play", () => setPlayState(true));
    video.addEventListener("pause", () => setPlayState(false));
    video.addEventListener("ended", () => setPlayState(false));
  }

  if (scrubTimeline) {
    scrubTimeline.addEventListener("click", (e) => {
      const rect = scrubTimeline.getBoundingClientRect();
      const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      if (scrubProgress) scrubProgress.style.width = `${(pos * 100).toFixed(1)}%`;
      if (video && video.duration && !isNaN(video.duration)) {
        video.currentTime = pos * video.duration;
      } else {
        simulatedSeconds = Math.floor(pos * totalSeconds);
        if (controlTime) controlTime.textContent = `${formatTime(simulatedSeconds)} / ${formatTime(totalSeconds)}`;
      }
    });
  }

  // ========================================================
  // 3. PRECISION VOLUME SLIDER & AUDIO CONTROLS
  // ========================================================
  let currentVol = 1;
  try {
    const savedVol = localStorage.getItem("tuc_player_vol");
    if (savedVol !== null) currentVol = parseFloat(savedVol);
  } catch (e) {}

  function updateVolumeUI(vol, muted) {
    const effectiveVol = muted ? 0 : vol;
    const pct = Math.round(effectiveVol * 100);

    if (volumeSlider) volumeSlider.value = effectiveVol;
    if (volumeTrackFill) volumeTrackFill.style.width = `${pct}%`;
    if (volumeTrackThumb) volumeTrackThumb.style.left = `${pct}%`;

    if (iconVolumeState) {
      if (muted || effectiveVol === 0) {
        iconVolumeState.innerHTML = ICONS.mute;
      } else if (effectiveVol < 0.5) {
        iconVolumeState.innerHTML = ICONS.volumeLow;
      } else {
        iconVolumeState.innerHTML = ICONS.volume;
      }
    }
  }

  if (video) {
    video.volume = currentVol;
    updateVolumeUI(currentVol, video.muted);
  }

  if (volumeSlider) {
    volumeSlider.addEventListener("input", (e) => {
      const val = parseFloat(e.target.value);
      currentVol = val;
      if (video) {
        video.volume = val;
        video.muted = (val === 0);
      }
      try { localStorage.setItem("tuc_player_vol", val); } catch (err) {}
      updateVolumeUI(val, val === 0);
    });
  }

  if (ctrlVolumeBtn) {
    ctrlVolumeBtn.addEventListener("click", () => {
      if (!video) return;
      video.muted = !video.muted;
      if (!video.muted && video.volume === 0) {
        video.volume = currentVol > 0 ? currentVol : 0.8;
      }
      updateVolumeUI(video.volume, video.muted);
    });
  }

  // ========================================================
  // 4. FLOATING MINIPLAYER / PICTURE-IN-PICTURE NAVIGATION
  // Clicking PiP button pops up the video in the bottom right corner
  // and smoothly navigates to the home screen (index.html).
  // ========================================================
  if (ctrlPipBtn) {
    ctrlPipBtn.addEventListener("click", () => {
      const curTime = video ? (video.currentTime || 0) : 0;
      const isCurrentlyPlaying = video ? !video.paused : isPlaying;

      const miniState = {
        active: true,
        id: videoId || "vid-001",
        title: titleEl ? titleEl.textContent : "Video",
        videoUrl: cdnUrl || (video ? video.src : ""),
        artworkUrl: artworkUrl || "",
        currentTime: curTime,
        isPlaying: isCurrentlyPlaying
      };

      try {
        sessionStorage.setItem("tuc_miniplayer", JSON.stringify(miniState)); try { localStorage.setItem("tuc_miniplayer", JSON.stringify(miniState)); } catch(err){}
      } catch (err) {}

      window.location.href = "index.html";
    });
  }

  // ========================================================
  // 5. PLAYBACK SETTINGS (QUALITY & SPEED POPOVER)
  // ========================================================
  function closeSettingsMenu() {
    if (settingsMenu) settingsMenu.classList.remove("is-open");
    if (ctrlSettingsBtn) ctrlSettingsBtn.setAttribute("aria-expanded", "false");
    switchSettingsPanel(settingsMainPanel);
  }

  function switchSettingsPanel(panelToShow) {
    [settingsMainPanel, settingsQualityPanel, settingsSpeedPanel].forEach(p => {
      if (p) p.classList.remove("is-active");
    });
    if (panelToShow) panelToShow.classList.add("is-active");
  }

  if (ctrlSettingsBtn && settingsMenu) {
    ctrlSettingsBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = settingsMenu.classList.toggle("is-open");
      ctrlSettingsBtn.setAttribute("aria-expanded", isOpen);
      if (isOpen) switchSettingsPanel(settingsMainPanel);
    });

    document.addEventListener("click", (e) => {
      if (!settingsMenu.contains(e.target) && !ctrlSettingsBtn.contains(e.target)) {
        closeSettingsMenu();
      }
    });
  }

  if (btnOpenQuality) {
    btnOpenQuality.addEventListener("click", () => switchSettingsPanel(settingsQualityPanel));
  }
  if (btnOpenSpeed) {
    btnOpenSpeed.addEventListener("click", () => switchSettingsPanel(settingsSpeedPanel));
  }
  if (qualityBackBtn) {
    qualityBackBtn.addEventListener("click", () => switchSettingsPanel(settingsMainPanel));
  }
  if (speedBackBtn) {
    speedBackBtn.addEventListener("click", () => switchSettingsPanel(settingsMainPanel));
  }

  qualityOptionBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const q = btn.dataset.quality;
      applyQualityToStream(q);
      switchSettingsPanel(settingsMainPanel);
    });
  });

  speedOptionBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const rate = parseFloat(btn.dataset.speed);
      if (video) video.playbackRate = rate;

      speedOptionBtns.forEach(b => b.classList.remove("is-selected"));
      btn.classList.add("is-selected");

      if (currentSpeedLabel) {
        currentSpeedLabel.textContent = (rate === 1 ? "Normal" : `${rate}x`) + " ›";
      }
      switchSettingsPanel(settingsMainPanel);
    });
  });

  // ========================================================
  // 6. FULLSCREEN & KEYBOARD SHORTCUTS
  // ========================================================
  if (ctrlFullscreenBtn && videoScreenBox) {
    ctrlFullscreenBtn.addEventListener("click", () => {
      if (!document.fullscreenElement) {
        if (videoScreenBox.requestFullscreen) {
          videoScreenBox.requestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        }
      }
    });
  }

  document.addEventListener("keydown", (e) => {
    if (["input", "textarea"].includes(document.activeElement.tagName.toLowerCase())) return;

    if (e.code === "Space" || e.key === "k" || e.key === "K") {
      e.preventDefault();
      togglePlay();
    } else if (e.key === "f" || e.key === "F") {
      e.preventDefault();
      if (ctrlFullscreenBtn) ctrlFullscreenBtn.click();
    } else if (e.key === "m" || e.key === "M") {
      e.preventDefault();
      if (ctrlVolumeBtn) ctrlVolumeBtn.click();
    } else if (e.key === "p" || e.key === "P") {
      e.preventDefault();
      if (ctrlPipBtn) ctrlPipBtn.click();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (video) {
        video.volume = Math.min(1, video.volume + 0.1);
        currentVol = video.volume;
        updateVolumeUI(video.volume, false);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (video) {
        video.volume = Math.max(0, video.volume - 0.1);
        currentVol = video.volume;
        updateVolumeUI(video.volume, video.volume === 0);
      }
    }
  });

  // Visual testing helper: open settings or slider via URL params
  if (params.get("settings") === "open" && settingsMenu && ctrlSettingsBtn) {
    settingsMenu.classList.add("is-open");
    ctrlSettingsBtn.setAttribute("aria-expanded", "true");
  }
  if (params.get("vol") === "open" && volumeSliderWrapper) {
    volumeSliderWrapper.classList.add("is-active");
  }

  // Action Buttons Interactions (Like, Save, Subscribe)
  const btnLike = document.getElementById("btn-like");
  let isLiked = false;
  if (btnLike) {
    btnLike.addEventListener("click", () => {
      isLiked = !isLiked;
      btnLike.style.color = isLiked ? "var(--color-accent)" : "";
      btnLike.style.borderColor = isLiked ? "var(--color-accent)" : "";
    });
  }

  const btnSave = document.getElementById("btn-save");
  let isSaved = false;
  if (btnSave) {
    btnSave.addEventListener("click", () => {
      isSaved = !isSaved;
      btnSave.style.color = isSaved ? "var(--color-accent)" : "";
      btnSave.style.borderColor = isSaved ? "var(--color-accent)" : "";
    });
  }

  const btnSub = document.getElementById("btn-subscribe");
  if (btnSub) {
    btnSub.addEventListener("click", () => {
      const isSubbed = btnSub.textContent.trim() === "Subscribed";
      btnSub.textContent = isSubbed ? "Subscribe" : "Subscribed";
      btnSub.style.background = isSubbed ? "#ffffff" : "#444444";
      btnSub.style.color = isSubbed ? "#000000" : "#ffffff";
    });
  }

  // Render Recommended Video Cards
  const relatedList = document.getElementById("related-list");
  if (relatedList) {
    const listToRender = (window.Catalog && typeof Catalog.getRelated === "function")
      ? Catalog.getRelated(videoId || "", 6)
      : FALLBACK_RELATED;

    relatedList.innerHTML = "";
    listToRender.forEach((v) => {
      const card = document.createElement("a");
      card.href = `player.html?id=${encodeURIComponent(v.id || '')}&title=${encodeURIComponent(v.title || '')}&date=${encodeURIComponent(v.date || '')}`;
      card.className = "mini-post";
      const imgSrc = v.artworkUrl || v.image || "images/pic03.jpg";
      const avatarSrc = v.avatar || "images/avatar.jpg";
      card.innerHTML = `
        <header>
          <h3>${v.title}</h3>
          <time class="published">${v.date || ''}</time>
          <span class="author"><img src="${avatarSrc}" alt="${v.author || 'Author'}" /></span>
        </header>
        <div class="image"><img src="${imgSrc}" alt="${v.title}" /></div>
      `;
      relatedList.appendChild(card);
    });
  }
});
