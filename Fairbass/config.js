/**
 * Firebase Configuration & Security Rules
 * Copy these rules to your Firebase Console
 */

// Firebase Config (replace with your actual values)
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "batik-lanka.firebaseapp.com",
  projectId: "batik-lanka",
  storageBucket: "batik-lanka.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};

// Initialize Firebase
// firebase.initializeApp(firebaseConfig);

/*
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAuthenticated() {
      return request.auth != null;
    }
    function isAdmin() {
      return isAuthenticated() && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    match /users/{userId} {
      allow read: if isOwner(userId) || isAdmin();
      allow create: if isAuthenticated() && request.auth.uid == userId;
      allow update: if isOwner(userId) || isAdmin();
      allow delete: if isAdmin();
    }
    match /products/{productId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    match /orders/{orderId} {
      allow read: if isAuthenticated() && (resource.data.userId == request.auth.uid || isAdmin());
      allow create: if isAuthenticated() && request.resource.data.userId == request.auth.uid;
      allow update: if isAdmin();
      allow delete: if isAdmin();
    }
    match /reviews/{reviewId} {
      allow read: if true;
      allow create: if isAuthenticated();
      allow update, delete: if isAdmin() || (isAuthenticated() && resource.data.userId == request.auth.uid);
    }
    match /messages/{messageId} {
      allow create: if true;
      allow read, update, delete: if isAdmin();
    }
    match /coupons/{couponId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
  }
}
*/

/*
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    function isAuthenticated() {
      return request.auth != null;
    }
    function isAdmin() {
      return isAuthenticated() && 
        firestore.get(/databases/(default)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    match /products/{allPaths=**} {
      allow read: if true;
      allow write: if isAdmin();
    }
    match /users/{userId}/{allPaths=**} {
      allow read: if true;
      allow write: if isAuthenticated() && request.auth.uid == userId;
    }
    match /banners/{allPaths=**} {
      allow read: if true;
      allow write: if isAdmin();
    }
  }
}
*/
