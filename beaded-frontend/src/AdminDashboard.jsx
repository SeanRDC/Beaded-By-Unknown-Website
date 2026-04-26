import { useState, useEffect } from 'react';
import { LayoutDashboard, Package, Plus, Trash2, Edit2, TrendingUp, ShoppingBag, X, KeyRound, Wifi, WifiOff, Settings as SettingsIcon, MessageSquare, BookOpen } from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview'); 
  const [secretKey, setSecretKey] = useState('');
  const [status, setStatus] = useState('');
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({ revenue: 0, totalOrders: 0 });
  const [editId, setEditId] = useState(null);
  
  const [serverStatus, setServerStatus] = useState('checking'); 
  
  // Settings State
  const [bannerText, setBannerText] = useState('WELCOME');
  const [featureOne, setFeatureOne] = useState('Free shipping over ₱50');
  const [featureTwo, setFeatureTwo] = useState('Handmade');
  const [featureThree, setFeatureThree] = useState('Ethically sourced');
  
  // Community Reviews State
  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({ author: '', text: '', rating: 5 });

  const [product, setProduct] = useState({
    name: '', price: '', img: '', img2: '', cat: 'Gemstone', mat: '', tag: '', colors: '', sizes: 'S, M, L'
  });

  // Blog states
  const [blogs, setBlogs] = useState([]);
  const [editBlogId, setEditBlogId] = useState(null);
  const [blogForm, setBlogForm] = useState({ 
    title: '', ex: '', content: '', cat: 'Journal', time: '5 min', img: '' 
  });

  // Pop up state
const [popup, setPopup] = useState({
  isOpen: false,
  title: '',
  message: '',
  isConfirm: false,
  onConfirm: null
});

  // Orders State
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

const closePopup = () => setPopup({ ...popup, isOpen: false });

// 1. PUBLIC DATA: Fetches products, blogs, and reviews (No key needed)
  const fetchAllData = async () => {
    try {
      const prodRes = await fetch('http://localhost:4242/api/products');
      if (prodRes.ok) {
        const prodData = await prodRes.json();
        if (Array.isArray(prodData)) setProducts(prodData);
        setServerStatus('online'); 
      } else {
        setServerStatus('offline');
      }

      const blogRes = await fetch('http://localhost:4242/api/blogs');
      if (blogRes.ok) {
        const blogData = await blogRes.json();
        if (Array.isArray(blogData)) setBlogs(blogData);
      }

      const revRes = await fetch('http://localhost:4242/api/reviews');
      if (revRes.ok) {
        const revData = await revRes.json();
        if (Array.isArray(revData)) setReviews(revData);
      }
    } catch (err) {
      setServerStatus('offline');
    }
  };

  // 2. PUBLIC DATA: Fetches your top banner and features
  const fetchSettings = async () => {
    try {
      const res = await fetch('http://localhost:4242/api/settings');
      const data = await res.json();
      if (data) {
        if (data.topBannerText) setBannerText(data.topBannerText);
        if (data.featureOne) setFeatureOne(data.featureOne);
        if (data.featureTwo) setFeatureTwo(data.featureTwo);
        if (data.featureThree) setFeatureThree(data.featureThree);
      }
    } catch (err) {}
  };

  // 3. SECURE DATA: Fetches dashboard stats (REQUIRES KEY)
  const fetchStats = async () => { 
    // STRICT GUARD: If the key is empty, stop right here so we don't get a 403!
    if (!secretKey) return; 

    try {
      const res = await fetch(`http://localhost:4242/api/admin/stats`, {
        headers: {
          'admin_secret': secretKey // Pulls directly from your component's state
        }
      });
      
      if (res.ok) {
        const data = await res.json();
        setStats(data); // Make sure you actually save the data!
      }
    } catch (err) {
      console.error("Stats fetch error:", err);
    }
  };

  const fetchOrders = async () => {
    if (!secretKey) return; 
    
    try {
      const res = await fetch(`http://localhost:4242/api/admin/orders`, {
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

  const updateOrderStatus = async (orderId, newStatus) => {
    if (!secretKey) return;
    try {
      const res = await fetch(`http://localhost:4242/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'admin_secret': secretKey 
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (res.ok) {
        fetchOrders(); // Refresh the list to show the new status
      } else {
        alert("Failed to update status");
      }
    } catch (err) {
      console.error("Status update error:", err);
    }
  };

  // --- THE TRIGGERS (useEffect) ---

  // Trigger 1: Load public data the exact moment the dashboard opens
  useEffect(() => {
    fetchAllData();
    fetchSettings();
  }, []); // Empty brackets mean this runs ONCE when the page loads

  // Trigger 2: Load the secure stats ONLY when the secretKey is available
  useEffect(() => {
    fetchStats();
    fetchOrders();
  }, [secretKey]); // This tells React: "Run this whenever the secretKey changes"

 const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();

    formData.append('name', product.name);
    formData.append('price', product.price);
    formData.append('cat', product.cat);

    // Append Primary Image OR pass the existing URL back to the server
    if (product.imgFile) {
      formData.append('primaryImage', product.imgFile);
    } else if (editId) {
      formData.append('existingPrimaryImage', product.img);
    }

    // Append Secondary Image OR pass the existing URL back
    if (product.secondaryImgFile) {
      formData.append('secondaryImage', product.secondaryImgFile);
    } else if (editId) {
      formData.append('existingSecondaryImage', product.img2);
    }

    try {
      // 1. Dynamically set the URL: Include the editId if we are editing!
      const url = editId 
        ? `http://localhost:4242/api/products/${editId}` 
        : `http://localhost:4242/api/products`;

      const res = await fetch(url, {
        method: editId ? 'PUT' : 'POST',
        // IMPORTANT: When testing locally/ngrok with admin routes, ensure your admin key is sent if your backend requires it
        headers: { 'admin_secret': secretKey }, 
        body: formData, 
      });

      if (res.ok) {
        setStatus(editId ? 'Product updated successfully!' : 'Product added successfully!');
        
        setProduct({ 
          name: '', 
          price: '', 
          cat: 'Gemstone', 
          img: '', 
          img2: '',
          imgFile: null, 
          secondaryImgFile: null,
          colors: [], 
          sizes: ['S', 'M', 'L'],
          mat: '',
          tag: ''
        });
        
        setEditId(null); // Exit "edit mode"
        
        // Refresh your catalog immediately so the new/edited item shows up
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
      const res = await fetch('http://localhost:4242/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'admin_secret': secretKey },
        body: JSON.stringify({ 
          topBannerText: bannerText,
          featureOne: featureOne,
          featureTwo: featureTwo,
          featureThree: featureThree
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
      const res = await fetch('http://localhost:4242/api/admin/reviews', {
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

    const url = editBlogId ? `http://localhost:4242/api/admin/blogs/${editBlogId}` : 'http://localhost:4242/api/admin/blogs';
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
    // 1. Missing Secret Key Alert
    if (!secretKey) {
      return setPopup({
        isOpen: true,
        title: 'Access Denied',
        message: 'Admin Secret Key required.',
        isConfirm: false,
        onConfirm: null
      });
    }

    // 2. The Confirmation Dialog
    setPopup({
      isOpen: true,
      // Capitalize the first letter for a clean title (e.g., "Delete Product")
      title: `Delete ${type.charAt(0).toUpperCase() + type.slice(1)}`, 
      message: `Are you sure you want to delete this ${type} permanently? This action cannot be undone.`,
      isConfirm: true,
      
      // 3. The Actual Delete Logic (Runs ONLY if they click Confirm)
      onConfirm: async () => {
        try {
          let url = `http://localhost:4242/api/admin/products/${id}`;
          if (type === 'review') url = `http://localhost:4242/api/admin/reviews/${id}`;
          if (type === 'blog') url = `http://localhost:4242/api/admin/blogs/${id}`;

          const res = await fetch(url, { 
            method: 'DELETE', 
            headers: { 'admin_secret': secretKey } 
          });
          
          if (res.ok) {
            fetchAllData(); // Refresh the list so the item disappears
          } else {
            // Optional: Show an error if the backend rejected it
            setPopup({
              isOpen: true,
              title: 'Error',
              message: 'Failed to delete. Check your admin key.',
              isConfirm: false,
              onConfirm: null
            });
          }
        } catch (err) { 
          // 4. Server Error Alert
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

  const handleEditClick = (p) => {
    // 1. Tell the system we are in "Edit Mode" for this specific ID
    setEditId(p._id);
    
    // 2. Populate the form with the existing product's data
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
      imgFile: null, // Ensure file inputs are empty
      secondaryImgFile: null
    });

    // 3. Switch the view to the product form tab
    setActiveTab('form');
    
    // 4. Smoothly scroll to the top so the user sees the form immediately
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const NavButton = ({ id, icon: Icon, label }) => (
    <button 
      onClick={() => { 
        setActiveTab(id); 
        if(id === 'form') { 
          setEditId(null); 
          // THE FIX: colors is now an empty array [], sizes is an array of strings
          setProduct({ 
            name: '', 
            price: '', 
            img: '', 
            img2: '', 
            cat: 'Gemstone', 
            mat: '', 
            tag: '', 
            colors: [], 
            sizes: ['S', 'M', 'L'] 
          }); 
        } 
        setStatus(''); 
      }} 
      className={`flex flex-col md:flex-row items-center gap-1 md:gap-3 p-3 md:px-4 md:py-3 w-full md:rounded-lg text-xs md:text-sm font-medium transition-all duration-200 ${
        activeTab === id ? 'text-[#A0522D] md:bg-[#3E2F1C] md:text-white' : 'text-[#8B7D6B] hover:text-[#3E2F1C] md:hover:bg-[#E8DFD3]'
      }`}
    >
      <Icon className="w-5 h-5 md:w-4 md:h-4" />
      <span className="hidden md:inline">{label}</span>
    </button>
  );

  return (
    <div className="h-screen w-full flex flex-col md:flex-row bg-[#FAF6F1] text-[#3E2F1C] font-sans overflow-hidden">
      
      <aside className="hidden md:flex w-64 flex-col bg-white border-r border-[#E8DFD3] z-20 shrink-0">
        <div className="p-6 border-b border-[#E8DFD3]">
          <h1 className="text-2xl font-bold tracking-wide" style={{ fontFamily: 'Playfair Display, serif' }}>
            BEADED <span className="font-light text-[#A0522D]">ADMIN</span>
          </h1>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <NavButton id="overview" icon={LayoutDashboard} label="Overview & Sales" />
          <NavButton id="orders" icon={ShoppingBag} label="Orders" />
          <NavButton id="inventory" icon={Package} label="Inventory Catalog" />
          <NavButton id="form" icon={Plus} label={editId ? 'Edit Product' : 'Add Product'} />
          <NavButton id="journal" icon={BookOpen} label="Journal Editor" /> 
          <NavButton id="community" icon={MessageSquare} label="Community Love" />
          <NavButton id="settings" icon={SettingsIcon} label="Store Settings" />
        </nav>
      </aside>

      <div className="flex-1 flex flex-col h-full relative overflow-hidden min-w-0">
        
        <header className="bg-white border-b border-[#E8DFD3] px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between shrink-0 z-10">
          <h2 className="text-lg font-bold md:hidden" style={{ fontFamily: 'Playfair Display, serif' }}>Hello, Iyesha ✨</h2>
          <h2 className="hidden md:flex items-center text-xl" style={{ fontFamily: 'Playfair Display, serif' }}>
            Hello, Iyesha 
            <span className="text-[#8B7D6B] text-sm ml-3 font-sans font-normal tracking-wide hidden lg:inline-block border-l border-[#E8DFD3] pl-3">
              {activeTab === 'overview' && 'Business Overview'}
              {activeTab === 'inventory' && 'Catalog Management'}
              {activeTab === 'form' && (editId ? 'Edit Details' : 'Create New Product')}
              {activeTab === 'community' && 'Manage Reviews'}
              {activeTab === 'settings' && 'Global Store Settings'}
            </span>
          </h2>
          
          <div className="flex items-center gap-2 bg-[#FAF6F1] px-3 py-1.5 rounded-lg border border-[#E8DFD3] focus-within:border-[#A0522D] focus-within:ring-1 focus-within:ring-[#A0522D] transition-all">
            <KeyRound className="w-4 h-4 text-[#8B7D6B]" />
            <input 
              type="password" value={secretKey} onChange={(e) => setSecretKey(e.target.value)} 
              className="w-24 sm:w-32 bg-transparent text-sm outline-none placeholder-[#8B7D6B]" placeholder="Admin Key"
            />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] p-4 sm:p-6 lg:p-8 pb-24 md:pb-8 flex justify-center items-start">
          
          <div className="w-full max-w-5xl bg-white border border-[#E8DFD3] rounded-2xl shadow-sm min-h-[75vh] flex flex-col relative overflow-hidden">
            
            <div className={`w-full px-6 py-3 flex items-center justify-between border-b text-sm font-medium transition-colors ${serverStatus === 'online' ? 'bg-green-50 border-green-100 text-green-800' : serverStatus === 'checking' ? 'bg-blue-50 border-blue-100 text-blue-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
              <div className="flex items-center gap-2">
                {serverStatus === 'online' ? <Wifi className="w-4 h-4" /> : serverStatus === 'checking' ? <TrendingUp className="w-4 h-4 animate-pulse" /> : <WifiOff className="w-4 h-4" />}
                <span>
                  {serverStatus === 'online' ? 'System Live & Synced via MongoDB Atlas' : serverStatus === 'checking' ? 'Establishing secure connection...' : 'Connection Offline'}
                </span>
              </div>
              <div className="hidden sm:block text-xs opacity-70">Auto-pings every 15s</div>
            </div>

            <div className="p-6 sm:p-8 flex-1 w-full">
              
              {/* --- OVERVIEW TAB --- */}
              {activeTab === 'overview' && (
                <div className="animate-in fade-in duration-300 w-full">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    <div className="p-6 bg-[#FAF6F1] rounded-xl border border-[#E8DFD3]">
                      <div className="flex justify-between items-start mb-4">
                        <p className="text-xs sm:text-sm text-[#8B7D6B] font-medium uppercase tracking-wider">Total Inventory</p>
                        <div className="p-2 bg-white rounded-lg shadow-sm"><Package className="w-5 h-5 text-[#A0522D]" /></div>
                      </div>
                      <h3 className="text-3xl sm:text-4xl font-light">{products.length} <span className="text-sm text-[#8B7D6B]">items</span></h3>
                    </div>
                    
                    <div className="p-6 bg-[#FAF6F1] rounded-xl border border-[#E8DFD3]">
                      <div className="flex justify-between items-start mb-4">
                        <p className="text-xs sm:text-sm text-[#8B7D6B] font-medium uppercase tracking-wider">Gross Revenue</p>
                        <div className="p-2 bg-white rounded-lg shadow-sm">
                          <span className="flex items-center justify-center w-5 h-5 text-[#A0522D] text-lg">
                            ₱
                          </span>
                        </div>
                      </div>
                      <h3 className="text-3xl sm:text-4xl font-light">₱{stats.revenue.toLocaleString()}</h3>
                    </div>

                    <div className="p-6 bg-[#FAF6F1] rounded-xl border border-[#E8DFD3] sm:col-span-2 lg:col-span-1">
                      <div className="flex justify-between items-start mb-4">
                        <p className="text-xs sm:text-sm text-[#8B7D6B] font-medium uppercase tracking-wider">Total Orders</p>
                        <div className="p-2 bg-white rounded-lg shadow-sm"><ShoppingBag className="w-5 h-5 text-[#A0522D]" /></div>
                      </div>
                      <h3 className="text-3xl sm:text-4xl font-light">{stats.totalOrders}</h3>
                    </div>
                  </div>
                </div>
              )}

              {/* --- INVENTORY TAB --- */}
              {activeTab === 'inventory' && (
                <div className="animate-in fade-in duration-300 w-full">
                  {products.length === 0 ? (
                    <div className="py-20 text-center text-[#8B7D6B]">Catalog is empty.</div>
                  ) : (
                    <div className="overflow-x-auto border border-[#E8DFD3] rounded-xl hidden md:block">
                      <table className="w-full text-left border-collapse min-w-full">
                        <thead className="bg-[#FAF6F1]">
                          <tr className="border-b border-[#E8DFD3] text-xs uppercase tracking-widest text-[#8B7D6B]">
                            <th className="p-4 font-medium">Product</th>
                            <th className="p-4 font-medium">Price</th>
                            <th className="p-4 font-medium">Category</th>
                            <th className="p-4 font-medium text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {products.map(p => (
                            <tr key={p._id} className="border-b border-[#E8DFD3] hover:bg-[#FAF6F1]">
                              <td className="p-4 flex items-center gap-4">
                                <img src={p.img} alt={p.name} className="w-12 h-12 rounded-lg object-cover border border-[#E8DFD3] bg-white shadow-sm" />
                                <span className="font-medium text-sm">{p.name}</span>
                              </td>
                              <td className="p-4 text-sm">₱{p.price}</td>
                              <td className="p-4 text-sm text-[#8B7D6B]"><span className="bg-white px-2 py-1 rounded-md border border-[#E8DFD3]">{p.cat}</span></td>
                              <td className="p-4 text-right">
                                <button onClick={() => handleEditClick(p)} className="p-2 text-[#8B7D6B] hover:text-[#A0522D]"><Edit2 className="w-4 h-4 inline" /></button>
                                <button onClick={() => handleDelete(p._id, 'product')} className="p-2 text-[#8B7D6B] hover:text-red-500 ml-1"><Trash2 className="w-4 h-4 inline" /></button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  {/* Mobile Inventory */}
                  <div className="md:hidden divide-y divide-[#E8DFD3] border border-[#E8DFD3] rounded-xl">
                    {products.map(p => (
                      <div key={p._id} className="p-4 flex gap-4 items-center">
                        <img src={p.img} alt={p.name} className="w-16 h-16 rounded-xl object-cover border border-[#E8DFD3] shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-sm truncate">{p.name}</h3>
                          <p className="text-xs text-[#8B7D6B] mt-1">₱{p.price} • {p.cat}</p>
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
                <div className="animate-in fade-in duration-300 relative w-full">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    
                    {/* Row 1: Name & Price */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-widest text-[#8B7D6B] mb-2">Product Name</label>
                        <input required value={product.name} onChange={(e) => setProduct({...product, name: e.target.value})} className="w-full px-4 py-3 bg-[#FAF6F1] border border-transparent rounded-xl outline-none focus:bg-white focus:border-[#A0522D] focus:ring-2 focus:ring-[#A0522D]/20 text-sm" />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-widest text-[#8B7D6B] mb-2">Price (₱)</label>
                        <input type="number" required value={product.price} onChange={(e) => setProduct({...product, price: e.target.value})} className="w-full px-4 py-3 bg-[#FAF6F1] border border-transparent rounded-xl outline-none focus:bg-white focus:border-[#A0522D] focus:ring-2 focus:ring-[#A0522D]/20 text-sm" />
                      </div>
                    </div>

                    {/* Row 2: Category & Primary Image */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-widest text-[#8B7D6B] mb-2">Category</label>
                        <select value={product.cat} onChange={(e) => setProduct({...product, cat: e.target.value})} className="w-full px-4 py-3 bg-[#FAF6F1] border border-transparent rounded-xl outline-none text-sm appearance-none">
                          <option>Plastic</option><option>Gemstone</option><option>Glass</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-widest text-[#8B7D6B] mb-2">Primary Image</label>
                        <input type="file" accept="image/*" onChange={(e) => setProduct({...product, imgFile: e.target.files[0]})} className="w-full text-sm text-[#8B7D6B] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-[#E8DFD3] file:text-[#3E2F1C] file:font-medium hover:file:bg-[#D1CBC3] file:cursor-pointer transition-colors" />
                      </div>
                    </div>

                    {/* Row 3: Secondary Image (Full Width) */}
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-widest text-[#8B7D6B] mb-2">Secondary Image (Hover/Detail)</label>
                      <input type="file" accept="image/*" onChange={(e) => setProduct({...product, secondaryImgFile: e.target.files[0]})} className="w-full text-sm text-[#8B7D6B] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-[#E8DFD3] file:text-[#3E2F1C] file:font-medium hover:file:bg-[#D1CBC3] file:cursor-pointer transition-colors" />
                    </div>

                    <button type="submit" className="w-full bg-[#3E2F1C] text-white py-4 rounded-xl font-bold tracking-widest uppercase hover:bg-[#A0522D] mt-2 text-sm transition-colors">
                      {editId ? 'Save Changes' : 'Add to Catalog'}
                    </button>

                    {/* 🚨 SUCCESS MESSAGE MOVED BELOW THE BUTTON 🚨 */}
                    {status && (
                      <div className="mt-4 p-3 bg-[#E8DFD3] text-[#3E2F1C] rounded-xl text-sm font-bold tracking-wide text-center animate-in fade-in duration-300">
                        {status}
                      </div>
                    )}
                  </form>
                </div>
              )}

              

              {/* --- COMMUNITY LOVE TAB --- */}
              {activeTab === 'community' && (
                <div className="animate-in fade-in duration-300 relative w-full">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1">
                      <h3 className="text-xl mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>Add a Review</h3>
                      <form onSubmit={handleReviewSubmit} className="space-y-4 bg-[#FAF6F1] p-6 rounded-xl border border-[#E8DFD3]">
                        <div>
                          <label className="block text-[11px] font-bold uppercase tracking-widest text-[#8B7D6B] mb-2">Customer Name</label>
                          <input required value={reviewForm.author} onChange={(e) => setReviewForm({...reviewForm, author: e.target.value})} className="w-full px-4 py-2.5 bg-white border border-[#E8DFD3] rounded-lg outline-none focus:border-[#A0522D] text-sm" />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold uppercase tracking-widest text-[#8B7D6B] mb-2">Review Text</label>
                          <textarea required value={reviewForm.text} onChange={(e) => setReviewForm({...reviewForm, text: e.target.value})} rows="4" className="w-full px-4 py-2.5 bg-white border border-[#E8DFD3] rounded-lg outline-none focus:border-[#A0522D] text-sm resize-none" />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold uppercase tracking-widest text-[#8B7D6B] mb-2">Rating (1-5)</label>
                          <input type="number" min="1" max="5" required value={reviewForm.rating} onChange={(e) => setReviewForm({...reviewForm, rating: e.target.value})} className="w-full px-4 py-2.5 bg-white border border-[#E8DFD3] rounded-lg outline-none focus:border-[#A0522D] text-sm" />
                        </div>
                        <button type="submit" className="w-full bg-[#3E2F1C] text-white py-3 rounded-lg font-bold tracking-widest uppercase hover:bg-[#A0522D] text-xs">
                          Publish Review
                        </button>
                      </form>
                    </div>
                    <div className="lg:col-span-2">
                      <h3 className="text-xl mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>Live Reviews</h3>
                      {reviews.length === 0 ? (
                        <p className="text-sm text-[#8B7D6B] py-8 text-center border border-dashed border-[#E8DFD3] rounded-xl">No community reviews added yet.</p>
                      ) : (
                        <div className="space-y-4">
                          {reviews.map(r => (
                            <div key={r._id} className="p-5 border border-[#E8DFD3] rounded-xl bg-white flex justify-between items-start gap-4">
                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="font-bold text-sm">{r.author}</span>
                                  <span className="text-[#C9A96E] text-xs">{'★'.repeat(r.rating)}</span>
                                </div>
                                <p className="text-sm text-[#8B7D6B] leading-relaxed">"{r.text}"</p>
                              </div>
                              <button onClick={() => handleDelete(r._id, 'review')} className="p-2 text-[#8B7D6B] hover:text-red-500 hover:bg-red-50 rounded-lg transition-all shrink-0">
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
                    
                    {/* Write/Edit Form */}
                    <div className="xl:col-span-1">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl" style={{ fontFamily: 'Playfair Display, serif' }}>
                          {editBlogId ? 'Edit Article' : 'Write an Article'}
                        </h3>
                        {editBlogId && (
                          <button onClick={() => { setEditBlogId(null); setBlogForm({ title: '', ex: '', content: '', cat: 'Journal', time: '5 min', img: '' }); }} className="text-xs font-bold text-[#8B7D6B] flex items-center gap-1 hover:text-[#3E2F1C]">
                            <X className="w-3 h-3" /> Cancel Edit
                          </button>
                        )}
                      </div>

                      <form onSubmit={handleBlogSubmit} className="space-y-4 bg-[#FAF6F1] p-6 rounded-xl border border-[#E8DFD3]">
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-[#8B7D6B] mb-2">Article Title</label>
                          <input required value={blogForm.title} onChange={(e) => setBlogForm({...blogForm, title: e.target.value})} className="w-full px-4 py-2.5 bg-white border border-[#E8DFD3] rounded-lg outline-none focus:border-[#A0522D] text-sm" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-[#8B7D6B] mb-2">Cover Image URL</label>
                          <input required value={blogForm.img} onChange={(e) => setBlogForm({...blogForm, img: e.target.value})} className="w-full px-4 py-2.5 bg-white border border-[#E8DFD3] rounded-lg outline-none focus:border-[#A0522D] text-sm" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-[#8B7D6B] mb-2">Short Excerpt (Shows on home page)</label>
                          <textarea required value={blogForm.ex} onChange={(e) => setBlogForm({...blogForm, ex: e.target.value})} rows="2" className="w-full px-4 py-2.5 bg-white border border-[#E8DFD3] rounded-lg outline-none focus:border-[#A0522D] text-sm resize-none" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-[#8B7D6B] mb-2">Full Story (Use Enter for paragraphs)</label>
                          <textarea required value={blogForm.content} onChange={(e) => setBlogForm({...blogForm, content: e.target.value})} rows="10" className="w-full px-4 py-2.5 bg-white border border-[#E8DFD3] rounded-lg outline-none focus:border-[#A0522D] text-sm resize-none" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-[#8B7D6B] mb-2">Category</label>
                            <input required value={blogForm.cat} onChange={(e) => setBlogForm({...blogForm, cat: e.target.value})} placeholder="e.g. Style Guide" className="w-full px-4 py-2.5 bg-white border border-[#E8DFD3] rounded-lg outline-none focus:border-[#A0522D] text-sm" />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-[#8B7D6B] mb-2">Read Time</label>
                            <input required value={blogForm.time} onChange={(e) => setBlogForm({...blogForm, time: e.target.value})} placeholder="e.g. 5 min" className="w-full px-4 py-2.5 bg-white border border-[#E8DFD3] rounded-lg outline-none focus:border-[#A0522D] text-sm" />
                          </div>
                        </div>
                        <button type="submit" className="w-full bg-[#3E2F1C] text-white py-3 rounded-lg font-bold tracking-widest uppercase hover:bg-[#A0522D] text-xs mt-2">
                          {editBlogId ? 'Update Article' : 'Publish Article'}
                        </button>
                      </form>
                      {status && status.includes('Article') && <div className="mt-4 text-sm text-center text-[#A0522D] font-bold">{status}</div>}
                    </div>

                    {/* Live Articles List */}
                    <div className="xl:col-span-1">
                      <h3 className="text-xl mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>Live Articles ({blogs.length})</h3>
                      {blogs.length === 0 ? (
                        <p className="text-sm text-[#8B7D6B] py-8 text-center border border-dashed border-[#E8DFD3] rounded-xl">No articles published yet.</p>
                      ) : (
                        <div className="space-y-4">
                          {blogs.map(b => (
                            <div key={b._id} className="p-4 border border-[#E8DFD3] rounded-xl bg-white flex justify-between items-center gap-4 hover:border-[#A0522D] transition-colors">
                              <div className="flex items-center gap-4 flex-1 min-w-0">
                                <img src={b.img} alt="" className="w-16 h-16 rounded-lg object-cover border border-[#E8DFD3]" />
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-bold text-[#3E2F1C] text-sm truncate">{b.title}</h4>
                                  <p className="text-xs text-[#8B7D6B] mt-1">{b.date} • {b.cat}</p>
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
                  <h3 className="text-2xl mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>Storefront Controls</h3>
                  <p className="text-sm text-[#8B7D6B] mb-8 leading-relaxed">Update the text across your customer-facing website.</p>
                  
                  <form onSubmit={handleSettingsSubmit} className="space-y-6 mt-6">
                    <div className="p-6 bg-[#FAF6F1] border border-[#E8DFD3] rounded-xl">
                      <label className="block text-[11px] font-bold uppercase tracking-widest text-[#8B7D6B] mb-3">Top Announcement Banner</label>
                      <input required value={bannerText} onChange={(e) => setBannerText(e.target.value)} className="w-full px-4 py-3 bg-white border border-[#E8DFD3] rounded-lg outline-none focus:border-[#A0522D] text-sm" />
                    </div>

                    <div className="p-6 bg-[#FAF6F1] border border-[#E8DFD3] rounded-xl space-y-4">
                      <label className="block text-[11px] font-bold uppercase tracking-widest text-[#8B7D6B]">Store Highlights / Features</label>
                      <p className="text-xs text-[#8B7D6B] mb-3">These are the three main selling points shown on your site.</p>
                      <input required value={featureOne} onChange={(e) => setFeatureOne(e.target.value)} placeholder="Highlight 1" className="w-full px-4 py-3 bg-white border border-[#E8DFD3] rounded-lg outline-none focus:border-[#A0522D] text-sm" />
                      <input required value={featureTwo} onChange={(e) => setFeatureTwo(e.target.value)} placeholder="Highlight 2" className="w-full px-4 py-3 bg-white border border-[#E8DFD3] rounded-lg outline-none focus:border-[#A0522D] text-sm" />
                      <input required value={featureThree} onChange={(e) => setFeatureThree(e.target.value)} placeholder="Highlight 3" className="w-full px-4 py-3 bg-white border border-[#E8DFD3] rounded-lg outline-none focus:border-[#A0522D] text-sm" />
                    </div>

                    {status && status.includes('Settings') && <div className="text-sm text-center text-[#A0522D] font-bold">{status}</div>}
                    
                    <button type="submit" className="w-full bg-[#3E2F1C] text-white py-4 rounded-xl font-bold tracking-widest uppercase hover:bg-[#A0522D] text-sm">
                      Update Website
                    </button>
                  </form>
                </div>
              )}

            </div>

              {/* --- ORDERS TAB --- */}
              {activeTab === 'orders' && (
                <div className="animate-in fade-in duration-300 w-full space-y-4 relative">
                  <h2 className="text-xl font-bold text-[#3E2F1C] mb-6">Customer Orders</h2>
                  
                  {orders.length === 0 ? (
                    <div className="p-8 text-center text-[#8B7D6B] bg-white rounded-xl shadow-sm">
                      No orders yet. They will appear here once someone checks out!
                    </div>
                  ) : (
                    orders.map((order) => (
                      <div 
                        key={order._id} 
                        onClick={() => setSelectedOrder(order)} // Makes the card clickable!
                        className="bg-white p-5 rounded-xl shadow-sm border border-[#E8DFD3] flex flex-col gap-4 cursor-pointer hover:border-[#A0522D] transition-colors"
                      >
                        
                        {/* Order Header: Customer & Status */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-[#E8DFD3] pb-4 gap-2">
                          <div>
                            <h3 className="font-bold text-[#3E2F1C]">{order.customerName}</h3>
                            <p className="text-xs tracking-wide text-[#8B7D6B]">{order.customerEmail}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-lg font-bold text-[#A0522D]">₱{order.amountPaid}</span>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                              order.status === 'Paid' ? 'bg-green-100 text-green-700' : 
                              order.status === 'Shipped' ? 'bg-blue-100 text-blue-700' : 'bg-[#E8DFD3] text-[#3E2F1C]'
                            }`}>
                              {order.status}
                            </span>

                            {/* Action Buttons for Fulfillment */}
                            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                              {order.status === 'Paid' && (
                                <button 
                                  onClick={() => updateOrderStatus(order._id, 'Shipped')}
                                  className="text-[10px] font-bold uppercase tracking-widest bg-[#3E2F1C] text-white px-3 py-2 rounded-lg hover:bg-[#A0522D] transition-colors"
                                >
                                  Mark Shipped
                                </button>
                              )}
                              {order.status === 'Shipped' && (
                                <button 
                                  onClick={() => updateOrderStatus(order._id, 'Delivered')}
                                  className="text-[10px] font-bold uppercase tracking-widest bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                  Mark Delivered
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Order Items Summary */}
                        <div className="text-sm text-[#3E2F1C]">
                          <span className="font-bold text-[#8B7D6B] mr-2">Items:</span> 
                          {order.items?.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                        </div>
                        
                        {/* Date Footer */}
                        <div className="text-[10px] text-right text-[#8B7D6B] uppercase tracking-widest">
                          Ordered: {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))
                  )}

                  {/* CUSTOMER DETAILS MODAL */}
                  {selectedOrder && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setSelectedOrder(null)}>
                      <div className="w-full max-w-lg bg-[#FAF6F1] rounded-2xl p-6 md:p-8 shadow-2xl relative" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setSelectedOrder(null)} className="absolute top-6 right-6 text-[#8B7D6B] hover:text-[#3E2F1C]">
                          <X className="w-5 h-5" />
                        </button>
                        
                        <h3 className="text-2xl font-bold text-[#3E2F1C] mb-6 border-b border-[#E8DFD3] pb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
                          Order Details
                        </h3>

                        <div className="space-y-6">
                          {/* Contact Section */}
                          <div>
                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#8B7D6B] mb-2">Customer Info</h4>
                            <p className="text-sm text-[#3E2F1C] font-medium">{selectedOrder.customerName}</p>
                            <p className="text-sm text-[#3E2F1C]">{selectedOrder.customerEmail}</p>
                            <p className="text-sm text-[#3E2F1C]">{selectedOrder.contactNumber || 'No Phone Provided'}</p>
                          </div>

                          {/* Shipping Section */}
                          <div>
                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#8B7D6B] mb-2">Shipping Address</h4>
                            {selectedOrder.shippingAddress && selectedOrder.shippingAddress.street ? (
                              <div className="text-sm text-[#3E2F1C] bg-white p-4 rounded-lg border border-[#E8DFD3]">
                                <p>{selectedOrder.shippingAddress.street}</p>
                                <p>Brgy. {selectedOrder.shippingAddress.barangay}, {selectedOrder.shippingAddress.city}</p>
                                <p>{selectedOrder.shippingAddress.region}, {selectedOrder.shippingAddress.postalCode}</p>
                              </div>
                            ) : (
                              <p className="text-sm text-[#8B7D6B] italic">No address recorded (Old Order)</p>
                            )}
                          </div>

                          {/* Items Section */}
                          <div>
                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#8B7D6B] mb-2">Items Purchased</h4>
                            <div className="bg-white rounded-lg border border-[#E8DFD3] divide-y divide-[#E8DFD3]">
                              {selectedOrder.items?.map((item, idx) => (
                                <div key={idx} className="p-3 flex justify-between text-sm">
                                  <span>{item.quantity}x {item.name} {item.color && `(${item.color})`}</span>
                                  <span className="font-medium text-[#8B7D6B]">₱{item.amount / 100}</span>
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

          {/* FLOATING ACTION BUTTON (Mobile Only) */}
          {/* It ONLY shows up when the user is explicitly viewing the product list */}
          {activeTab === 'inventory' && (
            <button 
              onClick={() => setActiveTab('form')} 
              className="md:hidden fixed bottom-24 right-6 w-14 h-14 bg-[#3E2F1C] text-[#FAF6F1] rounded-full flex items-center justify-center shadow-xl z-50 hover:bg-[#A0522D] transition-all active:scale-95 border-2 border-[#5A4A38]"
              aria-label="Add new product"
            >
              <Plus className="w-6 h-6" />
            </button>
          )}
          </div>
        </main>

        {/* MOBILE BOTTOM NAVIGATION */}
        <nav className="md:hidden absolute bottom-0 left-0 right-0 bg-white border-t border-[#E8DFD3] flex justify-around p-2 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20">
          <NavButton id="overview" icon={LayoutDashboard} label="Overview" />
          <NavButton id="inventory" icon={Package} label="Catalog" />
          {/* Added the Journal Tab here */}
          <NavButton id="journal" icon={BookOpen} label="Journal" /> 
          <NavButton id="community" icon={MessageSquare} label="Reviews" />
          <NavButton id="settings" icon={SettingsIcon} label="Settings" />
        </nav>
        
        {/* --- UNIVERSAL CUSTOM POP-UP (MODAL) --- */}
      {popup.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          
          {/* Modal Box - Responsive for Mobile & PC */}
          <div className="w-full max-w-sm bg-[#FAF6F1] rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-[#3E2F1C] mb-2">
              {popup.title}
            </h3>
            <p className="text-sm text-[#8B7D6B] mb-8 leading-relaxed">
              {popup.message}
            </p>
            
            <div className="flex gap-3 justify-end">
              {/* Only show Cancel button if it's a confirmation */}
              {popup.isConfirm && (
                <button 
                  onClick={closePopup} 
                  className="px-5 py-2.5 text-sm font-bold text-[#8B7D6B] bg-[#E8DFD3] rounded-xl hover:bg-[#D1CBC3] transition-colors"
                >
                  Cancel
                </button>
              )}
              
              <button 
                onClick={() => {
                  if (popup.onConfirm) popup.onConfirm();
                  closePopup();
                }} 
                className={`px-5 py-2.5 text-sm font-bold text-white rounded-xl transition-colors ${
                  popup.title.toLowerCase().includes('delete') 
                    ? 'bg-red-600 hover:bg-red-700' // Make it red if it's a delete action
                    : 'bg-[#3E2F1C] hover:bg-[#A0522D]' // Otherwise use your brand colors
                }`}
              >
                {popup.isConfirm ? 'Confirm' : 'Okay'}
              </button>
            </div>
          </div>

        </div>
      )}

      </div>

    </div>
  );
}

