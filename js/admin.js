// =============================================================================
// MHS STORE - EXECUTIVE ATELIER ADMIN PANEL & CONTROL SYSTEM
// Secure Admin Portal for Orders, Products & VIP Customer Management
// =============================================================================

import { auth } from './auth.js';
import { CATALOG, PRODUCTS } from './products.js';

const ADMIN_EMAIL = 'mhs@admin.com';
const ADMIN_PASSWORD = 'admin123';
const STORAGE_KEY_ADMIN_AUTH = 'mhs_admin_session_auth_v1';

export class AdminController {
  constructor(uiController) {
    this.ui = uiController;
    this.adminModal = null;
    this.activeTab = 'overview';
    this.orderFilterStatus = 'all';
    this.orderSearchQuery = '';
    this.productFilterDept = 'all';
    this.productSearchQuery = '';
    this.customerSearchQuery = '';

    this.init();
  }

  init() {
    this.createAdminModalContainer();
    this.bindGlobalTriggers();
  }

  createAdminModalContainer() {
    if (document.getElementById('admin-modal')) {
      this.adminModal = document.getElementById('admin-modal');
      return;
    }

    const modal = document.createElement('div');
    modal.className = 'mhs-modal admin-modal-backdrop-wrap';
    modal.id = 'admin-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    document.body.appendChild(modal);
    this.adminModal = modal;
  }

  bindGlobalTriggers() {
    document.addEventListener('click', (e) => {
      const diamondBtn = e.target.closest('#btn-admin-access, .btn-admin-diamond');
      if (diamondBtn) {
        e.preventDefault();
        e.stopPropagation();
        this.openAdminPortal();
      }
    });
  }

  isAdminLoggedIn() {
    return sessionStorage.getItem(STORAGE_KEY_ADMIN_AUTH) === 'true';
  }

  setAdminLoggedIn(status) {
    if (status) {
      sessionStorage.setItem(STORAGE_KEY_ADMIN_AUTH, 'true');
    } else {
      sessionStorage.removeItem(STORAGE_KEY_ADMIN_AUTH);
    }
  }

  openAdminPortal() {
    if (this.ui) {
      this.ui.playAudio('swoosh');
      this.ui.closeAllDrawers();
      this.ui.closeAllModals();
    }

    if (this.isAdminLoggedIn()) {
      this.renderDashboard(this.activeTab);
    } else {
      this.renderLoginModal();
    }
  }

  closePortal() {
    if (this.adminModal) {
      this.adminModal.classList.remove('open');
    }
    const backdrop = document.getElementById('modal-backdrop');
    if (backdrop) backdrop.classList.remove('active');
  }

  // ================= 1. ADMIN LOGIN MODAL =================
  renderLoginModal() {
    const modal = this.adminModal;
    if (!modal) return;

    modal.innerHTML = `
      <div class="modal-dialog auth-dialog admin-login-dialog">
        <button class="btn-modal-close" id="btn-close-admin" title="Close"><i class="fas fa-times"></i></button>
        
        <div class="admin-login-header">
          <div class="admin-diamond-icon-wrap">
            <i class="fas fa-gem"></i>
          </div>
          <span class="auth-brand-badge">RESTRICTED EXECUTIVE ACCESS</span>
          <h2 class="admin-dialog-title">MHS Atelier Admin</h2>
          <p class="admin-dialog-sub">Enter verified administrative credentials to access store controls.</p>
        </div>

        <div id="admin-auth-error" class="auth-error-box" style="display: none; margin-bottom: 16px;">
          <i class="fas fa-shield-alt"></i>
          <span id="admin-auth-error-text">Invalid Administrator Credentials</span>
        </div>

        <form id="admin-login-form" class="auth-form-wrap" autocomplete="off" novalidate>
          <div class="auth-form-group">
            <label>Admin Email</label>
            <div class="auth-input-icon-wrap">
              <i class="fas fa-envelope-open-text"></i>
              <input type="text" name="adminEmail" id="admin-email-input" required autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" value="" />
            </div>
          </div>

          <div class="auth-form-group">
            <label>Master Security Key</label>
            <div class="auth-input-icon-wrap">
              <i class="fas fa-key"></i>
              <input type="password" name="adminPassword" id="admin-password-input" required autocomplete="new-password" value="" />
            </div>
          </div>

          <button type="submit" class="btn-auth-submit btn-admin-enter" id="btn-admin-submit">
            <i class="fas fa-unlock-alt"></i> Authenticate &bull; Enter Atelier
          </button>
        </form>

        <div class="admin-login-hint">
          <i class="fas fa-lock"></i> Authorized MHS Atelier Personnel Only &bull; 256-Bit Encrypted
        </div>
      </div>
    `;

    modal.classList.add('open');
    const backdrop = document.getElementById('modal-backdrop');
    if (backdrop) backdrop.classList.add('active');

    const form = modal.querySelector('#admin-login-form');
    if (form) {
      form.reset();
      const emailInput = form.querySelector('#admin-email-input');
      const passInput = form.querySelector('#admin-password-input');
      if (emailInput) emailInput.value = '';
      if (passInput) passInput.value = '';

      form.onsubmit = (e) => {
        e.preventDefault();
        const email = emailInput ? emailInput.value.trim() : '';
        const password = passInput ? passInput.value.trim() : '';
        this.handleAdminLogin(email, password);
      };
    }

    const closeBtn = modal.querySelector('#btn-close-admin');
    if (closeBtn) closeBtn.onclick = () => this.closePortal();
  }

  handleAdminLogin(email, password) {
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      this.setAdminLoggedIn(true);
      if (this.ui) {
        this.ui.playAudio('chime');
        this.ui.showToast('Welcome, Administrator! Atelier Control Active.', 'success');
      }
      this.renderDashboard('overview');
    } else {
      const errBox = this.adminModal.querySelector('#admin-auth-error');
      const errText = this.adminModal.querySelector('#admin-auth-error-text');
      if (errBox && errText) {
        errText.textContent = 'Invalid administrator credentials. Access restricted.';
        errBox.style.display = 'flex';
        if (this.ui) this.ui.playAudio('swoosh');
      }
    }
  }

  // ================= 2. ADMIN DASHBOARD =================
  renderDashboard(tab = 'overview') {
    this.activeTab = tab;
    const modal = this.adminModal;
    if (!modal) return;

    const orders = auth.orders || [];
    const users = auth.users || [];
    const totalRevenue = orders.reduce((sum, o) => sum + (o.summary?.total || 0), 0);
    const totalProducts = PRODUCTS.length;

    modal.innerHTML = `
      <div class="modal-dialog admin-dashboard-dialog">
        <!-- Top Bar Header -->
        <div class="admin-dash-header">
          <div class="admin-dash-brand">
            <div class="admin-dash-gem"><i class="fas fa-gem"></i></div>
            <div>
              <span class="auth-brand-badge" style="margin:0;">MHS STORE ATELIER</span>
              <h2 class="admin-dash-title">Master Control & Intelligence Suite</h2>
            </div>
          </div>

          <div class="admin-dash-actions">
            <div class="admin-badge-pill">
              <i class="fas fa-user-shield"></i>
              <span>mhs@admin.com (Master Admin)</span>
            </div>
            <button type="button" class="btn-admin-logout" id="btn-admin-logout" title="Sign out of Admin">
              <i class="fas fa-sign-out-alt"></i> Logout
            </button>
            <button class="btn-modal-close" id="btn-close-admin-dash" title="Close"><i class="fas fa-times"></i></button>
          </div>
        </div>

        <!-- Admin Navigation Tabs -->
        <div class="admin-nav-tabs-bar">
          <button type="button" class="admin-tab-nav-btn ${tab === 'overview' ? 'active' : ''}" data-tab="overview">
            <i class="fas fa-chart-line"></i> Overview & Metrics
          </button>
          <button type="button" class="admin-tab-nav-btn ${tab === 'orders' ? 'active' : ''}" data-tab="orders">
            <i class="fas fa-boxes-stacked"></i> Orders (${orders.length})
          </button>
          <button type="button" class="admin-tab-nav-btn ${tab === 'products' ? 'active' : ''}" data-tab="products">
            <i class="fas fa-tags"></i> Products Catalog (${totalProducts})
          </button>
          <button type="button" class="admin-tab-nav-btn ${tab === 'customers' ? 'active' : ''}" data-tab="customers">
            <i class="fas fa-users-viewfinder"></i> VIP Customers (${users.length})
          </button>
        </div>

        <!-- Dashboard Body Content -->
        <div class="admin-dash-content-area" id="admin-tab-content">
          ${this.getTabHTML(tab, { orders, users, totalRevenue, totalProducts })}
        </div>
      </div>
    `;

    modal.classList.add('open');
    const backdrop = document.getElementById('modal-backdrop');
    if (backdrop) backdrop.classList.add('active');

    // Tab Switching
    modal.querySelectorAll('.admin-tab-nav-btn').forEach(btn => {
      btn.onclick = () => {
        const nextTab = btn.dataset.tab;
        this.renderDashboard(nextTab);
        if (this.ui) this.ui.playAudio('click');
      };
    });

    // Close Button
    const closeBtn = modal.querySelector('#btn-close-admin-dash');
    if (closeBtn) closeBtn.onclick = () => this.closePortal();

    // Logout Button
    const logoutBtn = modal.querySelector('#btn-admin-logout');
    if (logoutBtn) {
      logoutBtn.onclick = () => {
        this.setAdminLoggedIn(false);
        if (this.ui) {
          this.ui.playAudio('click');
          this.ui.showToast('Administrator logged out successfully.', 'info');
        }
        this.renderLoginModal();
      };
    }

    this.bindTabEvents(tab);
  }

  getTabHTML(tab, data) {
    if (tab === 'overview') {
      return this.getOverviewTabHTML(data);
    } else if (tab === 'orders') {
      return this.getOrdersTabHTML(data);
    } else if (tab === 'products') {
      return this.getProductsTabHTML(data);
    } else if (tab === 'customers') {
      return this.getCustomersTabHTML(data);
    }
    return '';
  }

  // ================= TAB 1: OVERVIEW =================
  getOverviewTabHTML({ orders, users, totalRevenue, totalProducts }) {
    const recentOrders = orders.slice(0, 5);

    return `
      <div class="admin-overview-grid">
        <!-- 4 Metric Cards -->
        <div class="admin-stats-grid">
          <div class="admin-stat-card">
            <div class="admin-stat-icon gold"><i class="fas fa-vault"></i></div>
            <div class="admin-stat-info">
              <span class="admin-stat-label">Total Gross Revenue</span>
              <span class="admin-stat-val">$${totalRevenue.toFixed(2)}</span>
            </div>
          </div>

          <div class="admin-stat-card">
            <div class="admin-stat-icon emerald"><i class="fas fa-receipt"></i></div>
            <div class="admin-stat-info">
              <span class="admin-stat-label">Total Orders Placed</span>
              <span class="admin-stat-val">${orders.length}</span>
            </div>
          </div>

          <div class="admin-stat-card">
            <div class="admin-stat-icon purple"><i class="fas fa-user-tie"></i></div>
            <div class="admin-stat-info">
              <span class="admin-stat-label">Registered VIP Clients</span>
              <span class="admin-stat-val">${users.length}</span>
            </div>
          </div>

          <div class="admin-stat-card">
            <div class="admin-stat-icon blue"><i class="fas fa-gem"></i></div>
            <div class="admin-stat-info">
              <span class="admin-stat-label">Curated Masterpieces</span>
              <span class="admin-stat-val">${totalProducts}</span>
            </div>
          </div>
        </div>

        <!-- Recent Orders Showcase -->
        <div class="admin-card-section">
          <div class="admin-card-section-header">
            <h3><i class="fas fa-clock-rotate-left"></i> Recent Luxury Acquisitions</h3>
            <button type="button" class="btn-admin-link" data-switch-to-tab="orders">View All Orders &rarr;</button>
          </div>

          ${recentOrders.length === 0 ? `
            <div class="admin-empty-state">
              <i class="fas fa-shopping-bag"></i>
              <p>No orders placed in the system yet. Waiting for client acquisitions.</p>
            </div>
          ` : `
            <div class="admin-table-wrap">
              <table class="admin-table">
                <thead>
                  <tr>
                    <th>Order Ref</th>
                    <th>Date & Time</th>
                    <th>VIP Client</th>
                    <th>Items</th>
                    <th>Investment</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  ${recentOrders.map(order => `
                    <tr>
                      <td><strong style="color:#D4AF37;font-family:'Cinzel',serif;">#${order.orderId}</strong></td>
                      <td style="color:rgba(255,255,255,0.6);font-size:0.8rem;">${order.formattedDate}</td>
                      <td>
                        <div style="font-weight:600;color:#FFF;">${order.userName || 'VIP Client'}</div>
                        <div style="font-size:0.75rem;color:rgba(255,255,255,0.5);">${order.userEmail}</div>
                      </td>
                      <td>${(order.items || []).length} Item(s)</td>
                      <td><strong style="color:#D4AF37;">$${(order.summary?.total || 0).toFixed(2)}</strong></td>
                      <td><span class="order-status-badge">${order.status}</span></td>
                      <td>
                        <button type="button" class="btn-admin-table-action" data-view-order-id="${order.orderId}">
                          <i class="fas fa-eye"></i> Details
                        </button>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          `}
        </div>
      </div>
    `;
  }

  // ================= TAB 2: ORDERS =================
  getOrdersTabHTML({ orders }) {
    let filtered = [...orders];

    if (this.orderFilterStatus !== 'all') {
      filtered = filtered.filter(o => o.status && o.status.toLowerCase().includes(this.orderFilterStatus.toLowerCase()));
    }

    if (this.orderSearchQuery) {
      const q = this.orderSearchQuery.toLowerCase();
      filtered = filtered.filter(o =>
        (o.orderId && o.orderId.toLowerCase().includes(q)) ||
        (o.userName && o.userName.toLowerCase().includes(q)) ||
        (o.userEmail && o.userEmail.toLowerCase().includes(q)) ||
        (o.shippingAddress?.address && o.shippingAddress.address.toLowerCase().includes(q))
      );
    }

    return `
      <div class="admin-orders-manager">
        <!-- Search & Filter Controls -->
        <div class="admin-filter-bar">
          <div class="admin-search-box">
            <i class="fas fa-search"></i>
            <input type="text" id="admin-orders-search" placeholder="Search order ID, client name, email..." value="${this.orderSearchQuery}" />
          </div>

          <div class="admin-filter-pills">
            <button type="button" class="admin-pill-btn ${this.orderFilterStatus === 'all' ? 'active' : ''}" data-order-status="all">All (${orders.length})</button>
            <button type="button" class="admin-pill-btn ${this.orderFilterStatus === 'confirmed' ? 'active' : ''}" data-order-status="confirmed">Confirmed</button>
            <button type="button" class="admin-pill-btn ${this.orderFilterStatus === 'packaging' ? 'active' : ''}" data-order-status="packaging">In Packaging</button>
            <button type="button" class="admin-pill-btn ${this.orderFilterStatus === 'dispatched' ? 'active' : ''}" data-order-status="dispatched">Dispatched</button>
            <button type="button" class="admin-pill-btn ${this.orderFilterStatus === 'delivered' ? 'active' : ''}" data-order-status="delivered">Delivered</button>
          </div>
        </div>

        ${filtered.length === 0 ? `
          <div class="admin-empty-state">
            <i class="fas fa-receipt"></i>
            <p>No matching orders found.</p>
          </div>
        ` : `
          <div class="admin-orders-cards-list">
            ${filtered.map(order => {
              const addr = order.shippingAddress || {};
              const items = order.items || [];
              const summary = order.summary || {};

              return `
                <div class="admin-order-detail-card" data-order-id="${order.orderId}">
                  <div class="admin-order-card-header">
                    <div>
                      <span class="order-ref-num" style="font-size:1.1rem;">#${order.orderId}</span>
                      <span class="order-date-text" style="display:inline-block;margin-left:8px;">${order.formattedDate}</span>
                    </div>

                    <div class="admin-status-control-wrap">
                      <label style="font-size:0.75rem;color:rgba(212,175,55,0.85);margin-right:6px;font-weight:600;">Status:</label>
                      <select class="admin-status-select" data-order-id="${order.orderId}">
                        <option value="Confirmed & Atelier Preparing" ${order.status === 'Confirmed & Atelier Preparing' ? 'selected' : ''}>Confirmed & Atelier Preparing</option>
                        <option value="In Vault Packaging" ${order.status === 'In Vault Packaging' ? 'selected' : ''}>In Vault Packaging</option>
                        <option value="Dispatched via Express Courier" ${order.status === 'Dispatched via Express Courier' ? 'selected' : ''}>Dispatched via Express Courier</option>
                        <option value="Delivered & Completed" ${order.status === 'Delivered & Completed' ? 'selected' : ''}>Delivered & Completed</option>
                      </select>
                    </div>
                  </div>

                  <div class="admin-order-card-body-grid">
                    <!-- Client & Shipping Details -->
                    <div class="admin-order-client-pane">
                      <div class="admin-mini-section-title"><i class="fas fa-user-circle"></i> VIP Client Information</div>
                      <div style="color:#FFF;font-weight:600;margin-bottom:2px;">${order.userName || 'VIP Client'}</div>
                      <div style="color:rgba(255,255,255,0.6);font-size:0.8rem;"><i class="fas fa-envelope"></i> ${order.userEmail}</div>
                      ${order.userPhone ? `<div style="color:rgba(255,255,255,0.6);font-size:0.8rem;"><i class="fas fa-phone"></i> ${order.userPhone}</div>` : ''}

                      <div class="admin-mini-section-title" style="margin-top:12px;"><i class="fas fa-location-dot"></i> Shipping Destination</div>
                      <div style="color:#FFF;font-size:0.85rem;">${addr.address || 'Penthouse Suite'}</div>
                      <div style="color:rgba(255,255,255,0.6);font-size:0.8rem;">${addr.city || ''}, ${addr.state || ''} ${addr.zip || ''}</div>
                      <div style="color:#34d399;font-size:0.8rem;margin-top:6px;"><i class="fas fa-lock"></i> Payment: ${order.paymentMethod}</div>
                    </div>

                    <!-- Purchased Items Preview -->
                    <div class="admin-order-items-pane">
                      <div class="admin-mini-section-title"><i class="fas fa-box-open"></i> Line Items (${items.reduce((s, i) => s + i.quantity, 0)})</div>
                      <div class="admin-items-scroll-list">
                        ${items.map(item => `
                          <div class="admin-order-line-item">
                            ${item.image ? `<img src="${encodeURI(item.image)}" alt="${item.title}" class="admin-line-img" />` : `<div class="admin-line-img" style="display:flex;align-items:center;justify-content:center;color:#D4AF37;"><i class="fas fa-gem"></i></div>`}
                            <div style="flex:1;">
                              <div style="color:#FFF;font-weight:500;font-size:0.85rem;">${item.title}</div>
                              <div style="font-size:0.75rem;color:rgba(255,255,255,0.5);">Size: ${item.size} &bull; Color: ${item.color} &bull; Qty: ${item.quantity}</div>
                            </div>
                            <div style="color:#D4AF37;font-weight:600;font-size:0.9rem;">$${(item.price * item.quantity).toFixed(2)}</div>
                          </div>
                        `).join('')}
                      </div>

                      <div class="admin-order-cost-strip">
                        <span>Subtotal: $${(summary.subtotal || 0).toFixed(2)}</span>
                        ${summary.discountAmount ? `<span style="color:#34d399;">Discount: -$${summary.discountAmount.toFixed(2)}</span>` : ''}
                        <span>Courier: ${summary.shipping === 0 ? 'FREE' : `$${summary.shipping.toFixed(2)}`}</span>
                        <span>Tax: $${(summary.tax || 0).toFixed(2)}</span>
                        <strong style="color:#D4AF37;font-size:1rem;">Grand Total: $${(summary.total || 0).toFixed(2)}</strong>
                      </div>
                    </div>
                  </div>

                  <div class="admin-order-card-footer">
                    <button type="button" class="btn-admin-table-action" data-view-order-id="${order.orderId}">
                      <i class="fas fa-file-invoice"></i> View Official Invoice Receipt
                    </button>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        `}
      </div>
    `;
  }

  // ================= TAB 3: PRODUCTS =================
  getProductsTabHTML() {
    let prods = [...PRODUCTS];

    if (this.productFilterDept !== 'all') {
      prods = prods.filter(p => p.department && p.department.toLowerCase() === this.productFilterDept.toLowerCase());
    }

    if (this.productSearchQuery) {
      const q = this.productSearchQuery.toLowerCase();
      prods = prods.filter(p =>
        (p.title && p.title.toLowerCase().includes(q)) ||
        (p.tag && p.tag.toLowerCase().includes(q)) ||
        (p.department && p.department.toLowerCase().includes(q)) ||
        (p.id && p.id.toLowerCase().includes(q))
      );
    }

    return `
      <div class="admin-products-manager">
        <div class="admin-filter-bar">
          <div class="admin-search-box">
            <i class="fas fa-search"></i>
            <input type="text" id="admin-products-search" placeholder="Search product title, material tag, ID..." value="${this.productSearchQuery}" />
          </div>

          <div class="admin-filter-pills">
            <button type="button" class="admin-pill-btn ${this.productFilterDept === 'all' ? 'active' : ''}" data-prod-dept="all">All Departments (${PRODUCTS.length})</button>
            <button type="button" class="admin-pill-btn ${this.productFilterDept === 'male' ? 'active' : ''}" data-prod-dept="male">Men (30)</button>
            <button type="button" class="admin-pill-btn ${this.productFilterDept === 'female' ? 'active' : ''}" data-prod-dept="female">Women (30)</button>
            <button type="button" class="admin-pill-btn ${this.productFilterDept === 'kids' ? 'active' : ''}" data-prod-dept="kids">Kids & Toys (30)</button>
          </div>
        </div>

        <div class="admin-products-table-wrap">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Thumbnail</th>
                <th>Title & Material Tag</th>
                <th>Department</th>
                <th>Section ID</th>
                <th>Price</th>
                <th>Vault Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${prods.map(p => `
                <tr>
                  <td>
                    ${p.image ? `<img src="${encodeURI(p.image)}" alt="${p.title}" class="admin-prod-thumb" />` : `<div class="admin-prod-thumb" style="display:flex;align-items:center;justify-content:center;color:#D4AF37;background:rgba(255,255,255,0.05);"><i class="fas fa-gem"></i></div>`}
                  </td>
                  <td>
                    <div style="font-weight:600;color:#FFF;">${p.title}</div>
                    <div style="font-size:0.75rem;color:rgba(212,175,55,0.8);">${p.tag || 'Haute Couture'}</div>
                  </td>
                  <td><span class="admin-dept-badge ${p.department.toLowerCase()}">${p.department}</span></td>
                  <td style="font-size:0.75rem;color:rgba(255,255,255,0.5);">${p.videoRefId || p.id}</td>
                  <td><strong style="color:#D4AF37;font-size:0.95rem;">$${p.price}</strong></td>
                  <td><span style="color:#34d399;font-size:0.75rem;font-weight:600;"><i class="fas fa-circle" style="font-size:0.5rem;vertical-align:middle;margin-right:4px;"></i> Active in Vault</span></td>
                  <td>
                    <button type="button" class="btn-admin-table-action" data-inspect-prod-id="${p.id}">
                      <i class="fas fa-eye"></i> View Detail
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  // ================= TAB 4: CUSTOMERS =================
  getCustomersTabHTML({ users, orders }) {
    let filtered = [...users];

    if (this.customerSearchQuery) {
      const q = this.customerSearchQuery.toLowerCase();
      filtered = filtered.filter(u =>
        (u.name && u.name.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.phone && u.phone.toLowerCase().includes(q))
      );
    }

    return `
      <div class="admin-customers-manager">
        <div class="admin-filter-bar">
          <div class="admin-search-box" style="flex:1;">
            <i class="fas fa-search"></i>
            <input type="text" id="admin-customers-search" placeholder="Search customer name, email, phone..." value="${this.customerSearchQuery}" />
          </div>
          <div style="font-size:0.85rem;color:rgba(212,175,55,0.9);font-weight:600;display:flex;align-items:center;">
            Total Registered VIP Members: ${users.length}
          </div>
        </div>

        ${filtered.length === 0 ? `
          <div class="admin-empty-state">
            <i class="fas fa-users"></i>
            <p>No registered customers found.</p>
          </div>
        ` : `
          <div class="admin-table-wrap">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Contact Email</th>
                  <th>Telephone</th>
                  <th>VIP Membership</th>
                  <th>Orders Count</th>
                  <th>Total Lifetime Spend</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                ${filtered.map(u => {
                  const userOrders = orders.filter(o => o.userEmail && o.userEmail.toLowerCase() === u.email.toLowerCase());
                  const totalSpent = userOrders.reduce((sum, o) => sum + (o.summary?.total || 0), 0);

                  return `
                    <tr>
                      <td>
                        <div style="display:flex;align-items:center;gap:10px;">
                          <div class="admin-user-avatar-mini"><i class="fas fa-user"></i></div>
                          <strong style="color:#FFF;">${u.name || (u.firstName + ' ' + u.lastName)}</strong>
                        </div>
                      </td>
                      <td style="color:rgba(255,255,255,0.7);">${u.email}</td>
                      <td style="color:rgba(255,255,255,0.6);">${u.phone || '—'}</td>
                      <td><span style="color:#D4AF37;font-weight:600;font-size:0.78rem;"><i class="fas fa-crown"></i> VIP Black Diamond</span></td>
                      <td><strong style="color:#FFF;">${userOrders.length} Order(s)</strong></td>
                      <td><strong style="color:#D4AF37;font-size:0.95rem;">$${totalSpent.toFixed(2)}</strong></td>
                      <td>
                        <button type="button" class="btn-admin-table-action" data-filter-orders-user="${u.email}">
                          <i class="fas fa-boxes-stacked"></i> View Orders
                        </button>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>
    `;
  }

  // ================= TAB EVENTS BINDING =================
  bindTabEvents(tab) {
    const modal = this.adminModal;
    if (!modal) return;

    // Switch to tab links
    modal.querySelectorAll('[data-switch-to-tab]').forEach(btn => {
      btn.onclick = () => {
        const next = btn.dataset.switchToTab;
        this.renderDashboard(next);
      };
    });

    // Orders Filter Pills
    modal.querySelectorAll('[data-order-status]').forEach(btn => {
      btn.onclick = () => {
        this.orderFilterStatus = btn.dataset.orderStatus;
        this.renderDashboard('orders');
      };
    });

    // Orders Search Input
    const ordersSearch = modal.querySelector('#admin-orders-search');
    if (ordersSearch) {
      ordersSearch.oninput = (e) => {
        this.orderSearchQuery = e.target.value;
        this.renderDashboard('orders');
        const nextInp = modal.querySelector('#admin-orders-search');
        if (nextInp) {
          nextInp.focus();
          nextInp.setSelectionRange(nextInp.value.length, nextInp.value.length);
        }
      };
    }

    // Order Status Select Change
    modal.querySelectorAll('.admin-status-select').forEach(select => {
      select.onchange = () => {
        const orderId = select.dataset.orderId;
        const newStatus = select.value;
        const order = (auth.orders || []).find(o => o.orderId === orderId);
        if (order) {
          order.status = newStatus;
          auth.saveOrders();
          if (this.ui) {
            this.ui.playAudio('chime');
            this.ui.showToast(`Order #${orderId} status updated to: ${newStatus}`, 'success');
          }
        }
      };
    });

    // View Order Details / Invoice
    modal.querySelectorAll('[data-view-order-id]').forEach(btn => {
      btn.onclick = () => {
        const id = btn.dataset.viewOrderId;
        if (this.ui) {
          this.ui.renderInvoiceModal(id);
        }
      };
    });

    // Products Filter Pills
    modal.querySelectorAll('[data-prod-dept]').forEach(btn => {
      btn.onclick = () => {
        this.productFilterDept = btn.dataset.prodDept;
        this.renderDashboard('products');
      };
    });

    // Products Search Input
    const prodsSearch = modal.querySelector('#admin-products-search');
    if (prodsSearch) {
      prodsSearch.oninput = (e) => {
        this.productSearchQuery = e.target.value;
        this.renderDashboard('products');
        const nextInp = modal.querySelector('#admin-products-search');
        if (nextInp) {
          nextInp.focus();
          nextInp.setSelectionRange(nextInp.value.length, nextInp.value.length);
        }
      };
    }

    // Inspect Product Detail Modal
    modal.querySelectorAll('[data-inspect-prod-id]').forEach(btn => {
      btn.onclick = () => {
        const id = btn.dataset.inspectProdId;
        this.closePortal();
        if (this.ui) {
          this.ui.openQuickView(id);
        }
      };
    });

    // Customers Search Input
    const custSearch = modal.querySelector('#admin-customers-search');
    if (custSearch) {
      custSearch.oninput = (e) => {
        this.customerSearchQuery = e.target.value;
        this.renderDashboard('customers');
        const nextInp = modal.querySelector('#admin-customers-search');
        if (nextInp) {
          nextInp.focus();
          nextInp.setSelectionRange(nextInp.value.length, nextInp.value.length);
        }
      };
    }

    // Filter orders by customer
    modal.querySelectorAll('[data-filter-orders-user]').forEach(btn => {
      btn.onclick = () => {
        const userEmail = btn.dataset.filterOrdersUser;
        this.orderSearchQuery = userEmail;
        this.orderFilterStatus = 'all';
        this.renderDashboard('orders');
      };
    });
  }
}
