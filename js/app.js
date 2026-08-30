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

    // 1. Determine initial subcategory for department pages
    this.initActiveSubCategory();

    // 2. Render ONLY the single active animation section
    this.renderActiveSection();

    // 3. Render Sub-Category Nav Tabs
    this.renderSubnavTabs();

    // 4. Initialize Video Scrubbing Engine
    this.videoEngine = new VideoScrubEngine();
    this.registerActiveVideo();

    // 5. Setup Navigation & Scroll Listeners
    this.bindNavigation();
    this.setupScrollListener();

    // 6. Check Kuchu Puchu Special effects (Rose petals + sweet rhyme)
    this.checkKuchuSpecialEffects();

    // 7. Initial badge update
    this.ui.updateBadges();

    console.log(`✨ MHS STORE [${this.currentPage.toUpperCase()}] loaded in Single-Animation Focus Mode.`);
  }

  // ================= ACTIVE SUBCATEGORY RESOLVER =================
  initActiveSubCategory() {
    const urlParams = new URLSearchParams(window.location.search);
    const subParam = urlParams.get('sub');

    if (this.currentPage === 'men') {
      this.activeSubCategory = subParam || 'watches';
    } else if (this.currentPage === 'women') {
      this.activeSubCategory = subParam || 'wedding';
    } else if (this.currentPage === 'kids') {
      this.activeSubCategory = subParam || 'babyfootwear';
    } else {
      this.activeSubCategory = 'title';
    }
  }

  // ================= RENDER ACTIVE SECTION (ONLY 1 MOUNTS IN DOM) =================
  renderActiveSection() {
    const container = document.getElementById('video-sections-container');
    if (!container) return;

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

    if (!targetItem) return;

    // Only render Add to Bag pill on department category pages (not on homepage)
    const initialProduct = (this.currentPage !== 'home' && targetItem.timelineItems && targetItem.timelineItems.length) 
      ? targetItem.timelineItems[0] 
      : null;

    container.innerHTML = `
      <section class="video-scrub-section" id="${targetItem.id}" data-section-id="${targetItem.id}" data-department="${targetItem.department}">
        <div class="video-sticky-viewport">
          <!-- Pristine Fullscreen Video -->
          <div class="video-media-wrapper">
            <video 
              class="scrub-video" 
              playsinline 
              webkit-playsinline 
              muted 
              preload="auto"
            ></video>
          </div>

          <!-- Minimal Scroll Cue (Hero only) -->
          ${this.currentPage === 'home' ? `
            <div class="minimal-scroll-cue">
              <span>Scroll to scrub</span>
              <div class="cue-arrow"></div>
            </div>
          ` : ''}

          <!-- Floating Interactive Plus Button & Expandable Product Pill (Hidden at first) -->
          ${initialProduct ? `
            <div class="interactive-pill-container" id="interactive-pill-container">
              <!-- Expandable Pill (Collapsed by default) -->
              <div class="minimal-add-bag-pill collapsed" id="dynamic-product-pill">
                <div class="pill-info" data-action="show-more" data-id="${initialProduct.id}" style="cursor:pointer;">
                  <span class="pill-tag">${initialProduct.tag || ''}</span>
                  <span class="pill-title">${initialProduct.title}</span>
                  <span class="pill-price">$${initialProduct.price}</span>
                </div>
                <button class="btn-pill-show-more" data-action="show-more" data-id="${initialProduct.id}">
                  <i class="fas fa-eye"></i> Show More
                </button>
              </div>

              <!-- Floating Luxury Plus Toggle Button -->
              <button class="btn-pill-toggle" id="btn-pill-toggle" title="View Item Details" aria-label="Toggle Details">
                <i class="fas fa-plus icon-plus"></i>
                <i class="fas fa-times icon-close"></i>
              </button>
            </div>
          ` : ''}

          <!-- Minimal 3px Bottom Progress Line -->
          <div class="minimal-scrub-progress-track">
            <div class="minimal-scrub-progress-fill"></div>
          </div>
        </div>
      </section>
    `;
  }

  registerActiveVideo() {
    const sectionEl = document.querySelector('.video-scrub-section');
    if (!sectionEl) return;

    const id = sectionEl.dataset.sectionId;
    const meta = CATALOG.find(c => c.id === id);
    if (meta && this.videoEngine) {
      this.videoEngine.registerSection(sectionEl, meta);
    }
  }

  // ================= RENDER SUBNAV TABS =================
  renderSubnavTabs() {
    const subnavDock = document.getElementById('subnav-dock');
    if (!subnavDock || this.currentPage === 'home') return;

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
  }

  // ================= SWITCH SUBCATEGORY (ONLY THAT ANIMATION MOUNTS) =================
  switchSubCategory(subCategory) {
    this.activeSubCategory = subCategory;

    const subnavDock = document.getElementById('subnav-dock');
    if (subnavDock) {
      subnavDock.querySelectorAll('.subnav-chip').forEach(b => {
        b.classList.toggle('active', b.dataset.subcategory === subCategory);
      });
    }

    if (this.videoEngine) {
      this.videoEngine.destroy();
      this.videoEngine = new VideoScrubEngine();
    }

    window.scrollTo({ top: 0, behavior: 'instant' });
    this.renderActiveSection();
    this.registerActiveVideo();

    const newUrl = `${window.location.pathname}?sub=${subCategory}`;
    window.history.replaceState({ sub: subCategory }, '', newUrl);

    // Trigger Kuchu Puchu Special effects (Rose petals + sweet rhyme)
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

  // ================= SCROLL LISTENER =================
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
