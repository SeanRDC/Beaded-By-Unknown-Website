import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Search, ShoppingBag, Heart, User, X, ChevronDown, ChevronRight, Star, Plus, Minus, Trash2, ArrowRight, Eye, Crown, Leaf, Sparkles, Award, Truck, MapPin, Lock, Check, Package, LayoutGrid, SlidersHorizontal, ChevronLeft, Palette, Gem, Layers, ShieldCheck, MessageCircle, Send, Gift, Home, Menu } from 'lucide-react';
import { signInWithRedirect, onAuthStateChanged } from "firebase/auth";
import { auth, googleProvider } from './firebase.js';

import heroImage from './assets/HeroImage.png';
import studio1 from './assets/studio-1.png';
import studio2 from './assets/studio-2.png';
import studio3 from './assets/studio-3.png';
import studio4 from './assets/studio-4.png';
import customPromoImg from './assets/custom-1.png';

// Master Color Reference Map
const cMap = {
  'Dark Blue': '#00008B', 'Navy Blue': '#000080', 'Light Blue': '#ADD8E6', 'Sky Blue': '#87CEEB', 'Blue': '#0000FF',
  'Pink': '#FFB6C1', 'Purple': '#800080', 'Red': '#FF0000', 'Orange': '#FFA500', 'Yellow': '#FFD700',
  'Dark Green': '#006400', 'Light Green': '#90EE90', 'Green': '#008000', 'Moss Green': '#8A9A5B',
  'White': '#FFFFFF', 'Dirty White': '#F5F5DC', 'Black': '#000000', 'Gray': '#808080', 'Brown': '#8B4513'
};

const buildBeads = (id, type, size, price, colorNames) => ({
  id, type, size, price, name: `${type} (${size}mm)`,
  colors: colorNames.map(n => ({ name: n, hex: cMap[n] || '#CCCCCC' }))
});

const beadCollections = [
  buildBeads('rs3', 'Regular Seed', 3, 0.5, ['Dark Blue', 'Light Blue', 'Pink', 'Dark Green', 'Light Green', 'White', 'Black', 'Yellow', 'Red', 'Purple']),
  buildBeads('gs3', 'Glass Seed', 3, 0.5, ['White', 'Dirty White', 'Orange', 'Pink', 'Purple', 'Blue', 'Light Green', 'Green', 'Gray', 'Black']),
  buildBeads('ac6', 'Acrylic', 6, 1, ['Navy Blue', 'Purple', 'Pink', 'Red', 'White', 'Yellow', 'Brown', 'Moss Green', 'Orange', 'Black', 'Gray']),
  buildBeads('ac8', 'Acrylic', 8, 1, ['Navy Blue', 'Purple', 'Pink', 'Red', 'White', 'Yellow', 'Brown', 'Moss Green', 'Orange', 'Black', 'Gray']),
  buildBeads('cr8', 'Cracked', 8, 1, ['Blue', 'Purple', 'Pink', 'Red', 'White', 'Yellow', 'Brown', 'Green']),
  buildBeads('ij4', 'Imitation Jade', 4, 1, ['Dark Blue', 'Light Blue', 'Purple', 'Pink', 'Red', 'White', 'Green', 'Orange', 'Black']),
  buildBeads('ij6', 'Imitation Jade', 6, 2, ['Dark Blue', 'Light Blue', 'Purple', 'Pink', 'Red', 'Brown', 'Green', 'Gray']),
  buildBeads('ij8', 'Imitation Jade', 8, 2, ['Dark Blue', 'Light Blue', 'Purple', 'Pink', 'Red', 'Green', 'Gray']),
  buildBeads('ij10', 'Imitation Jade', 10, 3, ['Sky Blue', 'Purple', 'Pink', 'Red', 'Green', 'Brown', 'Gray', 'Black']),
  buildBeads('ce8', 'Cat Eye', 8, 2, ['Black', 'Gray', 'Brown', 'Blue', 'Green', 'Yellow', 'Orange', 'Pink', 'Purple', 'Red', 'White']),
  buildBeads('ce10', 'Cat Eye', 10, 3, ['Black', 'Gray', 'Brown', 'Blue', 'Green', 'Yellow', 'Orange', 'Pink', 'Purple', 'Red', 'White']),
  buildBeads('ce12', 'Cat Eye', 12, 5, ['Black', 'Gray', 'Brown', 'Blue', 'Green', 'Yellow', 'Orange', 'Pink', 'Purple', 'Red', 'White']),
  buildBeads('ma8', 'Mermaid Acrylic', 8, 2, ['Blue', 'Green', 'Orange', 'Pink', 'Purple', 'White', 'Yellow']),
  buildBeads('ma10', 'Mermaid Acrylic', 10, 3, ['Blue', 'Green', 'Orange', 'Pink', 'Purple', 'White', 'Yellow']),
  buildBeads('ip3', 'Imitation Pearl', 3, 0.5, ['Dirty White', 'White']),
  buildBeads('ip4', 'Imitation Pearl', 4, 1, ['Dirty White', 'White']),
  buildBeads('ip6', 'Imitation Pearl', 6, 1.5, ['Dirty White', 'White']),
  buildBeads('ip8', 'Imitation Pearl', 8, 2, ['Dirty White', 'White']),
  buildBeads('ip10', 'Imitation Pearl', 10, 3, ['Dirty White', 'White']),
  buildBeads('ip12', 'Imitation Pearl', 12, 4, ['Dirty White', 'White']),
];

const strOpts = [
  { id: 's1', name: 'Stretchable Nylon', color: '#E8DFD3', price: 8, desc: 'Durable elastic core. Easy to slip on and off daily.' }, 
  { id: 's2', name: 'Nylon String with Lock', color: '#B0A395', price: 6, desc: 'Non-stretch string secured with a premium metal clasp.' }
];

const charmOpts = [
  { id: 'c1', name: 'Black Cat', em: '🐈‍⬛', price: 10 },
  { id: 'c2', name: 'Pink Cat', em: '🐱', price: 10 },
  { id: 'c3', name: 'Teal Cat', em: '😸', price: 10 },
  { id: 'c4', name: 'Black Whale Tail', em: '🐋', price: 10 },
  { id: 'c5', name: 'Open Heart', em: '♡', price: 10 },
  { id: 'c6', name: 'Vintage Key', em: '🗝️', price: 10 },
  { id: 'c7', name: 'Black Flower', em: '✿', price: 10 },
  { id: 'c8', name: 'Crescent Moon', em: '🌙', price: 10 },
  { id: 'c9', name: 'Solid Heart', em: '🖤', price: 10 },
  { id: 'c10', name: 'Pink Flower', em: '🌸', price: 10 },
  { id: 'c11', name: 'Starfish', em: '⭐', price: 10 },
  { id: 'c12', name: 'Pink Whale', em: '🐳', price: 10 },
  { id: 'c13', name: 'Peach', em: '🍑', price: 10 },
  { id: 'c14', name: 'Smiley Face', em: '😊', price: 10 },
  { id: 'c15', name: 'Flamingo', em: '🦩', price: 10 },
  { id: 'c16', name: 'Hand Fan', em: '🪭', price: 10 },
  { id: 'c17', name: 'Rose', em: '🌹', price: 10 },
  { id: 'c18', name: 'Teal Butterfly', em: '🦋', price: 10 },
  { id: 'c19', name: 'Teal Whale Tail', em: '🌊', price: 10 },
  { id: 'c20', name: 'Wine Glass', em: '🍷', price: 10 },
  { id: 'c21', name: 'Green Mermaid', em: '🧜‍♀️', price: 10 },
  { id: 'c22', name: 'Cactus', em: '🌵', price: 10 },
  { id: 'c23', name: 'Green Leaf', em: '🍃', price: 10 },
  { id: 'c24', name: 'Fish Bone', em: '🐟', price: 10 },
  { id: 'c25', name: 'Strawberry', em: '🍓', price: 10 },
  { id: 'c26', name: 'Lucky Bunny', em: '🐰', price: 10 },
  { id: 'c27', name: 'Lightning Bolt', em: '⚡', price: 10 },
  { id: 'c28', name: 'Palm Tree', em: '🌴', price: 10 },
  { id: 'c29', name: 'Rainbow', em: '🌈', price: 10 },
  { id: 'c30', name: 'Happy Cloud', em: '☁️', price: 10 },
  { id: 'c31', name: 'Rainbow Flower', em: '🌻', price: 10 }
];

function App() {
  // --- STATE VARIABLES ---
  
  // UI & Layout State
  const [pg, setPg] = useState('home');
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [sgOpen, setSgOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [toast, setToast] = useState(null);
  const [activeImg, setActiveImg] = useState('');
  const [activeStudioImg, setActiveStudioImg] = useState(0);
  const [appTheme, setAppTheme] = useState(localStorage.getItem('beaded_theme') || 'brown');
  
  // Navigation & Tabs
  const [loginTab, setLoginTab] = useState('signin');
  const [acctTab, setAcctTab] = useState('overview');
  const [cStep, setCStep] = useState(1);
  const [chkStep, setChkStep] = useState(1);

  // Data & Filters
  const [P, setP] = useState([]);
  const [bestsellers, setBestsellers] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [selProd, setSelProd] = useState(null);
  const [selBlog, setSelBlog] = useState(null);
  const [qvId, setQvId] = useState(null);
  const [searchQ, setSearchQ] = useState('');
  const [cat, setCat] = useState('All');
  const [sort, setSort] = useState('Featured');
  
  // Customizer State
  const [sBeads, setSBeads] = useState([]);
  const [sBeadCol, setSBeadCol] = useState(beadCollections[7]);
  const [wristSize, setWristSize] = useState(16.5);
  const [sStr, setSStr] = useState(strOpts[0]);
  const [sCharms, setSCharms] = useState([]);
  const [cName, setCName] = useState('');
  const [sLockColor, setSLockColor] = useState('Gold');
  const [sExtender, setSExtender] = useState(false);

  // Shopping & Checkout
  const [cart, setCart] = useState([]);
  const [wish, setWish] = useState([]);
  const [qty, setQty] = useState(1);
  const [selSz, setSelSz] = useState('M');
  const [acc, setAcc] = useState('description');
  const [shippingRegion, setShippingRegion] = useState('Metro Manila');
  const [checkoutForm, setCheckoutForm] = useState({
    firstName: '', lastName: '', email: '', phone: '', 
    street: '', barangay: '', city: '', province: '', postalCode: ''
  });

  // User & Authentication
  const [logged, setLogged] = useState(false);
  const [logoutPopupOpen, setLogoutPopupOpen] = useState(false);
  const [deletePopupOpen, setDeletePopupOpen] = useState(false);
  const [deleteStep, setDeleteStep] = useState('warning');
  const [deleteOtp, setDeleteOtp] = useState('');
  const [cEmail, setCEmail] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authFirstName, setAuthFirstName] = useState('');
  const [authLastName, setAuthLastName] = useState('');
  const [profileForm, setProfileForm] = useState({
    firstName: '', lastName: '', phone: '', street: '', barangay: '', city: '', province: '', postalCode: '', region: 'Metro Manila'
  });
  const [isProfileSaved, setIsProfileSaved] = useState(true);
  const [myOrders, setMyOrders] = useState([]);
  const [orderFilter, setOrderFilter] = useState('All');

  // Forgot Password Flow States
  const [forgotEmail, setForgotEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [otpTimer, setOtpTimer] = useState(600); // 600 seconds = 10 minutes

  // Settings
  const [topBannerText, setTopBannerText] = useState('WELCOME TO BEADED BY UNKNOWN');
  const [featureOne, setFeatureOne] = useState('Free shipping over ₱50');
  const [featureTwo, setFeatureTwo] = useState('Handmade');
  const [featureThree, setFeatureThree] = useState('Ethically sourced');
  const [shopCategories, setShopCategories] = useState(['Plastic', 'Gemstone', 'Glass']);
  const [products, setProducts] = useState([]);

  // --- DERIVED STATE & MEMOS ---
  
  const studioImages = [studio1, studio2, studio3, studio4];
  
  const shippingRates = {
    'Metro Manila': 85,
    'Luzon': 100,
    'Visayas': 120,
    'Mindanao': 130
  };
  const currentShippingFee = shippingRates[shippingRegion];
  
  const cTotal = useMemo(() => cart.reduce((s, i) => s + i.price * i.qty, 0), [cart]);
  const finalTotal = (cTotal || 0) + currentShippingFee;
  const cCount = useMemo(() => cart.reduce((s, i) => s + i.qty, 0), [cart]);
  
  const filtered = useMemo(() => { 
    if (!P || P.length === 0) return [];
    let f = [...P]; 
    if (cat !== 'All') f = f.filter(p => p.cat === cat); 
    if (sort === 'Price: Low') f.sort((a, b) => a.price - b.price); 
    if (sort === 'Price: High') f.sort((a, b) => b.price - a.price); 
    return f; 
  }, [cat, sort, P]);

  const searchResults = useMemo(() => {
    if (!searchQ.trim()) return [];
    const q = searchQ.toLowerCase();
    return P.filter(p => p.name.toLowerCase().includes(q) || p.cat.toLowerCase().includes(q) || (p.mat && p.mat.toLowerCase().includes(q)));
  }, [searchQ, P]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // --- HANDLERS ---
  const flash = useCallback((m, t) => { setToast({ m, t }); setTimeout(() => setToast(null), 3000); }, []);

  // --- EFFECTS ---

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser && !logged) { 
        try {
          const nameParts = firebaseUser.displayName ? firebaseUser.displayName.split(' ') : ['User'];
          
          const res = await fetch('https://beaded-by-unknown.onrender.com/api/google-login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: firebaseUser.email,
              firstName: nameParts[0],
              lastName: nameParts.slice(1).join(' ') || ''
            })
          });
          
          const data = await res.json();
          
          if (!data.error) {
            localStorage.setItem('beaded_token', data.token);
            setLogged(data.user);
            setCart(data.cart || []);
            setWish(data.wishlist || []);
            setLoginOpen(false);
            flash(`Welcome back, ${data.user.firstName}!`, 'success');
          }
        } catch (error) {
          console.error("Backend sync failed:", error);
        }
      }
    });

    return () => unsubscribe();
  }, [logged, flash]);

  useEffect(() => {
    fetch('https://beaded-by-unknown.onrender.com/api/products')
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.log('Error fetching live products:', err));
  }, []);

  useEffect(() => {
    let interval;
    const isOtpScreenActive = loginTab === 'otp' || loginTab === '2fa-otp' || deleteStep === 'otp';

    if (isOtpScreenActive && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    } else if (isOtpScreenActive && otpTimer === 0) {
      if (loginTab === 'otp') {
        flash('Reset code expired. Please request a new one.', 'error');
        setLoginTab('forgot'); 
      } else if (loginTab === '2fa-otp') {
        flash('Security code expired. Please log in again.', 'error');
        setLoginTab('signin');
      } else if (deleteStep === 'otp') {
        flash('Deletion code expired. Please try again.', 'error');
        setDeleteStep('warning');
      }
    }
    return () => clearInterval(interval);
  }, [loginTab, deleteStep, otpTimer, flash]);

  useEffect(() => {
    const handleStorageChange = () => {
      setAppTheme(localStorage.getItem('beaded_theme') || 'brown');
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    if (logged) {
      setProfileForm({
        firstName: logged.firstName || '',
        lastName: logged.lastName || '',
        phone: logged.phone || '',
        street: logged.shippingAddress?.street || '',
        barangay: logged.shippingAddress?.barangay || '',
        city: logged.shippingAddress?.city || '',
        province: logged.shippingAddress?.province || '',
        postalCode: logged.shippingAddress?.postalCode || '',
        region: logged.shippingAddress?.region || 'Metro Manila'
      });
      setIsProfileSaved(true); 
    }
  }, [logged]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true') {
      setPg('confirmation');
      setCart([]);
      window.history.replaceState(null, '', window.location.pathname);
    } else if (urlParams.get('canceled') === 'true') {
      flash('Payment was canceled or failed.', 'error');
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, [flash]);

  useEffect(() => {
    const token = localStorage.getItem('beaded_token');
    if (logged && token) {
      fetch('https://beaded-by-unknown.onrender.com/api/user/orders', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setMyOrders(data);
      })
      .catch(err => console.error("Failed to fetch user orders:", err));
    }
  }, [logged]);

  useEffect(() => {
    const favicon = document.querySelector("link[rel~='icon']");
    if (pg === 'admin') {
      document.title = "BBU | Admin Dashboard";
      if (favicon) favicon.href = "/admin-icon.png";
    } else {
      document.title = "Beaded by Unknown";
      if (favicon) favicon.href = "/Beaded-logo.png";
    }
  }, [pg]);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStudioImg((prev) => (prev + 1) % 4);
    }, 7000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetch('https://beaded-by-unknown.onrender.com/api/blogs')
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setBlogs(data); })
      .catch(err => console.error("Failed to load blogs:", err));
  }, []);

  useEffect(() => {
    fetch('https://beaded-by-unknown.onrender.com/api/bestsellers')
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setBestsellers(data); })
      .catch(err => console.error("Failed to load bestsellers:", err));
  }, []);

  useEffect(() => {
    fetch('https://beaded-by-unknown.onrender.com/api/reviews')
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setReviews(data); })
      .catch(err => console.error("Failed to load reviews:", err));
  }, []);

  useEffect(() => {
    fetch('https://beaded-by-unknown.onrender.com/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data) {
          if (data.topBannerText) setTopBannerText(data.topBannerText);
          if (data.featureOne) setFeatureOne(data.featureOne);
          if (data.featureTwo) setFeatureTwo(data.featureTwo);
          if (data.featureThree) setFeatureThree(data.featureThree);
          if (data.categories) setShopCategories(data.categories);
        }
      })
      .catch(err => console.error("Failed to load settings:", err));
  }, []);
  
  useEffect(() => {
    const token = localStorage.getItem('beaded_token');
    if (token && !logged) {
      fetch('https://beaded-by-unknown.onrender.com/api/user/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setLogged(data.user);
          setCEmail(data.user.email);
          setCart(data.cart || []);
          setWish(data.wishlist || []);
        } else {
          localStorage.removeItem('beaded_token');
        }
      }).catch(err => console.error(err));
    }
  }, [logged]);

  useEffect(() => {
    const token = localStorage.getItem('beaded_token');
    if (logged && token && (cart.length > 0 || wish.length > 0)) {
      fetch('https://beaded-by-unknown.onrender.com/api/user/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ cart, wishlist: wish })
      }).catch(err => console.error("Sync error:", err));
    }
  }, [cart, wish, logged]);

  useEffect(() => {
    fetch('https://beaded-by-unknown.onrender.com/api/products')
      .then(res => res.json())
      .then(data => {
         if (Array.isArray(data)) {
           setP(data);
           if (data.length > 0 && !selProd) setSelProd(data[0]);
         } else {
           setP([]);
         }
      })
      .catch(err => {
        setP([]);
      });
  }, [selProd]);

  useEffect(() => {
    const handleS = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleS);
    return () => window.removeEventListener('scroll', handleS);
  }, []);

  const go = useCallback((p, data) => { 
    setPg(p); 
    if (p === 'product' && data) {
      setSelProd(data); 
      setActiveImg(data.img);
    }
    if (p === 'blog-post' && data) setSelBlog(data);
    setMenuOpen(false); 
    window.scrollTo({top: 0, behavior: 'smooth'}); 
  }, []);

  const handleProfileChange = (field, value) => {
    setProfileForm(prev => ({ ...prev, [field]: value }));
    setIsProfileSaved(false);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('beaded_token');
    if (!token) return;

    try {
      const res = await fetch('https://beaded-by-unknown.onrender.com/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          firstName: profileForm.firstName,
          lastName: profileForm.lastName,
          phone: profileForm.phone,
          shippingAddress: {
            street: profileForm.street,
            barangay: profileForm.barangay,
            city: profileForm.city,
            province: profileForm.province,
            postalCode: profileForm.postalCode,
            region: profileForm.region
          }
        })
      });

      const data = await res.json();
      if (res.ok) {
        setLogged(data.user); 
        setIsProfileSaved(true);
        flash('Settings saved successfully!', 'success');
      } else {
        flash('Failed to save settings.', 'error');
      }
    } catch (err) {
      flash('Server connection error.', 'error');
    }
  };

  const addCart = useCallback((p) => {
    const uniqueId = p._id || p.id || p.name;
    const selectedSize = selSz || 'M';

    setCart(prev => { 
      const ex = prev.find(i => (i._id || i.id || i.name) === uniqueId && i.sz === selectedSize); 
      if (ex) {
        return prev.map(i => 
          (i._id || i.id || i.name) === uniqueId && i.sz === selectedSize 
            ? { ...i, qty: i.qty + qty } 
            : i
        ); 
      }
      return [...prev, { ...p, _id: uniqueId, id: uniqueId, qty: qty, sz: selectedSize }]; 
    });
    setCartOpen(true); 
    flash('Added to cart!', 'success');
  }, [qty, selSz, flash]);

  const rmCart = useCallback((id) => { 
    setCart(prev => prev.filter(i => (i._id || i.id || i.name) !== id)); 
    flash('Removed', 'info'); 
  }, [flash]);

  const updQty = useCallback((id, d) => { 
    setCart(prev => prev.map(i => (i._id || i.id || i.name) === id ? { ...i, qty: Math.max(1, i.qty + d) } : i)); 
  }, []);

  const togWish = useCallback((productOrId) => { 
    const uniqueId = typeof productOrId === 'object' 
      ? (productOrId._id || productOrId.id || productOrId.name) 
      : productOrId;

    setWish(prev => { 
      if (prev.includes(uniqueId)) { 
        flash('Removed from wishlist', 'info'); 
        return prev.filter(i => i !== uniqueId); 
      } 
      flash('Saved!', 'success'); 
      return [...prev, uniqueId]; 
    }); 
  }, [flash]);

  const handleCheckout = async () => {
    try {
      const response = await fetch('https://beaded-by-unknown.onrender.com/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cart, checkoutForm, shippingRegion }),
      });
      const data = await response.json();

      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      } else {
        flash('Failed to generate payment link', 'error');
      }
    } catch (err) {
      console.error(err);
      flash('Payment failed to initialize.', 'error');
    }
  };

  const handleAuth = async (type) => {
    if (type === 'register' && (!authFirstName || !authLastName || !authEmail || !authPassword)) {
      return flash("Please fill in all fields.", "error"); 
    }
    if (type === 'signin' && (!authEmail || !authPassword)) {
      return flash("Please enter your email and password.", "error"); 
    }

    const endpoint = type === 'register' ? '/api/register' : '/api/login';
    const payload = type === 'register' 
      ? { firstName: authFirstName, lastName: authLastName, email: authEmail, password: authPassword }
      : { email: authEmail, password: authPassword };

    try {
      const res = await fetch(`https://beaded-by-unknown.onrender.com${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (!res.ok) {
        flash(data.error, "error"); 
      } else if (data.requireOtp) {
        setOtpTimer(600);
        setLoginTab('2fa-otp'); 
        flash('Security code sent to your email!', 'success');
      }
    } catch (err) {
      flash('Cannot connect to the server.', 'error');
    }
  };

  const handleVerify2FA = async () => {
    if (!otpCode) return flash("Please enter the 6-digit code.", "error");
    try {
      const res = await fetch('https://beaded-by-unknown.onrender.com/api/verify-login-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: authEmail, otp: otpCode.trim() })
      });
      const data = await res.json();
      
      if (res.ok) {
        localStorage.setItem('beaded_token', data.token);
        setLogged(data.user);
        setCart(data.cart || []);
        setWish(data.wishlist || []);
        setLoginOpen(false);
        setLoginTab('signin');
        setOtpCode('');
        flash(`Welcome, ${data.user.firstName}!`, 'success');
      } else {
        flash(data.error, "error");
      }
    } catch (err) { flash('Server error.', 'error'); }
  };

  const handleRequestDelete = async () => {
    try {
      const token = localStorage.getItem('beaded_token');
      const res = await fetch('https://beaded-by-unknown.onrender.com/api/user/request-delete', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setDeleteStep('otp');
        setOtpTimer(600);
        flash('Deletion code sent to your email.', 'info');
      } else {
        flash('Failed to request deletion.', 'error');
      }
    } catch(err) { flash('Server error', 'error'); }
  };

  const handleConfirmDelete = async () => {
    if (!deleteOtp) return flash('Please enter the 6-digit code.', 'error');
    try {
      const token = localStorage.getItem('beaded_token');
      const res = await fetch('https://beaded-by-unknown.onrender.com/api/user/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ otp: deleteOtp.trim() })
      });
      const data = await res.json();
      
      if (res.ok) {
        setLogged(false);
        setCart([]);
        setWish([]);
        localStorage.removeItem('beaded_token');
        setDeletePopupOpen(false);
        setDeleteStep('warning');
        setDeleteOtp('');
        go('home');
        flash('Account permanently deleted. We are sorry to see you go!', 'success');
      } else {
        flash(data.error, 'error');
      }
    } catch(err) { flash('Server error', 'error'); }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithRedirect(auth, googleProvider);
    } catch (error) {
      flash('Google sign-in failed.', 'error');
    }
  };

  const handleForgotPassword = async () => {
    if (!forgotEmail) return flash("Please enter your email.", "error");
    try {
      const res = await fetch('https://beaded-by-unknown.onrender.com/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail })
      });
      const data = await res.json();
      if (res.ok) {
        setOtpTimer(600);
        flash('OTP sent to your email!', 'success');
        setLoginTab('otp'); 
      } else {
        flash(data.error, "error");
      }
    } catch (err) { flash('Server error.', 'error'); }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode) return flash("Please enter the OTP.", "error");
    try {
      const res = await fetch('https://beaded-by-unknown.onrender.com/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail, otp: otpCode })
      });
      const data = await res.json();
      if (res.ok) {
        flash('Code verified!', 'success');
        setLoginTab('reset'); 
      } else {
        flash(data.error, "error");
      }
    } catch (err) { flash('Server error.', 'error'); }
  };

  const handleResetPassword = async () => {
    if (!newPassword) return flash("Please enter a new password.", "error");
    try {
      const res = await fetch('https://beaded-by-unknown.onrender.com/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail, newPassword })
      });
      const data = await res.json();
      if (res.ok) {
        flash('Your password has been changed! Please log in.', 'success');
        setLoginTab('signin'); 
        setForgotEmail('');
        setOtpCode('');
        setNewPassword('');
      } else {
        flash(data.error, "error");
      }
    } catch (err) { flash('Server error.', 'error'); }
  };

  // --- SUB-COMPONENTS & RENDER HELPERS ---

  const renderStars = (rating) => {
    const num = parseFloat(rating) || 5;
    const fullStars = Math.floor(num);
    const hasHalfStar = num % 1 !== 0;
    const emptyStars = 5 - Math.ceil(num);

    return (
      <div className="flex items-center text-[#C9A96E] text-xs">
        {[...Array(fullStars)].map((_, i) => <span key={`full-${i}`}>★</span>)}
        {hasHalfStar && (
          <span className="relative inline-block">
            <span className="text-[#E8DFD3]">★</span> 
            <span className="absolute left-0 top-0 overflow-hidden w-1/2 text-[#C9A96E]">★</span> 
          </span>
        )}
        {[...Array(Math.max(0, emptyStars))].map((_, i) => <span key={`empty-${i}`} className="text-[#E8DFD3]">★</span>)}
      </div>
    );
  };

const Card = ({ p }) => {
    const [h, setH] = useState(false);
    const uniqueId = p._id || p.id || p.name;
    const isSoldOut = p.isAvailable === false; 
    
    return (
      <div 
        className={`group ${isSoldOut ? 'cursor-default' : 'cursor-pointer'}`} 
        onMouseEnter={() => setH(true)} 
        onMouseLeave={() => setH(false)} 
        onClick={() => !isSoldOut && go('product', p)} 
      >
        <div className="relative aspect-square overflow-hidden rounded-xl bg-[#F0EBE4] mb-2 md:mb-3">
          
          {isSoldOut && (
            <div className="absolute inset-0 z-20 bg-white/40 backdrop-blur-[2px] flex items-center justify-center">
              <span className="bg-[#3E2F1C] text-[#FAF6F1] px-4 md:px-6 py-2 md:py-3 text-[10px] md:text-xs uppercase tracking-[0.2em] font-bold shadow-lg transform -rotate-12 border border-[#E8DFD3]/20">
                Sold Out
              </span>
            </div>
          )}

          <img 
            src={h && p.img2 && !isSoldOut ? p.img2 : p.img} 
            alt={p.name} 
            className={`w-full h-full object-cover transition-all duration-500 ${isSoldOut ? 'grayscale opacity-50' : ''}`} 
          />
          
          {p.tag && !isSoldOut && <span className="absolute top-2 left-2 md:top-3 md:left-3 bg-[#3E2F1C] text-[#FAF6F1] text-[9px] md:text-[10px] tracking-[0.15em] uppercase px-2 py-0.5 md:px-3 md:py-1">{p.tag}</span>}
          
          <div className={`hidden md:flex absolute inset-0 bg-[#3E2F1C]/10 items-end justify-center pb-4 gap-2 transition-opacity duration-300 ${h && !isSoldOut ? 'opacity-100' : 'opacity-0'} z-10`}>
            <button onClick={(e) => { e.stopPropagation(); addCart(p); }} className="bg-[#FAF6F1] text-[#3E2F1C] text-xs tracking-wider uppercase px-5 py-2.5 hover:bg-[#3E2F1C] hover:text-[#FAF6F1] transition-colors duration-200 font-medium">Add</button>
            <button onClick={(e) => { e.stopPropagation(); setQvId(uniqueId); }} className="bg-[#FAF6F1] text-[#3E2F1C] p-2.5 hover:bg-[#3E2F1C] hover:text-[#FAF6F1] transition-colors duration-200"><Eye className="w-4 h-4" /></button>
          </div>

          <button onClick={(e) => { e.stopPropagation(); togWish(p); }} className="absolute top-2 right-2 md:top-3 md:right-3 p-1.5 md:p-2 bg-white/80 rounded-full hover:bg-white transition-colors z-30">
            <Heart className={`w-3.5 h-3.5 md:w-4 md:h-4 ${wish.includes(uniqueId) ? 'fill-[#A0522D] text-[#A0522D]' : 'text-[#3E2F1C]'}`} />
          </button>
        </div>
        
        <div className="flex items-start justify-between">
          <div>
            <h3 className={`text-[13px] md:text-[15px] font-medium ${isSoldOut ? 'text-[#8B7D6B] line-through' : 'text-[#3E2F1C]'}`} style={{ fontFamily: 'Playfair Display, serif' }}>{p.name}</h3>
            <p className="text-[11px] md:text-xs text-[#8B7D6B] mt-0.5">{p.mat}</p>
          </div>
          <span className={`text-[13px] md:text-[15px] font-semibold ${isSoldOut ? 'text-[#8B7D6B]' : 'text-[#3E2F1C]'}`}>₱{p.price}</span>
        </div>
      </div>
    );
  };

  // --- RENDER ---

  return (
    <div className="min-h-screen w-full flex flex-col overflow-x-hidden bg-[#FAF6F1] font-sans text-[#3E2F1C]">

      {/* DYNAMIC THEME ENGINE */}
      <style dangerouslySetInnerHTML={{__html: `
        :root {
          --primary: ${appTheme === 'pink' ? '#D88A9A' : '#A0522D'};
          --dark: ${appTheme === 'pink' ? '#5C434A' : '#3E2F1C'};
          --bg-light: ${appTheme === 'pink' ? '#FFF5F7' : '#FAF6F1'};
        }
        
        ${appTheme === 'pink' ? `
        .bg-\\[\\#A0522D\\] { background-color: var(--primary) !important; }
        .text-\\[\\#A0522D\\] { color: var(--primary) !important; }
        .border-\\[\\#A0522D\\] { border-color: var(--primary) !important; }
        
        .bg-\\[\\#3E2F1C\\] { background-color: var(--dark) !important; }
        .text-\\[\\#3E2F1C\\] { color: var(--dark) !important; }
        .border-\\[\\#3E2F1C\\] { border-color: var(--dark) !important; }
        
        .bg-\\[\\#FAF6F1\\] { background-color: var(--bg-light) !important; }
        .hover\\:bg-\\[\\#FAF6F1\\]:hover { background-color: var(--bg-light) !important; }
        ` : ''}
      `}} />

      {/* GLOBAL TOAST NOTIFICATION */}
      {toast && (
        <div className="fixed bottom-8 md:bottom-12 left-1/2 transform -translate-x-1/2 z-[100] flex items-center gap-3 px-6 py-3.5 bg-[#3E2F1C]/85 backdrop-blur-md text-[#FAF6F1] rounded-full shadow-lg border border-[#5A4A38]/50 animate-in fade-in slide-in-from-bottom-6 zoom-in-98 duration-500">
          
          <div className="bg-[#C9A96E]/15 p-1.5 rounded-full shrink-0">
            {toast.t === 'error' ? (
              <X className="w-4 h-4 text-[#C9A96E]" />
            ) : toast.t === 'success' ? (
              <Check className="w-4 h-4 text-[#C9A96E]" />
            ) : (
              <Sparkles className="w-4 h-4 text-[#C9A96E]" />
            )}
          </div>
          
          <span className="text-[10px] md:text-xs font-bold tracking-[0.15em] uppercase mt-0.5 whitespace-nowrap opacity-90">
            {toast.m}
          </span>
          
        </div>
      )}

      {/* HEADER - Responsive */}
      {pg !== 'checkout' && pg !== 'confirmation' && (
        <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${scrolled || pg !== 'home' ? 'bg-[#FAF6F1]/95 backdrop-blur-sm shadow-sm' : 'bg-[#FAF6F1] md:bg-transparent'}`}>
          <div className="bg-[#3E2F1C] text-[#FAF6F1] text-center py-1.5 md:py-2 text-[9px] md:text-[11px] tracking-[0.15em] uppercase font-light">
          {topBannerText}
          </div>
          <nav className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-10 py-3 md:py-4 flex items-center justify-between">
            
            <div className="flex-1 md:hidden">
              <button onClick={() => setMenuOpen(true)} className="p-1 text-[#3E2F1C]"><Menu className="w-5 h-5" /></button>
            </div>
            
            <div className="hidden md:flex items-center gap-4 xl:gap-8 flex-1 justify-start">
              <button onClick={() => go('collection')} className="text-[12px] xl:text-[13px] tracking-[0.15em] text-[#3E2F1C] hover:text-[#A0522D] transition-colors font-medium uppercase">Shop</button>
              <button onClick={() => go('customizer')} className="text-[12px] xl:text-[13px] tracking-[0.15em] text-[#3E2F1C] hover:text-[#A0522D] transition-colors font-medium uppercase">Customize</button>
              <button onClick={() => go('about')} className="text-[12px] xl:text-[13px] tracking-[0.15em] text-[#3E2F1C] hover:text-[#A0522D] transition-colors font-medium uppercase">Our Story</button>
            </div>

            <div className="flex-shrink-0 flex justify-center mx-2 lg:mx-4">
              <button onClick={() => go('home')} className="flex items-center justify-center">
                <span className="hidden lg:block text-[22px] tracking-[0.2em] text-[#3E2F1C] uppercase" style={{ fontFamily: 'Playfair Display, serif' }}>
                  beadedbyunknown
                </span>
                <img 
                  src="/Beaded-logo.png" 
                  alt="Beaded By Unknown" 
                  className="block lg:hidden h-7 md:h-8 w-auto object-contain" 
                />
              </button>
            </div>

            <div className="flex items-center justify-end gap-4 xl:gap-5 flex-1">
              <button onClick={() => go('blog')} className="hidden md:block text-[12px] xl:text-[13px] tracking-[0.15em] text-[#3E2F1C] hover:text-[#A0522D] transition-colors font-medium uppercase">Journal</button>
              <button onClick={() => setSearchOpen(true)} className="hidden md:block text-[#3E2F1C] hover:text-[#A0522D] transition-colors"><Search className="w-[18px] h-[18px]" /></button>
              <button 
                onClick={() => logged ? go('account') : setLoginOpen(true)} 
                className="hidden md:block text-[#3E2F1C] hover:text-[#A0522D] transition-colors"
              >
                <User className="w-[18px] h-[18px]" />
              </button>
              <button onClick={() => go('wishlist')} className="hidden md:block text-[#3E2F1C] hover:text-[#A0522D] transition-colors relative">
                <Heart className={`w-[18px] h-[18px] ${wish.length > 0 ? 'fill-[#A0522D] text-[#A0522D]' : ''}`} />
                {wish.length > 0 && <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#A0522D] text-white text-[10px] rounded-full flex items-center justify-center">{wish.length}</span>}
              </button>
              <button onClick={() => setCartOpen(true)} className="text-[#3E2F1C] hover:text-[#A0522D] transition-colors relative p-1 md:p-0">
                <ShoppingBag className="w-5 h-5 md:w-[18px] md:h-[18px]" />
                {cCount > 0 && <span className="absolute -top-0.5 -right-0.5 md:-top-1.5 md:-right-1.5 w-4 h-4 bg-[#A0522D] text-white text-[9px] md:text-[10px] rounded-full flex items-center justify-center">{cCount}</span>}
              </button>
            </div>
            
          </nav>
        </header>
      )}

      {/* MAIN CONTENT */}
      <main className={`flex-1 pb-16 md:pb-0 ${pg !== 'checkout' && pg !== 'confirmation' ? 'pt-[76px] md:pt-[94px]' : ''}`}>

        {pg === 'confirmation' && (
          <div className="max-w-2xl mx-auto px-5 py-24 md:py-32 text-center animate-in fade-in zoom-in-95 duration-500">
            <div className="w-24 h-24 bg-[#FAF6F1] border-4 border-[#A0522D] rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
              <Check className="w-12 h-12 text-[#A0522D]" />
            </div>
            <h1 className="text-3xl md:text-5xl mb-4 text-[#3E2F1C]" style={{ fontFamily: 'Playfair Display, serif' }}>Payment Successful!</h1>
            <p className="text-[#8B7D6B] text-sm md:text-base mb-10 max-w-md mx-auto leading-relaxed">
              Your order has been received and is currently being prepared in our studio. A receipt has been sent to your email.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button 
                onClick={() => { 
                  if (logged) {
                    setAcctTab('orders'); 
                    go('account'); 
                  } else {
                    setLoginOpen(true);
                  }
                }} 
                className="bg-[#3E2F1C] text-white px-8 py-4 rounded-xl text-xs font-bold tracking-[0.15em] uppercase hover:bg-[#A0522D] transition-colors shadow-md"
              >
                View Order Status
              </button>
              <button 
                onClick={() => go('collection')} 
                className="bg-white text-[#3E2F1C] border-2 border-[#E8DFD3] px-8 py-4 rounded-xl text-xs font-bold tracking-[0.15em] uppercase hover:bg-[#FAF6F1] hover:border-[#3E2F1C] transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        )}
        
        {pg === 'home' && (
          <div>
            <section className="relative h-[420px] md:h-[85vh] flex items-end md:items-center bg-[#EDE7DF]">
              <div className="absolute inset-0"><img src={heroImage} alt="Beaded by Unknown Hero" className="w-full h-full object-cover opacity-30" /></div>
              <div className="relative z-10 p-6 md:p-8 md:max-w-[1200px] md:mx-auto w-full pb-10 md:pb-8">
                <p className="text-[10px] md:text-[13px] tracking-[0.25em] md:tracking-[0.3em] text-[#A0522D] uppercase mb-2 md:mb-4 font-medium">Handcrafted with intention</p>
                <h2 className="text-[32px] md:text-[64px] leading-[1.1] text-[#3E2F1C] max-w-[580px] mb-3 md:mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>a gift for your friends, family, and yourself</h2>
                <p className="text-sm md:text-lg text-[#5A4A3A] md:max-w-[420px] mb-6 md:mb-8 leading-relaxed max-w-[280px]">We transform raw materials into hand-finished treasures, ensuring every bead you string carries its own story and weight.</p>
                <div className="flex flex-col md:flex-row gap-3 md:gap-4">
                  <button onClick={() => go('collection')} className="bg-[#A0522D] text-[#FAF6F1] text-xs md:text-sm tracking-[0.15em] uppercase px-6 py-3.5 md:py-4 font-medium md:font-semibold hover:bg-[#8B4526] transition-colors">Shop Collection</button>
                  <button onClick={() => go('customizer')} className="border-2 border-[#3E2F1C] text-[#3E2F1C] text-xs md:text-sm tracking-[0.15em] uppercase px-6 py-3.5 md:py-4 font-medium md:font-semibold hover:bg-[#3E2F1C] hover:text-[#FAF6F1] transition-colors">Build Your Own</button>
                </div>
              </div>
            </section>

            <div className="bg-[#3E2F1C] py-2.5 md:py-3 flex justify-center gap-6 md:gap-12 overflow-hidden px-4">
              <span className="text-[#C9A96E] text-[9px] md:text-xs tracking-[0.15em] md:tracking-[0.2em] uppercase whitespace-nowrap flex items-center gap-1.5">
                <Sparkles className="w-2.5 h-2.5 md:w-3 md:h-3" /> {featureOne}
              </span>
              <span className="text-[#C9A96E] text-[9px] md:text-xs tracking-[0.15em] md:tracking-[0.2em] uppercase whitespace-nowrap flex items-center gap-1.5">
                <Sparkles className="w-2.5 h-2.5 md:w-3 md:h-3" /> {featureTwo}
              </span>
              <span className="text-[#C9A96E] text-[9px] md:text-xs tracking-[0.15em] md:tracking-[0.2em] uppercase whitespace-nowrap flex items-center gap-1.5">
                <Sparkles className="w-2.5 h-2.5 md:w-3 md:h-3" /> {featureThree}
              </span>
            </div>

            <section className="py-16 md:py-24 bg-white">
              <div className="max-w-6xl mx-auto px-6">
                <div className="text-center mb-12 md:mb-16">
                  <h2 className="text-3xl md:text-4xl text-[#3E2F1C] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
                    Current Bestsellers
                  </h2>
                  <p className="text-[#8B7D6B] text-sm tracking-wide">Automatically updated based on Live purchases</p>
                </div>

                {bestsellers.length === 0 ? (
                  <div className="text-center text-[#8B7D6B] py-10 border border-dashed border-[#E8DFD3]">
                    <p>Calculating top products... check back after our first sales!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                    {bestsellers.map(product => (
                      <div key={product._id} className="group cursor-pointer">
                        <div className="relative overflow-hidden bg-[#FAF6F1] aspect-[3/4] mb-4">
                          <img 
                            src={product.img} 
                            alt={product.name} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                          {product.img2 && (
                            <img 
                              src={product.img2} 
                              alt={`${product.name} alternate`} 
                              className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                            />
                          )}
                          <div className="absolute top-3 left-3 bg-[#3E2F1C] text-white text-[9px] uppercase tracking-widest px-2.5 py-1">
                            Top Rated
                          </div>
                        </div>
                        <div className="text-center">
                          <h3 className="text-[#3E2F1C] text-sm md:text-base mb-1">{product.name}</h3>
                          <p className="text-[#A39B8F] text-xs md:text-sm">₱{product.price}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            <section className="px-5 md:px-8 py-4 md:py-8 max-w-[1200px] mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 rounded-xl md:rounded-2xl overflow-hidden bg-[#EDE7DF]">
                <div className="h-48 md:h-auto md:aspect-[4/3]"><img src={customPromoImg} alt="Customize" className="w-full h-full object-cover" /></div>
                <div className="p-6 md:p-16 flex flex-col justify-center">
                  <p className="text-[10px] md:text-[12px] tracking-[0.2em] md:tracking-[0.25em] text-[#A0522D] uppercase mb-2 md:mb-3 font-medium">Make it yours</p>
                  <h2 className="text-[22px] md:text-[36px] text-[#3E2F1C] mb-2 md:mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>Design Your Own</h2>
                  <p className="text-sm md:text-base text-[#5A4A3A] mb-5 md:mb-8">Choose from various bead types, add meaningful pendants.</p>
                  <div className="flex flex-wrap md:flex-nowrap gap-4 md:gap-6 mb-5 md:mb-8">
                    {[{ i: <Gem className="w-4 h-4 md:w-5 md:h-5" />, l: 'Beads' }, { i: <Layers className="w-4 h-4 md:w-5 md:h-5" />, l: 'String' }, { i: <Sparkles className="w-4 h-4 md:w-5 md:h-5" />, l: 'Charms' }].map((s, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 md:gap-2"><div className="w-7 h-7 md:w-9 md:h-9 rounded-full bg-[#FAF6F1] flex items-center justify-center text-[#A0522D]">{s.i}</div><span className="text-xs md:text-sm text-[#3E2F1C] font-medium">{s.l}</span></div>
                    ))}
                  </div>
                  <button onClick={() => go('customizer')} className="bg-[#A0522D] text-[#FAF6F1] text-xs md:text-sm tracking-[0.15em] uppercase px-6 py-3.5 md:py-4 font-medium md:font-semibold md:self-start hover:bg-[#8B4526] transition-colors text-center">Start Creating</button>
                </div>
              </div>
            </section>

            <section className="community-love py-12">
              <h2 className="text-center text-3xl font-serif mb-8">Community Love</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto px-4">
                {reviews.map(review => (
                  <div key={review._id} className="bg-[#FAF6F1] p-6 rounded-xl border border-[#E8DFD3] text-center">
                    <div className="flex justify-center mb-4 scale-110 origin-center">
                      {renderStars(review.rating)}
                    </div>
                    <p className="text-sm italic text-[#8B7D6B] mb-4">"{review.text}"</p>
                    <p className="text-xs uppercase tracking-widest font-bold">- {review.author}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="py-16 md:py-24 bg-[#FAF6F1]">
              <div className="max-w-[1200px] mx-auto px-5 md:px-8">
                <div className="flex flex-col md:flex-row items-center gap-12 md:gap-20">
                  <div className="flex-1 space-y-6">
                    <h2 className="text-3xl md:text-4xl text-[#3E2F1C]" style={{ fontFamily: 'Playfair Display, serif' }}>
                      Crafted with Intention
                    </h2>
                    <div className="w-12 h-1 bg-[#A0522D]"></div>
                    <p className="text-[#8B7D6B] leading-relaxed">
                      Beaded by Unknown began as a simple spark of imagination a late-night hobby fueled by a love for color and form. I believed that jewelry shouldn't just be an accessory, but a wearable piece of a dream that keeps you grounded throughout your day.
                    </p>
                    <p className="text-[#8B7D6B] leading-relaxed">
                      What started with a single strand has grown into a dedicated practice of hand-stringing every bead with care. Using durable materials and a meticulous eye for detail, we craft more than just jewelry; we create small, handmade companions for your daily journey.
                    </p>
                    <button onClick={() => go('collection')} className="inline-block mt-4 text-[#A0522D] font-semibold tracking-widest uppercase text-sm border-b border-[#A0522D] pb-1 hover:text-[#8B4526] transition-colors">
                      Discover Our Process
                    </button>
                  </div>
                  <div className="flex-1 w-full relative">
                    <div className="aspect-[4/5] bg-[#E8DFD3] rounded-2xl overflow-hidden relative z-10 shadow-xl border border-[#E8DFD3]">
                      {studioImages.map((img, idx) => (
                        <img
                          key={idx}
                          src={img}
                          alt={`Studio ${idx + 1}`}
                          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
                            activeStudioImg === idx ? 'opacity-100' : 'opacity-0'
                          }`}
                        />
                      ))}
                      <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-20">
                        {studioImages.map((_, idx) => (
                          <button 
                            key={idx}
                            onClick={() => setActiveStudioImg(idx)}
                            className={`h-1.5 rounded-full transition-all duration-500 shadow-sm ${
                              activeStudioImg === idx ? 'bg-white w-8' : 'bg-white/50 w-2 hover:bg-white/80'
                            }`} 
                          />
                        ))}
                      </div>
                    </div>
                    <div className="absolute -bottom-6 -right-6 w-full h-full bg-[#F0EBE4] border border-[#E8DFD3] rounded-2xl z-0 hidden md:block"></div>
                  </div>
                </div>
              </div>
            </section>

            <section className="py-16 md:py-24 bg-white">
              <div className="max-w-[1200px] mx-auto px-5 md:px-8">
                <div className="text-center mb-12">
                  <h2 className="text-3xl md:text-4xl text-[#3E2F1C] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>The Journal</h2>
                  <p className="text-[#8B7D6B] max-w-xl mx-auto md:text-lg">Stories, styling tips, and the meaning behind the stones.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
                  {blogs.slice(0, 3).map((post) => (
                    <div key={post._id || post.id} className="group cursor-pointer" onClick={() => go('blog-post', post)}>
                      <div className="aspect-square bg-[#FAF6F1] rounded-xl mb-5 overflow-hidden">
                        <img src={post.img} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                      <div className="flex items-center gap-3 text-[10px] uppercase tracking-widest text-[#A0522D] font-bold mb-3">
                        <span>{post.cat}</span>
                        <span className="w-1 h-1 rounded-full bg-[#D1C7B7]"></span>
                        <span className="text-[#8B7D6B]">{post.date}</span>
                      </div>
                      <h3 className="text-xl text-[#3E2F1C] font-medium leading-snug group-hover:text-[#A0522D] transition-colors mb-2">
                        {post.title}
                      </h3>
                      <p className="text-sm text-[#8B7D6B] line-clamp-2">{post.ex}</p>
                    </div>
                  ))}
                </div>

                {blogs.length > 3 && (
                  <div className="text-center mt-10">
                    <button onClick={() => go('blog')} className="text-sm uppercase tracking-widest font-bold border-b border-[#3E2F1C] pb-1 hover:text-[#A0522D] hover:border-[#A0522D] transition-colors">
                      Read All Articles
                    </button>
                  </div>
                )}
              </div>
            </section>

            <footer className="bg-[#3E2F1C] text-[#FAF6F1] py-16 mt-auto">
              <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr] gap-12 border-b border-[#5A4A38] pb-12 mb-8">
                
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <img src="/Beaded-logo.png" alt="Beaded by Unknown Logo" className="w-6 h-6 md:w-8 md:h-8 object-contain" />
                    <h2 className="text-lg md:text-xl tracking-[0.2em] uppercase font-serif">BEADEDBYUNKNOWN</h2>
                  </div>
                  <p className="text-[#D1CBC3] text-sm leading-relaxed max-w-xs">
                    A gift for your friends, family, and yourself
                  </p>
                  
                  <div className="flex gap-5 pt-2">
                    <a href="https://www.instagram.com/beeeaded_/" target="_blank" rel="noreferrer" className="text-[#D1CBC3] hover:text-white transition-colors" title="Follow us on Instagram">
                      <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="opacity-90 hover:opacity-100 transition-opacity">
                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                      </svg>
                    </a>

                    <a href="https://www.linkedin.com/in/sean-rhani-dela-cruz-834573334/" target="_blank" rel="noreferrer" className="text-[#D1CBC3] hover:text-white transition-colors" title="Site Developer">
                      <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="opacity-90 hover:opacity-100 transition-opacity">
                        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                        <rect x="2" y="9" width="4" height="12"></rect>
                        <circle cx="4" cy="4" r="2"></circle>
                      </svg>
                    </a>

                    <a href="https://www.tiktok.com/@beeeaded_" target="_blank" rel="noreferrer" className="text-[#D1CBC3] hover:text-white transition-colors" title="Follow us on TikTok">
                      <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="opacity-90 hover:opacity-100 transition-opacity">
                        <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path>
                      </svg>
                    </a>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-bold tracking-widest uppercase mb-6 text-white">Shop</h3>
                  <ul className="space-y-4 text-sm text-[#D1CBC3]">
                    <li><button onClick={() => go('collection')} className="hover:text-white transition-colors">All</button></li>
                    <li><button onClick={() => go('customizer')} className="hover:text-white transition-colors">Custom</button></li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xs font-bold tracking-widest uppercase mb-6 text-white">Help</h3>
                  <ul className="space-y-4 text-sm text-[#D1CBC3]">
                    <li><button onClick={() => go('sizeguide')} className="hover:text-white transition-colors">Size Guide</button></li>
                    <li><button onClick={() => go('shipping')} className="hover:text-white transition-colors">Shipping</button></li>
                    <li><button onClick={() => go('terms')} className="hover:text-white transition-colors">Terms & Privacy</button></li>
                    <li><button onClick={() => go('faq')} className="hover:text-white transition-colors">FAQ</button></li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xs font-bold tracking-widest uppercase mb-6 text-white">About</h3>
                  <ul className="space-y-4 text-sm text-[#D1CBC3]">
                    <li><button onClick={() => go('about')} className="hover:text-white transition-colors">Our Story</button></li>
                    <li><button onClick={() => go('blog')} className="hover:text-white transition-colors">Journal</button></li>
                  </ul>
                </div>

              </div>

              <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-[#D1CBC3] text-xs gap-4">
                <p>© 2026 beadedbyunknown</p>
                <p>Developed by Sean Rhani Dela Cruz</p>
              </div>
            </footer>
          </div>
        )}

        {pg === 'sizeguide' && (
          <div className="max-w-3xl mx-auto px-5 md:px-8 py-16 md:py-24 animate-in fade-in duration-500">
            <h1 className="text-3xl md:text-5xl mb-8 text-center text-[#3E2F1C]" style={{ fontFamily: 'Playfair Display, serif' }}>Size Guide</h1>
            <p className="text-center text-[#8B7D6B] mb-12 md:mb-16 max-w-xl mx-auto leading-relaxed text-sm md:text-base">
              For the perfect fit, measure your wrist tightly with a flexible measuring tape and add 0.5 inches for comfort. All our bracelets are strung on durable, stretchable cord.
            </p>
            <div className="bg-white border border-[#E8DFD3] rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-left">
                <thead className="bg-[#FAF6F1]">
                  <tr className="text-[10px] md:text-xs uppercase tracking-widest text-[#8B7D6B]">
                    <th className="p-4 md:p-6 font-medium border-b border-[#E8DFD3]">Size</th>
                    <th className="p-4 md:p-6 font-medium border-b border-[#E8DFD3]">Wrist Measurement</th>
                    <th className="hidden md:table-cell p-6 font-medium border-b border-[#E8DFD3]">Fit Style</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8DFD3] text-sm text-[#3E2F1C]">
                  <tr className="hover:bg-[#FDFBF9] transition-colors">
                    <td className="p-4 md:p-6 font-bold">Small (S)</td>
                    <td className="p-4 md:p-6 text-[#8B7D6B]">5.5" - 6.0"</td>
                    <td className="hidden md:table-cell p-6 text-[#8B7D6B]">Snug fit, best for petite wrists.</td>
                  </tr>
                  <tr className="hover:bg-[#FDFBF9] transition-colors">
                    <td className="p-4 md:p-6 font-bold">Medium (M)</td>
                    <td className="p-4 md:p-6 text-[#8B7D6B]">6.5" - 7.0"</td>
                    <td className="hidden md:table-cell p-6 text-[#8B7D6B]">Standard fit, our most popular size.</td>
                  </tr>
                  <tr className="hover:bg-[#FDFBF9] transition-colors">
                    <td className="p-4 md:p-6 font-bold">Large (L)</td>
                    <td className="p-4 md:p-6 text-[#8B7D6B]">7.5" - 8.0"</td>
                    <td className="hidden md:table-cell p-6 text-[#8B7D6B]">Loose, relaxed fit.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {pg === 'shipping' && (
          <div className="max-w-3xl mx-auto px-5 md:px-8 py-16 md:py-24 animate-in fade-in duration-500">
            <h1 className="text-3xl md:text-5xl mb-10 md:mb-16 text-center text-[#3E2F1C]" style={{ fontFamily: 'Playfair Display, serif' }}>Shipping & Returns</h1>
            <div className="space-y-10 md:space-y-12">
              <section>
                <h2 className="text-xs md:text-sm font-bold tracking-widest uppercase mb-3 md:mb-4 text-[#8B7D6B]">Processing & Shipping</h2>
                <p className="text-sm md:text-base text-[#3E2F1C] leading-relaxed mb-6">
                  Every beaded bracelet is carefully handcrafted to order. We operate strictly on a <span className="font-semibold">Pre-order basis</span>. Please allow 7 to 14 days for us to create, inspect, and package your items before they are shipped.
                </p>
                <ul className="space-y-4 border-l-2 border-[#E8DFD3] pl-5 md:pl-6">
                  <li>
                    <strong className="block mb-1 text-sm md:text-base text-[#3E2F1C]">J&T Express Delivery</strong>
                    <span className="text-sm text-[#8B7D6B]">₱150 flat rate nationwide.</span>
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-xs md:text-sm font-bold tracking-widest uppercase mb-3 md:mb-4 text-[#8B7D6B]">Returns & Cancellations</h2>
                <p className="text-sm md:text-base text-[#3E2F1C] leading-relaxed mb-4">
                  We want you to love your piece, but because each bracelet is meticulously custom-made to your specific preferences, <span className="font-semibold">all sales are final</span>.
                </p>
                <p className="text-sm md:text-base text-[#3E2F1C] leading-relaxed">
                  Once a custom bracelet has been started in our studio, we cannot accept cancellations, returns, or exchanges. Please ensure your wrist measurement is completely accurate according to our Size Guide before placing your order.
                </p>
              </section>
            </div>
          </div>
        )}

        {pg === 'faq' && (
          <div className="max-w-2xl mx-auto px-5 py-24 md:py-32 text-center animate-in fade-in duration-500">
            <Sparkles className="w-12 h-12 text-[#E8DFD3] mx-auto mb-6" />
            <h1 className="text-3xl md:text-5xl mb-4 text-[#3E2F1C]" style={{ fontFamily: 'Playfair Display, serif' }}>FAQ</h1>
            <div className="inline-block bg-[#FAF6F1] border border-[#E8DFD3] px-4 py-1.5 rounded-full mb-4">
              <p className="text-[#A0522D] uppercase tracking-widest font-bold text-[10px] md:text-xs">Coming Soon</p>
            </div>
            <p className="text-[#8B7D6B] text-sm md:text-base max-w-md mx-auto leading-relaxed">
              We are currently compiling our most frequently asked questions. Check back shortly!
            </p>
          </div>
        )}

        {pg === 'about' && (
          <div className="max-w-[1200px] mx-auto px-5 md:px-8 pt-4 md:pt-12 pb-16 md:pb-24">
            <div className="hidden md:flex items-center gap-2 text-xs text-[#8B7D6B] mb-8"><button onClick={() => go('home')} className="hover:text-[#A0522D]">Home</button><ChevronRight className="w-3 h-3" /><span className="text-[#3E2F1C]">Our Story</span></div>
            <div className="flex flex-col md:flex-row items-center gap-12 md:gap-20">
              <div className="flex-1 space-y-6">
                <h2 className="text-3xl md:text-5xl text-[#3E2F1C]" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Crafted with Intention
                </h2>
                <div className="w-12 h-1 bg-[#A0522D]"></div>
                <p className="text-[#8B7D6B] leading-relaxed md:text-lg">
                  Beaded by Unknown began as a simple spark of imagination a late-night hobby fueled by a love for color and form. I believed that jewelry shouldn't just be an accessory, but a wearable piece of a dream that keeps you grounded throughout your day.
                </p>
                <p className="text-[#8B7D6B] leading-relaxed md:text-lg">
                  What started with a single strand has grown into a dedicated practice of hand-stringing every bead with care. Using durable materials and a meticulous eye for detail, we craft more than just jewelry; we create small, handmade companions for your daily journey.
                </p>
              </div>
                  <div className="flex-1 w-full relative">
                    <div className="aspect-[4/5] bg-[#E8DFD3] rounded-2xl overflow-hidden relative z-10 shadow-xl border border-[#E8DFD3]">
                      {studioImages.map((img, idx) => (
                        <img
                          key={idx}
                          src={img}
                          alt={`Studio ${idx + 1}`}
                          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
                            activeStudioImg === idx ? 'opacity-100' : 'opacity-0'
                          }`}
                        />
                      ))}
                      <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-20">
                        {studioImages.map((_, idx) => (
                          <button 
                            key={idx}
                            onClick={() => setActiveStudioImg(idx)}
                            className={`h-1.5 rounded-full transition-all duration-500 shadow-sm ${
                              activeStudioImg === idx ? 'bg-white w-8' : 'bg-white/50 w-2 hover:bg-white/80'
                            }`} 
                          />
                        ))}
                      </div>
                    </div>
                    <div className="absolute -bottom-6 -right-6 w-full h-full bg-[#F0EBE4] border border-[#E8DFD3] rounded-2xl z-0 hidden md:block"></div>
                  </div>
            </div>
          </div>
        )}

        {pg === 'blog' && (
          <div className="max-w-[1200px] mx-auto px-5 md:px-8 pt-4 md:pt-12 pb-16 md:pb-24">
            <div className="hidden md:flex items-center gap-2 text-xs text-[#8B7D6B] mb-8"><button onClick={() => go('home')} className="hover:text-[#A0522D]">Home</button><ChevronRight className="w-3 h-3" /><span className="text-[#3E2F1C]">Journal</span></div>
            
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-3xl md:text-5xl text-[#3E2F1C] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>The Journal</h2>
              <p className="text-[#8B7D6B] max-w-xl mx-auto md:text-lg">Stories, styling tips, and the meaning behind the stones.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
              {blogs.map((post) => (
                <div key={post._id || post.id} className="group cursor-pointer" onClick={() => go('blog-post', post)}>
                  <div className="aspect-square bg-[#FAF6F1] rounded-xl mb-5 overflow-hidden">
                    <img src={post.img} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="flex items-center gap-3 text-[10px] uppercase tracking-widest text-[#A0522D] font-bold mb-3">
                    <span>{post.cat}</span>
                    <span className="w-1 h-1 rounded-full bg-[#D1C7B7]"></span>
                    <span className="text-[#8B7D6B]">{post.date}</span>
                  </div>
                  <h3 className="text-xl text-[#3E2F1C] font-medium leading-snug group-hover:text-[#A0522D] transition-colors mb-2">
                    {post.title}
                  </h3>
                  <p className="text-sm text-[#8B7D6B] line-clamp-2">{post.ex}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {pg === 'blog-post' && selBlog && (
          <div className="bg-white min-h-screen">
            <div className="max-w-[800px] mx-auto px-5 md:px-8 pt-8 md:pt-16 pb-24 animate-in fade-in duration-500">
              
              <button 
                onClick={() => go('blog')} 
                className="text-xs text-[#8B7D6B] mb-8 hover:text-[#A0522D] flex items-center gap-1 transition-colors font-medium uppercase tracking-widest"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Back to Journal
              </button>

              <div className="text-center mb-10 md:mb-16">
                <div className="flex items-center justify-center gap-3 text-[10px] uppercase tracking-[0.2em] text-[#A0522D] font-bold mb-6">
                  <span>{selBlog.cat || 'Journal'}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E8DFD3]"></span>
                  <span className="text-[#8B7D6B]">{selBlog.date}</span>
                </div>
                <h1 className="text-3xl md:text-5xl text-[#3E2F1C] leading-tight mb-8" style={{ fontFamily: 'Playfair Display, serif' }}>
                  {selBlog.title}
                </h1>
                {selBlog.ex && (
                  <p className="text-lg md:text-xl text-[#8B7D6B] italic max-w-2xl mx-auto leading-relaxed">
                    "{selBlog.ex}"
                  </p>
                )}
              </div>

              <div className="w-full aspect-[16/9] md:aspect-[2/1] rounded-2xl overflow-hidden bg-[#FAF6F1] mb-12 shadow-sm border border-[#F0EBE4]">
                <img src={selBlog.img} alt={selBlog.title} className="w-full h-full object-cover" />
              </div>

              <div className="max-w-none text-[#3E2F1C] leading-loose space-y-6">
                {(selBlog.content || '').split('\n').map((paragraph, idx) => (
                  paragraph.trim() && (
                    <p key={idx} className="text-base md:text-lg">
                      {paragraph}
                    </p>
                  )
                ))}
              </div>

              <div className="mt-20 pt-10 border-t border-[#E8DFD3] flex flex-col items-center">
                <p className="text-xs uppercase tracking-widest text-[#8B7D6B] mb-6">End of Story</p>
                <button 
                  onClick={() => go('blog')} 
                  className="text-sm font-bold uppercase tracking-widest border border-[#3E2F1C] text-[#3E2F1C] py-3.5 px-10 rounded-lg hover:bg-[#3E2F1C] hover:text-white transition-all duration-300 shadow-sm"
                >
                  Return to Journal
                </button>
              </div>
              
            </div>
          </div>
        )}

        {pg === 'collection' && (
          <div className="max-w-[1200px] mx-auto px-5 md:px-8 pt-4 md:pt-8 pb-8 md:pb-20">
            <div className="hidden md:flex items-center gap-2 text-xs text-[#8B7D6B] mb-6"><button onClick={() => go('home')} className="hover:text-[#A0522D]">Home</button><ChevronRight className="w-3 h-3" /><span className="text-[#3E2F1C]">Shop All</span></div>
            <h2 className="text-[28px] md:text-[40px] text-[#3E2F1C] mb-1 md:mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>Our Collection</h2>
            <p className="text-xs md:text-sm text-[#8B7D6B] mb-5 md:mb-10">{filtered.length} pieces</p>
            
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-5 md:mb-8 pb-4 border-b border-[#E8DFD3] gap-4">
              <div className="flex gap-2 md:gap-3 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                {['All', ...shopCategories].map(c => (
                  <button key={c} onClick={() => setCat(c)} className={`text-[10px] md:text-xs tracking-[0.1em] md:tracking-[0.15em] uppercase px-3 md:px-4 py-1.5 md:py-2 whitespace-nowrap font-medium shrink-0 transition-colors ${cat === c ? 'bg-[#3E2F1C] text-[#FAF6F1]' : 'bg-[#F0EBE4] text-[#5A4A3A] hover:bg-[#E8DFD3]'}`}>{c}</button>
                ))}
              </div>
              <div className="hidden md:flex items-center gap-2"><span className="text-xs text-[#8B7D6B]">Sort:</span><select value={sort} onChange={(e)=>setSort(e.target.value)} className="text-xs font-medium bg-transparent outline-none cursor-pointer"><option>Featured</option><option>Price: Low</option><option>Price: High</option></select></div>
            </div>

            {filtered.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">{filtered.map(p => <Card key={p.id || p._id} p={p} />)}</div>
            ) : (
              <div className="py-16 md:py-24 text-center">
                <Search className="w-10 h-10 md:w-12 md:h-12 text-[#E8DFD3] mx-auto mb-3 md:mb-4" />
                <h3 className="text-sm md:text-xl mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>No matches found</h3>
                <button onClick={() => setCat('All')} className="text-xs md:text-sm text-[#A0522D] underline mt-2 md:mt-4">Clear filters</button>
              </div>
            )}
          </div>
        )}

        {pg === 'product' && (() => {
          const p = selProd;
          const productSizes = Array.isArray(p.sizes) && p.sizes.length > 0 
            ? p.sizes 
            : (typeof p.sizes === 'string' ? p.sizes.split(',').map(s => s.trim()) : ['S', 'M', 'L']);
            
          return (
            <div className="max-w-[1200px] mx-auto px-0 md:px-8 pt-0 md:pt-8 pb-8 md:pb-20">
              <div className="hidden md:flex items-center gap-2 text-xs text-[#8B7D6B] mb-8"><button onClick={() => go('home')} className="hover:text-[#A0522D]">Home</button><ChevronRight className="w-3 h-3" /><button onClick={() => go('collection')} className="hover:text-[#A0522D]">Shop</button><ChevronRight className="w-3 h-3" /><span className="text-[#3E2F1C]">{p.name}</span></div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 md:gap-16">
                
                <div>
                  <div className="aspect-square md:rounded-xl overflow-hidden bg-[#F0EBE4]">
                    <img 
                      src={activeImg || p.img} 
                      alt={p.name} 
                      className="w-full h-full object-cover transition-opacity duration-300" 
                    />
                  </div>
                  
                  <div className="grid grid-cols-4 gap-3 mt-3 md:mt-4 px-5 md:px-0">
                    {[p.img, p.img2].filter(Boolean).map((im, i) => (
                      <div 
                        key={i} 
                        onClick={() => setActiveImg(im)} 
                        className={`aspect-square rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${
                          (activeImg || p.img) === im 
                            ? 'border-[#A0522D] opacity-100' 
                            : 'border-transparent opacity-60 hover:opacity-100 hover:border-[#E8DFD3]' 
                        }`}
                      >
                        <img src={im} alt="" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="px-5 py-5 md:px-0 md:py-4 mt-2 md:mt-0">
                  {p.tag && <span className="text-[10px] md:text-[11px] tracking-[0.15em] md:tracking-[0.2em] text-[#A0522D] uppercase font-medium">{p.tag}</span>}
                  <h2 className="text-[26px] md:text-[36px] text-[#3E2F1C] mt-1 mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>{p.name}</h2>
                  
                  <span className="text-[24px] md:text-[28px] font-bold text-[#3E2F1C] block mb-6 md:mb-8">₱{p.price}</span>

                  <div className="mb-5 md:mb-6">
                    <div className="flex items-center justify-between mb-2 md:mb-3">
                      <p className="text-[10px] md:text-xs tracking-[0.15em] uppercase font-semibold">Size</p>
                      <button onClick={() => go('sizeguide')} className="text-[10px] md:text-xs text-[#A0522D] underline">Size Guide</button>
                    </div>
                    <div className="flex flex-wrap gap-2 md:gap-3">
                      {productSizes.map(s => (
                        <button key={s} onClick={() => setSelSz(s)} className={`w-11 h-11 md:w-12 md:h-12 text-sm font-medium transition-all ${selSz === s ? 'bg-[#3E2F1C] text-[#FAF6F1]' : 'bg-[#F0EBE4] hover:bg-[#E8DFD3]'}`}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-6 md:mb-8">
                    <p className="text-[10px] md:text-xs tracking-[0.15em] uppercase mb-2 md:mb-3 font-semibold">Quantity</p>
                    <div className="inline-flex items-center border border-[#E8DFD3]">
                      <button onClick={() => setQty(prev => Math.max(1, prev - 1))} className="w-11 h-11 md:w-12 md:h-12 flex items-center justify-center hover:bg-[#F0EBE4]"><Minus className="w-4 h-4" /></button>
                      <span className="w-11 h-11 md:w-12 md:h-12 flex items-center justify-center text-sm font-medium border-x border-[#E8DFD3]">{qty}</span>
                      <button onClick={() => setQty(prev => prev + 1)} className="w-11 h-11 md:w-12 md:h-12 flex items-center justify-center hover:bg-[#F0EBE4]"><Plus className="w-4 h-4" /></button>
                    </div>
                  </div>

                  <button onClick={() => addCart(p)} className="hidden md:block w-full bg-[#A0522D] text-[#FAF6F1] text-sm tracking-[0.15em] uppercase py-4 hover:bg-[#8B4526] transition-colors font-semibold mb-3">Add to Cart — ₱{p.price * qty}</button>

                  <div className="flex gap-3 mb-6 md:mb-8">
                    <button onClick={() => togWish(p)} className="flex-1 md:flex-none md:w-full border border-[#E8DFD3] text-sm py-3 flex items-center justify-center gap-2 hover:bg-[#F0EBE4] transition-colors"><Heart className={`w-4 h-4 md:w-5 md:h-5 ${wish.includes(p._id || p.id) ? 'fill-[#A0522D] text-[#A0522D]' : 'text-[#3E2F1C]'}`} /> <span className="hidden md:inline">{wish.includes(p._id || p.id) ? 'Saved' : 'Wishlist'}</span></button>
                    <button onClick={() => go('customizer')} className="flex-1 md:flex-none md:w-full border border-[#E8DFD3] text-sm py-3 flex items-center justify-center gap-2 hover:bg-[#F0EBE4] transition-colors"><Palette className="w-4 h-4 md:w-5 md:h-5 text-[#3E2F1C]" /> <span className="hidden md:inline">Customize</span></button>
                  </div>

                  {[{ k: 'description', t: 'Description', c: `Handcrafted ${p.mat || 'quality'} beads. Each bead selected for natural beauty.` }, { k: 'care', t: 'Materials & Care', c: `${p.mat || 'Quality materials'}. Remove before swimming. Store in pouch.` }, { k: 'shipping', t: 'Shipping', c: 'Free over ₱500. Standard 7-14 days Pre-order.' }].map(s => (
                    <div key={s.k} className="border-t border-[#E8DFD3]">
                      <button onClick={() => setAcc(prev => prev === s.k ? '' : s.k)} className="w-full flex items-center justify-between py-3.5 md:py-4">
                        <span className="text-xs md:text-sm font-semibold tracking-wider uppercase">{s.t}</span>
                        <ChevronDown className={`w-4 h-4 text-[#8B7D6B] transition-transform ${acc === s.k ? 'rotate-180' : ''}`} />
                      </button>
                      {acc === s.k && <p className="text-sm text-[#5A4A3A] leading-relaxed pb-4">{s.c}</p>}
                    </div>
                  ))}
                </div>
              </div>

              <div className="md:hidden sticky bottom-0 bg-white border-t border-[#E8DFD3] p-4 flex items-center gap-3 z-30">
                <span className="text-lg font-bold text-[#3E2F1C]">₱{p.price * qty}</span>
                <button onClick={() => addCart(p)} className="flex-1 bg-[#A0522D] text-[#FAF6F1] text-xs tracking-[0.1em] uppercase py-3.5 font-semibold">Add to Cart</button>
              </div>
            </div>
          );
        })()}

        {pg === 'customizer' && (() => {
          const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
          const safeWristSize = parseFloat(wristSize) || 16.5; 
          const circumference_mm = safeWristSize * 10;
          const idealCount = Math.max(5, Math.floor(circumference_mm / sBeadCol.size));
          const beadDiff = idealCount - sBeads.length;
          const baseRadius = isMobile ? 90 : 120;
          const scale = Math.min(1.3, Math.max(0.7, safeWristSize / 16.5));
          const radius = baseRadius * scale;
          const getFullStringName = () => sStr?.name + (sStr?.id === 's2' ? ` (${sLockColor}${sExtender ? ' w/ Extender' : ''})` : '');
          const totalCost = 25 + sBeads.reduce((s, b) => s + b.price, 0) + (sStr?.price || 0) + sCharms.reduce((s, c) => s + c.price, 0) + (sExtender && sStr?.id === 's2' ? 8 : 0);

          return (
            <div className="max-w-[1200px] mx-auto px-5 md:px-8 pt-4 md:pt-8 pb-8 md:pb-20">
              <div className="hidden md:flex items-center gap-0 mb-10">{['Bead Type','String Beads','String Options','Pendant','Wrist Fit','Review'].map((s, i) => (
                <div key={i} className="flex items-center flex-1"><div className={`flex items-center gap-2 ${i+1 <= cStep ? 'text-[var(--primary)]' : 'text-[#B0A395]'}`}><div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${i+1 <= cStep ? 'bg-[var(--primary)] text-white' : 'bg-[#F0EBE4]'}`}>{i+1}</div><span className="text-xs tracking-wider uppercase font-medium">{s}</span></div>{i < 5 && <div className={`flex-1 h-px mx-4 ${i+1 < cStep ? 'bg-[var(--primary)]' : 'bg-[#E8DFD3]'}`} />}</div>
              ))}</div>

              <div className="md:hidden flex gap-1 mb-6">
                {['Type', 'Beads', 'String', 'Charm', 'Wrist', 'Review'].map((s, i) => (
                  <div key={i} className="flex-1">
                    <div className={`h-1 rounded-full ${i + 1 <= cStep ? 'bg-[var(--primary)]' : 'bg-[#E8DFD3]'}`} />
                    <p className={`text-[9px] text-center mt-1.5 ${i + 1 <= cStep ? 'text-[var(--primary)] font-medium' : 'text-[#B0A395]'}`}>{s}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-6 md:gap-12">
                <div className="md:col-span-2 order-1 md:order-none">
                  <div className="md:sticky md:top-32">
                    <div className="aspect-square rounded-2xl bg-white border border-[#E8DFD3] flex items-center justify-center p-6 md:p-8 shadow-sm relative overflow-hidden">
                      <div className="absolute inset-0 bg-[var(--bg-light)] opacity-50 pointer-events-none"></div>
                      
                      <div 
                        className="rounded-full flex items-center justify-center relative shadow-inner bg-transparent transition-all duration-500"
                        style={{ 
                          width: radius * 2, height: radius * 2,
                          borderWidth: sBeads.length > 0 ? '2px' : '2px',
                          borderStyle: sBeads.length > 0 ? 'solid' : 'dashed',
                          borderColor: sBeads.length > 0 ? (sStr?.color || '#E8DFD3') : '#D4C4A8' 
                        }}
                      >
                        {sStr?.id === 's2' && sBeads.length > 0 && (
                          <div className="absolute top-[-6px] left-1/2 -translate-x-1/2 w-3 h-5 rounded-sm shadow-sm z-0 border border-black/10 transition-colors duration-300" style={{ backgroundColor: sLockColor === 'Gold' ? '#C9A96E' : '#E5E7EB' }}/>
                        )}
                        
                        {sBeads.map((b, i) => { 
                          const beadPx = Math.max(8, sBeadCol.size * 2.5); 
                          const offset = beadPx / 2;
                          const totalSlots = sBeads.length + (sCharms.length > 0 ? 1 : 0);
                          const charmSlot = Math.floor(totalSlots / 2);
                          const slotIndex = (sCharms.length > 0 && i >= charmSlot) ? i + 1 : i;
                          const angle = (slotIndex / Math.max(totalSlots, 1)) * Math.PI * 2 - Math.PI / 2; 
                          
                          return (
                            <div key={i} className="absolute rounded-full shadow-sm border border-white/40 transition-all duration-500 hover:scale-125 z-10" 
                              style={{ width: beadPx, height: beadPx, backgroundColor: b.hex, left: `calc(50% + ${Math.cos(angle)*radius}px - ${offset}px)`, top: `calc(50% + ${Math.sin(angle)*radius}px - ${offset}px)` }} 
                            />
                          ); 
                        })}

                        {sCharms.map((c) => {
                          const charmPx = isMobile ? 32 : 40;
                          const offset = charmPx / 2;
                          const totalSlots = sBeads.length + 1;
                          const angle = (Math.floor(totalSlots / 2) / totalSlots) * Math.PI * 2 - Math.PI / 2;
                          return (
                            <div key={`charm-${c.id}`} className="absolute text-2xl md:text-3xl filter drop-shadow-md z-20 transition-all duration-500 hover:scale-125 hover:rotate-12 flex items-center justify-center"
                              style={{ width: charmPx, height: charmPx, left: `calc(50% + ${Math.cos(angle)*radius}px - ${offset}px)`, top: `calc(50% + ${Math.sin(angle)*radius}px - ${offset}px + 12px)` }}>
                              {c.em}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    
                    <div className="mt-4 p-5 bg-white rounded-xl border border-[#E8DFD3] shadow-sm">
                      <div className="flex justify-between items-center mb-2"><span className="text-sm font-bold text-[#8B7D6B]">Live Total</span><span className="text-xl font-bold text-[var(--dark)]">₱{totalCost}</span></div>
                      <div className="flex flex-col gap-1 border-t border-[#E8DFD3] pt-3 mt-3 text-xs text-[#8B7D6B]">
                        <div className="flex justify-between"><span>Base Setting</span><span>₱25</span></div>
                        <div className="flex justify-between"><span>{sBeads.length}x {sBeadCol.name}</span><span>₱{sBeads.reduce((s, b) => s + b.price, 0)}</span></div>
                        <div className="flex justify-between"><span>String/Hardware</span><span>₱{sStr?.price || 0}</span></div>
                        <div className="flex justify-between"><span>Pendant</span><span>₱{sCharms.reduce((s, c) => s + c.price, 0)}</span></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-3 order-2 md:order-none">
                  
                  {cStep === 1 && <div>
                    <h2 className="text-[24px] text-[var(--dark)] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>Choose Bead Collection</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-2 scrollbar-hide">
                      {beadCollections.map(bc => (
                        <button key={bc.id} onClick={() => { setSBeadCol(bc); setSBeads([]); }} className={`flex flex-col text-left p-4 rounded-xl border-2 transition-all ${sBeadCol.id === bc.id ? 'border-[var(--primary)] bg-[var(--bg-light)]' : 'border-[#E8DFD3] hover:border-[#D1C7B7]'}`}>
                          <span className="font-bold text-[var(--dark)] text-sm">{bc.type}</span>
                          <span className="text-xs text-[#8B7D6B] mt-1">{bc.size}mm • ₱{bc.price}/ea</span>
                        </button>
                      ))}
                    </div>
                  </div>}

                  {cStep === 2 && <div>
                    <h2 className="text-[24px] text-[var(--dark)] mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>Design Your Pattern</h2>
                    <p className="text-sm text-[#8B7D6B] mb-6">Click colors to string them. For a {wristSize}" wrist, you need approx <strong className="text-[var(--primary)]">{idealCount} beads</strong>.</p>
                    
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-3 mb-6">
                      {sBeadCol.colors.map(c => (
                        <button key={c.name} onClick={() => setSBeads([...sBeads, { name: c.name, hex: c.hex, price: sBeadCol.price }])} className="flex flex-col items-center gap-2 p-3 rounded-lg border border-[#E8DFD3] hover:border-[var(--primary)] transition-all">
                          <div className="w-8 h-8 rounded-full shadow-sm border border-black/10" style={{ backgroundColor: c.hex }} />
                          <span className="text-[10px] font-bold text-center leading-tight">{c.name}</span>
                        </button>
                      ))}
                    </div>

                    {sBeads.length > 0 && (
                      <div className="p-4 bg-[#F0EBE4] rounded-xl">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-xs font-bold uppercase tracking-widest text-[#8B7D6B]">Current String ({sBeads.length})</span>
                          <button onClick={() => setSBeads([])} className="text-[10px] text-red-500 font-bold uppercase">Clear All</button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {sBeads.map((b, i) => (
                            <button key={i} onClick={() => setSBeads(sBeads.filter((_, idx) => idx !== i))} className="w-6 h-6 rounded-full border border-black/20 hover:scale-110 hover:opacity-50 transition-all flex items-center justify-center group" style={{ backgroundColor: b.hex }}>
                               <X className="w-3 h-3 text-white opacity-0 group-hover:opacity-100 drop-shadow-md" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>}
                  
                  {cStep === 3 && <div>
                    <h2 className="text-[24px] text-[var(--dark)] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>String Options</h2>
                    <div className="flex flex-col gap-3 md:gap-4 mb-6">
                      {strOpts.map(s => (
                        <button 
                          key={s.id} 
                          onClick={() => setSStr(s)} 
                          className={`flex items-center gap-4 p-4 md:p-5 rounded-xl border-2 transition-all text-left group ${sStr?.id === s.id ? 'border-[var(--primary)] bg-[var(--bg-light)]' : 'border-[#E8DFD3] hover:border-[#D1C7B7]'}`}
                        >
                          <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center shrink-0 shadow-sm transition-colors ${sStr?.id === s.id ? 'bg-[var(--primary)] text-white' : 'bg-[#F0EBE4] text-[#8B7D6B] group-hover:bg-[#E8DFD3]'}`}>
                            {s.id === 's1' ? <Layers className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-bold text-[#3E2F1C]">{s.name}</p>
                            <p className="text-[10px] md:text-xs text-[#8B7D6B] mt-0.5 leading-relaxed">{s.desc}</p>
                          </div>
                          <div className="text-right flex flex-col items-end">
                            <p className="text-[11px] md:text-xs font-bold text-[var(--primary)]">{s.price === 0 ? 'Included' : `+₱${s.price}`}</p>
                            {sStr?.id === s.id && <Check className="w-5 h-5 text-[var(--primary)] mt-1" />}
                          </div>
                        </button>
                      ))}
                    </div>

                    {sStr?.id === 's2' && (
                      <div className="animate-in fade-in slide-in-from-top-2 duration-300 space-y-4">
                        
                        <div className="p-5 bg-white border border-[#E8DFD3] rounded-xl shadow-sm">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-[#8B7D6B] mb-3">Select Hardware Color</p>
                          <div className="flex gap-3">
                            {[
                              { id: 'Gold', hex: '#C9A96E' },
                              { id: 'Silver', hex: '#E5E7EB' }
                            ].map(lc => (
                              <button 
                                key={lc.id}
                                onClick={() => setSLockColor(lc.id)}
                                className={`flex-1 flex items-center justify-center gap-3 p-3 rounded-lg border-2 transition-all ${sLockColor === lc.id ? 'border-[var(--primary)] bg-[var(--bg-light)]' : 'border-[#E8DFD3] hover:border-[#D1C7B7]'}`}
                              >
                                <div className="w-5 h-5 rounded-full border border-black/10 shadow-sm shrink-0" style={{ backgroundColor: lc.hex }} />
                                <span className="text-xs font-bold text-[#3E2F1C]">{lc.id}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="p-5 bg-white border border-[#E8DFD3] rounded-xl shadow-sm">
                          <div className="mb-3">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-[#8B7D6B]">Add Extender Chain?</p>
                            <p className="text-[11px] text-[#8B7D6B] mt-1">Allows adjustable length for the perfect fit.</p>
                          </div>
                          <div className="flex gap-3">
                            <button 
                              onClick={() => setSExtender(false)}
                              className={`flex-1 py-2.5 rounded-lg border-2 font-bold text-xs transition-all ${!sExtender ? 'border-[var(--primary)] bg-[var(--bg-light)] text-[var(--dark)]' : 'border-[#E8DFD3] bg-white text-[#8B7D6B] hover:border-[#D1C7B7]'}`}
                            >
                              No Thanks
                            </button>
                            <button 
                              onClick={() => setSExtender(true)}
                              className={`flex-1 py-2.5 rounded-lg border-2 font-bold text-xs transition-all ${sExtender ? 'border-[var(--primary)] bg-[var(--bg-light)] text-[var(--dark)]' : 'border-[#E8DFD3] bg-white text-[#8B7D6B] hover:border-[#D1C7B7]'}`}
                            >
                              Yes (+₱8)
                            </button>
                          </div>
                        </div>

                      </div>
                    )}
                  </div>}

                  {cStep === 4 && <div>
                    <h2 className="text-[24px] text-[var(--dark)] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>Add a Pendant</h2>
                    <p className="text-sm text-[#8B7D6B] mb-6">Optional — Select 1 center pendant</p>
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-2 md:gap-3 max-h-[400px] overflow-y-auto pr-1 md:pr-2 scrollbar-hide">
                      {charmOpts.map(c => (
                        <button 
                          key={c.id} 
                          onClick={() => setSCharms(prev => prev.find(x => x.id === c.id) ? [] : [c])} 
                          className={`flex flex-col items-center justify-center gap-1 md:gap-2 p-3 rounded-xl border-2 transition-all ${sCharms.find(x => x.id === c.id) ? 'border-[var(--primary)] bg-[var(--bg-light)]' : 'border-[#E8DFD3] hover:border-[#D1C7B7]'}`}
                        >
                          <span className="text-2xl md:text-3xl mb-1">{c.em}</span>
                          <p className="text-[10px] md:text-xs font-bold text-[#3E2F1C] text-center leading-tight">{c.name}</p>
                          <p className="text-[9px] md:text-[10px] text-[#8B7D6B]">+₱{c.price}</p>
                        </button>
                      ))}
                    </div>
                  </div>}

                  {cStep === 5 && <div>
                    <h2 className="text-[24px] text-[var(--dark)] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>Wrist Measurement</h2>
                    <p className="text-sm text-[#8B7D6B] mb-6">Measure tightly around your wrist with a tape measure. Enter your exact size in <strong>centimeters (cm)</strong>. We will adjust the gaps automatically.</p>
                    
                      <div className="flex items-center gap-4 mb-8">
                        <input 
                          type="number" step="0.5" min="10" max="25" 
                          value={wristSize} 
                          onChange={(e) => setWristSize(e.target.value)} 
                          placeholder="16.5"
                          className="w-32 px-4 py-3 border-2 border-[#E8DFD3] rounded-xl text-lg font-bold text-center outline-none focus:border-[var(--primary)]"
                        />
                        <span className="text-lg font-bold text-[var(--dark)]">cm</span>
                      </div>

                    <div className={`p-5 rounded-2xl border transition-all duration-500 ${beadDiff === 0 ? 'bg-[#F2F7F4] border-[#7A8B6F]/30' : 'bg-[var(--bg-light)] border-[var(--primary)]/30 shadow-sm'}`}>
                      <h4 className="font-bold text-sm mb-1">{beadDiff === 0 ? 'Perfect Fit!' : 'Smart Fit Suggestion'}</h4>
                      <p className="text-xs text-[#8B7D6B] mb-2">
                        Based on a {safeWristSize}cm wrist and {sBeadCol.size}mm beads, you need exactly <strong>{idealCount} beads</strong>. You currently have {sBeads.length}.
                      </p>
                      <p className="text-[10px] uppercase tracking-widest font-bold text-[var(--primary)] mb-4">
                        * Note: This recommendation ensures a little bit of a loose fit.
                      </p>
                      
                      {beadDiff !== 0 && (
                        <button onClick={() => {
                          if (beadDiff > 0) {
                            const last = sBeads[sBeads.length - 1] || { name: 'Filler', hex: '#ccc', price: sBeadCol.price };
                            setSBeads([...sBeads, ...Array(beadDiff).fill(last)]);
                          } else {
                            setSBeads(sBeads.slice(0, idealCount));
                          }
                        }} className="text-[10px] font-bold uppercase tracking-widest bg-[var(--dark)] text-white px-5 py-3 rounded-xl hover:bg-[var(--primary)] transition-colors w-full">
                          {beadDiff > 0 ? `Auto-Fill Missing ${beadDiff} Beads (+₱${beadDiff * sBeadCol.price})` : `Trim Excess ${Math.abs(beadDiff)} Beads`}
                        </button>
                      )}
                    </div>
                  </div>}
                  
                  {cStep === 6 && <div>
                    <h2 className="text-[24px] text-[var(--dark)] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>Review & Submit</h2>
                    <div className="bg-[#F0EBE4] rounded-lg p-4 md:p-6 mb-4 md:mb-6">
                      <div className="hidden md:flex flex-wrap gap-1.5 mb-4 border-b border-[#E8DFD3] pb-4">
                        {sBeads.map((b, i) => <div key={i} className="w-5 h-5 rounded-full border border-black/5" style={{ backgroundColor: b.hex }} />)}
                      </div>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between"><span className="text-[#8B7D6B]">Base Setting</span><span className="font-bold text-[var(--dark)]">₱25</span></div>
                        <div className="flex justify-between"><span className="text-[#8B7D6B]">Bead Collection</span><span className="font-bold text-[var(--primary)]">{sBeadCol.name}</span></div>
                        <div className="flex justify-between"><span className="text-[#8B7D6B]">Wrist Fit</span><span className="font-bold text-[var(--primary)]">{safeWristSize}cm</span></div>
                        <div className="flex justify-between"><span className="text-[#8B7D6B]">Beads ({sBeads.length})</span><span className="font-medium">₱{sBeads.reduce((s, b) => s + b.price, 0)}</span></div>
                        <div className="flex justify-between"><span className="text-[#8B7D6B]">String</span><span className="font-medium">{getFullStringName()}</span></div>
                        <div className="flex justify-between"><span className="text-[#8B7D6B]">Pendant</span><span className="font-medium">{sCharms.length > 0 ? sCharms[0].name : 'None'}</span></div>
                      </div>
                      <div className="flex justify-between pt-3 md:pt-4 border-t border-[#E8DFD3] mt-3 md:mt-4"><span className="font-semibold">Total</span><span className="text-lg font-bold">₱{totalCost}</span></div>
                    </div>
                    
                    <div className="space-y-4 mb-6">
                      <div>
                        <label className="text-xs tracking-[0.15em] uppercase mb-1.5 font-semibold block text-[#8B7D6B]">Your Email <span className="text-[var(--primary)]">*</span></label>
                        <p className="text-[10px] text-[#8B7D6B] mb-2">We will send the actual photo of your crafted design here.</p>
                        <input value={cEmail} onChange={(e)=>setCEmail(e.target.value)} type="email" placeholder="hello@example.com" className="w-full px-4 py-3 border border-[#E8DFD3] bg-white text-sm placeholder:text-[#B0A395] outline-none focus:border-[var(--primary)] rounded-lg" />
                      </div>

                      <div>
                        <label className="text-xs tracking-[0.15em] uppercase mb-1.5 font-semibold block text-[#8B7D6B]">Name Your Bracelet (Optional)</label>
                        <input value={cName} onChange={(e)=>setCName(e.target.value)} placeholder="e.g. My Healing Energy Bracelet" className="w-full px-4 py-3 border border-[#E8DFD3] bg-white text-sm placeholder:text-[#B0A395] outline-none focus:border-[var(--primary)] rounded-lg" />
                      </div>
                    </div>
                    
                    <button 
                      onClick={async () => {
                        if (!cEmail || !cEmail.includes('@')) {
                          flash('Please enter a valid email to receive your picture.', 'info');
                          return;
                        }

                        try {
                          await fetch('https://beaded-by-unknown.onrender.com/api/custom-orders', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              email: cEmail,
                              name: cName || 'Custom Bracelet',
                              beadType: sBeadCol.name,
                              beads: sBeads.map(b => ({ name: b.name, hex: b.hex })),
                              string: getFullStringName(),
                              beadSize: `${sBeadCol.size}mm`,
                              wristSize: `${wristSize}cm`,
                              charms: sCharms.map(c => ({ name: c.name, em: c.em })),
                              totalPrice: totalCost,
                              status: 'Pending Studio Review',
                              createdAt: new Date().toISOString()
                            })
                          });
                        } catch(err) {
                          console.log('Failed to send to admin', err);
                        }

                        const customMaterial = `Custom: ${sBeadCol.name} for ${safeWristSize}cm wrist${sStr?.id === 's2' ? ` (${sLockColor} Lock${sExtender ? ', Extender' : ''})` : ''}`;
                        addCart({ id:Date.now(), name:cName || 'Custom Bracelet', price:totalCost, img:'', mat: customMaterial });
                        flash('Design sent to studio!', 'success');
                      }} 
                      className="w-full bg-[var(--primary)] text-white text-xs md:text-sm tracking-[0.1em] md:tracking-[0.15em] uppercase py-3.5 md:py-4 font-bold shadow-md flex items-center justify-center gap-2 hover:opacity-90 transition-opacity rounded-xl"
                    >
                      <Sparkles className="w-4 h-4" /> Send to Studio & Add to Cart — ₱{totalCost}
                    </button>
                  </div>}
                  
                  <div className="flex justify-between mt-8 pt-6 border-t border-[#E8DFD3]">
                    {cStep > 1 ? <button onClick={() => setCStep(cStep - 1)} className="text-sm font-bold text-[#8B7D6B]">Back</button> : <div/>}
                    {cStep < 6 && (
                      <button 
                        onClick={() => {
                          if (cStep === 2 && sBeads.length < 5) {
                            flash('Please string at least 5 beads to continue.', 'info');
                            return;
                          }
                          setCStep(cStep + 1);
                        }} 
                        className="text-sm font-bold text-[var(--primary)]"
                      >
                        Next Step
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {pg === 'wishlist' && (
          <div className="max-w-[1200px] mx-auto px-5 md:px-8 pt-4 md:pt-8 pb-8 md:pb-20 animate-in fade-in duration-300">
            
            <div className="flex justify-between items-end mb-1 md:mb-2 border-b border-[#E8DFD3] pb-4">
              <div>
                <h2 className="text-[28px] md:text-[40px] text-[#3E2F1C]" style={{ fontFamily: 'Playfair Display, serif' }}>Wishlist</h2>
                <p className="text-xs md:text-sm text-[#8B7D6B] mt-1">{wish.length} items</p>
              </div>
              
              {wish.length > 0 && (
                <button 
                  onClick={() => { setWish([]); flash('Wishlist cleared', 'info'); }} 
                  className="text-[10px] md:text-xs font-bold tracking-widest uppercase text-[#8B7D6B] hover:text-[#B85C5C] transition-colors flex items-center gap-1.5 pb-2"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Clear All
                </button>
              )}
            </div>
            
            <div className="mt-8">
              {wish.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                  {P.filter(p => wish.includes(p._id || p.id || p.name)).map(p => <Card key={p._id || p.id || p.name} p={p} />)}
                </div>
              ) : (
                <div className="py-16 md:py-24 text-center bg-[#FAF6F1] rounded-xl border border-[#E8DFD3]">
                  <Heart className="w-12 h-12 md:w-16 md:h-16 text-[#E8DFD3] mx-auto mb-4" />
                  <h3 className="text-lg md:text-xl mb-2 text-[#3E2F1C]" style={{ fontFamily: 'Playfair Display, serif' }}>Nothing saved yet</h3>
                  <button onClick={() => go('collection')} className="bg-[#A0522D] text-[#FAF6F1] text-xs md:text-sm uppercase tracking-widest px-8 py-3.5 md:py-4 mt-4 font-bold hover:bg-[#8B4526] transition-colors">
                    Explore Collection
                  </button>
                </div>
              )}
            </div>

          </div>
        )}

        {pg === 'checkout' && (
          <div className="max-w-[1200px] mx-auto px-5 md:px-8 pt-4 md:pt-8 pb-8 md:pb-20 animate-in fade-in duration-500">
            
            <button 
              onClick={() => { 
                go('collection'); 
                setCartOpen(true); 
                setChkStep(1); 
              }} 
              className="text-[10px] md:text-xs text-[#8B7D6B] mb-6 hover:text-[#A0522D] flex items-center gap-1 transition-colors font-medium uppercase tracking-widest"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Return to Cart
            </button>

            <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#E8DFD3]">
              <h2 className="text-[24px] md:text-[32px] text-[#3E2F1C]" style={{ fontFamily: 'Playfair Display, serif' }}>Checkout</h2>
              <div className="hidden md:flex gap-4">
                {['Information', 'Shipping', 'Payment'].map((s, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className={`text-xs tracking-wider uppercase ${i + 1 <= chkStep ? 'font-medium text-[#3E2F1C]' : 'text-[#B0A395]'}`}>{s}</span>
                    {i < 2 && <ChevronRight className="w-3 h-3 text-[#B0A395]" />}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-8 md:gap-16">
              <div className="md:col-span-3 order-2 md:order-1">
                
                {chkStep === 1 && (
                  <div className="animate-in slide-in-from-right-4 duration-300">
                    <h2 className="text-[20px] md:text-[24px] mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>Contact & Shipping</h2>
                    
                    <form onSubmit={(e) => { e.preventDefault(); setChkStep(2); }}>
                      <div className="space-y-4">
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <input type="email" required value={checkoutForm.email} onChange={(e) => setCheckoutForm({...checkoutForm, email: e.target.value})} placeholder="Email Address" className="w-full px-4 py-3.5 bg-white border border-[#E8DFD3] text-sm placeholder:text-[#B0A395] outline-none focus:border-[#A0522D] rounded-lg" />
                          <input type="tel" required value={checkoutForm.phone} onChange={(e) => setCheckoutForm({...checkoutForm, phone: e.target.value})} placeholder="Mobile Number (e.g. 0917...)" className="w-full px-4 py-3.5 bg-white border border-[#E8DFD3] text-sm placeholder:text-[#B0A395] outline-none focus:border-[#A0522D] rounded-lg" />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <input required value={checkoutForm.firstName} onChange={(e) => setCheckoutForm({...checkoutForm, firstName: e.target.value})} placeholder="First name" className="w-full px-4 py-3.5 bg-white border border-[#E8DFD3] text-sm placeholder:text-[#B0A395] outline-none focus:border-[#A0522D] rounded-lg" />
                          <input required value={checkoutForm.lastName} onChange={(e) => setCheckoutForm({...checkoutForm, lastName: e.target.value})} placeholder="Last name" className="w-full px-4 py-3.5 bg-white border border-[#E8DFD3] text-sm placeholder:text-[#B0A395] outline-none focus:border-[#A0522D] rounded-lg" />
                        </div>
                        
                        <input required value={checkoutForm.street} onChange={(e) => setCheckoutForm({...checkoutForm, street: e.target.value})} placeholder="House/Unit No., Building, Street Name" className="w-full px-4 py-3.5 bg-white border border-[#E8DFD3] text-sm placeholder:text-[#B0A395] outline-none focus:border-[#A0522D] rounded-lg" />
                        <input required value={checkoutForm.barangay} onChange={(e) => setCheckoutForm({...checkoutForm, barangay: e.target.value})} placeholder="Barangay / Village" className="w-full px-4 py-3.5 bg-white border border-[#E8DFD3] text-sm placeholder:text-[#B0A395] outline-none focus:border-[#A0522D] rounded-lg" />
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <input required value={checkoutForm.city} onChange={(e) => setCheckoutForm({...checkoutForm, city: e.target.value})} placeholder="City/Municipality" className="w-full px-4 py-3.5 bg-white border border-[#E8DFD3] text-sm placeholder:text-[#B0A395] outline-none focus:border-[#A0522D] rounded-lg" />
                          <input required value={checkoutForm.province} onChange={(e) => setCheckoutForm({...checkoutForm, province: e.target.value})} placeholder="Province" className="w-full px-4 py-3.5 bg-white border border-[#E8DFD3] text-sm placeholder:text-[#B0A395] outline-none focus:border-[#A0522D] rounded-lg" />
                          <input required value={checkoutForm.postalCode} onChange={(e) => setCheckoutForm({...checkoutForm, postalCode: e.target.value})} placeholder="Postal Code" className="w-full px-4 py-3.5 bg-white border border-[#E8DFD3] text-sm placeholder:text-[#B0A395] outline-none focus:border-[#A0522D] rounded-lg" />
                        </div>
                        
                        <div className="relative">
                          <select 
                            value={shippingRegion} 
                            onChange={(e) => setShippingRegion(e.target.value)} 
                            className="w-full px-4 py-3.5 bg-white border border-[#E8DFD3] rounded-lg outline-none focus:border-[#A0522D] text-sm appearance-none cursor-pointer"
                          >
                            <option value="Metro Manila">Metro Manila</option>
                            <option value="Luzon">Luzon (Provincial)</option>
                            <option value="Visayas">Visayas</option>
                            <option value="Mindanao">Mindanao</option>
                          </select>
                        </div>
                      </div>
                      
                      <button type="submit" className="w-full bg-[#A0522D] text-[#FAF6F1] text-sm tracking-[0.15em] uppercase py-4 mt-8 hover:bg-[#8B4526] font-semibold transition-colors">
                        Continue to Shipping
                      </button>
                    </form>

                  </div>
                )}

                {chkStep === 2 && (
                  <div className="animate-in slide-in-from-right-4 duration-300">
                    <h2 className="text-[20px] md:text-[24px] mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>Shipping Method</h2>
                    <div className="mb-8">
                      <div className="relative flex items-center justify-between p-5 bg-[#FAF6F1] border-2 border-[#A0522D] rounded-xl overflow-hidden">
                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#A0522D]"></div>
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#A0522D] shrink-0 shadow-sm border border-[#E8DFD3]">
                            <Package className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-bold text-[#3E2F1C] text-sm md:text-base">J&T Express</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="px-2 py-0.5 bg-[#A0522D]/10 text-[#A0522D] text-[10px] uppercase tracking-widest font-bold rounded">Pre-Order</span>
                              <span className="text-xs text-[#8B7D6B]">Ships in 7-14 days</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="block font-bold text-[#3E2F1C] text-lg">₱{currentShippingFee}</span>
                          <span className="block text-[10px] text-[#8B7D6B] uppercase tracking-wider mt-0.5">{shippingRegion}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <button onClick={() => setChkStep(1)} className="flex items-center gap-2 text-sm text-[#8B7D6B] hover:text-[#A0522D] transition-colors"><ChevronLeft className="w-4 h-4" /> Back</button>
                      <button onClick={() => setChkStep(3)} className="flex-1 bg-[#A0522D] text-[#FAF6F1] text-sm tracking-[0.15em] uppercase py-4 hover:bg-[#8B4526] font-semibold transition-colors">Continue to Payment</button>
                    </div>
                  </div>
                )}

                {chkStep === 3 && (
                  <div className="animate-in slide-in-from-right-4 duration-300">
                    <h2 className="text-[20px] md:text-[24px] mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>Payment</h2>
                    <div className="bg-[#F0EBE4] rounded-xl p-8 mb-8 text-center">
                      <Lock className="w-8 h-8 text-[#A0522D] mx-auto mb-3" />
                      <h3 className="text-lg font-medium mb-2">Secure Checkout</h3>
                      <p className="text-sm text-[#8B7D6B] max-w-[300px] mx-auto">You will be redirected to PayMongo to securely complete your purchase using GCash, Maya, QR Ph, or Card.</p>
                    </div>
                    <div className="flex gap-4">
                      <button onClick={() => setChkStep(2)} className="flex items-center gap-2 text-sm text-[#8B7D6B] hover:text-[#A0522D] transition-colors"><ChevronLeft className="w-4 h-4" /> Back</button>
                      <button 
                        onClick={handleCheckout} 
                        className="flex-1 bg-[#A0522D] text-[#FAF6F1] text-sm tracking-[0.15em] uppercase py-4 hover:bg-[#8B4526] font-semibold flex items-center justify-center gap-2 transition-colors"
                      >
                        <Lock className="w-4 h-4" /> Pay ₱{finalTotal} Securely
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="md:col-span-2 order-1 md:order-2">
                <div className="bg-[#FAF6F1] p-6 rounded-xl md:sticky md:top-32 border border-[#E8DFD3] md:border-none">
                  <h3 className="text-sm font-semibold tracking-wider uppercase mb-4 text-[#3E2F1C]">Order Summary</h3>
                  
                  {(!cart || cart.length === 0) ? (
                    <p className="text-sm text-[#8B7D6B] italic mb-4">Your cart is empty.</p>
                  ) : (
                    cart.map((it, idx) => (
                      <div key={it.id || idx} className="flex items-center gap-3 mb-4">
                        <div className="w-14 h-14 rounded-lg bg-[#E8DFD3] overflow-hidden relative shrink-0 border border-[#E8DFD3]">
                          <img src={it.img} alt="" className="w-full h-full object-cover" />
                          <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#3E2F1C] text-white text-[10px] rounded-full flex items-center justify-center">{it.qty || 1}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate text-[#3E2F1C]">{it.name}</p>
                        </div>
                        <span className="text-sm font-medium shrink-0 text-[#3E2F1C]">₱{(it.price * (it.qty || 1))}</span>
                      </div>
                    ))
                  )}

                  <div className="border-t border-[#E8DFD3] pt-4 mt-4 space-y-2">
                    <div className="flex justify-between text-sm text-[#8B7D6B]">
                      <span>Subtotal</span>
                      <span>₱{cTotal || 0}</span>
                    </div>
                    
                    <div className="flex justify-between text-sm text-[#8B7D6B] items-center">
                      <span>Shipping ({shippingRegion})</span>
                      <span className={currentShippingFee === 0 ? "text-[#7A8B6F] font-bold tracking-widest uppercase text-[10px] bg-[#F0EBE4] px-2 py-1 rounded" : ""}>
                        {currentShippingFee === 0 ? 'FREE' : `₱${currentShippingFee}`}
                      </span>
                    </div>
                    
                    <div className="flex justify-between pt-2 mt-2 border-t border-[#E8DFD3] items-center">
                      <span className="font-semibold text-[#3E2F1C]">Total</span>
                      <span className="text-xl font-bold text-[#3E2F1C]">₱{finalTotal || 0}</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {pg === 'account' && logged && (
          <div className="max-w-[1200px] mx-auto px-5 md:px-8 pt-4 md:pt-8 pb-8 md:pb-20">
            <div className="flex flex-col md:flex-row gap-8 md:gap-12">
              <div className="w-full md:w-64 space-y-1">
                <h2 className="text-2xl mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>My Account</h2>
                {['Overview', 'Orders', 'Settings'].map(tab => (
                  <button 
                    key={tab} 
                    onClick={() => tab === 'Wishlist' ? go('wishlist') : setAcctTab(tab.toLowerCase())}
                    className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${acctTab === tab.toLowerCase() ? 'bg-[#A0522D] text-white' : 'hover:bg-[#F0EBE4] text-[#3E2F1C]'}`}
                  >
                    {tab}
                  </button>
                ))}
                <button 
                  onClick={() => setLogoutPopupOpen(true)} 
                  className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-[#B85C5C] hover:bg-[#FDECEC] mt-4 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" /> Sign Out
                </button>
              </div>

              <div className="flex-1 bg-white rounded-2xl p-6 md:p-10 border border-[#E8DFD3]">
                
                {acctTab === 'overview' && (
                  <div>
                    <div className="flex items-center gap-4 mb-8 pb-8 border-b border-[#F0EBE4]">
                      <div className="w-16 h-16 rounded-full bg-[#A0522D] flex items-center justify-center text-white text-2xl font-bold">
                        {logged.firstName?.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-[#3E2F1C]">{logged.firstName} {logged.lastName}</h3>
                        <p className="text-sm text-[#8B7D6B]">{logged.email}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-[#FAF6F1] p-6 rounded-xl border border-[#E8DFD3]">
                        <div className="flex items-center gap-3 mb-2 text-[#A0522D]">
                          <Package className="w-5 h-5" />
                          <span className="text-xs font-bold uppercase tracking-widest">Recent Orders</span>
                        </div>
                        
                        {myOrders && myOrders.length > 0 ? (
                          <>
                            <p className="text-sm text-[#3E2F1C] mb-2">You have {myOrders.length} order(s).</p>
                            <button onClick={() => setAcctTab('orders')} className="text-xs text-[#A0522D] underline font-medium">View Status</button>
                          </>
                        ) : (
                          <>
                            <p className="text-sm text-[#3E2F1C]">No orders yet.</p>
                            <button onClick={() => go('collection')} className="text-xs text-[#A0522D] underline mt-2 font-medium">Start Shopping</button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {acctTab === 'orders' && (
                  <div className="animate-in fade-in duration-300">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-[#F0EBE4] pb-4">
                      <h3 className="text-xl font-semibold text-[#3E2F1C]">Order History</h3>
                      
                      <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                        {['All', 'Preparing', 'Shipped', 'Delivered'].map(f => (
                          <button 
                            key={f}
                            onClick={() => setOrderFilter(f)}
                            className={`px-4 py-1.5 rounded-full text-[10px] uppercase tracking-widest font-bold whitespace-nowrap transition-colors ${
                              orderFilter === f ? 'bg-[#3E2F1C] text-white' : 'bg-[#FAF6F1] text-[#8B7D6B] hover:bg-[#E8DFD3]'
                            }`}
                          >
                            {f}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {!myOrders || myOrders.length === 0 ? (
                      <div className="py-12 text-center bg-[#FAF6F1] rounded-xl border border-[#E8DFD3]">
                        <Package className="w-12 h-12 text-[#D1C7B7] mx-auto mb-4" />
                        <p className="text-[#8B7D6B] font-medium">You haven't placed any orders yet.</p>
                        <button onClick={() => go('collection')} className="text-xs text-[#A0522D] uppercase tracking-widest font-bold mt-4 hover:text-[#8B4526]">Shop Collection</button>
                      </div>
                    ) : (
                      <div className="space-y-5">
                        {myOrders
                          .filter(o => {
                            if (orderFilter === 'All') return true;
                            if (orderFilter === 'Preparing') return ['Paid', 'Pending Studio Review', 'Crafting'].includes(o.status);
                            return o.status === orderFilter;
                          })
                          .map(order => (
                          <div key={order._id} className="border border-[#E8DFD3] rounded-xl p-5 hover:border-[#A0522D] transition-colors bg-white shadow-sm">
                            
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 border-b border-[#F0EBE4] pb-4">
                              <div className="flex gap-8">
                                <div>
                                  <p className="text-[10px] text-[#8B7D6B] uppercase tracking-widest mb-1 font-bold">Date Placed</p>
                                  <p className="text-sm font-medium text-[#3E2F1C]">{new Date(order.createdAt).toLocaleDateString()}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] text-[#8B7D6B] uppercase tracking-widest mb-1 font-bold">Total</p>
                                  <p className="text-sm font-medium text-[#3E2F1C]">₱{order.amountPaid}</p>
                                </div>
                              </div>
                              <div className="text-left md:text-right">
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                                  order.status === 'Delivered' ? 'bg-purple-100 text-purple-700' :
                                  order.status === 'Shipped' ? 'bg-blue-100 text-blue-700' : 
                                  'bg-amber-100 text-amber-700'
                                }`}>
                                  {order.status === 'Paid' ? 'Preparing' : order.status}
                                </span>
                              </div>
                            </div>
                            
                            <div className="space-y-3">
                              {order.items?.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center text-sm">
                                  <span className="text-[#3E2F1C] font-medium">
                                    {item.quantity}x {item.name} 
                                    <span className="text-[#8B7D6B] font-normal ml-2">{item.color && `(${item.color})`}</span>
                                  </span>
                                  <span className="text-[#8B7D6B]">₱{item.amount / 100}</span>
                                </div>
                              ))}
                            </div>
                            
                          </div>
                        ))}
                        
                          {myOrders.filter(o => orderFilter === 'All' ? true : (orderFilter === 'Preparing' ? ['Paid', 'Pending Studio Review', 'Crafting'].includes(o.status) : o.status === orderFilter)).length === 0 && (
                           <div className="text-center py-8 text-[#8B7D6B] text-sm">
                             No orders found with status: {orderFilter}.
                           </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {acctTab === 'settings' && (
                  <div className="animate-in fade-in duration-300 w-full max-w-2xl">
                    <h3 className="text-xl font-semibold text-[#3E2F1C] mb-6 border-b border-[#F0EBE4] pb-4">Account Settings</h3>
                    
                    <form onSubmit={handleUpdateProfile} className="space-y-8">
                      <div>
                        <h4 className="text-sm font-bold uppercase tracking-widest text-[#8B7D6B] mb-4">Personal Information</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-xs text-[#8B7D6B]">First Name</label>
                            <input required value={profileForm.firstName || ''} onChange={(e) => handleProfileChange('firstName', e.target.value)} className="w-full px-4 py-2.5 bg-[#FAF6F1] border border-[#E8DFD3] rounded-lg outline-none focus:border-[#A0522D] text-sm" />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-xs text-[#8B7D6B]">Last Name</label>
                            <input required value={profileForm.lastName || ''} onChange={(e) => handleProfileChange('lastName', e.target.value)} className="w-full px-4 py-2.5 bg-[#FAF6F1] border border-[#E8DFD3] rounded-lg outline-none focus:border-[#A0522D] text-sm" />
                          </div>
                          
                          <div className="space-y-1.5 md:col-span-2">
                            <label className="text-xs text-[#8B7D6B]">Mobile Number</label>
                            <input required value={profileForm.phone || ''} onChange={(e) => handleProfileChange('phone', e.target.value)} placeholder="0917..." className="w-full px-4 py-2.5 bg-[#FAF6F1] border border-[#E8DFD3] rounded-lg outline-none focus:border-[#A0522D] text-sm" />
                          </div>
                          
                          <div className="space-y-1.5 md:col-span-2">
                            <label className="text-xs text-[#8B7D6B]">Email Address</label>
                            <input defaultValue={logged.email || ''} disabled className="w-full px-4 py-2.5 bg-[#E8DFD3] text-[#8B7D6B] border border-[#E8DFD3] rounded-lg outline-none text-sm cursor-not-allowed" />
                            <p className="text-[10px] text-[#8B7D6B] mt-1">Email cannot be changed.</p>
                          </div>
                        </div>
                      </div>

                      <div className="pt-6 border-t border-[#F0EBE4]">
                        <h4 className="text-sm font-bold uppercase tracking-widest text-[#8B7D6B] mb-4">Default Shipping Address</h4>
                        <p className="text-xs text-[#8B7D6B] mb-4">Save your address to breeze through checkout next time.</p>
                        
                        <div className="space-y-4">
                          <input required value={profileForm.street || ''} onChange={(e) => handleProfileChange('street', e.target.value)} placeholder="Street, Building, House No." className="w-full px-4 py-2.5 bg-[#FAF6F1] border border-[#E8DFD3] rounded-lg outline-none focus:border-[#A0522D] text-sm" />
                          <input required value={profileForm.barangay || ''} onChange={(e) => handleProfileChange('barangay', e.target.value)} placeholder="Barangay / Village" className="w-full px-4 py-2.5 bg-[#FAF6F1] border border-[#E8DFD3] rounded-lg outline-none focus:border-[#A0522D] text-sm" />
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <input required value={profileForm.city || ''} onChange={(e) => handleProfileChange('city', e.target.value)} placeholder="City" className="w-full px-4 py-2.5 bg-[#FAF6F1] border border-[#E8DFD3] rounded-lg outline-none focus:border-[#A0522D] text-sm" />
                            <input required value={profileForm.province || ''} onChange={(e) => handleProfileChange('province', e.target.value)} placeholder="Province" className="w-full px-4 py-2.5 bg-[#FAF6F1] border border-[#E8DFD3] rounded-lg outline-none focus:border-[#A0522D] text-sm" />
                            <input required value={profileForm.postalCode || ''} onChange={(e) => handleProfileChange('postalCode', e.target.value)} placeholder="Postal Code" className="w-full px-4 py-2.5 bg-[#FAF6F1] border border-[#E8DFD3] rounded-lg outline-none focus:border-[#A0522D] text-sm" />
                          </div>
                          
                          <select value={profileForm.region || 'Metro Manila'} onChange={(e) => handleProfileChange('region', e.target.value)} className="w-full px-4 py-2.5 bg-[#FAF6F1] border border-[#E8DFD3] rounded-lg outline-none focus:border-[#A0522D] text-sm cursor-pointer">
                            <option value="Metro Manila">Metro Manila</option>
                            <option value="Luzon">Luzon (Provincial)</option>
                            <option value="Visayas">Visayas</option>
                            <option value="Mindanao">Mindanao</option>
                          </select>
                        </div>
                        
                        <button 
                          type="submit" 
                          disabled={isProfileSaved}
                          className={`mt-8 text-xs font-bold uppercase tracking-widest border-2 px-8 py-3.5 rounded-xl transition-all duration-300 w-full sm:w-auto ${
                            isProfileSaved 
                              ? 'bg-[#FAF6F1] border-[#E8DFD3] text-[#B0A395] cursor-not-allowed'
                              : 'bg-[#3E2F1C] border-[#3E2F1C] text-white hover:bg-[#A0522D] hover:border-[#A0522D] shadow-md'
                          }`}
                        >
                          {isProfileSaved ? 'Saved' : 'Save All Settings'}
                        </button>

                        <div className="mt-16 pt-8 border-t border-red-100">
                          <h4 className="text-sm font-bold uppercase tracking-widest text-red-500 mb-2">Danger Zone</h4>
                          <p className="text-xs text-[#8B7D6B] mb-4">Permanently delete your account and remove all personal data. This cannot be undone.</p>
                          <button 
                            type="button"
                            onClick={() => { setDeletePopupOpen(true); setDeleteStep('warning'); setDeleteOtp(''); }}
                            className="text-xs font-bold uppercase tracking-widest text-red-500 border-2 border-red-200 px-6 py-3 rounded-xl hover:bg-red-50 hover:border-red-300 transition-all duration-300"
                          >
                            Delete Account
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                )}
                
              </div>
            </div>
          </div>
        )}

        {/* LOGIN / AUTH MODAL */}
        {loginOpen && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 md:p-6">
            <div className="absolute inset-0 bg-[#3E2F1C]/40 backdrop-blur-sm" onClick={() => setLoginOpen(false)} />
            
            <div className="relative w-full max-w-[440px] bg-white rounded-[2rem] shadow-2xl overflow-y-auto max-h-[90vh] animate-in zoom-in-95 duration-300">
              <button onClick={() => setLoginOpen(false)} className="absolute top-6 right-6 p-2 text-[#8B7D6B] hover:bg-[#FAF6F1] rounded-full transition-colors z-10">
                <X className="w-5 h-5" />
              </button>
              
              <div className="p-8 md:p-10">
                <div className="text-center mb-8">
                  <h3 className="text-3xl text-[#3E2F1C] mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                    {loginTab === 'signin' ? 'Welcome Back' : 
                     loginTab === 'register' ? 'Create Account' : 
                     loginTab === '2fa-otp' ? 'Security Check' : 
                     'Password Reset'}
                  </h3>
                  <p className="text-sm text-[#8B7D6B]">
                    {loginTab === 'signin' ? 'Sign in to access your wishlist and orders.' : 
                     loginTab === 'register' ? 'Join the community for a personalized experience.' : 
                     loginTab === '2fa-otp' ? 'Please verify your identity to continue securely.' : 
                     'Securely recover your account access.'}
                  </p>
                </div>
                
                {(loginTab === 'signin' || loginTab === 'register') && (
                  <div className="flex p-1 bg-[#FAF6F1] rounded-full mb-8">
                    <button 
                      onClick={() => setLoginTab('signin')} 
                      className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-widest rounded-full transition-all ${loginTab === 'signin' ? 'bg-white text-[#3E2F1C] shadow-sm' : 'text-[#8B7D6B] hover:text-[#3E2F1C]'}`}
                    >
                      Sign In
                    </button>
                    <button 
                      onClick={() => setLoginTab('register')} 
                      className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-widest rounded-full transition-all ${loginTab === 'register' ? 'bg-white text-[#3E2F1C] shadow-sm' : 'text-[#8B7D6B] hover:text-[#3E2F1C]'}`}
                    >
                      Register
                    </button>
                  </div>
                )}

                {(loginTab === 'signin' || loginTab === 'register') && (
                  <>
                    <div className="space-y-3 mb-8">
                      <button onClick={handleGoogleLogin} className="w-full flex items-center justify-center gap-3 py-3 border-2 border-[#E8DFD3] rounded-xl text-sm font-semibold text-[#3E2F1C] hover:bg-[#FAF6F1] hover:border-[#3E2F1C] transition-all">
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                        Continue with Google
                      </button>
                    </div>

                    <div className="flex items-center gap-4 mb-8">
                      <div className="flex-1 h-px bg-[#E8DFD3]" />
                      <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#B0A395]">Or use email</span>
                      <div className="flex-1 h-px bg-[#E8DFD3]" />
                    </div>
                  </>
                )}

                {/* Form Fields */}
                <div className="space-y-4">
                  {loginTab === 'register' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase tracking-widest font-bold text-[#8B7D6B] ml-1">First Name</label>
                        <input value={authFirstName} onChange={(e) => setAuthFirstName(e.target.value)} placeholder="Jane" className="w-full px-4 py-3 bg-[#FAF6F1] border-2 border-transparent rounded-xl outline-none focus:bg-white focus:border-[#A0522D] text-sm transition-all" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase tracking-widest font-bold text-[#8B7D6B] ml-1">Last Name</label>
                        <input value={authLastName} onChange={(e) => setAuthLastName(e.target.value)} placeholder="Doe" className="w-full px-4 py-3 bg-[#FAF6F1] border-2 border-transparent rounded-xl outline-none focus:bg-white focus:border-[#A0522D] text-sm transition-all" />
                      </div>
                    </div>
                  )}
                  
                  {(loginTab === 'signin' || loginTab === 'register') && (
                    <>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase tracking-widest font-bold text-[#8B7D6B] ml-1">Email Address</label>
                        <input value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} placeholder="hello@example.com" className="w-full px-4 py-3 bg-[#FAF6F1] border-2 border-transparent rounded-xl outline-none focus:bg-white focus:border-[#A0522D] text-sm transition-all" />
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] uppercase tracking-widest font-bold text-[#8B7D6B] ml-1">Password</label>
                          {loginTab === 'signin' && <button onClick={() => setLoginTab('forgot')} className="text-[10px] font-bold uppercase tracking-widest text-[#A0522D] hover:underline">Forgot?</button>}
                        </div>
                        <input type="password" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} placeholder="••••••••" className="w-full px-4 py-3 bg-[#FAF6F1] border-2 border-transparent rounded-xl outline-none focus:bg-white focus:border-[#A0522D] text-sm transition-all" />
                      </div>

                      <button 
                        onClick={() => handleAuth(loginTab)} 
                        className="w-full bg-[#3E2F1C] text-white py-4 rounded-xl font-bold tracking-[0.2em] uppercase hover:bg-[#A0522D] transition-all shadow-lg shadow-[#3E2F1C]/10 mt-4"
                      >
                        {loginTab === 'signin' ? 'Sign In' : 'Create Account'}
                      </button>
                    </>
                  )}

                  {/* 1. FORGOT PASSWORD STEP */}
                  {loginTab === 'forgot' && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                      <p className="text-sm text-[#8B7D6B] mb-4 text-center">Enter your email and we'll send you a 6-digit code.</p>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase tracking-widest font-bold text-[#8B7D6B] ml-1">Email Address</label>
                        <input value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} placeholder="hello@example.com" className="w-full px-4 py-3 bg-[#FAF6F1] border-2 border-transparent rounded-xl outline-none focus:bg-white focus:border-[#A0522D] text-sm transition-all" />
                      </div>
                      <button onClick={handleForgotPassword} className="w-full bg-[#3E2F1C] text-white py-4 rounded-xl font-bold tracking-widest uppercase hover:bg-[#A0522D] transition-all mt-4">Send Code</button>
                      <button onClick={() => setLoginTab('signin')} className="w-full mt-4 text-xs font-bold text-[#8B7D6B] uppercase tracking-widest hover:text-[#3E2F1C]">Back to Sign In</button>
                    </div>
                  )}

                  {/* 2. OTP VERIFICATION STEP */}
                  {loginTab === 'otp' && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                      <p className="text-sm text-[#8B7D6B] mb-4 text-center">Enter the 6-digit code sent to {forgotEmail}.</p>
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] uppercase tracking-widest font-bold text-[#8B7D6B] ml-1">6-Digit Code</label>
                          <span className={`text-[10px] font-bold tracking-widest ${otpTimer < 60 ? 'text-red-500 animate-pulse' : 'text-[#A0522D]'}`}>
                            {formatTime(otpTimer)}
                          </span>
                        </div>
                        <input value={otpCode} onChange={(e) => setOtpCode(e.target.value)} placeholder="123456" className="w-full px-4 py-3 bg-[#FAF6F1] border-2 border-transparent rounded-xl outline-none focus:bg-white focus:border-[#A0522D] text-center text-lg tracking-[0.5em] font-bold transition-all" maxLength="6" />
                      </div>
                      <button onClick={handleVerifyOtp} className="w-full bg-[#3E2F1C] text-white py-4 rounded-xl font-bold tracking-widest uppercase hover:bg-[#A0522D] transition-all mt-4">Verify Code</button>
                    </div>
                  )}

                  {/* 3. NEW PASSWORD STEP */}
                  {loginTab === 'reset' && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                      <p className="text-sm text-[#8B7D6B] mb-4 text-center">Almost done! Create a new password.</p>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase tracking-widest font-bold text-[#8B7D6B] ml-1">New Password</label>
                        <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" className="w-full px-4 py-3 bg-[#FAF6F1] border-2 border-transparent rounded-xl outline-none focus:bg-white focus:border-[#A0522D] text-sm transition-all" />
                      </div>
                      <button onClick={handleResetPassword} className="w-full bg-[#3E2F1C] text-white py-4 rounded-xl font-bold tracking-widest uppercase hover:bg-[#A0522D] transition-all mt-4">Update Password</button>
                    </div>
                  )}

                  {/* TWO-FACTOR AUTHENTICATION STEP */}
                  {loginTab === '2fa-otp' && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                      <p className="text-sm text-[#8B7D6B] mb-4 text-center">To protect your account, please enter the 6-digit code sent to <strong>{authEmail}</strong>.</p>
                      
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] uppercase tracking-widest font-bold text-[#8B7D6B] ml-1">6-Digit Code</label>
                          <span className={`text-[10px] font-bold tracking-widest ${otpTimer < 60 ? 'text-red-500 animate-pulse' : 'text-[#A0522D]'}`}>
                            {formatTime(otpTimer)}
                          </span>
                        </div>
                        <input 
                          value={otpCode} 
                          onChange={(e) => setOtpCode(e.target.value)} 
                          placeholder="123456" 
                          className="w-full px-4 py-3 bg-[#FAF6F1] border-2 border-transparent rounded-xl outline-none focus:bg-white focus:border-[#A0522D] text-center text-lg tracking-[0.5em] font-bold transition-all" 
                          maxLength="6" 
                        />
                      </div>

                      <button onClick={handleVerify2FA} className="w-full bg-[#3E2F1C] text-white py-4 rounded-xl font-bold tracking-widest uppercase hover:bg-[#A0522D] transition-all mt-4 shadow-md">
                        Verify & Sign In
                      </button>
                      <button onClick={() => setLoginTab('signin')} className="w-full mt-4 text-xs font-bold text-[#8B7D6B] uppercase tracking-widest hover:text-[#3E2F1C]">
                        Cancel
                      </button>
                    </div>
                  )}

                </div>

                <p className="text-[10px] text-[#B0A395] text-center mt-8 leading-relaxed px-4">
                  By continuing, you agree to our 
                  <button onClick={() => { setLoginOpen(false); go('terms'); }} className="text-[#A0522D] font-bold hover:underline mx-1">Terms of Service</button> 
                  and 
                  <button onClick={() => { setLoginOpen(false); go('terms'); }} className="text-[#A0522D] font-bold hover:underline mx-1">Privacy Policy</button>.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {pg === 'terms' && (
          <div className="max-w-4xl mx-auto px-5 md:px-8 py-16 md:py-24 animate-in fade-in duration-500">
            <button 
              onClick={() => go('home')} 
              className="text-xs text-[#8B7D6B] mb-8 hover:text-[#A0522D] flex items-center gap-1 transition-colors font-medium uppercase tracking-widest"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Back to Home
            </button>

            <h1 className="text-3xl md:text-5xl text-[#3E2F1C] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>Terms & Privacy</h1>
            <p className="text-[#8B7D6B] mb-12 border-b border-[#E8DFD3] pb-8">Last Updated: April 2026</p>

            <div className="space-y-12 text-[#3E2F1C]">
              <section>
                <h2 className="text-lg font-bold uppercase tracking-widest mb-4">1. Data Collection & Usage</h2>
                <p className="leading-relaxed mb-4 text-sm md:text-base">
                  When you use Beaded by Unknown, we collect information to provide a personalized shopping experience. This includes:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-sm text-[#5A4A3A]">
                  <li><strong>Account Info:</strong> Name and email via Google or Email registration to manage your profile.</li>
                  <li><strong>Sync Data:</strong> We store your Cart and Wishlist items in our database (MongoDB) so you can access them across different devices.</li>
                  <li><strong>Payment Info:</strong> We do not store credit card details. All payments are processed securely via <strong>PayMongo</strong>.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-lg font-bold uppercase tracking-widest mb-4">2. Product Disclaimer</h2>
                <p className="leading-relaxed text-sm md:text-base">
                  Our bracelets are handcrafted using natural gemstones. Because these are products of the earth, subtle variations in color, shape, and size are to be expected. These are not flaws, but rather the unique "fingerprint" of your specific piece.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-bold uppercase tracking-widest mb-4">3. Shipping & Orders</h2>
                <p className="leading-relaxed text-sm md:text-base">
                  Each piece is carefully handcrafted. Items are currently available for 
                  <span className="font-semibold"> Pre-order (7-14 days)</span> and will be 
                  shipped via <span className="font-semibold">J&T Express</span>. 
                  Once a custom bracelet has been started, we cannot accept cancellations. 
                  Please ensure your wrist measurement is accurate according to our Size Guide.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-bold uppercase tracking-widest mb-4">4. Intellectual Property</h2>
                <p className="leading-relaxed text-sm md:text-base">
                  All designs, photography, and journal content on this website are the property of Beaded by Unknown. Unauthorized use or reproduction is prohibited.
                </p>
              </section>

              <div className="bg-[#FAF6F1] p-8 rounded-2xl border border-[#E8DFD3] text-center">
                <p className="text-sm italic text-[#8B7D6B]">
                  Questions regarding our terms? Contact us at <strong>beadedbyunknown@gmail.com</strong>
                </p>
              </div>
            </div>
          </div>
        )}

      </main>

      {pg !== 'checkout' && pg !== 'confirmation' && (
        <nav className="md:hidden fixed bottom-0 w-full bg-white border-t border-[#E8DFD3] flex z-40 pb-safe">
          {[
            { icon: <Home className="w-5 h-5" />, label: 'Home', p: 'home' },
            { icon: <Search className="w-5 h-5" />, label: 'Search', p: 'search' },
            { icon: <Heart className="w-5 h-5" />, label: 'Wishlist', p: 'wishlist' },
            { icon: <User className="w-5 h-5" />, label: 'Account', p: 'account' },
          ].map(tab => (
            <button key={tab.p} onClick={() => {
            if (tab.p === 'search') return setSearchOpen(true);
            if (tab.p === 'account') return logged ? go('account') : setLoginOpen(true);
            go(tab.p);
          }} className={`flex-1 flex flex-col items-center py-2.5 ${pg === tab.p ? 'text-[#A0522D]' : 'text-[#8B7D6B]'}`}>
              {tab.icon}
              <span className="text-[9px] mt-0.5">{tab.label}</span>
            </button>
          ))}
        </nav>
      )}

      {menuOpen && (
        <div className="md:hidden fixed inset-0 z-[60]">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMenuOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-[280px] bg-[#FAF6F1] shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-5 py-5 border-b border-[#E8DFD3]">
              <span className="text-sm tracking-[0.15em] uppercase" style={{ fontFamily: 'Playfair Display, serif' }}>beadedbyunknown</span>
              <button onClick={() => setMenuOpen(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 py-4">
              {[{ l: 'Shop All', p: 'collection' }, { l: 'Customize', p: 'customizer' }, { l: 'Our Story', p: 'about' }].map(item => (
                <button key={item.p} onClick={() => go(item.p)} className="w-full text-left px-6 py-3.5 text-[15px] text-[#3E2F1C] hover:bg-[#F0EBE4] transition-colors">{item.l}</button>
              ))}
            </div>
          </div>
        </div>
      )}

      {cartOpen && (
        <div className="fixed inset-0 z-[60]">
          <div className="absolute inset-0 bg-black/30" onClick={() => setCartOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-[340px] md:max-w-[420px] bg-white shadow-2xl flex flex-col">
            
            <div className="flex items-center justify-between px-5 md:px-6 py-4 md:py-5 border-b border-[#E8DFD3]">
              <div className="flex items-center gap-4">
                <h3 className="text-lg font-semibold" style={{ fontFamily: 'Playfair Display, serif' }}>Cart ({cCount})</h3>
                
                {cart.length > 0 && (
                  <button 
                    onClick={() => { setCart([]); flash('Cart cleared', 'info'); }} 
                    className="text-[10px] uppercase tracking-widest text-[#8B7D6B] hover:text-[#B85C5C] font-bold flex items-center gap-1 transition-colors mt-0.5"
                  >
                    <Trash2 className="w-3 h-3" /> Clear
                  </button>
                )}
              </div>
              <button onClick={() => setCartOpen(false)} className="p-1 hover:bg-[#F0EBE4] rounded-full"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto px-5 md:px-6 py-3 md:py-4">
              {cart.length === 0 ? (
                <div className="py-12 md:py-16 text-center">
                  <ShoppingBag className="w-10 h-10 md:w-12 md:h-12 text-[#E8DFD3] mx-auto mb-3 md:mb-4" />
                  <p className="text-sm md:text-base" style={{ fontFamily: 'Playfair Display, serif' }}>Cart is empty</p>
                  <button onClick={() => { setCartOpen(false); go('collection'); }} className="text-xs md:text-sm text-[#A0522D] underline mt-2 md:mt-4">Shop Now</button>
                </div>
              ) : (
                cart.map(it => {
                  const uniqueId = it._id || it.id || it.name;
                  return (
                    <div key={uniqueId} className="flex gap-3 md:gap-4 py-3 md:py-4 border-b border-[#E8DFD3]">
                      <div className="w-14 h-14 md:w-16 md:h-16 rounded md:rounded-lg bg-[#F0EBE4] overflow-hidden shrink-0">
                        <img src={it.img} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between">
                          <div>
                            <p className="text-sm font-medium truncate">{it.name}</p>
                            <p className="text-[10px] md:text-xs text-[#8B7D6B]">Size {it.sz}</p>
                          </div>
                          <button onClick={() => rmCart(uniqueId)} className="p-1 text-[#B0A395] hover:text-[#B85C5C]">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="flex items-center justify-between mt-1.5 md:mt-2">
                          <div className="inline-flex items-center border border-[#E8DFD3] rounded">
                            <button onClick={() => updQty(uniqueId, -1)} className="w-7 h-7 flex items-center justify-center hover:bg-[#F0EBE4]"><Minus className="w-3 h-3" /></button>
                            <span className="w-7 h-7 flex items-center justify-center text-[11px] md:text-xs font-medium border-x border-[#E8DFD3]">{it.qty}</span>
                            <button onClick={() => updQty(uniqueId, 1)} className="w-7 h-7 flex items-center justify-center hover:bg-[#F0EBE4]"><Plus className="w-3 h-3" /></button>
                          </div>
                          <span className="text-sm font-semibold">₱{it.price * it.qty}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {cart.length > 0 && (
              <div className="px-5 md:px-6 py-4 md:py-5 border-t border-[#E8DFD3]">
                {cTotal < 500 && (
                  <div className="mb-3 md:mb-4">
                    <p className="text-[10px] md:text-xs text-[#8B7D6B] mb-1">₱{500 - cTotal} away from free shipping!</p>
                    <div className="bg-[#F0EBE4] rounded-full h-1.5">
                      <div className="bg-[#7A8B6F] h-full rounded-full" style={{ width: `${(cTotal / 500) * 100}%` }} />
                    </div>
                  </div>
                )}
                {cTotal >= 500 && (
                  <div className="mb-3 md:mb-4">
                    <p className="text-[10px] md:text-xs text-[#7A8B6F] font-bold tracking-widest uppercase mb-1">✓ You unlocked free shipping!</p>
                  </div>
                )}
                <div className="flex justify-between mb-3 md:mb-4">
                  <span className="text-sm text-[#8B7D6B]">Subtotal</span>
                  <span className="text-lg font-bold">₱{cTotal}</span>
                </div>
                <button 
                  onClick={() => { 
                    setCartOpen(false); 
                    setChkStep(1); 
                    
                    if (logged) {
                      setCheckoutForm(prev => ({
                        ...prev,
                        firstName: logged.firstName || '',
                        lastName: logged.lastName || '',
                        email: logged.email || '',
                        phone: logged.phone || '',
                        street: logged.shippingAddress?.street || '',
                        barangay: logged.shippingAddress?.barangay || '',
                        city: logged.shippingAddress?.city || '',
                        province: logged.shippingAddress?.province || '',
                        postalCode: logged.shippingAddress?.postalCode || ''
                      }));
                      if (logged.shippingAddress?.region) {
                         setShippingRegion(logged.shippingAddress.region);
                      }
                    }
                    
                    go('checkout'); 
                  }} 
                  className="w-full bg-[#A0522D] text-[#FAF6F1] text-xs md:text-sm tracking-[0.1em] md:tracking-[0.15em] uppercase py-3.5 md:py-4 hover:bg-[#8B4526] font-semibold mb-2"
                >
                  Checkout
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {qvId && (() => {
        const p = P.find(item => (item._id || item.id || item.name) === qvId);
        if (!p) return null;
        
        const productSizes = Array.isArray(p.sizes) && p.sizes.length > 0 
          ? p.sizes 
          : (typeof p.sizes === 'string' ? p.sizes.split(',').map(s => s.trim()) : ['S', 'M', 'L']);

        return (
          <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 md:p-6">
            <div className="absolute inset-0 bg-[#3E2F1C]/50 backdrop-blur-sm" onClick={() => setQvId(null)} />
            
            <div className="relative w-full max-w-[850px] bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col md:flex-row max-h-[90vh] md:max-h-[600px]">
              
              <button 
                onClick={() => setQvId(null)} 
                className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm hover:bg-white text-[#3E2F1C] rounded-full transition-colors z-20 shadow-sm"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-full md:w-1/2 aspect-square md:aspect-auto bg-[#F0EBE4] relative shrink-0">
                <img src={p.img} alt={p.name} className="w-full h-full object-cover md:absolute md:inset-0" />
                {p.tag && <span className="absolute top-4 left-4 bg-[#3E2F1C] text-[#FAF6F1] text-[10px] tracking-[0.15em] uppercase px-3 py-1 z-10">{p.tag}</span>}
              </div>

              <div className="w-full md:w-1/2 p-6 md:p-10 overflow-y-auto flex flex-col bg-[#FAF6F1] md:bg-white">
                <h2 className="text-[24px] md:text-[32px] text-[#3E2F1C] mb-2 leading-tight" style={{ fontFamily: 'Playfair Display, serif' }}>{p.name}</h2>
                <p className="text-xl font-bold text-[#3E2F1C] mb-4 border-b border-[#E8DFD3] pb-4">₱{p.price}</p>
                
                <p className="text-sm text-[#8B7D6B] mb-8 leading-relaxed">
                  Handcrafted {p.mat || 'quality'} beads. A beautiful piece designed to bring intention and grounded energy to your daily journey.
                </p>

                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[10px] uppercase tracking-widest font-bold text-[#8B7D6B]">Select Size</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {productSizes.map(s => (
                      <button 
                        key={s} 
                        onClick={() => setSelSz(s)} 
                        className={`w-11 h-11 text-xs font-medium transition-all ${selSz === s ? 'bg-[#3E2F1C] text-[#FAF6F1]' : 'bg-[#F0EBE4] text-[#3E2F1C] hover:bg-[#E8DFD3]'}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-8">
                  <p className="text-[10px] uppercase tracking-widest font-bold text-[#8B7D6B] mb-3">Quantity</p>
                  <div className="inline-flex items-center border border-[#E8DFD3] bg-white">
                    <button onClick={() => setQty(prev => Math.max(1, prev - 1))} className="w-11 h-11 flex items-center justify-center hover:bg-[#F0EBE4]"><Minus className="w-3.5 h-3.5" /></button>
                    <span className="w-11 h-11 flex items-center justify-center text-sm font-medium border-x border-[#E8DFD3]">{qty}</span>
                    <button onClick={() => setQty(prev => prev + 1)} className="w-11 h-11 flex items-center justify-center hover:bg-[#F0EBE4]"><Plus className="w-3.5 h-3.5" /></button>
                  </div>
                </div>

                <div className="mt-auto flex flex-col gap-3 pt-4">
                  <button 
                    onClick={() => { 
                      addCart(p); 
                      setQvId(null); 
                    }} 
                    className="w-full bg-[#A0522D] text-[#FAF6F1] text-xs tracking-[0.15em] uppercase py-4 hover:bg-[#8B4526] font-semibold transition-colors shadow-md"
                  >
                    Add to Cart — ₱{p.price * qty}
                  </button>
                  
                  <button 
                    onClick={() => { 
                      setQvId(null); 
                      go('product', p); 
                    }} 
                    className="w-full border border-[#E8DFD3] bg-white text-[#3E2F1C] text-xs tracking-[0.15em] uppercase py-4 hover:bg-[#F0EBE4] font-semibold transition-colors"
                  >
                    View Full Details
                  </button>
                </div>

              </div>
            </div>
          </div>
        );
      })()}

      {searchOpen && (
        <div className="fixed inset-0 z-[80] bg-[#FAF6F1] md:bg-[#3E2F1C]/40 md:backdrop-blur-sm flex flex-col">
          <div className="hidden md:block absolute inset-0" onClick={() => { setSearchOpen(false); setSearchQ(''); }} />
          
          <div className="relative w-full bg-white md:rounded-b-3xl shadow-2xl flex-shrink-0 animate-in slide-in-from-top-4 duration-300">
            <div className="max-w-[800px] mx-auto px-5 md:px-8 py-4 md:py-8">
              
              <div className="flex items-center gap-3 md:gap-4 border-b-2 border-[#3E2F1C] pb-3 mb-2 md:mb-6 transition-colors">
                <Search className="w-5 h-5 md:w-6 md:h-6 text-[#3E2F1C]" />
                <input 
                  value={searchQ} 
                  onChange={(e) => setSearchQ(e.target.value)} 
                  placeholder="Search stones, styles, or materials..." 
                  className="flex-1 text-base md:text-xl outline-none bg-transparent placeholder:text-[#B0A395] text-[#3E2F1C]" 
                  autoFocus 
                />
                <button onClick={() => { setSearchOpen(false); setSearchQ(''); }} className="p-1 rounded-full hover:bg-[#F0EBE4] transition-colors">
                  <X className="w-6 h-6 text-[#3E2F1C]" />
                </button>
              </div>

              {searchQ.trim() && (
                <div className="max-h-[65vh] overflow-y-auto pt-2 pb-6 md:pb-2">
                  {searchResults.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
                      {searchResults.map(p => (
                        <div 
                          key={p._id || p.id} 
                          onClick={() => { go('product', p); setSearchOpen(false); setSearchQ(''); }}
                          className="flex items-center gap-4 p-3 bg-white hover:bg-[#FAF6F1] rounded-xl cursor-pointer transition-all border border-transparent hover:border-[#E8DFD3] group"
                        >
                          <img src={p.img} alt={p.name} className="w-14 h-14 md:w-16 md:h-16 rounded-lg object-cover bg-[#F0EBE4]" />
                          <div className="flex-1">
                            <h4 className="text-sm font-bold text-[#3E2F1C] group-hover:text-[#A0522D] transition-colors">{p.name}</h4>
                            <p className="text-xs text-[#8B7D6B] mt-0.5">₱{p.price} • {p.mat || p.cat}</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-[#B0A395] mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 md:py-16 text-[#8B7D6B]">
                      <Search className="w-10 h-10 mx-auto mb-4 text-[#E8DFD3]" />
                      <p className="text-base md:text-lg" style={{ fontFamily: 'Playfair Display, serif' }}>
                        No results found for "{searchQ}"
                      </p>
                      <p className="text-sm mt-2">Try searching for "Rose Quartz", "Wood", or "Gold".</p>
                    </div>
                  )}
                </div>
              )}
              
            </div>
          </div>
        </div>
      )}

    {/* LOGOUT CONFIRMATION MODAL */}
      {logoutPopupOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#3E2F1C]/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-200 border border-[#E8DFD3]">
            <h3 className="text-xl font-bold text-[#3E2F1C] mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
              Sign Out?
            </h3>
            <p className="text-sm text-[#8B7D6B] mb-8 leading-relaxed">
              Are you sure you want to sign out of your account? Your cart and wishlist are safely saved.
            </p>
            
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setLogoutPopupOpen(false)} 
                className="px-5 py-2.5 text-sm font-bold text-[#3E2F1C] bg-[#FAF6F1] rounded-xl hover:bg-[#E8DFD3] transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  setLogged(false); 
                  setCart([]);
                  setWish([]);
                  localStorage.removeItem('beaded_token'); 
                  setLogoutPopupOpen(false);
                  go('home'); 
                }} 
                className="px-5 py-2.5 text-sm font-bold text-white rounded-xl bg-red-500 hover:bg-red-600 transition-colors shadow-md"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE ACCOUNT MODAL */}
      {deletePopupOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#3E2F1C]/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-200 border border-red-100">
            
            {deleteStep === 'warning' ? (
              <>
                <h3 className="text-xl font-bold text-red-600 mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Delete Account?
                </h3>
                <p className="text-sm text-[#8B7D6B] mb-6 leading-relaxed">
                  Are you absolutely sure? You will permanently lose access to your order history, wishlist, and saved addresses.
                </p>
                <div className="flex gap-3 justify-end mt-4">
                  <button onClick={() => setDeletePopupOpen(false)} className="flex-1 py-3 text-sm font-bold text-[#3E2F1C] bg-[#FAF6F1] rounded-xl hover:bg-[#E8DFD3] transition-colors">
                    Cancel
                  </button>
                  <button onClick={handleRequestDelete} className="flex-1 py-3 text-sm font-bold text-white rounded-xl bg-red-600 hover:bg-red-700 transition-colors shadow-md">
                    Yes, Send Code
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-xl font-bold text-[#3E2F1C] mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Final Verification
                </h3>
                <p className="text-xs text-[#8B7D6B] mb-6 leading-relaxed">
                  To confirm deletion, please enter the 6-digit code sent to your email.
                </p>
                
                <div className="space-y-1 mb-6">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-[#8B7D6B] ml-1">6-Digit Code</label>
                    <span className={`text-[10px] font-bold tracking-widest ${otpTimer < 60 ? 'text-red-500 animate-pulse' : 'text-red-500'}`}>
                      {formatTime(otpTimer)}
                    </span>
                  </div>
                  <input 
                    value={deleteOtp} 
                    onChange={(e) => setDeleteOtp(e.target.value)} 
                    placeholder="123456" 
                    className="w-full px-4 py-3 bg-red-50 border-2 border-red-100 rounded-xl outline-none focus:bg-white focus:border-red-400 text-center text-lg tracking-[0.5em] font-bold transition-all text-red-600" 
                    maxLength="6" 
                  />
                </div>

                <div className="flex flex-col gap-3">
                  <button onClick={handleConfirmDelete} className="w-full py-3.5 text-sm font-bold text-white rounded-xl bg-red-600 hover:bg-red-700 transition-colors shadow-md uppercase tracking-widest">
                    Permanently Delete
                  </button>
                  <button onClick={() => setDeletePopupOpen(false)} className="w-full py-2 text-xs font-bold text-[#8B7D6B] uppercase tracking-widest hover:text-[#3E2F1C]">
                    Cancel & Keep Account
                  </button>
                </div>
              </>
            )}
            
          </div>
        </div>
      )}

    </div>
  );
}

export default App;