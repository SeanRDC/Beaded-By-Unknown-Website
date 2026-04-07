import { useState, useCallback, useMemo, useRef } from 'react';
import { Search, ShoppingBag, Heart, User, X, ChevronDown, ChevronRight, Star, Plus, Minus, Trash2, ArrowRight, Eye, Crown, Leaf, Sparkles, Instagram, Award, Truck, MapPin, Lock, Check, Package, ChevronLeft, Palette, Gem, Layers, ShieldCheck, MessageCircle, Send, Gift, Home, Menu, Filter, Share2 } from 'lucide-react';

const products = [
  { id: 1, name: 'Sunstone Serenity', price: 38, image: 'https://images.unsplash.com/photo-1766560359154-c28794703384?ixid=M3w4NDcxNjh8MHwxfHNlYXJjaHwxfHxvcmFuZ2UlMjBjcnlzdGFsJTIwYmVhZCUyMGJyYWNlbGV0JTIwaGFuZG1hZGV8ZW58MHx8fHwxNzc0ODg2Njk3fDA&ixlib=rb-4.1.0&w=400&h=400&fit=crop', colors: ['#C9A96E', '#A0522D', '#E8DFD3'], category: 'Gemstone', rating: 4.8, reviews: 124, material: 'Natural Sunstone', sizes: ['S', 'M', 'L'], tag: 'Bestseller' },
  { id: 2, name: 'Moonlit Whisper', price: 42, image: 'https://images.unsplash.com/photo-1576756408738-fd88c22262ea?ixid=M3w4NDcxNjh8MHwxfHNlYXJjaHwxfHx3aGl0ZSUyMHBlYXJsJTIwYmVhZCUyMGJyYWNlbGV0JTIwZWxlZ2FudHxlbnwwfHx8fDE3NzQ4ODcwMDV8MA&ixlib=rb-4.1.0&w=400&h=400&fit=crop', colors: ['#FFFFFF', '#E8DFD3', '#C9A96E'], category: 'Pearl', rating: 4.9, reviews: 89, material: 'Freshwater Pearl', sizes: ['S', 'M', 'L'], tag: 'New' },
  { id: 3, name: 'Earth Root', price: 34, image: 'https://images.unsplash.com/photo-1634833132196-fcbb1594e665?ixid=M3w4NDcxNjh8MHwxfHNlYXJjaHwxfHxicm93biUyMHdvb2RlbiUyMGJlYWQlMjBicmFjZWxldCUyMG5hdHVyYWx8ZW58MHx8fHwxNzc0ODg3MDA1fDA&ixlib=rb-4.1.0&w=400&h=400&fit=crop', colors: ['#3E2F1C', '#8B7D6B', '#A0522D'], category: 'Wood', rating: 4.7, reviews: 156, material: 'Sandalwood', sizes: ['S', 'M', 'L', 'XL'], tag: '' },
  { id: 4, name: 'Ocean Drift', price: 45, image: 'https://images.unsplash.com/photo-1645412665918-fa13253d06c6?ixid=M3w4NDcxNjh8MHwxfHNlYXJjaHwxfHxibHVlJTIwdHVycXVvaXNlJTIwc3RvbmUlMjBicmFjZWxldHxlbnwwfHx8fDE3NzQ4ODY2OTd8MA&ixlib=rb-4.1.0&w=400&h=400&fit=crop', colors: ['#5B8FA8', '#7A8B6F', '#E8DFD3'], category: 'Gemstone', rating: 4.6, reviews: 98, material: 'Turquoise', sizes: ['S', 'M', 'L'], tag: '' },
  { id: 5, name: 'Golden Hour', price: 52, image: 'https://images.unsplash.com/photo-1758995116383-f51775896add?ixid=M3w4NDcxNjh8MHwxfHNlYXJjaHwxfHxnb2xkJTIwYmVhZCUyMGJyYWNlbGV0JTIwbHV4dXJ5fGVufDB8fHx8MTc3NDg4NjY5N3ww&ixlib=rb-4.1.0&w=400&h=400&fit=crop', colors: ['#C9A96E', '#3E2F1C', '#A0522D'], category: 'Metal', rating: 4.9, reviews: 201, material: '14K Gold Filled', sizes: ['S', 'M', 'L'], tag: 'Popular' },
  { id: 6, name: 'Forest Floor', price: 36, image: 'https://images.unsplash.com/photo-1642477216634-3e290a057efa?ixid=M3w4NDcxNjh8MHwxfHNlYXJjaHwxfHxncmVlbiUyMGphZGUlMjBzdG9uZSUyMGJyYWNlbGV0fGVufDB8fHx8MTc3NDg4NjY5N3ww&ixlib=rb-4.1.0&w=400&h=400&fit=crop', colors: ['#7A8B6F', '#3E2F1C', '#C9A96E'], category: 'Gemstone', rating: 4.5, reviews: 67, material: 'Green Jade', sizes: ['S', 'M', 'L'], tag: '' },
  { id: 7, name: 'Blush Dream', price: 40, image: 'https://images.unsplash.com/photo-1652500965593-58e2b71d3cdc?ixid=M3w4NDcxNjh8MHwxfHNlYXJjaHwxfHxwaW5rJTIwcm9zZSUyMHF1YXJ0eiUyMGJyYWNlbGV0fGVufDB8fHx8MTc3NDg4NjY5N3ww&ixlib=rb-4.1.0&w=400&h=400&fit=crop', colors: ['#D4A0A0', '#E8DFD3', '#C9A96E'], category: 'Gemstone', rating: 4.8, reviews: 143, material: 'Rose Quartz', sizes: ['S', 'M', 'L'], tag: 'Bestseller' },
  { id: 8, name: 'Midnight Stone', price: 48, image: 'https://images.unsplash.com/photo-1559555698-cc683c339bdb?ixid=M3w4NDcxNjh8MHwxfHNlYXJjaHwxfHxibGFjayUyMG9ueXglMjBiZWFkJTIwYnJhY2VsZXR8ZW58MHx8fHwxNzc0ODg2Njk3fDA&ixlib=rb-4.1.0&w=400&h=400&fit=crop', colors: ['#2C2C2C', '#3E2F1C', '#C9A96E'], category: 'Gemstone', rating: 4.7, reviews: 112, material: 'Black Onyx', sizes: ['S', 'M', 'L', 'XL'], tag: '' },
];

const beadOpts = [
  { id: 'b1', name: 'Rose Quartz', color: '#D4A0A0', price: 3 },
  { id: 'b2', name: 'Tiger Eye', color: '#A0522D', price: 3 },
  { id: 'b3', name: 'Lapis Lazuli', color: '#1E3A5F', price: 4 },
  { id: 'b4', name: 'Jade', color: '#7A8B6F', price: 4 },
  { id: 'b5', name: 'Moonstone', color: '#E8DFD3', price: 5 },
  { id: 'b6', name: 'Onyx', color: '#2C2C2C', price: 3 },
  { id: 'b7', name: 'Sunstone', color: '#C9A96E', price: 4 },
  { id: 'b8', name: 'Amethyst', color: '#7B5EA7', price: 4 },
];

const stringOpts = [
  { id: 's1', name: 'Natural Cotton', color: '#E8DFD3', price: 0 },
  { id: 's2', name: 'Brown Leather', color: '#6B4423', price: 2 },
  { id: 's3', name: 'Black Silk', color: '#1a1a1a', price: 3 },
  { id: 's4', name: 'Gold Thread', color: '#C9A96E', price: 4 },
];

const charmOpts = [
  { id: 'c1', name: 'Leaf', emoji: '🍃', price: 5 },
  { id: 'c2', name: 'Star', emoji: '⭐', price: 5 },
  { id: 'c3', name: 'Heart', emoji: '💛', price: 5 },
  { id: 'c4', name: 'Moon', emoji: '🌙', price: 6 },
  { id: 'c5', name: 'Initial', emoji: 'A', price: 7 },
  { id: 'c6', name: 'Feather', emoji: '🪶', price: 5 },
];

function App() {
  const [page, setPage] = useState('home');
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [selProd, setSelProd] = useState(products[0]);
  const [cart, setCart] = useState([
    { ...products[0], qty: 1, size: 'M' },
    { ...products[4], qty: 2, size: 'S' },
  ]);
  const [wish, setWish] = useState([2, 5, 7]);
  const [toast, setToast] = useState(null);
  const [searchQ, setSearchQ] = useState('');
  const [loginTab, setLoginTab] = useState('signin');
  const [cat, setCat] = useState('All');
  const [custStep, setCustStep] = useState(1);
  const [beads, setBeads] = useState([]);
  const [string, setString] = useState(stringOpts[0]);
  const [charms, setCharms] = useState([]);
  const [custName, setCustName] = useState('');
  const [checkStep, setCheckStep] = useState(1);
  const [selSize, setSelSize] = useState('M');
  const [qty, setQty] = useState(1);
  const [accordion, setAccordion] = useState('description');
  const [loggedIn, setLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [giftAmt, setGiftAmt] = useState(50);
  const [chatInput, setChatInput] = useState('');
  const [chatMsgs, setChatMsgs] = useState([{ from: 'bot', text: 'Hi! How can I help?' }]);
  const ref = useRef(null);

  const show = useCallback((m, t) => { setToast({ m, t }); setTimeout(() => setToast(null), 3000); }, []);
  const nav = useCallback((p, pr) => { setPage(p); if (pr) setSelProd(pr); setMenuOpen(false); if (ref.current) ref.current.scrollTop = 0; }, []);

  const addCart = useCallback((p) => {
    setCart(prev => { const e = prev.find(i => i.id === p.id); if (e) return prev.map(i => i.id === p.id ? { ...i, qty: i.qty + 1 } : i); return [...prev, { ...p, qty: 1, size: 'M' }]; });
    setCartOpen(true); show('Added to cart!', 'success');
  }, [show]);

  const toggleWish = useCallback((id) => {
    setWish(prev => { if (prev.includes(id)) { show('Removed', 'info'); return prev.filter(i => i !== id); } show('Saved!', 'success'); return [...prev, id]; });
  }, [show]);

  const cartTotal = useMemo(() => cart.reduce((s, i) => s + i.price * i.qty, 0), [cart]);
  const cartCount = useMemo(() => cart.reduce((s, i) => s + i.qty, 0), [cart]);
  const filtered = useMemo(() => cat === 'All' ? products : products.filter(p => p.category === cat), [cat]);
  const custTotal = useMemo(() => 12 + beads.reduce((s, b) => s + b.price, 0) + (string?.price || 0) + charms.reduce((s, c) => s + c.price, 0), [beads, string, charms]);

  const handleSearchQ = useCallback((e) => setSearchQ(e.target.value), []);
  const handleEmail = useCallback((e) => setEmail(e.target.value), []);
  const handleChatIn = useCallback((e) => setChatInput(e.target.value), []);
  const handleCustNm = useCallback((e) => setCustName(e.target.value), []);

  const sendChat = useCallback(() => {
    if (!chatInput.trim()) return;
    setChatMsgs(prev => [...prev, { from: 'user', text: chatInput }]);
    setChatInput('');
    setTimeout(() => setChatMsgs(prev => [...prev, { from: 'bot', text: 'Thanks! A team member will reply shortly.' }]), 1200);
  }, [chatInput]);

  const stars = (r) => Array.from({ length: 5 }, (_, i) => (
    <Star key={i} className={`w-3 h-3 ${i < Math.floor(r) ? 'fill-[#C9A96E] text-[#C9A96E]' : 'text-[#E8DFD3]'}`} />
  ));

  const MCard = ({ p }) => {
    const onClick = () => nav('product', p);
    const onWish = (e) => { e.stopPropagation(); toggleWish(p.id); };
    return (
      <div className="cursor-pointer" onClick={onClick}>
        <div className="relative aspect-square rounded-xl overflow-hidden bg-[#F0EBE4] mb-2">
          <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
          {p.tag && <span className="absolute top-2 left-2 bg-[#3E2F1C] text-[#FAF6F1] text-[9px] tracking-[0.1em] uppercase px-2 py-0.5">{p.tag}</span>}
          <button onClick={onWish} className="absolute top-2 right-2 p-1.5 bg-white/80 rounded-full">
            <Heart className={`w-3.5 h-3.5 ${wish.includes(p.id) ? 'fill-[#A0522D] text-[#A0522D]' : 'text-[#3E2F1C]'}`} />
          </button>
        </div>
        <h3 className="text-[13px] text-[#3E2F1C] font-medium" style={{ fontFamily: 'Playfair Display, serif' }}>{p.name}</h3>
        <div className="flex items-center justify-between mt-0.5">
          <p className="text-[11px] text-[#8B7D6B]">{p.material}</p>
          <span className="text-[13px] font-semibold text-[#3E2F1C]">${p.price}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="w-[375px] h-[812px] mx-auto bg-[#FAF6F1] flex flex-col relative overflow-hidden">
      {/* HEADER */}
      {page !== 'checkout' && (
        <header className="bg-[#FAF6F1] border-b border-[#E8DFD3] shrink-0 z-40">
          <div className="bg-[#3E2F1C] text-[#FAF6F1] text-center py-1.5 text-[9px] tracking-[0.15em] uppercase">Free shipping over $50</div>
          <div className="flex items-center justify-between px-4 py-3">
            <button onClick={() => setMenuOpen(true)} className="p-1"><Menu className="w-5 h-5 text-[#3E2F1C]" /></button>
            <button onClick={() => nav('home')} className="text-[16px] tracking-[0.15em] text-[#3E2F1C] uppercase" style={{ fontFamily: 'Playfair Display, serif' }}>beadedbyunknown</button>
            <button onClick={() => setCartOpen(true)} className="p-1 relative">
              <ShoppingBag className="w-5 h-5 text-[#3E2F1C]" />
              {cartCount > 0 && <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#A0522D] text-white text-[9px] rounded-full flex items-center justify-center">{cartCount}</span>}
            </button>
          </div>
        </header>
      )}

      {/* MAIN CONTENT */}
      <main ref={ref} className="flex-1 overflow-y-auto pb-16">

        {/* HOME */}
        {page === 'home' && (
          <div>
            <section className="relative h-[420px] flex items-end bg-[#EDE7DF]">
              <div className="absolute inset-0"><img src="https://images.unsplash.com/photo-1766560361397-9d1eeb446d26?ixid=M3w4NDcxNjh8MHwxfHNlYXJjaHwxfHxoYW5kbWFkZSUyMGJlYWQlMjBicmFjZWxldHMlMjBsaW5lbiUyMGNsb3RoJTIwZWFydGh5fGVufDB8fHx8MTc3NDg4NzAwNXww&ixlib=rb-4.1.0&w=400&h=500&fit=crop" alt="Hero" className="w-full h-full object-cover opacity-30" /></div>
              <div className="relative z-10 p-6 pb-10">
                <p className="text-[10px] tracking-[0.25em] text-[#A0522D] uppercase mb-2 font-medium">Handcrafted with intention</p>
                <h2 className="text-[32px] leading-[1.1] text-[#3E2F1C] mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>Every bead tells a story</h2>
                <p className="text-sm text-[#5A4A3A] mb-6 leading-relaxed max-w-[280px]">Artisan bracelets from ethically sourced stones.</p>
                <div className="flex flex-col gap-3">
                  <button onClick={() => nav('collection')} className="bg-[#A0522D] text-[#FAF6F1] text-xs tracking-[0.15em] uppercase px-6 py-3.5 font-medium w-full">Shop Collection</button>
                  <button onClick={() => nav('customizer')} className="border-2 border-[#3E2F1C] text-[#3E2F1C] text-xs tracking-[0.15em] uppercase px-6 py-3.5 font-medium w-full">Build Your Own</button>
                </div>
              </div>
            </section>

            <div className="bg-[#3E2F1C] py-2.5 flex justify-center gap-6 overflow-hidden">
              {['Free shipping over $50', 'Handmade', 'Ethically sourced'].map((t, i) => (
                <span key={i} className="text-[#C9A96E] text-[9px] tracking-[0.15em] uppercase whitespace-nowrap flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" /> {t}
                </span>
              ))}
            </div>

            <section className="px-5 py-8">
              <div className="flex items-end justify-between mb-5">
                <div>
                  <p className="text-[10px] tracking-[0.2em] text-[#A0522D] uppercase mb-1 font-medium">Curated for you</p>
                  <h2 className="text-[24px] text-[#3E2F1C]" style={{ fontFamily: 'Playfair Display, serif' }}>Bestsellers</h2>
                </div>
                <button onClick={() => nav('collection')} className="text-xs text-[#A0522D] font-medium flex items-center gap-1">View All <ArrowRight className="w-3 h-3" /></button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {products.slice(0, 4).map(p => <MCard key={p.id} p={p} />)}
              </div>
            </section>

            <section className="px-5 py-4">
              <div className="rounded-xl overflow-hidden bg-[#EDE7DF]">
                <div className="h-48"><img src="https://images.unsplash.com/photo-1766560360164-6be5d9c4de99?ixid=M3w4NDcxNjh8MHwxfHNlYXJjaHwxfHxoYW5kcyUyMG1ha2luZyUyMGJlYWQlMjBqZXdlbHJ5JTIwY3JhZnRpbmd8ZW58MHx8fHwxNzc0ODg3MDA1fDA&ixlib=rb-4.1.0&w=400&h=200&fit=crop" alt="Customize" className="w-full h-full object-cover" /></div>
                <div className="p-6">
                  <p className="text-[10px] tracking-[0.2em] text-[#A0522D] uppercase mb-2 font-medium">Make it yours</p>
                  <h2 className="text-[22px] text-[#3E2F1C] mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>Design Your Own</h2>
                  <p className="text-sm text-[#5A4A3A] mb-5">Choose stones, pick string, add charms.</p>
                  <div className="flex gap-4 mb-5">
                    {[{ i: <Gem className="w-4 h-4" />, l: 'Beads' }, { i: <Layers className="w-4 h-4" />, l: 'String' }, { i: <Sparkles className="w-4 h-4" />, l: 'Charms' }].map((s, idx) => (
                      <div key={idx} className="flex items-center gap-1.5"><div className="w-7 h-7 rounded-full bg-[#FAF6F1] flex items-center justify-center text-[#A0522D]">{s.i}</div><span className="text-xs text-[#3E2F1C] font-medium">{s.l}</span></div>
                    ))}
                  </div>
                  <button onClick={() => nav('customizer')} className="bg-[#A0522D] text-[#FAF6F1] text-xs tracking-[0.15em] uppercase px-6 py-3.5 font-medium w-full">Start Creating</button>
                </div>
              </div>
            </section>

            <section className="px-5 py-8">
              <p className="text-[10px] tracking-[0.2em] text-[#A0522D] uppercase mb-1 font-medium text-center">10,000+ bead lovers</p>
              <h2 className="text-[24px] text-[#3E2F1C] mb-5 text-center" style={{ fontFamily: 'Playfair Display, serif' }}>Community Love</h2>
              {[
                { name: 'Sarah M.', text: 'The most beautiful bracelet I own. Magical.', product: 'Sunstone Serenity' },
                { name: 'Emma R.', text: 'Custom bracelet turned out PERFECT!', product: 'Custom Design' },
              ].map((r, i) => (
                <div key={i} className="bg-white p-5 rounded-xl border border-[#F0EBE4] mb-3">
                  <div className="flex gap-0.5 mb-2">{stars(5)}</div>
                  <p className="text-sm text-[#3E2F1C] leading-relaxed mb-3">&ldquo;{r.text}&rdquo;</p>
                  <div className="flex justify-between items-center">
                    <div><p className="text-sm font-semibold text-[#3E2F1C]">{r.name}</p><p className="text-[10px] text-[#8B7D6B]">Verified Buyer</p></div>
                    <span className="text-[10px] text-[#A0522D]">{r.product}</span>
                  </div>
                </div>
              ))}
            </section>

            <section className="px-5 pb-8">
              <div className="bg-[#3E2F1C] rounded-xl p-6 text-center">
                <Crown className="w-6 h-6 text-[#C9A96E] mx-auto mb-2" />
                <h2 className="text-[20px] text-[#FAF6F1] mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>The Bead Tribe</h2>
                <p className="text-sm text-[#B0A395] mb-4">Earn points with every purchase.</p>
                <button onClick={() => nav('loyalty')} className="bg-[#C9A96E] text-[#3E2F1C] text-xs tracking-[0.1em] uppercase px-6 py-3 font-semibold w-full">Join the Tribe</button>
              </div>
            </section>

            <section className="bg-[#EDE7DF] py-10 px-5 text-center">
              <Leaf className="w-6 h-6 text-[#A0522D] mx-auto mb-3" />
              <h2 className="text-[22px] text-[#3E2F1C] mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>Stay in the Loop</h2>
              <p className="text-sm text-[#5A4A3A] mb-5">Get 10% off your first order.</p>
              <input type="email" value={email} onChange={handleEmail} placeholder="Your email" className="w-full px-4 py-3 bg-white text-sm placeholder:text-[#B0A395] outline-none border border-[#E8DFD3] focus:border-[#A0522D] rounded-lg mb-3" />
              <button onClick={() => show('Welcome to the Tribe!', 'success')} className="w-full bg-[#A0522D] text-[#FAF6F1] text-xs tracking-[0.1em] uppercase py-3.5 font-medium">Subscribe</button>
            </section>

            <footer className="bg-[#3E2F1C] text-[#B0A395] px-5 py-8">
              <h3 className="text-[#FAF6F1] text-sm tracking-[0.15em] uppercase mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>beadedbyunknown</h3>
              <p className="text-xs leading-relaxed mb-4">Handcrafted bead bracelets made with intention.</p>
              <div className="flex gap-4 mb-6"><Instagram className="w-4 h-4" /></div>
              <div className="grid grid-cols-3 gap-4 text-xs mb-6">
                <div className="space-y-2"><span className="text-[#FAF6F1] font-semibold block mb-2">Shop</span>{['All', 'Custom', 'Gift Cards'].map(l => <p key={l}>{l}</p>)}</div>
                <div className="space-y-2"><span className="text-[#FAF6F1] font-semibold block mb-2">Help</span>{['Size Guide', 'Shipping', 'FAQ'].map(l => <p key={l}>{l}</p>)}</div>
                <div className="space-y-2"><span className="text-[#FAF6F1] font-semibold block mb-2">About</span>{['Our Story', 'Journal', 'Tribe'].map(l => <p key={l}>{l}</p>)}</div>
              </div>
              <p className="text-[10px] text-[#5A4A3A] text-center">© 2024 beadedbyunknown</p>
            </footer>
          </div>
        )}

        {/* COLLECTION */}
        {page === 'collection' && (
          <div className="px-5 pt-4 pb-8">
            <h2 className="text-[28px] text-[#3E2F1C] mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>Our Collection</h2>
            <p className="text-xs text-[#8B7D6B] mb-5">{filtered.length} pieces</p>
            <div className="flex gap-2 mb-5 overflow-x-auto pb-2">
              {['All', 'Gemstone', 'Pearl', 'Wood', 'Metal'].map(c => (
                <button key={c} onClick={() => setCat(c)} className={`text-[10px] tracking-[0.1em] uppercase px-3 py-1.5 whitespace-nowrap font-medium shrink-0 ${cat === c ? 'bg-[#3E2F1C] text-[#FAF6F1]' : 'bg-[#F0EBE4] text-[#5A4A3A]'}`}>{c}</button>
              ))}
            </div>
            {filtered.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">{filtered.map(p => <MCard key={p.id} p={p} />)}</div>
            ) : (
              <div className="py-16 text-center">
                <Search className="w-10 h-10 text-[#E8DFD3] mx-auto mb-3" />
                <p className="text-sm mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>No matches</p>
                <button onClick={() => setCat('All')} className="text-xs text-[#A0522D] underline">Clear filters</button>
              </div>
            )}
          </div>
        )}

        {/* PRODUCT DETAIL */}
        {page === 'product' && (() => {
          const p = selProd;
          return (
            <div>
              <div className="aspect-square bg-[#F0EBE4]"><img src={p.image} alt={p.name} className="w-full h-full object-cover" /></div>
              <div className="px-5 py-5">
                {p.tag && <span className="text-[10px] tracking-[0.15em] text-[#A0522D] uppercase font-medium">{p.tag}</span>}
                <h2 className="text-[26px] text-[#3E2F1C] mt-1 mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>{p.name}</h2>
                <div className="flex items-center gap-2 mb-3"><div className="flex gap-0.5">{stars(p.rating)}</div><span className="text-xs text-[#8B7D6B]">({p.reviews})</span></div>
                <span className="text-[24px] font-bold text-[#3E2F1C]">${p.price}</span>
                <p className="text-[10px] text-[#8B7D6B] mb-6 mt-1">or 4 × ${(p.price / 4).toFixed(2)} with Afterpay</p>

                <p className="text-[10px] tracking-[0.15em] text-[#3E2F1C] uppercase mb-2 font-semibold">Color</p>
                <div className="flex gap-3 mb-5">
                  {p.colors.map((c, i) => <div key={i} className="w-8 h-8 rounded-full border-2 border-[#E8DFD3]" style={{ backgroundColor: c }} />)}
                </div>

                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] tracking-[0.15em] text-[#3E2F1C] uppercase font-semibold">Size</p>
                  <button onClick={() => setSizeGuideOpen(true)} className="text-[10px] text-[#A0522D] underline">Size Guide</button>
                </div>
                <div className="flex gap-2 mb-5">
                  {p.sizes.map(s => <button key={s} onClick={() => setSelSize(s)} className={`w-11 h-11 text-sm font-medium ${selSize === s ? 'bg-[#3E2F1C] text-[#FAF6F1]' : 'bg-[#F0EBE4]'}`}>{s}</button>)}
                </div>

                <p className="text-[10px] tracking-[0.15em] text-[#3E2F1C] uppercase mb-2 font-semibold">Quantity</p>
                <div className="inline-flex items-center border border-[#E8DFD3] mb-6">
                  <button onClick={() => setQty(prev => Math.max(1, prev - 1))} className="w-11 h-11 flex items-center justify-center"><Minus className="w-4 h-4" /></button>
                  <span className="w-11 h-11 flex items-center justify-center text-sm font-medium border-x border-[#E8DFD3]">{qty}</span>
                  <button onClick={() => setQty(prev => prev + 1)} className="w-11 h-11 flex items-center justify-center"><Plus className="w-4 h-4" /></button>
                </div>

                <div className="flex gap-3 mb-5">
                  <button onClick={() => toggleWish(p.id)} className="w-12 h-12 border border-[#E8DFD3] flex items-center justify-center">
                    <Heart className={`w-5 h-5 ${wish.includes(p.id) ? 'fill-[#A0522D] text-[#A0522D]' : 'text-[#3E2F1C]'}`} />
                  </button>
                  <button onClick={() => nav('customizer')} className="w-12 h-12 border border-[#E8DFD3] flex items-center justify-center"><Palette className="w-5 h-5 text-[#3E2F1C]" /></button>
                </div>

                {[
                  { k: 'description', t: 'Description', c: `Handcrafted ${p.material} beads on elastic cord. Each bead selected for natural beauty.` },
                  { k: 'care', t: 'Materials & Care', c: `${p.material}. Remove before swimming. Store in pouch.` },
                  { k: 'shipping', t: 'Shipping', c: 'Free over $50. Standard 5-7 days. 30-day returns.' },
                ].map(s => (
                  <div key={s.k} className="border-t border-[#E8DFD3]">
                    <button onClick={() => setAccordion(prev => prev === s.k ? '' : s.k)} className="w-full flex items-center justify-between py-3.5">
                      <span className="text-xs font-semibold tracking-wider uppercase">{s.t}</span>
                      <ChevronDown className={`w-4 h-4 text-[#8B7D6B] transition-transform ${accordion === s.k ? 'rotate-180' : ''}`} />
                    </button>
                    {accordion === s.k && <p className="text-sm text-[#5A4A3A] leading-relaxed pb-4">{s.c}</p>}
                  </div>
                ))}

                <h3 className="text-lg text-[#3E2F1C] mt-8 mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>You May Also Like</h3>
                <div className="grid grid-cols-2 gap-4">
                  {products.filter(x => x.id !== p.id).slice(0, 2).map(x => <MCard key={x.id} p={x} />)}
                </div>
              </div>

              {/* Sticky bottom bar */}
              <div className="sticky bottom-0 bg-white border-t border-[#E8DFD3] p-4 flex items-center gap-3 z-30">
                <span className="text-lg font-bold text-[#3E2F1C]">${p.price * qty}</span>
                <button onClick={() => addCart(p)} className="flex-1 bg-[#A0522D] text-[#FAF6F1] text-xs tracking-[0.1em] uppercase py-3.5 font-semibold">Add to Cart</button>
              </div>
            </div>
          );
        })()}

        {/* CUSTOMIZER */}
        {page === 'customizer' && (
          <div className="px-5 pt-4 pb-8">
            <div className="flex gap-1 mb-6">
              {['Beads', 'String', 'Charms', 'Review'].map((s, i) => (
                <div key={i} className="flex-1">
                  <div className={`h-1 rounded-full ${i + 1 <= custStep ? 'bg-[#A0522D]' : 'bg-[#E8DFD3]'}`} />
                  <p className={`text-[9px] text-center mt-1.5 ${i + 1 <= custStep ? 'text-[#A0522D] font-medium' : 'text-[#B0A395]'}`}>{s}</p>
                </div>
              ))}
            </div>

            <div className="aspect-[3/2] rounded-xl bg-[#F0EBE4] flex items-center justify-center mb-5">
              <div className="w-36 h-36 rounded-full border-4 border-dashed border-[#D4C4A8] flex items-center justify-center relative">
                {beads.length === 0 && <p className="text-[11px] text-[#B0A395] text-center">Select beads</p>}
                {beads.map((b, i) => {
                  const a = (i / Math.max(beads.length, 1)) * Math.PI * 2 - Math.PI / 2;
                  return <div key={i} className="absolute w-5 h-5 rounded-full shadow-md border-2 border-white/50" style={{ backgroundColor: b.color, left: `calc(50% + ${Math.cos(a) * 58}px - 10px)`, top: `calc(50% + ${Math.sin(a) * 58}px - 10px)` }} />;
                })}
              </div>
            </div>

            <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-[#E8DFD3] mb-5">
              <span className="text-xs text-[#8B7D6B]">Total</span>
              <span className="text-lg font-bold text-[#3E2F1C]">${custTotal}</span>
            </div>

            {custStep === 1 && (
              <div>
                <h2 className="text-[22px] text-[#3E2F1C] mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>Choose Beads</h2>
                <p className="text-xs text-[#8B7D6B] mb-4">{beads.length}/12 selected</p>
                <div className="grid grid-cols-2 gap-2">
                  {beadOpts.map(b => (
                    <button key={b.id} onClick={() => { if (beads.length < 12) setBeads(prev => [...prev, b]); }} className="flex items-center gap-2.5 p-3 rounded-lg border border-[#E8DFD3] text-left">
                      <div className="w-8 h-8 rounded-full shadow-sm" style={{ backgroundColor: b.color }} />
                      <div className="flex-1 min-w-0"><p className="text-xs font-medium truncate">{b.name}</p><p className="text-[10px] text-[#8B7D6B]">+${b.price}</p></div>
                    </button>
                  ))}
                </div>
                {beads.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {beads.map((b, i) => (
                      <button key={i} onClick={() => setBeads(prev => prev.filter((_, idx) => idx !== i))} className="w-6 h-6 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: b.color }} />
                    ))}
                  </div>
                )}
              </div>
            )}
            {custStep === 2 && (
              <div>
                <h2 className="text-[22px] text-[#3E2F1C] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>Pick String</h2>
                <div className="space-y-2">
                  {stringOpts.map(s => (
                    <button key={s.id} onClick={() => setString(s)} className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 text-left ${string?.id === s.id ? 'border-[#A0522D] bg-[#FAF6F1]' : 'border-[#E8DFD3]'}`}>
                      <div className="w-10 h-10 rounded-full shadow-md" style={{ backgroundColor: s.color }} />
                      <div className="flex-1"><p className="text-sm font-medium">{s.name}</p><p className="text-xs text-[#8B7D6B]">{s.price === 0 ? 'Included' : `+$${s.price}`}</p></div>
                      {string?.id === s.id && <Check className="w-5 h-5 text-[#A0522D]" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {custStep === 3 && (
              <div>
                <h2 className="text-[22px] text-[#3E2F1C] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>Add Charms</h2>
                <div className="grid grid-cols-3 gap-2">
                  {charmOpts.map(c => (
                    <button key={c.id} onClick={() => setCharms(prev => prev.find(x => x.id === c.id) ? prev.filter(x => x.id !== c.id) : prev.length < 3 ? [...prev, c] : prev)} className={`flex flex-col items-center p-3 rounded-lg border-2 ${charms.find(x => x.id === c.id) ? 'border-[#A0522D] bg-[#FAF6F1]' : 'border-[#E8DFD3]'}`}>
                      <span className="text-xl mb-1">{c.emoji}</span>
                      <p className="text-[10px] font-medium">{c.name}</p>
                      <p className="text-[10px] text-[#8B7D6B]">+${c.price}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
            {custStep === 4 && (
              <div>
                <h2 className="text-[22px] text-[#3E2F1C] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>Review</h2>
                <div className="bg-[#F0EBE4] rounded-lg p-4 mb-4 space-y-2">
                  <div className="flex justify-between text-sm"><span className="text-[#8B7D6B]">Beads ({beads.length})</span><span className="font-medium">${beads.reduce((s, b) => s + b.price, 0)}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-[#8B7D6B]">String</span><span className="font-medium">{string?.name}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-[#8B7D6B]">Charms</span><span className="font-medium">{charms.length > 0 ? charms.map(c => c.name).join(', ') : 'None'}</span></div>
                  <div className="flex justify-between pt-3 border-t border-[#E8DFD3]"><span className="font-semibold">Total</span><span className="text-lg font-bold">${custTotal}</span></div>
                </div>
                <input type="text" value={custName} onChange={handleCustNm} placeholder="Name your bracelet" className="w-full px-4 py-3 border border-[#E8DFD3] text-sm placeholder:text-[#B0A395] outline-none focus:border-[#A0522D] rounded-lg mb-4" />
                <button onClick={() => addCart({ id: Date.now(), name: custName || 'Custom Bracelet', price: custTotal, image: products[0].image, material: 'Custom' })} className="w-full bg-[#A0522D] text-[#FAF6F1] text-xs tracking-[0.1em] uppercase py-3.5 font-semibold">Add to Cart — ${custTotal}</button>
              </div>
            )}
            <div className="flex justify-between mt-6">
              {custStep > 1 ? <button onClick={() => setCustStep(prev => prev - 1)} className="text-sm flex items-center gap-1"><ChevronLeft className="w-4 h-4" /> Back</button> : <div />}
              {custStep < 4 && <button onClick={() => setCustStep(prev => prev + 1)} className="text-sm text-[#A0522D] font-medium flex items-center gap-1">Next <ChevronRight className="w-4 h-4" /></button>}
            </div>
          </div>
        )}

        {/* CHECKOUT */}
        {page === 'checkout' && (
          <div className="bg-white min-h-full">
            <div className="flex items-center justify-between px-4 py-4 border-b border-[#E8DFD3]">
              <button onClick={() => nav('home')} className="text-[14px] tracking-[0.15em] uppercase" style={{ fontFamily: 'Playfair Display, serif' }}>beadedbyunknown</button>
              <Lock className="w-4 h-4 text-[#7A8B6F]" />
            </div>
            <div className="flex gap-0 mb-4">
              {['Info', 'Shipping', 'Payment'].map((s, i) => (
                <div key={i} className={`flex-1 h-1 ${i + 1 <= checkStep ? 'bg-[#A0522D]' : 'bg-[#E8DFD3]'}`} />
              ))}
            </div>
            <div className="px-5 pb-8">
              {checkStep === 1 && (
                <div>
                  <h2 className="text-[22px] text-[#3E2F1C] mb-5" style={{ fontFamily: 'Playfair Display, serif' }}>Contact & Shipping</h2>
                  <div className="space-y-3">
                    <input placeholder="Email" className="w-full px-4 py-3 border border-[#E8DFD3] text-sm placeholder:text-[#B0A395] outline-none focus:border-[#A0522D] rounded-lg" />
                    <div className="grid grid-cols-2 gap-3">
                      <input placeholder="First name" className="px-4 py-3 border border-[#E8DFD3] text-sm placeholder:text-[#B0A395] outline-none focus:border-[#A0522D] rounded-lg" />
                      <input placeholder="Last name" className="px-4 py-3 border border-[#E8DFD3] text-sm placeholder:text-[#B0A395] outline-none focus:border-[#A0522D] rounded-lg" />
                    </div>
                    <input placeholder="Address" className="w-full px-4 py-3 border border-[#E8DFD3] text-sm placeholder:text-[#B0A395] outline-none focus:border-[#A0522D] rounded-lg" />
                    <div className="grid grid-cols-3 gap-3">
                      <input placeholder="City" className="px-4 py-3 border border-[#E8DFD3] text-sm placeholder:text-[#B0A395] outline-none focus:border-[#A0522D] rounded-lg" />
                      <input placeholder="State" className="px-4 py-3 border border-[#E8DFD3] text-sm placeholder:text-[#B0A395] outline-none focus:border-[#A0522D] rounded-lg" />
                      <input placeholder="ZIP" className="px-4 py-3 border border-[#E8DFD3] text-sm placeholder:text-[#B0A395] outline-none focus:border-[#A0522D] rounded-lg" />
                    </div>
                  </div>
                  <button onClick={() => setCheckStep(2)} className="w-full bg-[#A0522D] text-[#FAF6F1] text-xs tracking-[0.1em] uppercase py-3.5 mt-6 font-semibold">Continue to Shipping</button>
                </div>
              )}
              {checkStep === 2 && (
                <div>
                  <h2 className="text-[22px] text-[#3E2F1C] mb-5" style={{ fontFamily: 'Playfair Display, serif' }}>Shipping</h2>
                  <div className="space-y-2 mb-6">
                    {[{ n: 'Standard (5-7 days)', p: cartTotal >= 50 ? 'Free' : '$4.99' }, { n: 'Express (2-3 days)', p: '$9.99' }].map((m, i) => (
                      <div key={i} className={`flex justify-between items-center p-4 rounded-lg border-2 ${i === 0 ? 'border-[#A0522D] bg-[#FAF6F1]' : 'border-[#E8DFD3]'}`}>
                        <div className="flex items-center gap-2"><div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${i === 0 ? 'border-[#A0522D]' : 'border-[#B0A395]'}`}>{i === 0 && <div className="w-2 h-2 rounded-full bg-[#A0522D]" />}</div><span className="text-sm font-medium">{m.n}</span></div>
                        <span className={`text-sm font-medium ${m.p === 'Free' ? 'text-[#7A8B6F]' : ''}`}>{m.p}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setCheckStep(1)} className="py-3 px-4 text-sm"><ChevronLeft className="w-4 h-4 inline" /> Back</button>
                    <button onClick={() => setCheckStep(3)} className="flex-1 bg-[#A0522D] text-[#FAF6F1] text-xs tracking-[0.1em] uppercase py-3.5 font-semibold">Continue</button>
                  </div>
                </div>
              )}
              {checkStep === 3 && (
                <div>
                  <h2 className="text-[22px] text-[#3E2F1C] mb-5" style={{ fontFamily: 'Playfair Display, serif' }}>Payment</h2>
                  <div className="space-y-3 mb-5">
                    <input placeholder="Card number" className="w-full px-4 py-3 border border-[#E8DFD3] text-sm placeholder:text-[#B0A395] outline-none focus:border-[#A0522D] rounded-lg" />
                    <input placeholder="Name on card" className="w-full px-4 py-3 border border-[#E8DFD3] text-sm placeholder:text-[#B0A395] outline-none focus:border-[#A0522D] rounded-lg" />
                    <div className="grid grid-cols-2 gap-3">
                      <input placeholder="MM / YY" className="px-4 py-3 border border-[#E8DFD3] text-sm placeholder:text-[#B0A395] outline-none focus:border-[#A0522D] rounded-lg" />
                      <input placeholder="CVV" className="px-4 py-3 border border-[#E8DFD3] text-sm placeholder:text-[#B0A395] outline-none focus:border-[#A0522D] rounded-lg" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#7A8B6F] mb-4"><ShieldCheck className="w-4 h-4" /> Secure checkout</div>
                  <div className="bg-[#F0EBE4] rounded-lg p-4 mb-5">
                    {cart.map(it => (
                      <div key={it.id} className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded bg-[#E8DFD3] overflow-hidden"><img src={it.image} alt="" className="w-full h-full object-cover" /></div>
                        <div className="flex-1 min-w-0"><p className="text-xs font-medium truncate">{it.name}</p></div>
                        <span className="text-xs font-medium">${it.price * it.qty}</span>
                      </div>
                    ))}
                    <div className="border-t border-[#E8DFD3] pt-2 mt-2 flex justify-between"><span className="text-sm font-semibold">Total</span><span className="text-sm font-bold">${cartTotal}</span></div>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setCheckStep(2)} className="py-3 px-4 text-sm"><ChevronLeft className="w-4 h-4 inline" /> Back</button>
                    <button onClick={() => nav('confirmation')} className="flex-1 bg-[#A0522D] text-[#FAF6F1] text-xs tracking-[0.1em] uppercase py-3.5 font-semibold flex items-center justify-center gap-2"><Lock className="w-3.5 h-3.5" /> Pay ${cartTotal}</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* CONFIRMATION */}
        {page === 'confirmation' && (
          <div className="px-5 py-10 text-center">
            <div className="w-14 h-14 rounded-full bg-[#7A8B6F] mx-auto mb-5 flex items-center justify-center"><Check className="w-7 h-7 text-white" /></div>
            <p className="text-[10px] tracking-[0.15em] text-[#7A8B6F] uppercase mb-1 font-medium">Order Confirmed</p>
            <h2 className="text-[28px] text-[#3E2F1C] mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>Thank you!</h2>
            <p className="text-sm text-[#8B7D6B] mb-6">Order #BBU-2024-1847</p>
            <div className="bg-white rounded-xl p-4 text-left mb-4 border border-[#E8DFD3]">
              <div className="flex items-center gap-3 mb-2"><Truck className="w-4 h-4 text-[#A0522D]" /><div><p className="text-sm font-medium">Dec 22-24</p><p className="text-[10px] text-[#8B7D6B]">Standard Shipping</p></div></div>
              <div className="flex items-center gap-3"><MapPin className="w-4 h-4 text-[#A0522D]" /><p className="text-sm font-medium">123 Main St, Portland</p></div>
            </div>
            <div className="bg-[#3E2F1C] rounded-xl p-4 flex items-center gap-3 mb-6">
              <Award className="w-6 h-6 text-[#C9A96E] shrink-0" />
              <div className="text-left"><p className="text-sm font-medium text-[#FAF6F1]">150 points earned!</p><p className="text-[10px] text-[#B0A395]">Sign up to save.</p></div>
            </div>
            <button onClick={() => nav('home')} className="w-full bg-[#A0522D] text-[#FAF6F1] text-xs tracking-[0.1em] uppercase py-3.5 font-semibold mb-3">Continue Shopping</button>
            <button className="w-full border border-[#E8DFD3] text-xs tracking-[0.1em] uppercase py-3.5 font-medium">Track Order</button>
          </div>
        )}

        {/* ACCOUNT */}
        {page === 'account' && (
          <div className="px-5 pt-4 pb-8">
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-full bg-[#A0522D] flex items-center justify-center text-[#FAF6F1] text-lg font-semibold mx-auto mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>SC</div>
              <h2 className="text-lg font-medium" style={{ fontFamily: 'Playfair Display, serif' }}>Sarah Chen</h2>
              <div className="flex items-center justify-center gap-1 mt-1"><Crown className="w-3.5 h-3.5 text-[#C9A96E]" /><span className="text-xs text-[#C9A96E] font-medium">Silver Tier</span></div>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-[#F0EBE4] rounded-xl p-3 text-center"><p className="text-lg font-bold text-[#C9A96E]">1,250</p><p className="text-[10px] text-[#8B7D6B]">Points</p></div>
              <div className="bg-[#F0EBE4] rounded-xl p-3 text-center"><p className="text-lg font-bold">12</p><p className="text-[10px] text-[#8B7D6B]">Orders</p></div>
              <div className="bg-[#F0EBE4] rounded-xl p-3 text-center"><p className="text-lg font-bold">{wish.length}</p><p className="text-[10px] text-[#8B7D6B]">Wishlist</p></div>
            </div>
            <h3 className="text-lg mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>Recent Orders</h3>
            {[
              { id: '#BBU-1847', d: 'Dec 15', s: 'Processing', sc: 'text-[#C9A96E] bg-[#C9A96E]/10', t: '$142' },
              { id: '#BBU-1823', d: 'Dec 2', s: 'Shipped', sc: 'text-[#5B8FA8] bg-[#5B8FA8]/10', t: '$45' },
              { id: '#BBU-1798', d: 'Nov 20', s: 'Delivered', sc: 'text-[#7A8B6F] bg-[#7A8B6F]/10', t: '$118' },
            ].map(o => (
              <div key={o.id} className="flex items-center justify-between py-3 border-b border-[#E8DFD3]">
                <div><p className="text-sm font-medium">{o.id}</p><p className="text-[10px] text-[#8B7D6B]">{o.d}</p></div>
                <div className="flex items-center gap-2"><span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${o.sc}`}>{o.s}</span><span className="text-sm font-medium">{o.t}</span></div>
              </div>
            ))}
          </div>
        )}

        {/* WISHLIST */}
        {page === 'wishlist' && (
          <div className="px-5 pt-4 pb-8">
            <h2 className="text-[28px] text-[#3E2F1C] mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>Wishlist</h2>
            <p className="text-xs text-[#8B7D6B] mb-5">{wish.length} items</p>
            {wish.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">{products.filter(p => wish.includes(p.id)).map(p => <MCard key={p.id} p={p} />)}</div>
            ) : (
              <div className="py-16 text-center">
                <Heart className="w-12 h-12 text-[#E8DFD3] mx-auto mb-3" />
                <p className="text-lg mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>Nothing saved</p>
                <button onClick={() => nav('collection')} className="text-sm text-[#A0522D] underline">Explore</button>
              </div>
            )}
          </div>
        )}

        {/* LOYALTY */}
        {page === 'loyalty' && (
          <div className="px-5 pt-4 pb-8">
            <div className="text-center mb-6">
              <Crown className="w-8 h-8 text-[#C9A96E] mx-auto mb-2" />
              <h2 className="text-[28px] text-[#3E2F1C] mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>The Bead Tribe</h2>
              <p className="text-xs text-[#8B7D6B]">Earn points. Get rewards.</p>
            </div>
            <div className="bg-[#3E2F1C] rounded-xl p-6 text-center mb-6">
              <p className="text-4xl font-bold text-[#FAF6F1] mb-1">1,250</p>
              <p className="text-sm text-[#B0A395]">Silver · 250 to Gold</p>
              <div className="mt-3 bg-[#5A4A3A] rounded-full h-2 overflow-hidden"><div className="bg-[#C9A96E] h-full rounded-full" style={{ width: '83%' }} /></div>
            </div>
            <div className="grid grid-cols-4 gap-2 mb-6">
              {[{ t: 'Seed', r: '0-499' }, { t: 'Silver', r: '500+' }, { t: 'Gold', r: '1500+' }, { t: 'Platinum', r: '3000+' }].map(ti => (
                <div key={ti.t} className={`rounded-lg p-3 text-center bg-[#F0EBE4] ${ti.t === 'Silver' ? 'ring-2 ring-[#C9A96E]' : ''}`}>
                  <p className="text-xs font-semibold">{ti.t}</p>
                  <p className="text-[10px] text-[#8B7D6B]">{ti.r}</p>
                </div>
              ))}
            </div>
            <h3 className="text-lg mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>Rewards</h3>
            <div className="space-y-2">
              {[{ n: '$5 Off', p: 500 }, { n: '$10 Off', p: 900 }, { n: 'Free Bracelet', p: 2000 }].map(r => (
                <div key={r.n} className="flex items-center justify-between p-4 border border-[#E8DFD3] rounded-lg">
                  <div className="flex items-center gap-3"><Gift className="w-5 h-5 text-[#C9A96E]" /><div><p className="text-sm font-medium">{r.n}</p><p className="text-[10px] text-[#8B7D6B]">{r.p} pts</p></div></div>
                  <button className={`text-[10px] px-3 py-1.5 font-medium ${1250 >= r.p ? 'bg-[#A0522D] text-white' : 'bg-[#F0EBE4] text-[#B0A395]'}`}>{1250 >= r.p ? 'Redeem' : 'Locked'}</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* BLOG */}
        {page === 'blog' && (
          <div className="px-5 pt-4 pb-8">
            <h2 className="text-[28px] text-[#3E2F1C] mb-1 text-center" style={{ fontFamily: 'Playfair Display, serif' }}>The Journal</h2>
            <p className="text-xs text-[#8B7D6B] mb-6 text-center">Stories & inspiration</p>
            {[
              { title: 'Intentional Adornment', cat: 'Style', img: 'https://images.unsplash.com/photo-1617123624871-52dbfcd35273?ixid=M3w4NDcxNjh8MHwxfHNlYXJjaHwxfHx3b21hbiUyMGhhbmRzJTIwYnJhY2VsZXQlMjBtZWRpdGF0aW9ufGVufDB8fHx8MTc3NDg4NzAwNXww&ixlib=rb-4.1.0&w=400&h=250&fit=crop', date: 'Dec 15' },
              { title: 'Behind the Beads', cat: 'Process', img: 'https://images.unsplash.com/photo-1762921010575-2fcdb3c36ca1?ixid=M3w4NDcxNjh8MHwxfHNlYXJjaHwxfHxjb2xvcmZ1bCUyMGdlbXN0b25lcyUyMGNyeXN0YWxzfGVufDB8fHx8MTc3NDg4NjY5N3ww&ixlib=rb-4.1.0&w=400&h=250&fit=crop', date: 'Dec 8' },
              { title: 'Jewelry Care Guide', cat: 'Tips', img: 'https://images.unsplash.com/photo-1766146431842-36b6b42c420c?ixid=M3w4NDcxNjh8MHwxfHNlYXJjaHwxfHxqZXdlbHJ5JTIwY2xlYW5pbmclMjBjYXJlfGVufDB8fHx8MTc3NDg4NzAwNXww&ixlib=rb-4.1.0&w=400&h=250&fit=crop', date: 'Dec 1' },
            ].map((p, i) => (
              <div key={i} className="mb-5">
                <div className="aspect-[16/9] rounded-xl overflow-hidden mb-3"><img src={p.img} alt={p.title} className="w-full h-full object-cover" /></div>
                <span className="text-[10px] tracking-[0.1em] text-[#A0522D] uppercase font-medium">{p.cat}</span>
                <h3 className="text-lg mt-1 mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>{p.title}</h3>
                <p className="text-[10px] text-[#B0A395]">{p.date}</p>
              </div>
            ))}
          </div>
        )}

        {/* ABOUT */}
        {page === 'about' && (
          <div className="pb-8">
            <div className="h-60"><img src="https://images.unsplash.com/photo-1718512759506-be353df927e4?ixid=M3w4NDcxNjh8MHwxfHNlYXJjaHwxfHx3b21hbiUyMGFydGlzYW4lMjBtYWtpbmclMjBqZXdlbHJ5JTIwd29ya3Nob3B8ZW58MHx8fHwxNzc0ODg2Njk3fDA&ixlib=rb-4.1.0&w=400&h=300&fit=crop" alt="Founder" className="w-full h-full object-cover" /></div>
            <div className="px-5 pt-6">
              <p className="text-[10px] tracking-[0.2em] text-[#A0522D] uppercase mb-2 font-medium">Our Story</p>
              <h2 className="text-[26px] text-[#3E2F1C] mb-4 leading-tight" style={{ fontFamily: 'Playfair Display, serif' }}>Born from intention & craft</h2>
              <p className="text-sm text-[#5A4A3A] leading-relaxed mb-4">Started in 2021 with a belief: what we wear should carry meaning. From a kitchen-table hobby to 10,000+ community members.</p>
              <p className="text-sm text-[#5A4A3A] leading-relaxed mb-8">Every bracelet is handmade in Portland using ethically sourced stones.</p>
              <div className="grid grid-cols-2 gap-4">
                {[{ i: <Gem className="w-5 h-5" />, t: 'Handcrafted' }, { i: <Leaf className="w-5 h-5" />, t: 'Sustainable' }, { i: <Heart className="w-5 h-5" />, t: 'Community' }, { i: <Sparkles className="w-5 h-5" />, t: 'Intentional' }].map((v, idx) => (
                  <div key={idx} className="bg-[#F0EBE4] rounded-xl p-4 text-center">
                    <div className="w-10 h-10 rounded-full bg-[#FAF6F1] flex items-center justify-center text-[#A0522D] mx-auto mb-2">{v.i}</div>
                    <p className="text-sm font-medium">{v.t}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* GIFT CARDS */}
        {page === 'gift-cards' && (
          <div className="px-5 pt-4 pb-8">
            <div className="text-center mb-6">
              <Gift className="w-8 h-8 text-[#C9A96E] mx-auto mb-2" />
              <h2 className="text-[28px] text-[#3E2F1C] mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>Gift Cards</h2>
              <p className="text-xs text-[#8B7D6B]">Let them choose their own.</p>
            </div>
            <div className="aspect-[16/10] rounded-xl bg-[#3E2F1C] flex items-center justify-center mb-6">
              <div className="text-center"><p className="text-[#C9A96E] text-[9px] tracking-[0.15em] uppercase mb-1">beadedbyunknown</p><p className="text-4xl font-bold text-[#FAF6F1]" style={{ fontFamily: 'Playfair Display, serif' }}>${giftAmt}</p></div>
            </div>
            <p className="text-[10px] tracking-[0.15em] uppercase mb-2 font-semibold">Amount</p>
            <div className="grid grid-cols-4 gap-2 mb-5">
              {[25, 50, 75, 100].map(a => (
                <button key={a} onClick={() => setGiftAmt(a)} className={`py-2.5 text-sm font-medium ${giftAmt === a ? 'bg-[#3E2F1C] text-[#FAF6F1]' : 'bg-[#F0EBE4]'}`}>${a}</button>
              ))}
            </div>
            <div className="space-y-3 mb-5">
              <input placeholder="Recipient name" className="w-full px-4 py-3 border border-[#E8DFD3] text-sm placeholder:text-[#B0A395] outline-none focus:border-[#A0522D] rounded-lg" />
              <input placeholder="Recipient email" className="w-full px-4 py-3 border border-[#E8DFD3] text-sm placeholder:text-[#B0A395] outline-none focus:border-[#A0522D] rounded-lg" />
              <textarea placeholder="Message (optional)" rows={3} className="w-full px-4 py-3 border border-[#E8DFD3] text-sm placeholder:text-[#B0A395] outline-none focus:border-[#A0522D] rounded-lg resize-none" />
            </div>
            <button onClick={() => show('Gift card added!', 'success')} className="w-full bg-[#A0522D] text-[#FAF6F1] text-xs tracking-[0.1em] uppercase py-3.5 font-semibold">Add to Cart — ${giftAmt}</button>
          </div>
        )}

        {/* 404 */}
        {page === '404' && (
          <div className="flex items-center justify-center py-24 text-center px-5">
            <div>
              <p className="text-7xl text-[#E8DFD3] font-bold mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>404</p>
              <h2 className="text-[22px] text-[#3E2F1C] mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>Page wandered off</h2>
              <p className="text-sm text-[#8B7D6B] mb-6">Like a bead that rolled off the table.</p>
              <button onClick={() => nav('home')} className="bg-[#A0522D] text-[#FAF6F1] text-xs tracking-[0.1em] uppercase px-8 py-3.5 font-medium">Back Home</button>
            </div>
          </div>
        )}
      </main>

      {/* BOTTOM TAB BAR */}
      {page !== 'checkout' && (
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-[375px] bg-white border-t border-[#E8DFD3] flex z-40">
          {[
            { icon: <Home className="w-5 h-5" />, label: 'Home', p: 'home' },
            { icon: <Search className="w-5 h-5" />, label: 'Search', p: 'search' },
            { icon: <Heart className="w-5 h-5" />, label: 'Wishlist', p: 'wishlist' },
            { icon: <User className="w-5 h-5" />, label: 'Account', p: 'account' },
          ].map(tab => (
            <button key={tab.p} onClick={() => tab.p === 'search' ? setSearchOpen(true) : nav(tab.p === 'account' ? (loggedIn ? 'account' : 'account') : tab.p)} className={`flex-1 flex flex-col items-center py-2.5 ${page === tab.p ? 'text-[#A0522D]' : 'text-[#8B7D6B]'}`}>
              {tab.icon}
              <span className="text-[9px] mt-0.5">{tab.label}</span>
            </button>
          ))}
        </nav>
      )}

      {/* HAMBURGER MENU */}
      {menuOpen && (
        <div className="fixed inset-0 z-[60]">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMenuOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-[280px] bg-[#FAF6F1] shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-5 py-5 border-b border-[#E8DFD3]">
              <span className="text-sm tracking-[0.15em] uppercase" style={{ fontFamily: 'Playfair Display, serif' }}>beadedbyunknown</span>
              <button onClick={() => setMenuOpen(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 py-4">
              {[
                { l: 'Shop All', p: 'collection' }, { l: 'Customize', p: 'customizer' }, { l: 'Our Story', p: 'about' },
                { l: 'Journal', p: 'blog' }, { l: 'Gift Cards', p: 'gift-cards' }, { l: 'Loyalty Program', p: 'loyalty' },
              ].map(item => (
                <button key={item.p} onClick={() => nav(item.p)} className="w-full text-left px-6 py-3.5 text-[15px] text-[#3E2F1C] hover:bg-[#F0EBE4] transition-colors">{item.l}</button>
              ))}
            </div>
            <div className="px-6 py-5 border-t border-[#E8DFD3]">
              <button onClick={() => { setLoggedIn(true); nav('account'); }} className="w-full bg-[#A0522D] text-[#FAF6F1] text-xs tracking-[0.1em] uppercase py-3 font-semibold">Sign In</button>
            </div>
          </div>
        </div>
      )}

      {/* CART DRAWER */}
      {cartOpen && (
        <div className="fixed inset-0 z-[60]">
          <div className="absolute inset-0 bg-black/40" onClick={() => setCartOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-[340px] bg-white shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#E8DFD3]">
              <h3 className="text-lg font-semibold" style={{ fontFamily: 'Playfair Display, serif' }}>Cart ({cartCount})</h3>
              <button onClick={() => setCartOpen(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-3">
              {cart.length === 0 ? (
                <div className="py-12 text-center">
                  <ShoppingBag className="w-10 h-10 text-[#E8DFD3] mx-auto mb-3" />
                  <p className="text-sm" style={{ fontFamily: 'Playfair Display, serif' }}>Cart is empty</p>
                  <button onClick={() => { setCartOpen(false); nav('collection'); }} className="text-xs text-[#A0522D] underline mt-2">Shop Now</button>
                </div>
              ) : cart.map(it => (
                <div key={it.id} className="flex gap-3 py-3 border-b border-[#E8DFD3]">
                  <div className="w-14 h-14 rounded bg-[#F0EBE4] overflow-hidden shrink-0"><img src={it.image} alt="" className="w-full h-full object-cover" /></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between"><p className="text-sm font-medium truncate">{it.name}</p><button onClick={() => { setCart(prev => prev.filter(i => i.id !== it.id)); show('Removed', 'info'); }}><Trash2 className="w-3.5 h-3.5 text-[#B0A395]" /></button></div>
                    <p className="text-[10px] text-[#8B7D6B]">Size {it.size}</p>
                    <div className="flex items-center justify-between mt-1.5">
                      <div className="inline-flex border border-[#E8DFD3] rounded">
                        <button onClick={() => setCart(prev => prev.map(i => i.id === it.id ? { ...i, qty: Math.max(1, i.qty - 1) } : i))} className="w-7 h-7 flex items-center justify-center"><Minus className="w-3 h-3" /></button>
                        <span className="w-7 h-7 flex items-center justify-center text-[11px] font-medium border-x border-[#E8DFD3]">{it.qty}</span>
                        <button onClick={() => setCart(prev => prev.map(i => i.id === it.id ? { ...i, qty: i.qty + 1 } : i))} className="w-7 h-7 flex items-center justify-center"><Plus className="w-3 h-3" /></button>
                      </div>
                      <span className="text-sm font-semibold">${it.price * it.qty}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {cart.length > 0 && (
              <div className="px-5 py-4 border-t border-[#E8DFD3]">
                {cartTotal < 50 && (
                  <div className="mb-3"><p className="text-[10px] text-[#8B7D6B] mb-1">${50 - cartTotal} to free shipping</p><div className="bg-[#F0EBE4] rounded-full h-1.5"><div className="bg-[#7A8B6F] h-full rounded-full" style={{ width: `${(cartTotal / 50) * 100}%` }} /></div></div>
                )}
                <div className="flex justify-between mb-3"><span className="text-sm text-[#8B7D6B]">Subtotal</span><span className="text-lg font-bold">${cartTotal}</span></div>
                <button onClick={() => { setCartOpen(false); setCheckStep(1); nav('checkout'); }} className="w-full bg-[#A0522D] text-[#FAF6F1] text-xs tracking-[0.1em] uppercase py-3.5 font-semibold">Checkout</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SEARCH OVERLAY */}
      {searchOpen && (
        <div className="fixed inset-0 z-[60] bg-[#FAF6F1]">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-[#E8DFD3]">
            <Search className="w-5 h-5 text-[#8B7D6B] shrink-0" />
            <input type="text" value={searchQ} onChange={handleSearchQ} placeholder="Search bracelets..." className="flex-1 text-sm outline-none bg-transparent placeholder:text-[#B0A395]" autoFocus />
            <button onClick={() => { setSearchOpen(false); setSearchQ(''); }}><X className="w-5 h-5" /></button>
          </div>
          <div className="px-5 py-4">
            {!searchQ ? (
              <div>
                <p className="text-xs text-[#8B7D6B] mb-3">Trending</p>
                <div className="flex flex-wrap gap-2">{['Rose Quartz', 'Custom bracelet', 'Gold', 'Gift card'].map(t => <button key={t} onClick={() => setSearchQ(t)} className="text-xs px-3 py-1.5 bg-[#F0EBE4] rounded-full text-[#3E2F1C]">{t}</button>)}</div>
              </div>
            ) : (
              <div>
                {products.filter(p => p.name.toLowerCase().includes(searchQ.toLowerCase()) || p.material.toLowerCase().includes(searchQ.toLowerCase())).map(p => (
                  <button key={p.id} onClick={() => { setSearchOpen(false); setSearchQ(''); nav('product', p); }} className="w-full flex items-center gap-3 py-3 border-b border-[#E8DFD3] text-left">
                    <div className="w-12 h-12 rounded bg-[#F0EBE4] overflow-hidden"><img src={p.image} alt="" className="w-full h-full object-cover" /></div>
                    <div><p className="text-sm font-medium">{p.name}</p><p className="text-xs text-[#8B7D6B]">${p.price}</p></div>
                  </button>
                ))}
                {products.filter(p => p.name.toLowerCase().includes(searchQ.toLowerCase())).length === 0 && (
                  <div className="py-12 text-center"><Search className="w-8 h-8 text-[#E8DFD3] mx-auto mb-2" /><p className="text-sm text-[#8B7D6B]">No results for &ldquo;{searchQ}&rdquo;</p></div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* LOGIN MODAL */}
      {loginOpen && (
        <div className="fixed inset-0 z-[60] flex items-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setLoginOpen(false)} />
          <div className="relative w-full bg-white rounded-t-2xl max-h-[85vh] overflow-y-auto">
            <div className="w-10 h-1 bg-[#E8DFD3] rounded-full mx-auto mt-3" />
            <div className="px-6 pt-5 pb-8">
              <div className="flex gap-6 mb-6 border-b border-[#E8DFD3]">
                <button onClick={() => setLoginTab('signin')} className={`pb-3 text-sm font-medium ${loginTab === 'signin' ? 'text-[#3E2F1C] border-b-2 border-[#A0522D]' : 'text-[#8B7D6B]'}`}>Sign In</button>
                <button onClick={() => setLoginTab('register')} className={`pb-3 text-sm font-medium ${loginTab === 'register' ? 'text-[#3E2F1C] border-b-2 border-[#A0522D]' : 'text-[#8B7D6B]'}`}>Create Account</button>
              </div>
              {loginTab === 'signin' ? (
                <div className="space-y-3">
                  <input placeholder="Email" className="w-full px-4 py-3 border border-[#E8DFD3] text-sm placeholder:text-[#B0A395] outline-none focus:border-[#A0522D] rounded-lg" />
                  <input type="password" placeholder="Password" className="w-full px-4 py-3 border border-[#E8DFD3] text-sm placeholder:text-[#B0A395] outline-none focus:border-[#A0522D] rounded-lg" />
                  <button className="text-xs text-[#A0522D] underline">Forgot password?</button>
                  <button onClick={() => { setLoggedIn(true); setLoginOpen(false); show('Welcome back!', 'success'); }} className="w-full bg-[#A0522D] text-[#FAF6F1] text-xs tracking-[0.1em] uppercase py-3.5 font-semibold mt-2">Sign In</button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <input placeholder="First name" className="px-4 py-3 border border-[#E8DFD3] text-sm placeholder:text-[#B0A395] outline-none focus:border-[#A0522D] rounded-lg" />
                    <input placeholder="Last name" className="px-4 py-3 border border-[#E8DFD3] text-sm placeholder:text-[#B0A395] outline-none focus:border-[#A0522D] rounded-lg" />
                  </div>
                  <input placeholder="Email" className="w-full px-4 py-3 border border-[#E8DFD3] text-sm placeholder:text-[#B0A395] outline-none focus:border-[#A0522D] rounded-lg" />
                  <input type="password" placeholder="Password" className="w-full px-4 py-3 border border-[#E8DFD3] text-sm placeholder:text-[#B0A395] outline-none focus:border-[#A0522D] rounded-lg" />
                  <button onClick={() => { setLoggedIn(true); setLoginOpen(false); show('Account created!', 'success'); }} className="w-full bg-[#A0522D] text-[#FAF6F1] text-xs tracking-[0.1em] uppercase py-3.5 font-semibold">Create Account</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SIZE GUIDE */}
      {sizeGuideOpen && (
        <div className="fixed inset-0 z-[60] flex items-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSizeGuideOpen(false)} />
          <div className="relative w-full bg-white rounded-t-2xl">
            <div className="w-10 h-1 bg-[#E8DFD3] rounded-full mx-auto mt-3" />
            <div className="px-6 pt-5 pb-8">
              <h3 className="text-lg font-semibold mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>Size Guide</h3>
              <div className="space-y-2">
                {[{ s: 'S', w: '14-15cm', f: 'Petite wrists' }, { s: 'M', w: '16-17cm', f: 'Most wrists' }, { s: 'L', w: '18-19cm', f: 'Larger wrists' }, { s: 'XL', w: '20-21cm', f: 'Extra room' }].map(sz => (
                  <div key={sz.s} className="flex items-center justify-between py-3 border-b border-[#E8DFD3]">
                    <div className="flex items-center gap-3"><span className="w-8 h-8 bg-[#F0EBE4] flex items-center justify-center text-sm font-medium">{sz.s}</span><div><p className="text-sm font-medium">{sz.w}</p><p className="text-[10px] text-[#8B7D6B]">{sz.f}</p></div></div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-[#8B7D6B] mt-4">Measure your wrist with a flexible tape. Add 1cm for comfort.</p>
            </div>
          </div>
        </div>
      )}

      {/* LIVE CHAT */}
      {!chatOpen && (
        <button onClick={() => setChatOpen(true)} className="fixed bottom-20 right-4 w-12 h-12 rounded-full bg-[#A0522D] text-white flex items-center justify-center shadow-lg z-50">
          <MessageCircle className="w-5 h-5" />
        </button>
      )}
      {chatOpen && (
        <div className="fixed bottom-20 right-4 w-[300px] h-[380px] bg-white rounded-2xl shadow-2xl border border-[#E8DFD3] flex flex-col z-50 overflow-hidden">
          <div className="bg-[#3E2F1C] px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2"><div className="w-7 h-7 rounded-full bg-[#A0522D] flex items-center justify-center text-white text-[10px] font-bold">B</div><div><p className="text-xs font-medium text-[#FAF6F1]">Chat with us</p><p className="text-[9px] text-[#B0A395]">Usually replies in minutes</p></div></div>
            <button onClick={() => setChatOpen(false)}><X className="w-4 h-4 text-[#B0A395]" /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {chatMsgs.map((m, i) => (
              <div key={i} className={`max-w-[85%] ${m.from === 'user' ? 'ml-auto' : ''}`}>
                <div className={`px-3 py-2 rounded-xl text-xs ${m.from === 'user' ? 'bg-[#A0522D] text-white rounded-br-sm' : 'bg-[#F0EBE4] text-[#3E2F1C] rounded-bl-sm'}`}>{m.text}</div>
              </div>
            ))}
          </div>
          <div className="flex gap-2 p-3 border-t border-[#E8DFD3]">
            <div className="flex gap-1 mb-0">
              {['Sizing help', 'Order status'].map(q => <button key={q} onClick={() => { setChatMsgs(prev => [...prev, { from: 'user', text: q }]); setTimeout(() => setChatMsgs(prev => [...prev, { from: 'bot', text: 'Let me help you with that!' }]), 800); }} className="text-[9px] px-2 py-1 bg-[#F0EBE4] rounded-full text-[#3E2F1C] shrink-0">{q}</button>)}
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 pb-3">
            <input value={chatInput} onChange={handleChatIn} placeholder="Type a message..." className="flex-1 px-3 py-2 bg-[#F0EBE4] rounded-full text-xs outline-none placeholder:text-[#B0A395]" />
            <button onClick={sendChat} className="w-8 h-8 rounded-full bg-[#A0522D] flex items-center justify-center text-white shrink-0"><Send className="w-3.5 h-3.5" /></button>
          </div>
        </div>
      )}

      {/* TOAST */}
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[70] bg-white shadow-lg border border-[#E8DFD3] rounded-xl px-5 py-3 flex items-center gap-3">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${toast.t === 'success' ? 'bg-[#7A8B6F]' : 'bg-[#8B7D6B]'}`}>
            <Check className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-sm text-[#3E2F1C] font-medium">{toast.m}</span>
        </div>
      )}
    </div>
  );
}

export default App;