// MHS STORE - High-Precision Video Scrubbing Engine (Continuous 60FPS Frame-by-Frame Interpolation)

// Global in-memory video preloader to eliminate network buffering delay across categories
export class VideoPreloader {
  static preloaded = new Set();
  static pool = new Map();

  static preloadList(videoSrcs) {
    if (!Array.isArray(videoSrcs)) return;
    
    // Low priority background pre-caching
    const loadNext = (index) => {
      if (index >= videoSrcs.length) return;
      const src = videoSrcs[index];
      if (!src || this.preloaded.has(src)) {
        loadNext(index + 1);
        return;
      }

      const vid = document.createElement('video');
      vid.preload = 'auto';
      vid.muted = true;
      vid.playsInline = true;
      vid.src = src;
      this.preloaded.add(src);
      this.pool.set(src, vid);

      const onReady = () => {
        vid.removeEventListener('loadeddata', onReady);
        vid.removeEventListener('error', onReady);
        setTimeout(() => loadNext(index + 1), 50);
      };

      vid.addEventListener('loadeddata', onReady, { once: true });
      vid.addEventListener('error', onReady, { once: true });
      vid.load();
    };

    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => loadNext(0));
    } else {
      setTimeout(() => loadNext(0), 100);
    }
  }
}

export class VideoScrubEngine {
  constructor() {
    this.instances = new Map();
    this.rafId = null;
    this.isDestroyed = false;

    // Smooth interpolation factor (0.22 for silky 60fps continuous frame progression)
    this.lerpFactor = 0.22;
    this.epsilon = 0.0005;

    this.startLoop();
  }

  registerSection(sectionElement, meta) {
    const video = sectionElement.querySelector('.scrub-video');
    const progressBar = sectionElement.querySelector('.minimal-scrub-progress-fill');
    const pill = sectionElement.querySelector('.minimal-add-bag-pill');

    if (!video) return;

    // Check if we already have an instance for this section
    let instanceData = this.instances.get(sectionElement);
    const startOffset = (meta && meta.startOffset) || 0.0;
    const endOffset = (meta && meta.endOffset) || 0.0;
    const initialTime = Math.max(0.001, startOffset);

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
        duration: 10,
        isLoaded: false,
        currentTimelineItem: null,
        targetProgress: 0,
        currentProgress: 0
      };
      this.instances.set(sectionElement, instanceData);
    } else {
      instanceData.meta = meta;
      instanceData.startOffset = startOffset;
      instanceData.endOffset = endOffset;
      instanceData.targetTime = initialTime;
      instanceData.currentTime = initialTime;
      instanceData.pendingTime = null;
      instanceData.isLoaded = false;
      instanceData.currentTimelineItem = null;
      instanceData.targetProgress = 0;
      instanceData.currentProgress = 0;
      instanceData.progressBar = progressBar;
      instanceData.pill = pill;
    }

    video.muted = true;
    video.playsInline = true;
    video.autoplay = false;
    video.preload = 'auto';
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');
    video.setAttribute('muted', '');
    
    if (video.src !== meta.videoSrc && !video.src.endsWith(meta.videoSrc)) {
      video.src = meta.videoSrc;
    }
    video.pause();

    // Mobile decoder unlock on first touch
    const primeMobile = () => {
      if (video.paused) {
        const p = video.play();
        if (p && p.then) {
          p.then(() => video.pause()).catch(() => {});
        }
      }
      window.removeEventListener('touchstart', primeMobile);
    };
    window.addEventListener('touchstart', primeMobile, { once: true, passive: true });

    // Handle seeked event to ensure every intermediate frame is rendered seamlessly
    video.addEventListener('seeked', () => {
      if (instanceData.pendingTime !== null) {
        const next = instanceData.pendingTime;
        instanceData.pendingTime = null;
        if (Math.abs(video.currentTime - next) > 0.005) {
          try {
            video.currentTime = next;
          } catch (e) {}
        }
      }
    });

    const onLoaded = () => {
      if (video.duration && !isNaN(video.duration) && video.duration > 0) {
        instanceData.duration = video.duration;
      }
      instanceData.isLoaded = true;

      // Prime to initial frame immediately
      const initialFrame = Math.max(0.001, instanceData.startOffset);
      try {
        video.currentTime = initialFrame;
      } catch (e) {}

      this.updateDynamicTimelineItem(instanceData, 0);
      this.updateScroll();
    };

    if (video.readyState >= 2) {
      onLoaded();
    } else {
      video.addEventListener('loadedmetadata', onLoaded, { once: true });
      video.addEventListener('loadeddata', onLoaded, { once: true });
      video.addEventListener('canplay', onLoaded, { once: true });
      video.addEventListener('canplaythrough', onLoaded, { once: true });
    }

    video.load();
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

      // Calculate exact progress through the section
      const headerOffset = 48; // Unified 48px header
      const distanceScrolled = headerOffset - rect.top;
      const rawProgress = distanceScrolled / scrollableDistance;
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

        // Apply precision frame timestamp to video
        const safeTime = Math.max(0.001, Math.min(data.duration - 0.001, data.currentTime));
        if (!data.video.seeking) {
          try {
            data.video.currentTime = safeTime;
          } catch (e) {}
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
          data.video.pause();
          data.video.removeAttribute('src');
          data.video.load();
        } catch (e) {}
      }
    }
    this.instances.clear();
  }
}
