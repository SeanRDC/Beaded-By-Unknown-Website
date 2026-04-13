import { useState, useEffect } from 'react';
import { LayoutDashboard, Package, Plus, Trash2, Edit2, TrendingUp, DollarSign, ShoppingBag, X, KeyRound, Wifi, WifiOff } from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview'); 
  const [secretKey, setSecretKey] = useState('');
  const [status, setStatus] = useState('');
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({ revenue: 0, totalOrders: 0 });
  const [editId, setEditId] = useState(null);
  
  // Real-time server connection state
  const [serverStatus, setServerStatus] = useState('checking'); 
  
  const [product, setProduct] = useState({
    name: '', price: '', img: '', img2: '', cat: 'Gemstone', mat: '', tag: '', colors: '', sizes: 'S, M, L'
  });

  // The Ping function: Actively checks if the backend is alive
  const checkConnectionAndFetch = async () => {
    try {
      const res = await fetch('http://localhost:4242/api/products');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setProducts(data);
        setServerStatus('online'); 
      } else {
        setServerStatus('offline');
      }
    } catch (err) {
      setServerStatus('offline');
    }
  };

  const fetchStats = async () => {
    if (!secretKey) return;
    try {
      const res = await fetch('http://localhost:4242/api/admin/stats', { headers: { 'admin_secret': secretKey } });
      const data = await res.json();
      if (res.ok) setStats(data);
    } catch (err) {
      console.error("Failed to fetch stats");
    }
  };

  // Initial load + Set up a 15-second recurring ping
  useEffect(() => { 
    checkConnectionAndFetch(); 
    const interval = setInterval(checkConnectionAndFetch, 15000);
    return () => clearInterval(interval);
  }, []);
  
  useEffect(() => { if (secretKey) fetchStats(); }, [secretKey]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!secretKey) return setStatus('❌ Admin Key Required.');
    setStatus('Saving...');

    const formattedProduct = {
      ...product,
      price: Number(product.price),
      colors: product.colors.split(',').map(c => c.trim()).filter(Boolean),
      sizes: product.sizes.split(',').map(s => s.trim().toUpperCase()).filter(Boolean)
    };

    const url = editId ? `http://localhost:4242/api/admin/products/${editId}` : 'http://localhost:4242/api/admin/products';
    const method = editId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'admin_secret': secretKey },
        body: JSON.stringify(formattedProduct)
      });

      if (res.ok) {
        setStatus(`✅ Product ${editId ? 'updated' : 'added'}!`);
        setProduct({ name: '', price: '', img: '', img2: '', cat: 'Gemstone', mat: '', tag: '', colors: '', sizes: 'S, M, L' });
        setEditId(null);
        checkConnectionAndFetch();
        setTimeout(() => { setStatus(''); setActiveTab('inventory'); }, 1500);
      } else {
        const data = await res.json();
        setStatus(`❌ Error: ${data.error}`);
      }
    } catch (err) {
      setStatus('❌ Failed to connect to server.');
    }
  };

  const handleEditClick = (p) => {
    setEditId(p._id);
    setProduct({ ...p, colors: p.colors ? p.colors.join(', ') : '', sizes: p.sizes ? p.sizes.join(', ') : '' });
    setActiveTab('form');
  };

  const handleDelete = async (id) => {
    if (!secretKey) return alert("Admin Secret Key required.");
    if (!window.confirm("Delete this product permanently?")) return;
    try {
      const res = await fetch(`http://localhost:4242/api/admin/products/${id}`, { method: 'DELETE', headers: { 'admin_secret': secretKey } });
      if (res.ok) checkConnectionAndFetch();
    } catch (err) {
      alert("Server error.");
    }
  };

  const NavButton = ({ id, icon: Icon, label }) => (
    <button 
      onClick={() => { setActiveTab(id); if(id === 'form') { setEditId(null); setProduct({ name: '', price: '', img: '', img2: '', cat: 'Gemstone', mat: '', tag: '', colors: '', sizes: 'S, M, L' }); } }} 
      className={`flex flex-col md:flex-row items-center gap-1 md:gap-3 p-3 md:px-4 md:py-3 w-full md:rounded-lg text-xs md:text-sm font-medium transition-all duration-200 ${
        activeTab === id ? 'text-[#A0522D] md:bg-[#3E2F1C] md:text-white' : 'text-[#8B7D6B] hover:text-[#3E2F1C] md:hover:bg-[#E8DFD3]'
      }`}
    >
      <Icon className={`w-5 h-5 md:w-4 md:h-4 ${activeTab === id && 'md:text-[#C9A96E]'}`} />
      <span className="hidden md:inline">{label}</span>
      <span className="md:hidden">{label.split(' ')[0]}</span>
    </button>
  );

  return (
    <div className="h-screen w-full flex flex-col md:flex-row bg-[#FAF6F1] text-[#3E2F1C] font-sans overflow-hidden">
      
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex w-64 flex-col bg-white border-r border-[#E8DFD3] z-20 shrink-0">
        <div className="p-6 border-b border-[#E8DFD3]">
          <h1 className="text-2xl font-bold tracking-wide" style={{ fontFamily: 'Playfair Display, serif' }}>
            BEADED <span className="font-light text-[#A0522D]">ADMIN</span>
          </h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <NavButton id="overview" icon={LayoutDashboard} label="Overview & Sales" />
          <NavButton id="inventory" icon={Package} label="Inventory Catalog" />
          <NavButton id="form" icon={Plus} label={editId ? 'Edit Product' : 'Add Product'} />
        </nav>
      </aside>

      {/* MAIN CONTENT AREA - Locked min-w-0 prevents flexbox blowout */}
      <div className="flex-1 flex flex-col h-full relative overflow-hidden min-w-0">
        
        {/* Top Header Bar */}
        <header className="bg-white border-b border-[#E8DFD3] px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between shrink-0 z-10">
          <h2 className="text-lg font-bold md:hidden" style={{ fontFamily: 'Playfair Display, serif' }}>Hello, Iyesha ✨</h2>
          <h2 className="hidden md:flex items-center text-xl" style={{ fontFamily: 'Playfair Display, serif' }}>
            Hello, Iyesha 
            <span className="text-[#8B7D6B] text-sm ml-3 font-sans font-normal tracking-wide hidden lg:inline-block border-l border-[#E8DFD3] pl-3">
              {activeTab === 'overview' && 'Business Overview'}
              {activeTab === 'inventory' && 'Catalog Management'}
              {activeTab === 'form' && (editId ? 'Edit Details' : 'Create New Product')}
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

        {/* THE FIXED CANVAS WRAPPER 
          This forces the background to be scrollable, while the white card inside stays a perfectly locked width.
          The [&::-webkit-scrollbar]:hidden removes the visual scrollbar block entirely.
        */}
        <main className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] p-4 sm:p-6 lg:p-8 pb-24 md:pb-8 flex justify-center items-start">
          
          {/* THE LOCKED WHITE WINDOW - Size will never change horizontally */}
          <div className="w-full max-w-5xl bg-white border border-[#E8DFD3] rounded-2xl shadow-sm min-h-[75vh] flex flex-col relative overflow-hidden">
            
            {/* Real-Time Connection Banner (Always at the top of the canvas) */}
            <div className={`w-full px-6 py-3 flex items-center justify-between border-b text-sm font-medium transition-colors ${serverStatus === 'online' ? 'bg-green-50 border-green-100 text-green-800' : serverStatus === 'checking' ? 'bg-blue-50 border-blue-100 text-blue-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
              <div className="flex items-center gap-2">
                {serverStatus === 'online' ? <Wifi className="w-4 h-4" /> : serverStatus === 'checking' ? <TrendingUp className="w-4 h-4 animate-pulse" /> : <WifiOff className="w-4 h-4" />}
                <span>
                  {serverStatus === 'online' ? 'System Live & Synced via MongoDB Atlas' : serverStatus === 'checking' ? 'Establishing secure connection...' : 'Connection Offline — Node Server is Unreachable'}
                </span>
              </div>
              <div className="hidden sm:block text-xs opacity-70">Auto-pings every 15s</div>
            </div>

            {/* TAB CONTENT AREA */}
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
                        <div className="p-2 bg-white rounded-lg shadow-sm"><DollarSign className="w-5 h-5 text-[#A0522D]" /></div>
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
                    <div className="h-[300px] flex flex-col items-center justify-center text-[#8B7D6B] bg-[#FAF6F1] rounded-xl border border-[#E8DFD3] border-dashed">
                      <Package className="w-12 h-12 mb-3 opacity-20" />
                      <p>Your catalog is currently empty.</p>
                    </div>
                  ) : (
                    <>
                      {/* Desktop Table View */}
                      <div className="hidden md:block overflow-x-auto border border-[#E8DFD3] rounded-xl">
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
                              <tr key={p._id} className="border-b border-[#E8DFD3] hover:bg-[#FAF6F1] transition-colors last:border-0">
                                <td className="p-4 flex items-center gap-4">
                                  <img src={p.img} alt={p.name} className="w-12 h-12 rounded-lg object-cover border border-[#E8DFD3] bg-white shadow-sm" />
                                  <span className="font-medium text-sm">{p.name}</span>
                                </td>
                                <td className="p-4 text-sm">${p.price}</td>
                                <td className="p-4 text-sm text-[#8B7D6B]"><span className="bg-white px-2 py-1 rounded-md border border-[#E8DFD3]">{p.cat}</span></td>
                                <td className="p-4 text-right">
                                  <button onClick={() => handleEditClick(p)} className="p-2 text-[#8B7D6B] hover:text-[#A0522D] hover:bg-white rounded-lg transition-all shadow-sm border border-transparent hover:border-[#E8DFD3]" title="Edit"><Edit2 className="w-4 h-4 inline" /></button>
                                  <button onClick={() => handleDelete(p._id)} className="p-2 text-[#8B7D6B] hover:text-red-500 hover:bg-red-50 rounded-lg transition-all ml-1 shadow-sm border border-transparent hover:border-red-100" title="Delete"><Trash2 className="w-4 h-4 inline" /></button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Mobile Card View */}
                      <div className="md:hidden divide-y divide-[#E8DFD3] border border-[#E8DFD3] rounded-xl">
                        {products.map(p => (
                          <div key={p._id} className="p-4 flex gap-4 items-center">
                            <img src={p.img} alt={p.name} className="w-16 h-16 rounded-xl object-cover border border-[#E8DFD3] shrink-0" />
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-sm truncate">{p.name}</h3>
                              <p className="text-xs text-[#8B7D6B] mt-1">${p.price} • {p.cat}</p>
                            </div>
                            <div className="flex flex-col gap-2 shrink-0">
                              <button onClick={() => handleEditClick(p)} className="p-2 bg-[#FAF6F1] text-[#3E2F1C] rounded-lg"><Edit2 className="w-4 h-4" /></button>
                              <button onClick={() => handleDelete(p._id)} className="p-2 bg-red-50 text-red-600 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* --- FORM TAB --- */}
              {activeTab === 'form' && (
                <div className="animate-in fade-in duration-300 relative w-full">
                  {editId && (
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="font-bold text-lg">Editing Product</h3>
                      <button onClick={() => { setEditId(null); setActiveTab('inventory'); }} className="text-[#8B7D6B] hover:text-[#3E2F1C] flex items-center gap-1 text-sm bg-[#FAF6F1] px-3 py-1.5 rounded-lg border border-[#E8DFD3] transition-colors">
                        <X className="w-4 h-4" /> Cancel Edit
                      </button>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-widest text-[#8B7D6B] mb-2">Product Name</label>
                        <input required value={product.name} onChange={(e) => setProduct({...product, name: e.target.value})} className="w-full px-4 py-3 bg-[#FAF6F1] border border-transparent rounded-xl outline-none focus:bg-white focus:border-[#A0522D] focus:ring-2 focus:ring-[#A0522D]/20 transition-all text-sm" />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-widest text-[#8B7D6B] mb-2">Price</label>
                        <input type="number" required value={product.price} onChange={(e) => setProduct({...product, price: e.target.value})} className="w-full px-4 py-3 bg-[#FAF6F1] border border-transparent rounded-xl outline-none focus:bg-white focus:border-[#A0522D] focus:ring-2 focus:ring-[#A0522D]/20 transition-all text-sm" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-widest text-[#8B7D6B] mb-2">Primary Image URL</label>
                        <input required value={product.img} onChange={(e) => setProduct({...product, img: e.target.value})} className="w-full px-4 py-3 bg-[#FAF6F1] border border-transparent rounded-xl outline-none focus:bg-white focus:border-[#A0522D] focus:ring-2 focus:ring-[#A0522D]/20 transition-all text-sm" />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-widest text-[#8B7D6B] mb-2">Hover Image (Optional)</label>
                        <input value={product.img2} onChange={(e) => setProduct({...product, img2: e.target.value})} className="w-full px-4 py-3 bg-[#FAF6F1] border border-transparent rounded-xl outline-none focus:bg-white focus:border-[#A0522D] focus:ring-2 focus:ring-[#A0522D]/20 transition-all text-sm" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-widest text-[#8B7D6B] mb-2">Category</label>
                        <select value={product.cat} onChange={(e) => setProduct({...product, cat: e.target.value})} className="w-full px-4 py-3 bg-[#FAF6F1] border border-transparent rounded-xl outline-none focus:bg-white focus:border-[#A0522D] focus:ring-2 focus:ring-[#A0522D]/20 transition-all text-sm appearance-none">
                          <option>Gemstone</option><option>Pearl</option><option>Wood</option><option>Metal</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-widest text-[#8B7D6B] mb-2">Material</label>
                        <input value={product.mat} onChange={(e) => setProduct({...product, mat: e.target.value})} className="w-full px-4 py-3 bg-[#FAF6F1] border border-transparent rounded-xl outline-none focus:bg-white focus:border-[#A0522D] focus:ring-2 focus:ring-[#A0522D]/20 transition-all text-sm" />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-widest text-[#8B7D6B] mb-2">Tag</label>
                        <input value={product.tag} onChange={(e) => setProduct({...product, tag: e.target.value})} placeholder="e.g. Bestseller" className="w-full px-4 py-3 bg-[#FAF6F1] border border-transparent rounded-xl outline-none focus:bg-white focus:border-[#A0522D] focus:ring-2 focus:ring-[#A0522D]/20 transition-all text-sm" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-6 border-t border-[#E8DFD3]">
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-widest text-[#8B7D6B] mb-2">Colors (Hex)</label>
                        <input value={product.colors} onChange={(e) => setProduct({...product, colors: e.target.value})} placeholder="#FFF, #000" className="w-full px-4 py-3 bg-[#FAF6F1] border border-transparent rounded-xl outline-none focus:bg-white focus:border-[#A0522D] focus:ring-2 focus:ring-[#A0522D]/20 transition-all text-sm" />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-widest text-[#8B7D6B] mb-2">Sizes</label>
                        <input value={product.sizes} onChange={(e) => setProduct({...product, sizes: e.target.value})} placeholder="S, M, L" className="w-full px-4 py-3 bg-[#FAF6F1] border border-transparent rounded-xl outline-none focus:bg-white focus:border-[#A0522D] focus:ring-2 focus:ring-[#A0522D]/20 transition-all text-sm" />
                      </div>
                    </div>

                    {status && (
                      <div className={`p-4 rounded-xl text-sm font-bold text-center ${status.includes('✅') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                        {status}
                      </div>
                    )}

                    <button type="submit" className="w-full bg-[#3E2F1C] text-white py-4 rounded-xl font-bold tracking-widest uppercase hover:bg-[#A0522D] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 mt-2 text-sm">
                      {editId ? 'Save Changes' : 'Add to Catalog'}
                    </button>
                  </form>
                </div>
              )}

            </div>
          </div>
        </main>

        {/* MOBILE BOTTOM NAVIGATION */}
        <nav className="md:hidden absolute bottom-0 left-0 right-0 bg-white border-t border-[#E8DFD3] flex justify-around p-2 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20">
          <NavButton id="overview" icon={LayoutDashboard} label="Overview" />
          <NavButton id="inventory" icon={Package} label="Inventory" />
          <NavButton id="form" icon={Plus} label="Add" />
        </nav>

      </div>
    </div>
  );
}