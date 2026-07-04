/**
 * ============================================
 * BATIK LANKA - Main JavaScript
 * Features: Firebase Auth, Firestore, Storage
 * i18n, Cart, Wishlist, Theme, PWA
 * ============================================
 */

// ============================================
// CONFIGURATION
// ============================================
const CONFIG = {
  firebase: {
    apiKey: "YOUR_FIREBASE_API_KEY",
    authDomain: "batik-lanka.firebaseapp.com",
    projectId: "batik-lanka",
    storageBucket: "batik-lanka.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
  },
  payhere: {
    merchantId: "YOUR_PAYHERE_MERCHANT_ID",
    merchantSecret: "YOUR_PAYHERE_SECRET"
  },
  currency: "LKR",
  deliveryCharge: 350,
  lowStockThreshold: 5
};

// ============================================
// STATE MANAGEMENT
// ============================================
const State = {
  user: null,
  cart: JSON.parse(localStorage.getItem('batik_cart')) || [],
  wishlist: JSON.parse(localStorage.getItem('batik_wishlist')) || [],
  lang: localStorage.getItem('batik_lang') || 'en',
  theme: localStorage.getItem('batik_theme') || 'light',
  notifications: [],

  // Auth state
  setUser(user) {
    this.user = user;
    EventBus.emit('auth:changed', user);
  },

  // Cart operations
  addToCart(product, quantity = 1, size = null, color = null) {
    const existing = this.cart.find(item => 
      item.id === product.id && item.size === size && item.color === color
    );
    if (existing) {
      existing.quantity += quantity;
    } else {
      this.cart.push({ ...product, quantity, size, color });
    }
    this.saveCart();
    EventBus.emit('cart:updated', this.cart);
    Toast.success(i18n.t('notifications.added_to_cart'));
  },

  removeFromCart(index) {
    this.cart.splice(index, 1);
    this.saveCart();
    EventBus.emit('cart:updated', this.cart);
  },

  updateCartQuantity(index, quantity) {
    if (quantity <= 0) {
      this.removeFromCart(index);
      return;
    }
    this.cart[index].quantity = quantity;
    this.saveCart();
    EventBus.emit('cart:updated', this.cart);
  },

  saveCart() {
    localStorage.setItem('batik_cart', JSON.stringify(this.cart));
  },

  getCartTotal() {
    return this.cart.reduce((sum, item) => {
      const price = item.discountPrice || item.price;
      return sum + (price * item.quantity);
    }, 0);
  },

  getCartCount() {
    return this.cart.reduce((sum, item) => sum + item.quantity, 0);
  },

  // Wishlist operations
  toggleWishlist(product) {
    const index = this.wishlist.findIndex(item => item.id === product.id);
    if (index > -1) {
      this.wishlist.splice(index, 1);
      Toast.info('Removed from wishlist');
    } else {
      this.wishlist.push(product);
      Toast.success(i18n.t('notifications.added_to_wishlist'));
    }
    localStorage.setItem('batik_wishlist', JSON.stringify(this.wishlist));
    EventBus.emit('wishlist:updated', this.wishlist);
  },

  isInWishlist(productId) {
    return this.wishlist.some(item => item.id === productId);
  },

  // Theme
  setTheme(theme) {
    this.theme = theme;
    localStorage.setItem('batik_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    EventBus.emit('theme:changed', theme);
  },

  toggleTheme() {
    this.setTheme(this.theme === 'light' ? 'dark' : 'light');
  },

  // Language
  setLang(lang) {
    this.lang = lang;
    localStorage.setItem('batik_lang', lang);
    i18n.load(lang).then(() => {
      EventBus.emit('lang:changed', lang);
    });
  }
};

// ============================================
// EVENT BUS (Pub/Sub)
// ============================================
const EventBus = {
  events: {},
  on(event, callback) {
    if (!this.events[event]) this.events[event] = [];
    this.events[event].push(callback);
  },
  off(event, callback) {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter(cb => cb !== callback);
  },
  emit(event, data) {
    if (!this.events[event]) return;
    this.events[event].forEach(cb => cb(data));
  }
};

// ============================================
// INTERNATIONALIZATION (i18n)
// ============================================
const i18n = {
  translations: {},
  currentLang: 'en',

  async load(lang) {
    try {
      const response = await fetch(`lang/${lang}.json`);
      this.translations = await response.json();
      this.currentLang = lang;
      this.updatePage();
    } catch (error) {
      console.error('Failed to load language:', error);
    }
  },

  t(key, fallback = '') {
    const keys = key.split('.');
    let value = this.translations;
    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) return fallback || key;
    }
    return value;
  },

  updatePage() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const translation = this.t(key);
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.placeholder = translation;
      } else {
        el.textContent = translation;
      }
    });
    document.documentElement.lang = this.currentLang;
  }
};

// ============================================
// TOAST NOTIFICATIONS
// ============================================
const Toast = {
  container: null,

  init() {
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.className = 'toast-container';
      document.body.appendChild(this.container);
    }
  },

  show(message, type = 'info', duration = 3000) {
    this.init();
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    };

    toast.innerHTML = `
      <span style="font-size:1.2rem">${icons[type]}</span>
      <span>${message}</span>
    `;

    this.container.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'slideInRight 0.4s ease reverse';
      setTimeout(() => toast.remove(), 400);
    }, duration);
  },

  success(msg) { this.show(msg, 'success'); },
  error(msg) { this.show(msg, 'error'); },
  warning(msg) { this.show(msg, 'warning'); },
  info(msg) { this.show(msg, 'info'); }
};

// ============================================
// FIREBASE SERVICES (Mock implementation for demo)
// In production, uncomment Firebase SDK imports
// ============================================
const Firebase = {
  auth: null,
  db: null,
  storage: null,

  init() {
    // Mock auth state for demo
    this.auth = {
      currentUser: null,
      onAuthStateChanged: (cb) => {},
      signInWithEmailAndPassword: async () => ({ user: { uid: 'demo', email: 'demo@batik.lk' } }),
      createUserWithEmailAndPassword: async () => ({ user: { uid: 'demo', email: 'demo@batik.lk' } }),
      signInWithPopup: async () => ({ user: { uid: 'demo', email: 'demo@batik.lk' } }),
      sendPasswordResetEmail: async () => true,
      signOut: async () => true
    };

    // Mock Firestore
    this.db = {
      collection: (name) => ({
        doc: (id) => ({
          get: async () => ({ exists: true, data: () => ({}) }),
          set: async () => true,
          update: async () => true,
          delete: async () => true
        }),
        add: async () => ({ id: 'mock-id' }),
        where: () => ({
          get: async () => ({ docs: [], forEach: () => {} })
        }),
        orderBy: () => ({
          get: async () => ({ docs: [], forEach: () => {} })
        }),
        get: async () => ({ docs: [], forEach: () => {} })
      })
    };

    // Mock Storage
    this.storage = {
      ref: (path) => ({
        put: async () => ({ ref: { getDownloadURL: async () => 'https://example.com/image.jpg' } }),
        getDownloadURL: async () => 'https://example.com/image.jpg',
        delete: async () => true
      })
    };
  },

  async login(email, password) {
    try {
      const result = await this.auth.signInWithEmailAndPassword(email, password);
      State.setUser(result.user);
      return result.user;
    } catch (error) {
      throw new Error(this.getAuthError(error));
    }
  },

  async register(email, password, displayName) {
    try {
      const result = await this.auth.createUserWithEmailAndPassword(email, password);
      await this.db.collection('users').doc(result.user.uid).set({
        email,
        displayName,
        role: 'customer',
        createdAt: new Date(),
        addresses: [],
        phone: ''
      });
      State.setUser(result.user);
      return result.user;
    } catch (error) {
      throw new Error(this.getAuthError(error));
    }
  },

  async googleLogin() {
    try {
      const result = await this.auth.signInWithPopup({ providerId: 'google.com' });
      const userDoc = await this.db.collection('users').doc(result.user.uid).get();
      if (!userDoc.exists) {
        await this.db.collection('users').doc(result.user.uid).set({
          email: result.user.email,
          displayName: result.user.displayName,
          photoURL: result.user.photoURL,
          role: 'customer',
          createdAt: new Date(),
          addresses: [],
          phone: ''
        });
      }
      State.setUser(result.user);
      return result.user;
    } catch (error) {
      throw new Error(this.getAuthError(error));
    }
  },

  async resetPassword(email) {
    await this.auth.sendPasswordResetEmail(email);
  },

  async logout() {
    await this.auth.signOut();
    State.setUser(null);
  },

  getAuthError(error) {
    const errors = {
      'auth/user-not-found': 'No account found with this email',
      'auth/wrong-password': 'Incorrect password',
      'auth/email-already-in-use': 'Email already registered',
      'auth/weak-password': 'Password should be at least 6 characters',
      'auth/invalid-email': 'Invalid email address'
    };
    return errors[error.code] || error.message || 'Authentication failed';
  },

  async getProducts(filters = {}) {
    let query = this.db.collection('products');
    if (filters.category) query = query.where('category', '==', filters.category);
    if (filters.minPrice !== undefined) query = query.where('price', '>=', filters.minPrice);
    if (filters.maxPrice !== undefined) query = query.where('price', '<=', filters.maxPrice);
    const snapshot = await query.get();
    const products = [];
    snapshot.forEach(doc => products.push({ id: doc.id, ...doc.data() }));
    return products;
  },

  async getProduct(id) {
    const doc = await this.db.collection('products').doc(id).get();
    return doc.exists ? { id: doc.id, ...doc.data() } : null;
  },

  async createOrder(orderData) {
    const order = { ...orderData, status: 'pending', createdAt: new Date(), updatedAt: new Date() };
    const docRef = await this.db.collection('orders').add(order);
    return docRef.id;
  },

  async getOrders(userId) {
    const snapshot = await this.db.collection('orders').where('userId', '==', userId).orderBy('createdAt', 'desc').get();
    const orders = [];
    snapshot.forEach(doc => orders.push({ id: doc.id, ...doc.data() }));
    return orders;
  },

  async submitReview(reviewData) {
    await this.db.collection('reviews').add({ ...reviewData, approved: false, createdAt: new Date() });
  },

  async submitContact(messageData) {
    await this.db.collection('messages').add({ ...messageData, read: false, createdAt: new Date() });
  },

  async uploadImage(file, path) {
    const storageRef = this.storage.ref(`${path}/${Date.now()}_${file.name}`);
    const snapshot = await storageRef.put(file);
    return await snapshot.ref.getDownloadURL();
  }
};

// ============================================
// PAYMENT GATEWAY (PayHere Integration)
// ============================================
const Payment = {
  async processPayHere(orderData) {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = 'https://sandbox.payhere.lk/pay/checkout';

    const fields = {
      merchant_id: CONFIG.payhere.merchantId,
      return_url: `${window.location.origin}/orders.html`,
      cancel_url: `${window.location.origin}/cart.html`,
      notify_url: `${window.location.origin}/api/payhere-notify`,
      order_id: orderData.orderId,
      items: orderData.items,
      currency: CONFIG.currency,
      amount: orderData.amount,
      first_name: orderData.firstName,
      last_name: orderData.lastName,
      email: orderData.email,
      phone: orderData.phone,
      address: orderData.address,
      city: orderData.city,
      country: 'Sri Lanka'
    };

    for (const [key, value] of Object.entries(fields)) {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = value;
      form.appendChild(input);
    }

    document.body.appendChild(form);
    form.submit();
  },

  async processCOD(orderData) {
    return await Firebase.createOrder({ ...orderData, paymentMethod: 'cod', paymentStatus: 'pending' });
  }
};

// ============================================
// UI COMPONENTS
// ============================================
const UI = {
  renderProductCard(product) {
    const discount = product.originalPrice 
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) 
      : 0;
    const isWishlisted = State.isInWishlist(product.id);
    const productJSON = JSON.stringify(product).replace(/"/g, '&quot;');

    return `
      <div class="product-card animate-on-scroll" data-product-id="${product.id}">
        <div class="product-image">
          <img src="${product.images?.[0] || 'images/placeholder.jpg'}" 
               alt="${product.name}" loading="lazy">
          ${discount > 0 ? `<span class="product-badge badge-sale">-${discount}%</span>` : ''}
          ${product.isNew ? '<span class="product-badge badge-new">New</span>' : ''}
          <div class="product-actions">
            <button class="action-btn wishlist-btn ${isWishlisted ? 'active' : ''}" 
                    onclick="State.toggleWishlist(${productJSON})"
                    title="${isWishlisted ? 'Remove from' : 'Add to'} Wishlist">
              <i class="fas fa-heart"></i>
            </button>
            <button class="action-btn" onclick="quickView('${product.id}')" title="Quick View">
              <i class="fas fa-eye"></i>
            </button>
          </div>
        </div>
        <div class="product-info">
          <div class="product-category">${product.category}</div>
          <h3 class="product-name">${product.name}</h3>
          <div class="product-rating">
            <span class="stars">${'★'.repeat(Math.floor(product.rating || 0))}${'☆'.repeat(5 - Math.floor(product.rating || 0))}</span>
            <span class="rating-count">(${product.reviewCount || 0})</span>
          </div>
          <div class="product-price">
            <span class="price-current">${CONFIG.currency} ${product.price.toLocaleString()}</span>
            ${product.originalPrice ? `<span class="price-original">${CONFIG.currency} ${product.originalPrice.toLocaleString()}</span>` : ''}
            ${discount > 0 ? `<span class="price-discount">-${discount}%</span>` : ''}
          </div>
          <button class="btn btn-primary btn-sm" style="width:100%;margin-top:0.8rem"
                  onclick="addToCartFromCard('${product.id}')">
            <i class="fas fa-shopping-cart"></i> ${i18n.t('products.add_to_cart', 'Add to Cart')}
          </button>
        </div>
      </div>
    `;
  },

  renderCartItem(item, index) {
    return `
      <div class="cart-item">
        <img src="${item.images?.[0] || 'images/placeholder.jpg'}" alt="${item.name}">
        <div class="cart-item-info">
          <h4>${item.name}</h4>
          <p>${item.size ? 'Size: ' + item.size : ''} ${item.color ? 'Color: ' + item.color : ''}</p>
          <p class="price-current">${CONFIG.currency} ${(item.discountPrice || item.price).toLocaleString()}</p>
        </div>
        <div class="cart-actions" style="display:flex;align-items:center;gap:1rem">
          <div class="quantity-control">
            <button onclick="State.updateCartQuantity(${index}, ${item.quantity - 1})">-</button>
            <span>${item.quantity}</span>
            <button onclick="State.updateCartQuantity(${index}, ${item.quantity + 1})">+</button>
          </div>
          <button class="nav-btn" onclick="State.removeFromCart(${index})" style="color:var(--danger)">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `;
  },

  renderOrderCard(order) {
    const statusClass = `status-${order.status}`;
    return `
      <div class="glass-card" style="padding:1.5rem;margin-bottom:1rem">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;flex-wrap:wrap;gap:0.5rem">
          <div>
            <h4>${i18n.t('orders.order_id', 'Order')} #${order.id.slice(-6).toUpperCase()}</h4>
            <p style="color:var(--text-muted);font-size:0.85rem">${new Date(order.createdAt).toLocaleDateString()}</p>
          </div>
          <span class="status-badge ${statusClass}">${order.status}</span>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center">
          <p>${order.items?.length || 0} ${i18n.t('orders.items', 'items')}</p>
          <p class="price-current">${CONFIG.currency} ${order.total?.toLocaleString()}</p>
        </div>
        <button class="btn btn-outline btn-sm" style="margin-top:1rem;width:100%">
          ${i18n.t('orders.track', 'Track Order')}
        </button>
      </div>
    `;
  },

  updateCartBadge() {
    const badges = document.querySelectorAll('.cart-badge');
    const count = State.getCartCount();
    badges.forEach(badge => {
      badge.textContent = count;
      badge.style.display = count > 0 ? 'flex' : 'none';
    });
  },

  updateWishlistBadge() {
    const badges = document.querySelectorAll('.wishlist-badge');
    const count = State.wishlist.length;
    badges.forEach(badge => {
      badge.textContent = count;
      badge.style.display = count > 0 ? 'flex' : 'none';
    });
  }
};

// ============================================
// NAVIGATION COMPONENT
// ============================================
function renderNavbar() {
  const isAdmin = State.user?.role === 'admin';

  return `
    <nav class="navbar">
      <div class="nav-container">
        <a href="index.html" class="logo">
          <div class="logo-icon">BL</div>
          <span>Batik Lanka</span>
        </a>

        <ul class="nav-links" id="navLinks">
          <li><a href="index.html" data-i18n="nav.home">Home</a></li>
          <li><a href="products.html" data-i18n="nav.products">Products</a></li>
          <li><a href="products.html?categories" data-i18n="nav.categories">Categories</a></li>
          <li><a href="about.html" data-i18n="nav.about">About</a></li>
          <li><a href="contact.html" data-i18n="nav.contact">Contact</a></li>
          ${isAdmin ? '<li><a href="admin/index.html" data-i18n="nav.admin">Admin</a></li>' : ''}
        </ul>

        <div class="nav-actions">
          <div class="search-bar">
            <i class="fas fa-search"></i>
            <input type="text" placeholder="${i18n.t('nav.search', 'Search products...')}" id="searchInput">
          </div>

          <div class="lang-switch">
            <button class="${State.lang === 'en' ? 'active' : ''}" onclick="State.setLang('en')">EN</button>
            <button class="${State.lang === 'si' ? 'active' : ''}" onclick="State.setLang('si')">සිං</button>
          </div>

          <button class="nav-btn" onclick="State.toggleTheme()" title="Toggle Theme">
            <i class="fas fa-${State.theme === 'light' ? 'moon' : 'sun'}"></i>
          </button>

          <a href="wishlist.html" class="nav-btn" title="Wishlist">
            <i class="fas fa-heart"></i>
            <span class="badge wishlist-badge" style="display:none">0</span>
          </a>

          <a href="cart.html" class="nav-btn" title="Cart">
            <i class="fas fa-shopping-cart"></i>
            <span class="badge cart-badge" style="display:none">0</span>
          </a>

          ${State.user ? `
            <div class="nav-user" style="position:relative">
              <button class="nav-btn" onclick="toggleUserMenu()" title="Account">
                <i class="fas fa-user"></i>
              </button>
              <div id="userMenu" style="display:none;position:absolute;top:100%;right:0;background:var(--bg-card);border-radius:12px;padding:0.5rem;min-width:180px;box-shadow:var(--glass-shadow);border:var(--glass-border);z-index:100">
                <a href="profile.html" style="display:block;padding:0.6rem 1rem;color:var(--text-primary);text-decoration:none;border-radius:8px;transition:var(--transition)" onmouseover="this.style.background='var(--bg-secondary)'" onmouseout="this.style.background='none'">
                  <i class="fas fa-user-circle"></i> <span data-i18n="nav.profile">Profile</span>
                </a>
                <a href="orders.html" style="display:block;padding:0.6rem 1rem;color:var(--text-primary);text-decoration:none;border-radius:8px;transition:var(--transition)" onmouseover="this.style.background='var(--bg-secondary)'" onmouseout="this.style.background='none'">
                  <i class="fas fa-box"></i> <span data-i18n="nav.orders">My Orders</span>
                </a>
                <hr style="border:none;border-top:1px solid var(--border-color);margin:0.5rem 0">
                <button onclick="Firebase.logout();window.location.href='index.html'" style="width:100%;text-align:left;padding:0.6rem 1rem;background:none;border:none;color:var(--danger);cursor:pointer;border-radius:8px" onmouseover="this.style.background='var(--bg-secondary)'" onmouseout="this.style.background='none'">
                  <i class="fas fa-sign-out-alt"></i> <span data-i18n="nav.logout">Logout</span>
                </button>
              </div>
            </div>
          ` : `
            <a href="login.html" class="btn btn-primary btn-sm" data-i18n="nav.login">Login</a>
          `}
        </div>

        <button class="mobile-menu-btn" onclick="toggleMobileMenu()">
          <i class="fas fa-bars"></i>
        </button>
      </div>
    </nav>
    <div style="height:70px"></div>
  `;
}

function renderFooter() {
  return `
    <footer class="footer">
      <div class="footer-grid">
        <div class="footer-brand">
          <h3><i class="fas fa-gem" style="color:var(--accent)"></i> Batik Lanka</h3>
          <p data-i18n="footer.about">Authentic Sri Lankan Batik clothing, handcrafted with love and tradition. Bringing the beauty of Ceylon to the world.</p>
          <div class="social-links">
            <a href="#"><i class="fab fa-facebook-f"></i></a>
            <a href="#"><i class="fab fa-instagram"></i></a>
            <a href="#"><i class="fab fa-whatsapp"></i></a>
            <a href="#"><i class="fab fa-tiktok"></i></a>
          </div>
        </div>
        <div class="footer-links">
          <h4 data-i18n="footer.quick_links">Quick Links</h4>
          <ul>
            <li><a href="index.html" data-i18n="nav.home">Home</a></li>
            <li><a href="products.html" data-i18n="nav.products">Products</a></li>
            <li><a href="about.html" data-i18n="nav.about">About</a></li>
            <li><a href="contact.html" data-i18n="nav.contact">Contact</a></li>
          </ul>
        </div>
        <div class="footer-links">
          <h4 data-i18n="footer.customer_service">Customer Service</h4>
          <ul>
            <li><a href="orders.html" data-i18n="nav.orders">My Orders</a></li>
            <li><a href="#" data-i18n="footer.terms">Terms & Conditions</a></li>
            <li><a href="#" data-i18n="footer.privacy">Privacy Policy</a></li>
            <li><a href="#" data-i18n="footer.refund">Refund Policy</a></li>
          </ul>
        </div>
        <div class="footer-links">
          <h4 data-i18n="contact.title">Contact Us</h4>
          <ul>
            <li><i class="fas fa-map-marker-alt"></i> 123 Batik Street, Colombo, Sri Lanka</li>
            <li><i class="fas fa-phone"></i> +94 11 234 5678</li>
            <li><i class="fas fa-envelope"></i> info@batiklanka.lk</li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <p data-i18n="footer.copyright">© 2026 Batik Lanka. All rights reserved.</p>
        <p>Made with <i class="fas fa-heart" style="color:var(--danger)"></i> in Sri Lanka</p>
      </div>
    </footer>
  `;
}

// ============================================
// UTILITY FUNCTIONS
// ============================================
function toggleMobileMenu() {
  document.getElementById('navLinks').classList.toggle('active');
}

function toggleUserMenu() {
  const menu = document.getElementById('userMenu');
  menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
}

function quickView(productId) {
  window.location.href = `product.html?id=${productId}`;
}

function addToCartFromCard(productId) {
  const product = mockProducts.find(p => p.id === productId);
  if (product) {
    State.addToCart(product);
  }
}

function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));
}

function initNavbarScroll() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });
}

// ============================================
// MOCK DATA (For demo purposes)
// ============================================
const mockProducts = [
  {
    id: '1',
    name: 'Traditional Kandyan Batik Saree',
    category: 'Sarees',
    price: 12500,
    originalPrice: 15000,
    images: ['https://images.unsplash.com/photo-1610189012906-4e9b5d5e0b6a?w=400'],
    rating: 4.8,
    reviewCount: 24,
    isNew: true,
    stock: 15,
    sizes: ['Free'],
    colors: ['Red', 'Gold', 'Maroon']
  },
  {
    id: '2',
    name: 'Hand Painted Batik Shirt',
    category: 'Shirts',
    price: 4500,
    images: ['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400'],
    rating: 4.5,
    reviewCount: 18,
    stock: 20,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Blue', 'Green', 'Brown']
  },
  {
    id: '3',
    name: 'Batik Wall Hanging - Elephant',
    category: 'Home Decor',
    price: 8500,
    originalPrice: 10000,
    images: ['https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400'],
    rating: 4.9,
    reviewCount: 32,
    stock: 8,
    sizes: ['Medium', 'Large'],
    colors: ['Multi']
  },
  {
    id: '4',
    name: 'Batik Scarf - Floral Design',
    category: 'Accessories',
    price: 2800,
    images: ['https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=400'],
    rating: 4.3,
    reviewCount: 12,
    isNew: true,
    stock: 30,
    sizes: ['Free'],
    colors: ['Pink', 'Purple', 'Orange']
  },
  {
    id: '5',
    name: 'Batik Table Runner',
    category: 'Home Decor',
    price: 3200,
    images: ['https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400'],
    rating: 4.6,
    reviewCount: 8,
    stock: 25,
    sizes: ['Standard'],
    colors: ['Gold', 'Brown']
  },
  {
    id: '6',
    name: 'Batik Maxi Dress',
    category: 'Dresses',
    price: 9800,
    originalPrice: 12000,
    images: ['https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400'],
    rating: 4.7,
    reviewCount: 15,
    stock: 12,
    sizes: ['S', 'M', 'L'],
    colors: ['Red', 'Black', 'Navy']
  }
];

const mockCategories = [
  { name: 'Sarees', count: 45, image: 'https://images.unsplash.com/photo-1610189012906-4e9b5d5e0b6a?w=400' },
  { name: 'Shirts', count: 32, image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400' },
  { name: 'Dresses', count: 28, image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400' },
  { name: 'Home Decor', count: 56, image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400' },
  { name: 'Accessories', count: 24, image: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=400' },
  { name: 'Kids', count: 18, image: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=400' }
];

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  Firebase.init();
  State.setTheme(State.theme);
  i18n.load(State.lang);
  initScrollAnimations();
  initNavbarScroll();
  UI.updateCartBadge();
  UI.updateWishlistBadge();

  EventBus.on('cart:updated', () => UI.updateCartBadge());
  EventBus.on('wishlist:updated', () => UI.updateWishlistBadge());

  document.addEventListener('click', (e) => {
    const userMenu = document.getElementById('userMenu');
    if (userMenu && !e.target.closest('.nav-user')) {
      userMenu.style.display = 'none';
    }
  });

  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const query = searchInput.value.trim();
        if (query) {
          window.location.href = `products.html?search=${encodeURIComponent(query)}`;
        }
      }
    });
  }
});

// Service Worker for PWA
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('js/sw.js')
    .then(reg => console.log('Service Worker registered'))
    .catch(err => console.log('Service Worker registration failed'));
}
