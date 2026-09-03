import { CATALOG, PRODUCTS } from './products.js';
import { store } from './cart.js';
import { VideoScrubEngine } from './video-engine.js';
import { UIController } from './ui.js';
import { ProductDetailModal } from './product-detail.js';
import { RosePetalsEngine } from './rose-petals.js';
import { KuchuMusicBox } from './kuchu-audio.js';
import { AdminController } from './admin.js';

class MhsApp {
  constructor() {
    this.videoEngine = null;
    this.ui = null;
    this.admin = null;
    this.detailModal = null;
    this.rosePetals = null;
    this.kuchuMusic = null;
    this.currentPage = document.body.dataset.page || 'home';
    this.activeSubCategory = null;

    this.init();
  }

  init() {
    this.ui = new UIController();
    this.admin = new AdminController(this.ui);
    this.detailModal = new ProductDetailModal(store);
    this.rosePetals = new RosePetalsEngine();
    this.kuchuMusic = new KuchuMusicBox();

    // Register Service Worker for ultra-fast edge caching and instant updates
    if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
      navigator.serviceWorker.register('./sw.js').then(reg => {
        reg.update();
      }).catch(() => {});
    }

    // 1. Determine initial page and subcategory
    this.initFromUrl();

    // 2. Render ONLY the single active animation section with pre-warmed video matrix
    this.renderActiveSection();

    // 3. Render Sub-Category Nav Tabs
    this.renderSubnavTabs();

    // 4. Initialize Video Scrubbing Engine (singleton instance)
    this.videoEngine = new VideoScrubEngine();
    this.registerActiveVideo();

    // 6. Setup SPA Navigation & Scroll Listeners
    this.bindNavigation();
    this.setupSpaRouter();
    this.setupScrollListener();

    // 7. Check Kuchu Puchu Special effects (Rose petals + sweet rhyme)
    this.checkKuchuSpecialEffects();

    // 8. Initial badge update
    this.ui.updateBadges();

    console.log(`✨ MHS STORE [${this.currentPage.toUpperCase()}] Ultra-Fast SPA Engine Activated.`);
  }

  // ================= URL / STATE RESOLVER =================
  resolvePageFromUrl(url) {
    const clean = (url || '').toLowerCase();
    // CRITICAL: Check 'women' before 'men' because 'women' contains 'men'!
    if (clean.includes('women')) return 'women';
    if (clean.includes('kids')) return 'kids';
    if (clean.includes('men')) return 'men';
    return 'home';
  }

  initFromUrl() {
    const page = this.resolvePageFromUrl(window.location.pathname);
    const urlParams = new URLSearchParams(window.location.search);
    const subParam = urlParams.get('sub');

    this.currentPage = page;
    if (this.currentPage === 'men') {
      this.activeSubCategory = subParam || 'watches';
    } else if (this.currentPage === 'women') {
      this.activeSubCategory = subParam || 'wedding';
    } else if (this.currentPage === 'kids') {
      this.activeSubCategory = subParam || 'babyfootwear';
    } else {
      this.activeSubCategory = 'title';
    }

    document.body.dataset.page = this.currentPage;
    this.updateHeaderActiveState();
  }

  // ================= INSTANT SPA ROUTER =================
  setupSpaRouter() {
    // Intercept Header Navigation Links for 0ms transitions
    document.querySelectorAll('.dept-nav-btn, .brand-logo-wrap').forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (!href || href.startsWith('http') || href.startsWith('#')) return;

        e.preventDefault();
        this.navigateSpa(href);
      });
    });

    // Handle Browser Back / Forward buttons instantly
    window.addEventListener('popstate', (e) => {
      this.initFromUrl();
      this.renderActiveSection();
      this.renderSubnavTabs();
      this.registerActiveVideo();
      if (this.videoEngine) this.videoEngine.updateScroll();
      this.checkKuchuSpecialEffects();
      window.scrollTo({ top: 0, behavior: 'instant' });
    });
  }

  navigateSpa(targetUrl) {
    const targetPage = this.resolvePageFromUrl(targetUrl);
    let targetSub = null;

    if (targetPage === 'men') {
      targetSub = 'watches';
    } else if (targetPage === 'women') {
      targetSub = 'wedding';
    } else if (targetPage === 'kids') {
      targetSub = 'babyfootwear';
    } else {
      targetSub = 'title';
    }

    if (this.currentPage === targetPage && !targetUrl.includes('?sub=')) {
      return; // Already on this page
    }

    this.currentPage = targetPage;
    this.activeSubCategory = targetSub;
    document.body.dataset.page = this.currentPage;

    // Update Browser History and Title
    const titles = {
      home: 'MHS STORE — Luxury Universe',
      men: "MHS STORE — Men's Sartorial Collection",
      women: "MHS STORE — Women's Couture & Bridal",
      kids: 'MHS STORE — Kids & Kuchu Puchu Wonderland'
    };
    document.title = titles[targetPage] || 'MHS STORE';
    window.history.pushState({ page: targetPage, sub: targetSub }, '', targetUrl);

    this.updateHeaderActiveState();
    this.renderSubnavTabs();
    this.renderActiveSection();
    this.registerActiveVideo();
    if (this.videoEngine) this.videoEngine.updateScroll();
    this.checkKuchuSpecialEffects();

    window.scrollTo({ top: 0, behavior: 'instant' });
    this.ui.playAudio('swoosh');
  }

  updateHeaderActiveState() {
    document.querySelectorAll('.header-dept-nav .dept-nav-btn').forEach(btn => {
      const href = btn.getAttribute('href') || '';
      const page = this.resolvePageFromUrl(href);
      btn.classList.toggle('active', page === this.currentPage);
    });
  }

  // ================= RENDER ACTIVE SECTION WITH DEPARTMENT MASTER VIDEO MATRIX =================
  renderActiveSection() {
    const container = document.getElementById('video-sections-container');
    if (!container) return;

    let targetItem = null;
    let deptItems = [];
    if (this.currentPage === 'home') {
      deptItems = CATALOG.filter(c => c.department === 'Hero');
      targetItem = deptItems[0];
    } else if (this.currentPage === 'men') {
      deptItems = CATALOG.filter(c => c.department === 'Male');
      targetItem = deptItems.find(c => c.subCategory === this.activeSubCategory) || deptItems[0];
    } else if (this.currentPage === 'women') {
      deptItems = CATALOG.filter(c => c.department === 'Female');
      targetItem = deptItems.find(c => c.subCategory === this.activeSubCategory) || deptItems[0];
    } else if (this.currentPage === 'kids') {
      deptItems = CATALOG.filter(c => c.department === 'Kids');
      targetItem = deptItems.find(c => c.subCategory === this.activeSubCategory) || deptItems[0];
    }

    if (!targetItem) return;

    // Check if section already exists for this exact department - if so, simply update slot in 0ms!
    const sectionEl = container.querySelector('.video-scrub-section');
    if (sectionEl && sectionEl.dataset.department === targetItem.department) {
      this.updateActiveSlotAndPill(targetItem);
      return;
    }

    // Clean up previous department videos to free GPU hardware decoders completely
    if (sectionEl) {
      sectionEl.querySelectorAll('.scrub-video').forEach(vid => {
        try {
          vid.pause();
          vid.removeAttribute('src');
          vid.load();
        } catch (e) {}
      });
    }

    // Only render Add to Bag pill on department category pages (not on homepage)
    const initialProduct = (this.currentPage !== 'home' && targetItem.timelineItems && targetItem.timelineItems.length) 
      ? targetItem.timelineItems[0] 
      : null;

    container.innerHTML = `
      <section class="video-scrub-section" id="active-scrub-section" data-section-id="${targetItem.id}" data-department="${targetItem.department}">
        <div class="video-sticky-viewport">
          <!-- Department Video Slots (All pre-buffered for instant 0ms category switching) -->
          <div class="video-media-wrapper" id="video-media-wrapper">
            ${deptItems.map(item => {
              const isActive = (item.id === targetItem.id);
              return `
              <video 
                class="scrub-video ${isActive ? 'active-slot' : 'hidden-slot'}" 
                id="video-slot-${item.id}"
                data-id="${item.id}"
                data-src="${item.videoSrc}"
                playsinline 
                webkit-playsinline 
                muted 
                preload="auto"
                src="${encodeURI(item.videoSrc)}"
              ></video>
            `;
            }).join('')}
            <div class="video-ambient-overlay"></div>
          </div>

          <!-- Minimal Scroll Cue (Hero only) -->
          <div class="minimal-scroll-cue ${this.currentPage === 'home' ? '' : 'hidden-cue'}">
            <span>Scroll to scrub</span>
            <div class="cue-arrow"></div>
          </div>

          <!-- Floating Interactive Plus Button & Expandable Product Pill -->
          <div class="interactive-pill-container ${initialProduct ? 'expanded' : 'hidden-pill'}" id="interactive-pill-container">
            <div class="minimal-add-bag-pill" id="dynamic-product-pill">
              <div class="pill-info" data-action="show-more" data-id="${initialProduct ? initialProduct.id : ''}" style="cursor:pointer;">
                <span class="pill-tag">${initialProduct ? (initialProduct.tag || '') : ''}</span>
                <span class="pill-title">${initialProduct ? initialProduct.title : ''}</span>
                <span class="pill-price">${initialProduct ? `$${initialProduct.price}` : ''}</span>
              </div>
              <button class="btn-pill-show-more" data-action="show-more" data-id="${initialProduct ? initialProduct.id : ''}">
                <i class="fas fa-eye"></i> Show More
              </button>
            </div>

            <button class="btn-pill-toggle" id="btn-pill-toggle" title="Toggle Item Details" aria-label="Toggle Details">
              <i class="fas fa-plus icon-plus"></i>
              <i class="fas fa-times icon-close"></i>
            </button>
          </div>

          <!-- Minimal 3px Bottom Progress Line -->
          <div class="minimal-scrub-progress-track">
            <div class="minimal-scrub-progress-fill"></div>
          </div>
        </div>
      </section>
    `;
  }

  updateActiveSlotAndPill(targetItem) {
    const sectionEl = document.querySelector('.video-scrub-section');
    if (!sectionEl || !targetItem) return;

    sectionEl.dataset.sectionId = targetItem.id;
    sectionEl.dataset.department = targetItem.department;

    // Instant Slot Swap across all videos in this department
    sectionEl.querySelectorAll('.scrub-video').forEach(vid => {
      const isActive = (vid.dataset.id === targetItem.id);
      vid.classList.toggle('active-slot', isActive);
      vid.classList.toggle('hidden-slot', !isActive);
      if (isActive) {
        if (!vid.src || !decodeURI(vid.src).endsWith(vid.dataset.src)) {
          vid.src = encodeURI(vid.dataset.src);
          vid.preload = 'auto';
          try { vid.load(); } catch (e) {}
        }
      } else {
        try { vid.pause(); } catch (e) {}
      }
    });

    // Cue Visibility
    const cueEl = sectionEl.querySelector('.minimal-scroll-cue');
    if (cueEl) {
      cueEl.classList.toggle('hidden-cue', this.currentPage !== 'home');
    }

    // Pill Container Visibility & Data
    const pillContainer = sectionEl.querySelector('.interactive-pill-container');
    const hasProducts = (this.currentPage !== 'home' && targetItem.timelineItems && targetItem.timelineItems.length > 0);
    if (pillContainer) {
      pillContainer.classList.toggle('hidden-pill', !hasProducts);
      if (hasProducts) {
        pillContainer.classList.add('expanded');
        const pill = pillContainer.querySelector('.minimal-add-bag-pill');
        if (pill) pill.classList.remove('collapsed');

        const firstProd = targetItem.timelineItems[0];
        const tagEl = pillContainer.querySelector('.pill-tag');
        const titleEl = pillContainer.querySelector('.pill-title');
        const priceEl = pillContainer.querySelector('.pill-price');
        const btnShowMore = pillContainer.querySelector('.btn-pill-show-more');
        const pillInfo = pillContainer.querySelector('.pill-info');

        if (tagEl) tagEl.textContent = firstProd.tag || '';
        if (titleEl) titleEl.textContent = firstProd.title;
        if (priceEl) priceEl.textContent = `$${firstProd.price}`;
        if (btnShowMore) btnShowMore.dataset.id = firstProd.id;
        if (pillInfo) pillInfo.dataset.id = firstProd.id;
      }
    }
  }

  registerActiveVideo() {
    const sectionEl = document.querySelector('.video-scrub-section');
    if (!sectionEl) return;

    let targetItem = null;
    if (this.currentPage === 'home') {
      targetItem = CATALOG.find(c => c.department === 'Hero');
    } else if (this.currentPage === 'men') {
      targetItem = CATALOG.find(c => c.department === 'Male' && c.subCategory === this.activeSubCategory) || CATALOG.find(c => c.department === 'Male');
    } else if (this.currentPage === 'women') {
      targetItem = CATALOG.find(c => c.department === 'Female' && c.subCategory === this.activeSubCategory) || CATALOG.find(c => c.department === 'Female');
    } else if (this.currentPage === 'kids') {
      targetItem = CATALOG.find(c => c.department === 'Kids' && c.subCategory === this.activeSubCategory) || CATALOG.find(c => c.department === 'Kids');
    }

    if (targetItem && this.videoEngine) {
      const activeVideo = sectionEl.querySelector(`.scrub-video[data-id="${targetItem.id}"]`) || sectionEl.querySelector('.scrub-video.active-slot') || sectionEl.querySelector('.scrub-video');
      if (activeVideo) {
        if (!activeVideo.src || !decodeURI(activeVideo.src).endsWith(targetItem.videoSrc)) {
          activeVideo.src = encodeURI(targetItem.videoSrc);
          activeVideo.preload = 'auto';
          try { activeVideo.load(); } catch (e) {}
        }
      }
      this.videoEngine.registerSection(sectionEl, targetItem, activeVideo);
    }
  }

  // ================= RENDER SUBNAV TABS =================
  renderSubnavTabs() {
    const subnavDock = document.getElementById('subnav-dock');
    if (!subnavDock) return;

    if (this.currentPage === 'home') {
      subnavDock.innerHTML = '';
      return;
    }

    let items = [];
    if (this.currentPage === 'men') {
      items = CATALOG.filter(c => c.department === 'Male');
    } else if (this.currentPage === 'women') {
      items = CATALOG.filter(c => c.department === 'Female');
    } else if (this.currentPage === 'kids') {
      items = CATALOG.filter(c => c.department === 'Kids');
    }

    subnavDock.innerHTML = items.map(c => `
      <button class="subnav-chip ${c.subCategory === this.activeSubCategory ? 'active' : ''}" data-subcategory="${c.subCategory}">
        ${c.navLabel}
      </button>
    `).join('');

    subnavDock.querySelectorAll('.subnav-chip').forEach(btn => {
      btn.onclick = (e) => {
        e.preventDefault();
        const selectedSub = btn.dataset.subcategory;
        if (selectedSub === this.activeSubCategory) return;

        this.switchSubCategory(selectedSub);
      };
    });

    // Auto-scroll active chip into center on mobile
    const activeChip = subnavDock.querySelector('.subnav-chip.active');
    if (activeChip) {
      setTimeout(() => {
        try { activeChip.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' }); } catch (e) {}
      }, 60);
    }
  }

  // ================= SWITCH SUBCATEGORY (0ms INSTANT SLOT SWAP) =================
  switchSubCategory(subCategory) {
    this.activeSubCategory = subCategory;

    const subnavDock = document.getElementById('subnav-dock');
    if (subnavDock) {
      subnavDock.querySelectorAll('.subnav-chip').forEach(b => {
        const isActive = (b.dataset.subcategory === subCategory);
        b.classList.toggle('active', isActive);
        if (isActive) {
          try {
            b.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
          } catch (e) {}
        }
      });
    }

    let targetItem = null;
    if (this.currentPage === 'men') {
      targetItem = CATALOG.find(c => c.department === 'Male' && c.subCategory === subCategory);
    } else if (this.currentPage === 'women') {
      targetItem = CATALOG.find(c => c.department === 'Female' && c.subCategory === subCategory);
    } else if (this.currentPage === 'kids') {
      targetItem = CATALOG.find(c => c.department === 'Kids' && c.subCategory === subCategory);
    }

    this.updateActiveSlotAndPill(targetItem);
    window.scrollTo({ top: 0, behavior: 'instant' });
    this.registerActiveVideo();
    if (this.videoEngine) {
      this.videoEngine.updateScroll();
    }

    const pagePath = this.currentPage === 'home' ? 'index.html' : `${this.currentPage}.html`;
    const newUrl = `${pagePath}?sub=${subCategory}`;
    window.history.replaceState({ page: this.currentPage, sub: subCategory }, '', newUrl);

    this.checkKuchuSpecialEffects();
    this.ui.playAudio('swoosh');
  }

  // ================= KUCHU PUCHU SPECIAL EFFECTS (PETALS & SWEET SONG) =================
  checkKuchuSpecialEffects() {
    const isKuchu = (this.currentPage === 'kids' && this.activeSubCategory === 'plushtoys');

    if (isKuchu) {
      if (this.rosePetals) this.rosePetals.start();
      if (this.kuchuMusic) {
        this.kuchuMusic.playSweetSong();
      }
    } else {
      if (this.rosePetals) this.rosePetals.stop();
      if (this.kuchuMusic) this.kuchuMusic.stop();
    }
  }

  // ================= NAVIGATION BINDINGS =================
  bindNavigation() {
    // Show More Detail Modal Handler
    document.addEventListener('click', (e) => {
      const showMoreBtn = e.target.closest('[data-action="show-more"]');
      if (showMoreBtn) {
        e.preventDefault();
        e.stopPropagation();
        const id = showMoreBtn.dataset.id;
        if (this.detailModal) {
          this.detailModal.open(id);
          this.ui.playAudio('swoosh');
        }
        return;
      }

      // Dynamic Add to Bag Handler
      const addBtn = e.target.closest('[data-action="quick-add"]');
      if (addBtn) {
        e.preventDefault();
        e.stopPropagation();
        const id = addBtn.dataset.id;
        const product = PRODUCTS.find(p => p.id === id);
        if (product) {
          store.addToCart(product);
          this.ui.playAudio('chime');
          this.ui.showToast(`Added <strong>${product.title}</strong> ($${product.price}) to Bag!`, 'success');
          this.ui.openCart();
        }
        return;
      }

      // Plus Button Toggle Handler
      const toggleBtn = e.target.closest('#btn-pill-toggle');
      if (toggleBtn) {
        e.preventDefault();
        e.stopPropagation();
        const container = toggleBtn.closest('.interactive-pill-container');
        if (container) {
          const pill = container.querySelector('.minimal-add-bag-pill');
          const isExpanded = container.classList.toggle('expanded');
          if (pill) {
            pill.classList.toggle('collapsed', !isExpanded);
          }
          this.ui.playAudio('swoosh');
        }
      }
    });

    const btnNavCart = document.getElementById('btn-header-cart');
    if (btnNavCart) {
      btnNavCart.onclick = () => this.ui.openCart();
    }
  }

  // ================= 60FPS HARDWARE-ACCELERATED SCROLL LISTENER =================
  setupScrollListener() {
    let ticking = false;
    const onScrollUpdate = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          if (this.videoEngine) {
            this.videoEngine.updateScroll();
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScrollUpdate, { passive: true });
    window.addEventListener('touchmove', onScrollUpdate, { passive: true });
    window.addEventListener('resize', onScrollUpdate, { passive: true });
    window.addEventListener('orientationchange', onScrollUpdate, { passive: true });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.mhsApp = new MhsApp();
});
