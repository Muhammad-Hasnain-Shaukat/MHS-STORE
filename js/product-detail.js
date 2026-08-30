// =============================================================================
// MHS STORE - LUXURY PRODUCT DETAILING MODAL & DETAIL VIEW ENGINE
// =============================================================================

import { PRODUCTS, CATALOG } from './products.js';
import { store } from './cart.js';

// Smooth Mobile Touch & Pinch-to-Zoom Controller
class TouchZoomController {
  constructor(container, img) {
    this.container = container;
    this.img = img;
    this.scale = 1;
    this.minScale = 1;
    this.maxScale = 3.5;
    this.posX = 0;
    this.posY = 0;
    this.startX = 0;
    this.startY = 0;
    this.initialDistance = 0;
    this.initialScale = 1;
    this.lastTap = 0;
    this.isPanning = false;

    this.bindEvents();
  }

  bindEvents() {
    if (!this.container || !this.img) return;

    // Touch Start
    this.container.addEventListener('touchstart', (e) => {
      const now = Date.now();
      const doubleTapDelay = 300;

      // Handle Double Tap to Zoom Toggle (Smooth 2.2x zoom)
      if (e.touches.length === 1 && (now - this.lastTap < doubleTapDelay)) {
        e.preventDefault();
        if (this.scale > 1.2) {
          this.resetZoom();
        } else {
          this.zoomTo(2.2, e.touches[0].clientX, e.touches[0].clientY);
        }
        this.lastTap = 0;
        return;
      }
      this.lastTap = now;

      if (e.touches.length === 2) {
        // Multi-touch Pinch Zoom
        e.preventDefault();
        this.initialDistance = this.getDistance(e.touches[0], e.touches[1]);
        this.initialScale = this.scale;
      } else if (e.touches.length === 1 && this.scale > 1) {
        // Single-finger Pan when zoomed in
        this.isPanning = true;
        this.startX = e.touches[0].clientX - this.posX;
        this.startY = e.touches[0].clientY - this.posY;
      }
    }, { passive: false });

    // Touch Move
    this.container.addEventListener('touchmove', (e) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const dist = this.getDistance(e.touches[0], e.touches[1]);
        if (this.initialDistance > 0) {
          const newScale = Math.min(this.maxScale, Math.max(this.minScale, this.initialScale * (dist / this.initialDistance)));
          this.scale = newScale;
          this.applyTransform();
        }
      } else if (e.touches.length === 1 && this.scale > 1 && this.isPanning) {
        e.preventDefault();
        this.posX = e.touches[0].clientX - this.startX;
        this.posY = e.touches[0].clientY - this.startY;
        this.applyTransform();
      }
    }, { passive: false });

    // Touch End
    this.container.addEventListener('touchend', (e) => {
      if (e.touches.length < 2) {
        this.initialDistance = 0;
      }
      if (e.touches.length === 0) {
        this.isPanning = false;
        if (this.scale <= 1.05) {
          this.resetZoom();
        }
      }
    }, { passive: true });
  }

  getDistance(t1, t2) {
    const dx = t1.clientX - t2.clientX;
    const dy = t1.clientY - t2.clientY;
    return Math.hypot(dx, dy);
  }

  zoomTo(targetScale, clientX, clientY) {
    this.scale = targetScale;
    if (targetScale <= 1) {
      this.posX = 0;
      this.posY = 0;
    } else {
      const rect = this.container.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      this.posX = (cx - clientX) * 0.6;
      this.posY = (cy - clientY) * 0.6;
    }
    this.applyTransform(true);
  }

  resetZoom() {
    this.scale = 1;
    this.posX = 0;
    this.posY = 0;
    this.applyTransform(true);
  }

  applyTransform(animate = false) {
    if (!this.img) return;
    this.img.style.transition = animate ? 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)' : 'none';
    this.img.style.transform = `translate(${this.posX}px, ${this.posY}px) scale(${this.scale})`;
  }
}

export class ProductDetailModal {
  constructor(cartInstance) {
    this.cart = cartInstance || store;
    this.activeProduct = null;
    this.activeCatalogSection = null;
    this.currentQuantity = 1;
    this.isFullscreenOpen = false;
    this.stageZoomCtrl = null;
    this.fsZoomCtrl = null;
    this.initModalDOM();
    this.initFullscreenDOM();
    this.bindGlobalEvents();
  }

  initModalDOM() {
    let backdrop = document.getElementById('product-detail-modal-backdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.id = 'product-detail-modal-backdrop';
      backdrop.className = 'product-detail-modal-backdrop';
      backdrop.innerHTML = `
        <div class="product-detail-modal-card" id="product-detail-modal-card">
          <button class="btn-detail-close" id="btn-detail-close" aria-label="Close Product Details">
            <i class="fas fa-times"></i>
          </button>

          <!-- Left Column: Detailed Photo View Stage -->
          <div class="detail-gallery-column" id="detail-gallery-column">
            <div class="detail-main-photo-stage" id="detail-main-photo-stage">
              <!-- Dynamically populated with single detailed image or empty space -->
            </div>
          </div>

          <!-- Right Column: Craftsmanship & Shopping Console -->
          <div class="detail-info-column">
            <div>
              <div class="detail-header-group">
                <span class="detail-brand-badge" id="detail-brand-badge">MHS HAUTE ATELIER</span>
                <h2 class="detail-product-title" id="detail-product-title">Product Title</h2>
                <div class="detail-meta-row">
                  <span class="detail-tag-pill" id="detail-tag-pill">Signature Edition</span>
                  <span class="detail-price" id="detail-price">$0</span>
                </div>
              </div>

              <!-- Narrative Craftsmanship Description -->
              <div class="detail-description-box">
                <div class="detail-description-title">The Story & Craftsmanship</div>
                <div class="detail-description-text" id="detail-description-text">
                  Handcrafted with meticulous precision and heritage techniques.
                </div>
              </div>

              <!-- Technical Specifications -->
              <div class="detail-specs-grid" id="detail-specs-grid">
                <!-- Dynamically populated specs -->
              </div>

              <!-- Luxury Guarantees Strip -->
              <div class="detail-guarantees-strip">
                <span><i class="fas fa-certificate"></i> Certified Authentic</span>
                <span><i class="fas fa-box-open"></i> Signature Gold Box</span>
                <span><i class="fas fa-shield-alt"></i> 5-Year Global Warranty</span>
              </div>
            </div>

            <!-- Shopping CTA Console -->
            <div class="detail-purchase-console">
              <div class="detail-actions-row">
                <div class="detail-quantity-stepper">
                  <button class="btn-qty-step" id="btn-qty-minus"><i class="fas fa-minus"></i></button>
                  <span class="qty-val-display" id="detail-qty-display">1</span>
                  <button class="btn-qty-step" id="btn-qty-plus"><i class="fas fa-plus"></i></button>
                </div>
                <button class="btn-detail-add-bag" id="btn-detail-add-bag">
                  <i class="fas fa-shopping-bag"></i> Add to Bag — <span id="detail-btn-price">$0</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(backdrop);
    }

    this.backdrop = backdrop;
    this.card = document.getElementById('product-detail-modal-card');
    this.photoStage = document.getElementById('detail-main-photo-stage');
    this.titleEl = document.getElementById('detail-product-title');
    this.brandBadgeEl = document.getElementById('detail-brand-badge');
    this.tagEl = document.getElementById('detail-tag-pill');
    this.priceEl = document.getElementById('detail-price');
    this.descEl = document.getElementById('detail-description-text');
    this.specsGrid = document.getElementById('detail-specs-grid');
    this.qtyDisplay = document.getElementById('detail-qty-display');
    this.btnAddBag = document.getElementById('btn-detail-add-bag');
    this.btnPrice = document.getElementById('detail-btn-price');
  }

  initFullscreenDOM() {
    let fsModal = document.getElementById('mhs-photo-fullscreen-modal');
    if (!fsModal) {
      fsModal = document.createElement('div');
      fsModal.id = 'mhs-photo-fullscreen-modal';
      fsModal.className = 'mhs-photo-fullscreen-modal';
      fsModal.innerHTML = `
        <div class="fs-top-bar">
          <div class="fs-info-group">
            <span class="fs-brand-tag">MHS HAUTE ATELIER</span>
            <span class="fs-title-text" id="fs-title-text">Product Title</span>
          </div>
          <div class="fs-hint-text">
            <i class="fas fa-mouse-pointer"></i> Double-click or press ESC to exit full screen
          </div>
          <button class="btn-fs-close" id="btn-fs-close" aria-label="Exit Fullscreen">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="fs-image-wrapper" id="fs-image-wrapper">
          <img id="fs-main-img" class="fs-main-image" src="" alt="MHS Fullscreen Detailed View" />
        </div>
      `;
      document.body.appendChild(fsModal);
    }

    this.fsModal = fsModal;
    this.fsImg = document.getElementById('fs-main-img');
    this.fsTitleText = document.getElementById('fs-title-text');
    this.fsCloseBtn = document.getElementById('btn-fs-close');
    this.fsWrapper = document.getElementById('fs-image-wrapper');

    if (this.fsWrapper && this.fsImg) {
      this.fsZoomCtrl = new TouchZoomController(this.fsWrapper, this.fsImg);
    }
  }

  bindGlobalEvents() {
    // Close detail modal button
    document.getElementById('btn-detail-close').addEventListener('click', () => this.close());

    // Detail modal Backdrop click
    this.backdrop.addEventListener('click', (e) => {
      if (e.target === this.backdrop) this.close();
    });

    // Fullscreen close button & backdrop click
    if (this.fsCloseBtn) {
      this.fsCloseBtn.addEventListener('click', () => this.closeFullscreen());
    }

    if (this.fsModal) {
      this.fsModal.addEventListener('click', (e) => {
        if (e.target === this.fsModal || e.target === this.fsWrapper) {
          this.closeFullscreen();
        }
      });
    }

    // Double-click on desktop to enter fullscreen
    if (this.photoStage) {
      this.photoStage.addEventListener('dblclick', (e) => {
        if (window.innerWidth > 768 && this.activeProduct && this.activeProduct.image && this.activeProduct.image.trim() !== '') {
          e.preventDefault();
          this.openFullscreen();
        }
      });
    }

    // Double-click on desktop fullscreen image to exit
    if (this.fsImg) {
      this.fsImg.addEventListener('dblclick', (e) => {
        if (window.innerWidth > 768) {
          e.preventDefault();
          this.closeFullscreen();
        }
      });
    }

    // Escape key listener for both modal and fullscreen
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (this.isFullscreenOpen) {
          e.stopPropagation();
          this.closeFullscreen();
        } else if (this.backdrop.classList.contains('active')) {
          this.close();
        }
      }
    });

    // Browser fullscreenchange event listener to keep state in sync
    document.addEventListener('fullscreenchange', () => {
      if (!document.fullscreenElement && this.isFullscreenOpen) {
        this.closeFullscreen();
      }
    });

    // Quantity buttons
    document.getElementById('btn-qty-minus').addEventListener('click', () => {
      if (this.currentQuantity > 1) {
        this.currentQuantity--;
        this.updateQuantityDisplay();
      }
    });

    document.getElementById('btn-qty-plus').addEventListener('click', () => {
      if (this.currentQuantity < 10) {
        this.currentQuantity++;
        this.updateQuantityDisplay();
      }
    });

    // Add to Bag action
    this.btnAddBag.addEventListener('click', () => {
      if (!this.activeProduct) return;
      const targetStore = this.cart || store || window.MHS_CART;
      if (targetStore && targetStore.addToCart) {
        targetStore.addToCart(this.activeProduct, null, null, this.currentQuantity);
      }
      this.animateAddSuccess();
    });
  }

  openFullscreen() {
    if (!this.activeProduct || !this.activeProduct.image) return;

    this.isFullscreenOpen = true;
    this.fsImg.src = encodeURI(this.activeProduct.image);
    if (this.fsTitleText) {
      this.fsTitleText.textContent = this.activeProduct.title;
    }

    if (this.fsZoomCtrl) {
      this.fsZoomCtrl.resetZoom();
    }

    this.fsModal.classList.add('active');

    // Request native browser fullscreen if supported on desktop
    try {
      if (window.innerWidth > 768) {
        if (this.fsModal.requestFullscreen) {
          this.fsModal.requestFullscreen().catch(() => {});
        } else if (this.fsModal.webkitRequestFullscreen) {
          this.fsModal.webkitRequestFullscreen().catch(() => {});
        }
      }
    } catch (err) {}
  }

  closeFullscreen() {
    this.isFullscreenOpen = false;
    if (this.fsModal) {
      this.fsModal.classList.remove('active');
    }
    if (this.fsZoomCtrl) {
      this.fsZoomCtrl.resetZoom();
    }

    // Exit native browser fullscreen if active
    try {
      if (document.fullscreenElement || document.webkitFullscreenElement) {
        if (document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen().catch(() => {});
        }
      }
    } catch (err) {}
  }

  updateQuantityDisplay() {
    if (this.qtyDisplay) this.qtyDisplay.textContent = this.currentQuantity;
    if (this.btnPrice && this.activeProduct) {
      this.btnPrice.textContent = `$${this.activeProduct.price * this.currentQuantity}`;
    }
  }

  animateAddSuccess() {
    const originalText = this.btnAddBag.innerHTML;
    this.btnAddBag.innerHTML = '<i class="fas fa-check-circle"></i> Added to Bag!';
    this.btnAddBag.style.background = '#28a745';
    this.btnAddBag.style.color = '#FFFFFF';

    setTimeout(() => {
      this.btnAddBag.innerHTML = originalText;
      this.btnAddBag.style.background = '';
      this.btnAddBag.style.color = '';
      this.close();

      // Open Cart Drawer so the user immediately sees the items
      const btnCart = document.getElementById('btn-header-cart');
      if (btnCart) {
        btnCart.click();
      }
    }, 700);
  }

  open(productId) {
    const product = PRODUCTS.find(p => p.id === productId);
    if (!product) return;

    this.activeProduct = product;
    this.activeCatalogSection = CATALOG.find(c => c.id === product.videoRefId);
    this.currentQuantity = 1;
    this.updateQuantityDisplay();

    // Populate Headers & Meta
    if (this.titleEl) this.titleEl.textContent = product.title;
    if (this.tagEl) this.tagEl.textContent = product.tag || 'Exclusive Edition';
    if (this.priceEl) this.priceEl.textContent = `$${product.price}`;
    if (this.btnPrice) this.btnPrice.textContent = `$${product.price}`;

    // Brand Badge context
    if (this.brandBadgeEl) {
      if (product.department === 'Male') this.brandBadgeEl.textContent = 'MHS SARTORIAL & HORLOGERIE';
      else if (product.department === 'Female') this.brandBadgeEl.textContent = 'MHS HAUTE COUTURE ATELIER';
      else this.brandBadgeEl.textContent = 'MHS KIDS & WONDERLAND';
    }

    // Story & Description
    if (this.descEl) {
      this.descEl.textContent = product.description || this.generateDefaultDescription(product);
    }

    // Specifications Grid
    this.renderSpecifications(product);

    // Render Single Given Detailed Image or Empty Space
    this.renderProductMedia(product);

    // Reveal Modal
    this.backdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  renderProductMedia(product) {
    if (!this.photoStage) return;

    if (product.image && product.image.trim() !== '') {
      // Single Detailed Image given by the user
      const encodedSrc = encodeURI(product.image);
      this.photoStage.innerHTML = `
        <span class="photo-angle-badge" id="photo-angle-badge">
          <i class="fas fa-search-plus"></i> <span id="angle-badge-text">ATELIER DETAIL VIEW</span>
        </span>
        <div class="photo-hint-badge">
          <i class="fas fa-expand"></i> Double click for Full Screen
        </div>
        <img id="detail-main-img" class="detail-main-photo" src="${encodedSrc}" alt="${product.title}" />
      `;

      const detailImg = document.getElementById('detail-main-img');
      if (detailImg) {
        this.stageZoomCtrl = new TouchZoomController(this.photoStage, detailImg);
      }
    } else {
      // Empty Space for Women and Kids (to be added later)
      this.photoStage.innerHTML = `
        <div class="detail-empty-image-space">
          <div class="empty-space-icon"><i class="fas fa-image"></i></div>
          <span class="empty-space-title">Detailed View Space</span>
          <span class="empty-space-sub">Image to be added</span>
        </div>
      `;
    }
  }

  close() {
    this.closeFullscreen();
    if (this.stageZoomCtrl) {
      this.stageZoomCtrl.resetZoom();
    }
    this.backdrop.classList.remove('active');
    document.body.style.overflow = '';
  }

  renderSpecifications(product) {
    if (!this.specsGrid) return;
    const specs = product.specs || this.generateDefaultSpecs(product);

    let html = '';
    for (const [key, value] of Object.entries(specs)) {
      html += `
        <div class="detail-spec-item">
          <span class="detail-spec-label">${key}</span>
          <span class="detail-spec-val">${value}</span>
        </div>
      `;
    }
    this.specsGrid.innerHTML = html;
  }

  generateDefaultDescription(product) {
    if (product.department === 'Male') {
      return `Exclusively engineered for the MHS Gentleman Collection. This masterpiece exemplifies pinnacle European craftsmanship, uniting hand-finished materials with timeless architectural silhouettes.`;
    } else if (product.department === 'Female') {
      return `Crafted with poetic elegance and sublime artisan techniques. Features intricate bespoke hand-embroidery, curated premium fabrics, and royal heritage aesthetics.`;
    } else {
      return `Crafted with child-safe hypoallergenic luxury materials. Designed for playful delight, enduring quality, and enchanting childhood memories.`;
    }
  }

  generateDefaultSpecs(product) {
    if (product.department === 'Male') {
      return {
        'Craftsmanship': 'Master Tailored & Hand-Inspected',
        'Material': product.tag || 'Luxury Grade 100% Authentic',
        'Origin': 'Florence & Geneva Atelier',
        'Care': 'Specialist Care & Protection Included'
      };
    } else if (product.department === 'Female') {
      return {
        'Artisanship': '200+ Hours Handcrafted Embroidery',
        'Fabric': product.tag || 'Pure Silk & Tissue Weave',
        'Fit': 'Bespoke Flattering Silhouette',
        'Packaging': 'Signature Gold Dust Cover'
      };
    } else {
      return {
        'Safety': '100% Non-Toxic & Hypoallergenic',
        'Material': product.tag || 'Ultra-Soft Premium Fiber',
        'Age Suitability': 'All Ages & Certified Safe',
        'Guarantee': 'Tested for Maximum Comfort'
      };
    }
  }
}
