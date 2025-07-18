import React, { useState, useEffect, useRef, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, collection, addDoc, getDocs, query, where, doc, updateDoc, onSnapshot, deleteDoc, arrayUnion, arrayRemove, deleteField } from 'firebase/firestore';
import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';

// --- Firebase Configuration ---
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
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// --- Global Styles ---
const GlobalCSS = () => (
<style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Roboto:wght@400;500&display=swap');
    /* ... CSS unchanged for brevity ... */
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
                {!user && (
                    <>
                        <a href="#" onClick={() => setPage('customerRegister')} className="navbar-link">Customer Portal</a>
                        <a href="#" onClick={() => setPage('jewelerRegister')} className="navbar-link">Jeweler Portal</a>
                    </>
                )}
                {user && isJeweler && (
                    <a href="#" onClick={() => setPage('jewelerDashboard')} className="navbar-link">Dashboard</a>
                )}
                {user && isCustomer && (
                    <a href="#" onClick={() => setPage('customerDashboard')} className="navbar-link">My Account</a>
                )}
                {user && (
                    <button onClick={handleLogout} className="btn btn-link navbar-link" style={{textTransform: 'none', letterSpacing: '0', padding: '0'}}>Logout</button>
                )}
            </div>
        </nav>
    );
};


// --- Core Components ---

const HomePage = ({ setPage, setSearchTerm }) => {
    // ... unchanged for brevity ...
    // (Same as original)
    // No syntax errors found in this section.
    // ...
};

const JewelerAuth = ({ setPage }) => {
    // ... unchanged for brevity ...
    // (Same as original)
    // No syntax errors found in this section.
    // ...
};

const CustomerAuth = ({ setPage }) => {
    // ... unchanged for brevity ...
    // (Same as original)
    // No syntax errors found in this section.
    // ...
};


// --- Dashboard Components ---
// Moved these components up so they are defined before JewelerDashboard uses them.

// ---- FIXED: ProductForm textarea and label were truncated in your code. ----

const ProductForm = ({ user, product, onClose }) => {
    // ... rest code unchanged ...
    // Fix: Complete the textarea element and form-tip element that were truncated.
    // Original had:
    // <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe the product's features, materials, craftsmanship, and unique sel[...]
    // <p className="form-tip">Tips: Mention materials (e.g., 18K Gold, Sterling Silver, Diamonds), gemstone details (cut, clarity, carat), dimensions, and inspiration behind the design.<[...]
    // Corrected to:
    // ...

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
                    <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe the product's features, materials, craftsmanship, and unique selling points..." className="form-textarea" />
                    <p className="form-tip">Tips: Mention materials (e.g., 18K Gold, Sterling Silver, Diamonds), gemstone details (cut, clarity, carat), dimensions, and inspiration behind the design.</p>
                    {formErrors.description && <p className="form-error-message">{formErrors.description}</p>}
                </div>
                {/* ... rest unchanged ... */}
                {/* The rest of the form is correct */}
            </form>
        </Modal>
    );
};

// ---- FIXED: EditProfile form labels and input were truncated in your code. ----
const EditProfile = ({ profile }) => {
    // ... unchanged except fixed form inputs:
    // Original had:
    // <div className="form-group"><label className="form-label">Shop Name</label><input type="text" value={shopName} onChange={e => setShopName(e.target.value)} className="form-input" /></di[...]
    // ... these lines were truncated.
    // Corrected:
    return (
        <div className="dashboard-section">
            <h2 className="dashboard-content-title">Edit Shop Profile</h2>
            <form onSubmit={handleUpdate}>
                <div className="form-group">
                    <label className="form-label">Shop Name</label>
                    <input type="text" value={shopName} onChange={e => setShopName(e.target.value)} className="form-input" />
                </div>
                <div className="form-group">
                    <label className="form-label">Your Name</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} className="form-input" />
                </div>
                <div className="form-group">
                    <label className="form-label">Address</label>
                    <input type="text" value={address} onChange={e => setAddress(e.target.value)} className="form-input" />
                </div>
                <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="form-input" />
                </div>
                <button type="submit" disabled={loading} className="btn btn-primary">{loading ? 'Saving...' : 'Save Changes'}</button>
            </form>
        </div>
    );
};

// ---- FIXED: FeedbackForm (CustomerFeedbackForm) signature and usage ----
// In ProductDetailPage, you were calling <FeedbackForm ... /> with jewelerUid and customer props, but your FeedbackForm only accepted user and onClose.
// Either pass user prop or fix the FeedbackForm to accept jewelerUid and customer. We'll fix FeedbackForm to accept jewelerUid and customer.

const FeedbackForm = ({ jewelerUid, customer, onClose }) => {
    const showToast = useToast();
    const [feedback, setFeedback] = useState('');
    const [rating, setRating] = useState(0);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!feedback || rating === 0) {
            showToast("Please provide feedback and a rating.", "error");
            return;
        }
        setLoading(true);
        try {
            await addDoc(collection(db, 'feedback'), {
                userUid: customer?.uid || null,
                jewelerUid: jewelerUid || null,
                feedback,
                rating,
                submittedAt: new Date()
            });
            showToast('Thank you for your feedback!', 'success');
            setFeedback('');
            setRating(0);
            if (onClose) onClose();
        } catch (error) {
            showToast('Could not submit feedback. Please try again.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
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
    );
};


// ---- JewelerDashboard was missing from your code. Let's add a basic implementation for completeness. ----

const JewelerDashboard = ({ user, setPage }) => {
    const [activeTab, setActiveTab] = useState('products');
    const [profile, setProfile] = useState(null);
    const [products, setProducts] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [showProductForm, setShowProductForm] = useState(false);
    const [editProduct, setEditProduct] = useState(null);

    useEffect(() => {
        if (!user) return;
        const qProfile = query(collection(db, 'jewelers'), where('uid', '==', user.uid));
        const unsubProfile = onSnapshot(qProfile, (snapshot) => {
            if (!snapshot.empty) {
                setProfile({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() });
            }
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

    const handleEditProduct = (product) => {
        setEditProduct(product);
        setShowProductForm(true);
    };

    const handleAddProduct = () => {
        setEditProduct(null);
        setShowProductForm(true);
    };

    const handleCloseProductForm = () => {
        setShowProductForm(false);
        setEditProduct(null);
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'products':
                return (
                    <div className="dashboard-section">
                        <div className="manage-products-header">
                            <h2 className="dashboard-content-title">Manage Products</h2>
                            <button className="btn btn-primary" onClick={handleAddProduct}>Add Product</button>
                        </div>
                        <div className="product-grid">
                            {products.map(product => (
                                <div key={product.id} className="product-card">
                                    <img src={product.imageUrls?.[0] || `https://placehold.co/400x400/f5f5f5/333?text=Jewelry`} alt={product.title} className="product-card-img"/>
                                    <div className="product-card-body">
                                        <h3 className="product-card-title">{product.title}</h3>
                                        <p className="product-card-price">₹{product.price?.toLocaleString()}</p>
                                        <p className="product-card-desc">{product.description}</p>
                                        <div className="product-card-actions">
                                            <button className="btn btn-secondary" onClick={() => handleEditProduct(product)}>Edit</button>
                                            {/* Delete product functionality can be added */}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {showProductForm && (
                            <ProductForm
                                user={user}
                                product={editProduct}
                                onClose={handleCloseProductForm}
                            />
                        )}
                    </div>
                );
            case 'bookings':
                return <BookingsList bookings={bookings} />;
            case 'profile':
                return <EditProfile profile={profile} />;
            case 'stats':
                return <DashboardStats user={user} />;
            default:
                return null;
        }
    };

    return (
        <div className="dashboard">
            <header className="dashboard-header">
                <h1>Welcome, {profile?.shopName || 'Jeweler'}</h1>
                <div>
                    <button onClick={handleLogout} className="btn btn-secondary">Logout</button>
                </div>
            </header>
            <main className="dashboard-main">
                <nav className="dashboard-nav">
                    <button onClick={() => setActiveTab('products')} className={activeTab === 'products' ? 'active' : ''}>Products</button>
                    <button onClick={() => setActiveTab('bookings')} className={activeTab === 'bookings' ? 'active' : ''}>Bookings</button>
                    <button onClick={() => setActiveTab('profile')} className={activeTab === 'profile' ? 'active' : ''}>Profile</button>
                    <button onClick={() => setActiveTab('stats')} className={activeTab === 'stats' ? 'active' : ''}>Stats</button>
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