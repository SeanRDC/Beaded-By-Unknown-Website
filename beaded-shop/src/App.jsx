import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Search, ShoppingBag, Heart, User, X, ChevronDown, ChevronRight, Star, Plus, Minus, Trash2, ArrowRight, Eye, Crown, Leaf, Sparkles, Award, Truck, MapPin, Lock, Check, Package, LayoutGrid, SlidersHorizontal, ChevronLeft, Palette, Gem, Layers, ShieldCheck, MessageCircle, Send, Gift, Home, Menu } from 'lucide-react';

// Unified Data (Desktop images + Mobile structure)
const P = [
  { id: 1, name: 'Sunstone Serenity', price: 38, img: 'https://images.unsplash.com/photo-1766560359154-c28794703384?ixid=M3w4NDcxNjh8MHwxfHNlYXJjaHwxfHxvcmFuZ2UlMjBjcnlzdGFsJTIwYmVhZCUyMGJyYWNlbGV0JTIwaGFuZG1hZGV8ZW58MHx8fHwxNzc0ODg2Njk3fDA&ixlib=rb-4.1.0&w=400&h=400&fit=crop', img2: 'https://images.unsplash.com/photo-1763400312910-ed908d5f5714?ixid=M3w4NDcxNjh8MHwxfHNlYXJjaHwxfHx3b21hbiUyMHdlYXJpbmclMjBiZWFkJTIwYnJhY2VsZXQlMjBjbG9zZXVwfGVufDB8fHx8MTc3NDg4NjY5N3ww&ixlib=rb-4.1.0&w=400&h=400&fit=crop', colors: ['#C9A96E', '#A0522D', '#E8DFD3'], cat: 'Gemstone', rating: 4.8, reviews: 124, mat: 'Natural Sunstone', sizes: ['S', 'M', 'L'], tag: 'Bestseller' },
  { id: 2, name: 'Moonlit Whisper', price: 42, img: 'https://images.unsplash.com/photo-1774096399392-e89c66ed8512?ixid=M3w4NDcxNjh8MHwxfHNlYXJjaHwxfHx3aGl0ZSUyMHBlYXJsJTIwYnJhY2VsZXQlMjBlbGVnYW50fGVufDB8fHx8MTc3NDg4NjY5N3ww&ixlib=rb-4.1.0&w=400&h=400&fit=crop', img2: 'https://images.unsplash.com/photo-1763739906638-5b50dbef6005?ixid=M3w4NDcxNjh8MHwxfHNlYXJjaHwxfHxkZWxpY2F0ZSUyMHdoaXRlJTIwYnJhY2VsZXQlMjBqZXdlbHJ5fGVufDB8fHx8MTc3NDg4NjY5N3ww&ixlib=rb-4.1.0&w=400&h=400&fit=crop', colors: ['#FFFFFF', '#E8DFD3', '#C9A96E'], cat: 'Pearl', rating: 4.9, reviews: 89, mat: 'Freshwater Pearl', sizes: ['S', 'M', 'L'], tag: 'New' },
  { id: 3, name: 'Earth Root', price: 34, img: 'https://images.unsplash.com/photo-1634833132196-fcbb1594e665?ixid=M3w4NDcxNjh8MHwxfHNlYXJjaHwxfHxicm93biUyMHdvb2RlbiUyMGJlYWQlMjBicmFjZWxldHxlbnwwfHx8fDE3NzQ4ODY2OTd8MA&ixlib=rb-4.1.0&w=400&h=400&fit=crop', img2: 'https://images.unsplash.com/photo-1773666030429-d36d2a684d07?ixid=M3w4NDcxNjh8MHwxfHNlYXJjaHwxfHx3b29kZW4lMjBiZWFkcyUyMG9uJTIwbGluZW4lMjBjbG90aHxlbnwwfHx8fDE3NzQ4ODY2OTd8MA&ixlib=rb-4.1.0&w=400&h=400&fit=crop', colors: ['#3E2F1C', '#8B7D6B', '#A0522D'], cat: 'Wood', rating: 4.7, reviews: 156, mat: 'Sandalwood', sizes: ['S', 'M', 'L', 'XL'], tag: '' },
  { id: 4, name: 'Ocean Drift', price: 45, img: 'https://images.unsplash.com/photo-1645412665918-fa13253d06c6?ixid=M3w4NDcxNjh8MHwxfHNlYXJjaHwxfHxibHVlJTIwdHVycXVvaXNlJTIwc3RvbmUlMjBicmFjZWxldHxlbnwwfHx8fDE3NzQ4ODY2OTd8MA&ixlib=rb-4.1.0&w=400&h=400&fit=crop', img2: 'https://images.unsplash.com/photo-1771003230302-7251df0f9d97?ixid=M3w4NDcxNjh8MHwxfHNlYXJjaHwxfHx0dXJxdW9pc2UlMjBicmFjZWxldCUyMGRyaWZ0d29vZHxlbnwwfHx8fDE3NzQ4ODY2OTd8MA&ixlib=rb-4.1.0&w=400&h=400&fit=crop', colors: ['#5B8FA8', '#7A8B6F', '#E8DFD3'], cat: 'Gemstone', rating: 4.6, reviews: 98, mat: 'Turquoise', sizes: ['S', 'M', 'L'], tag: '' },
  { id: 5, name: 'Golden Hour', price: 52, img: 'https://images.unsplash.com/photo-1758995116383-f51775896add?ixid=M3w4NDcxNjh8MHwxfHNlYXJjaHwxfHxnb2xkJTIwYmVhZCUyMGJyYWNlbGV0JTIwbHV4dXJ5fGVufDB8fHx8MTc3NDg4NjY5N3ww&ixlib=rb-4.1.0&w=400&h=400&fit=crop', img2: 'https://images.unsplash.com/photo-1705326452395-1d35e6add570?ixid=M3w4NDcxNjh8MHwxfHNlYXJjaHwxfHxnb2xkJTIwYnJhY2VsZXQlMjBzdGFjayUyMHdyaXN0fGVufDB8fHx8MTc3NDg4NjY5N3ww&ixlib=rb-4.1.0&w=400&h=400&fit=crop', colors: ['#C9A96E', '#3E2F1C', '#A0522D'], cat: 'Metal', rating: 4.9, reviews: 201, mat: '14K Gold Filled', sizes: ['S', 'M', 'L'], tag: 'Popular' },
  { id: 6, name: 'Forest Floor', price: 36, img: 'https://images.unsplash.com/photo-1642477216634-3e290a057efa?ixid=M3w4NDcxNjh8MHwxfHNlYXJjaHwxfHxncmVlbiUyMGphZGUlMjBzdG9uZSUyMGJyYWNlbGV0fGVufDB8fHx8MTc3NDg4NjY5N3ww&ixlib=rb-4.1.0&w=400&h=400&fit=crop', img2: 'https://images.unsplash.com/photo-1704617767820-46fa501698eb?ixid=M3w4NDcxNjh8MHwxfHNlYXJjaHwxfHxncmVlbiUyMGJyYWNlbGV0JTIwb24lMjBtb3NzfGVufDB8fHx8MTc3NDg4NjY5N3ww&ixlib=rb-4.1.0&w=400&h=400&fit=crop', colors: ['#7A8B6F', '#3E2F1C', '#C9A96E'], cat: 'Gemstone', rating: 4.5, reviews: 67, mat: 'Green Jade', sizes: ['S', 'M', 'L'], tag: '' },
  { id: 7, name: 'Blush Dream', price: 40, img: 'https://images.unsplash.com/photo-1652500965593-58e2b71d3cdc?ixid=M3w4NDcxNjh8MHwxfHNlYXJjaHwxfHxwaW5rJTIwcm9zZSUyMHF1YXJ0eiUyMGJyYWNlbGV0fGVufDB8fHx8MTc3NDg4NjY5N3ww&ixlib=rb-4.1.0&w=400&h=400&fit=crop', img2: 'https://images.unsplash.com/photo-1762762938024-6d69c11d8c0a?ixid=M3w4NDcxNjh8MHwxfHNlYXJjaHwxfHxyb3NlJTIwcXVhcnR6JTIwamV3ZWxyeSUyMGZlbWluaW5lfGVufDB8fHx8MTc3NDg4NjY5N3ww&ixlib=rb-4.1.0&w=400&h=400&fit=crop', colors: ['#D4A0A0', '#E8DFD3', '#C9A96E'], cat: 'Gemstone', rating: 4.8, reviews: 143, mat: 'Rose Quartz', sizes: ['S', 'M', 'L'], tag: 'Bestseller' },
  { id: 8, name: 'Midnight Stone', price: 48, img: 'https://images.unsplash.com/photo-1559555698-cc683c339bdb?ixid=M3w4NDcxNjh8MHwxfHNlYXJjaHwxfHxibGFjayUyMG9ueXglMjBiZWFkJTIwYnJhY2VsZXR8ZW58MHx8fHwxNzc0ODg2Njk3fDA&ixlib=rb-4.1.0&w=400&h=400&fit=crop', img2: 'https://images.unsplash.com/photo-1767049603596-79204ada5273?ixid=M3w4NDcxNjh8MHwxfHNlYXJjaHwxfHxibGFjayUyMHN0b25lJTIwYnJhY2VsZXQlMjBkYXJrfGVufDB8fHx8MTc3NDg4NjY5N3ww&ixlib=rb-4.1.0&w=400&h=400&fit=crop', colors: ['#2C2C2C', '#3E2F1C', '#C9A96E'], cat: 'Gemstone', rating: 4.7, reviews: 112, mat: 'Black Onyx', sizes: ['S', 'M', 'L', 'XL'], tag: '' },
];

const blogs = [
  { id: 1, title: 'The Art of Intentional Adornment', ex: 'How choosing your daily bracelet can become a mindful ritual.', cat: 'Style Guide', date: 'Dec 15, 2024', time: '5 min', img: 'https://images.unsplash.com/photo-1763400312910-ed908d5f5714?ixid=M3w4NDcxNjh8MHwxfHNlYXJjaHwxfHx3b21hbiUyMGhhbmRzJTIwbWVkaXRhdGlvbiUyMGJyYWNlbGV0fGVufDB8fHx8MTc3NDg4NjY5N3ww&ixlib=rb-4.1.0&w=600&h=400&fit=crop' },
  { id: 2, title: 'Behind the Beads: Sourcing Stones', ex: 'A journey to the mines where we find our beautiful gemstones.', cat: 'Behind the Scenes', date: 'Dec 8, 2024', time: '7 min', img: 'https://images.unsplash.com/photo-1762921010575-2fcdb3c36ca1?ixid=M3w4NDcxNjh8MHwxfHNlYXJjaHwxfHxjb2xvcmZ1bCUyMGdlbXN0b25lcyUyMGNyeXN0YWxzfGVufDB8fHx8MTc3NDg4NjY5N3ww&ixlib=rb-4.1.0&w=600&h=400&fit=crop' },
  { id: 3, title: 'Caring for Handmade Jewelry', ex: 'Simple tips to keep your bracelets beautiful for years.', cat: 'Care Tips', date: 'Dec 1, 2024', time: '4 min', img: 'https://images.unsplash.com/photo-1520781359717-3eb98461c9fe?ixid=M3w4NDcxNjh8MHwxfHNlYXJjaHwxfHxqZXdlbHJ5JTIwY2xlYW5pbmclMjBjbG90aHxlbnwwfHx8fDE3NzQ4ODY2OTd8MA&ixlib=rb-4.1.0&w=600&h=400&fit=crop' },
];

const beadOpts = [
  { id: 'b1', name: 'Rose Quartz', color: '#D4A0A0', price: 3 }, { id: 'b2', name: 'Tiger Eye', color: '#A0522D', price: 3 },
  { id: 'b3', name: 'Lapis Lazuli', color: '#1E3A5F', price: 4 }, { id: 'b4', name: 'Jade', color: '#7A8B6F', price: 4 },
  { id: 'b5', name: 'Moonstone', color: '#E8DFD3', price: 5 }, { id: 'b6', name: 'Onyx', color: '#2C2C2C', price: 3 },
  { id: 'b7', name: 'Sunstone', color: '#C9A96E', price: 4 }, { id: 'b8', name: 'Amethyst', color: '#7B5EA7', price: 4 },
];

const strOpts = [
  { id: 's1', name: 'Natural Cotton', color: '#E8DFD3', price: 0 }, { id: 's2', name: 'Brown Leather', color: '#6B4423', price: 2 },
  { id: 's3', name: 'Black Silk', color: '#1a1a1a', price: 3 }, { id: 's4', name: 'Gold Thread', color: '#C9A96E', price: 4 },
];

const charmOpts = [
  { id: 'c1', name: 'Leaf', em: '🍃', price: 5 }, { id: 'c2', name: 'Star', em: '⭐', price: 5 },
  { id: 'c3', name: 'Heart', em: '💛', price: 5 }, { id: 'c4', name: 'Moon', em: '🌙', price: 6 },
  { id: 'c5', name: 'Initial', em: 'A', price: 7 }, { id: 'c6', name: 'Feather', em: '🪶', price: 5 },
];

function App() {
  const [pg, setPg] = useState('home');
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [qvId, setQvId] = useState(null);
  const [sgOpen, setSgOpen] = useState(false);
  const [selProd, setSelProd] = useState(P[0]);
  const [cart, setCart] = useState([{ ...P[0], qty: 1, sz: 'M' }, { ...P[4], qty: 2, sz: 'S' }]);
  const [wish, setWish] = useState([2, 5, 7]);
  const [scrolled, setScrolled] = useState(false);
  const [toast, setToast] = useState(null);
  const [searchQ, setSearchQ] = useState('');
  const [loginTab, setLoginTab] = useState('signin');
  const [acctTab, setAcctTab] = useState('overview');
  const [cat, setCat] = useState('All');
  const [sort, setSort] = useState('Featured');
  const [cStep, setCStep] = useState(1);
  const [sBeads, setSBeads] = useState([]);
  const [sStr, setSStr] = useState(strOpts[0]);
  const [sCharms, setSCharms] = useState([]);
  const [cName, setCName] = useState('');
  const [chkStep, setChkStep] = useState(1);
  const [selColor, setSelColor] = useState(0);
  const [selSz, setSelSz] = useState('M');
  const [qty, setQty] = useState(1);
  const [acc, setAcc] = useState('description');
  const [logged, setLogged] = useState(false);
  const [email, setEmail] = useState('');
  const [chatIn, setChatIn] = useState('');
  const [chatMsgs, setChatMsgs] = useState([{ from: 'bot', text: 'Hi! Welcome to beadedbyunknown 👋' }]);
  const [gAmt, setGAmt] = useState(50);
  const r = useRef(null);

  // Scroll handler for desktop transparent header
  useEffect(() => {
    const handleS = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleS);
    return () => window.removeEventListener('scroll', handleS);
  }, []);

  const flash = useCallback((m, t) => { setToast({ m, t }); setTimeout(() => setToast(null), 3000); }, []);
  const go = useCallback((p, prod) => { setPg(p); if (prod) setSelProd(prod); setMenuOpen(false); window.scrollTo({top: 0, behavior: 'smooth'}); }, []);

  const addCart = useCallback((p) => {
    setCart(prev => { const ex = prev.find(i => i.id === p.id); if (ex) return prev.map(i => i.id === p.id ? { ...i, qty: i.qty + qty } : i); return [...prev, { ...p, qty: qty, sz: selSz }]; });
    setCartOpen(true); flash('Added to cart!', 'success');
  }, [qty, selSz, flash]);

  const rmCart = useCallback((id) => { setCart(prev => prev.filter(i => i.id !== id)); flash('Removed', 'info'); }, [flash]);
  const updQty = useCallback((id, d) => { setCart(prev => prev.map(i => i.id === id ? { ...i, qty: Math.max(1, i.qty + d) } : i)); }, []);
  const togWish = useCallback((id) => { setWish(prev => { if (prev.includes(id)) { flash('Removed from wishlist', 'info'); return prev.filter(i => i !== id); } flash('Saved!', 'success'); return [...prev, id]; }); }, [flash]);

  const cTotal = useMemo(() => cart.reduce((s, i) => s + i.price * i.qty, 0), [cart]);
  const cCount = useMemo(() => cart.reduce((s, i) => s + i.qty, 0), [cart]);
  const filtered = useMemo(() => { let f = P; if (cat !== 'All') f = f.filter(p => p.cat === cat); if (sort === 'Price: Low') f = [...f].sort((a, b) => a.price - b.price); if (sort === 'Price: High') f = [...f].sort((a, b) => b.price - a.price); return f; }, [cat, sort]);
  const custT = useMemo(() => 12 + sBeads.reduce((s, b) => s + b.price, 0) + (sStr?.price || 0) + sCharms.reduce((s, c) => s + c.price, 0), [sBeads, sStr, sCharms]);

  const stars = (rt) => Array.from({ length: 5 }, (_, i) => (
    <Star key={i} className={`w-3 h-3 md:w-3.5 md:h-3.5 ${i < Math.floor(rt) ? 'fill-[#C9A96E] text-[#C9A96E]' : 'text-[#E8DFD3]'}`} />
  ));

  // Responsive Product Card
  const Card = ({ p }) => {
    const [h, setH] = useState(false);
    return (
      <div className="group cursor-pointer" onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} onClick={() => go('product', p)}>
        <div className="relative aspect-square overflow-hidden rounded-xl bg-[#F0EBE4] mb-2 md:mb-3">
          <img src={h ? p.img2 : p.img} alt={p.name} className="w-full h-full object-cover transition-all duration-500" />
          {p.tag && <span className="absolute top-2 left-2 md:top-3 md:left-3 bg-[#3E2F1C] text-[#FAF6F1] text-[9px] md:text-[10px] tracking-[0.15em] uppercase px-2 py-0.5 md:px-3 md:py-1">{p.tag}</span>}
          {/* Desktop Hover Actions */}
          <div className={`hidden md:flex absolute inset-0 bg-[#3E2F1C]/10 items-end justify-center pb-4 gap-2 transition-opacity duration-300 ${h ? 'opacity-100' : 'opacity-0'}`}>
            <button onClick={(e) => { e.stopPropagation(); addCart(p); }} className="bg-[#FAF6F1] text-[#3E2F1C] text-xs tracking-wider uppercase px-5 py-2.5 hover:bg-[#3E2F1C] hover:text-[#FAF6F1] transition-colors duration-200 font-medium">Add</button>
            <button onClick={(e) => { e.stopPropagation(); setQvId(p.id); }} className="bg-[#FAF6F1] text-[#3E2F1C] p-2.5 hover:bg-[#3E2F1C] hover:text-[#FAF6F1] transition-colors duration-200"><Eye className="w-4 h-4" /></button>
          </div>
          <button onClick={(e) => { e.stopPropagation(); togWish(p.id); }} className="absolute top-2 right-2 md:top-3 md:right-3 p-1.5 md:p-2 bg-white/80 rounded-full hover:bg-white transition-colors">
            <Heart className={`w-3.5 h-3.5 md:w-4 md:h-4 ${wish.includes(p.id) ? 'fill-[#A0522D] text-[#A0522D]' : 'text-[#3E2F1C]'}`} />
          </button>
        </div>
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-[13px] md:text-[15px] text-[#3E2F1C] font-medium" style={{ fontFamily: 'Playfair Display, serif' }}>{p.name}</h3>
            <p className="text-[11px] md:text-xs text-[#8B7D6B] mt-0.5">{p.mat}</p>
          </div>
          <span className="text-[13px] md:text-[15px] font-semibold text-[#3E2F1C]">${p.price}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF6F1] relative">
      {/* HEADER - Responsive */}
      {pg !== 'checkout' && pg !== 'confirmation' && (
        <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${scrolled || pg !== 'home' ? 'bg-[#FAF6F1]/95 backdrop-blur-sm shadow-sm' : 'bg-[#FAF6F1] md:bg-transparent'}`}>
          <div className="bg-[#3E2F1C] text-[#FAF6F1] text-center py-1.5 md:py-2 text-[9px] md:text-[11px] tracking-[0.15em] uppercase font-light">Free shipping over $50 — Handmade</div>
          <nav className="max-w-[1440px] mx-auto px-4 md:px-10 py-3 md:py-4 flex items-center justify-between">
            {/* Mobile Menu Icon */}
            <button onClick={() => setMenuOpen(true)} className="md:hidden p-1 text-[#3E2F1C]"><Menu className="w-5 h-5" /></button>
            
            {/* Desktop Left Nav */}
            <div className="hidden md:flex items-center gap-8 flex-1">
              <button onClick={() => go('collection')} className="text-[13px] tracking-[0.15em] text-[#3E2F1C] hover:text-[#A0522D] transition-colors font-medium uppercase">Shop</button>
              <button onClick={() => go('customizer')} className="text-[13px] tracking-[0.15em] text-[#3E2F1C] hover:text-[#A0522D] transition-colors font-medium uppercase">Customize</button>
              <button onClick={() => go('about')} className="text-[13px] tracking-[0.15em] text-[#3E2F1C] hover:text-[#A0522D] transition-colors font-medium uppercase">Our Story</button>
            </div>

            {/* Center Logo */}
            <button onClick={() => go('home')} className="absolute left-1/2 -translate-x-1/2 text-[16px] md:text-[22px] tracking-[0.15em] md:tracking-[0.2em] text-[#3E2F1C] uppercase" style={{ fontFamily: 'Playfair Display, serif' }}>beadedbyunknown</button>

            {/* Desktop Right Nav & Mobile Cart */}
            <div className="flex items-center justify-end gap-5 flex-1">
              <button onClick={() => go('blog')} className="hidden md:block text-[13px] tracking-[0.15em] text-[#3E2F1C] hover:text-[#A0522D] transition-colors font-medium uppercase">Journal</button>
              <button onClick={() => setSearchOpen(true)} className="hidden md:block text-[#3E2F1C] hover:text-[#A0522D] transition-colors"><Search className="w-[18px] h-[18px]" /></button>
              <button onClick={() => logged ? go('account') : setLoginOpen(true)} className="hidden md:block text-[#3E2F1C] hover:text-[#A0522D] transition-colors"><User className="w-[18px] h-[18px]" /></button>
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
        
        {/* HOME */}
        {pg === 'home' && (
          <div>
            <section className="relative h-[420px] md:h-[85vh] flex items-end md:items-center bg-[#EDE7DF]">
              <div className="absolute inset-0"><img src="https://images.unsplash.com/photo-1766560361397-9d1eeb446d26?ixid=M3w4NDcxNjh8MHwxfHNlYXJjaHwxfHxoYW5kbWFkZSUyMGJlYWQlMjBicmFjZWxldHMlMjBsaW5lbiUyMGNsb3RofGVufDB8fHx8MTc3NDg4NjY5N3ww&ixlib=rb-4.1.0&w=1440&h=900&fit=crop" alt="Hero" className="w-full h-full object-cover opacity-30" /></div>
              <div className="relative z-10 p-6 md:p-8 md:max-w-[1200px] md:mx-auto w-full pb-10 md:pb-8">
                <p className="text-[10px] md:text-[13px] tracking-[0.25em] md:tracking-[0.3em] text-[#A0522D] uppercase mb-2 md:mb-4 font-medium">Handcrafted with intention</p>
                <h2 className="text-[32px] md:text-[64px] leading-[1.1] text-[#3E2F1C] max-w-[580px] mb-3 md:mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>Every bead tells a story</h2>
                <p className="text-sm md:text-lg text-[#5A4A3A] md:max-w-[420px] mb-6 md:mb-8 leading-relaxed max-w-[280px]">Artisan bracelets from ethically sourced stones, crafted by hand, designed to carry your intention.</p>
                <div className="flex flex-col md:flex-row gap-3 md:gap-4">
                  <button onClick={() => go('collection')} className="bg-[#A0522D] text-[#FAF6F1] text-xs md:text-sm tracking-[0.15em] uppercase px-6 py-3.5 md:py-4 font-medium md:font-semibold hover:bg-[#8B4526] transition-colors">Shop Collection</button>
                  <button onClick={() => go('customizer')} className="border-2 border-[#3E2F1C] text-[#3E2F1C] text-xs md:text-sm tracking-[0.15em] uppercase px-6 py-3.5 md:py-4 font-medium md:font-semibold hover:bg-[#3E2F1C] hover:text-[#FAF6F1] transition-colors">Build Your Own</button>
                </div>
              </div>
            </section>

            <div className="bg-[#3E2F1C] py-2.5 md:py-3 flex justify-center gap-6 md:gap-12 overflow-hidden px-4">
              {['Free shipping over $50', 'Handmade', 'Ethically sourced'].map((t, i) => (
                <span key={i} className="text-[#C9A96E] text-[9px] md:text-xs tracking-[0.15em] md:tracking-[0.2em] uppercase whitespace-nowrap flex items-center gap-1.5"><Sparkles className="w-2.5 h-2.5 md:w-3 md:h-3" /> {t}</span>
              ))}
            </div>

            <section className="px-5 md:px-8 py-8 md:py-20 max-w-[1200px] mx-auto">
              <div className="flex items-end justify-between mb-5 md:mb-10">
                <div>
                  <p className="text-[10px] md:text-[12px] tracking-[0.2em] md:tracking-[0.25em] text-[#A0522D] uppercase mb-1 md:mb-2 font-medium">Curated for you</p>
                  <h2 className="text-[24px] md:text-[36px] text-[#3E2F1C]" style={{ fontFamily: 'Playfair Display, serif' }}>Bestsellers</h2>
                </div>
                <button onClick={() => go('collection')} className="text-xs md:text-sm text-[#A0522D] font-medium flex items-center gap-1 hover:gap-2 transition-all">View All <ArrowRight className="w-3 h-3 md:w-4 md:h-4" /></button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {P.slice(0, 4).map(p => <Card key={p.id} p={p} />)}
              </div>
            </section>

            <section className="px-5 md:px-8 py-4 md:py-8 max-w-[1200px] mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 rounded-xl md:rounded-2xl overflow-hidden bg-[#EDE7DF]">
                <div className="h-48 md:h-auto md:aspect-[4/3]"><img src="https://images.unsplash.com/photo-1766560360164-6be5d9c4de99?ixid=M3w4NDcxNjh8MHwxfHNlYXJjaHwxfHxoYW5kcyUyMG1ha2luZyUyMGJlYWQlMjBqZXdlbHJ5JTIwY3JhZnR8ZW58MHx8fHwxNzc0ODg2Njk3fDA&ixlib=rb-4.1.0&w=700&h=525&fit=crop" alt="Customize" className="w-full h-full object-cover" /></div>
                <div className="p-6 md:p-16 flex flex-col justify-center">
                  <p className="text-[10px] md:text-[12px] tracking-[0.2em] md:tracking-[0.25em] text-[#A0522D] uppercase mb-2 md:mb-3 font-medium">Make it yours</p>
                  <h2 className="text-[22px] md:text-[36px] text-[#3E2F1C] mb-2 md:mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>Design Your Own</h2>
                  <p className="text-sm md:text-base text-[#5A4A3A] mb-5 md:mb-8">Choose from 20+ natural stones, pick your string, add meaningful charms.</p>
                  <div className="flex flex-wrap md:flex-nowrap gap-4 md:gap-6 mb-5 md:mb-8">
                    {[{ i: <Gem className="w-4 h-4 md:w-5 md:h-5" />, l: 'Beads' }, { i: <Layers className="w-4 h-4 md:w-5 md:h-5" />, l: 'String' }, { i: <Sparkles className="w-4 h-4 md:w-5 md:h-5" />, l: 'Charms' }].map((s, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 md:gap-2"><div className="w-7 h-7 md:w-9 md:h-9 rounded-full bg-[#FAF6F1] flex items-center justify-center text-[#A0522D]">{s.i}</div><span className="text-xs md:text-sm text-[#3E2F1C] font-medium">{s.l}</span></div>
                    ))}
                  </div>
                  <button onClick={() => go('customizer')} className="bg-[#A0522D] text-[#FAF6F1] text-xs md:text-sm tracking-[0.15em] uppercase px-6 py-3.5 md:py-4 font-medium md:font-semibold md:self-start hover:bg-[#8B4526] transition-colors text-center">Start Creating</button>
                </div>
              </div>
            </section>

            <section className="px-5 md:px-8 py-8 md:py-20 max-w-[1200px] mx-auto text-center">
              <p className="text-[10px] md:text-[12px] tracking-[0.2em] md:tracking-[0.25em] text-[#A0522D] uppercase mb-1 md:mb-2 font-medium">10,000+ bead lovers</p>
              <h2 className="text-[24px] md:text-[36px] text-[#3E2F1C] mb-5 md:mb-10" style={{ fontFamily: 'Playfair Display, serif' }}>Community Love</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6 text-left">
                {[
                  { n: 'Sarah M.', t: 'The most beautiful bracelet I own. Magical.', p: 'Sunstone Serenity' },
                  { n: 'Emma R.', t: 'Custom bracelet turned out PERFECT! Incredible quality.', p: 'Custom Design' },
                  { n: 'James K.', t: "Got this for my partner. Gorgeous packaging too.", p: 'Moonlit Whisper' }
                ].map((rv, i) => (
                  <div key={i} className="bg-white p-5 md:p-8 rounded-xl border border-[#F0EBE4]">
                    <div className="flex gap-0.5 mb-2 md:mb-3">{stars(5)}</div>
                    <p className="text-sm md:text-base text-[#3E2F1C] leading-relaxed mb-3 md:mb-4">&ldquo;{rv.t}&rdquo;</p>
                    <div className="flex justify-between items-end">
                      <div><p className="text-sm font-semibold text-[#3E2F1C]">{rv.n}</p><p className="text-[10px] md:text-xs text-[#8B7D6B]">Verified Buyer</p></div>
                      <span className="text-[10px] md:text-xs text-[#A0522D]">{rv.p}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="px-5 md:px-8 pb-8 md:pb-20 max-w-[1200px] mx-auto">
              <div className="bg-[#3E2F1C] rounded-xl md:rounded-2xl p-6 md:p-16 flex flex-col md:flex-row items-center justify-between text-center md:text-left">
                <div className="mb-4 md:mb-0">
                  <div className="flex items-center justify-center md:justify-start gap-2 md:gap-3 mb-2 md:mb-3">
                    <Crown className="w-6 h-6 text-[#C9A96E]" />
                    <p className="hidden md:block text-[12px] tracking-[0.25em] text-[#C9A96E] uppercase font-medium">The Bead Tribe</p>
                  </div>
                  <h2 className="text-[20px] md:text-[32px] text-[#FAF6F1] mb-2 md:mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>Earn Points. Get Rewarded.</h2>
                  <p className="text-sm text-[#B0A395] md:max-w-[400px]">Join our loyalty program — earn points with every purchase.</p>
                </div>
                <button onClick={() => go('loyalty')} className="w-full md:w-auto bg-[#C9A96E] text-[#3E2F1C] text-xs md:text-sm tracking-[0.1em] md:tracking-[0.15em] uppercase px-6 md:px-8 py-3.5 md:py-4 font-semibold hover:bg-[#B89A5E] transition-colors">Join the Tribe</button>
              </div>
            </section>

            <footer className="bg-[#3E2F1C] text-[#B0A395]">
              <div className="max-w-[1200px] mx-auto px-5 md:px-8 py-10 md:py-16">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12 text-center md:text-left">
                  <div>
                    <h3 className="text-[#FAF6F1] text-sm md:text-lg tracking-[0.15em] uppercase mb-4 md:mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>beadedbyunknown</h3>
                    <p className="text-xs md:text-sm leading-relaxed mb-4 md:mb-0">Handcrafted bead bracelets made with intention in Portland.</p>
                    <div className="flex justify-center md:justify-start gap-4 mt-6"><Heart className="w-5 h-5 hover:text-[#C9A96E] cursor-pointer transition-colors" /></div>
                  </div>
                  <div className="grid grid-cols-3 md:grid-cols-3 col-span-1 md:col-span-3 gap-4 md:gap-12">
                    <div className="space-y-2 md:space-y-3"><span className="text-[#FAF6F1] text-[11px] md:text-xs tracking-[0.2em] font-semibold block uppercase mb-2 md:mb-4">Shop</span>{['All', 'Custom', 'Gift Cards'].map(l => <p key={l} className="text-xs md:text-sm hover:text-[#C9A96E] cursor-pointer">{l}</p>)}</div>
                    <div className="space-y-2 md:space-y-3"><span className="text-[#FAF6F1] text-[11px] md:text-xs tracking-[0.2em] font-semibold block uppercase mb-2 md:mb-4">Help</span>{['Size Guide', 'Shipping', 'FAQ'].map(l => <p key={l} className="text-xs md:text-sm hover:text-[#C9A96E] cursor-pointer">{l}</p>)}</div>
                    <div className="space-y-2 md:space-y-3"><span className="text-[#FAF6F1] text-[11px] md:text-xs tracking-[0.2em] font-semibold block uppercase mb-2 md:mb-4">About</span>{['Our Story', 'Journal', 'Tribe'].map(l => <p key={l} className="text-xs md:text-sm hover:text-[#C9A96E] cursor-pointer">{l}</p>)}</div>
                  </div>
                </div>
                <div className="border-t border-[#5A4A3A] mt-8 md:mt-12 pt-6 md:pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                  <p className="text-[10px] md:text-xs text-[#8B7D6B]">© 2024 beadedbyunknown</p>
                  <div className="flex gap-2">{['VISA','MC','AMEX','PP'].map(c => <div key={c} className="w-8 h-5 bg-[#5A4A3A] rounded text-[8px] flex items-center justify-center text-[#B0A395]">{c}</div>)}</div>
                </div>
              </div>
            </footer>
          </div>
        )}

        {/* COLLECTION */}
        {pg === 'collection' && (
          <div className="max-w-[1200px] mx-auto px-5 md:px-8 pt-4 md:pt-8 pb-8 md:pb-20">
            <div className="hidden md:flex items-center gap-2 text-xs text-[#8B7D6B] mb-6"><button onClick={() => go('home')} className="hover:text-[#A0522D]">Home</button><ChevronRight className="w-3 h-3" /><span className="text-[#3E2F1C]">Shop All</span></div>
            <h2 className="text-[28px] md:text-[40px] text-[#3E2F1C] mb-1 md:mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>Our Collection</h2>
            <p className="text-xs md:text-sm text-[#8B7D6B] mb-5 md:mb-10">{filtered.length} pieces</p>
            
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-5 md:mb-8 pb-4 border-b border-[#E8DFD3] gap-4">
              <div className="flex gap-2 md:gap-3 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                {['All', 'Gemstone', 'Pearl', 'Wood', 'Metal'].map(c => (
                  <button key={c} onClick={() => setCat(c)} className={`text-[10px] md:text-xs tracking-[0.1em] md:tracking-[0.15em] uppercase px-3 md:px-4 py-1.5 md:py-2 whitespace-nowrap font-medium shrink-0 transition-colors ${cat === c ? 'bg-[#3E2F1C] text-[#FAF6F1]' : 'bg-[#F0EBE4] text-[#5A4A3A] hover:bg-[#E8DFD3]'}`}>{c}</button>
                ))}
              </div>
              <div className="hidden md:flex items-center gap-2"><span className="text-xs text-[#8B7D6B]">Sort:</span><select value={sort} onChange={(e)=>setSort(e.target.value)} className="text-xs font-medium bg-transparent outline-none cursor-pointer"><option>Featured</option><option>Price: Low</option><option>Price: High</option></select></div>
            </div>

            {filtered.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">{filtered.map(p => <Card key={p.id} p={p} />)}</div>
            ) : (
              <div className="py-16 md:py-24 text-center">
                <Search className="w-10 h-10 md:w-12 md:h-12 text-[#E8DFD3] mx-auto mb-3 md:mb-4" />
                <h3 className="text-sm md:text-xl mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>No matches found</h3>
                <button onClick={() => setCat('All')} className="text-xs md:text-sm text-[#A0522D] underline mt-2 md:mt-4">Clear filters</button>
              </div>
            )}
          </div>
        )}

        {/* PRODUCT DETAIL */}
        {pg === 'product' && (() => {
          const p = selProd;
          return (
            <div className="max-w-[1200px] mx-auto px-0 md:px-8 pt-0 md:pt-8 pb-8 md:pb-20">
              <div className="hidden md:flex items-center gap-2 text-xs text-[#8B7D6B] mb-8"><button onClick={() => go('home')} className="hover:text-[#A0522D]">Home</button><ChevronRight className="w-3 h-3" /><button onClick={() => go('collection')} className="hover:text-[#A0522D]">Shop</button><ChevronRight className="w-3 h-3" /><span className="text-[#3E2F1C]">{p.name}</span></div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 md:gap-16">
                <div>
                  <div className="aspect-square md:rounded-xl overflow-hidden bg-[#F0EBE4]"><img src={p.img} alt={p.name} className="w-full h-full object-cover" /></div>
                  <div className="hidden md:grid grid-cols-4 gap-3 mt-4">{[p.img, p.img2, p.img, p.img2].map((im, i) => <div key={i} className="aspect-square rounded-lg overflow-hidden border-2 border-transparent hover:border-[#A0522D] cursor-pointer"><img src={im} alt="" className="w-full h-full object-cover" /></div>)}</div>
                </div>
                
                <div className="px-5 py-5 md:px-0 md:py-4">
                  {p.tag && <span className="text-[10px] md:text-[11px] tracking-[0.15em] md:tracking-[0.2em] text-[#A0522D] uppercase font-medium">{p.tag}</span>}
                  <h2 className="text-[26px] md:text-[36px] text-[#3E2F1C] mt-1 mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>{p.name}</h2>
                  <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4"><div className="flex gap-0.5">{stars(p.rating)}</div><span className="text-xs md:text-sm text-[#8B7D6B]">({p.reviews} reviews)</span></div>
                  <span className="text-[24px] md:text-[28px] font-bold text-[#3E2F1C]">${p.price}</span>
                  <p className="text-[10px] md:text-xs text-[#8B7D6B] mb-6 md:mb-8 mt-1">or 4 payments of ${(p.price / 4).toFixed(2)}</p>

                  <div className="mb-5 md:mb-6">
                    <p className="text-[10px] md:text-xs tracking-[0.15em] uppercase mb-2 md:mb-3 font-semibold">Color</p>
                    <div className="flex gap-3">{p.colors.map((c, i) => <button key={i} onClick={() => setSelColor(i)} className={`w-8 h-8 rounded-full border-2 transition-all ${selColor === i ? 'border-[#A0522D] scale-110' : 'border-[#E8DFD3]'}`} style={{ backgroundColor: c }} />)}</div>
                  </div>

                  <div className="mb-5 md:mb-6">
                    <div className="flex items-center justify-between mb-2 md:mb-3">
                      <p className="text-[10px] md:text-xs tracking-[0.15em] uppercase font-semibold">Size</p>
                      <button onClick={() => setSgOpen(true)} className="text-[10px] md:text-xs text-[#A0522D] underline">Size Guide</button>
                    </div>
                    <div className="flex gap-2 md:gap-3">{p.sizes.map(s => <button key={s} onClick={() => setSelSz(s)} className={`w-11 h-11 md:w-12 md:h-12 text-sm font-medium transition-all ${selSz === s ? 'bg-[#3E2F1C] text-[#FAF6F1]' : 'bg-[#F0EBE4] hover:bg-[#E8DFD3]'}`}>{s}</button>)}</div>
                  </div>

                  <div className="mb-6 md:mb-8">
                    <p className="text-[10px] md:text-xs tracking-[0.15em] uppercase mb-2 md:mb-3 font-semibold">Quantity</p>
                    <div className="inline-flex items-center border border-[#E8DFD3]">
                      <button onClick={() => setQty(prev => Math.max(1, prev - 1))} className="w-11 h-11 md:w-12 md:h-12 flex items-center justify-center hover:bg-[#F0EBE4]"><Minus className="w-4 h-4" /></button>
                      <span className="w-11 h-11 md:w-12 md:h-12 flex items-center justify-center text-sm font-medium border-x border-[#E8DFD3]">{qty}</span>
                      <button onClick={() => setQty(prev => prev + 1)} className="w-11 h-11 md:w-12 md:h-12 flex items-center justify-center hover:bg-[#F0EBE4]"><Plus className="w-4 h-4" /></button>
                    </div>
                  </div>

                  {/* Desktop Add to Cart */}
                  <button onClick={() => addCart(p)} className="hidden md:block w-full bg-[#A0522D] text-[#FAF6F1] text-sm tracking-[0.15em] uppercase py-4 hover:bg-[#8B4526] transition-colors font-semibold mb-3">Add to Cart — ${p.price * qty}</button>

                  <div className="flex gap-3 mb-6 md:mb-8">
                    <button onClick={() => togWish(p.id)} className="flex-1 md:flex-none md:w-full border border-[#E8DFD3] text-sm py-3 flex items-center justify-center gap-2 hover:bg-[#F0EBE4] transition-colors"><Heart className={`w-4 h-4 md:w-5 md:h-5 ${wish.includes(p.id) ? 'fill-[#A0522D] text-[#A0522D]' : 'text-[#3E2F1C]'}`} /> <span className="hidden md:inline">{wish.includes(p.id) ? 'Saved' : 'Wishlist'}</span></button>
                    <button onClick={() => go('customizer')} className="flex-1 md:flex-none md:w-full border border-[#E8DFD3] text-sm py-3 flex items-center justify-center gap-2 hover:bg-[#F0EBE4] transition-colors"><Palette className="w-4 h-4 md:w-5 md:h-5 text-[#3E2F1C]" /> <span className="hidden md:inline">Customize</span></button>
                  </div>

                  {[{ k: 'description', t: 'Description', c: `Handcrafted ${p.mat} beads. Each bead selected for natural beauty.` }, { k: 'care', t: 'Materials & Care', c: `${p.mat}. Remove before swimming. Store in pouch.` }, { k: 'shipping', t: 'Shipping', c: 'Free over $50. Standard 5-7 days. 30-day returns.' }].map(s => (
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

              {/* Mobile Sticky Add to Cart */}
              <div className="md:hidden sticky bottom-0 bg-white border-t border-[#E8DFD3] p-4 flex items-center gap-3 z-30">
                <span className="text-lg font-bold text-[#3E2F1C]">${p.price * qty}</span>
                <button onClick={() => addCart(p)} className="flex-1 bg-[#A0522D] text-[#FAF6F1] text-xs tracking-[0.1em] uppercase py-3.5 font-semibold">Add to Cart</button>
              </div>
            </div>
          );
        })()}

        {/* CUSTOMIZER */}
        {pg === 'customizer' && (
          <div className="max-w-[1200px] mx-auto px-5 md:px-8 pt-4 md:pt-8 pb-8 md:pb-20">
            {/* Desktop Progress Bar */}
            <div className="hidden md:flex items-center gap-0 mb-10">{['Choose Beads','Pick String','Add Charms','Review'].map((s, i) => (
              <div key={i} className="flex items-center flex-1"><div className={`flex items-center gap-2 ${i+1 <= cStep ? 'text-[#A0522D]' : 'text-[#B0A395]'}`}><div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${i+1 <= cStep ? 'bg-[#A0522D] text-white' : 'bg-[#F0EBE4]'}`}>{i+1}</div><span className="text-xs tracking-wider uppercase font-medium">{s}</span></div>{i < 3 && <div className={`flex-1 h-px mx-4 ${i+1 < cStep ? 'bg-[#A0522D]' : 'bg-[#E8DFD3]'}`} />}</div>
            ))}</div>
            
            {/* Mobile Progress Bar */}
            <div className="md:hidden flex gap-1 mb-6">
              {['Beads', 'String', 'Charms', 'Review'].map((s, i) => (
                <div key={i} className="flex-1">
                  <div className={`h-1 rounded-full ${i + 1 <= cStep ? 'bg-[#A0522D]' : 'bg-[#E8DFD3]'}`} />
                  <p className={`text-[9px] text-center mt-1.5 ${i + 1 <= cStep ? 'text-[#A0522D] font-medium' : 'text-[#B0A395]'}`}>{s}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 md:gap-12">
              <div className="md:col-span-2 order-1 md:order-none">
                <div className="md:sticky md:top-32">
                  <div className="aspect-[3/2] md:aspect-square rounded-xl md:rounded-2xl bg-[#F0EBE4] flex items-center justify-center p-4 md:p-8">
                    <div className="w-36 h-36 md:w-52 md:h-52 rounded-full border-4 border-dashed border-[#D4C4A8] flex items-center justify-center relative">
                      {sBeads.length === 0 && <p className="text-[11px] md:text-sm text-[#B0A395] text-center">Select beads</p>}
                      {sBeads.map((b, i) => { 
                        const isMobile = window.innerWidth < 768;
                        const radius = isMobile ? 58 : 85;
                        const offset = isMobile ? 10 : 14;
                        const size = isMobile ? 'w-5 h-5' : 'w-7 h-7';
                        const a = (i / Math.max(sBeads.length, 1)) * Math.PI * 2 - Math.PI / 2; 
                        return <div key={i} className={`absolute ${size} rounded-full shadow-md border-2 border-white/50 transition-all duration-300`} style={{ backgroundColor: b.color, left: `calc(50% + ${Math.cos(a)*radius}px - ${offset}px)`, top: `calc(50% + ${Math.sin(a)*radius}px - ${offset}px)` }} />; 
                      })}
                    </div>
                  </div>
                  <div className="mt-4 md:mt-6 p-3 md:p-5 bg-white rounded-lg md:rounded-xl border border-[#E8DFD3]">
                    <div className="flex justify-between items-center"><span className="text-xs md:text-sm text-[#8B7D6B]">Total</span><span className="text-lg md:text-xl font-bold text-[#3E2F1C]">${custT}</span></div>
                    <p className="hidden md:block text-xs text-[#B0A395] mt-1">Base + {sBeads.length} beads + string + {sCharms.length} charms</p>
                  </div>
                </div>
              </div>

              <div className="md:col-span-3 order-2 md:order-none">
                {cStep === 1 && <div>
                  <h2 className="text-[22px] md:text-[28px] text-[#3E2F1C] mb-1 md:mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>Choose Beads</h2>
                  <p className="text-xs md:text-sm text-[#8B7D6B] mb-4 md:mb-6">{sBeads.length}/12 selected</p>
                  <div className="grid grid-cols-2 gap-2 md:gap-3">
                    {beadOpts.map(b => <button key={b.id} onClick={() => { if (sBeads.length < 12) setSBeads(prev => [...prev, b]); }} className="flex items-center gap-2.5 md:gap-3 p-3 md:p-4 rounded-lg border border-[#E8DFD3] hover:border-[#A0522D] transition-colors text-left"><div className="w-8 h-8 md:w-10 md:h-10 rounded-full shadow-sm" style={{ backgroundColor: b.color }} /><div className="flex-1"><p className="text-xs md:text-sm font-medium">{b.name}</p><p className="text-[10px] md:text-xs text-[#8B7D6B]">+${b.price}</p></div><Plus className="hidden md:block w-4 h-4 text-[#A0522D]" /></button>)}
                  </div>
                  {sBeads.length > 0 && <div className="mt-4 md:mt-6 flex flex-wrap gap-1.5 md:gap-2 p-0 md:p-4 md:bg-[#F0EBE4] rounded-lg">{sBeads.map((b, i) => <button key={i} onClick={() => setSBeads(prev => prev.filter((_, idx) => idx !== i))} className="flex items-center gap-1 md:gap-1.5 px-0 md:px-3 py-0 md:py-1.5 rounded-full text-xs group hover:bg-[#B85C5C] md:hover:text-white transition-colors"><div className="w-6 h-6 md:w-3 md:h-3 rounded-full border-2 border-white md:border-0" style={{ backgroundColor: b.color }} /><span className="hidden md:inline">{b.name}</span><X className="hidden md:inline w-3 h-3 opacity-50 group-hover:opacity-100" /></button>)}</div>}
                </div>}
                
                {cStep === 2 && <div>
                  <h2 className="text-[22px] md:text-[28px] text-[#3E2F1C] mb-4 md:mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>Pick String</h2>
                  <div className="flex flex-col gap-2 md:gap-3">{strOpts.map(s => <button key={s.id} onClick={() => setSStr(s)} className={`flex items-center gap-3 md:gap-4 p-4 md:p-5 rounded-lg border-2 transition-all text-left ${sStr?.id === s.id ? 'border-[#A0522D] bg-[#FAF6F1]' : 'border-[#E8DFD3]'}`}><div className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-white shadow-md" style={{ backgroundColor: s.color }} /><div className="flex-1"><p className="text-sm font-medium">{s.name}</p><p className="text-xs text-[#8B7D6B]">{s.price === 0 ? 'Included' : `+$${s.price}`}</p></div>{sStr?.id === s.id && <Check className="w-5 h-5 text-[#A0522D]" />}</button>)}</div>
                </div>}
                
                {cStep === 3 && <div>
                  <h2 className="text-[22px] md:text-[28px] text-[#3E2F1C] mb-4 md:mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>Add Charms</h2>
                  <p className="hidden md:block text-sm text-[#8B7D6B] mb-6">Optional — up to 3</p>
                  <div className="grid grid-cols-3 gap-2 md:gap-3">{charmOpts.map(c => <button key={c.id} onClick={() => setSCharms(prev => prev.find(x => x.id === c.id) ? prev.filter(x => x.id !== c.id) : prev.length < 3 ? [...prev, c] : prev)} className={`flex flex-col items-center gap-1 md:gap-2 p-3 md:p-5 rounded-lg border-2 transition-all ${sCharms.find(x => x.id === c.id) ? 'border-[#A0522D] bg-[#FAF6F1]' : 'border-[#E8DFD3]'}`}><span className="text-xl md:text-2xl">{c.em}</span><p className="text-[10px] md:text-sm font-medium">{c.name}</p><p className="text-[10px] md:text-xs text-[#8B7D6B]">+${c.price}</p></button>)}</div>
                </div>}
                
                {cStep === 4 && <div>
                  <h2 className="text-[22px] md:text-[28px] text-[#3E2F1C] mb-4 md:mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>Review</h2>
                  <div className="bg-[#F0EBE4] rounded-lg p-4 md:p-6 mb-4 md:mb-6"><div className="hidden md:flex flex-wrap gap-1.5 mb-4">{sBeads.map((b, i) => <div key={i} className="w-5 h-5 rounded-full" style={{ backgroundColor: b.color }} />)}</div><div className="space-y-2 text-sm"><div className="flex justify-between"><span className="text-[#8B7D6B]">Beads ({sBeads.length})</span><span className="font-medium">${sBeads.reduce((s, b) => s + b.price, 0)}</span></div><div className="flex justify-between"><span className="text-[#8B7D6B]">String</span><span className="font-medium">{sStr?.name}</span></div><div className="flex justify-between"><span className="text-[#8B7D6B]">Charms</span><span className="font-medium">{sCharms.length > 0 ? sCharms.map(c => c.name).join(', ') : 'None'}</span></div></div><div className="flex justify-between pt-3 md:pt-4 border-t border-[#E8DFD3] mt-3 md:mt-4"><span className="font-semibold">Total</span><span className="text-lg font-bold">${custT}</span></div></div>
                  <div className="mb-4 md:mb-6"><label className="hidden md:block text-xs tracking-[0.15em] uppercase mb-2 font-semibold">Name Your Bracelet</label><input value={cName} onChange={(e)=>setCName(e.target.value)} placeholder="Name your bracelet" className="w-full px-4 py-3 border border-[#E8DFD3] bg-white text-sm placeholder:text-[#B0A395] outline-none focus:border-[#A0522D] rounded-lg" /></div>
                  <button onClick={() => addCart({ id:Date.now(), name:cName || 'Custom Bracelet', price:custT, img:P[0].img, mat:'Custom' })} className="w-full bg-[#A0522D] text-[#FAF6F1] text-xs md:text-sm tracking-[0.1em] md:tracking-[0.15em] uppercase py-3.5 md:py-4 hover:bg-[#8B4526] transition-colors font-semibold">Add to Cart — ${custT}</button>
                </div>}
                
                <div className="flex justify-between mt-6 md:mt-10 pt-0 md:pt-6 md:border-t border-[#E8DFD3]">
                  {cStep > 1 ? <button onClick={() => setCStep(prev => prev - 1)} className="flex items-center gap-1 md:gap-2 text-sm hover:text-[#A0522D]"><ChevronLeft className="w-4 h-4" /> Back</button> : <div />}
                  {cStep < 4 && <button onClick={() => setCStep(prev => prev + 1)} className="flex items-center gap-1 md:gap-2 text-sm text-[#A0522D] font-medium">Next <ChevronRight className="w-4 h-4" /></button>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ACCOUNT, WISHLIST, ETC (Simplified unified views) */}
        {pg === 'wishlist' && (
          <div className="max-w-[1200px] mx-auto px-5 md:px-8 pt-4 md:pt-8 pb-8 md:pb-20">
            <h2 className="text-[28px] md:text-[40px] text-[#3E2F1C] mb-1 md:mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>Wishlist</h2>
            <p className="text-xs md:text-sm text-[#8B7D6B] mb-5 md:mb-10">{wish.length} items</p>
            {wish.length > 0 ? <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">{P.filter(p => wish.includes(p.id)).map(p => <Card key={p.id} p={p} />)}</div> : <div className="py-16 md:py-24 text-center"><Heart className="w-12 h-12 md:w-16 md:h-16 text-[#E8DFD3] mx-auto mb-3 md:mb-4" /><h3 className="text-lg md:text-xl mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>Nothing saved yet</h3><button onClick={() => go('collection')} className="bg-[#A0522D] text-[#FAF6F1] text-xs md:text-sm uppercase px-6 md:px-8 py-3.5 md:py-4 mt-4 font-medium">Explore</button></div>}
          </div>
        )}

      </main>

      {/* MOBILE BOTTOM NAV */}
      {pg !== 'checkout' && pg !== 'confirmation' && (
        <nav className="md:hidden fixed bottom-0 w-full bg-white border-t border-[#E8DFD3] flex z-40 pb-safe">
          {[
            { icon: <Home className="w-5 h-5" />, label: 'Home', p: 'home' },
            { icon: <Search className="w-5 h-5" />, label: 'Search', p: 'search' },
            { icon: <Heart className="w-5 h-5" />, label: 'Wishlist', p: 'wishlist' },
            { icon: <User className="w-5 h-5" />, label: 'Account', p: 'account' },
          ].map(tab => (
            <button key={tab.p} onClick={() => tab.p === 'search' ? setSearchOpen(true) : go(tab.p === 'account' ? (logged ? 'account' : 'account') : tab.p)} className={`flex-1 flex flex-col items-center py-2.5 ${pg === tab.p ? 'text-[#A0522D]' : 'text-[#8B7D6B]'}`}>
              {tab.icon}
              <span className="text-[9px] mt-0.5">{tab.label}</span>
            </button>
          ))}
        </nav>
      )}

      {/* MOBILE HAMBURGER MENU */}
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

      {/* RESPONSIVE CART DRAWER */}
      {cartOpen && <div className="fixed inset-0 z-[60]"><div className="absolute inset-0 bg-black/30" onClick={() => setCartOpen(false)} /><div className="absolute right-0 top-0 bottom-0 w-full max-w-[340px] md:max-w-[420px] bg-white shadow-2xl flex flex-col"><div className="flex items-center justify-between px-5 md:px-6 py-4 md:py-5 border-b border-[#E8DFD3]"><h3 className="text-lg font-semibold" style={{ fontFamily: 'Playfair Display, serif' }}>Cart ({cCount})</h3><button onClick={() => setCartOpen(false)} className="p-1 hover:bg-[#F0EBE4] rounded-full"><X className="w-5 h-5" /></button></div><div className="flex-1 overflow-y-auto px-5 md:px-6 py-3 md:py-4">{cart.length === 0 ? <div className="py-12 md:py-16 text-center"><ShoppingBag className="w-10 h-10 md:w-12 md:h-12 text-[#E8DFD3] mx-auto mb-3 md:mb-4" /><p className="text-sm md:text-base" style={{ fontFamily: 'Playfair Display, serif' }}>Cart is empty</p><button onClick={() => { setCartOpen(false); go('collection'); }} className="text-xs md:text-sm text-[#A0522D] underline mt-2 md:mt-4">Shop Now</button></div> : cart.map(it => <div key={it.id} className="flex gap-3 md:gap-4 py-3 md:py-4 border-b border-[#E8DFD3]"><div className="w-14 h-14 md:w-16 md:h-16 rounded md:rounded-lg bg-[#F0EBE4] overflow-hidden shrink-0"><img src={it.img} alt="" className="w-full h-full object-cover" /></div><div className="flex-1 min-w-0"><div className="flex justify-between"><div><p className="text-sm font-medium truncate">{it.name}</p><p className="text-[10px] md:text-xs text-[#8B7D6B]">Size {it.sz}</p></div><button onClick={() => rmCart(it.id)} className="p-1 text-[#B0A395] hover:text-[#B85C5C]"><Trash2 className="w-3.5 h-3.5" /></button></div><div className="flex items-center justify-between mt-1.5 md:mt-2"><div className="inline-flex items-center border border-[#E8DFD3] rounded"><button onClick={() => updQty(it.id, -1)} className="w-7 h-7 flex items-center justify-center hover:bg-[#F0EBE4]"><Minus className="w-3 h-3" /></button><span className="w-7 h-7 flex items-center justify-center text-[11px] md:text-xs font-medium border-x border-[#E8DFD3]">{it.qty}</span><button onClick={() => updQty(it.id, 1)} className="w-7 h-7 flex items-center justify-center hover:bg-[#F0EBE4]"><Plus className="w-3 h-3" /></button></div><span className="text-sm font-semibold">${it.price * it.qty}</span></div></div></div>)}</div>{cart.length > 0 && <div className="px-5 md:px-6 py-4 md:py-5 border-t border-[#E8DFD3]">{cTotal < 50 && <div className="mb-3 md:mb-4"><p className="text-[10px] md:text-xs text-[#8B7D6B] mb-1">${50 - cTotal} away from free shipping!</p><div className="bg-[#F0EBE4] rounded-full h-1.5"><div className="bg-[#7A8B6F] h-full rounded-full" style={{ width: `${(cTotal / 50) * 100}%` }} /></div></div>}<div className="flex justify-between mb-3 md:mb-4"><span className="text-sm text-[#8B7D6B]">Subtotal</span><span className="text-lg font-bold">${cTotal}</span></div><button className="w-full bg-[#A0522D] text-[#FAF6F1] text-xs md:text-sm tracking-[0.1em] md:tracking-[0.15em] uppercase py-3.5 md:py-4 hover:bg-[#8B4526] font-semibold mb-2">Checkout</button></div>}</div></div>}

      {/* SEARCH OVERLAY */}
      {searchOpen && <div className="fixed inset-0 z-[60] bg-[#FAF6F1] md:bg-black/30"><div className="md:absolute top-0 left-0 right-0 bg-white md:shadow-xl"><div className="md:max-w-[800px] mx-auto px-5 md:px-8 py-4 md:py-10"><div className="flex items-center gap-3 md:gap-4 border-b md:border-b-2 border-[#E8DFD3] md:border-[#3E2F1C] pb-3 md:mb-6"><Search className="w-5 h-5 text-[#8B7D6B]" /><input value={searchQ} onChange={(e)=>setSearchQ(e.target.value)} placeholder="Search bracelets..." className="flex-1 text-sm md:text-lg outline-none bg-transparent placeholder:text-[#B0A395]" autoFocus /><button onClick={() => { setSearchOpen(false); setSearchQ(''); }}><X className="w-5 h-5 text-[#8B7D6B]" /></button></div></div></div></div>}

    </div>
  );
}

export default App;