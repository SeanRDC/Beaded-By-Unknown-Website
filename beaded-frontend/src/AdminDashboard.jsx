import { useState, useEffect } from 'react';
import { Tags, Menu, LayoutDashboard, Package, Plus, Trash2, Edit2, TrendingUp, ShoppingBag, X, KeyRound, Wifi, WifiOff, Settings as SettingsIcon, MessageSquare, BookOpen, Search, Palette, Mail, Lock } from 'lucide-react';

export default function AdminDashboard() {
  
  // --- STATE VARIABLES ---

  // UI & Layout State
  const [activeTab, setActiveTab] = useState('overview'); 
  const [serverStatus, setServerStatus] = useState('checking'); 
  const [adminName, setAdminName] = useState(localStorage.getItem('beaded_admin_name') || 'Iyesha');
  const [secretKey, setSecretKey] = useState(sessionStorage.getItem('beaded_admin_key') || '');
  const [isLocked, setIsLocked] = useState(!sessionStorage.getItem('beaded_admin_key'));
  const [status, setStatus] = useState('');
  const [editId, setEditId] = useState(null);
  const [editBlogId, setEditBlogId] = useState(null);
  
  // Pop up state
  const [popup, setPopup] = useState({
    isOpen: false,
    title: '',
    message: '',
    isConfirm: false,
    onConfirm: null
  });

  // Data State
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({ revenue: 0, totalOrders: 0 });
  const [reviews, setReviews] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [customOrders, setCustomOrders] = useState([]);

  // Forms State
  const [reviewForm, setReviewForm] = useState({ author: '', text: '', rating: 5 });
  const [blogForm, setBlogForm] = useState({ 
    title: '', ex: '', content: '', cat: 'Journal', time: '5 min', img: '' 
  });
  const [product, setProduct] = useState({
    name: '', price: '', img: '', img2: '', cat: 'Gemstone', mat: '', tag: '', colors: '', sizes: 'S, M, L'
  });

  // Settings State
  const [bannerText, setBannerText] = useState('WELCOME');
  const [featureOne, setFeatureOne] = useState('Free shipping over ₱50');
  const [featureTwo, setFeatureTwo] = useState('Handmade');
  const [featureThree, setFeatureThree] = useState('Ethically sourced');
  const [siteTheme, setSiteTheme] = useState(localStorage.getItem('beaded_theme') || 'brown');

  // Mobile Menu State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Categories specific state
  const [shopCategories, setShopCategories] = useState(['Plastic', 'Gemstone', 'Glass']);
  const [newCategory, setNewCategory] = useState('');

  // --- FETCHERS ---

  const fetchAllData = async () => {
    try {
      const prodRes = await fetch('https://beaded-by-unknown.onrender.com/api/products');
      if (prodRes.ok) {
        const prodData = await prodRes.json();
        if (Array.isArray(prodData)) setProducts(prodData);
        setServerStatus('online'); 
      } else {
        setServerStatus('offline');
      }

      const blogRes = await fetch('https://beaded-by-unknown.onrender.com/api/blogs');
      if (blogRes.ok) {
        const blogData = await blogRes.json();
        if (Array.isArray(blogData)) setBlogs(blogData);
      }

      const revRes = await fetch('https://beaded-by-unknown.onrender.com/api/reviews');
      if (revRes.ok) {
        const revData = await revRes.json();
        if (Array.isArray(revData)) setReviews(revData);
      }
    } catch (err) {
      setServerStatus('offline');
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch('https://beaded-by-unknown.onrender.com/api/settings');
      const data = await res.json();
      if (data) {
        if (data.topBannerText) setBannerText(data.topBannerText);
        if (data.featureOne) setFeatureOne(data.featureOne);
        if (data.featureTwo) setFeatureTwo(data.featureTwo);
        if (data.featureThree) setFeatureThree(data.featureThree);
        if (data.categories) setShopCategories(data.categories);
      }
    } catch (err) {}
  };

  const fetchStats = async () => { 
    if (!secretKey) return; 
    try {
      const res = await fetch(`https://beaded-by-unknown.onrender.com/api/admin/stats`, {
        headers: {
          'admin_secret': secretKey
        }
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error("Stats fetch error:", err);
    }
  };

  const fetchOrders = async () => {
    if (!secretKey) return; 
    try {
      const res = await fetch(`https://beaded-by-unknown.onrender.com/api/admin/orders`, {
        headers: { 'admin_secret': secretKey }
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error("Orders fetch error:", err);
    }
  };

  // --- EFFECTS ---

  useEffect(() => {
    fetch('https://beaded-by-unknown.onrender.com/api/custom-orders')
      .then(res => {
        if (!res.ok) throw new Error('Backend route not ready');
        return res.json();
      })
      .then(data => setCustomOrders(data))
      .catch(err => console.log('Custom orders waiting on backend setup.'));
  }, []);

  useEffect(() => {
    fetchAllData();
    fetchSettings();
  }, []); 

  useEffect(() => {
    fetchStats();
    fetchOrders();
  }, [secretKey]); 

  // --- HANDLERS ---

  const handleUnlock = async (e) => {
    e.preventDefault();
    setStatus('Verifying key with server...');
    try {
      const res = await fetch(`https://beaded-by-unknown.onrender.com/api/admin/stats`, {
        headers: { 'admin_secret': secretKey }
      });
      
      if (res.ok) {
        sessionStorage.setItem('beaded_admin_key', secretKey);
        setIsLocked(false);
        setStatus('');
      } else {
        setStatus('Invalid Master Key');
        setSecretKey('');
      }
    } catch (err) {
      setStatus('Server Connection Error');
    }
  };

  const toggleAdminName = () => {
    const newName = adminName === 'Iyesha' ? 'Sean' : 'Iyesha';
    setAdminName(newName);
    localStorage.setItem('beaded_admin_name', newName);
  };

  const handleThemeChange = (theme) => {
    setSiteTheme(theme);
    localStorage.setItem('beaded_theme', theme);
  };

  const closePopup = () => setPopup({ ...popup, isOpen: false });

  const updateOrderStatus = async (orderId, newStatus) => {
    if (!secretKey) return;

    setOrders(prevOrders => 
      prevOrders.map(o => o._id === orderId ? { ...o, status: newStatus } : o)
    );

    try {
      const res = await fetch(`https://beaded-by-unknown.onrender.com/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'admin_secret': secretKey 
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (!res.ok) {
        fetchOrders(); 
        alert("Failed to update status");
      }
    } catch (err) {
      console.error("Status update error:", err);
      fetchOrders();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', product.name);
    formData.append('price', product.price);
    formData.append('cat', product.cat);
    formData.append('mat', product.mat || ''); 
    formData.append('tag', product.tag || '');

    if (product.imgFile) {
      formData.append('primaryImage', product.imgFile);
    } else if (editId) {
      formData.append('existingPrimaryImage', product.img);
    }

    if (product.secondaryImgFile) {
      formData.append('secondaryImage', product.secondaryImgFile);
    } else if (editId) {
      formData.append('existingSecondaryImage', product.img2);
    }

    try {
      const url = editId 
        ? `https://beaded-by-unknown.onrender.com/api/products/${editId}` 
        : `https://beaded-by-unknown.onrender.com/api/products`;

      const res = await fetch(url, {
        method: editId ? 'PUT' : 'POST',
        headers: { 'admin_secret': secretKey }, 
        body: formData, 
      });

      if (res.ok) {
        setStatus(editId ? 'Product updated successfully!' : 'Product added successfully!');
        
        setProduct({ 
          name: '', price: '', cat: 'Gemstone', img: '', img2: '',
          imgFile: null, secondaryImgFile: null,
          colors: [], sizes: ['S', 'M', 'L'], mat: '', tag: ''
        });
        
        setEditId(null); 
        fetchAllData(); 
        
        setTimeout(() => setStatus(''), 3000);
      } else {
        const errorData = await res.json();
        console.error("Backend Error:", errorData);
        setStatus(`Error: ${errorData.error || 'Failed to save'}`);
      }
    } catch (error) {
      console.error("Upload error:", error);
      setStatus('Server connection error.');
    }
  };

  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    if (!secretKey) return setStatus('❌ Admin Key Required.');
    setStatus('Updating Storefront...');
    try {
      const res = await fetch('https://beaded-by-unknown.onrender.com/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'admin_secret': secretKey },
        body: JSON.stringify({ 
          topBannerText: bannerText,
          featureOne: featureOne,
          featureTwo: featureTwo,
          featureThree: featureThree,
          theme: siteTheme,
          categories: shopCategories
        })
      });
      if (res.ok) {
        setStatus(`✅ Settings Updated!`);
        setTimeout(() => { setStatus(''); }, 2000);
      } else { setStatus(`❌ Error updating.`); }
    } catch (err) { setStatus('❌ Server error.'); }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!secretKey) return setStatus('❌ Admin Key Required.');
    setStatus('Adding Review...');
    try {
      const res = await fetch('https://beaded-by-unknown.onrender.com/api/admin/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'admin_secret': secretKey },
        body: JSON.stringify(reviewForm)
      });
      if (res.ok) {
        setStatus(`✅ Review Added!`);
        setReviewForm({ author: '', text: '', rating: 5 });
        fetchAllData();
        setTimeout(() => { setStatus(''); }, 2000);
      } else { setStatus(`❌ Error adding review.`); }
    } catch (err) { setStatus('❌ Server error.'); }
  };

  const handleBlogSubmit = async (e) => {
    e.preventDefault();
    if (!secretKey) return setStatus('❌ Admin Key Required.');
    setStatus('Saving Article...');

    const url = editBlogId ? `https://beaded-by-unknown.onrender.com/api/admin/blogs/${editBlogId}` : 'https://beaded-by-unknown.onrender.com/api/admin/blogs';
    const method = editBlogId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'admin_secret': secretKey },
        body: JSON.stringify(blogForm)
      });
      if (res.ok) {
        setStatus(`✅ Article ${editBlogId ? 'updated' : 'published'}!`);
        setBlogForm({ title: '', ex: '', content: '', cat: 'Journal', time: '5 min', img: '' });
        setEditBlogId(null);
        fetchAllData();
        setTimeout(() => setStatus(''), 2000);
      } else { setStatus('❌ Error saving article.'); }
    } catch (err) { setStatus('❌ Server error.'); }
  };

  const handleEditBlog = (b) => {
    setEditBlogId(b._id);
    setBlogForm({ title: b.title, ex: b.ex, content: b.content, cat: b.cat, time: b.time, img: b.img });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id, type = 'product') => {
    if (!secretKey) {
      return setPopup({
        isOpen: true,
        title: 'Access Denied',
        message: 'Admin Secret Key required.',
        isConfirm: false,
        onConfirm: null
      });
    }

    setPopup({
      isOpen: true,
      title: `Delete ${type.charAt(0).toUpperCase() + type.slice(1)}`, 
      message: `Are you sure you want to delete this ${type} permanently? This action cannot be undone.`,
      isConfirm: true,
      
      onConfirm: async () => {
        try {
          let url = `https://beaded-by-unknown.onrender.com/api/admin/products/${id}`;
          if (type === 'review') url = `https://beaded-by-unknown.onrender.com/api/admin/reviews/${id}`;
          if (type === 'blog') url = `https://beaded-by-unknown.onrender.com/api/admin/blogs/${id}`;

          const res = await fetch(url, { 
            method: 'DELETE', 
            headers: { 'admin_secret': secretKey } 
          });
          
          if (res.ok) {
            fetchAllData();
          } else {
            setPopup({
              isOpen: true,
              title: 'Error',
              message: 'Failed to delete. Check your admin key.',
              isConfirm: false,
              onConfirm: null
            });
          }
        } catch (err) { 
          setPopup({
            isOpen: true,
            title: 'Server Error',
            message: 'Could not connect to the backend server.',
            isConfirm: false,
            onConfirm: null
          });
        }
      }
    });
  };

  const toggleAvailability = async (id, currentStatus) => {
    const newStatus = currentStatus === false ? true : false; 
    
    try {
      await fetch(`https://beaded-by-unknown.onrender.com/api/products/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAvailable: newStatus })
      });

      setProducts(prevProducts => 
        prevProducts.map(p => 
          p._id === id ? { ...p, isAvailable: newStatus } : p
        )
      );
    } catch (err) {
      console.error("Failed to update availability:", err);
      alert("Error updating status.");
    }
  };

  const handleEditClick = (p) => {
    setEditId(p._id);
    setProduct({
      name: p.name || '',
      price: p.price || '',
      img: p.img || '',
      img2: p.img2 || '',
      cat: p.cat || 'Gemstone',
      mat: p.mat || '',
      tag: p.tag || '',
      colors: p.colors || [],
      sizes: p.sizes || ['S', 'M', 'L'],
      imgFile: null, 
      secondaryImgFile: null
    });

    setActiveTab('form');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const saveCategoryUpdate = async (updatedCategories) => {
    if (!secretKey) {
      setPopup({ isOpen: true, title: 'Access Denied', message: 'Admin Key Required to save categories.', isConfirm: false });
      return;
    }
    try {
      const res = await fetch('https://beaded-by-unknown.onrender.com/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'admin_secret': secretKey },
        body: JSON.stringify({ 
          topBannerText: bannerText, featureOne, featureTwo, featureThree, theme: siteTheme,
          categories: updatedCategories 
        })
      });
      if (res.ok) {
        setShopCategories(updatedCategories);
      }
    } catch (err) {
      console.error("Failed to save categories");
    }
  };

  const handleAddCategory = () => {
    if (newCategory.trim() && !shopCategories.includes(newCategory.trim())) {
      const updated = [...shopCategories, newCategory.trim()];
      saveCategoryUpdate(updated);
      setNewCategory('');
    }
  };

  const handleDeleteCategory = (catToRemove) => {
    const updated = shopCategories.filter(c => c !== catToRemove);
    saveCategoryUpdate(updated);
  };

  // --- SUB-COMPONENTS & HELPERS ---

  const NavButton = ({ id, icon: Icon, label }) => (
    <button 
      onClick={() => { 
        setActiveTab(id); 
        setIsMobileMenuOpen(false); 
        if(id === 'form') { 
          setEditId(null); 
          setProduct({ name: '', price: '', img: '', img2: '', cat: 'Gemstone', mat: '', tag: '', colors: [], sizes: ['S', 'M', 'L'] }); 
        } 
        setStatus(''); 
      }} 
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
        activeTab === id 
          ? 'bg-[#3E2F1C] text-white shadow-md' 
          : 'text-[#8B7D6B] hover:bg-[#FAF6F1] hover:text-[#3E2F1C]'
      }`}
    >
      <Icon className="w-5 h-5 shrink-0" />
      <span className="truncate">{label}</span>
    </button>
  );

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
        <span className="text-[#8B7D6B] font-medium ml-1.5">{num.toFixed(1)}</span>
      </div>
    );
  };

  const getSparklineData = () => {
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toLocaleDateString();
    }).reverse();

    const revenueData = last7Days.map(date => {
      return orders
        .filter(o => new Date(o.createdAt).toLocaleDateString() === date)
        .reduce((sum, o) => sum + (o.amountPaid || 0), 0);
    });

    const maxVal = Math.max(...revenueData, 20); 
    
    const points = revenueData.map((val, i) => ({
      x: i * (300 / 6),
      y: 60 - (val / maxVal * 45) - 10 
    }));

    let smoothPath = `M ${points[0].x},${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cpX = p0.x + (p1.x - p0.x) / 2; 
      smoothPath += ` C ${cpX},${p0.y} ${cpX},${p1.y} ${p1.x},${p1.y}`;
    }

    return { points, max: maxVal, smoothPath };
  };

  const chart = getSparklineData();

const updateCustomOrderStatus = async (orderId, newStatus) => {
    if (!secretKey) return alert("Admin Key required");
    
    setCustomOrders(prev => 
      prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o)
    );

    try {
      const res = await fetch(`https://beaded-by-unknown.onrender.com/api/admin/custom-orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'admin_secret': secretKey },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (!res.ok) {
        const updatedRes = await fetch('https://beaded-by-unknown.onrender.com/api/custom-orders');
        setCustomOrders(await updatedRes.json());
      }
    } catch(err) {
      console.error(err);
    }
  };

  // --- SECURITY LOCK SCREEN ---
  if (isLocked) {
    return (
      <div className="min-h-screen bg-[#FAF6F1] flex flex-col items-center justify-center p-4 font-sans">
        <div className="w-full max-w-md bg-white p-8 md:p-10 rounded-3xl shadow-2xl border border-[#E8DFD3] text-center animate-in zoom-in-95 duration-300">
          <div className="w-20 h-20 bg-[#FAF6F1] border border-[#E8DFD3] rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
            <Lock className="w-8 h-8 text-[#A0522D]" />
          </div>
          <h2 className="text-3xl text-[#3E2F1C] mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>Studio Access</h2>
          <p className="text-sm text-[#8B7D6B] mb-8 leading-relaxed">This area is highly restricted. Please enter the master studio key to proceed.</p>
          
          <form onSubmit={handleUnlock}>
            <input 
              type="password" 
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              placeholder="Master Key" 
              className="w-full px-4 py-4 bg-[#FAF6F1] border-2 border-transparent rounded-xl outline-none focus:bg-white focus:border-[#A0522D] text-center tracking-[0.3em] font-bold text-[#3E2F1C] transition-all mb-4 shadow-inner"
            />
            <button 
              type="submit"
              className="w-full bg-[#3E2F1C] text-white py-4 rounded-xl font-bold tracking-widest uppercase hover:bg-[#A0522D] transition-colors shadow-md"
            >
              Unlock Dashboard
            </button>
          </form>
          {status && <p className="mt-5 text-xs font-bold uppercase tracking-widest text-[#A0522D] animate-pulse">{status}</p>}
        </div>
      </div>
    );
  }

  // --- RENDER ---

  return (
    <div className="h-screen w-full flex bg-[#FAF6F1] text-[#3E2F1C] font-sans overflow-hidden">

      {/* DYNAMIC THEME ENGINE */}
      <style dangerouslySetInnerHTML={{__html: `
        :root {
          --primary: ${siteTheme === 'pink' ? '#D88A9A' : '#A0522D'};
          --dark: ${siteTheme === 'pink' ? '#5C434A' : '#3E2F1C'};
          --bg-light: ${siteTheme === 'pink' ? '#FFF5F7' : '#FAF6F1'};
        }
      `}} />
      
      {/* --- MOBILE MENU OVERLAY --- */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 z-[60] bg-[#3E2F1C]/40 backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* --- SIDEBAR (Slide-in on Mobile, Fixed on Desktop) --- */}
      <aside className={`fixed md:relative top-0 left-0 h-full w-64 bg-white border-r border-[#E8DFD3] z-[70] transform transition-transform duration-300 ease-in-out flex flex-col ${
        isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
      }`}>
        <div className="p-6 border-b border-[#E8DFD3] flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-widest uppercase" style={{ fontFamily: 'Playfair Display, serif' }}>
            BEADED <span className="font-light text-[#A0522D]">ADMIN</span>
          </h1>
          <button className="md:hidden text-[#8B7D6B] hover:text-[#3E2F1C]" onClick={() => setIsMobileMenuOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto scrollbar-hide">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#B0A395] mb-3 ml-2 mt-2">Dashboard</p>
          <NavButton id="overview" icon={LayoutDashboard} label="Overview & Sales" />
          <NavButton id="orders" icon={ShoppingBag} label="Orders" />
          <NavButton id="custom" icon={Palette} label="Custom Orders" /> 
          
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#B0A395] mb-3 ml-2 mt-6">Store Management</p>
          <NavButton id="inventory" icon={Package} label="Inventory Catalog" />
          <NavButton id="form" icon={Plus} label={editId ? 'Edit Product' : 'Add Product'} />
          <NavButton id="categories" icon={Tags} label="Categories" /> 
          
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#B0A395] mb-3 ml-2 mt-6">Content</p>
          <NavButton id="journal" icon={BookOpen} label="Journal Editor" /> 
          <NavButton id="community" icon={MessageSquare} label="Community Love" />
          <NavButton id="settings" icon={SettingsIcon} label="Store Settings" />
        </nav>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex-1 flex flex-col h-full relative overflow-hidden min-w-0 bg-[#Fdfbf9]">
        
        {/* HEADER */}
        <header className="bg-white border-b border-[#E8DFD3] px-4 md:px-8 h-16 flex items-center justify-between shrink-0 z-10 shadow-sm">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden p-2 -ml-2 text-[#3E2F1C] hover:bg-[#FAF6F1] rounded-lg transition-colors">
              <Menu className="w-6 h-6" />
            </button>
            <h2 onClick={toggleAdminName} className="text-lg md:text-xl font-bold cursor-pointer select-none text-[#3E2F1C] truncate" style={{ fontFamily: 'Playfair Display, serif' }}>
              Hello, {adminName} ✨
            </h2>
          </div>
          
          <div className="flex items-center gap-3">
            {/* System Status Ping */}
            <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
              serverStatus === 'online' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'
            }`}>
              {serverStatus === 'online' ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
              {serverStatus === 'online' ? 'System Live' : 'Offline'}
            </div>

            {/* Lock System Button */}
            <button 
              onClick={() => {
                sessionStorage.removeItem('beaded_admin_key');
                setSecretKey('');
                setIsLocked(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#FAF6F1] border border-[#E8DFD3] text-[#A0522D] hover:bg-[#A0522D] hover:text-white rounded-xl transition-all shadow-sm text-[10px] font-bold uppercase tracking-widest"
            >
              <Lock className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Lock System</span>
            </button>
          </div>
        </header>

        {/* SCROLLABLE WORKSPACE */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:px-12 pb-24 flex justify-center items-start">
          <div className="w-full max-w-6xl">
            
            {/* --- OVERVIEW TAB --- */}
            {activeTab === 'overview' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="p-6 bg-white rounded-2xl border border-[#E8DFD3] shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-xs font-bold uppercase tracking-widest text-[#8B7D6B]">Total Inventory</p>
                      <div className="p-2 bg-[#FAF6F1] rounded-lg text-[#A0522D]"><Package className="w-5 h-5" /></div>
                    </div>
                    <h3 className="text-3xl font-bold text-[#3E2F1C]">{products.length}</h3>
                  </div>
                  
                  <div className="p-6 bg-white rounded-2xl border border-[#E8DFD3] shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-xs font-bold uppercase tracking-widest text-[#8B7D6B]">Gross Revenue</p>
                      <div className="p-2 bg-[#FAF6F1] rounded-lg text-[#A0522D]"><TrendingUp className="w-5 h-5" /></div>
                    </div>
                    <h3 className="text-3xl font-bold text-[#3E2F1C]">₱{stats.revenue.toLocaleString()}</h3>
                  </div>

                  <div className="p-6 bg-white rounded-2xl border border-[#E8DFD3] shadow-sm hover:shadow-md transition-shadow sm:col-span-2 lg:col-span-1">
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-xs font-bold uppercase tracking-widest text-[#8B7D6B]">Total Orders</p>
                      <div className="p-2 bg-[#FAF6F1] rounded-lg text-[#A0522D]"><ShoppingBag className="w-5 h-5" /></div>
                    </div>
                    <h3 className="text-3xl font-bold text-[#3E2F1C]">{stats.totalOrders}</h3>
                  </div>
                </div>

                <div className="bg-white p-6 md:p-8 rounded-2xl border border-[#E8DFD3] shadow-sm">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div>
                      <h4 className="text-xl font-bold text-[#3E2F1C]" style={{ fontFamily: 'Playfair Display, serif' }}>Sales Performance</h4>
                      <p className="text-sm text-[#8B7D6B] mt-1">Daily revenue performance over the last 7 days</p>
                    </div>
                  </div>

                  <div className="relative w-full h-48 md:h-64 flex gap-4">
                    <div className="flex flex-col justify-between text-[10px] font-bold text-[#B0A395] uppercase h-full py-1 pb-6 shrink-0">
                      <span>₱{chart.max.toLocaleString()}</span>
                      <span>₱{(chart.max / 2).toLocaleString()}</span>
                      <span>₱0</span>
                    </div>

                    <div className="flex-1 relative border-l border-b border-[#E8DFD3] bg-[#FAF6F1]/50 rounded-tr-lg">
                      <svg viewBox="0 -5 300 75" className="w-full h-full" preserveAspectRatio="none">
                        <line x1="0" y1="10" x2="300" y2="10" stroke="#E8DFD3" strokeWidth="0.5" strokeDasharray="4 4" />
                        <line x1="0" y1="35" x2="300" y2="35" stroke="#E8DFD3" strokeWidth="0.5" strokeDasharray="4 4" />
                        <path d={chart.smoothPath} fill="none" stroke="#A0522D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        {chart.points.map((p, i) => (
                          <circle key={i} cx={p.x} cy={p.y} r="2" fill="white" stroke="#A0522D" strokeWidth="1.5" className="hover:r-3 transition-all cursor-pointer" />
                        ))}
                      </svg>
                    </div>
                  </div>
                  
                  <div className="flex justify-between mt-4 ml-12 pr-2">
                    <span className="text-[10px] text-[#B0A395] font-bold uppercase tracking-widest">7 Days Ago</span>
                    <span className="text-[10px] text-[#A0522D] font-bold uppercase tracking-widest">Today</span>
                  </div>
                </div>
              </div>
            )}

            {/* --- CATEGORIES TAB (NEW) --- */}
            {activeTab === 'categories' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-[#3E2F1C]" style={{ fontFamily: 'Playfair Display, serif' }}>Shop Categories</h2>
                  <p className="text-sm text-[#8B7D6B] mt-1">Manage the categories available for your products on the storefront.</p>
                </div>

                <div className="bg-white p-6 md:p-8 rounded-2xl border border-[#E8DFD3] shadow-sm">
                  
                  <div className="flex flex-col sm:flex-row gap-3 mb-8">
                    <input 
                      value={newCategory} 
                      onChange={(e)=>setNewCategory(e.target.value)} 
                      onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                      placeholder="e.g. Limited Edition" 
                      className="flex-1 px-4 py-3 bg-[#FAF6F1] border border-[#E8DFD3] rounded-xl outline-none focus:border-[#A0522D] focus:ring-2 focus:ring-[#A0522D]/20 text-sm transition-all" 
                    />
                    <button 
                      onClick={handleAddCategory} 
                      className="bg-[#3E2F1C] text-white px-8 py-3 rounded-xl text-sm font-bold uppercase tracking-widest hover:bg-[#A0522D] shadow-md transition-colors"
                    >
                      Add Category
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {shopCategories.map(c => (
                      <div key={c} className="flex items-center justify-between p-4 bg-white border border-[#E8DFD3] rounded-xl group hover:border-[#A0522D] hover:shadow-sm transition-all">
                        <span className="font-semibold text-[#3E2F1C] text-sm">{c}</span>
                        <button 
                          onClick={() => handleDeleteCategory(c)} 
                          className="text-[#B0A395] hover:text-red-500 p-1 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4"/>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* --- ORDERS TAB --- */}
            {activeTab === 'orders' && (
              <div className="animate-in fade-in duration-300 w-full space-y-4 relative">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-[#3E2F1C]" style={{ fontFamily: 'Playfair Display, serif' }}>Customer Orders</h2>
                    <p className="text-sm text-[#8B7D6B] mt-1">Manage and fulfill your recent orders.</p>
                  </div>
                </div>
                
                {orders.length === 0 ? (
                  <div className="p-12 text-center text-[#8B7D6B] bg-white rounded-2xl border border-[#E8DFD3] shadow-sm">
                    <ShoppingBag className="w-12 h-12 text-[#D1C7B7] mx-auto mb-4" />
                    No orders yet. They will appear here once someone checks out!
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {orders.map((order) => (
                      <div 
                        key={order._id} 
                        onClick={() => setSelectedOrder(order)} 
                        className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-[#E8DFD3] flex flex-col gap-4 cursor-pointer hover:border-[#A0522D] transition-colors"
                      >
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-[#E8DFD3] pb-4 gap-4">
                          <div>
                            <h3 className="font-bold text-[#3E2F1C]">{order.customerName}</h3>
                            <p className="text-xs tracking-wide text-[#8B7D6B]">{order.customerEmail}</p>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-lg font-bold text-[#A0522D]">₱{order.amountPaid}</span>
                            <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              order.status === 'Paid' ? 'bg-green-50 text-green-700 border border-green-200' : 
                              order.status === 'Shipped' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-[#FAF6F1] text-[#3E2F1C] border border-[#E8DFD3]'
                            }`}>
                              {order.status}
                            </span>

                            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                              {order.status === 'Paid' && (
                                <button onClick={() => updateOrderStatus(order._id, 'Shipped')} className="text-[10px] font-bold uppercase tracking-widest bg-[#3E2F1C] text-white px-4 py-2 rounded-lg hover:bg-[#A0522D] transition-colors">
                                  Mark Shipped
                                </button>
                              )}
                              {order.status === 'Shipped' && (
                                <button onClick={() => updateOrderStatus(order._id, 'Delivered')} className="text-[10px] font-bold uppercase tracking-widest bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                                  Mark Delivered
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="text-sm text-[#3E2F1C]">
                          <span className="font-bold text-[#8B7D6B] mr-2">Items:</span> 
                          {order.items?.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                        </div>
                        
                        <div className="text-[10px] text-right text-[#8B7D6B] uppercase tracking-widest">
                          Ordered: {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Order Detail Modal */}
                {selectedOrder && (
                  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#3E2F1C]/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setSelectedOrder(null)}>
                    <div className="w-full max-w-lg bg-white rounded-2xl p-6 md:p-8 shadow-2xl relative border border-[#E8DFD3]" onClick={e => e.stopPropagation()}>
                      <button onClick={() => setSelectedOrder(null)} className="absolute top-6 right-6 p-2 text-[#8B7D6B] hover:bg-[#FAF6F1] rounded-full transition-colors">
                        <X className="w-5 h-5" />
                      </button>
                      
                      <h3 className="text-2xl font-bold text-[#3E2F1C] mb-6 border-b border-[#E8DFD3] pb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
                        Order Details
                      </h3>

                      <div className="space-y-6">
                        <div>
                          <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#8B7D6B] mb-2">Customer Info</h4>
                          <p className="text-sm text-[#3E2F1C] font-medium">{selectedOrder.customerName}</p>
                          <p className="text-sm text-[#3E2F1C]">{selectedOrder.customerEmail}</p>
                          <p className="text-sm text-[#3E2F1C]">{selectedOrder.contactNumber || 'No Phone Provided'}</p>
                        </div>

                        <div>
                          <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#8B7D6B] mb-2">Shipping Address</h4>
                          {selectedOrder.shippingAddress && selectedOrder.shippingAddress.street ? (
                            <div className="text-sm text-[#3E2F1C] bg-[#FAF6F1] p-4 rounded-xl border border-[#E8DFD3]">
                              <p>{selectedOrder.shippingAddress.street}</p>
                              <p>Brgy. {selectedOrder.shippingAddress.barangay}, {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.province}</p> 
                              <p>{selectedOrder.shippingAddress.region}, {selectedOrder.shippingAddress.postalCode}</p>
                            </div>
                          ) : (
                            <p className="text-sm text-[#8B7D6B] italic">No address recorded (Old Order)</p>
                          )}
                        </div>

                        <div>
                          <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#8B7D6B] mb-2">Items Purchased</h4>
                          <div className="bg-white rounded-xl border border-[#E8DFD3] divide-y divide-[#E8DFD3]">
                            {selectedOrder.items?.map((item, idx) => (
                              <div key={idx} className="p-4 flex justify-between text-sm">
                                <span className="font-medium text-[#3E2F1C]">{item.quantity}x {item.name} {item.color && `(${item.color})`}</span>
                                <span className="font-bold text-[#A0522D]">₱{item.amount / 100}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* --- CUSTOM ORDERS TAB --- */}
            {activeTab === 'custom' && (
              <div className="animate-in fade-in duration-500 w-full">
                <div className="flex justify-between items-center mb-6 border-b border-[#E8DFD3] pb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-[#3E2F1C]" style={{ fontFamily: 'Playfair Display, serif' }}>Custom Designs</h2>
                    <p className="text-sm text-[#8B7D6B] mt-1">Pending designs submitted for studio review.</p>
                  </div>
                </div>

                <div className="grid gap-6">
                  {customOrders.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-2xl border border-[#E8DFD3] shadow-sm">
                      <Palette className="w-12 h-12 text-[#D1C7B7] mx-auto mb-4" />
                      <p className="text-[#8B7D6B] font-medium">No custom designs pending.</p>
                    </div>
                  ) : (
                    customOrders.map(order => {
                      const radius = 55;
                      const beads = order.beads || [];
                      const charms = order.charms || [];
                      const isOldFormat = typeof beads[0] === 'string';
                      
                      const renderBeads = beads.map((b) => ({
                        name: isOldFormat ? b : b.name,
                        hex: isOldFormat ? '#D1C7B7' : b.hex 
                      }));
                      const renderCharms = charms.map((c) => ({
                        name: typeof c === 'string' ? c : c.name,
                        em: typeof c === 'string' ? '✨' : c.em
                      }));

                      const beadSizeNum = parseInt(order.beadSize) || 8;
                      const beadPx = Math.max(8, beadSizeNum * 2.5);
                      const offset = beadPx / 2;

                      return (
                        <div key={order._id} className="bg-white p-6 rounded-2xl border border-[#E8DFD3] shadow-sm flex flex-col md:flex-row gap-6 hover:border-[#A0522D] transition-colors">
                          
                          {/* THE VISUALIZER */}
                          <div className="aspect-square w-full md:w-[180px] rounded-2xl bg-[#FAF6F1] border border-[#E8DFD3] flex items-center justify-center shrink-0 relative overflow-hidden">
                            <div className="rounded-full flex items-center justify-center relative shadow-inner bg-transparent"
                              style={{ width: radius * 2, height: radius * 2, borderWidth: '2px', borderStyle: 'solid', borderColor: '#D4C4A8' }}>
                              
                              {renderBeads.map((b, i) => { 
                                const totalSlots = renderBeads.length + (renderCharms.length > 0 ? 1 : 0);
                                const charmSlot = Math.floor(totalSlots / 2);
                                const slotIndex = (renderCharms.length > 0 && i >= charmSlot) ? i + 1 : i;
                                const angle = (slotIndex / Math.max(totalSlots, 1)) * Math.PI * 2 - Math.PI / 2; 
                                return (
                                  <div key={i} className="absolute rounded-full shadow-sm border border-white/40 z-10" 
                                    style={{ width: beadPx, height: beadPx, backgroundColor: b.hex, left: `calc(50% + ${Math.cos(angle)*radius}px - ${offset}px)`, top: `calc(50% + ${Math.sin(angle)*radius}px - ${offset}px)` }} 
                                  />
                                ); 
                              })}

                              {renderCharms.map((c, i) => {
                                const charmPx = 32;
                                const cOffset = charmPx / 2;
                                const totalSlots = renderBeads.length + 1;
                                const angle = (Math.floor(totalSlots / 2) / totalSlots) * Math.PI * 2 - Math.PI / 2;
                                return (
                                  <div key={`charm-${i}`} className="absolute text-2xl filter drop-shadow-md z-20 flex items-center justify-center"
                                    style={{ width: charmPx, height: charmPx, left: `calc(50% + ${Math.cos(angle)*radius}px - ${cOffset}px)`, top: `calc(50% + ${Math.sin(angle)*radius}px - ${cOffset}px + 10px)` }}>
                                    {c.em}
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* ORDER DETAILS */}
                          <div className="flex-1 space-y-4">
                            <div className="flex justify-between items-start border-b border-[#E8DFD3] pb-4">
                              <div>
                                <h3 className="text-xl font-bold text-[#3E2F1C]">{order.name}</h3>
                                <p className="text-sm text-[#A0522D] font-medium flex items-center gap-1.5 mt-1">
                                  <Mail className="w-4 h-4" /> {order.email}
                                </p>
                              </div>
                              <span className={`px-3 py-1.5 text-[10px] uppercase tracking-widest font-bold rounded-full border ${
                                order.status === 'Shipped' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                order.status === 'Delivered' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                order.status === 'Crafting' ? 'bg-green-50 text-green-700 border-green-200' :
                                'bg-amber-50 text-amber-700 border-amber-200'
                              }`}>
                                {order.status}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-[#FAF6F1] rounded-xl border border-[#E8DFD3]">
                              <div>
                                <p className="text-[10px] text-[#8B7D6B] uppercase tracking-widest font-bold">Bead Type</p>
                                <p className="font-medium text-[#3E2F1C] truncate">{order.beadType || 'Unknown'}</p>
                              </div>
                              <div>
                                <p className="text-[10px] text-[#8B7D6B] uppercase tracking-widest font-bold">Bead Size</p>
                                <p className="font-medium text-[#3E2F1C]">{order.beadSize}</p>
                              </div>
                              <div>
                                <p className="text-[10px] text-[#8B7D6B] uppercase tracking-widest font-bold">Wrist Size</p>
                                <p className="font-medium text-[#3E2F1C]">{order.wristSize}</p>
                              </div>
                              <div>
                                <p className="text-[10px] text-[#8B7D6B] uppercase tracking-widest font-bold">String Base</p>
                                <p className="font-medium text-[#3E2F1C] truncate">{order.string}</p>
                              </div>
                            </div>
                            
                            {/* ACTION BUTTONS */}
                            <div className="flex flex-wrap gap-2 pt-2">
                              {order.status === 'Pending Studio Review' && (
                                <button onClick={() => updateCustomOrderStatus(order._id, 'Crafting')} className="text-[10px] font-bold uppercase tracking-widest bg-[#3E2F1C] text-white px-5 py-2.5 rounded-lg hover:bg-[#A0522D] transition-colors">
                                  Accept & Start Crafting
                                </button>
                              )}
                              {order.status === 'Crafting' && (
                                <button onClick={() => updateCustomOrderStatus(order._id, 'Shipped')} className="text-[10px] font-bold uppercase tracking-widest bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors">
                                  Mark as Shipped
                                </button>
                              )}
                              {order.status === 'Shipped' && (
                                <button onClick={() => updateCustomOrderStatus(order._id, 'Delivered')} className="text-[10px] font-bold uppercase tracking-widest bg-purple-600 text-white px-5 py-2.5 rounded-lg hover:bg-purple-700 transition-colors">
                                  Mark as Delivered
                                </button>
                              )}
                            </div>
                          </div>

                          {/* MATERIAL BREAKDOWN */}
                          <div className="w-full md:w-64 bg-[#FAF6F1] p-5 rounded-xl border border-[#E8DFD3] shrink-0">
                            <p className="text-[10px] text-[#8B7D6B] uppercase tracking-widest font-bold mb-3 flex justify-between">
                              <span>Breakdown</span>
                              <span className="text-[#A0522D]">₱{order.totalPrice}</span>
                            </p>
                            
                            <div className="space-y-2 mb-4">
                              <p className="text-xs font-semibold text-[#3E2F1C] border-b border-[#E8DFD3] pb-1">Charms ({order.charms?.length || 0})</p>
                              <p className="text-sm text-[#5A4A3A]">{renderCharms.length > 0 ? renderCharms.map(c => `${c.em} ${c.name}`).join(', ') : 'None'}</p>
                            </div>

                            <div className="space-y-2">
                              <p className="text-xs font-semibold text-[#3E2F1C] border-b border-[#E8DFD3] pb-1">Beads ({order.beads?.length || 0})</p>
                              <div className="max-h-32 overflow-y-auto scrollbar-hide text-sm text-[#5A4A3A]">
                                {(() => {
                                  const counts = renderBeads.reduce((acc, b) => ({...acc, [b.name]: (acc[b.name] || 0) + 1}), {});
                                  return Object.entries(counts).map(([bead, count]) => (
                                    <div key={bead} className="flex justify-between py-0.5">
                                      <span className="truncate pr-2">{bead}</span>
                                      <span className="font-medium text-[#8B7D6B] shrink-0">x{count}</span>
                                    </div>
                                  ));
                                })()}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
            {/* --- INVENTORY TAB --- */}
            {activeTab === 'inventory' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-[#3E2F1C]" style={{ fontFamily: 'Playfair Display, serif' }}>Catalog</h2>
                    <p className="text-sm text-[#8B7D6B] mt-1">{products.length} total products</p>
                  </div>
                  <button onClick={() => { setActiveTab('form'); setEditId(null); }} className="hidden sm:flex bg-[#3E2F1C] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#A0522D] items-center gap-2 transition-colors">
                    <Plus className="w-4 h-4"/> Add Product
                  </button>
                </div>
                
                {products.length === 0 ? (
                  <div className="py-20 text-center text-[#8B7D6B] bg-white rounded-2xl border border-[#E8DFD3] shadow-sm">Catalog is empty.</div>
                ) : (
                  <div className="overflow-x-auto bg-white border border-[#E8DFD3] rounded-2xl shadow-sm hidden md:block">
                    <table className="w-full text-left border-collapse min-w-full">
                      <thead className="bg-[#FAF6F1]">
                        <tr className="border-b border-[#E8DFD3] text-[10px] font-bold uppercase tracking-widest text-[#8B7D6B]">
                          <th className="p-4 md:px-6">Product</th>
                          <th className="p-4 md:px-6">Price</th>
                          <th className="p-4 md:px-6">Category</th>
                          <th className="p-4 md:px-6 text-center">Status</th>
                          <th className="p-4 md:px-6 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map(p => (
                          <tr key={p._id} className="border-b border-[#E8DFD3] hover:bg-[#Fdfbf9] transition-colors">
                            <td className="p-4 md:px-6 flex items-center gap-4">
                              <img src={p.img} alt={p.name} className={`w-12 h-12 rounded-lg object-cover border border-[#E8DFD3] bg-white shadow-sm transition-opacity ${p.isAvailable === false ? 'opacity-50 grayscale' : ''}`} />
                              <span className={`font-semibold text-sm ${p.isAvailable === false ? 'text-[#8B7D6B] line-through' : 'text-[#3E2F1C]'}`}>{p.name}</span>
                            </td>
                            <td className="p-4 md:px-6 text-sm font-medium text-[#3E2F1C]">₱{p.price}</td>
                            <td className="p-4 md:px-6"><span className="bg-[#FAF6F1] px-3 py-1 rounded-full text-xs font-medium text-[#8B7D6B] border border-[#E8DFD3]">{p.cat}</span></td>
                            
                            <td className="p-4 md:px-6 text-center">
                              <button 
                                onClick={() => toggleAvailability(p._id, p.isAvailable)}
                                className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest border transition-all ${
                                  p.isAvailable !== false 
                                    ? 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100' 
                                    : 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100'
                                }`}
                              >
                                {p.isAvailable !== false ? 'Available' : 'Sold Out'}
                              </button>
                            </td>

                            <td className="p-4 md:px-6 text-right">
                              <button onClick={() => handleEditClick(p)} className="p-2 text-[#8B7D6B] hover:text-[#A0522D] hover:bg-[#FAF6F1] rounded-lg transition-colors"><Edit2 className="w-4 h-4 inline" /></button>
                              <button onClick={() => handleDelete(p._id, 'product')} className="p-2 text-[#8B7D6B] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-1"><Trash2 className="w-4 h-4 inline" /></button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                
                {/* MOBILE VIEW */}
                <div className="md:hidden space-y-3">
                  {products.map(p => (
                    <div key={p._id} className="p-4 bg-white flex gap-4 items-center rounded-xl border border-[#E8DFD3] shadow-sm relative">
                      <img src={p.img} alt={p.name} className={`w-16 h-16 rounded-xl object-cover border border-[#E8DFD3] shrink-0 ${p.isAvailable === false ? 'opacity-50 grayscale' : ''}`} />
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-bold text-sm truncate ${p.isAvailable === false ? 'text-[#8B7D6B] line-through' : 'text-[#3E2F1C]'}`}>{p.name}</h3>
                        <p className="text-xs font-medium text-[#A0522D] mt-1">₱{p.price}</p>
                        
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-[9px] text-[#8B7D6B] bg-[#FAF6F1] px-2 py-0.5 rounded border border-[#E8DFD3] uppercase tracking-widest">{p.cat}</span>
                          
                          {/* THE MOBILE STATUS TOGGLE */}
                          <button 
                            onClick={() => toggleAvailability(p._id, p.isAvailable)}
                            className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest border transition-all ${
                              p.isAvailable !== false 
                                ? 'border-green-200 bg-green-50 text-green-700' 
                                : 'border-red-200 bg-red-50 text-red-700'
                            }`}
                          >
                            {p.isAvailable !== false ? 'Available' : 'Sold Out'}
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2 shrink-0">
                        <button onClick={() => handleEditClick(p)} className="p-2 bg-[#FAF6F1] text-[#3E2F1C] rounded-lg"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(p._id, 'product')} className="p-2 bg-red-50 text-red-600 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* --- FORM TAB (Products) --- */}
            {activeTab === 'form' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full max-w-2xl">
                <h2 className="text-2xl font-bold text-[#3E2F1C] mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
                  {editId ? 'Edit Product' : 'Add New Product'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 md:p-8 rounded-2xl border border-[#E8DFD3] shadow-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-[#8B7D6B] mb-2">Product Name</label>
                      <input required value={product.name} onChange={(e) => setProduct({...product, name: e.target.value})} className="w-full px-4 py-3 bg-[#FAF6F1] border border-[#E8DFD3] rounded-xl outline-none focus:border-[#A0522D] text-sm transition-all" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-[#8B7D6B] mb-2">Price (₱)</label>
                      <input type="number" required value={product.price} onChange={(e) => setProduct({...product, price: e.target.value})} className="w-full px-4 py-3 bg-[#FAF6F1] border border-[#E8DFD3] rounded-xl outline-none focus:border-[#A0522D] text-sm transition-all" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-[#8B7D6B] mb-2">Category</label>
                      <select value={product.cat} onChange={(e) => setProduct({...product, cat: e.target.value})} className="w-full px-4 py-3 bg-[#FAF6F1] border border-[#E8DFD3] rounded-xl outline-none text-sm appearance-none cursor-pointer">
                        {shopCategories.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-[#8B7D6B] mb-2">Primary Image</label>
                      <input type="file" accept="image/*" onChange={(e) => setProduct({...product, imgFile: e.target.files[0]})} className="w-full text-sm text-[#8B7D6B] file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:bg-[#E8DFD3] file:text-[#3E2F1C] file:font-medium hover:file:bg-[#D1CBC3] file:cursor-pointer transition-colors" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[#8B7D6B] mb-2">Secondary Image (Hover/Detail)</label>
                    <input type="file" accept="image/*" onChange={(e) => setProduct({...product, secondaryImgFile: e.target.files[0]})} className="w-full text-sm text-[#8B7D6B] file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:bg-[#E8DFD3] file:text-[#3E2F1C] file:font-medium hover:file:bg-[#D1CBC3] file:cursor-pointer transition-colors" />
                  </div>

                  <button type="submit" className="w-full bg-[#3E2F1C] text-white py-4 rounded-xl font-bold tracking-widest uppercase hover:bg-[#A0522D] mt-4 text-sm transition-colors shadow-md">
                    {editId ? 'Save Changes' : 'Publish to Catalog'}
                  </button>

                  {status && (
                    <div className="mt-4 p-4 bg-[#FAF6F1] text-[#A0522D] rounded-xl text-sm font-bold tracking-wide text-center animate-in fade-in duration-300 border border-[#E8DFD3]">
                      {status}
                    </div>
                  )}
                </form>
              </div>
            )}

            {/* --- COMMUNITY LOVE TAB --- */}
            {activeTab === 'community' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 w-full">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-1">
                    <h3 className="text-xl font-bold text-[#3E2F1C] mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>Add a Review</h3>
                    <form onSubmit={handleReviewSubmit} className="space-y-5 bg-white p-6 rounded-2xl border border-[#E8DFD3] shadow-sm">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-[#8B7D6B] mb-2">Customer Name</label>
                        <input required value={reviewForm.author} onChange={(e) => setReviewForm({...reviewForm, author: e.target.value})} className="w-full px-4 py-3 bg-[#FAF6F1] border border-[#E8DFD3] rounded-xl outline-none focus:border-[#A0522D] text-sm" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-[#8B7D6B] mb-2">Review Text</label>
                        <textarea required value={reviewForm.text} onChange={(e) => setReviewForm({...reviewForm, text: e.target.value})} rows="4" className="w-full px-4 py-3 bg-[#FAF6F1] border border-[#E8DFD3] rounded-xl outline-none focus:border-[#A0522D] text-sm resize-none" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-[#8B7D6B] mb-2">Rating (1-5)</label>
                        <input type="number" min="1" max="5" step="0.5" required value={reviewForm.rating} onChange={(e) => setReviewForm({...reviewForm, rating: parseFloat(e.target.value) || ''})} className="w-full px-4 py-3 bg-[#FAF6F1] border border-[#E8DFD3] rounded-xl outline-none focus:border-[#A0522D] text-sm" />
                      </div>
                      <button type="submit" className="w-full bg-[#3E2F1C] text-white py-3.5 rounded-xl font-bold tracking-widest uppercase hover:bg-[#A0522D] text-xs transition-colors shadow-md">
                        Publish Review
                      </button>
                    </form>
                  </div>
                  <div className="lg:col-span-2">
                    <h3 className="text-xl font-bold text-[#3E2F1C] mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>Live Reviews</h3>
                    {reviews.length === 0 ? (
                      <p className="text-sm text-[#8B7D6B] py-12 text-center bg-white border border-dashed border-[#E8DFD3] rounded-2xl">No community reviews added yet.</p>
                    ) : (
                      <div className="space-y-4">
                        {reviews.map(r => (
                          <div key={r._id} className="p-5 border border-[#E8DFD3] rounded-2xl bg-white shadow-sm flex justify-between items-start gap-4">
                            <div>
                              <div className="flex items-center gap-3 mb-2">
                                <span className="font-bold text-[#3E2F1C]">{r.author}</span>
                                {renderStars(r.rating)}
                              </div>
                              <p className="text-sm text-[#5A4A3A] leading-relaxed italic">"{r.text}"</p>
                            </div>
                            <button onClick={() => handleDelete(r._id, 'review')} className="p-2 text-[#B0A395] hover:text-red-500 hover:bg-red-50 rounded-lg transition-all shrink-0">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* --- JOURNAL TAB --- */}
            {activeTab === 'journal' && (
              <div className="animate-in fade-in duration-300 relative w-full">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                  
                  <div className="xl:col-span-1">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-2xl font-bold text-[#3E2F1C]" style={{ fontFamily: 'Playfair Display, serif' }}>
                        {editBlogId ? 'Edit Article' : 'Write an Article'}
                      </h3>
                      {editBlogId && (
                        <button onClick={() => { setEditBlogId(null); setBlogForm({ title: '', ex: '', content: '', cat: 'Journal', time: '5 min', img: '' }); }} className="text-xs font-bold text-[#8B7D6B] bg-[#FAF6F1] px-3 py-1.5 rounded-lg flex items-center gap-1 hover:text-[#3E2F1C]">
                          <X className="w-3 h-3" /> Cancel
                        </button>
                      )}
                    </div>

                    <form onSubmit={handleBlogSubmit} className="space-y-5 bg-white p-6 md:p-8 rounded-2xl border border-[#E8DFD3] shadow-sm">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-[#8B7D6B] mb-2">Article Title</label>
                        <input required value={blogForm.title} onChange={(e) => setBlogForm({...blogForm, title: e.target.value})} className="w-full px-4 py-3 bg-[#FAF6F1] border border-[#E8DFD3] rounded-xl outline-none focus:border-[#A0522D] text-sm" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-[#8B7D6B] mb-2">Cover Image URL</label>
                        <input required value={blogForm.img} onChange={(e) => setBlogForm({...blogForm, img: e.target.value})} className="w-full px-4 py-3 bg-[#FAF6F1] border border-[#E8DFD3] rounded-xl outline-none focus:border-[#A0522D] text-sm" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-[#8B7D6B] mb-2">Short Excerpt</label>
                        <textarea required value={blogForm.ex} onChange={(e) => setBlogForm({...blogForm, ex: e.target.value})} rows="2" className="w-full px-4 py-3 bg-[#FAF6F1] border border-[#E8DFD3] rounded-xl outline-none focus:border-[#A0522D] text-sm resize-none" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-[#8B7D6B] mb-2">Full Story</label>
                        <textarea required value={blogForm.content} onChange={(e) => setBlogForm({...blogForm, content: e.target.value})} rows="8" className="w-full px-4 py-3 bg-[#FAF6F1] border border-[#E8DFD3] rounded-xl outline-none focus:border-[#A0522D] text-sm resize-none" />
                      </div>
                      <div className="grid grid-cols-2 gap-5">
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-[#8B7D6B] mb-2">Category</label>
                          <input required value={blogForm.cat} onChange={(e) => setBlogForm({...blogForm, cat: e.target.value})} className="w-full px-4 py-3 bg-[#FAF6F1] border border-[#E8DFD3] rounded-xl outline-none focus:border-[#A0522D] text-sm" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-[#8B7D6B] mb-2">Read Time</label>
                          <input required value={blogForm.time} onChange={(e) => setBlogForm({...blogForm, time: e.target.value})} className="w-full px-4 py-3 bg-[#FAF6F1] border border-[#E8DFD3] rounded-xl outline-none focus:border-[#A0522D] text-sm" />
                        </div>
                      </div>
                      <button type="submit" className="w-full bg-[#3E2F1C] text-white py-4 rounded-xl font-bold tracking-widest uppercase hover:bg-[#A0522D] text-xs transition-colors shadow-md mt-2">
                        {editBlogId ? 'Update Article' : 'Publish Article'}
                      </button>
                    </form>
                    {status && status.includes('Article') && <div className="mt-4 text-sm text-center text-[#A0522D] font-bold">{status}</div>}
                  </div>

                  <div className="xl:col-span-1">
                    <h3 className="text-xl font-bold text-[#3E2F1C] mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>Live Articles ({blogs.length})</h3>
                    {blogs.length === 0 ? (
                      <p className="text-sm text-[#8B7D6B] py-12 text-center bg-white border border-dashed border-[#E8DFD3] rounded-2xl">No articles published yet.</p>
                    ) : (
                      <div className="space-y-4">
                        {blogs.map(b => (
                          <div key={b._id} className="p-4 border border-[#E8DFD3] rounded-2xl bg-white shadow-sm flex justify-between items-center gap-4 hover:border-[#A0522D] transition-colors">
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                              <img src={b.img} alt="" className="w-16 h-16 rounded-xl object-cover border border-[#E8DFD3]" />
                              <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-[#3E2F1C] text-sm truncate">{b.title}</h4>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-[#8B7D6B] mt-1">{b.date} • {b.cat}</p>
                              </div>
                            </div>
                            <div className="flex flex-col gap-2 shrink-0">
                              <button onClick={() => handleEditBlog(b)} className="p-2 bg-[#FAF6F1] text-[#3E2F1C] hover:bg-[#E8DFD3] rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></button>
                              <button onClick={() => handleDelete(b._id, 'blog')} className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>
              </div>
            )}

            {/* --- SETTINGS TAB --- */}
            {activeTab === 'settings' && (
              <div className="animate-in fade-in duration-300 relative w-full max-w-2xl">
                <h3 className="text-2xl font-bold text-[#3E2F1C] mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>Storefront Settings</h3>
                <p className="text-sm text-[#8B7D6B] mb-8 leading-relaxed">Update the text and themes across your customer-facing website.</p>
                
                <form onSubmit={handleSettingsSubmit} className="space-y-6">
                  <div className="p-6 bg-white border border-[#E8DFD3] rounded-2xl shadow-sm">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[#8B7D6B] mb-3">Top Announcement Banner</label>
                    <input required value={bannerText} onChange={(e) => setBannerText(e.target.value)} className="w-full px-4 py-3 bg-[#FAF6F1] border border-[#E8DFD3] rounded-xl outline-none focus:border-[#A0522D] text-sm" />
                  </div>

                  <div className="p-6 bg-white border border-[#E8DFD3] rounded-2xl shadow-sm space-y-4">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[#8B7D6B]">Store Highlights</label>
                    <p className="text-xs text-[#8B7D6B] mb-3">These are the three main selling points shown on your site.</p>
                    <input required value={featureOne} onChange={(e) => setFeatureOne(e.target.value)} placeholder="Highlight 1" className="w-full px-4 py-3 bg-[#FAF6F1] border border-[#E8DFD3] rounded-xl outline-none focus:border-[#A0522D] text-sm" />
                    <input required value={featureTwo} onChange={(e) => setFeatureTwo(e.target.value)} placeholder="Highlight 2" className="w-full px-4 py-3 bg-[#FAF6F1] border border-[#E8DFD3] rounded-xl outline-none focus:border-[#A0522D] text-sm" />
                    <input required value={featureThree} onChange={(e) => setFeatureThree(e.target.value)} placeholder="Highlight 3" className="w-full px-4 py-3 bg-[#FAF6F1] border border-[#E8DFD3] rounded-xl outline-none focus:border-[#A0522D] text-sm" />
                  </div>

                  <div className="p-6 bg-white border border-[#E8DFD3] rounded-2xl shadow-sm mb-6">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[#8B7D6B] mb-3">Global Website Theme</label>
                    <div className="flex gap-4">
                      <button type="button" onClick={() => handleThemeChange('brown')} className={`flex-1 py-3.5 rounded-xl border-2 font-bold text-sm transition-all ${siteTheme === 'brown' ? 'border-[#3E2F1C] bg-[#FAF6F1] text-[#3E2F1C]' : 'border-transparent bg-[#FAF6F1] text-[#8B7D6B]'}`}>Earthy Brown</button>
                      <button type="button" onClick={() => handleThemeChange('pink')} className={`flex-1 py-3.5 rounded-xl border-2 font-bold text-sm transition-all ${siteTheme === 'pink' ? 'border-[#D88A9A] bg-[#FFF0F5] text-[#5C434A]' : 'border-transparent bg-[#FAF6F1] text-[#8B7D6B]'}`}>Blush Pink</button>
                    </div>
                  </div>
                  
                  {status && status.includes('Settings') && <div className="text-sm text-center text-[#A0522D] font-bold bg-[#FAF6F1] p-3 rounded-lg">{status}</div>}

                  <button type="submit" className="w-full bg-[#3E2F1C] text-white py-4 rounded-xl font-bold tracking-widest uppercase hover:bg-[#A0522D] text-sm shadow-md transition-colors">
                    Update Website
                  </button>
                </form>
              </div>
            )}

          </div>

          {/* Floating Action Button on Mobile */}
          {activeTab === 'inventory' && (
            <button 
              onClick={() => { setActiveTab('form'); setEditId(null); }} 
              className="md:hidden fixed bottom-[5.5rem] right-4 w-14 h-14 bg-[#3E2F1C] text-white rounded-full flex items-center justify-center shadow-2xl z-50 hover:bg-[#A0522D] transition-transform active:scale-95 border-2 border-white"
            >
              <Plus className="w-6 h-6" />
            </button>
          )}

        </main>
      </div>

      {/* --- UNIVERSAL CUSTOM POP-UP (MODAL) --- */}
      {popup.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#3E2F1C]/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-200 border border-[#E8DFD3]">
            <h3 className="text-xl font-bold text-[#3E2F1C] mb-3">
              {popup.title}
            </h3>
            <p className="text-sm text-[#8B7D6B] mb-8 leading-relaxed">
              {popup.message}
            </p>
            
            <div className="flex gap-3 justify-end">
              {popup.isConfirm && (
                <button onClick={closePopup} className="px-5 py-2.5 text-sm font-bold text-[#3E2F1C] bg-[#FAF6F1] rounded-xl hover:bg-[#E8DFD3] transition-colors">
                  Cancel
                </button>
              )}
              <button 
                onClick={() => { if (popup.onConfirm) popup.onConfirm(); closePopup(); }} 
                className={`px-5 py-2.5 text-sm font-bold text-white rounded-xl transition-colors shadow-md ${
                  popup.title.toLowerCase().includes('delete') ? 'bg-red-500 hover:bg-red-600' : 'bg-[#3E2F1C] hover:bg-[#A0522D]' 
                }`}
              >
                {popup.isConfirm ? 'Confirm' : 'Okay'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}