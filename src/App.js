import React, { useState, useEffect, useRef, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, collection, addDoc, getDocs, query, where, doc, updateDoc, onSnapshot, deleteDoc, arrayUnion, arrayRemove, deleteField } from 'firebase/firestore';
import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';

// --- Firebase Configuration ---
// IMPORTANT: For production deployments, it is highly recommended to use environment variables
// instead of hardcoding sensitive API keys directly in your source code.
// Example: process.env.REACT_APP_FIREBASE_API_KEY
const firebaseConfig = {
    apiKey: "AIzaSyAvWYTrdV6T2pu3kYeV3-1nIyHoir37vyg",
    authDomain: "jewel-e-bazaar.firebaseapp.com",
    projectId: "jewel-e-bazaar",
    storageBucket: "jewel-e-bazaar.appspot.com",
    messagingSenderId: "447279134356",
    appId: "1:447279134356:web:a5bbe7d6c1824707dae681",
    measurementId: "G-0PHPCYLYPB"
};

// --- Initialize Firebase ---
// This line initializes the Firebase app with your configuration.
const app = initializeApp(firebaseConfig);
// Get Firebase Authentication service instance.
const auth = getAuth(app);
// Get Firebase Firestore database service instance.
const db = getFirestore(app);
// Get Firebase Storage service instance.
const storage = getStorage(app);

// --- Global Styles ---
const GlobalCSS = () => (
<style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Roboto:wght@400;500&display=swap');

    :root {
        --primary-gold: #D4AF37;
        --primary-gold-dark: #c09b2e;
        --deep-navy: #0A1F44; /* Used as royal blue */
        --light-bg: #F5F5F5;
        --white: #FFFFFF;
        --black: #000000;
        --medium-gray: #CCCCCC;
        --dark-gray: #555;
        --text-color: #333;
        --success-color: #28a745;
        --error-color: #dc3545;
        --border-radius: 12px;
        --shadow: 0 5px 15px rgba(0,0,0,0.08);
        --shadow-hover: 0 8px 25px rgba(0,0,0,0.12);
        --font-heading: 'Playfair Display', serif;
        --font-body: 'Roboto', sans-serif;
    }

    * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
    }

    body {
        font-family: var(--font-body);
        color: var(--text-color);
        background-color: var(--light-bg);
        line-height: 1.7;
    }

  .app-container {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
    }

    h1, h2, h3, h4, h5, h6 {
        font-family: var(--font-heading);
        color: var(--deep-navy);
    }

    /* --- Buttons --- */
  .btn {
        padding: 14px 28px;
        border: 2px solid transparent;
        border-radius: var(--border-radius);
        cursor: pointer;
        font-size: 16px;
        font-weight: 500;
        transition: all 0.3s ease;
        display: inline-block;
        text-align: center;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
  .btn-primary {
        background-color: var(--primary-gold);
        color: var(--deep-navy);
        border-color: var(--primary-gold);
    }
  .btn-primary:hover {
        background-color: var(--primary-gold-dark);
        border-color: var(--primary-gold-dark);
        transform: translateY(-3px);
        box-shadow: var(--shadow-hover);
    }
  .btn-secondary {
        background-color: transparent;
        color: var(--deep-navy);
        border-color: var(--medium-gray);
    }
  .btn-secondary:hover {
        background-color: var(--deep-navy);
        color: var(--white);
        border-color: var(--deep-navy);
    }
  .btn-danger {
        background-color: var(--error-color);
        color: white;
    }
  .btn-danger:hover {
        background-color: #c82333;
    }
  .btn-success {
        background-color: var(--success-color);
        color: white;
    }
  .btn-success:hover {
        background-color: #218838;
    }
  .btn-link {
        background: none;
        border: none;
        color: var(--primary-gold);
        text-decoration: none;
        font-weight: 500;
        padding: 0;
        text-transform: none;
    }
  .btn-link:hover {
        text-decoration: underline;
    }
  .btn:disabled {
        background-color: var(--medium-gray);
        border-color: var(--medium-gray);
        cursor: not-allowed;
        opacity: 0.7;
    }

    /* --- Forms --- */
  .form-container {
        background: var(--white);
        padding: 40px;
        border-radius: var(--border-radius);
        box-shadow: var(--shadow);
        max-width: 500px;
        width: 100%;
        margin: 2rem auto;
    }
  .form-title {
        text-align: center;
        margin-bottom: 2rem;
        font-size: 2.5rem;
    }
  .form-group {
        margin-bottom: 1.5rem;
    }
  .form-label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 500;
        color: var(--dark-gray);
    }
  .form-input,.form-textarea,.form-select {
        width: 100%;
        padding: 14px;
        border: 1px solid var(--medium-gray);
        border-radius: var(--border-radius);
        font-size: 16px;
        font-family: var(--font-body);
        transition: border-color 0.3s, box-shadow 0.3s;
    }
  .form-input:focus,.form-textarea:focus,.form-select:focus {
        outline: none;
        border-color: var(--primary-gold);
        box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.2);
    }
  .form-textarea {
        min-height: 120px;
        resize: vertical;
    }
  .form-error-message {
        color: var(--error-color);
        font-size: 0.875rem;
        margin-top: 0.25rem;
    }
  .form-tip {
        color: var(--dark-gray);
        font-size: 0.875rem;
        margin-top: 0.25rem;
    }


    /* --- Modal --- */
  .modal-overlay {
        position: fixed;
        inset: 0;
        background-color: rgba(10, 31, 68, 0.8);
        z-index: 1000;
        display: flex;
        justify-content: center;
        align-items: center;
        animation: fadeIn 0.3s ease;
    }
  .modal-content {
        background: var(--white);
        padding: 2.5rem;
        border-radius: var(--border-radius);
        box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        position: relative;
        width: 90%;
        max-width: 600px; /* Increased max-width for product form */
        animation: slideIn 0.4s ease;
        max-height: 90vh; /* Limit height for scrollability */
        overflow-y: auto; /* Enable scrolling for long forms */
    }
  .modal-close-btn {
        position: absolute;
        top: 1rem;
        right: 1rem;
        background: none;
        border: none;
        font-size: 1.8rem;
        cursor: pointer;
        color: var(--dark-gray);
    }
  .modal-header {
        margin-bottom: 1.5rem;
        font-size: 2rem;
    }
  .modal-body {
        margin-bottom: 1.5rem;
    }
  .modal-footer {
        display: flex;
        justify-content: flex-end;
        gap: 1rem;
        margin-top: 1.5rem;
    }

    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideIn { from { transform: translateY(-30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

    /* --- Page Specific --- */
  .page-center {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        padding: 2rem;
        text-align: center;
    }
    
    /* Home Page */
  .home-page {
        background-color: var(--deep-navy);
        color: var(--white);
        flex-grow: 1; /* Allow it to take available space */
    }
  .home-page h1 {
        font-size: 4.5rem;
        color: var(--white);
        margin-bottom: 1rem;
    }
  .home-page p {
        font-size: 1.25rem;
        color: var(--light-bg);
        margin-bottom: 2.5rem;
        max-width: 600px;
    }
  .home-page .search-section {
        margin-top: 2rem;
        display: flex;
        gap: 1rem;
        width: 100%;
        max-width: 500px;
    }
  .home-page .search-input {
        flex-grow: 1;
        padding: 12px 20px;
        border-radius: var(--border-radius);
        border: none;
        font-size: 1rem;
    }
  .home-page .category-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: 1.5rem;
        margin-top: 3rem;
        width: 100%;
        max-width: 900px;
    }
  .home-page .category-card {
        background-color: rgba(255,255,255,0.1);
        padding: 1.5rem;
        border-radius: var(--border-radius);
        text-align: center;
        cursor: pointer;
        transition: background-color 0.3s, transform 0.3s;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 180px; /* Ensure cards have some height */
    }
  .home-page .category-card:hover {
        background-color: rgba(255,255,255,0.2);
        transform: translateY(-5px);
    }
  .home-page .category-card h3 {
        color: var(--white);
        font-size: 1.2rem;
        margin-top: 0.5rem;
    }
  .home-page .category-card img {
        width: 80px;
        height: 80px;
        object-fit: contain;
        margin-bottom: 0.5rem;
    }

    /* Auth Page */
  .auth-toggle {
        text-align: center;
        margin-top: 1.5rem;
    }
    
    /* Dashboard */
  .dashboard {
        background-color: var(--light-bg);
        flex-grow: 1; /* Allow it to take available space */
    }
  .dashboard-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.5rem 2rem;
        background-color: var(--white);
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }
  .dashboard-header h1 { font-size: 2rem; }
  .dashboard-main { padding: 2rem; max-width: 1600px; margin: 0 auto; }
  .dashboard-nav {
        border-bottom: 1px solid var(--medium-gray);
        margin-bottom: 2rem;
        display: flex;
        overflow-x: auto;
    }
  .dashboard-nav button {
        padding: 1rem 0.5rem;
        margin-right: 2rem;
        background: none;
        border: none;
        cursor: pointer;
        font-size: 1rem;
        font-weight: 500;
        color: var(--dark-gray);
        border-bottom: 3px solid transparent;
        transition: color 0.3s, border-color 0.3s;
        white-space: nowrap;
    }
  .dashboard-nav button:hover { color: var(--primary-gold); }
  .dashboard-nav button.active {
        color: var(--deep-navy);
        border-bottom-color: var(--primary-gold);
    }
  .dashboard-content-title {
        font-size: 2.2rem;
        margin-bottom: 1.5rem;
        color: var(--deep-navy);
    }
  .dashboard-section {
        background: var(--white);
        padding: 2rem;
        border-radius: var(--border-radius);
        box-shadow: var(--shadow);
    }
    
    /* Product Management */
  .manage-products-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
    }
  .product-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 2rem;
    }
  .product-card {
        border: 1px solid #eee;
        border-radius: var(--border-radius);
        overflow: hidden;
        display: flex;
        flex-direction: column;
        background: var(--white);
        transition: box-shadow 0.3s, transform 0.3s;
    }
  .product-card:hover {
        transform: translateY(-5px);
        box-shadow: var(--shadow-hover);
    }
  .product-card-img {
        width: 100%;
        height: 200px;
        object-fit: cover;
        background-color: var(--light-bg);
    }
  .product-card-body {
        padding: 1.5rem;
        flex-grow: 1;
        display: flex;
        flex-direction: column;
    }
  .product-card-title { font-size: 1.4rem; margin-bottom: 0.5rem; }
  .product-card-price { font-weight: bold; font-family: var(--font-body); color: var(--primary-gold); margin-bottom: 0.5rem; font-size: 1.1rem;}
  .product-card-desc {
        font-size: 0.9rem;
        color: var(--dark-gray);
        flex-grow: 1;
        margin-bottom: 1rem;
    }
  .product-card-actions { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: auto;}
  .product-card-actions .btn { padding: 8px 12px; font-size: 14px; text-transform: none; letter-spacing: 0;}
    
    /* Stats */
  .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1.5rem;
        text-align: center;
    }
  .stat-card {
        padding: 2rem;
        border-radius: var(--border-radius);
        border: 1px solid #eee;
        background: var(--white);
        box-shadow: var(--shadow);
        transition: box-shadow 0.3s, transform 0.3s;
    }
  .stat-card:hover {
        transform: translateY(-3px);
        box-shadow: var(--shadow-hover);
    }
  .stat-card-value { font-size: 3rem; font-weight: 700; font-family: var(--font-heading); color: var(--deep-navy); }
  .stat-card-label { font-size: 1rem; color: var(--dark-gray); }

    /* Feedback */
  .star-rating {
        display: flex;
        gap: 0.5rem;
        margin-bottom: 1.5rem;
    }
  .star-rating button {
        background: none;
        border: none;
        cursor: pointer;
        font-size: 2.5rem;
        color: var(--medium-gray);
        transition: color 0.2s, transform 0.2s;
    }
  .star-rating button:hover {
        transform: scale(1.1);
    }
  .star-rating button.active {
        color: var(--primary-gold);
    }

    /* Public Product List */
  .site-header {
        padding: 1rem 2rem;
        background: var(--white);
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        position: sticky;
        top: 0;
        z-index: 100;
    }
  .site-header-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        max-width: 1600px;
        margin: 0 auto;
    }
  .site-title {
        font-size: 2rem;
        cursor: pointer;
        color: var(--deep-navy);
    }
  .site-main {
        max-width: 1600px;
        margin: 0 auto;
        padding: 2rem;
        flex-grow: 1; /* Allow it to take available space */
    }
  .filters-container {
        background: var(--white);
        padding: 1.5rem;
        border-radius: var(--border-radius);
        box-shadow: var(--shadow);
        margin-bottom: 2rem;
        display: grid;
        grid-template-columns: 1fr;
        gap: 1rem;
    }
    @media (min-width: 768px) {
      .filters-container { grid-template-columns: 1fr 1fr 1fr; } /* Added a column for location search */
    }
  .public-product-card {
        background: var(--white);
        border-radius: var(--border-radius);
        overflow: hidden;
        box-shadow: var(--shadow);
        cursor: pointer;
        transition: transform 0.3s, box-shadow 0.3s;
    }
  .public-product-card:hover {
        transform: translateY(-8px);
        box-shadow: var(--shadow-hover);
    }
  .public-product-card .product-card-img {
        height: 280px;
        object-fit: cover;
        background-color: var(--light-bg);
    }
  .public-product-card .product-card-body {
        padding: 1.5rem;
    }
  .public-product-card .product-card-title {
        font-size: 1.5rem;
    }
  .public-product-card .product-card-shop {
        font-size: 0.9rem;
        color: var(--dark-gray);
        margin-bottom: 0.5rem;
    }
  .public-product-card .product-card-price {
        font-size: 1.2rem;
        font-weight: 500;
        font-family: var(--font-body);
        color: var(--primary-gold);
    }

    /* Product Detail */
  .product-detail-container {
        background: var(--white);
        border-radius: var(--border-radius);
        box-shadow: var(--shadow);
        overflow: hidden;
        display: grid;
        grid-template-columns: 1fr;
    }
    @media (min-width: 768px) {
      .product-detail-container { grid-template-columns: 1fr 1fr; }
    }
  .product-detail-image-gallery {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 1rem;
    }
  .product-detail-main-image {
        width: 100%;
        max-height: 500px;
        object-fit: contain;
        background-color: var(--light-bg);
        border-radius: var(--border-radius);
        margin-bottom: 1rem;
    }
  .product-detail-thumbnails {
        display: flex;
        gap: 0.5rem;
        overflow-x: auto;
        padding-bottom: 0.5rem;
    }
  .product-detail-thumbnail {
        width: 80px;
        height: 80px;
        object-fit: cover;
        border: 2px solid transparent;
        transition: border-color 0.2s;
        border-radius: 8px;
    }
  .product-detail-thumbnail.active {
        border-color: var(--primary-gold);
    }
  .product-detail-info {
        padding: 3rem;
        display: flex;
        flex-direction: column;
    }
  .product-detail-info h1 { font-size: 3rem; margin-bottom: 0.5rem; }
  .product-detail-info .price { font-size: 2rem; font-family: var(--font-body); color: var(--primary-gold); margin-bottom: 1.5rem; }
  .product-detail-info .description { margin-bottom: 2rem; flex-grow: 1; }
  .jeweler-contact { border-top: 1px solid #eee; padding-top: 2rem; }
  .jeweler-contact h2 { font-size: 1.8rem; margin-bottom: 1rem; }
  .jeweler-contact p { margin-bottom: 0.5rem; }
  .jeweler-contact a { color: var(--primary-gold); text-decoration: none; }
  .jeweler-contact a:hover { text-decoration: underline; }
  .btn-whatsapp {
        margin-top: 1rem;
        background-color: #25D366;
        color: white;
        border-color: #25D366;
    }
  .btn-whatsapp:hover {
        background-color: #1EBE57;
        border-color: #1EBE57;
    }
  .contact-options {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
        margin-top: 1.5rem;
    }
  .contact-options .btn {
        flex: 1 1 auto;
        min-width: 120px;
    }

    /* Image Upload Specific Styles */
  .image-upload-area {
        border: 2px dashed var(--medium-gray);
        border-radius: var(--border-radius);
        padding: 2rem;
        text-align: center;
        cursor: pointer;
        transition: border-color 0.3s ease;
        min-height: 150px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
    }
  .image-upload-area:hover {
        border-color: var(--primary-gold);
    }
  .image-preview-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
        gap: 1rem;
        margin-top: 1rem;
    }
  .image-preview-item {
        position: relative;
        width: 100px;
        height: 100px;
        border-radius: var(--border-radius);
        overflow: hidden;
        box-shadow: var(--shadow);
    }
  .image-preview-item img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
  .image-preview-delete-btn {
        position: absolute;
        top: 5px;
        right: 5px;
        background-color: rgba(220, 53, 69, 0.8);
        color: white;
        border: none;
        border-radius: 50%;
        width: 25px;
        height: 25px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        font-size: 1rem;
        transition: background-color 0.2s;
    }
  .image-preview-delete-btn:hover {
        background-color: var(--error-color);
    }
  .progress-bar-container {
        width: 100%;
        background-color: var(--light-bg);
        border-radius: 5px;
        margin-top: 1rem;
        height: 10px;
    }
  .progress-bar {
        height: 100%;
        background-color: var(--primary-gold);
        border-radius: 5px;
        transition: width 0.3s ease-in-out;
    }

    /* Toast Notification Styles */
  .toast-container {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 1000;
        display: flex;
        flex-direction: column;
        gap: 10px;
    }
  .toast {
        background-color: var(--white);
        color: var(--text-color);
        padding: 15px 20px;
        border-radius: var(--border-radius);
        box-shadow: var(--shadow);
        display: flex;
        align-items: center;
        gap: 10px;
        min-width: 250px;
        max-width: 350px;
        animation: slideInRight 0.3s ease-out forwards;
    }
  .toast.success { border-left: 5px solid var(--success-color); }
  .toast.error { border-left: 5px solid var(--error-color); }
  .toast.info { border-left: 5px solid var(--deep-navy); }
  .toast-icon { font-size: 1.5rem; }
  .toast.success .toast-icon { color: var(--success-color); }
  .toast.error .toast-icon { color: var(--error-color); }
  .toast.info .toast-icon { color: var(--deep-navy); }
  .toast-message { flex-grow: 1; }
  .toast-close-btn {
        background: none;
        border: none;
        font-size: 1.2rem;
        cursor: pointer;
        color: var(--dark-gray);
    }
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
  .toast.fade-out {
        animation: fadeOut 0.5s ease-out forwards;
    }

    /* Bookings Table */
  .bookings-table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 1.5rem;
    }
  .bookings-table th,.bookings-table td {
        padding: 12px 15px;
        border-bottom: 1px solid #eee;
        text-align: left;
    }
  .bookings-table th {
        background-color: var(--light-bg);
        font-weight: 500;
        color: var(--deep-navy);
        text-transform: uppercase;
        font-size: 0.9rem;
    }
  .bookings-table tr:last-child td {
        border-bottom: none;
    }
  .bookings-table tbody tr:hover {
        background-color: #f9f9f9;
    }
    @media (max-width: 768px) {
      .bookings-table,.bookings-table thead,.bookings-table tbody,.bookings-table th,.bookings-table td,.bookings-table tr {
            display: block;
        }
      .bookings-table thead tr {
            position: absolute;
            top: -9999px;
            left: -9999px;
        }
      .bookings-table tr {
            margin-bottom: 1rem;
            border: 1px solid #eee;
            border-radius: var(--border-radius);
            overflow: hidden;
            box-shadow: var(--shadow);
        }
      .bookings-table td {
            border: none;
            border-bottom: 1px solid #eee;
            position: relative;
            padding-left: 50%;
            text-align: right;
        }
      .bookings-table td:before {
            position: absolute;
            top: 0;
            left: 6px;
            width: 45%;
            padding-right: 10px;
            white-space: nowrap;
            text-align: left;
            font-weight: 500;
            color: var(--dark-gray);
        }
      .bookings-table td:nth-of-type(1):before { content: "Product"; }
      .bookings-table td:nth-of-type(2):before { content: "Customer Name"; }
      .bookings-table td:nth-of-type(3):before { content: "Phone"; }
      .bookings-table td:nth-of-type(4):before { content: "Preferred Date"; }
      .bookings-table td:nth-of-type(5):before { content: "Booking Date"; }
    }

    /* Customer Dashboard */
  .customer-dashboard-nav {
        display: flex;
        justify-content: center;
        margin-bottom: 2rem;
        border-bottom: 1px solid var(--medium-gray);
    }
  .customer-dashboard-nav button {
        padding: 1rem 1.5rem;
        background: none;
        border: none;
        cursor: pointer;
        font-size: 1rem;
        font-weight: 500;
        color: var(--dark-gray);
        border-bottom: 3px solid transparent;
        transition: color 0.3s, border-color 0.3s;
    }
  .customer-dashboard-nav button:hover { color: var(--primary-gold); }
  .customer-dashboard-nav button.active {
        color: var(--deep-navy);
        border-bottom-color: var(--primary-gold);
    }
  .customer-section-title {
        font-size: 2rem;
        color: var(--deep-navy);
        margin-bottom: 1.5rem;
    }
  .customer-list-item {
        background: var(--white);
        padding: 1.5rem;
        border-radius: var(--border-radius);
        box-shadow: var(--shadow);
        margin-bottom: 1rem;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }
  .customer-list-item h3 {
        font-size: 1.2rem;
        color: var(--deep-navy);
    }
  .customer-list-item p {
        font-size: 0.9rem;
        color: var(--dark-gray);
    }
  .customer-list-item .product-info {
        font-weight: 500;
        color: var(--primary-gold);
    }
  .customer-list-item .date-info {
        font-style: italic;
        font-size: 0.85rem;
    }

    /* Navigation Bar */
    .navbar {
        background-color: var(--deep-navy);
        padding: 1rem 2rem;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        display: flex;
        justify-content: space-between;
        align-items: center;
        color: var(--white);
    }
    .navbar-brand {
        font-family: var(--font-heading);
        font-size: 2.2rem;
        color: var(--primary-gold);
        cursor: pointer;
        text-decoration: none;
    }
    .navbar-links {
        display: flex;
        gap: 1.5rem;
    }
    .navbar-link {
        color: var(--white);
        text-decoration: none;
        font-weight: 500;
        font-size: 1rem;
        transition: color 0.3s ease;
    }
    .navbar-link:hover {
        color: var(--primary-gold);
    }
    @media (max-width: 768px) {
        .navbar {
            flex-direction: column;
            align-items: flex-start;
            padding: 1rem;
        }
        .navbar-links {
            flex-direction: column;
            width: 100%;
            margin-top: 1rem;
            gap: 0.5rem;
        }
        .navbar-link {
            padding: 0.5rem 0;
            width: 100%;
            text-align: left;
        }
    }

`}</style>
);

// --- Custom Toast Notification System ---
const ToastContext = React.createContext();

const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);
    const toastId = useRef(0);

    const showToast = useCallback((message, type = 'info', duration = 3000) => {
        const id = toastId.current++;
        setToasts(prev => [...prev, { id, message, type }]);

        setTimeout(() => {
            setToasts(prev => prev.map(t => t.id === id ? { ...t, fading: true } : t));
            setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== id));
            }, 500); // Duration of fade-out animation
        }, duration);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.map(t => t.id === id ? { ...t, fading: true } : t));
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 500);
    }, []);

    return (
        <ToastContext.Provider value={showToast}>
            {children}
            <div className="toast-container">
                {toasts.map(toast => (
                    <div key={toast.id} className={`toast ${toast.type} ${toast.fading ? 'fade-out' : ''}`}>
                        <span className="toast-icon">
                            {toast.type === 'success' && '✅'}
                            {toast.type === 'error' && '❌'}
                            {toast.type === 'info' && 'ℹ️'}
                        </span>
                        <span className="toast-message">{toast.message}</span>
                        <button onClick={() => removeToast(toast.id)} className="toast-close-btn">&times;</button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};

const useToast = () => {
    return React.useContext(ToastContext);
};


// --- Helper Components ---

const Modal = ({ children, onClose, title }) => (
    <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
            {onClose && <button onClick={onClose} className="modal-close-btn">&times;</button>}
            {title && <h2 className="modal-header">{title}</h2>}
            <div className="modal-body">{children}</div>
        </div>
    </div>
);

const CustomConfirm = ({ message, onConfirm, onCancel }) => (
    <Modal onClose={onCancel} title="Confirmation">
        <p>{message}</p>
        <div className="modal-footer">
            <button onClick={onCancel} className="btn btn-secondary">Cancel</button>
            <button onClick={onConfirm} className="btn btn-danger">Confirm</button>
        </div>
    </Modal>
);

// --- Navigation Bar Component ---
const Navbar = ({ setPage, user, isJeweler, isCustomer, handleLogout }) => {
    return (
        <nav className="navbar">
            <a href="#" onClick={() => setPage('home')} className="navbar-brand">Jewel E Bazaar</a>
            <div className="navbar-links">
                <a href="#" onClick={() => setPage('productsList')} className="navbar-link">Products</a>
                {/* Conditional rendering for portal links based on user authentication status */}
                {!user && (
                    <>
                        <a href="#" onClick={() => setPage('customerRegister')} className="navbar-link">Customer Portal</a>
                        <a href="#" onClick={() => setPage('jewelerRegister')} className="navbar-link">Jeweler Portal</a>
                    </>
                )}
                {/* Conditional rendering for dashboard/account links if user is logged in */}
                {user && isJeweler && (
                    <a href="#" onClick={() => setPage('jewelerDashboard')} className="navbar-link">Dashboard</a>
                )}
                {user && isCustomer && (
                    <a href="#" onClick={() => setPage('customerDashboard')} className="navbar-link">My Account</a>
                )}
                {/* Logout button always visible if user is logged in */}
                {user && (
                    <button onClick={handleLogout} className="btn btn-link navbar-link" style={{textTransform: 'none', letterSpacing: '0', padding: '0'}}>Logout</button>
                )}
            </div>
        </nav>
    );
};


// --- Core Components ---

const HomePage = ({ setPage, setSearchTerm }) => {
    // Categories with placeholder images
    const categories = [
        { name: 'All', imageUrl: 'https://placehold.co/80x80/D4AF37/0A1F44?text=All' },
        { name: 'Ring', imageUrl: 'https://placehold.co/80x80/D4AF37/0A1F44?text=Ring' },
        { name: 'Necklace', imageUrl: 'https://placehold.co/80x80/D4AF37/0A1F44?text=Necklace' },
        { name: 'Earrings', imageUrl: 'https://placehold.co/80x80/D4AF37/0A1F44?text=Earrings' },
        { name: 'Bracelet', imageUrl: 'https://placehold.co/80x80/D4AF37/0A1F44?text=Bracelet' },
        { name: 'Other', imageUrl: 'https://placehold.co/80x80/D4AF37/0A1F44?text=Other' },
    ];
    const [localSearchTerm, setLocalSearchTerm] = useState('');

    const handleSearch = () => {
        setSearchTerm(localSearchTerm);
        setPage('productsList');
    };

    const handleCategoryClick = (categoryName) => {
        setSearchTerm(categoryName === 'All' ? '' : categoryName); // Clear search if 'All' is selected
        setPage('productsList');
    };

    return (
        <div className="page-center home-page">
            <h1>Jewel e Bazaar</h1>
            <p>Your Gateway to Exquisite Jewelry. Discover unique pieces from trusted jewelers.</p>
            
            <div className="home-page search-section">
                <input
                    type="text"
                    placeholder="Search for jewelry or jewelers..."
                    className="home-page search-input"
                    value={localSearchTerm}
                    onChange={(e) => setLocalSearchTerm(e.target.value)}
                    onKeyPress={(e) => { if (e.key === 'Enter') handleSearch(); }}
                />
                <button onClick={handleSearch} className="btn btn-primary">Explore</button>
            </div>

            <h2 style={{marginTop: '3rem', color: 'var(--white)'}}>Browse by Category</h2>
            <div className="home-page category-grid">
                {categories.map(category => (
                    <div key={category.name} className="home-page category-card" onClick={() => handleCategoryClick(category.name)}>
                        <img src={category.imageUrl} alt={category.name} />
                        <h3>{category.name}</h3>
                    </div>
                ))}
            </div>

            <button onClick={() => setPage('customerRegister')} className="btn btn-link" style={{marginTop: '3rem', color: 'var(--white)'}}>
                Customer Login / Register
            </button>
            <button onClick={() => setPage('jewelerRegister')} className="btn btn-link" style={{marginTop: '1rem', color: 'var(--white)'}}>
                Jeweler Portal
            </button>
        </div>
    );
};

const JewelerAuth = ({ setPage }) => {
    const showToast = useToast();
    const [isLogin, setIsLogin] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const emailRef = useRef();
    const passwordRef = useRef();
    const nameRef = useRef();
    const shopNameRef = useRef();
    const addressRef = useRef();
    const phoneRef = useRef();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        const email = emailRef.current.value;
        const password = passwordRef.current.value;

        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
                showToast("Logged in successfully!", "success");
            } else {
                const name = nameRef.current.value;
                const shopName = shopNameRef.current.value;
                const address = addressRef.current.value;
                const phone = phoneRef.current.value;
                
                if (!name || !shopName || !email || !password || !address || !phone) {
                    throw new Error("Please fill all required fields.");
                }
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                await addDoc(collection(db, 'jewelers'), {
                    uid: userCredential.user.uid, name, shopName, address, phone, email, createdAt: new Date(),
                });
                showToast("Registration successful! Please log in.", "success");
                setIsLogin(true); // Switch to login after registration
            }
        } catch (err) {
            setError(err.message.replace('Firebase: ', ''));
            showToast(`Authentication Error: ${err.message.replace('Firebase: ', '')}`, "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-center">
            <div className="form-container">
                <h2 className="form-title">{isLogin ? 'Jeweler Login' : 'Jeweler Registration'}</h2>
                {error && <p className="form-error-message">{error}</p>}
                <form onSubmit={handleSubmit}>
                    {!isLogin && (
                        <>
                            <div className="form-group"><input ref={nameRef} type="text" placeholder="Full Name" required className="form-input" /></div>
                            <div className="form-group"><input ref={shopNameRef} type="text" placeholder="Shop Name" required className="form-input" /></div>
                            <div className="form-group"><input ref={addressRef} type="text" placeholder="Shop Address" required className="form-input" /></div>
                            <div className="form-group"><input ref={phoneRef} type="tel" placeholder="Phone Number" required className="form-input" /></div>
                        </>
                    )}
                    <div className="form-group"><input ref={emailRef} type="email" placeholder="Email Address" required className="form-input" /></div>
                    <div className="form-group"><input ref={passwordRef} type="password" placeholder="Password" required className="form-input" /></div>
                    {!isLogin && (
                        <div className="form-group">
                            <label className="form-label">Shop License/ID (Optional)</label>
                            <input type="file" className="form-input" />
                        </div>
                    )}
                    <button type="submit" disabled={loading} className="btn btn-primary" style={{width: '100%'}}>
                        {loading ? 'Processing...' : (isLogin ? 'Login' : 'Register')}
                    </button>
                </form>
                <div className="auth-toggle">
                    <button onClick={() => setIsLogin(!isLogin)} className="btn btn-link">
                        {isLogin ? 'Need an account? Register' : 'Already have an account? Login'}
                    </button>
                    <br/>
                    <button onClick={() => setPage('home')} className="btn btn-link" style={{fontSize: '14px', marginTop: '1rem'}}>Back to Home</button>
                </div>
            </div>
        </div>
    );
};

const CustomerAuth = ({ setPage }) => {
    const showToast = useToast();
    const [isLogin, setIsLogin] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const emailRef = useRef();
    const passwordRef = useRef();
    const nameRef = useRef();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        const email = emailRef.current.value;
        const password = passwordRef.current.value;

        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
                showToast("Logged in successfully!", "success");
            } else {
                const name = nameRef.current.value;
                if (!name || !email || !password) {
                    throw new Error("Please fill all required fields.");
                }
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                await addDoc(collection(db, 'customers'), {
                    uid: userCredential.user.uid, name, email, createdAt: new Date(),
                });
                showToast("Registration successful! Please log in.", "success");
                setIsLogin(true); // Switch to login after registration
            }
        } catch (err) {
            setError(err.message.replace('Firebase: ', ''));
            showToast(`Authentication Error: ${err.message.replace('Firebase: ', '')}`, "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-center">
            <div className="form-container">
                <h2 className="form-title">{isLogin ? 'Customer Login' : 'Customer Registration'}</h2>
                {error && <p className="form-error-message">{error}</p>}
                <form onSubmit={handleSubmit}>
                    {!isLogin && (
                        <div className="form-group"><input ref={nameRef} type="text" placeholder="Your Name" required className="form-input" /></div>
                    )}
                    <div className="form-group"><input ref={emailRef} type="email" placeholder="Email Address" required className="form-input" /></div>
                    <div className="form-group"><input ref={passwordRef} type="password" placeholder="Password" required className="form-input" /></div>
                    <button type="submit" disabled={loading} className="btn btn-primary" style={{width: '100%'}}>
                        {loading ? 'Processing...' : (isLogin ? 'Login' : 'Register')}
                    </button>
                </form>
                <div className="auth-toggle">
                    <button onClick={() => setIsLogin(!isLogin)} className="btn btn-link">
                        {isLogin ? 'Need an account? Register' : 'Already have an account? Login'}
                    </button>
                    <br/>
                    <button onClick={() => setPage('home')} className="btn btn-link" style={{fontSize: '14px', marginTop: '1rem'}}>Back to Home</button>
                </div>
            </div>
        </div>
    );
};


// --- Dashboard Components ---
// Moved these components up so they are defined before JewelerDashboard uses them.

const ProductForm = ({ user, product, onClose }) => {
    const showToast = useToast();
    const [title, setTitle] = useState(product?.title || '');
    const [description, setDescription] = useState(product?.description || '');
    const [price, setPrice] = useState(product?.price || '');
    const [category, setCategory] = useState(product?.category || 'Ring');
    const [tags, setTags] = useState(product?.tags?.join(', ') || '');
    const [stock, setStock] = useState(product?.stock || '');

    const [imageFiles, setImageFiles] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [formErrors, setFormErrors] = useState({});

    const fileInputRef = useRef(null);

    const categories = ['Ring', 'Necklace', 'Earrings', 'Bracelet', 'Other'];

    useEffect(() => {
        if (product) {
            setTitle(product.title || '');
            setDescription(product.description || '');
            setPrice(product.price || '');
            setCategory(product.category || 'Ring');
            setTags(product.tags?.join(', ') || '');
            setStock(product.stock || '');
            // When editing, initialize previews with existing image URLs
            setImagePreviews(product.imageUrls || []);
            setImageFiles([]); // Clear new files when editing an existing product
        } else {
            // Reset form for new product
            setTitle('');
            setDescription('');
            setPrice('');
            setCategory('Ring');
            setTags('');
            setStock('');
            setImagePreviews([]);
            setImageFiles([]);
        }
        setFormErrors({}); // Clear errors on product change
    }, [product]);

    // Client-side image resizing function using canvas
    const resizeImage = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_SIZE = 1024; // Maximum width or height for the resized image
                    let width = img.width;
                    let height = img.height;

                    // Calculate new dimensions to fit within MAX_SIZE while maintaining aspect ratio
                    if (width > height) {
                        if (width > MAX_SIZE) {
                            height *= MAX_SIZE / width;
                            width = MAX_SIZE;
                        }
                    } else {
                        if (height > MAX_SIZE) {
                            width *= MAX_SIZE / height;
                            height = MAX_SIZE;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    // Convert canvas content back to a Blob (File-like object)
                    canvas.toBlob((blob) => {
                        if (blob) {
                            resolve(new File([blob], file.name, { type: 'image/jpeg', lastModified: Date.now() }));
                        } else {
                            reject(new Error("Canvas to Blob conversion failed."));
                        }
                    }, 'image/jpeg', 0.9); // Output as JPEG with 90% quality
                };
                img.onerror = (e) => reject(e); // Handle image loading errors
                img.src = event.target.result;
            };
            reader.onerror = (e) => reject(e); // Handle file reading errors
            reader.readAsDataURL(file); // Read the file as a Data URL
        });
    };

    const validateForm = () => {
        const errors = {};
        if (!title.trim()) errors.title = "Product Title is required.";
        if (!description.trim()) errors.description = "Detailed Description is required.";
        if (!price || isNaN(price) || parseFloat(price) <= 0) errors.price = "Price must be a positive number.";
        if (!stock || isNaN(stock) || parseInt(stock) < 0) errors.stock = "Stock Quantity must be a non-negative integer.";
        if (imagePreviews.length === 0) errors.images = "At least one image is required.";
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleFileChange = async (e) => {
        const files = Array.from(e.target.files);
        await processFiles(files);
    };

    const handleDrop = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        const files = Array.from(e.dataTransfer.files);
        await processFiles(files);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const processFiles = async (files) => {
        const newFilesToProcess = files.filter(file => file.type.startsWith('image/'));
        if (newFilesToProcess.length === 0) {
            showToast("Only image files are supported.", "error");
            return;
        }

        const processedFiles = [];
        const processedPreviews = [];

        for (const file of newFilesToProcess) {
            try {
                const resizedFile = await resizeImage(file); // Use the local resizeImage function
                processedFiles.push(resizedFile);
                processedPreviews.push(URL.createObjectURL(resizedFile));
            } catch (error) {
                console.error("Error processing image:", error);
                showToast(`Failed to process image: ${file.name}`, "error");
            }
        }
        setImageFiles(prev => [...prev, ...processedFiles]);
        setImagePreviews(prev => [...prev, ...processedPreviews]);
        setFormErrors(prev => ({...prev, images: undefined }));
    };

    const handleDeleteImage = (indexToDelete) => {
        // Check if the image being deleted is one of the newly selected files (not yet uploaded)
        const numExistingImages = product?.imageUrls?.length || 0;
        const isNewFile = indexToDelete >= numExistingImages;
        
        if (isNewFile) {
            const newFileIndex = indexToDelete - numExistingImages;
            if (imageFiles[newFileIndex]) {
                URL.revokeObjectURL(imagePreviews[indexToDelete]); // Revoke URL for local file
                setImageFiles(prev => prev.filter((_, idx) => idx !== newFileIndex));
            }
        }
        
        // Remove from previews
        setImagePreviews(prev => prev.filter((_, index) => index !== indexToDelete));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            showToast("Please correct the errors in the form.", "error");
            return;
        }

        setIsUploading(true);
        setUploadProgress(0);
        let uploadedImageUrls = [];
        const existingImageUrls = product?.imageUrls || [];

        try {
            // Filter out existing images that were deleted from previews
            const finalExistingImageUrls = existingImageUrls.filter(url => imagePreviews.includes(url));
            uploadedImageUrls = [...finalExistingImageUrls];

            // Upload new image files
            const uploadPromises = imageFiles.map((file, index) => {
                const storageRef = ref(storage, `products/${user.uid}/${Date.now()}_${file.name}`);
                const uploadTask = uploadBytesResumable(storageRef, file);

                return new Promise((resolve, reject) => {
                    uploadTask.on('state_changed',
                        (snapshot) => {
                            // Calculate and update overall progress
                            // This is a simplified overall progress. For multiple files, you'd sum bytesTransferred/totalBytes across all uploads.
                            // For now, it shows progress for the current file being uploaded.
                            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                            setUploadProgress(progress);
                        },
                        (error) => {
                            console.error("Upload failed:", error);
                            showToast(`Image upload failed: ${file.name}`, "error");
                            reject(error);
                        },
                        async () => {
                            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                            uploadedImageUrls.push(downloadURL);
                            resolve();
                        }
                    );
                });
            });

            await Promise.all(uploadPromises); // Wait for all uploads to complete

            const productData = {
                title,
                description,
                price: parseFloat(price),
                category,
                tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
                stock: parseInt(stock),
                imageUrls: uploadedImageUrls, // Store all image URLs
                jewelerUid: user.uid,
                updatedAt: new Date(),
            };

            if (product) {
                await updateDoc(doc(db, 'products', product.id), productData);
                showToast("Product updated successfully!", "success");
            } else {
                await addDoc(collection(db, 'products'), {...productData, createdAt: new Date() });
                showToast("Product added successfully!", "success");
            }
            onClose();
        } catch (err) {
            console.error("Error saving product:", err);
            showToast(`Error saving product: ${err.message}`, "error");
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

    return (
        <Modal onClose={onClose} title={product ? 'Edit Product' : 'Add New Product'}>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label className="form-label" htmlFor="title">Product Title</label>
                    <input type="text" id="title" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., Elegant Diamond Engagement Ring" className="form-input" />
                    {formErrors.title && <p className="form-error-message">{formErrors.title}</p>}
                </div>
                <div className="form-group">
                    <label className="form-label" htmlFor="description">Detailed Description</label>
                    <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe the product's features, materials, craftsmanship, and unique selling points." className="form-textarea"></textarea>
                    <p className="form-tip">Tips: Mention materials (e.g., 18K Gold, Sterling Silver, Diamonds), gemstone details (cut, clarity, carat), dimensions, and inspiration behind the design.</p>
                    {formErrors.description && <p className="form-error-message">{formErrors.description}</p>}
                </div>
                <div className="form-group">
                    <label className="form-label" htmlFor="price">Price (₹)</label>
                    <input type="number" id="price" value={price} onChange={e => setPrice(e.target.value)} placeholder="e.g., 125000" step="0.01" className="form-input" />
                    {formErrors.price && <p className="form-error-message">{formErrors.price}</p>}
                </div>
                <div className="form-group">
                    <label className="form-label" htmlFor="category">Category</label>
                    <select id="category" value={category} onChange={e => setCategory(e.target.value)} className="form-select">
                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                </div>
                <div className="form-group">
                    <label className="form-label" htmlFor="tags">Tags/Keywords (comma-separated)</label>
                    <input type="text" id="tags" value={tags} onChange={e => setTags(e.target.value)} placeholder="e.g., gold, diamond, wedding, vintage" className="form-input" />
                    <p className="form-tip">Separate tags with commas. These help customers find your product.</p>
                </div>
                <div className="form-group">
                    <label className="form-label" htmlFor="stock">Stock Quantity</label>
                    <input type="number" id="stock" value={stock} onChange={e => setStock(e.target.value)} placeholder="e.g., 10" min="0" className="form-input" />
                    {formErrors.stock && <p className="form-error-message">{formErrors.stock}</p>}
                </div>
                <div className="form-group">
                    <label className="form-label">Product Images</label>
                    <div
                        className="image-upload-area"
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onClick={() => fileInputRef.current.click()}
                    >
                        <input
                            type="file"
                            ref={fileInputRef}
                            multiple
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                        />
                        <p>Drag & drop images here, or click to select files</p>
                        <p className="form-tip">(Auto-resizes to max 1024x1024px)</p>
                    </div>
                    {formErrors.images && <p className="form-error-message">{formErrors.images}</p>}
                    {imagePreviews.length > 0 && (
                        <div className="image-preview-grid">
                            {imagePreviews.map((preview, index) => (
                                <div key={index} className="image-preview-item">
                                    <img src={preview} alt={`Product preview ${index + 1}`} />
                                    <button type="button" onClick={() => handleDeleteImage(index)} className="image-preview-delete-btn">
                                        &times;
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                    {isUploading && (
                        <div className="progress-bar-container">
                            <div className="progress-bar" style={{ width: `${uploadProgress}%` }}></div>
                        </div>
                    )}
                </div>
                <div className="modal-footer">
                    <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
                    <button type="submit" disabled={isUploading} className="btn btn-primary">{isUploading ? 'Uploading...' : (product ? 'Update Product' : 'Add Product')}</button>
                </div>
            </form>
        </Modal>
    );
};

const BookingModal = ({ product, onSave, onClose }) => {
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [preferredDate, setPreferredDate] = useState('');
    const [formErrors, setFormErrors] = useState({});

    const validateForm = () => {
        const errors = {};
        if (!customerName.trim()) errors.customerName = "Customer Name is required.";
        if (!customerPhone.trim()) errors.customerPhone = "Phone Number is required.";
        if (!preferredDate.trim()) errors.preferredDate = "Preferred Date is required.";
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        onSave({ customerName, customerPhone, preferredDate });
    };

    return (
        <Modal onClose={onClose} title={`Book: ${product?.title}`}>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label className="form-label" htmlFor="customerName">Customer Name</label>
                    <input type="text" id="customerName" value={customerName} onChange={e => setCustomerName(e.target.value)} className="form-input" />
                    {formErrors.customerName && <p className="form-error-message">{formErrors.customerName}</p>}
                </div>
                <div className="form-group">
                    <label className="form-label" htmlFor="customerPhone">Customer Phone</label>
                    <input type="tel" id="customerPhone" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} className="form-input" />
                    {formErrors.customerPhone && <p className="form-error-message">{formErrors.customerPhone}</p>}
                </div>
                <div className="form-group">
                    <label className="form-label" htmlFor="preferredDate">Preferred Date</label>
                    <input type="date" id="preferredDate" value={preferredDate} onChange={e => setPreferredDate(e.target.value)} className="form-input" />
                    {formErrors.preferredDate && <p className="form-error-message">{formErrors.preferredDate}</p>}
                </div>
                <div className="modal-footer">
                    <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
                    <button type="submit" className="btn btn-primary">Confirm Booking</button>
                </div>
            </form>
        </Modal>
    );
};

const BookingsList = ({ bookings }) => {
    if (bookings.length === 0) {
        return <p className="dashboard-section">No bookings received yet.</p>;
    }

    return (
        <div className="dashboard-section">
            <h2 className="dashboard-content-title">Received Bookings</h2>
            <div className="overflow-x-auto">
                <table className="bookings-table">
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Customer Name</th>
                            <th>Phone</th>
                            <th>Preferred Date</th>
                            <th>Booking Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bookings.map(booking => (
                            <tr key={booking.id}>
                                <td>{booking.productTitle}</td>
                                <td>{booking.customerName}</td>
                                <td>{booking.customerPhone}</td>
                                <td>{new Date(booking.preferredDate).toLocaleDateString()}</td>
                                <td>{new Date(booking.bookingDate).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const EditProfile = ({ profile }) => {
    const showToast = useToast();
    const [shopName, setShopName] = useState(profile?.shopName || '');
    const [name, setName] = useState(profile?.name || '');
    const [address, setAddress] = useState(profile?.address || '');
    const [phone, setPhone] = useState(profile?.phone || '');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (profile) {
            setShopName(profile.shopName || '');
            setName(profile.name || '');
            setAddress(profile.address || '');
            setPhone(profile.phone || '');
        }
    }, [profile]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await updateDoc(doc(db, 'jewelers', profile.id), { shopName, name, address, phone });
            showToast('Profile updated successfully!', 'success');
        } catch (error) {
            showToast('Error updating profile.', 'error');
        } finally {
            setLoading(false);
        }
    };
    
    if (!profile) return <p>Loading profile...</p>;

    return (
        <div className="dashboard-section">
            <h2 className="dashboard-content-title">Edit Shop Profile</h2>
            <form onSubmit={handleUpdate}>
                <div className="form-group"><label className="form-label">Shop Name</label><input type="text" value={shopName} onChange={e => setShopName(e.target.value)} className="form-input" /></div>
                <div className="form-group"><label className="form-label">Your Name</label><input type="text" value={name} onChange={e => setName(e.target.value)} className="form-input" /></div>
                <div className="form-group"><label className="form-label">Address</label><input type="text" value={address} onChange={e => setAddress(e.target.value)} className="form-input" /></div>
                <div className="form-group"><label className="form-label">Phone</label><input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="form-input" /></div>
                <button type="submit" disabled={loading} className="btn btn-primary">{loading ? 'Saving...' : 'Save Changes'}</button>
            </form>
        </div>
    );
};

const FeedbackForm = ({ user, onClose }) => { // Renamed from CustomerFeedbackForm for general use
    const showToast = useToast();
    const [feedback, setFeedback] = useState('');
    const [rating, setRating] = useState(0);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!feedback || rating === 0) { showToast("Please provide feedback and a rating.", "error"); return; }
        setLoading(true);
        try {
            await addDoc(collection(db, 'feedback'), {
                userUid: user.uid, // Changed to general userUid
                feedback,
                rating,
                submittedAt: new Date()
            });
            showToast('Thank you for your feedback!', 'success');
            setFeedback('');
            setRating(0);
            if (onClose) onClose(); // Only call if provided
        } catch (error) {
            showToast('Could not submit feedback. Please try again.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        // Conditional rendering for modal vs direct section
        onClose ? ( // If onClose is provided, assume it's for a modal
            <Modal onClose={onClose} title="Submit Feedback">
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Your experience & suggestions:</label>
                        <textarea value={feedback} onChange={e => setFeedback(e.target.value)} className="form-textarea" placeholder="What did you like or dislike? What can we improve?"></textarea>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Overall Rating:</label>
                        <div className="star-rating">
                            {[1, 2, 3, 4, 5].map(star => (
                                <button type="button" key={star} onClick={() => setRating(star)} className={rating >= star ? 'active' : ''}>★</button>
                            ))}
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
                        <button type="submit" disabled={loading} className="btn btn-primary">{loading ? 'Submitting...' : 'Submit Feedback'}</button>
                    </div>
                </form>
            </Modal>
        ) : ( // Otherwise, render as a direct dashboard section
            <div className="dashboard-section">
                <h2 className="dashboard-content-title">Submit Feedback</h2>
                <p style={{marginBottom: '1rem'}}>We value your opinion to help us improve the platform.</p>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Your experience & suggestions:</label>
                        <textarea value={feedback} onChange={e => setFeedback(e.target.value)} className="form-textarea" placeholder="What did you like or dislike? What can we improve?"></textarea>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Overall Rating:</label>
                        <div className="star-rating">
                            {[1, 2, 3, 4, 5].map(star => (
                                <button type="button" key={star} onClick={() => setRating(star)} className={rating >= star ? 'active' : ''}>★</button>
                            ))}
                        </div>
                    </div>
                    <button type="submit" disabled={loading} className="btn btn-primary">{loading ? 'Submitting...' : 'Submit Feedback'}</button>
                </form>
            </div>
        )
    );
};


const DashboardStats = ({ user }) => {
    const [products, setProducts] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [inquiries, setInquiries] = useState([]);

    useEffect(() => {
        if (!user) return;
        const qProducts = query(collection(db, 'products'), where('jewelerUid', '==', user.uid));
        const unsubProducts = onSnapshot(qProducts, (snapshot) => {
            setProducts(snapshot.docs);
        });

        const qBookings = query(collection(db, 'bookings'), where('jewelerUid', '==', user.uid));
        const unsubBookings = onSnapshot(qBookings, (snapshot) => {
            setBookings(snapshot.docs);
        });

        const qInquiries = query(collection(db, 'inquiries'), where('jewelerUid', '==', user.uid));
        const unsubInquiries = onSnapshot(qInquiries, (snapshot) => {
            setInquiries(snapshot.docs);
        });

        return () => {
            unsubProducts();
            unsubBookings();
            unsubInquiries();
        };
    }, [user]);

    const totalProducts = products.length;
    // Simulate total views for demonstration
    const totalViews = products.reduce((sum, productDoc) => sum + (productDoc.data().views || Math.floor(Math.random() * 100) + 10), 0);
    const totalBookings = bookings.length;
    const totalInquiries = inquiries.length;

    return (
        <div className="dashboard-section">
            <h2 className="dashboard-content-title">Your Statistics</h2>
            <div className="stats-grid">
                <div className="stat-card"><p className="stat-card-value">{totalProducts}</p><p className="stat-card-label">Total Products</p></div>
                <div className="stat-card"><p className="stat-card-value">{totalViews}</p><p className="stat-card-label">Total Views</p></div>
                <div className="stat-card"><p className="stat-card-value">{totalBookings}</p><p className="stat-card-label">Total Bookings</p></div>
                <div className="stat-card"><p className="stat-card-value">{totalInquiries}</p><p className="stat-card-label">Total Inquiries</p></div>
            </div>
        </div>
    );
};


const JewelerDashboard = ({ user, setPage }) => {
    const [activeTab, setActiveTab] = useState('products');
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [products, setProducts] = useState([]);
    const [bookings, setBookings] = useState([]);

    useEffect(() => {
        if (!user) return;
        const qProfile = query(collection(db, 'jewelers'), where('uid', '==', user.uid));
        const unsubProfile = onSnapshot(qProfile, (snapshot) => {
            if (!snapshot.empty) {
                setProfile({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() });
            }
            setLoading(false);
        });

        const qProducts = query(collection(db, 'products'), where('jewelerUid', '==', user.uid));
        const unsubProducts = onSnapshot(qProducts, (snapshot) => {
            setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        const qBookings = query(collection(db, 'bookings'), where('jewelerUid', '==', user.uid));
        const unsubBookings = onSnapshot(qBookings, (snapshot) => {
            setBookings(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        return () => {
            unsubProfile();
            unsubProducts();
            unsubBookings();
        };
    }, [user]);

    const handleLogout = async () => {
        await signOut(auth);
        setPage('home');
    };
    
    if (loading) return <div className="page-center"><h1>Loading Dashboard...</h1></div>;

    const totalProducts = products.length;
    // Simulate total views for demonstration purposes
    const totalViews = products.reduce((sum, product) => sum + (product.views || Math.floor(Math.random() * 100) + 10), 0);
    const totalBookings = bookings.length;

    const renderContent = () => {
        switch (activeTab) {
            case 'summary': return (
                <div className="dashboard-section">
                    <h2 className="dashboard-content-title">Dashboard Summary</h2>
                    <div className="stats-grid">
                        <div className="stat-card"><p className="stat-card-value">{totalProducts}</p><p className="stat-card-label">Total Products</p></div>
                        <div className="stat-card"><p className="stat-card-value">{totalViews}</p><p className="stat-card-label">Total Views</p></div>
                        <div className="stat-card"><p className="stat-card-value">{totalBookings}</p><p className="stat-card-label">Total Bookings</p></div>
                    </div>
                </div>
            );
            case 'products': return <ManageProducts user={user} products={products} />;
            case 'bookings': return <BookingsList bookings={bookings} />;
            case 'profile': return <EditProfile profile={profile} />;
            case 'feedback': return <FeedbackForm user={user} />;
            default: return null;
        }
    };

    return (
        <div className="dashboard">
            <header className="dashboard-header">
                <h1>Welcome, {profile?.shopName || 'Jeweler'}</h1>
                <div>
                    <button onClick={() => setPage('productsList')} className="btn btn-link">View Site</button>
                    <button onClick={handleLogout} className="btn btn-secondary">Logout</button>
                </div>
            </header>
            <main className="dashboard-main">
                <nav className="dashboard-nav">
                    <button onClick={() => setActiveTab('summary')} className={activeTab === 'summary' ? 'active' : ''}>Summary</button>
                    <button onClick={() => setActiveTab('products')} className={activeTab === 'products' ? 'active' : ''}>Manage Products</button>
                    <button onClick={() => setActiveTab('bookings')} className={activeTab === 'bookings' ? 'active' : ''}>Bookings</button>
                    <button onClick={() => setActiveTab('profile')} className={activeTab === 'profile' ? 'active' : ''}>Edit Profile</button>
                    <button onClick={() => setActiveTab('feedback')} className={activeTab === 'feedback' ? 'active' : ''}>Give Feedback</button>
                </nav>
                <div>{renderContent()}</div>
            </main>
        </div>
    );
};

const ManageProducts = ({ user, products }) => {
    const showToast = useToast();
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [selectedProductForBooking, setSelectedProductForBooking] = useState(null);

    const handleAddProduct = () => { setEditingProduct(null); setShowModal(true); };
    const handleEditProduct = (product) => { setEditingProduct(product); setShowModal(true); };
    const requestDeleteProduct = (product) => setConfirmDelete(product);

    const handleDeleteProduct = async () => {
        if (!confirmDelete) return;
        try {
            // Delete images from Firebase Storage
            if (confirmDelete.imageUrls && confirmDelete.imageUrls.length > 0) {
                for (const imageUrl of confirmDelete.imageUrls) {
                    try {
                        const imageRef = ref(storage, imageUrl);
                        await deleteObject(imageRef);
                    } catch (e) {
                        console.warn(`Could not delete image ${imageUrl}:`, e);
                    }
                }
            }
            await deleteDoc(doc(db, "products", confirmDelete.id));
            showToast("Product deleted successfully!", "success");
        } catch (error) {
            showToast(`Error deleting product: ${error.message}`, "error");
        } finally {
            setConfirmDelete(null);
        }
    };

    const handleBookProduct = (product) => {
        setSelectedProductForBooking(product);
        setShowBookingModal(true);
    };

    const handleSaveBooking = async (bookingDetails) => {
        if (!user || !selectedProductForBooking) {
            showToast("Error: User or product not selected for booking.", "error");
            return;
        }
        try {
            const bookingToSave = {
               ...bookingDetails,
                productId: selectedProductForBooking.id,
                productTitle: selectedProductForBooking.title,
                jewelerUid: user.uid,
                bookingDate: new Date().toISOString(),
            };
            await addDoc(collection(db, 'bookings'), bookingToSave);
            showToast("Booking saved successfully!", "success");
            setShowBookingModal(false);
            setSelectedProductForBooking(null);
        } catch (error) {
            console.error("Error saving booking:", error);
            showToast("Failed to save booking.", "error");
        }
    };

    return (
        <div>
            <div className="manage-products-header">
                <h2 className="dashboard-content-title">Your Products</h2>
                <button onClick={handleAddProduct} className="btn btn-primary">+ Add Product</button>
            </div>
            <div className="dashboard-section">
                {products.length === 0 ? (
                    <p>You haven't added any products yet. Click "Add Product" to get started!</p>
                ) : (
                    <div className="product-grid">
                        {products.map(product => (
                            <div key={product.id} className="product-card">
                                <img src={product.imageUrls?.[0] || `https://placehold.co/400x400/f5f5f5/333?text=Jewelry`} alt={product.title} className="product-card-img"/>
                                <div className="product-card-body">
                                    <h3 className="product-card-title">{product.title}</h3>
                                    <p className="product-card-price">₹{product.price.toLocaleString()}</p>
                                    <p className="product-card-desc">Stock: {product.stock}</p>
                                    <div className="product-card-actions">
                                        <button onClick={() => handleBookProduct(product)} className="btn btn-primary">Book Product</button>
                                        <button onClick={() => handleEditProduct(product)} className="btn btn-secondary">Edit</button>
                                        <button onClick={() => requestDeleteProduct(product)} className="btn btn-danger">Delete</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {showModal && <ProductForm user={user} product={editingProduct} onClose={() => setShowModal(false)} />}
            {confirmDelete && <CustomConfirm message={`Are you sure you want to delete "${confirmDelete.title}"? This action cannot be undone.`} onConfirm={handleDeleteProduct} onCancel={() => setConfirmDelete(null)} />}
            {showBookingModal && (
                <BookingModal
                    product={selectedProductForBooking}
                    onSave={handleSaveBooking}
                    onClose={() => { setShowBookingModal(false); setSelectedProductForBooking(null); }}
                />
            )}
        </div>
    );
};

const ProductListPage = ({ setPage, setCurrentProduct, searchTerm: initialSearchTerm }) => {
    const [products, setProducts] = useState([]);
    const [jewelers, setJewelers] = useState({});
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState(initialSearchTerm || '');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [priceFilter, setPriceFilter] = useState('');
    const [locationSearchTerm, setLocationSearchTerm] = useState('');

    const categories = ['All', 'Ring', 'Necklace', 'Earrings', 'Bracelet', 'Other'];

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const [jewelersSnap, productsSnap] = await Promise.all([
                getDocs(collection(db, 'jewelers')),
                getDocs(collection(db, 'products'))
            ]);
            const jewelersMap = {};
            jewelersSnap.forEach(doc => { jewelersMap[doc.data().uid] = doc.data(); });
            setJewelers(jewelersMap);
            setProducts(productsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setLoading(false);
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (initialSearchTerm) {
            setSearchTerm(initialSearchTerm);
            if (categories.includes(initialSearchTerm)) {
                setCategoryFilter(initialSearchTerm);
            }
        }
    }, [initialSearchTerm, categories]);
    
    const filteredProducts = products
       .filter(p => 
            (p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
             p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
             jewelers[p.jewelerUid]?.shopName.toLowerCase().includes(searchTerm.toLowerCase())) &&
            (categoryFilter === 'All' || !categoryFilter || p.category === categoryFilter) &&
            (locationSearchTerm === '' || (jewelers[p.jewelerUid]?.address && jewelers[p.jewelerUid].address.toLowerCase().includes(locationSearchTerm.toLowerCase())))
        )
       .filter(p => {
            if (!priceFilter) return true;
            const [min, max] = priceFilter.split('-').map(Number);
            return max ? (p.price >= min && p.price <= max) : p.price >= min;
        });
        
    const handleProductClick = (product) => { setCurrentProduct(product); setPage('productDetail'); };

    return (
        <div style={{display: 'flex', flexDirection: 'column', minHeight: '100vh'}}>
            <main className="site-main">
                <div className="filters-container">
                    <input type="text" placeholder="Search by product, category or jeweler..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="form-input"/>
                    <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="form-input">
                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                    <input type="text" placeholder="Search by jeweler location..." value={locationSearchTerm} onChange={(e) => setLocationSearchTerm(e.target.value)} className="form-input"/>
                    <select value={priceFilter} onChange={(e) => setPriceFilter(e.target.value)} className="form-input">
                        <option value="">All Prices</option>
                        <option value="0-5000">₹0 - ₹5,000</option>
                        <option value="5000-20000">₹5,000 - ₹20,000</option>
                        <option value="20000-50000">₹20,000 - ₹50,000</option>
                        <option value="50000-">₹50,000+</option>
                    </select>
                </div>
                {loading ? <p className="page-center">Loading products...</p> : (
                    <div className="product-grid">
                        {filteredProducts.map(product => (
                            <div key={product.id} onClick={() => handleProductClick(product)} className="public-product-card">
                                <img src={product.imageUrls?.[0] || `https://placehold.co/600x600/f5f5f5/333?text=Jewelry`} alt={product.title} className="product-card-img" />
                                <div className="product-card-body">
                                    <h3 className="product-card-title">{product.title}</h3>
                                    <p className="product-card-shop">by {jewelers[product.jewelerUid]?.shopName || '...'}</p>
                                    <p className="product-card-price">₹{product.price.toLocaleString()}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                 {filteredProducts.length === 0 && !loading && <p className="page-center">No products found matching your criteria.</p>}
            </main>
        </div>
    );
};

const ProductDetailPage = ({ product, setPage, user, customerProfile }) => {
    const showToast = useToast();
    const [jeweler, setJeweler] = useState(null);
    const [showInquiryModal, setShowInquiryModal] = useState(false);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isWishlisted, setIsWishlisted] = useState(false);

    useEffect(() => {
        if (!product) return;
        const q = query(collection(db, 'jewelers'), where('uid', '==', product.jewelerUid));
        getDocs(q).then(snap => !snap.empty && setJeweler(snap.docs[0].data()));

        // Check wishlist status
        if (user && customerProfile) {
            const wishlistRef = doc(db, 'wishlists', user.uid);
            const unsubWishlist = onSnapshot(wishlistRef, (docSnap) => {
                if (docSnap.exists() && docSnap.data().products?.[product.id]) {
                    setIsWishlisted(true);
                } else {
                    setIsWishlisted(false);
                }
            });
            return () => unsubWishlist(); // Cleanup listener
        }
    }, [product, user, customerProfile]);

    const handleToggleWishlist = async () => {
        if (!user || !customerProfile) {
            showToast("Please log in to manage your wishlist.", "info");
            setPage('customerRegister');
            return;
        }

        const wishlistRef = doc(db, 'wishlists', user.uid);
        try {
            if (isWishlisted) {
                await updateDoc(wishlistRef, {
                    [`products.${product.id}`]: deleteField()
                });
                showToast("Removed from wishlist.", "info");
            } else {
                await updateDoc(wishlistRef, {
                    [`products.${product.id}`]: {
                        addedAt: new Date().toISOString(),
                        productTitle: product.title,
                        productImageUrl: product.imageUrls?.[0],
                        productPrice: product.price,
                        jewelerUid: product.jewelerUid
                    }
                }, { merge: true });
                showToast("Added to wishlist!", "success");
            }
            setIsWishlisted(!isWishlisted);
        } catch (error) {
            console.error("Error updating wishlist:", error);
            showToast("Failed to update wishlist.", "error");
        }
    };

    if (!product) return <div className="page-center"><p>No product selected.</p><button onClick={() => setPage('productsList')} className="btn btn-link">Back to products</button></div>;
    
    return (
        <div style={{display: 'flex', flexDirection: 'column', minHeight: '100vh'}}>
            <main className="site-main">
                <div className="product-detail-container">
                    <div className="product-detail-image-gallery">
                        <img src={product.imageUrls?.[currentImageIndex] || `https://placehold.co/800x800/f5f5f5/333?text=Jewelry`} alt={product.title} className="product-detail-main-image" />
                        {product.imageUrls && product.imageUrls.length > 1 && (
                            <div className="product-detail-thumbnails">
                                {product.imageUrls.map((imgUrl, index) => (
                                    <img
                                        key={index}
                                        src={imgUrl}
                                        alt={`Thumbnail ${index + 1}`}
                                        className={`product-detail-thumbnail ${index === currentImageIndex ? 'active' : ''}`}
                                        onClick={() => setCurrentImageIndex(index)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="product-detail-info">
                        <div>
                            <h1>{product.title}</h1>
                            <p className="price">₹{product.price.toLocaleString()}</p>
                            <p className="description">{product.description}</p>
                        </div>
                        <div className="jeweler-contact">
                            {!jeweler ? <p>Loading jeweler details...</p> : (
                                <>
                                    <h2>Contact Jeweler</h2>
                                    <p><strong>{jeweler.shopName}</strong></p>
                                    <p>{jeweler.address}</p>
                                    <div className="contact-options">
                                        <a href={`tel:${jeweler.phone}`} className="btn btn-secondary">Call Jeweler</a>
                                        <a href={`https://wa.me/${jeweler.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp">WhatsApp</a>
                                        <button onClick={() => setShowInquiryModal(true)} className="btn btn-primary">Send Inquiry</button>
                                    </div>
                                </>
                            )}
                            <div style={{marginTop: '2rem'}}>
                                <button onClick={handleToggleWishlist} className="btn btn-secondary">
                                    {isWishlisted ? '❤️ Remove from Wishlist' : '🤍 Add to Wishlist'}
                                </button>
                                <button onClick={() => setShowFeedbackModal(true)} className="btn btn-secondary" style={{marginLeft: '1rem'}}>
                                    Rate Jeweler
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            {showInquiryModal && (
                <InquiryModal
                    product={product}
                    jeweler={jeweler}
                    customer={customerProfile}
                    onClose={() => setShowInquiryModal(false)}
                />
            )}
            {showFeedbackModal && (
                <FeedbackForm // Changed from CustomerFeedbackForm
                    user={user} // Pass user prop to FeedbackForm
                    onClose={() => setShowFeedbackModal(false)}
                />
            )}
        </div>
    );
};

const InquiryModal = ({ product, jeweler, customer, onClose }) => {
    const showToast = useToast();
    const [customerName, setCustomerName] = useState(customer?.name || '');
    const [customerEmail, setCustomerEmail] = useState(customer?.email || '');
    const [customerPhone, setCustomerPhone] = useState('');
    const [message, setMessage] = useState('');
    const [formErrors, setFormErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const validateForm = () => {
        const errors = {};
        if (!customerName.trim()) errors.customerName = "Your Name is required.";
        if (!customerEmail.trim()) errors.customerEmail = "Your Email is required.";
        if (!customerPhone.trim()) errors.customerPhone = "Your Phone is required.";
        if (!message.trim()) errors.message = "Message is required.";
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        setLoading(true);

        try {
            await addDoc(collection(db, 'inquiries'), {
                productId: product.id,
                productTitle: product.title,
                jewelerUid: jeweler.uid,
                customerUid: customer?.uid || null,
                customerName,
                customerEmail,
                customerPhone,
                message,
                inquiryDate: new Date().toISOString(),
                status: 'pending'
            });
            showToast("Inquiry sent successfully!", "success");
            onClose();
        } catch (error) {
            console.error("Error sending inquiry:", error);
            showToast("Failed to send inquiry.", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal onClose={onClose} title={`Inquiry for: ${product?.title}`}>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label className="form-label" htmlFor="inquiryName">Your Name</label>
                    <input type="text" id="inquiryName" value={customerName} onChange={e => setCustomerName(e.target.value)} className="form-input" />
                    {formErrors.customerName && <p className="form-error-message">{formErrors.customerName}</p>}
                </div>
                <div className="form-group">
                    <label className="form-label" htmlFor="inquiryEmail">Your Email</label>
                    <input type="email" id="inquiryEmail" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} className="form-input" />
                    {formErrors.customerEmail && <p className="form-error-message">{formErrors.customerEmail}</p>}
                </div>
                <div className="form-group">
                    <label className="form-label" htmlFor="inquiryPhone">Your Phone</label>
                    <input type="tel" id="inquiryPhone" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} className="form-input" />
                    {formErrors.customerPhone && <p className="form-error-message">{formErrors.customerPhone}</p>}
                </div>
                <div className="form-group">
                    <label className="form-label" htmlFor="inquiryMessage">Message</label>
                    <textarea id="inquiryMessage" value={message} onChange={e => setMessage(e.target.value)} className="form-textarea" placeholder="I'm interested in this product..."></textarea>
                    {formErrors.message && <p className="form-error-message">{formErrors.message}</p>}
                </div>
                <div className="modal-footer">
                    <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
                    <button type="submit" disabled={loading} className="btn btn-primary">{loading ? 'Sending...' : 'Send Inquiry'}</button>
                </div>
            </form>
        </Modal>
    );
};

const CustomerDashboard = ({ user, setPage }) => {
    const [activeTab, setActiveTab] = useState('wishlist');
    const [customerProfile, setCustomerProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [wishlistProducts, setWishlistProducts] = useState([]);
    const [customerBookings, setCustomerBookings] = useState([]);
    const [customerInquiries, setCustomerInquiries] = useState([]);

    useEffect(() => {
        if (!user) return;
        const qProfile = query(collection(db, 'customers'), where('uid', '==', user.uid));
        const unsubProfile = onSnapshot(qProfile, (snapshot) => {
            if (!snapshot.empty) {
                setCustomerProfile({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() });
            }
            setLoading(false);
        });

        const wishlistRef = doc(db, 'wishlists', user.uid);
        const unsubWishlist = onSnapshot(wishlistRef, (docSnap) => {
            if (docSnap.exists() && docSnap.data().products) {
                const productsMap = docSnap.data().products;
                // Convert map of products to an array for easier rendering
                const productsArray = Object.keys(productsMap).map(productId => ({
                    id: productId,
                    ...productsMap[productId]
                }));
                setWishlistProducts(productsArray);
            } else {
                setWishlistProducts([]);
            }
        });

        const qBookings = query(collection(db, 'bookings'), where('customerUid', '==', user.uid));
        const unsubBookings = onSnapshot(qBookings, (snapshot) => {
            setCustomerBookings(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        const qInquiries = query(collection(db, 'inquiries'), where('customerUid', '==', user.uid));
        const unsubInquiries = onSnapshot(qInquiries, (snapshot) => {
            setCustomerInquiries(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });


        return () => {
            unsubProfile();
            unsubWishlist();
            unsubBookings();
            unsubInquiries();
        };
    }, [user]);

    const handleLogout = async () => {
        await signOut(auth);
        setPage('home');
    };

    if (loading) return <div className="page-center"><h1>Loading Dashboard...</h1></div>;

    const renderContent = () => {
        switch (activeTab) {
            case 'wishlist': return (
                <div className="dashboard-section">
                    <h2 className="customer-section-title">Your Wishlist</h2>
                    {wishlistProducts.length === 0 ? (
                        <p>Your wishlist is empty. Explore products to add some!</p>
                    ) : (
                        <div className="product-grid">
                            {wishlistProducts.map(product => (
                                <div key={product.id} className="product-card">
                                    <img src={product.productImageUrl || `https://placehold.co/400x400/f5f5f5/333?text=Jewelry`} alt={product.productTitle} className="product-card-img"/>
                                    <div className="product-card-body">
                                        <h3 className="product-card-title">{product.productTitle}</h3>
                                        <p className="product-card-price">₹{product.productPrice?.toLocaleString()}</p>
                                        <p className="product-card-desc">Added: {new Date(product.addedAt).toLocaleDateString()}</p>
                                        {/* You might add a "View Product" button here */}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            );
            case 'bookings': return (
                <div className="dashboard-section">
                    <h2 className="customer-section-title">Your Bookings</h2>
                    {customerBookings.length === 0 ? (
                        <p>You have no active bookings.</p>
                    ) : (
                        <div className="list-items">
                            {customerBookings.map(booking => (
                                <div key={booking.id} className="customer-list-item">
                                    <h3>Product: <span className="product-info">{booking.productTitle}</span></h3>
                                    <p>Jeweler ID: {booking.jewelerUid}</p>
                                    <p>Preferred Date: <span className="date-info">{new Date(booking.preferredDate).toLocaleDateString()}</span></p>
                                    <p>Booking Made On: <span className="date-info">{new Date(booking.bookingDate).toLocaleDateString()}</span></p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            );
            case 'inquiries': return (
                <div className="dashboard-section">
                    <h2 className="customer-section-title">Your Inquiries</h2>
                    {customerInquiries.length === 0 ? (
                        <p>You have no sent inquiries.</p>
                    ) : (
                        <div className="list-items">
                            {customerInquiries.map(inquiry => (
                                <div key={inquiry.id} className="customer-list-item">
                                    <h3>Product: <span className="product-info">{inquiry.productTitle}</span></h3>
                                    <p>Jeweler ID: {inquiry.jewelerUid}</p>
                                    <p>Message: {inquiry.message}</p>
                                    <p>Status: {inquiry.status}</p>
                                    <p>Sent On: <span className="date-info">{new Date(inquiry.inquiryDate).toLocaleDateString()}</span></p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            );
            default: return null;
        }
    };

    return (
        <div className="dashboard">
            <header className="dashboard-header">
                <h1>Welcome, {customerProfile?.name || 'Customer'}</h1>
                <div>
                    <button onClick={() => setPage('productsList')} className="btn btn-link">Explore Products</button>
                    <button onClick={handleLogout} className="btn btn-secondary">Logout</button>
                </div>
            </header>
            <main className="dashboard-main">
                <nav className="customer-dashboard-nav">
                    <button onClick={() => setActiveTab('wishlist')} className={activeTab === 'wishlist' ? 'active' : ''}>Wishlist</button>
                    <button onClick={() => setActiveTab('bookings')} className={activeTab === 'bookings' ? 'active' : ''}>My Bookings</button>
                    <button onClick={() => setActiveTab('inquiries')} className={activeTab === 'inquiries' ? 'active' : ''}>My Inquiries</button>
                </nav>
                <div>{renderContent()}</div>
            </main>
        </div>
    );
};


// --- Main App Component ---
export default function App() {
    const [page, setPage] = useState('home');
    const [user, setUser] = useState(null);
    const [loadingAuth, setLoadingAuth] = useState(true);
    const [currentProduct, setCurrentProduct] = useState(null);
    const [customerProfile, setCustomerProfile] = useState(null);
    const [jewelerProfile, setJewelerProfile] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const isJeweler = user && jewelerProfile;
    const isCustomer = user && customerProfile;

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                const jewelerQuery = query(collection(db, 'jewelers'), where('uid', '==', currentUser.uid));
                const customerQuery = query(collection(db, 'customers'), where('uid', '==', currentUser.uid));

                const [jewelerSnap, customerSnap] = await Promise.all([
                    getDocs(jewelerQuery),
                    getDocs(customerQuery)
                ]);

                if (!jewelerSnap.empty) {
                    setJewelerProfile({ id: jewelerSnap.docs[0].id, ...jewelerSnap.docs[0].data() });
                    setPage('jewelerDashboard');
                } else if (!customerSnap.empty) {
                    setCustomerProfile({ id: customerSnap.docs[0].id, ...customerSnap.docs[0].data() });
                    setPage('customerDashboard');
                } else {
                    setPage('home');
                }
            } else {
                setJewelerProfile(null);
                setCustomerProfile(null);
                setPage('home');
            }
            setLoadingAuth(false);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (user && page === 'customerDashboard' && !customerProfile) {
            const qCustomer = query(collection(db, 'customers'), where('uid', '==', user.uid));
            const unsubCustomer = onSnapshot(qCustomer, (snapshot) => {
                if (!snapshot.empty) {
                    setCustomerProfile({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() });
                }
            });
            return () => unsubCustomer();
        }
    }, [user, page, customerProfile]);

    useEffect(() => {
        if (user && page === 'jewelerDashboard' && !jewelerProfile) {
            const qJeweler = query(collection(db, 'jewelers'), where('uid', '==', user.uid));
            const unsubJeweler = onSnapshot(qJeweler, (snapshot) => {
                if (!snapshot.empty) {
                    setJewelerProfile({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() });
                }
            });
            return () => unsubJeweler();
        }
    }, [user, page, jewelerProfile]);

    const handleLogout = async () => {
        await signOut(auth);
        setUser(null);
        setJewelerProfile(null);
        setCustomerProfile(null);
        setPage('home');
    };
    
    if (loadingAuth) {
        return <div className="page-center"><h1>Loading...</h1></div>
    }

    const renderPage = () => {
        switch (page) {
            case 'jewelerRegister': return <JewelerAuth setPage={setPage} />;
            case 'customerRegister': return <CustomerAuth setPage={setPage} />;
            case 'jewelerDashboard': return <JewelerDashboard user={user} setPage={setPage} />;
            case 'customerDashboard': return <CustomerDashboard user={user} setPage={setPage} customerProfile={customerProfile} />;
            case 'productsList': return <ProductListPage setPage={setPage} setCurrentProduct={setCurrentProduct} searchTerm={searchTerm} />;
            case 'productDetail': return <ProductDetailPage product={currentProduct} setPage={setPage} user={user} customerProfile={customerProfile} />;
            case 'home':
            default: return <HomePage setPage={setPage} setSearchTerm={setSearchTerm} />;
        }
    };

    return (
        <div className="app-container">
            <GlobalCSS />
            <ToastProvider>
                {(page !== 'jewelerRegister' && page !== 'customerRegister') && (
                    <Navbar setPage={setPage} user={user} isJeweler={isJeweler} isCustomer={isCustomer} handleLogout={handleLogout} />
                )}
                {renderPage()}
            </ToastProvider>
        </div>
    );
}
