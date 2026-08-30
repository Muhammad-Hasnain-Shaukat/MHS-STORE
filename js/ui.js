// MHS STORE - Comprehensive E-Commerce UI Controller
import { store } from './cart.js';
import { auth } from './auth.js';
import { PRODUCTS, CATALOG } from './products.js';

export class UIController {
  constructor() {
    this.activeQuickViewProduct = null;
    this.selectedSize = null;
    this.selectedColor = null;
    this.selectedQuantity = 1;
    this.audioCtx = null;
    this.soundEnabled = true;
    this.returnToCheckoutAfterAuth = false;

    this.initElements();
    this.bindEvents();
    this.initAudioContext();
    this.updateBadges();
  }

  initElements() {
    // Badges & Counters
    this.cartCountBadges = document.querySelectorAll('.cart-count-badge');
    this.wishlistCountBadges = document.querySelectorAll('.wishlist-count-badge');
    this.cartTotalDisplays = document.querySelectorAll('.cart-header-total');

    // Account & User Displays
    this.accountButtons = document.querySelectorAll('#btn-header-account');
    this.userNameDisplays = document.querySelectorAll('#header-user-name');

    // Drawers
    this.cartDrawer = document.getElementById('cart-drawer');
    this.wishlistDrawer = document.getElementById('wishlist-drawer');
    this.searchDrawer = document.getElementById('search-drawer');
    this.drawerOverlay = document.getElementById('drawer-backdrop');

    // Modals
    this.authModal = document.getElementById('auth-modal');
    this.quickViewModal = document.getElementById('quickview-modal');
    this.checkoutModal = document.getElementById('checkout-modal');
    this.modalBackdrop = document.getElementById('modal-backdrop');

    // Toasts & Flying Cart Particle Layer
    this.toastContainer = document.getElementById('toast-container');
    this.flyParticleLayer = document.getElementById('fly-particle-layer');
  }

  bindEvents() {
    // Store updates
    window.addEventListener('cart-updated', (e) => {
      this.renderCart(e.detail.cart, e.detail.summary);
      this.updateBadges();
    });

    window.addEventListener('wishlist-updated', (e) => {
      this.renderWishlist(e.detail.wishlist);
      this.updateBadges();
    });

    // Auth updates
    window.addEventListener('auth-state-changed', (e) => {
      this.updateBadges();
    });

    // Custom Open Quickview
    window.addEventListener('open-quickview', (e) => {
      if (e.detail && e.detail.productId) {
        this.openQuickView(e.detail.productId);
      }
    });

    // Direct Quick Add To Bag Custom Event
    window.addEventListener('quick-add-to-cart', (e) => {
      if (e.detail && e.detail.productId) {
        this.quickAddToCart(e.detail.productId, e.detail.btnElement);
      }
    });

    // Header Drawer Triggers
    const btnCart = document.getElementById('btn-header-cart');
    if (btnCart) btnCart.addEventListener('click', () => this.openCart());

    const btnWishlist = document.getElementById('btn-header-wishlist');
    if (btnWishlist) btnWishlist.addEventListener('click', () => this.openWishlist());

    const btnSearch = document.getElementById('btn-header-search');
    if (btnSearch) btnSearch.addEventListener('click', () => this.openSearch());

    // Backdrop clicks
    if (this.drawerOverlay) {
      this.drawerOverlay.addEventListener('click', () => this.closeAllDrawers());
    }

    if (this.modalBackdrop) {
      this.modalBackdrop.addEventListener('click', () => this.closeAllModals());
    }

    // Escape Key to Close All
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeAllDrawers();
        this.closeAllModals();
      }
    });

    // Global Header & Auth Click Delegation
    document.addEventListener('click', (e) => {
      const accountBtn = e.target.closest('#btn-header-account');
      if (accountBtn) {
        e.preventDefault();
        this.openAuthModal();
        return;
      }

      const tabBtn = e.target.closest('.auth-tab-btn');
      if (tabBtn) {
        const targetTab = tabBtn.dataset.tab;
        const modal = this.authModal;
        if (modal) {
          modal.querySelectorAll('.auth-tab-btn').forEach(b => b.classList.remove('active'));
          tabBtn.classList.add('active');
          const loginForm = modal.querySelector('#login-form');
          const regForm = modal.querySelector('#register-form');
          if (loginForm && regForm) {
            loginForm.style.display = targetTab === 'login' ? 'flex' : 'none';
            regForm.style.display = targetTab === 'register' ? 'flex' : 'none';
          }
          const errBox = modal.querySelector('#auth-error-msg');
          if (errBox) errBox.style.display = 'none';
        }
        return;
      }

      const switchLink = e.target.closest('[data-switch-auth]');
      if (switchLink) {
        e.preventDefault();
        const target = switchLink.dataset.switchAuth;
        const tab = this.authModal?.querySelector(`.auth-tab-btn[data-tab="${target}"]`);
        if (tab) tab.click();
        return;
      }

      const logoutBtn = e.target.closest('#btn-auth-logout');
      if (logoutBtn) {
        e.preventDefault();
        auth.logout();
        this.playAudio('swoosh');
        this.showToast('You have signed out of your account.', 'info');
        this.closeAllModals();
        return;
      }
    });

    // Search input typing
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.renderSearchResults(e.target.value);
      });
    }

    // Coupon Form Handler
    document.addEventListener('submit', (e) => {
      if (e.target && e.target.id === 'coupon-form') {
        e.preventDefault();
        const input = e.target.querySelector('input[name="coupon"]');
        if (input && input.value.trim()) {
          const res = store.applyCoupon(input.value.trim());
          if (res.success) {
            this.showToast(`Promo Applied: ${res.coupon.description}`, 'success');
            this.playAudio('chime');
          } else {
            this.showToast(res.message, 'warning');
          }
          input.value = '';
        }
      } else if (e.target && e.target.id === 'login-form') {
        e.preventDefault();
        this.handleLoginSubmit(e.target);
      } else if (e.target && e.target.id === 'register-form') {
        e.preventDefault();
        this.handleRegisterSubmit(e.target);
      } else if (e.target && e.target.id === 'checkout-form') {
        e.preventDefault();
        this.processCheckout(e.target);
      }
    });

    // Global sound toggle
    const soundBtn = document.getElementById('sound-toggle-btn');
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        this.soundEnabled = !this.soundEnabled;
        soundBtn.classList.toggle('muted', !this.soundEnabled);
        soundBtn.innerHTML = this.soundEnabled 
          ? '<i class="fas fa-volume-up"></i>' 
          : '<i class="fas fa-volume-mute"></i>';
        this.showToast(this.soundEnabled ? 'Audio Effects Enabled' : 'Audio Effects Muted', 'info');
      });
    }
  }

  // ================= AUDIO FX (Web Audio API Synth) =================
  initAudioContext() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    } catch (e) {
      console.log('Web Audio not supported', e);
    }
  }

  playAudio(type = 'click') {
    if (!this.soundEnabled || !this.audioCtx) return;
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }

    try {
      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      if (type === 'click') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.05);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
      } else if (type === 'chime') {
        // Luxury two-tone chime
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
        osc.frequency.setValueAtTime(783.99, now + 0.16); // G5
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      } else if (type === 'swoosh') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(600, now + 0.12);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
      }
    } catch (e) {
      // ignore
    }
  }

  // ================= BADGES & COUNTERS =================
  updateBadges() {
    const summary = store.getCartSummary();
    this.cartCountBadges.forEach(badge => {
      badge.textContent = summary.count;
      badge.classList.toggle('has-items', summary.count > 0);
    });

    this.cartTotalDisplays.forEach(total => {
      total.textContent = `$${summary.subtotal.toFixed(2)}`;
    });

    const wishlistCount = store.wishlist.length;
    this.wishlistCountBadges.forEach(badge => {
      badge.textContent = wishlistCount;
      badge.classList.toggle('has-items', wishlistCount > 0);
    });

    // Update Header Account Button & Name
    const user = auth.getCurrentUser();
    this.userNameDisplays.forEach(el => {
      el.textContent = user ? (user.firstName || user.name.split(' ')[0]) : 'Sign In';
    });
    this.accountButtons.forEach(btn => {
      btn.title = user ? `VIP Member: ${user.name}` : 'Sign In / Register';
    });
  }

  // ================= DRAWERS & MODALS =================
  openCart() {
    this.playAudio('swoosh');
    this.closeAllDrawers();
    if (this.cartDrawer) {
      this.cartDrawer.classList.add('open');
      this.drawerOverlay.classList.add('active');
    }
    this.renderCart(store.cart, store.getCartSummary());
  }

  openWishlist() {
    this.playAudio('swoosh');
    this.closeAllDrawers();
    if (this.wishlistDrawer) {
      this.wishlistDrawer.classList.add('open');
      this.drawerOverlay.classList.add('active');
    }
    this.renderWishlist(store.wishlist);
  }

  openSearch() {
    this.playAudio('swoosh');
    this.closeAllDrawers();
    if (this.searchDrawer) {
      this.searchDrawer.classList.add('open');
      this.drawerOverlay.classList.add('active');
      const input = this.searchDrawer.querySelector('#search-input');
      if (input) {
        setTimeout(() => input.focus(), 150);
      }
    }
    this.renderSearchResults('');
  }

  closeAllDrawers() {
    if (this.cartDrawer) this.cartDrawer.classList.remove('open');
    if (this.wishlistDrawer) this.wishlistDrawer.classList.remove('open');
    if (this.searchDrawer) this.searchDrawer.classList.remove('open');
    if (this.drawerOverlay) this.drawerOverlay.classList.remove('active');
  }

  closeAllModals() {
    if (this.authModal) this.authModal.classList.remove('open');
    if (this.quickViewModal) this.quickViewModal.classList.remove('open');
    if (this.checkoutModal) this.checkoutModal.classList.remove('open');
    if (this.modalBackdrop) this.modalBackdrop.classList.remove('active');
  }

  // ================= CART RENDERING =================
  renderCart(cartItems, summary) {
    const listEl = document.getElementById('cart-items-list');
    const emptyEl = document.getElementById('cart-empty-state');
    const footerEl = document.getElementById('cart-drawer-footer');
    const progressFill = document.getElementById('free-shipping-progress-fill');
    const shippingMsg = document.getElementById('free-shipping-msg');

    if (!listEl) return;

    // Free Shipping Progress
    if (progressFill && shippingMsg) {
      progressFill.style.width = `${summary.freeShippingProgress}%`;
      if (summary.freeShipping) {
        shippingMsg.innerHTML = '<i class="fas fa-check-circle text-emerald"></i> You unlocked <strong>Complimentary Express Shipping!</strong>';
      } else {
        shippingMsg.innerHTML = `Add <strong>$${summary.neededForFreeShipping.toFixed(2)}</strong> more for Free Global Shipping!`;
      }
    }

    if (cartItems.length === 0) {
      listEl.innerHTML = '';
      if (emptyEl) emptyEl.style.display = 'flex';
      if (footerEl) footerEl.style.display = 'none';
      return;
    }

    if (emptyEl) emptyEl.style.display = 'none';
    if (footerEl) footerEl.style.display = 'block';

    listEl.innerHTML = cartItems.map(item => `
      <div class="cart-item-card" data-item-key="${item.itemKey}">
        <div class="cart-item-img-wrap">
          ${item.image ? `<img src="${encodeURI(item.image)}" alt="${item.title}" loading="lazy" />` : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,0.05);color:#D4AF37;font-size:1.1rem;"><i class="fas fa-gem"></i></div>`}
        </div>
        <div class="cart-item-details">
          <div class="cart-item-head">
            <span class="cart-item-dept">${item.department} &bull; ${item.category}</span>
            <h4 class="cart-item-title">${item.title}</h4>
          </div>
          <div class="cart-item-meta">
            <span class="meta-pill"><i class="fas fa-ruler"></i> ${item.size}</span>
            <span class="meta-pill"><i class="fas fa-palette"></i> ${item.color}</span>
          </div>
          <div class="cart-item-price-row">
            <div class="cart-item-price">
              <span class="price-val">$${item.price}</span>
              ${item.originalPrice > item.price ? `<span class="price-old">$${item.originalPrice}</span>` : ''}
            </div>
            <div class="cart-qty-stepper">
              <button class="btn-qty btn-qty-minus" data-action="minus" data-key="${item.itemKey}"><i class="fas fa-minus"></i></button>
              <span class="qty-num">${item.quantity}</span>
              <button class="btn-qty btn-qty-plus" data-action="plus" data-key="${item.itemKey}"><i class="fas fa-plus"></i></button>
            </div>
          </div>
        </div>
        <button class="btn-cart-remove" data-action="remove" data-key="${item.itemKey}" title="Remove Item">
          <i class="fas fa-trash-alt"></i>
        </button>
      </div>
    `).join('');

    // Update Totals
    const subtotalEl = document.getElementById('cart-subtotal-val');
    const discountRow = document.getElementById('cart-discount-row');
    const discountVal = document.getElementById('cart-discount-val');
    const shippingEl = document.getElementById('cart-shipping-val');
    const taxEl = document.getElementById('cart-tax-val');
    const totalEl = document.getElementById('cart-total-val');

    if (subtotalEl) subtotalEl.textContent = `$${summary.subtotal.toFixed(2)}`;
    if (discountRow && discountVal) {
      if (summary.discountAmount > 0) {
        discountRow.style.display = 'flex';
        discountVal.textContent = `-$${summary.discountAmount.toFixed(2)} (${summary.activeCoupon.code})`;
      } else {
        discountRow.style.display = 'none';
      }
    }
    if (shippingEl) shippingEl.textContent = summary.shipping === 0 ? 'FREE' : `$${summary.shipping.toFixed(2)}`;
    if (taxEl) taxEl.textContent = `$${summary.tax.toFixed(2)}`;
    if (totalEl) totalEl.textContent = `$${summary.total.toFixed(2)}`;

    // Quantity & Remove handlers
    listEl.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const action = btn.dataset.action;
        const key = btn.dataset.key;
        const item = store.cart.find(i => i.itemKey === key);
        if (!item) return;

        if (action === 'plus') {
          store.updateQuantity(key, item.quantity + 1);
          this.playAudio('click');
        } else if (action === 'minus') {
          store.updateQuantity(key, item.quantity - 1);
          this.playAudio('click');
        } else if (action === 'remove') {
          store.removeFromCart(key);
          this.playAudio('click');
          this.showToast('Item removed from Bag', 'info');
        }
      });
    });

    // Checkout Trigger
    const btnCheckout = document.getElementById('btn-cart-checkout');
    if (btnCheckout) {
      btnCheckout.onclick = () => {
        this.closeAllDrawers();
        this.openCheckout();
      };
    }
  }

  // ================= WISHLIST RENDERING =================
  renderWishlist(wishlistItems) {
    const listEl = document.getElementById('wishlist-items-list');
    const emptyEl = document.getElementById('wishlist-empty-state');
    if (!listEl) return;

    if (wishlistItems.length === 0) {
      listEl.innerHTML = '';
      if (emptyEl) emptyEl.style.display = 'flex';
      return;
    }

    if (emptyEl) emptyEl.style.display = 'none';

    listEl.innerHTML = wishlistItems.map(item => `
      <div class="wishlist-item-card" data-product-id="${item.id}">
        <div class="wishlist-item-img-wrap">
          ${item.image ? `<img src="${encodeURI(item.image)}" alt="${item.title}" loading="lazy" />` : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,0.05);color:#D4AF37;font-size:1.1rem;"><i class="fas fa-gem"></i></div>`}
        </div>
        <div class="wishlist-item-details">
          <span class="wishlist-item-dept">${item.department} &bull; ${item.category}</span>
          <h4 class="wishlist-item-title">${item.title}</h4>
          <div class="wishlist-item-price">
            <span class="price-val">$${item.price}</span>
            ${item.originalPrice ? `<span class="price-old">$${item.originalPrice}</span>` : ''}
          </div>
          <div class="wishlist-item-actions">
            <button class="btn-move-to-bag" data-action="move-bag" data-id="${item.id}">
              <i class="fas fa-shopping-bag"></i> Move to Bag
            </button>
            <button class="btn-wishlist-remove" data-action="remove-wishlist" data-id="${item.id}">
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>
        </div>
      </div>
    `).join('');

    listEl.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const action = btn.dataset.action;
        const id = btn.dataset.id;
        if (action === 'move-bag') {
          store.moveToCart(id);
          this.playAudio('chime');
          this.showToast('Item moved to Bag!', 'success');
        } else if (action === 'remove-wishlist') {
          store.removeFromWishlist(id);
          this.playAudio('click');
          this.showToast('Item removed from Wishlist', 'info');
        }
      });
    });
  }

  // ================= QUICK VIEW & PRODUCT DETAIL MODAL =================
  openQuickView(productId) {
    const product = PRODUCTS.find(p => p.id === productId);
    if (!product) {
      console.error('Product not found for quick view', productId);
      return;
    }

    this.activeQuickViewProduct = product;
    this.selectedSize = product.sizes ? product.sizes[0] : 'Standard';
    this.selectedColor = product.colors ? product.colors[0].name : 'Default';
    this.selectedQuantity = 1;

    this.playAudio('swoosh');
    this.closeAllDrawers();

    const modal = this.quickViewModal;
    if (!modal) return;

    // Render Product Details into Modal
    const discount = product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;
    const isWishlisted = store.isInWishlist(product.id);

    modal.innerHTML = `
      <div class="modal-dialog quickview-dialog">
        <button class="btn-modal-close" id="btn-close-quickview" title="Close"><i class="fas fa-times"></i></button>
        <div class="quickview-grid">
          <!-- Gallery -->
          <div class="quickview-gallery">
            <div class="main-image-wrap">
              <img id="qv-main-img" src="${product.images[0]}" alt="${product.title}" />
              ${product.badge ? `<span class="qv-badge">${product.badge}</span>` : ''}
              ${discount > 0 ? `<span class="qv-discount-badge">SAVE ${discount}%</span>` : ''}
            </div>
            ${product.images.length > 1 ? `
              <div class="qv-thumbnails">
                ${product.images.map((img, i) => `
                  <button class="qv-thumb-btn ${i === 0 ? 'active' : ''}" data-img-src="${img}">
                    <img src="${img}" alt="Thumbnail ${i + 1}" />
                  </button>
                `).join('')}
              </div>
            ` : ''}
          </div>

          <!-- Info & Actions -->
          <div class="quickview-info">
            <div class="qv-header">
              <div class="qv-category-row">
                <span class="qv-dept-tag">${product.department} / ${product.category}</span>
                <button class="qv-btn-wishlist ${isWishlisted ? 'active' : ''}" id="qv-wishlist-toggle" title="Save to Wishlist">
                  <i class="${isWishlisted ? 'fas fa-heart' : 'far fa-heart'}"></i>
                </button>
              </div>
              <h2 class="qv-title">${product.title}</h2>
              <div class="qv-rating-row">
                <div class="qv-stars">
                  <i class="fas fa-star"></i>
                  <i class="fas fa-star"></i>
                  <i class="fas fa-star"></i>
                  <i class="fas fa-star"></i>
                  <i class="fas fa-star-half-alt"></i>
                  <span class="rating-num">${product.rating}</span>
                </div>
                <span class="qv-reviews-count">(${product.reviewsCount} verified luxury reviews)</span>
                <span class="qv-stock-badge in-stock"><i class="fas fa-circle"></i> In Stock (${product.stockCount || 10} units in vault)</span>
              </div>
            </div>

            <!-- Price -->
            <div class="qv-price-block">
              <span class="qv-price-current">$${product.price}</span>
              ${product.originalPrice ? `<span class="qv-price-original">$${product.originalPrice}</span>` : ''}
              <span class="qv-tax-note">Taxes & duty included</span>
            </div>

            <p class="qv-description">${product.description}</p>

            <!-- Color Selection -->
            ${product.colors && product.colors.length ? `
              <div class="qv-option-group">
                <label class="qv-option-label">Color: <span id="qv-selected-color-name" class="highlight-val">${this.selectedColor}</span></label>
                <div class="qv-color-swatches">
                  ${product.colors.map((c, i) => `
                    <button class="qv-color-btn ${i === 0 ? 'active' : ''}" data-color-name="${c.name}" style="background-color: ${c.hex}" title="${c.name}"></button>
                  `).join('')}
                </div>
              </div>
            ` : ''}

            <!-- Size Selection -->
            ${product.sizes && product.sizes.length ? `
              <div class="qv-option-group">
                <div class="qv-size-label-row">
                  <label class="qv-option-label">Size: <span id="qv-selected-size-name" class="highlight-val">${this.selectedSize}</span></label>
                  <button class="btn-size-guide" type="button"><i class="fas fa-ruler-horizontal"></i> Luxury Fit Guide</button>
                </div>
                <div class="qv-size-pills">
                  ${product.sizes.map((s, i) => `
                    <button class="qv-size-btn ${i === 0 ? 'active' : ''}" data-size="${s}">${s}</button>
                  `).join('')}
                </div>
              </div>
            ` : ''}

            <!-- Quantity & Actions -->
            <div class="qv-actions-row">
              <div class="qv-qty-selector">
                <button class="btn-qv-qty" id="qv-qty-minus"><i class="fas fa-minus"></i></button>
                <span id="qv-qty-val" class="qv-qty-num">1</span>
                <button class="btn-qv-qty" id="qv-qty-plus"><i class="fas fa-plus"></i></button>
              </div>

              <button class="btn-primary-glow btn-qv-add" id="qv-btn-add-bag">
                <i class="fas fa-shopping-bag"></i> Add to Bag &bull; <span id="qv-btn-price-sum">$${product.price}</span>
              </button>

              <button class="btn-secondary-luxury btn-qv-buy" id="qv-btn-buy-now">
                <i class="fas fa-bolt"></i> Instant Checkout
              </button>
            </div>

            <!-- Features & Guarantees -->
            <div class="qv-guarantees-grid">
              <div class="guarantee-item">
                <i class="fas fa-shield-alt"></i>
                <div>
                  <strong>Authenticity Vault</strong>
                  <span>100% Genuine Certified</span>
                </div>
              </div>
              <div class="guarantee-item">
                <i class="fas fa-truck-fast"></i>
                <div>
                  <strong>Express White-Glove</strong>
                  <span>Global Dispatch in 24h</span>
                </div>
              </div>
              <div class="guarantee-item">
                <i class="fas fa-undo-alt"></i>
                <div>
                  <strong>Complimentary Returns</strong>
                  <span>30-Day Hassle Free</span>
                </div>
              </div>
            </div>

            <!-- Accordion Specs -->
            <div class="qv-accordions">
              <details class="qv-details" open>
                <summary><span><i class="fas fa-gem"></i> Craftsmanship & Highlights</span> <i class="fas fa-chevron-down"></i></summary>
                <ul class="qv-specs-list">
                  ${(product.features || []).map(f => `<li><i class="fas fa-check"></i> ${f}</li>`).join('')}
                </ul>
              </details>
              ${product.specs ? `
                <details class="qv-details">
                  <summary><span><i class="fas fa-list-ul"></i> Detailed Specifications</span> <i class="fas fa-chevron-down"></i></summary>
                  <div class="qv-specs-table">
                    ${Object.entries(product.specs).map(([k, v]) => `
                      <div class="spec-row">
                        <span class="spec-label">${k}</span>
                        <span class="spec-val">${v}</span>
                      </div>
                    `).join('')}
                  </div>
                </details>
              ` : ''}
            </div>
          </div>
        </div>
      </div>
    `;

    modal.classList.add('open');
    this.modalBackdrop.classList.add('active');

    // Bind Quickview Dialog Events
    const closeBtn = modal.querySelector('#btn-close-quickview');
    if (closeBtn) closeBtn.onclick = () => this.closeAllModals();

    // Thumbnails switch
    modal.querySelectorAll('.qv-thumb-btn').forEach(btn => {
      btn.onclick = () => {
        modal.querySelectorAll('.qv-thumb-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const mainImg = modal.querySelector('#qv-main-img');
        if (mainImg) mainImg.src = btn.dataset.imgSrc;
      };
    });

    // Color Swatches
    modal.querySelectorAll('.qv-color-btn').forEach(btn => {
      btn.onclick = () => {
        modal.querySelectorAll('.qv-color-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.selectedColor = btn.dataset.colorName;
        const label = modal.querySelector('#qv-selected-color-name');
        if (label) label.textContent = this.selectedColor;
        this.playAudio('click');
      };
    });

    // Size Pills
    modal.querySelectorAll('.qv-size-btn').forEach(btn => {
      btn.onclick = () => {
        modal.querySelectorAll('.qv-size-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.selectedSize = btn.dataset.size;
        const label = modal.querySelector('#qv-selected-size-name');
        if (label) label.textContent = this.selectedSize;
        this.playAudio('click');
      };
    });

    // Quantity Stepper
    const qtyMinus = modal.querySelector('#qv-qty-minus');
    const qtyPlus = modal.querySelector('#qv-qty-plus');
    const qtyVal = modal.querySelector('#qv-qty-val');
    const btnPriceSum = modal.querySelector('#qv-btn-price-sum');

    if (qtyMinus && qtyPlus && qtyVal) {
      qtyMinus.onclick = () => {
        if (this.selectedQuantity > 1) {
          this.selectedQuantity--;
          qtyVal.textContent = this.selectedQuantity;
          if (btnPriceSum) btnPriceSum.textContent = `$${(product.price * this.selectedQuantity).toFixed(2)}`;
          this.playAudio('click');
        }
      };
      qtyPlus.onclick = () => {
        this.selectedQuantity++;
        qtyVal.textContent = this.selectedQuantity;
        if (btnPriceSum) btnPriceSum.textContent = `$${(product.price * this.selectedQuantity).toFixed(2)}`;
        this.playAudio('click');
      };
    }

    // Wishlist Button inside modal
    const qvWishlistBtn = modal.querySelector('#qv-wishlist-toggle');
    if (qvWishlistBtn) {
      qvWishlistBtn.onclick = () => {
        const added = store.toggleWishlist(product.id);
        qvWishlistBtn.classList.toggle('active', added);
        qvWishlistBtn.innerHTML = `<i class="${added ? 'fas fa-heart' : 'far fa-heart'}"></i>`;
        this.playAudio('click');
        this.showToast(added ? 'Saved to Wishlist!' : 'Removed from Wishlist', 'info');
      };
    }

    // Add to Bag Button
    const btnAddBag = modal.querySelector('#qv-btn-add-bag');
    if (btnAddBag) {
      btnAddBag.onclick = (e) => {
        store.addToCart(product, this.selectedSize, this.selectedColor, this.selectedQuantity);
        this.playAudio('chime');
        this.animateFlyToCart(e);
        this.showToast(`Added ${this.selectedQuantity}x <strong>${product.title}</strong> to Bag!`, 'success');
        this.closeAllModals();
        setTimeout(() => this.openCart(), 300);
      };
    }

    // Instant Checkout Button
    const btnBuyNow = modal.querySelector('#qv-btn-buy-now');
    if (btnBuyNow) {
      btnBuyNow.onclick = () => {
        store.addToCart(product, this.selectedSize, this.selectedColor, this.selectedQuantity);
        this.closeAllModals();
        this.openCheckout();
      };
    }
  }

  // ================= FLYING PARTICLE ANIMATION TO CART =================
  animateFlyToCart(e) {
    if (!this.flyParticleLayer) return;

    const startX = e.clientX || window.innerWidth / 2;
    const startY = e.clientY || window.innerHeight / 2;

    const cartIcon = document.querySelector('.btn-nav-cart') || document.querySelector('.cart-count-badge');
    const targetRect = cartIcon ? cartIcon.getBoundingClientRect() : { left: window.innerWidth - 60, top: 25 };
    const targetX = targetRect.left + 15;
    const targetY = targetRect.top + 15;

    const particle = document.createElement('div');
    particle.className = 'fly-cart-particle';
    particle.style.left = `${startX}px`;
    particle.style.top = `${startY}px`;
    this.flyParticleLayer.appendChild(particle);

    requestAnimationFrame(() => {
      particle.style.transform = `translate(${targetX - startX}px, ${targetY - startY}px) scale(0.2)`;
      particle.style.opacity = '0';
    });

    setTimeout(() => {
      particle.remove();
      if (cartIcon) {
        cartIcon.classList.add('pulse-cart');
        setTimeout(() => cartIcon.classList.remove('pulse-cart'), 400);
      }
    }, 600);
  }

  // ================= AUTHENTICATION & VIP MEMBERSHIP FLOW =================
  openAuthModal({ returnToCheckout = false, activeTab = 'login', activeAccountTab = 'profile' } = {}) {
    this.returnToCheckoutAfterAuth = returnToCheckout;
    this.playAudio('swoosh');
    this.closeAllDrawers();
    this.closeAllModals();

    const modal = this.authModal;
    if (!modal) return;

    if (auth.isLoggedIn()) {
      const user = auth.getCurrentUser() || {};
      const orders = auth.getUserOrders();

      modal.innerHTML = `
        <div class="modal-dialog auth-dialog" style="max-width: 580px;">
          <button class="btn-modal-close" id="btn-close-auth" title="Close"><i class="fas fa-times"></i></button>
          <div class="auth-header">
            <span class="auth-brand-badge">MHS VIP CLIENT ATELIER</span>
            <h2 class="auth-title">My Luxury Account</h2>
            <p class="auth-subtitle">Signed in as <strong>${user.name || user.firstName || 'VIP Client'}</strong></p>
          </div>

          <div class="account-nav-tabs">
            <button type="button" class="account-tab-btn ${activeAccountTab === 'profile' ? 'active' : ''}" data-account-tab="profile">
              <i class="fas fa-user-circle"></i> VIP Profile
            </button>
            <button type="button" class="account-tab-btn ${activeAccountTab === 'orders' ? 'active' : ''}" data-account-tab="orders">
              <i class="fas fa-receipt"></i> My Orders (${orders.length})
            </button>
          </div>

          <!-- 1. PROFILE VIEW -->
          <div id="account-tab-profile" class="account-tab-pane" style="display: ${activeAccountTab === 'profile' ? 'block' : 'none'};">
            <div class="account-profile-box">
              <div class="account-avatar-large">
                <i class="fas fa-user-tie"></i>
              </div>
              
              <div class="account-info-details">
                <div class="account-detail-row">
                  <span class="account-detail-label">Client Name</span>
                  <span class="account-detail-val">${user.name || (user.firstName + ' ' + user.lastName)}</span>
                </div>
                <div class="account-detail-row">
                  <span class="account-detail-label">Email Address</span>
                  <span class="account-detail-val">${user.email}</span>
                </div>
                ${user.phone ? `
                  <div class="account-detail-row">
                    <span class="account-detail-label">Telephone</span>
                    <span class="account-detail-val">${user.phone}</span>
                  </div>
                ` : ''}
                <div class="account-detail-row">
                  <span class="account-detail-label">Membership Tier</span>
                  <span class="account-detail-val" style="color:#D4AF37;">VIP Black Diamond &bull; Active</span>
                </div>
                <div class="account-detail-row">
                  <span class="account-detail-label">Total Orders Placed</span>
                  <span class="account-detail-val" style="color:#D4AF37; font-weight:700;">${orders.length}</span>
                </div>
              </div>

              <button class="btn-auth-logout" id="btn-auth-logout">
                <i class="fas fa-sign-out-alt"></i> Sign Out of Account
              </button>
            </div>
          </div>

          <!-- 2. ORDERS VIEW -->
          <div id="account-tab-orders" class="account-tab-pane" style="display: ${activeAccountTab === 'orders' ? 'block' : 'none'};">
            ${orders.length === 0 ? `
              <div class="orders-empty-state">
                <i class="fas fa-shopping-bag"></i>
                <h4 style="color:#FFF;margin:0;">No Orders Placed Yet</h4>
                <p>Explore our bespoke collections to place your first luxury acquisition.</p>
                <button type="button" id="btn-empty-orders-shop">Discover Catalog</button>
              </div>
            ` : `
              <div class="account-orders-container">
                ${orders.map(order => `
                  <div class="account-order-card">
                    <div class="order-card-header">
                      <div class="order-id-date">
                        <span class="order-ref-num">#${order.orderId}</span>
                        <span class="order-date-text"><i class="far fa-calendar-alt"></i> ${order.formattedDate}</span>
                      </div>
                      <span class="order-status-badge"><i class="fas fa-check-circle"></i> ${order.status}</span>
                    </div>

                    <div class="order-items-preview">
                      ${(order.items || []).map(item => `
                        <div class="order-item-mini">
                          ${item.image ? `<img src="${encodeURI(item.image)}" alt="${item.title}" class="order-item-mini-img" />` : `<div class="order-item-mini-img" style="display:flex;align-items:center;justify-content:center;color:#D4AF37;"><i class="fas fa-gem"></i></div>`}
                          <div class="order-item-mini-info">
                            <span class="order-item-title">${item.title}</span>
                            <span class="order-item-sub">Qty: ${item.quantity} &bull; Size: ${item.size} &bull; Color: ${item.color}</span>
                          </div>
                          <span class="order-item-price">$${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      `).join('')}
                    </div>

                    <div class="order-meta-footer">
                      <div class="order-total-amount">
                        Total Investment: <strong>$${(order.summary?.total || 0).toFixed(2)}</strong>
                      </div>
                      <button type="button" class="btn-view-invoice" data-order-id="${order.orderId}">
                        <i class="fas fa-file-invoice"></i> View Invoice
                      </button>
                    </div>
                  </div>
                `).join('')}
              </div>
            `}
          </div>
        </div>
      `;

      // Account Tabs Switching
      modal.querySelectorAll('.account-tab-btn').forEach(btn => {
        btn.onclick = () => {
          const tab = btn.dataset.accountTab;
          modal.querySelectorAll('.account-tab-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');

          const profilePane = modal.querySelector('#account-tab-profile');
          const ordersPane = modal.querySelector('#account-tab-orders');
          if (profilePane) profilePane.style.display = tab === 'profile' ? 'block' : 'none';
          if (ordersPane) ordersPane.style.display = tab === 'orders' ? 'block' : 'none';
          this.playAudio('click');
        };
      });

      // View Invoice Button
      modal.querySelectorAll('.btn-view-invoice').forEach(btn => {
        btn.onclick = () => {
          const orderId = btn.dataset.orderId;
          this.renderInvoiceModal(orderId);
        };
      });

      // Empty state shop button
      const shopBtn = modal.querySelector('#btn-empty-orders-shop');
      if (shopBtn) {
        shopBtn.onclick = () => this.closeAllModals();
      }

      // Logout button
      const logoutBtn = modal.querySelector('#btn-auth-logout');
      if (logoutBtn) {
        logoutBtn.onclick = () => {
          auth.logout();
          this.playAudio('click');
          this.showToast('You have signed out of your account.', 'info');
          this.openAuthModal();
        };
      }
    } else {
      modal.innerHTML = `
        <div class="modal-dialog auth-dialog">
          <button class="btn-modal-close" id="btn-close-auth" title="Close"><i class="fas fa-times"></i></button>
          
          <div class="auth-header">
            <span class="auth-brand-badge">MHS EXCLUSIVE ATELIER</span>
            <h2 class="auth-title">${returnToCheckout ? 'Sign In to Place Order' : 'VIP Member Portal'}</h2>
            <p class="auth-subtitle">${returnToCheckout ? 'Sign in or create an account to proceed with your luxury order.' : 'Sign in or register for exclusive privileges, order tracking & checkout.'}</p>
          </div>

          <div class="auth-nav-tabs">
            <button type="button" class="auth-tab-btn ${activeTab === 'login' ? 'active' : ''}" data-tab="login">
              <i class="fas fa-key"></i> VIP Sign In
            </button>
            <button type="button" class="auth-tab-btn ${activeTab === 'register' ? 'active' : ''}" data-tab="register">
              <i class="fas fa-user-plus"></i> Create Account
            </button>
          </div>

          <div id="auth-error-msg" class="auth-error-box" style="display: none;">
            <i class="fas fa-exclamation-circle"></i>
            <span id="auth-error-text">Invalid credentials</span>
          </div>

          <!-- 1. LOGIN FORM -->
          <form id="login-form" class="auth-form-wrap" autocomplete="off" novalidate style="display: ${activeTab === 'login' ? 'flex' : 'none'};">
            <div class="auth-form-group">
              <label>Email Address</label>
              <div class="auth-input-icon-wrap">
                <i class="fas fa-envelope"></i>
                <input type="text" name="email" id="login-email" required autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" value="" />
              </div>
            </div>

            <div class="auth-form-group">
              <label>Password</label>
              <div class="auth-input-icon-wrap">
                <i class="fas fa-lock"></i>
                <input type="password" name="password" id="login-password" required autocomplete="new-password" value="" />
              </div>
            </div>

            <button type="submit" class="btn-auth-submit" id="btn-submit-login">
              <i class="fas fa-sign-in-alt"></i> Sign In &bull; Enter Store
            </button>

            <div class="auth-footer-note">
              Don't have an account? <span data-switch-auth="register">Create VIP Account Now</span>
            </div>
          </form>

          <!-- 2. REGISTRATION FORM -->
          <form id="register-form" class="auth-form-wrap" autocomplete="off" novalidate style="display: ${activeTab === 'register' ? 'flex' : 'none'};">
            <div class="auth-form-row-2">
              <div class="auth-form-group">
                <label>First Name</label>
                <div class="auth-input-icon-wrap">
                  <i class="fas fa-user"></i>
                  <input type="text" name="firstName" required autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" value="" />
                </div>
              </div>
              <div class="auth-form-group">
                <label>Last Name</label>
                <div class="auth-input-icon-wrap">
                  <i class="fas fa-user"></i>
                  <input type="text" name="lastName" required autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" value="" />
                </div>
              </div>
            </div>

            <div class="auth-form-group">
              <label>Email Address</label>
              <div class="auth-input-icon-wrap">
                <i class="fas fa-envelope"></i>
                <input type="text" name="email" id="register-email" required autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" value="" />
              </div>
            </div>

            <div class="auth-form-group">
              <label>Phone Number</label>
              <div class="auth-input-icon-wrap">
                <i class="fas fa-phone"></i>
                <input type="tel" name="phone" required autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" value="" />
              </div>
            </div>

            <div class="auth-form-group">
              <label>Password (Min. 6 Characters)</label>
              <div class="auth-input-icon-wrap">
                <i class="fas fa-lock"></i>
                <input type="password" name="password" required minlength="6" autocomplete="new-password" value="" />
              </div>
            </div>

            <button type="submit" class="btn-auth-submit" id="btn-submit-register">
              <i class="fas fa-check-circle"></i> Create VIP Account &bull; Proceed
            </button>

            <div class="auth-footer-note">
              Already registered? <span data-switch-auth="login">Sign In to Account</span>
            </div>
          </form>
        </div>
      `;

      // Tab buttons in Login / Register
      modal.querySelectorAll('.auth-tab-btn').forEach(btn => {
        btn.onclick = () => {
          const tab = btn.dataset.tab;
          this.switchAuthTab(tab);
        };
      });

      // Footer switch notes
      modal.querySelectorAll('[data-switch-auth]').forEach(span => {
        span.onclick = () => {
          const tab = span.dataset.switchAuth;
          // Carry over email if user typed it
          const loginEmail = modal.querySelector('#login-email')?.value;
          const regEmail = modal.querySelector('#register-email');
          if (tab === 'register' && loginEmail && regEmail) {
            regEmail.value = loginEmail;
          }
          this.switchAuthTab(tab);
        };
      });
    }

    modal.classList.add('open');
    this.modalBackdrop.classList.add('active');

    // Force clear any browser-remembered cached autofill on modal open
    const loginForm = modal.querySelector('#login-form');
    const registerForm = modal.querySelector('#register-form');
    if (loginForm && activeTab === 'login') loginForm.reset();
    if (registerForm && activeTab === 'register') registerForm.reset();

    const closeBtn = modal.querySelector('#btn-close-auth');
    if (closeBtn) closeBtn.onclick = () => this.closeAllModals();
  }

  switchAuthTab(tab) {
    const modal = this.authModal;
    if (!modal) return;

    modal.querySelectorAll('.auth-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tab);
    });

    const loginForm = modal.querySelector('#login-form');
    const registerForm = modal.querySelector('#register-form');
    if (loginForm) loginForm.style.display = tab === 'login' ? 'flex' : 'none';
    if (registerForm) registerForm.style.display = tab === 'register' ? 'flex' : 'none';

    const errBox = modal.querySelector('#auth-error-msg');
    if (errBox) errBox.style.display = 'none';

    this.playAudio('click');
  }

  renderInvoiceModal(orderId) {
    const orders = auth.orders || [];
    const order = orders.find(o => o.orderId === orderId);
    if (!order) return;

    this.closeAllDrawers();
    this.closeAllModals();

    const modal = this.checkoutModal;
    if (!modal) return;

    const summary = order.summary || {};
    const items = order.items || [];
    const addr = order.shippingAddress || {};

    modal.innerHTML = `
      <div class="modal-dialog checkout-dialog confirmation-dialog" style="max-width: 600px;">
        <button class="btn-modal-close" id="btn-close-invoice" title="Close"><i class="fas fa-times"></i></button>
        <div class="confirmation-content" style="text-align: left; padding: 24px 28px;">
          <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(212,175,55,0.3); padding-bottom:14px; margin-bottom:16px;">
            <div>
              <span class="auth-brand-badge" style="margin:0;">MHS EXCLUSIVE ATELIER</span>
              <h2 style="font-family:'Cinzel',serif; font-size:1.4rem; color:#FFF; margin:4px 0 0;">Official Purchase Invoice</h2>
            </div>
            <div style="text-align:right;">
              <span style="font-family:'Cinzel',serif; font-weight:700; color:#D4AF37; font-size:1.05rem;">#${order.orderId}</span>
              <div style="font-size:0.75rem; color:rgba(255,255,255,0.5);">${order.formattedDate}</div>
            </div>
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:18px; font-size:0.84rem; background:rgba(255,255,255,0.03); padding:14px; border-radius:10px; border:1px solid rgba(255,255,255,0.08);">
            <div>
              <div style="color:#D4AF37; font-size:0.72rem; text-transform:uppercase; font-weight:600; margin-bottom:4px;">VIP Client Details</div>
              <div style="color:#FFF; font-weight:500;">${order.userName || 'VIP Client'}</div>
              <div style="color:rgba(255,255,255,0.6); font-size:0.8rem;">${order.userEmail}</div>
              ${order.userPhone ? `<div style="color:rgba(255,255,255,0.6); font-size:0.8rem;">${order.userPhone}</div>` : ''}
            </div>
            <div>
              <div style="color:#D4AF37; font-size:0.72rem; text-transform:uppercase; font-weight:600; margin-bottom:4px;">Delivery Destination</div>
              <div style="color:#FFF;">${addr.address || 'Penthouse Suite'}</div>
              <div style="color:rgba(255,255,255,0.6); font-size:0.8rem;">${addr.city || ''} ${addr.state || ''} ${addr.zip || ''}</div>
              <div style="color:#34d399; font-size:0.78rem; margin-top:2px;"><i class="fas fa-shield-alt"></i> ${order.paymentMethod}</div>
            </div>
          </div>

          <div class="conf-summary-box" style="margin-bottom:18px;">
            <h4 style="margin:0 0 10px 0; color:#FFF; font-size:0.92rem;">Acquired Items (${items.reduce((s, i) => s + i.quantity, 0)})</h4>
            <div class="conf-items-list">
              ${items.map(item => `
                <div class="conf-item-row" style="padding:6px 0; border-bottom:1px dashed rgba(255,255,255,0.06); font-size:0.84rem;">
                  <span>${item.quantity}x <strong>${item.title}</strong> (${item.size}, ${item.color})</span>
                  <span style="color:#D4AF37; font-weight:600;">$${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              `).join('')}
            </div>
            <div style="margin-top:12px; display:flex; flex-direction:column; gap:6px; font-size:0.84rem; color:rgba(255,255,255,0.7);">
              <div style="display:flex; justify-content:space-between;"><span>Subtotal:</span> <span>$${(summary.subtotal || 0).toFixed(2)}</span></div>
              ${summary.discountAmount ? `<div style="display:flex; justify-content:space-between; color:#34d399;"><span>Discount:</span> <span>-$${summary.discountAmount.toFixed(2)}</span></div>` : ''}
              <div style="display:flex; justify-content:space-between;"><span>White-Glove Courier:</span> <span>${summary.shipping === 0 ? 'FREE' : `$${summary.shipping.toFixed(2)}`}</span></div>
              <div style="display:flex; justify-content:space-between;"><span>Estimated Tax (8%):</span> <span>$${(summary.tax || 0).toFixed(2)}</span></div>
              <div class="conf-total-row" style="margin-top:6px;">
                <span>Total Investment:</span>
                <strong>$${(summary.total || 0).toFixed(2)}</strong>
              </div>
            </div>
          </div>

          <div style="display:flex; gap:10px;">
            <button class="btn-primary-glow" id="btn-back-to-account" style="flex:1; padding:12px; font-size:0.85rem;">
              <i class="fas fa-arrow-left"></i> Back to Account Orders
            </button>
            <button class="btn-auth-submit" id="btn-print-receipt" style="width:auto; padding:0 20px; font-size:0.85rem; height:auto; margin:0;" onclick="window.print()">
              <i class="fas fa-print"></i> Print
            </button>
          </div>
        </div>
      </div>
    `;

    modal.classList.add('open');
    this.modalBackdrop.classList.add('active');

    const backBtn = modal.querySelector('#btn-back-to-account');
    const closeBtn = modal.querySelector('#btn-close-invoice');
    if (backBtn) {
      backBtn.onclick = () => {
        this.openAuthModal({ activeAccountTab: 'orders' });
      };
    }
    if (closeBtn) {
      closeBtn.onclick = () => this.closeAllModals();
    }
  }

  handleLoginSubmit(form) {
    const emailInput = form.querySelector('input[name="email"]');
    const passwordInput = form.querySelector('input[name="password"]');
    const email = (emailInput ? emailInput.value : '').trim();
    const password = (passwordInput ? passwordInput.value : '').trim();

    if (!email) {
      this.showAuthError('Please enter your email address.');
      return;
    }
    if (!password) {
      this.showAuthError('Please enter your password.');
      return;
    }

    const res = auth.login({ email, password });

    if (res.success) {
      this.playAudio('chime');
      this.showToast(`Welcome back, ${res.user.firstName || res.user.name}!`, 'success');
      this.closeAllModals();
      if (this.returnToCheckoutAfterAuth) {
        this.returnToCheckoutAfterAuth = false;
        setTimeout(() => this.openCheckout(), 250);
      }
    } else {
      this.showAuthError(res.message);
      if (res.needSignup) {
        // Automatically switch to registration tab after a brief moment or allow 1-click
        const regEmail = this.authModal?.querySelector('#register-email');
        if (regEmail) regEmail.value = email;
      }
    }
  }

  handleRegisterSubmit(form) {
    const firstName = form.querySelector('input[name="firstName"]').value;
    const lastName = form.querySelector('input[name="lastName"]').value;
    const email = form.querySelector('input[name="email"]').value;
    const phone = form.querySelector('input[name="phone"]').value;
    const password = form.querySelector('input[name="password"]').value;

    const res = auth.register({ firstName, lastName, email, phone, password });

    if (res.success) {
      this.playAudio('chime');
      this.showToast(`Account registered successfully! Welcome, ${res.user.firstName}!`, 'success');
      this.closeAllModals();
      if (this.returnToCheckoutAfterAuth) {
        this.returnToCheckoutAfterAuth = false;
        setTimeout(() => this.openCheckout(), 250);
      }
    } else {
      this.showAuthError(res.message);
    }
  }

  showAuthError(msg) {
    const box = document.getElementById('auth-error-msg');
    const text = document.getElementById('auth-error-text');
    if (box && text) {
      text.textContent = msg;
      box.style.display = 'flex';
      this.playAudio('swoosh');
    }
  }

  // ================= CHECKOUT FLOW =================
  openCheckout() {
    const summary = store.getCartSummary();
    if (summary.count === 0) {
      this.showToast('Your Shopping Bag is currently empty!', 'warning');
      return;
    }

    // GATED: User must be logged in for ordering
    if (!auth.isLoggedIn()) {
      this.showToast('Please sign in or register to place your order.', 'info');
      this.openAuthModal({ returnToCheckout: true });
      return;
    }

    const currentUser = auth.getCurrentUser() || {};

    this.playAudio('swoosh');
    this.closeAllDrawers();
    this.closeAllModals();

    const modal = this.checkoutModal;
    if (!modal) return;

    modal.innerHTML = `
      <div class="modal-dialog checkout-dialog">
        <button class="btn-modal-close" id="btn-close-checkout" title="Close"><i class="fas fa-times"></i></button>
        <div class="checkout-grid">
          <!-- Checkout Form -->
          <div class="checkout-form-container">
            <div class="checkout-header">
              <div class="checkout-brand-logo">
                <span class="monogram">MHS</span>
                <span class="tag">SECURE LUXURY CHECKOUT</span>
              </div>
              <div class="checkout-steps-bar">
                <div class="step active"><span class="step-num">1</span> Shipping</div>
                <div class="step-divider"></div>
                <div class="step active"><span class="step-num">2</span> Payment</div>
                <div class="step-divider"></div>
                <div class="step"><span class="step-num">3</span> Complete</div>
              </div>
            </div>

            <form id="checkout-form" class="checkout-form">
              <!-- Customer Info -->
              <div class="form-section">
                <h3 class="form-section-title"><i class="fas fa-user-circle"></i> Contact & Delivery Details</h3>
                <div class="form-row-2">
                  <div class="form-group">
                    <label>First Name</label>
                    <input type="text" name="firstName" required placeholder="First Name" value="${currentUser.firstName || ''}" />
                  </div>
                  <div class="form-group">
                    <label>Last Name</label>
                    <input type="text" name="lastName" required placeholder="Last Name" value="${currentUser.lastName || ''}" />
                  </div>
                </div>

                <div class="form-row-2">
                  <div class="form-group">
                    <label>Email Address</label>
                    <input type="email" name="email" required placeholder="name@example.com" value="${currentUser.email || ''}" />
                  </div>
                  <div class="form-group">
                    <label>Phone Number</label>
                    <input type="tel" name="phone" required placeholder="+1 (555) 000-0000" value="${currentUser.phone || ''}" />
                  </div>
                </div>

                <div class="form-group">
                  <label>Street Address & Penthouse / Suite</label>
                  <input type="text" name="address" required placeholder="e.g. 740 Park Avenue, Suite 18A" value="" />
                </div>

                <div class="form-row-3">
                  <div class="form-group">
                    <label>City</label>
                    <input type="text" name="city" required placeholder="City" value="" />
                  </div>
                  <div class="form-group">
                    <label>State / Region</label>
                    <input type="text" name="state" required placeholder="State / Region" value="" />
                  </div>
                  <div class="form-group">
                    <label>Postal Code</label>
                    <input type="text" name="zip" required placeholder="Postal Code" value="" />
                  </div>
                </div>
              </div>

              <!-- Payment Method -->
              <div class="form-section">
                <h3 class="form-section-title"><i class="fas fa-lock"></i> Encrypted Payment Selection</h3>
                
                <div class="payment-method-options">
                  <label class="payment-card-option selected">
                    <input type="radio" name="paymentMethod" value="card" checked />
                    <div class="payment-card-content">
                      <div class="pay-title"><i class="fas fa-credit-card"></i> Credit / Debit Card</div>
                      <div class="pay-icons">
                        <i class="fab fa-cc-visa"></i>
                        <i class="fab fa-cc-mastercard"></i>
                        <i class="fab fa-cc-amex"></i>
                      </div>
                    </div>
                  </label>

                  <label class="payment-card-option">
                    <input type="radio" name="paymentMethod" value="applepay" />
                    <div class="payment-card-content">
                      <div class="pay-title"><i class="fab fa-apple"></i> Apple Pay / Google Pay</div>
                      <span class="pay-badge">1-Click Fast</span>
                    </div>
                  </label>

                  <label class="payment-card-option">
                    <input type="radio" name="paymentMethod" value="cod" />
                    <div class="payment-card-content">
                      <div class="pay-title"><i class="fas fa-hand-holding-usd"></i> Cash on Delivery</div>
                      <span class="pay-badge">Vault Courier</span>
                    </div>
                  </label>
                </div>

                <!-- Simulated Card Fields -->
                <div id="card-fields-container" class="card-inputs-box">
                  <div class="form-group">
                    <label>Card Number</label>
                    <div class="input-with-icon">
                      <i class="fas fa-credit-card"></i>
                      <input type="text" name="cardNumber" placeholder="•••• •••• •••• ••••" value="" required />
                    </div>
                  </div>
                  <div class="form-row-2">
                    <div class="form-group">
                      <label>Expiration Date</label>
                      <input type="text" name="cardExp" placeholder="MM/YY" value="" required />
                    </div>
                    <div class="form-group">
                      <label>CVV / CVC</label>
                      <input type="password" name="cardCvv" placeholder="•••" maxlength="4" value="" required />
                    </div>
                  </div>
                </div>
              </div>

              <!-- Submit Button -->
              <button type="submit" class="btn-primary-glow btn-submit-checkout" id="btn-submit-order">
                <i class="fas fa-lock"></i> Authorize & Place Order &bull; $${summary.total.toFixed(2)}
              </button>
            </form>
          </div>

          <!-- Order Summary Sidebar -->
          <div class="checkout-summary-sidebar">
            <h3 class="summary-title"><i class="fas fa-shopping-bag"></i> Order Items (${summary.count})</h3>
            <div class="checkout-items-mini-list">
              ${store.cart.map(item => `
                <div class="checkout-mini-item">
                  ${item.image ? `<img src="${encodeURI(item.image)}" alt="${item.title}" />` : `<div style="width:48px;height:48px;border-radius:8px;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,0.05);color:#D4AF37;font-size:1rem;flex-shrink:0;"><i class="fas fa-gem"></i></div>`}
                  <div class="item-info">
                    <span class="item-title">${item.title}</span>
                    <span class="item-spec">${item.size} &bull; ${item.color} &bull; Qty: ${item.quantity}</span>
                  </div>
                  <span class="item-cost">$${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              `).join('')}
            </div>

            <div class="checkout-cost-breakdown">
              <div class="cost-row">
                <span>Subtotal</span>
                <span>$${summary.subtotal.toFixed(2)}</span>
              </div>
              ${summary.discountAmount > 0 ? `
                <div class="cost-row discount">
                  <span>Promo Discount (${summary.activeCoupon.code})</span>
                  <span>-$${summary.discountAmount.toFixed(2)}</span>
                </div>
              ` : ''}
              <div class="cost-row">
                <span>White-Glove Courier Delivery</span>
                <span>${summary.shipping === 0 ? '<strong class="text-emerald">FREE</strong>' : `$${summary.shipping.toFixed(2)}`}</span>
              </div>
              <div class="cost-row">
                <span>Estimated Tax (8%)</span>
                <span>$${summary.tax.toFixed(2)}</span>
              </div>
              <div class="cost-row total-row">
                <span>Total Investment</span>
                <span class="total-val">$${summary.total.toFixed(2)}</span>
              </div>
            </div>

            <div class="checkout-security-notice">
              <i class="fas fa-shield-halved"></i>
              <span>256-Bit Military Grade SSL Encryption. Your luxury shipment is insured up to $50,000.</span>
            </div>
          </div>
        </div>
      </div>
    `;

    modal.classList.add('open');
    this.modalBackdrop.classList.add('active');

    // Close button
    const closeBtn = modal.querySelector('#btn-close-checkout');
    if (closeBtn) closeBtn.onclick = () => this.closeAllModals();

    // Payment Radio Toggle
    modal.querySelectorAll('input[name="paymentMethod"]').forEach(radio => {
      radio.onchange = () => {
        modal.querySelectorAll('.payment-card-option').forEach(el => el.classList.remove('selected'));
        radio.closest('.payment-card-option').classList.add('selected');
        const cardBox = modal.querySelector('#card-fields-container');
        if (cardBox) {
          cardBox.style.display = radio.value === 'card' ? 'block' : 'none';
          const cardInputs = cardBox.querySelectorAll('input');
          cardInputs.forEach(inp => {
            if (radio.value === 'card') {
              inp.setAttribute('required', '');
            } else {
              inp.removeAttribute('required');
            }
          });
        }
      };
    });
  }

  processCheckout(form) {
    const btn = form.querySelector('#btn-submit-order');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing Secure Transaction...';
    }

    const orderId = `MHS-${Math.floor(100000 + Math.random() * 900000)}`;
    const summary = store.getCartSummary();
    const orderedItems = [...store.cart];

    const shippingAddress = {
      firstName: form.querySelector('input[name="firstName"]')?.value || '',
      lastName: form.querySelector('input[name="lastName"]')?.value || '',
      email: form.querySelector('input[name="email"]')?.value || '',
      phone: form.querySelector('input[name="phone"]')?.value || '',
      address: form.querySelector('input[name="address"]')?.value || '',
      city: form.querySelector('input[name="city"]')?.value || '',
      state: form.querySelector('input[name="state"]')?.value || '',
      zip: form.querySelector('input[name="zip"]')?.value || ''
    };

    const paymentRadio = form.querySelector('input[name="paymentMethod"]:checked');
    const paymentMethodMap = {
      'card': 'Credit / Debit Card (Encrypted)',
      'applepay': 'Apple Pay / Google Pay',
      'cod': 'Cash on Delivery (Vault Courier)'
    };
    const paymentMethod = paymentRadio ? (paymentMethodMap[paymentRadio.value] || paymentRadio.value) : 'Credit / Debit Card (Encrypted)';

    setTimeout(() => {
      // Save order to logged in VIP user account
      auth.saveUserOrder({
        orderId,
        items: orderedItems,
        summary,
        shippingAddress,
        paymentMethod
      });

      // Clear Cart
      store.clearCart();
      this.playAudio('chime');
      this.renderOrderConfirmation(orderId, summary, orderedItems);
    }, 1200);
  }

  renderOrderConfirmation(orderId, summary, items) {
    const modal = this.checkoutModal;
    if (!modal) return;

    modal.innerHTML = `
      <div class="modal-dialog checkout-dialog confirmation-dialog">
        <button class="btn-modal-close" id="btn-close-confirmation" title="Close"><i class="fas fa-times"></i></button>
        <div class="confirmation-content">
          <div class="conf-icon-wrap">
            <i class="fas fa-check-circle"></i>
          </div>
          <span class="conf-pretitle">THANK YOU FOR YOUR LUXURY ACQUISITION</span>
          <h2 class="conf-title">Order Confirmed!</h2>
          <p class="conf-sub">Order Reference: <strong>#${orderId}</strong></p>

          <div class="conf-timeline">
            <div class="tl-step done">
              <i class="fas fa-receipt"></i>
              <span>Order Verified</span>
            </div>
            <div class="tl-line active"></div>
            <div class="tl-step active">
              <i class="fas fa-box-open"></i>
              <span>Vault Packaging</span>
            </div>
            <div class="tl-line"></div>
            <div class="tl-step">
              <i class="fas fa-plane-departure"></i>
              <span>Express Courier</span>
            </div>
          </div>

          <div class="conf-summary-box">
            <h4>Acquired Treasures (${items.reduce((s, i) => s + i.quantity, 0)} Items)</h4>
            <div class="conf-items-list">
              ${items.map(item => `
                <div class="conf-item-row">
                  <span>${item.quantity}x ${item.title} (${item.size}, ${item.color})</span>
                  <span>$${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              `).join('')}
            </div>
            <div class="conf-total-row">
              <span>Grand Total Paid:</span>
              <strong>$${summary.total.toFixed(2)}</strong>
            </div>
          </div>

          <p class="conf-email-note">A confirmation receipt and live GPS tracking tracking code have been dispatched to your email.</p>

          <button class="btn-primary-glow btn-conf-shop-more" id="btn-conf-continue">
            <i class="fas fa-compass"></i> Return to MHS Universe
          </button>
        </div>
      </div>
    `;

    // Confetti effect
    this.launchConfetti();

    const continueBtn = modal.querySelector('#btn-conf-continue');
    const closeBtn = modal.querySelector('#btn-close-confirmation');
    const closeHandler = () => {
      this.closeAllModals();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (continueBtn) continueBtn.onclick = closeHandler;
    if (closeBtn) closeBtn.onclick = closeHandler;
  }

  launchConfetti() {
    const canvas = document.createElement('canvas');
    canvas.className = 'confetti-canvas';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ['#d4af37', '#f3e5ab', '#10b981', '#3b82f6', '#ec4899', '#ffffff'];
    const particles = Array.from({ length: 90 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * -canvas.height,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      speedY: Math.random() * 4 + 3,
      speedX: (Math.random() - 0.5) * 4,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 8
    }));

    let animationFrame;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.y += p.speedY;
        p.x += p.speedX;
        p.rotation += p.rotationSpeed;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();
      });

      if (particles.some(p => p.y < canvas.height)) {
        animationFrame = requestAnimationFrame(render);
      } else {
        canvas.remove();
      }
    };

    animationFrame = requestAnimationFrame(render);
    setTimeout(() => {
      cancelAnimationFrame(animationFrame);
      canvas.remove();
    }, 4500);
  }

  // ================= GLOBAL SEARCH & FILTER =================
  renderSearchResults(query = '') {
    const resultsContainer = document.getElementById('search-results-grid');
    const statsContainer = document.getElementById('search-stats');
    if (!resultsContainer) return;

    const q = query.trim().toLowerCase();
    const filteredProducts = PRODUCTS.filter(p => {
      if (!q) return true;
      return p.title.toLowerCase().includes(q) ||
             p.department.toLowerCase().includes(q) ||
             p.category.toLowerCase().includes(q) ||
             p.description.toLowerCase().includes(q) ||
             (p.features && p.features.some(f => f.toLowerCase().includes(q)));
    });

    if (statsContainer) {
      statsContainer.textContent = q ? `Found ${filteredProducts.length} luxury items for "${query}"` : `Showing all ${filteredProducts.length} curated items`;
    }

    if (filteredProducts.length === 0) {
      resultsContainer.innerHTML = `
        <div class="search-no-results">
          <i class="fas fa-search"></i>
          <h4>No creations matched your criteria</h4>
          <p>Try searching for "Sherwani", "Tuxedo", "Diamond", "Heels", "Watch", or "Toys"</p>
        </div>
      `;
      return;
    }

    resultsContainer.innerHTML = filteredProducts.map(product => `
      <div class="search-product-card" data-product-id="${product.id}">
        <div class="search-card-img">
          <img src="${product.images[0]}" alt="${product.title}" loading="lazy" />
          <button class="btn-search-quickview" data-action="quickview" data-id="${product.id}" title="Quick View">
            <i class="fas fa-eye"></i> Quick View
          </button>
        </div>
        <div class="search-card-body">
          <span class="search-dept">${product.department} &bull; ${product.category}</span>
          <h4 class="search-title">${product.title}</h4>
          <div class="search-price-row">
            <span class="search-price">$${product.price}</span>
            ${product.originalPrice ? `<span class="search-old-price">$${product.originalPrice}</span>` : ''}
          </div>
          <button class="btn-search-add" data-action="add-bag" data-id="${product.id}">
            <i class="fas fa-shopping-bag"></i> Add to Bag
          </button>
        </div>
      </div>
    `).join('');

    resultsContainer.querySelectorAll('[data-action]').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const action = btn.dataset.action;
        const id = btn.dataset.id;
        if (action === 'quickview') {
          this.closeAllDrawers();
          this.openQuickView(id);
        } else if (action === 'add-bag') {
          const product = PRODUCTS.find(p => p.id === id);
          if (product) {
            store.addToCart(product);
            this.playAudio('chime');
            this.showToast(`Added <strong>${product.title}</strong> to Bag!`, 'success');
          }
        }
      };
    });
  }

  // ================= TOAST NOTIFICATIONS =================
  showToast(message, type = 'info') {
    if (!this.toastContainer) return;

    const toast = document.createElement('div');
    toast.className = `mhs-toast toast-${type}`;

    let icon = 'info-circle';
    if (type === 'success') icon = 'check-circle';
    if (type === 'warning') icon = 'exclamation-triangle';
    if (type === 'error') icon = 'times-circle';

    toast.innerHTML = `
      <i class="fas fa-${icon}"></i>
      <div class="toast-content">${message}</div>
      <button class="toast-close"><i class="fas fa-times"></i></button>
    `;

    this.toastContainer.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add('visible'));

    const removeToast = () => {
      toast.classList.remove('visible');
      setTimeout(() => toast.remove(), 300);
    };

    toast.querySelector('.toast-close').onclick = removeToast;
    setTimeout(removeToast, 4000);
  }
}
