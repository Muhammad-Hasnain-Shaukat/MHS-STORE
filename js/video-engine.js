// MHS STORE - High-Precision Video Scrubbing Engine (Continuous 60FPS Frame-by-Frame Interpolation)
export class VideoScrubEngine {
  constructor() {
    this.instances = new Map();
    this.rafId = null;
    this.isDestroyed = false;

    // Snappy, silky interpolation factor (0.45 for immediate responsiveness)
    this.lerpFactor = 0.45;
    this.epsilon = 0.0005;

    this.startLoop();
  }

  registerSection(sectionElement, meta, activeVideoElement) {
    const video = activeVideoElement || sectionElement.querySelector('.scrub-video.active-slot') || sectionElement.querySelector('.scrub-video');
    const progressBar = sectionElement.querySelector('.minimal-scrub-progress-fill');
    const pill = sectionElement.querySelector('.minimal-add-bag-pill');

    if (!video) return;

    const targetSrc = encodeURI(meta.videoSrc);
    const cleanCurrent = decodeURI(video.currentSrc || video.src || '');
    if (!cleanCurrent.endsWith(meta.videoSrc)) {
      video.src = targetSrc;
      video.preload = 'auto';
      try { video.load(); } catch (e) {}
    }
    video.muted = true;
    video.playsInline = true;
    video.autoplay = false;
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');
    video.setAttribute('muted', '');
    try { video.pause(); } catch (e) {}

    const startOffset = (meta && meta.startOffset) || 0.0;
    const endOffset = (meta && meta.endOffset) || 0.0;
    const initialTime = Math.max(0.001, startOffset);

    let instanceData = this.instances.get(sectionElement);
    if (!instanceData) {
      instanceData = {
        section: sectionElement,
        video: video,
        progressBar: progressBar,
        pill: pill,
        meta: meta,
        startOffset: startOffset,
        endOffset: endOffset,
        targetTime: initialTime,
        currentTime: initialTime,
        pendingTime: null,
        isSeeking: false,
        lastSeekTime: 0,
        duration: (video.duration && video.duration > 0) ? video.duration : 10,
        isLoaded: video.readyState >= 1,
        currentTimelineItem: null,
        targetProgress: 0,
        currentProgress: 0
      };
      this.instances.set(sectionElement, instanceData);
    } else {
      instanceData.video = video;
      instanceData.meta = meta;
      instanceData.startOffset = startOffset;
      instanceData.endOffset = endOffset;
      instanceData.targetTime = initialTime;
      instanceData.currentTime = initialTime;
      instanceData.pendingTime = null;
      instanceData.isSeeking = false;
      instanceData.lastSeekTime = 0;
      instanceData.duration = (video.duration && video.duration > 0) ? video.duration : 10;
      instanceData.isLoaded = video.readyState >= 1;
      instanceData.currentTimelineItem = null;
      instanceData.targetProgress = 0;
      instanceData.currentProgress = 0;
      instanceData.progressBar = progressBar;
      instanceData.pill = pill;
    }

    // High-performance seek completion handler
    video.onseeked = () => {
      instanceData.isSeeking = false;
      if (instanceData.pendingTime !== null) {
        const next = instanceData.pendingTime;
        instanceData.pendingTime = null;
        if (Math.abs(video.currentTime - next) > 0.008) {
          instanceData.isSeeking = true;
          instanceData.lastSeekTime = performance.now();
          try {
            video.currentTime = next;
          } catch (e) {
            instanceData.isSeeking = false;
          }
        }
      }
    };

    // Mobile iOS Safari / Chrome video decoder priming on first touch interaction
    const unlockMobileVideo = () => {
      if (video.paused) {
        const p = video.play();
        if (p && p.then) {
          p.then(() => video.pause()).catch(() => {});
        }
      }
      window.removeEventListener('touchstart', unlockMobileVideo);
    };
    window.addEventListener('touchstart', unlockMobileVideo, { once: true, passive: true });

    const onLoaded = () => {
      if (video.duration && !isNaN(video.duration) && video.duration > 0) {
        instanceData.duration = video.duration;
      }
      instanceData.isLoaded = true;

      const initialFrame = Math.max(0.001, instanceData.startOffset);
      try {
        video.currentTime = initialFrame;
      } catch (e) {}

      this.updateDynamicTimelineItem(instanceData, 0);
      this.updateScroll();
    };

    if (video.readyState >= 1) {
      onLoaded();
    } else {
      video.addEventListener('loadedmetadata', onLoaded, { once: true });
      video.addEventListener('loadeddata', onLoaded, { once: true });
      video.addEventListener('canplay', onLoaded, { once: true });
    }

    this.updateDynamicTimelineItem(instanceData, 0);
    this.updateScroll();
  }

  startLoop() {
    const tick = () => {
      if (this.isDestroyed) return;
      this.render();
      this.rafId = requestAnimationFrame(tick);
    };
    this.rafId = requestAnimationFrame(tick);
  }

  updateScroll() {
    const windowH = window.innerHeight;

    for (const [sectionEl, data] of this.instances.entries()) {
      const rect = sectionEl.getBoundingClientRect();
      const sectionHeight = sectionEl.offsetHeight;
      const scrollableDistance = sectionHeight - windowH;

      if (scrollableDistance <= 0) continue;

      if (data.video && data.video.duration && !isNaN(data.video.duration) && data.video.duration > 0) {
        data.duration = data.video.duration;
      }

      // Calculate exact progress through the section
      const headerOffset = 48; // Unified 48px header
      const distanceScrolled = headerOffset - rect.top;
      // Dwell buffer: reach 100% video frame at 90% scroll so final product rests comfortably in view before unsticking
      const effectiveScrollDistance = Math.max(10, scrollableDistance * 0.90);
      const rawProgress = distanceScrolled / effectiveScrollDistance;
      const progress = Math.max(0, Math.min(1, rawProgress));

      data.targetProgress = progress;
      const startOffset = data.startOffset || 0.0;
      const endOffset = data.endOffset || 0.0;
      const playableRange = Math.max(0.1, data.duration - startOffset - endOffset);
      data.targetTime = startOffset + (progress * playableRange);

      // Immediately update dynamic product pill
      this.updateDynamicTimelineItem(data, progress);
    }
  }

  render() {
    for (const [sectionEl, data] of this.instances.entries()) {
      if (!data.video) continue;

      if (!data.isLoaded) {
        if (data.video.readyState >= 1) {
          if (data.video.duration && !isNaN(data.video.duration) && data.video.duration > 0) {
            data.duration = data.video.duration;
          }
          data.isLoaded = true;
        } else {
          continue;
        }
      }

      // Smooth Lerp Interpolation
      const timeDiff = data.targetTime - data.currentTime;
      const progDiff = data.targetProgress - data.currentProgress;
      const targetSafe = Math.max(0.001, Math.min(data.duration - 0.001, data.targetTime));

      // Continuously interpolate until both currentTime and video.currentTime reach target
      if (Math.abs(timeDiff) > this.epsilon || Math.abs(data.video.currentTime - targetSafe) > 0.01) {
        if (Math.abs(timeDiff) > this.epsilon) {
          data.currentTime += timeDiff * this.lerpFactor;
        } else {
          data.currentTime = data.targetTime;
        }

        const safeTime = Math.max(0.001, Math.min(data.duration - 0.001, data.currentTime));

        // High-precision non-blocking seeking
        const now = performance.now();
        const isSeekingOverdue = data.isSeeking && (now - data.lastSeekTime > 50);

        if (!data.isSeeking || isSeekingOverdue) {
          data.isSeeking = true;
          data.lastSeekTime = now;
          try {
            data.video.currentTime = safeTime;
          } catch (e) {
            data.isSeeking = false;
          }
        } else {
          data.pendingTime = safeTime;
        }
      }

      if (Math.abs(progDiff) > this.epsilon) {
        data.currentProgress += progDiff * this.lerpFactor;
      } else {
        data.currentProgress = data.targetProgress;
      }

      // Update 3px Progress Line
      if (data.progressBar) {
        data.progressBar.style.transform = `scaleX(${data.currentProgress})`;
      }

      // Real-Time Dynamic Timeline Item and Price Swapping
      this.updateDynamicTimelineItem(data, data.currentProgress);
    }
  }

  // ================= REAL-TIME DYNAMIC TIMELINE PRICING =================
  updateDynamicTimelineItem(data, progress) {
    if (!data.meta.timelineItems || data.meta.timelineItems.length === 0) return;
    if (!data.pill) return;

    const activeItem = data.meta.timelineItems.find(item => 
      progress >= item.start && progress < item.end
    ) || data.meta.timelineItems[data.meta.timelineItems.length - 1];

    if (activeItem && activeItem !== data.currentTimelineItem) {
      data.currentTimelineItem = activeItem;

      // Subtle mobile haptic feedback tick on product snap
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try { navigator.vibrate(15); } catch (e) {}
      }

      data.pill.classList.add('price-changing');
      setTimeout(() => data.pill.classList.remove('price-changing'), 250);

      const tagEl = data.pill.querySelector('.pill-tag');
      const titleEl = data.pill.querySelector('.pill-title');
      const priceEl = data.pill.querySelector('.pill-price');
      const btnShowMore = data.pill.querySelector('.btn-pill-show-more');
      const btnAdd = data.pill.querySelector('.btn-pill-add');

      if (tagEl) tagEl.textContent = activeItem.tag || '';
      if (titleEl) titleEl.textContent = activeItem.title;
      if (priceEl) priceEl.textContent = `$${activeItem.price}`;
      if (btnShowMore) btnShowMore.dataset.id = activeItem.id;
      if (btnAdd) btnAdd.dataset.id = activeItem.id;

      // Pre-warm browser cache for the active product detail image
      if (activeItem.image && activeItem.image.trim() !== '') {
        const preImg = new Image();
        preImg.decoding = 'async';
        preImg.src = encodeURI(activeItem.image);
      }
    }
  }

  destroy() {
    this.isDestroyed = true;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    for (const [sectionEl, data] of this.instances.entries()) {
      if (data.video) {
        try {
          data.video.onseeked = null;
          data.video.pause();
          data.video.removeAttribute('src');
          data.video.load();
        } catch (e) {}
      }
    }
    this.instances.clear();
  }
}
