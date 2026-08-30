// MHS STORE - Cart, Wishlist & Store State Management
import { PRODUCTS } from './products.js';

const STORAGE_KEY_CART = 'mhs_store_cart_v1';
const STORAGE_KEY_WISHLIST = 'mhs_store_wishlist_v1';
const FREE_SHIPPING_THRESHOLD = 150;

class StoreState {
  constructor() {
    this.cart = this.loadCart();
    this.wishlist = this.loadWishlist();
    this.activeCoupon = null;
    this.availableCoupons = {
      'MHSVIP': { discountPercent: 15, description: '15% Off VIP Luxury Exclusive' },
      'WELCOME10': { discountPercent: 10, description: '10% Off First Purchase' },
      'FREESHIP': { freeShipping: true, description: 'Complimentary Express Shipping' }
    };
  }

  loadCart() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CART);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Failed to load cart', e);
      return [];
    }
  }

  saveCart() {
    try {
      localStorage.setItem(STORAGE_KEY_CART, JSON.stringify(this.cart));
      this.dispatch('cart-updated', { cart: this.cart, summary: this.getCartSummary() });
    } catch (e) {
      console.error('Failed to save cart', e);
    }
  }

  loadWishlist() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_WISHLIST);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Failed to load wishlist', e);
      return [];
    }
  }

  saveWishlist() {
    try {
      localStorage.setItem(STORAGE_KEY_WISHLIST, JSON.stringify(this.wishlist));
      this.dispatch('wishlist-updated', { wishlist: this.wishlist });
    } catch (e) {
      console.error('Failed to save wishlist', e);
    }
  }

  dispatch(eventName, detail) {
    window.dispatchEvent(new CustomEvent(eventName, { detail }));
  }

  // ================= CART METHODS =================
  addToCart(productOrId, selectedSize = null, selectedColor = null, quantity = 1) {
    const product = typeof productOrId === 'string' 
      ? PRODUCTS.find(p => p.id === productOrId) 
      : productOrId;

    if (!product) {
      console.error('Product not found for cart', productOrId);
      return false;
    }

    const size = selectedSize || (product.sizes && product.sizes.length ? product.sizes[0] : 'Standard');
    const color = selectedColor || (product.colors && product.colors.length ? product.colors[0].name : 'Default');
    const itemKey = `${product.id}__${size}__${color}`;

    const existingIndex = this.cart.findIndex(item => item.itemKey === itemKey);

    if (existingIndex > -1) {
      this.cart[existingIndex].quantity += quantity;
    } else {
      this.cart.push({
        itemKey,
        id: product.id,
        title: product.title,
        price: product.price,
        originalPrice: product.originalPrice || product.price,
        image: product.image || (product.images && product.images[0]) || '',
        department: product.department,
        category: product.category,
        size,
        color,
        quantity
      });
    }

    this.saveCart();
    return true;
  }

  updateQuantity(itemKey, newQuantity) {
    const index = this.cart.findIndex(item => item.itemKey === itemKey);
    if (index > -1) {
      if (newQuantity <= 0) {
        this.cart.splice(index, 1);
      } else {
        this.cart[index].quantity = newQuantity;
      }
      this.saveCart();
    }
  }

  removeFromCart(itemKey) {
    this.cart = this.cart.filter(item => item.itemKey !== itemKey);
    this.saveCart();
  }

  clearCart() {
    this.cart = [];
    this.activeCoupon = null;
    this.saveCart();
  }

  applyCoupon(code) {
    const upper = (code || '').trim().toUpperCase();
    if (this.availableCoupons[upper]) {
      this.activeCoupon = { code: upper, ...this.availableCoupons[upper] };
      this.saveCart();
      return { success: true, coupon: this.activeCoupon };
    }
    return { success: false, message: 'Invalid coupon code. Try "MHSVIP" or "WELCOME10"' };
  }

  removeCoupon() {
    this.activeCoupon = null;
    this.saveCart();
  }

  getCartSummary() {
    const count = this.cart.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    let discountAmount = 0;
    if (this.activeCoupon && this.activeCoupon.discountPercent) {
      discountAmount = (subtotal * this.activeCoupon.discountPercent) / 100;
    }

    const freeShipping = (subtotal >= FREE_SHIPPING_THRESHOLD) || (this.activeCoupon && this.activeCoupon.freeShipping);
    const shipping = subtotal === 0 ? 0 : (freeShipping ? 0 : 25);
    const tax = Number(((subtotal - discountAmount) * 0.08).toFixed(2));
    const total = Math.max(0, subtotal - discountAmount + shipping + tax);

    const neededForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
    const freeShippingProgress = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));

    return {
      count,
      subtotal: Number(subtotal.toFixed(2)),
      discountAmount: Number(discountAmount.toFixed(2)),
      shipping,
      freeShipping,
      neededForFreeShipping,
      freeShippingProgress,
      tax,
      total: Number(total.toFixed(2)),
      activeCoupon: this.activeCoupon
    };
  }

  // ================= WISHLIST METHODS =================
  toggleWishlist(productId) {
    const product = PRODUCTS.find(p => p.id === productId);
    if (!product) return false;

    const index = this.wishlist.findIndex(item => item.id === productId);
    let added = false;
    if (index > -1) {
      this.wishlist.splice(index, 1);
      added = false;
    } else {
      this.wishlist.push({
        id: product.id,
        title: product.title,
        price: product.price,
        originalPrice: product.originalPrice,
        image: product.image || (product.images && product.images[0]) || '',
        category: product.category,
        department: product.department
      });
      added = true;
    }
    this.saveWishlist();
    return added;
  }

  isInWishlist(productId) {
    return this.wishlist.some(item => item.id === productId);
  }

  removeFromWishlist(productId) {
    this.wishlist = this.wishlist.filter(item => item.id !== productId);
    this.saveWishlist();
  }

  moveToCart(productId) {
    this.addToCart(productId);
    this.removeFromWishlist(productId);
  }
}

export const store = new StoreState();
if (typeof window !== 'undefined') {
  window.MHS_CART = store;
}
