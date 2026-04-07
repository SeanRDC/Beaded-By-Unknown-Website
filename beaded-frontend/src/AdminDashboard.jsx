import { useState } from 'react';
import { ShieldCheck, Plus, Image as ImageIcon } from 'lucide-react';

export default function AdminDashboard() {
  const [secretKey, setSecretKey] = useState('');
  const [status, setStatus] = useState('');
  
  // The form state matching your MongoDB Schema
  const [product, setProduct] = useState({
    name: '', price: '', img: '', img2: '', cat: 'Gemstone', 
    mat: '', tag: '', colors: '', sizes: 'S,M,L'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Uploading...');

    // Format the comma-separated strings into actual arrays for MongoDB
    const formattedProduct = {
      ...product,
      price: Number(product.price),
      colors: product.colors.split(',').map(c => c.trim()).filter(Boolean),
      sizes: product.sizes.split(',').map(s => s.trim().toUpperCase()).filter(Boolean)
    };

    try {
      const res = await fetch('http://localhost:4242/api/admin/products', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'admin_secret': secretKey // This is the lock!
        },
        body: JSON.stringify(formattedProduct)
      });

      const data = await res.json();

      if (res.ok) {
        setStatus('✅ Product added successfully!');
        // Reset form but keep the secret key
        setProduct({ name: '', price: '', img: '', img2: '', cat: 'Gemstone', mat: '', tag: '', colors: '', sizes: 'S,M,L' });
        setTimeout(() => setStatus(''), 3000);
      } else {
        setStatus(`❌ Error: ${data.error}`);
      }
    } catch (err) {
      setStatus('❌ Failed to connect to server.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F0EBE4] py-12 px-5">
      <div className="max-w-[800px] mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        
        {/* Header */}
        <div className="bg-[#3E2F1C] p-8 text-center text-white">
          <ShieldCheck className="w-12 h-12 mx-auto mb-4 text-[#C9A96E]" />
          <h1 className="text-3xl" style={{ fontFamily: 'Playfair Display, serif' }}>Admin Control</h1>
          <p className="text-[#B0A395] text-sm mt-2 tracking-widest uppercase">Catalog Manager</p>
        </div>

        {/* The Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          
          {/* Security Clearance */}
          <div className="bg-[#FAF6F1] p-5 rounded-xl border border-[#E8DFD3]">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#A0522D] mb-2">Admin Security Key</label>
            <input 
              type="password" 
              required
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              placeholder="Enter your .env ADMIN_SECRET here" 
              className="w-full px-4 py-3 rounded-lg border border-[#E8DFD3] outline-none focus:border-[#A0522D]"
            />
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

          <button type="submit" className="w-full bg-[#A0522D] text-white py-4 rounded-xl font-bold tracking-widest uppercase hover:bg-[#8B4526] transition-colors flex items-center justify-center gap-2">
            <Plus className="w-5 h-5" /> Publish to Store
          </button>

        </form>
      </div>
    </div>
  );
}