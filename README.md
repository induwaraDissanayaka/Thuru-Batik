# Batik Lanka - Sri Lankan Batik E-Commerce

A complete modern e-commerce website for selling authentic Sri Lankan Batik clothing and accessories.

## Features

### Customer Features
- Authentication - Email/password & Google Sign-In
- Shopping Cart - Add, remove, update quantities
- Wishlist - Save favorites for later
- Search & Filter - Instant search, category & price filters
- Bilingual - English & Sinhala with language switcher
- Dark/Light Mode - Theme toggle with persistence
- PWA Support - Install as app, offline functionality
- Payment - PayHere, Cash on Delivery
- Reviews & Ratings - Product reviews with approval system
- Order Tracking - Track order status in real-time

### Admin Dashboard
- Analytics - Sales, revenue, best-selling products
- Product Management - CRUD operations with image upload
- Order Management - Update order statuses
- Customer Management - View & block customers
- Message Center - Customer contact messages
- Settings - Website config, banners, delivery charges

## Quick Start

### 1. Firebase Setup
1. Create a Firebase project at console.firebase.google.com
2. Enable Authentication (Email/Password & Google)
3. Create Firestore Database
4. Enable Storage
5. Copy your config to js/main.js CONFIG.firebase

### 2. PayHere Setup
1. Create account at payhere.lk
2. Get Merchant ID and Secret
3. Update js/main.js CONFIG.payhere

### 3. Deploy
Option A: Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

Option B: GitHub Pages
1. Push to GitHub repository
2. Enable GitHub Pages in repository settings
3. Set source to main branch

## Project Structure

```
batik-lanka/
├── index.html              # Home page
├── products.html           # Product listing
├── product.html            # Product detail
├── cart.html               # Shopping cart
├── checkout.html           # Checkout
├── login.html              # Login
├── register.html           # Registration
├── forgot-password.html    # Password reset
├── profile.html            # User profile
├── orders.html             # Order history
├── wishlist.html           # Wishlist
├── contact.html            # Contact page
├── about.html              # About page
├── admin/
│   ├── index.html          # Admin dashboard
│   ├── products.html       # Product management
│   ├── orders.html         # Order management
│   ├── customers.html      # Customer management
│   ├── reviews.html        # Review moderation
│   ├── messages.html       # Contact messages
│   ├── reports.html        # Sales reports
│   └── settings.html       # Website settings
├── css/
│   └── style.css           # Main stylesheet
├── js/
│   ├── main.js             # Main JavaScript
│   └── sw.js               # Service Worker
├── firebase/
│   └── config.js           # Firebase config & rules
├── lang/
│   ├── en.json             # English translations
│   └── si.json             # Sinhala translations
├── images/                 # Image assets
└── README.md
```

## Design System

| Element | Value |
|---------|-------|
| Primary | #8B6914 (Gold) |
| Secondary | #3E2723 (Dark Brown) |
| Accent | #D4AF37 (Bright Gold) |
| Background Light | #FAFAFA |
| Background Dark | #0F0A05 |

## Security Features

- Firebase Authentication with secure tokens
- Firestore Security Rules for data protection
- Input validation on all forms
- HTTPS enforced
- Admin-only dashboard access
- XSS and CSRF protection

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+
- Opera 67+

## License

MIT License - Batik Lanka 2026
