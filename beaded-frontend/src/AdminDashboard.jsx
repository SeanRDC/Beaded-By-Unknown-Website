import { useState, useEffect } from 'react';
import { LayoutDashboard, Package, Plus, Trash2, Edit2, TrendingUp, DollarSign, ShoppingBag, X } from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview'); // overview, inventory, form
  const [secretKey, setSecretKey] = useState('');
  const [status, setStatus] = useState('');
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({ revenue: 0, totalOrders: 0 });
  const [editId, setEditId] = useState(null);
  
  const [product, setProduct] = useState({
    name: '', price: '', img: '', img2: '', cat: 'Gemstone', 
    mat: '', tag: '', colors: '', sizes: 'S, M, L'
  });

  const fetchProducts = async () => {
    try {
      const res = await fetch('http://localhost:4242/api/products');
      const data = await res.json();
      if (Array.isArray(data)) setProducts(data);
    } catch (err) {
      console.error("Failed to fetch products");
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const fetchStats = async () => {
    if (!secretKey) return; // We need the key to fetch stats
    try {
      const res = await fetch('http://localhost:4242/api/admin/stats', {
        headers: { 'admin_secret': secretKey }
      });
      const data = await res.json();
      if (res.ok) setStats(data);
    } catch (err) {
      console.error("Failed to fetch stats");
    }
  };

  // Update the useEffect to run fetchStats whenever the secretKey changes
  useEffect(() => { 
    fetchProducts(); 
  }, []);

  useEffect(() => {
    if (secretKey) fetchStats();
  }, [secretKey]);

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
        method: method,
        headers: { 'Content-Type': 'application/json', 'admin_secret': secretKey },
        body: JSON.stringify(formattedProduct)
      });

      if (res.ok) {
        setStatus(`✅ Product ${editId ? 'updated' : 'added'}!`);
        setProduct({ name: '', price: '', img: '', img2: '', cat: 'Gemstone', mat: '', tag: '', colors: '', sizes: 'S, M, L' });
        setEditId(null);
        fetchProducts();
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
      const res = await fetch(`http://localhost:4242/api/admin/products/${id}`, {
        method: 'DELETE',
        headers: { 'admin_secret': secretKey }
      });
      if (res.ok) fetchProducts();
    } catch (err) {
      alert("Server error.");
    }
  };

  // Mock Sales Data (Until PayMongo Webhooks are linked)
  const mockSales = { revenue: 12450, orders: 42, topItem: products[0]?.name || 'N/A' };

  return (
    <div className="min-h-screen bg-[#FAF6F1] text-[#3E2F1C] font-sans">
      
      {/* Top Navigation */}
      <nav className="bg-white border-b border-[#E8DFD3] sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-wide" style={{ fontFamily: 'Playfair Display, serif' }}>
            BEADED <span className="font-light text-[#A0522D]">ADMIN</span>
          </h1>
          
          {/* Secret Key Input (Minimalist) */}
          <div className="hidden md:flex items-center gap-3">
            <span className="text-xs uppercase tracking-widest text-[#8B7D6B]">Key:</span>
            <input 
              type="password" 
              value={secretKey} 
              onChange={(e) => setSecretKey(e.target.value)} 
              className="w-32 px-3 py-1 text-sm bg-[#FAF6F1] border border-[#E8DFD3] rounded-md outline-none focus:border-[#A0522D]"
              placeholder="••••••••"
            />
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8 md:flex gap-10">
        
        {/* Sidebar Tabs */}
        <aside className="md:w-64 shrink-0 mb-8 md:mb-0 space-y-2">
          <button onClick={() => setActiveTab('overview')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'overview' ? 'bg-[#3E2F1C] text-white' : 'text-[#8B7D6B] hover:bg-[#E8DFD3] hover:text-[#3E2F1C]'}`}>
            <LayoutDashboard className="w-4 h-4" /> Overview & Sales
          </button>
          <button onClick={() => setActiveTab('inventory')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'inventory' ? 'bg-[#3E2F1C] text-white' : 'text-[#8B7D6B] hover:bg-[#E8DFD3] hover:text-[#3E2F1C]'}`}>
            <Package className="w-4 h-4" /> Inventory Catalog
          </button>
          <button onClick={() => { setActiveTab('form'); setEditId(null); setProduct({ name: '', price: '', img: '', img2: '', cat: 'Gemstone', mat: '', tag: '', colors: '', sizes: 'S, M, L' }); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'form' ? 'bg-[#3E2F1C] text-white' : 'text-[#8B7D6B] hover:bg-[#E8DFD3] hover:text-[#3E2F1C]'}`}>
            <Plus className="w-4 h-4" /> {editId ? 'Edit Product' : 'Add New Product'}
          </button>
          
          {/* Mobile Secret Key */}
          <div className="md:hidden mt-8 pt-6 border-t border-[#E8DFD3]">
             <label className="text-xs uppercase tracking-widest text-[#8B7D6B] mb-2 block">Admin Key</label>
             <input type="password" value={secretKey} onChange={(e) => setSecretKey(e.target.value)} className="w-full px-3 py-2 text-sm bg-white border border-[#E8DFD3] rounded-md outline-none focus:border-[#A0522D]" placeholder="Enter .env Secret" />
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 bg-white rounded-2xl shadow-sm border border-[#E8DFD3] p-6 md:p-10 min-h-[600px]">
          
          {/* ---------------- OVERVIEW TAB ---------------- */}
          {activeTab === 'overview' && (
            <div className="animate-in fade-in duration-300">
              <h2 className="text-2xl mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>Business Overview</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="p-6 bg-[#FAF6F1] rounded-xl border border-[#E8DFD3]">
                  <div className="flex justify-between items-start mb-4">
                    <p className="text-sm text-[#8B7D6B] font-medium uppercase tracking-wider">Total Inventory</p>
                    <Package className="w-5 h-5 text-[#A0522D]" />
                  </div>
                  <h3 className="text-3xl font-light">{products.length} <span className="text-sm text-[#8B7D6B]">items</span></h3>
                </div>
                
                <div className="p-6 bg-[#FAF6F1] rounded-xl border border-[#E8DFD3]">
                  <div className="flex justify-between items-start mb-4">
                    <p className="text-sm text-[#8B7D6B] font-medium uppercase tracking-wider">Gross Revenue</p>
                    <DollarSign className="w-5 h-5 text-[#A0522D]" />
                  </div>
                  <h3 className="text-3xl font-light">₱{stats.revenue.toLocaleString()}</h3>
                </div>

                <div className="p-6 bg-[#FAF6F1] rounded-xl border border-[#E8DFD3]">
                  <div className="flex justify-between items-start mb-4">
                    <p className="text-sm text-[#8B7D6B] font-medium uppercase tracking-wider">Total Orders</p>
                    <ShoppingBag className="w-5 h-5 text-[#A0522D]" />
                  </div>
                  <h3 className="text-3xl font-light">{stats.totalOrders}</h3>
                </div>
              </div>

              <div className="p-6 border border-[#E8DFD3] rounded-xl bg-white">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="w-5 h-5 text-[#A0522D]" />
                  <h3 className="font-bold">Sales Tracking Status</h3>
                </div>
                <p className="text-sm text-[#8B7D6B] leading-relaxed">
                  Your current product inventory is synced directly with MongoDB in real-time. The revenue and order statistics above are currently placeholders. To display live sales data, we need to connect a Webhook to your PayMongo account so the backend knows when a checkout is completed.
                </p>
              </div>
            </div>
          )}

          {/* ---------------- INVENTORY TAB ---------------- */}
          {activeTab === 'inventory' && (
            <div className="animate-in fade-in duration-300">
              <h2 className="text-2xl mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>Catalog Management</h2>
              
              {products.length === 0 ? (
                <p className="text-center text-[#8B7D6B] py-12">Your catalog is empty.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#E8DFD3] text-xs uppercase tracking-widest text-[#8B7D6B]">
                        <th className="pb-4 font-medium">Product</th>
                        <th className="pb-4 font-medium">Price</th>
                        <th className="pb-4 font-medium">Category</th>
                        <th className="pb-4 font-medium text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map(p => (
                        <tr key={p._id} className="border-b border-[#E8DFD3] hover:bg-[#FAF6F1] transition-colors group">
                          <td className="py-4 flex items-center gap-4">
                            <img src={p.img} alt={p.name} className="w-10 h-10 rounded-md object-cover border border-[#E8DFD3]" />
                            <span className="font-medium text-sm">{p.name}</span>
                          </td>
                          <td className="py-4 text-sm">${p.price}</td>
                          <td className="py-4 text-sm text-[#8B7D6B]">{p.cat}</td>
                          <td className="py-4 text-right">
                            <button onClick={() => handleEditClick(p)} className="p-2 text-[#8B7D6B] hover:text-[#A0522D] transition-colors" title="Edit">
                              <Edit2 className="w-4 h-4 inline" />
                            </button>
                            <button onClick={() => handleDelete(p._id)} className="p-2 text-[#8B7D6B] hover:text-red-500 transition-colors ml-2" title="Delete">
                              <Trash2 className="w-4 h-4 inline" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ---------------- FORM TAB ---------------- */}
          {activeTab === 'form' && (
            <div className="animate-in fade-in duration-300 relative">
              {editId && (
                <button onClick={() => { setEditId(null); setActiveTab('inventory'); }} className="absolute right-0 top-0 text-[#8B7D6B] hover:text-[#3E2F1C] flex items-center gap-1 text-sm">
                  <X className="w-4 h-4" /> Cancel Edit
                </button>
              )}
              
              <h2 className="text-2xl mb-8" style={{ fontFamily: 'Playfair Display, serif' }}>
                {editId ? 'Edit Product Details' : 'Create New Product'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-[#8B7D6B] mb-1">Product Name</label>
                    <input required value={product.name} onChange={(e) => setProduct({...product, name: e.target.value})} className="w-full px-4 py-2.5 bg-[#FAF6F1] rounded-lg outline-none focus:ring-1 focus:ring-[#A0522D]" />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-[#8B7D6B] mb-1">Price</label>
                    <input type="number" required value={product.price} onChange={(e) => setProduct({...product, price: e.target.value})} className="w-full px-4 py-2.5 bg-[#FAF6F1] rounded-lg outline-none focus:ring-1 focus:ring-[#A0522D]" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-[#8B7D6B] mb-1">Primary Image URL</label>
                    <input required value={product.img} onChange={(e) => setProduct({...product, img: e.target.value})} className="w-full px-4 py-2.5 bg-[#FAF6F1] rounded-lg outline-none focus:ring-1 focus:ring-[#A0522D]" />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-[#8B7D6B] mb-1">Hover Image URL (Optional)</label>
                    <input value={product.img2} onChange={(e) => setProduct({...product, img2: e.target.value})} className="w-full px-4 py-2.5 bg-[#FAF6F1] rounded-lg outline-none focus:ring-1 focus:ring-[#A0522D]" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-[#8B7D6B] mb-1">Category</label>
                    <select value={product.cat} onChange={(e) => setProduct({...product, cat: e.target.value})} className="w-full px-4 py-2.5 bg-[#FAF6F1] rounded-lg outline-none focus:ring-1 focus:ring-[#A0522D]">
                      <option>Gemstone</option><option>Pearl</option><option>Wood</option><option>Metal</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-[#8B7D6B] mb-1">Material</label>
                    <input value={product.mat} onChange={(e) => setProduct({...product, mat: e.target.value})} className="w-full px-4 py-2.5 bg-[#FAF6F1] rounded-lg outline-none focus:ring-1 focus:ring-[#A0522D]" />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-[#8B7D6B] mb-1">Tag</label>
                    <input value={product.tag} onChange={(e) => setProduct({...product, tag: e.target.value})} className="w-full px-4 py-2.5 bg-[#FAF6F1] rounded-lg outline-none focus:ring-1 focus:ring-[#A0522D]" placeholder="e.g. Bestseller" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 border-t border-[#E8DFD3]">
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-[#8B7D6B] mb-1">Colors (Hex Codes)</label>
                    <input value={product.colors} onChange={(e) => setProduct({...product, colors: e.target.value})} className="w-full px-4 py-2.5 bg-[#FAF6F1] rounded-lg outline-none focus:ring-1 focus:ring-[#A0522D]" placeholder="#FFFFFF, #000000" />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-[#8B7D6B] mb-1">Sizes</label>
                    <input value={product.sizes} onChange={(e) => setProduct({...product, sizes: e.target.value})} className="w-full px-4 py-2.5 bg-[#FAF6F1] rounded-lg outline-none focus:ring-1 focus:ring-[#A0522D]" placeholder="S, M, L" />
                  </div>
                </div>

                {status && (
                  <div className={`p-3 rounded-md text-sm font-medium text-center ${status.includes('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {status}
                  </div>
                )}

                <button type="submit" className="w-full bg-[#3E2F1C] text-white py-3.5 rounded-lg font-medium tracking-wide hover:bg-[#2A1F13] transition-colors mt-4">
                  {editId ? 'Save Changes' : 'Add to Catalog'}
                </button>
              </form>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}