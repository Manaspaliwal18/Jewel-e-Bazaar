import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, collection, addDoc, getDocs, query, where, doc, updateDoc, onSnapshot, deleteDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

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

    :root {
        --primary-gold: #D4AF37;
        --primary-gold-dark: #c09b2e;
        --deep-navy: #0A1F44;
        --light-bg: #F5F5F5;
        --white: #FFFFFF;
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
    .form-input, .form-textarea {
        width: 100%;
        padding: 14px;
        border: 1px solid var(--medium-gray);
        border-radius: var(--border-radius);
        font-size: 16px;
        font-family: var(--font-body);
        transition: border-color 0.3s, box-shadow 0.3s;
    }
    .form-input:focus, .form-textarea:focus {
        outline: none;
        border-color: var(--primary-gold);
        box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.2);
    }
    .form-textarea {
        min-height: 120px;
        resize: vertical;
    }
    .form-error {
        background-color: #f8d7da;
        color: #721c24;
        padding: 1rem;
        border-radius: var(--border-radius);
        margin-bottom: 1rem;
        border: 1px solid #f5c6cb;
    }
    .form-message {
        background-color: #d4edda;
        color: #155724;
        padding: 1rem;
        border-radius: var(--border-radius);
        margin-bottom: 1rem;
        border: 1px solid #c3e6cb;
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
        max-width: 500px;
        animation: slideIn 0.4s ease;
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
    
    /* Auth Page */
    .auth-toggle {
        text-align: center;
        margin-top: 1.5rem;
    }
    
    /* Dashboard */
    .dashboard {
        background-color: var(--light-bg);
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
    }
    .dashboard-nav button:hover { color: var(--primary-gold); }
    .dashboard-nav button.active {
        color: var(--deep-navy);
        border-bottom-color: var(--primary-gold);
    }
    .dashboard-content-title {
        font-size: 2.2rem;
        margin-bottom: 1.5rem;
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
    .product-card-actions { display: flex; gap: 0.5rem; }
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
    }
    .site-main {
        max-width: 1600px;
        margin: 0 auto;
        padding: 2rem;
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
        .filters-container { grid-template-columns: 1fr 1fr; }
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
    .product-detail-image {
        width: 100%;
        height: 100%;
        max-height: 600px;
        object-fit: cover;
        background-color: var(--light-bg);
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

`}</style>
);


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

const CustomAlert = ({ message, onClose }) => (
    <Modal onClose={onClose} title="Notification">
        <p>{message}</p>
        <div className="modal-footer">
            <button onClick={onClose} className="btn btn-primary">OK</button>
        </div>
    </Modal>
);

const CustomConfirm = ({ message, onConfirm, onCancel }) => (
    <Modal>
        <h2 className="modal-header">Confirmation</h2>
        <p>{message}</p>
        <div className="modal-footer">
            <button onClick={onCancel} className="btn btn-secondary">Cancel</button>
            <button onClick={onConfirm} className="btn btn-danger">Confirm</button>
        </div>
    </Modal>
);


// --- Core Components ---

const HomePage = ({ setPage }) => (
    <div className="page-center home-page">
        <h1>Jewel e Bazaar</h1>
        <p>Your Gateway to Jewelry Market Anytime, Anywhere.</p>
        <button onClick={() => setPage('register')} className="btn btn-primary">
            Join as a Jeweler
        </button>
    </div>
);
const JewelerAuth = ({ setPage }) => {
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
            }
        } catch (err) {
            setError(err.message.replace('Firebase: ', ''));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-center">
            <div className="form-container">
                <h2 className="form-title">{isLogin ? 'Jeweler Login' : 'Jeweler Registration'}</h2>
                {error && <p className="form-error">{error}</p>}
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

const JewelerDashboard = ({ user, setPage }) => {
    const [activeTab, setActiveTab] = useState('products');
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        const qProfile = query(collection(db, 'jewelers'), where('uid', '==', user.uid));
        const unsubProfile = onSnapshot(qProfile, (snapshot) => {
            if (!snapshot.empty) {
                setProfile({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() });
            }
            setLoading(false);
        });
        return () => unsubProfile();
    }, [user]);

    const handleLogout = async () => {
        await signOut(auth);
        setPage('home');
    };
    
    if (loading) return <div className="page-center"><h1>Loading Dashboard...</h1></div>;

    const renderContent = () => {
        switch (activeTab) {
            case 'products': return <ManageProducts user={user} />;
            case 'profile': return <EditProfile profile={profile} />;
            case 'stats': return <DashboardStats user={user} />;
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
                    <button onClick={() => setActiveTab('products')} className={activeTab === 'products' ? 'active' : ''}>Manage Products</button>
                    <button onClick={() => setActiveTab('profile')} className={activeTab === 'profile' ? 'active' : ''}>Edit Profile</button>
                    <button onClick={() => setActiveTab('stats')} className={activeTab === 'stats' ? 'active' : ''}>Stats</button>
                    <button onClick={() => setActiveTab('feedback')} className={activeTab === 'feedback' ? 'active' : ''}>Give Feedback</button>
                </nav>
                <div>{renderContent()}</div>
            </main>
        </div>
    );
};

const ManageProducts = ({ user }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(null); // Holds product to delete
    const [alertInfo, setAlertInfo] = useState(null);

    useEffect(() => {
        const qProducts = query(collection(db, 'products'), where('jewelerUid', '==', user.uid));
        const unsubProducts = onSnapshot(qProducts, (snapshot) => {
            const productsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setProducts(productsData);
            setLoading(false);
        });
        return () => unsubProducts();
    }, [user]);

    const handleAddProduct = () => { setEditingProduct(null); setShowModal(true); };
    const handleEditProduct = (product) => { setEditingProduct(product); setShowModal(true); };
    const requestDeleteProduct = (product) => setConfirmDelete(product);

    const handleDeleteProduct = async () => {
        if (!confirmDelete) return;
        try {
            await deleteDoc(doc(db, "products", confirmDelete.id));
            setAlertInfo({ message: "Product deleted successfully!" });
        } catch (error) {
            setAlertInfo({ message: `Error deleting product: ${error.message}` });
        } finally {
            setConfirmDelete(null);
        }
    };

    return (
        <div>
            <div className="manage-products-header">
                <h2 className="dashboard-content-title">Your Products</h2>
                <button onClick={handleAddProduct} className="btn btn-primary">+ Add Product</button>
            </div>
            <div className="dashboard-section">
                {loading ? <p>Loading products...</p> : products.length === 0 ? (
                    <p>You haven't added any products yet.</p>
                ) : (
                    <div className="product-grid">
                        {products.map(product => (
                            <div key={product.id} className="product-card">
                                <img src={product.imageUrl || `https://placehold.co/400x400/f5f5f5/333?text=Jewelry`} alt={product.title} className="product-card-img"/>
                                <div className="product-card-body">
                                    <h3 className="product-card-title">{product.title}</h3>
                                    <p className="product-card-price">₹{product.price}</p>
                                    <p className="product-card-desc">{product.description.substring(0, 60)}...</p>
                                    <div className="product-card-actions">
                                        <button onClick={() => handleEditProduct(product)} className="btn btn-secondary">Edit</button>
                                        <button onClick={() => requestDeleteProduct(product)} className="btn btn-danger">Delete</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {showModal && <ProductForm user={user} product={editingProduct} onClose={() => setShowModal(false)} setAlert={setAlertInfo} />}
            {confirmDelete && <CustomConfirm message={`Are you sure you want to delete "${confirmDelete.title}"?`} onConfirm={handleDeleteProduct} onCancel={() => setConfirmDelete(null)} />}
            {alertInfo && <CustomAlert message={alertInfo.message} onClose={() => setAlertInfo(null)} />}
        </div>
    );
};

const ProductForm = ({ user, product, onClose, setAlert }) => {
    const [title, setTitle] = useState(product?.title || '');
    const [description, setDescription] = useState(product?.description || '');
    const [price, setPrice] = useState(product?.price || '');
    const [stock, setStock] = useState(product?.stock || 1);
    const [imageFile, setImageFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title || !price || !description) { setError("Please fill all fields."); return; }
        if (!imageFile && !product) { setError("Please upload an image for a new product."); return; }
        
        setLoading(true);
        setError('');

        try {
            let imageUrl = product?.imageUrl;
            if (imageFile) {
                const storageRef = ref(storage, `products/${user.uid}/${Date.now()}_${imageFile.name}`);
                const snapshot = await uploadBytes(storageRef, imageFile);
                imageUrl = await getDownloadURL(snapshot.ref);
            }
            const productData = { title, description, price: parseFloat(price), stock: parseInt(stock), imageUrl, jewelerUid: user.uid, updatedAt: new Date() };

            if (product) {
                await updateDoc(doc(db, 'products', product.id), productData);
                setAlert({ message: "Product updated successfully!" });
            } else {
                await addDoc(collection(db, 'products'), { ...productData, createdAt: new Date() });
                setAlert({ message: "Product added successfully!" });
            }
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal onClose={onClose} title={product ? 'Edit Product' : 'Add New Product'}>
            {error && <p className="form-error">{error}</p>}
            <form onSubmit={handleSubmit}>
                <div className="form-group"><input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Product Title" className="form-input" /></div>
                <div className="form-group"><textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Product Description" className="form-textarea"></textarea></div>
                <div className="form-group"><input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="Price" className="form-input" /></div>
                <div className="form-group"><input type="number" value={stock} onChange={e => setStock(e.target.value)} placeholder="Stock" className="form-input" /></div>
                <div className="form-group">
                    <label className="form-label">Product Image</label>
                    <input type="file" onChange={e => setImageFile(e.target.files[0])} className="form-input" />
                    {product?.imageUrl && !imageFile && <img src={product.imageUrl} alt="current" style={{width: '80px', height: '80px', objectFit: 'cover', borderRadius: 'var(--border-radius)', marginTop: '1rem'}}/>}
                </div>
                <div className="modal-footer">
                    <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
                    <button type="submit" disabled={loading} className="btn btn-primary">{loading ? 'Saving...' : 'Save Product'}</button>
                </div>
            </form>
        </Modal>
    );
};

const EditProfile = ({ profile }) => {
    const [shopName, setShopName] = useState(profile?.shopName || '');
    const [name, setName] = useState(profile?.name || '');
    const [address, setAddress] = useState(profile?.address || '');
    const [phone, setPhone] = useState(profile?.phone || '');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        try {
            await updateDoc(doc(db, 'jewelers', profile.id), { shopName, name, address, phone });
            setMessage('Profile updated successfully!');
        } catch (error) {
            setMessage('Error updating profile.');
        } finally {
            setLoading(false);
        }
    };
    
    if (!profile) return <p>Loading profile...</p>;

    return (
        <div className="dashboard-section">
            <h2 className="dashboard-content-title">Edit Shop Profile</h2>
            {message && <p className="form-message">{message}</p>}
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

const DashboardStats = ({ user }) => {
    const [products, setProducts] = useState([]);
    useEffect(() => {
        const q = query(collection(db, 'products'), where('jewelerUid', '==', user.uid));
        const unsub = onSnapshot(q, (snapshot) => setProducts(snapshot.docs));
        return () => unsub();
    }, [user]);

    return (
        <div className="dashboard-section">
            <h2 className="dashboard-content-title">Your Statistics</h2>
            <div className="stats-grid">
                <div className="stat-card"><p className="stat-card-value">{products.length}</p><p className="stat-card-label">Total Products</p></div>
                <div className="stat-card"><p className="stat-card-value">0</p><p className="stat-card-label">Product Views (soon)</p></div>
                <div className="stat-card"><p className="stat-card-value">0</p><p className="stat-card-label">Inquiries (soon)</p></div>
            </div>
        </div>
    );
};

const FeedbackForm = ({ user }) => {
    const [feedback, setFeedback] = useState('');
    const [rating, setRating] = useState(0);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!feedback || rating === 0) { setMessage("Please provide feedback and a rating."); return; }
        setLoading(true);
        setMessage('');
        try {
            await addDoc(collection(db, 'feedback'), { jewelerUid: user.uid, feedback, rating, submittedAt: new Date() });
            setMessage('Thank you for your feedback!');
            setFeedback('');
            setRating(0);
        } catch (error) {
            setMessage('Could not submit feedback. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dashboard-section">
            <h2 className="dashboard-content-title">Submit Feedback</h2>
            <p style={{marginBottom: '1rem'}}>We value your opinion to help us improve the platform.</p>
            {message && <p className="form-message">{message}</p>}
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

const ProductListPage = ({ setPage, setCurrentProduct }) => {
    const [products, setProducts] = useState([]);
    const [jewelers, setJewelers] = useState({});
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [priceFilter, setPriceFilter] = useState('');

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
    
    const filteredProducts = products
        .filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()) || jewelers[p.jewelerUid]?.shopName.toLowerCase().includes(searchTerm.toLowerCase()))
        .filter(p => {
            if (!priceFilter) return true;
            const [min, max] = priceFilter.split('-').map(Number);
            return max ? (p.price >= min && p.price <= max) : p.price >= min;
        });
        
    const handleProductClick = (product) => { setCurrentProduct(product); setPage('productDetail'); };

    return (
        <div>
            <header className="site-header">
                <div className="site-header-content">
                    <h1 className="site-title" onClick={() => setPage('home')}>Jewel E Bazaar</h1>
                    <button onClick={() => setPage('register')} className="btn btn-link">Jeweler Portal</button>
                </div>
            </header>
            <main className="site-main">
                <div className="filters-container">
                    <input type="text" placeholder="Search by product or jeweler..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="form-input"/>
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
                                <img src={product.imageUrl || `https://placehold.co/600x600/f5f5f5/333?text=Jewelry`} alt={product.title} className="product-card-img" />
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

const ProductDetailPage = ({ product, setPage }) => {
    const [jeweler, setJeweler] = useState(null);
    useEffect(() => {
        if (!product) return;
        const q = query(collection(db, 'jewelers'), where('uid', '==', product.jewelerUid));
        getDocs(q).then(snap => !snap.empty && setJeweler(snap.docs[0].data()));
    }, [product]);

    if (!product) return <div className="page-center"><p>No product selected.</p><button onClick={() => setPage('productsList')} className="btn btn-link">Back to products</button></div>;
    
    return (
        <div>
            <header className="site-header"><div className="site-header-content"><button onClick={() => setPage('productsList')} className="btn btn-link">← Back to all products</button></div></header>
            <main className="site-main">
                <div className="product-detail-container">
                    <img src={product.imageUrl || `https://placehold.co/800x800/f5f5f5/333?text=Jewelry`} alt={product.title} className="product-detail-image" />
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
                                    <p>Phone: <a href={`tel:${jeweler.phone}`}>{jeweler.phone}</a></p>
                                    <p>Email: <a href={`mailto:${jeweler.email}`}>{jeweler.email}</a></p>
                                    <a href={`https://wa.me/${jeweler.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-whatsapp">Contact on WhatsApp</a>
                                </>
                            )}
                        </div>
                    </div>
                </div>
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

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            if (currentUser && page !== 'dashboard') {
                setPage('dashboard');
            } else if (!currentUser && page === 'dashboard') {
                setPage('home');
            }
            setLoadingAuth(false);
        });
        return () => unsubscribe();
    }, [page]);
    
    if (loadingAuth) {
        return <div className="page-center"><h1>Loading...</h1></div>
    }

    const renderPage = () => {
        switch (page) {
            case 'register': return <JewelerAuth setPage={setPage} />;
            case 'dashboard': return <JewelerDashboard user={user} setPage={setPage} />;
            case 'productsList': return <ProductListPage setPage={setPage} setCurrentProduct={setCurrentProduct} />;
            case 'productDetail': return <ProductDetailPage product={currentProduct} setPage={setPage} />;
            case 'home':
            default: return <HomePage setPage={setPage} />;
        }
    };

    return (
        <div className="app-container">
            <GlobalCSS />
            {renderPage()}
        </div>
    );
}
