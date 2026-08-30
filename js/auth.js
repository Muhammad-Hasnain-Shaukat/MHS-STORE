// =============================================================================
// MHS STORE - LUXURY AUTHENTICATION, REGISTRATION & ORDER MANAGEMENT ENGINE
// =============================================================================

const STORAGE_KEY_USERS = 'mhs_store_users_v1';
const STORAGE_KEY_CURRENT_USER = 'mhs_store_current_user_v1';
const STORAGE_KEY_ORDERS = 'mhs_store_orders_v1';

class AuthManager {
  constructor() {
    this.users = this.loadUsers();
    this.currentUser = this.loadCurrentUser();
    this.orders = this.loadOrders();
  }

  loadUsers() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_USERS);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Failed to load users', e);
      return [];
    }
  }

  saveUsers() {
    try {
      localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(this.users));
    } catch (e) {
      console.error('Failed to save users', e);
    }
  }

  loadOrders() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ORDERS);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Failed to load orders', e);
      return [];
    }
  }

  saveOrders() {
    try {
      localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(this.orders));
    } catch (e) {
      console.error('Failed to save orders', e);
    }
  }

  loadCurrentUser() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CURRENT_USER);
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error('Failed to load current user', e);
      return null;
    }
  }

  setCurrentUser(user) {
    this.currentUser = user;
    if (user) {
      localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY_CURRENT_USER);
    }
    this.dispatchAuthState();
  }

  dispatchAuthState() {
    window.dispatchEvent(new CustomEvent('auth-state-changed', {
      detail: {
        isLoggedIn: this.isLoggedIn(),
        user: this.currentUser
      }
    }));
  }

  isLoggedIn() {
    return !!this.currentUser;
  }

  getCurrentUser() {
    return this.currentUser;
  }

  // ================= REGISTRATION METHOD =================
  register({ firstName, lastName, email, password, phone }) {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanFirstName = (firstName || '').trim();
    const cleanLastName = (lastName || '').trim();
    const cleanPhone = (phone || '').trim();

    if (!cleanFirstName || !cleanEmail || !password) {
      return { success: false, message: 'Please fill in all required fields.' };
    }

    if (password.length < 6) {
      return { success: false, message: 'Password must be at least 6 characters long.' };
    }

    // Check if email already registered
    const existing = this.users.find(u => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      return { success: false, message: 'An account with this email address already exists. Please sign in.' };
    }

    const newUser = {
      id: 'mhs_user_' + Date.now(),
      firstName: cleanFirstName,
      lastName: cleanLastName,
      name: `${cleanFirstName} ${cleanLastName}`.trim(),
      email: cleanEmail,
      password: password,
      phone: cleanPhone,
      registeredAt: new Date().toISOString()
    };

    this.users.push(newUser);
    this.saveUsers();
    this.setCurrentUser(newUser);

    return { success: true, user: newUser };
  }

  // ================= LOGIN METHOD =================
  login({ email, password }) {
    const cleanEmail = (email || '').trim().toLowerCase();

    if (!cleanEmail || !password) {
      return { success: false, message: 'Please provide both your email and password.' };
    }

    const existingUser = this.users.find(u => u.email.toLowerCase() === cleanEmail);
    if (!existingUser) {
      return {
        success: false,
        message: 'No account found with this email. Please click "Create Account" to register first.',
        needSignup: true
      };
    }

    if (existingUser.password !== password) {
      return { success: false, message: 'Incorrect password. Please verify your credentials and try again.' };
    }

    this.setCurrentUser(existingUser);
    return { success: true, user: existingUser };
  }

  // ================= LOGOUT METHOD =================
  logout() {
    this.setCurrentUser(null);
    return { success: true };
  }

  // ================= ORDER TRACKING & MANAGEMENT =================
  saveUserOrder(orderData) {
    if (!this.currentUser) return null;

    const newOrder = {
      orderId: orderData.orderId || `MHS-${Math.floor(100000 + Math.random() * 900000)}`,
      userId: this.currentUser.id,
      userEmail: this.currentUser.email.toLowerCase(),
      userName: this.currentUser.name || `${this.currentUser.firstName} ${this.currentUser.lastName}`,
      userPhone: this.currentUser.phone || orderData.shippingAddress?.phone || '',
      createdAt: new Date().toISOString(),
      formattedDate: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      items: orderData.items || [],
      summary: orderData.summary || {},
      shippingAddress: orderData.shippingAddress || {},
      paymentMethod: orderData.paymentMethod || 'Credit / Debit Card (Encrypted)',
      status: 'Confirmed & Atelier Preparing'
    };

    this.orders.unshift(newOrder); // newest first
    this.saveOrders();
    return newOrder;
  }

  getUserOrders(email = null) {
    const targetEmail = (email || (this.currentUser && this.currentUser.email) || '').toLowerCase();
    if (!targetEmail) return [];
    return this.orders.filter(o => (o.userEmail && o.userEmail.toLowerCase() === targetEmail) || (this.currentUser && o.userId === this.currentUser.id));
  }
}

export const auth = new AuthManager();
