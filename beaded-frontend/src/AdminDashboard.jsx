import { useState, useEffect } from 'react';
import { ShieldCheck, Plus, Image as ImageIcon, Trash2, Edit2, X } from 'lucide-react';

export default function AdminDashboard() {
  const [secretKey, setSecretKey] = useState('');
  const [status, setStatus] = useState('');
  const [products, setProducts] = useState([]);
  const [editId, setEditId] = useState(null); // Tracks if we are editing an existing item
  
  const [product, setProduct] = useState({
    name: '', price: '', img: '', img2: '', cat: 'Gemstone', 
    mat: '', tag: '', colors: '', sizes: 'S, M, L'
  });

  // 1. Fetch existing products when dashboard loads
  const fetchProducts = async () => {
    try {
      const res = await fetch('http://localhost:4242/api/products');
      const data = await res.json();
      if (Array.isArray(data)) setProducts(data);
    } catch (err) {
      console.error("Failed to fetch products");
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // 2. Handle Add OR Update
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!secretKey) return setStatus('❌ Please enter your Admin Secret Key first.');
    setStatus('Uploading...');

    // Format strings back into arrays for MongoDB
    const formattedProduct = {
      ...product,
      price: Number(product.price),
      colors: product.colors.split(',').map(c => c.trim()).filter(Boolean),
      sizes: product.sizes.split(',').map(s => s.trim().toUpperCase()).filter(Boolean)
    };

    // If editId exists, we are UPDATING. If not, we are ADDING.
    const url = editId 
      ? `http://localhost:4242/api/admin/products/${editId}` 
      : 'http://localhost:4242/api/admin/products';
    
    const method = editId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json', 'admin_secret': secretKey },
        body: JSON.stringify(formattedProduct)
      });

      const data = await res.json();

      if (res.ok) {
        setStatus(`✅ Product ${editId ? 'updated' : 'added'} successfully!`);
        setProduct({ name: '', price: '', img: '', img2: '', cat: 'Gemstone', mat: '', tag: '', colors: '', sizes: 'S, M, L' });
        setEditId(null);
        fetchProducts(); // Refresh the list!
        setTimeout(() => setStatus(''), 3000);
      } else {
        setStatus(`❌ Error: ${data.error}`);
      }
    } catch (err) {
      setStatus('❌ Failed to connect to server.');
    }
  };

  // 3. Handle Edit Button Click (Puts data back into the form)
  const handleEditClick = (p) => {
    setEditId(p._id);
    setProduct({
      ...p,
      // Convert MongoDB arrays back to comma-separated strings for the text boxes
      colors: p.colors ? p.colors.join(', ') : '',
      sizes: p.sizes ? p.sizes.join(', ') : ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll up to the form
  };

  // 4. Handle Delete Button Click
  const handleDelete = async (id) => {
    if (!secretKey) return alert("You must enter the Admin Secret Key at the top first!");
    if (!window.confirm("Are you sure you want to completely delete this product?")) return;

    try {
      const res = await fetch(`http://localhost:4242/api/admin/products/${id}`, {
        method: 'DELETE',
        headers: { 'admin_secret': secretKey }
      });
      if (res.ok) {
        fetchProducts(); // Refresh list to remove the deleted item
      } else {
        const data = await res.json();
        alert(`Failed to delete: ${data.error}`);
      }
    } catch (err) {
      alert("Failed to connect to server.");
    }
  };

  return (
    <div className="min-h-screen bg-[#F0EBE4] py-12 px-5">
      <div className="max-w-[1000px] mx-auto space-y-8">
        
        {/* THE FORM SECTION */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-[#3E2F1C] p-8 text-center text-white relative">
            <ShieldCheck className="w-12 h-12 mx-auto mb-4 text-[#C9A96E]" />
            <h1 className="text-3xl" style={{ fontFamily: 'Playfair Display, serif' }}>
              {editId ? 'Editing Product' : 'Admin Control'}
            </h1>
            <p className="text-[#B0A395] text-sm mt-2 tracking-widest uppercase">Catalog Manager</p>
            {editId && (
              <button onClick={() => { setEditId(null); setProduct({ name: '', price: '', img: '', img2: '', cat: 'Gemstone', mat: '', tag: '', colors: '', sizes: 'S, M, L' }); }} className="absolute top-6 right-6 text-[#B0A395] hover:text-white flex items-center gap-1 text-sm border border-[#B0A395] px-3 py-1 rounded-full transition-colors">
                <X className="w-4 h-4" /> Cancel Edit
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="bg-[#FAF6F1] p-5 rounded-xl border border-[#E8DFD3]">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#A0522D] mb-2">Admin Security Key</label>
              <input type="password" required value={secretKey} onChange={(e) => setSecretKey(e.target.value)} placeholder="Required for ALL actions..." className="w-full px-4 py-3 rounded-lg border border-[#E8DFD3] outline-none focus:border-[#A0522D]" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-[#3E2F1C] mb-2">Product Name</label>
                <input required value={product.name} onChange={(e) => setProduct({...product, name: e.target.value})} className="w-full px-4 py-3 rounded-lg border border-[#E8DFD3]" placeholder="e.g. Sunstone Serenity" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#3E2F1C] mb-2">Price ($)</label>
                <input type="number" required value={product.price} onChange={(e) => setProduct({...product, price: e.target.value})} className="w-full px-4 py-3 rounded-lg border border-[#E8DFD3]" placeholder="38" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-[#3E2F1C] mb-2">Primary Image URL</label>
                <div className="relative">
                  <ImageIcon className="absolute left-3 top-3.5 w-5 h-5 text-[#8B7D6B]" />
                  <input required value={product.img} onChange={(e) => setProduct({...product, img: e.target.value})} className="w-full pl-10 pr-4 py-3 rounded-lg border border-[#E8DFD3]" placeholder="https://unsplash.com/..." />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#3E2F1C] mb-2">Hover Image URL (Optional)</label>
                <div className="relative">
                  <ImageIcon className="absolute left-3 top-3.5 w-5 h-5 text-[#8B7D6B]" />
                  <input value={product.img2} onChange={(e) => setProduct({...product, img2: e.target.value})} className="w-full pl-10 pr-4 py-3 rounded-lg border border-[#E8DFD3]" placeholder="https://unsplash.com/..." />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-bold text-[#3E2F1C] mb-2">Category</label>
                <select value={product.cat} onChange={(e) => setProduct({...product, cat: e.target.value})} className="w-full px-4 py-3 rounded-lg border border-[#E8DFD3] bg-white">
                  <option>Gemstone</option><option>Pearl</option><option>Wood</option><option>Metal</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#3E2F1C] mb-2">Material Info</label>
                <input value={product.mat} onChange={(e) => setProduct({...product, mat: e.target.value})} className="w-full px-4 py-3 rounded-lg border border-[#E8DFD3]" placeholder="e.g. Natural Sunstone" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#3E2F1C] mb-2">Tag (Optional)</label>
                <input value={product.tag} onChange={(e) => setProduct({...product, tag: e.target.value})} className="w-full px-4 py-3 rounded-lg border border-[#E8DFD3]" placeholder="e.g. Bestseller, New" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#FAF6F1] p-5 rounded-xl border border-[#E8DFD3]">
              <div>
                <label className="block text-xs font-bold text-[#3E2F1C] mb-1">Color Hex Codes</label>
                <p className="text-[10px] text-[#8B7D6B] mb-2">Comma separated (e.g. #FFFFFF, #000000)</p>
                <input value={product.colors} onChange={(e) => setProduct({...product, colors: e.target.value})} className="w-full px-4 py-3 rounded-lg border border-[#E8DFD3]" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#3E2F1C] mb-1">Available Sizes</label>
                <p className="text-[10px] text-[#8B7D6B] mb-2">Comma separated (e.g. S, M, L, XL)</p>
                <input value={product.sizes} onChange={(e) => setProduct({...product, sizes: e.target.value})} className="w-full px-4 py-3 rounded-lg border border-[#E8DFD3]" />
              </div>
            </div>

            {status && (
              <div className={`p-4 rounded-lg text-center font-bold ${status.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {status}
              </div>
            )}

            <button type="submit" className={`w-full text-white py-4 rounded-xl font-bold tracking-widest uppercase transition-colors flex items-center justify-center gap-2 ${editId ? 'bg-[#5B8FA8] hover:bg-[#46758A]' : 'bg-[#A0522D] hover:bg-[#8B4526]'}`}>
              {editId ? <><Edit2 className="w-5 h-5" /> Update Product</> : <><Plus className="w-5 h-5" /> Publish to Store</>}
            </button>
          </form>
        </div>

        {/* THE CATALOG LIST SECTION */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden p-8">
          <h2 className="text-2xl text-[#3E2F1C] mb-6 border-b border-[#E8DFD3] pb-4" style={{ fontFamily: 'Playfair Display, serif' }}>Current Catalog ({products.length})</h2>
          
          {products.length === 0 ? (
            <p className="text-center text-[#8B7D6B] py-8">Your store is currently empty.</p>
          ) : (
            <div className="space-y-4">
              {products.map(p => (
                <div key={p._id} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-[#FAF6F1] rounded-xl border border-[#E8DFD3] gap-4">
                  <div className="flex items-center gap-4">
                    <img src={p.img} alt={p.name} className="w-16 h-16 rounded-lg object-cover bg-[#E8DFD3]" />
                    <div>
                      <h3 className="font-bold text-[#3E2F1C]">{p.name}</h3>
                      <p className="text-xs text-[#8B7D6B]">${p.price} • {p.cat}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 border-t border-[#E8DFD3] pt-4 md:pt-0 md:border-t-0">
                    <button onClick={() => handleEditClick(p)} className="flex-1 md:flex-none flex items-center justify-center gap-1 bg-[#E8DFD3] text-[#3E2F1C] hover:bg-[#D1C7B7] px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                      <Edit2 className="w-4 h-4" /> Edit
                    </button>
                    <button onClick={() => handleDelete(p._id)} className="flex-1 md:flex-none flex items-center justify-center gap-1 bg-[#FDECEC] text-[#B85C5C] hover:bg-[#FAD4D4] px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                      <Trash2 className="w-4 h-4" /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}