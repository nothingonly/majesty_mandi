'use client';
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useScroll, useTransform, useMotionTemplate } from 'framer-motion';


// ── 3D TILT CARD COMPONENT ────────────────────────────────────────────────────
function TiltCard({ children, className }: { children: React.ReactNode; className?: string }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const glareX = useMotionValue(50);
  const glareY = useMotionValue(50);

  const springRotateX = useSpring(rotateX, { damping: 20, stiffness: 200 });
  const springRotateY = useSpring(rotateY, { damping: 20, stiffness: 200 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    // Disable 3D tilt on touch/small screens
    if (typeof window !== 'undefined' && window.innerWidth < 1024) return;
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    rotateX.set(-dy * 10);
    rotateY.set(dx * 10);
    glareX.set((e.clientX - rect.left) / rect.width * 100);
    glareY.set((e.clientY - rect.top) / rect.height * 100);
  };

  const handleMouseLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
    glareX.set(50);
    glareY.set(50);
  };

  return (
    <motion.div
      ref={cardRef}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX: springRotateX,
        rotateY: springRotateY,
        transformStyle: 'preserve-3d',
      }}
    >
      {/* Glare overlay */}
      <motion.div
        className="absolute inset-0 rounded-2xl pointer-events-none z-10"
        style={{
          backgroundImage: useMotionTemplate`radial-gradient(circle at ${glareX}% ${glareY}%, rgba(223,177,91,0.14) 0%, transparent 70%)`,
        }}
      />
      {children}
    </motion.div>
  );
}

// ── MAGNETIC BUTTON COMPONENT ─────────────────────────────────────────────────
function MagneticButton({ onClick, children, className }: { onClick: () => void; children: React.ReactNode; className?: string }) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { damping: 15, stiffness: 200 });
  const springY = useSpring(y, { damping: 15, stiffness: 200 });

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const btn = btnRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    x.set((e.clientX - cx) * 0.35);
    y.set((e.clientY - cy) * 0.35);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.button
      ref={btnRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY }}
      className={className}
    >
      {children}
    </motion.button>
  );
}

export default function Home() {
  const [cart, setCart] = useState<{name: string, price: number, qty: number}[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Checkout form state
  const [orderType, setOrderType] = useState<'delivery' | 'pickup'>('delivery');
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [flat, setFlat] = useState('');
  const [street, setStreet] = useState('');
  const [landmark, setLandmark] = useState('');
  const [pincode, setPincode] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const city = 'Hanamkonda';

  // Canvas Scroll Preloader Config
  const TOTAL_FRAMES = 191;
  const FRAME_PREFIX = "frame_";
  const FRAME_PADDING = 4;
  const FRAME_EXTENSION = ".webp";
  const FRAME_START_INDEX = 0;

  const [isLoading, setIsLoading] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const activeFrameRef = useRef(0);

  const heroImages = ["/chicken juicy mandi.png", "/mutton juicy mandi.png", "/fish platter mandi.png"];
  const [currentHeroIdx, setCurrentHeroIdx] = useState(0);

  // Draw frame on canvas
  const drawFrame = (frameIdx: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const img = imagesRef.current[frameIdx];
    if (img && img.complete) {
      if (canvas.width !== img.naturalWidth || canvas.height !== img.naturalHeight) {
        canvas.width = img.naturalWidth || 1920;
        canvas.height = img.naturalHeight || 1080;
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    }
  };

  // Preload frames and set timer
  useEffect(() => {
    const images: HTMLImageElement[] = [];
    for (let i = FRAME_START_INDEX; i < FRAME_START_INDEX + TOTAL_FRAMES; i++) {
      const img = new Image();
      const frameNum = String(i).padStart(FRAME_PADDING, '0');
      img.src = `/webp_frames/${FRAME_PREFIX}${frameNum}${FRAME_EXTENSION}`;
      
      const idx = i - FRAME_START_INDEX;
      img.onload = () => {
        if (activeFrameRef.current === idx) {
          drawFrame(idx);
        }
      };
      images.push(img);
    }
    imagesRef.current = images;

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  // Scroll logic for scrubbing the canvas
  useEffect(() => {
    const handleScroll = () => {
      const container = scrollContainerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const scrollRange = rect.height - window.innerHeight;
      if (scrollRange <= 0) return;

      let progress = -rect.top / scrollRange;
      progress = Math.max(0, Math.min(1, progress));

      const frameIndex = Math.floor(progress * (TOTAL_FRAMES - 1));
      activeFrameRef.current = frameIndex;
      drawFrame(frameIndex);
    };

    window.addEventListener('scroll', handleScroll);
    // Draw initial frame
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [isLoading]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHeroIdx((prev) => (prev + 1) % heroImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const springConfig = { damping: 25, stiffness: 250, mass: 0.5 };
  const cursorRingX = useSpring(cursorX, springConfig);
  const cursorRingY = useSpring(cursorY, springConfig);

  // Parallax for Ambiance Gallery
  const ambianceRef = useRef<HTMLElement | null>(null);
  const { scrollYProgress: ambianceProgress } = useScroll({
    target: ambianceRef,
    offset: ['start end', 'end start'],
  });
  const parallaxY = useTransform(ambianceProgress, [0, 1], ['-15%', '15%']);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };
    window.addEventListener('mousemove', moveCursor);
    return () => {
      window.removeEventListener('mousemove', moveCursor);
    };
  }, [cursorX, cursorY]);

  const categories = ["All", "Chicken", "Mutton", "Seafood"];
  const [activeCategory, setActiveCategory] = useState("All");

  const menuItems = [
    { name: "Mutton Juicy Mandi",       img: "/mutton juicy mandi.png",        price: 650, category: "Mutton"   },
    { name: "Chicken Faham Mandi",       img: "/chicken faham Mandi.png",       price: 450, category: "Chicken"  },
    { name: "Fish Platter Mandi",        img: "/fish platter mandi.png",        price: 750, category: "Seafood"  },
    { name: "Chicken Madfoon",           img: "/chicken madfoon Mandi.png",     price: 480, category: "Chicken"  },
    { name: "Chicken Majestic",          img: "/chicken majestic.png",          price: 350, category: "Chicken"  },
    { name: "Chicken Juicy Mandi",       img: "/chicken juicy mandi.png",       price: 400, category: "Chicken"  },
    { name: "Chicken Broasted Mandi",    img: "/chicken broasted mandi.png",    price: 420, category: "Chicken"  },
    { name: "Chicken Crispy Mandi",      img: "/chicken crispy mandi.png",      price: 430, category: "Chicken"  },
    { name: "Chicken Fry Mandi",         img: "/chicken fry mandi.png",         price: 390, category: "Chicken"  },
    { name: "Chicken Lollipop Mandi",    img: "/chicken lollipop mandi.png",    price: 440, category: "Chicken"  },
    { name: "Chilli Chicken",            img: "/chilli chicken.png",            price: 320, category: "Chicken"  },
    { name: "Fish Fry Mandi",            img: "/fish fry mandi.png",            price: 550, category: "Seafood"  },
    { name: "Mutton Fry Mandi",          img: "/mutton fry mandi.png",          price: 700, category: "Mutton"   },
  ];

  const galleryImages = [
    "/outer view.jpeg",
    "/inner view.jpg",
    "/inner view 2.jpg",
    "/inner view 3.jpg",
    "/dinning place 1.jpg",
    "/dinning place 2.jpg",
    "/dinning place 3.jpg",
  ];

  const features = [
    "Authentic Arabian Mandi", "Chicken Mandi", "Mutton Mandi", "Special Family Mandi",
    "Arabian Cuisine", "Grilled Chicken Specialties", "Large Sharing Platters",
    "Family-Friendly Dining", "Group Seating", "Dine-In Facility", "Takeaway Available",
    "Freshly Prepared Food", "Comfortable Ambience", "Lunch & Dinner Service",
    "Suitable for Family Gatherings",
  ];

  const addToCart = (item: any) => {
    setCart(prev => {
      const existing = prev.find(i => i.name === item.name);
      if (existing) return prev.map(i => i.name === item.name ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { name: item.name, price: item.price, qty: 1 }];
    });
    // Drawer stays closed — user opens it manually via the Cart button
  };

  const increaseQty = (name: string) => {
    setCart(prev => prev.map(i => i.name === name ? { ...i, qty: i.qty + 1 } : i));
  };

  const decreaseQty = (name: string) => {
    setCart(prev => {
      const item = prev.find(i => i.name === name);
      if (!item) return prev;
      if (item.qty === 1) return prev.filter(i => i.name !== name);
      return prev.map(i => i.name === name ? { ...i, qty: i.qty - 1 } : i);
    });
  };

  const removeFromCart = (name: string) => {
    setCart(prev => prev.filter(i => i.name !== name));
  };

  const checkoutWhatsApp = () => {
    const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
    const gst = Math.round(subtotal * 0.05);
    const grandTotal = subtotal + gst;
    const itemLines = cart.map((i, n) => `${n + 1}. ${i.qty}x ${i.name} — ₹${i.price * i.qty}`).join('\n');
    const addressLine = orderType === 'delivery'
      ? `\n\n*ADDRESS:* ${flat}, ${street}${landmark ? ', ' + landmark : ''}, ${city}${pincode ? ' — ' + pincode : ''}`
      : '';
    const notesLine = specialInstructions ? `\n*Notes:* ${specialInstructions}` : '';
    const text = encodeURIComponent(
      `🛎️ *NEW ORDER — MAJESTY MANDI HOUSE* 🛎️\n\n` +
      `*Type:* ${orderType === 'delivery' ? '🚗 Home Delivery' : '🏠 Pickup'}\n` +
      `*Customer:* ${customerName || 'N/A'}\n` +
      `*Phone:* ${phone || 'N/A'}\n\n` +
      `*ITEMS:*\n${itemLines}\n\n` +
      `*Subtotal:* ₹${subtotal}\n` +
      `*GST (5%):* ₹${gst}\n` +
      `*Grand Total:* ₹${grandTotal}` +
      addressLine + notesLine
    );
    window.open(`https://wa.me/918121213533?text=${text}`, '_blank');
  };

  return (
    <main className="min-h-screen bg-[#0B0B0C] text-white font-sans overflow-clip relative cursor-auto lg:cursor-none">

      {/* ═══════════════ CUSTOM AURA CURSOR (desktop only) ═══════════════ */}
      <motion.div
        className="fixed top-0 left-0 w-3 h-3 bg-[#DFB15B] rounded-full pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 hidden lg:block"
        style={{ x: cursorX, y: cursorY }}
      />
      <motion.div
        className="fixed top-0 left-0 w-8 h-8 border border-[#DFB15B] rounded-full pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 hidden lg:block"
        style={{ x: cursorRingX, y: cursorRingY }}
      />

      {/* ═══════════════ CINEMATIC PRELOADER (THE AURA) ═══════════════ */}
      {isLoading && (
        <div className="fixed inset-0 bg-[#0B0B0C] z-[999] flex items-center justify-center transition-opacity duration-700">
          <div className="flex flex-col items-center gap-6">
            <img
              src="/logo.jpg"
              alt="Majesty Mandi House Logo"
              className="w-32 h-32 rounded-full object-cover shadow-[0_0_50px_10px_rgba(223,177,91,0.6)] animate-pulse border-2 border-[#DFB15B]"
            />
            <span className="text-[#DFB15B] font-serif text-xl tracking-[0.3em] uppercase animate-pulse">Majesty</span>
          </div>
        </div>
      )}

      {/* ═══════════════ CART DRAWER OVERLAY ═══════════════ */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex justify-end">
          <div className="w-full sm:max-w-md bg-[#121212] h-full flex flex-col border-l border-[#DFB15B] shadow-2xl">

            {/* ── Drawer Header ── */}
            <div className="flex justify-between items-center px-4 sm:px-6 py-4 border-b border-neutral-800 shrink-0">
              <h2 className="text-xl sm:text-2xl font-serif text-[#DFB15B]">Your Order</h2>
              <button onClick={() => setIsCartOpen(false)} className="text-white text-xl font-bold hover:text-red-500 p-1">✕</button>
            </div>

            {/* ── Scrollable Body ── */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4">

              {/* Order Type Toggle */}
              <div className="flex rounded-xl overflow-hidden border border-neutral-700 text-sm font-bold">
                <button
                  onClick={() => setOrderType('delivery')}
                  className={`flex-1 py-2.5 transition-colors ${
                    orderType === 'delivery' ? 'bg-[#DFB15B] text-black' : 'bg-neutral-900 text-neutral-400 hover:text-white'
                  }`}
                >
                  🚗 Home Delivery
                </button>
                <button
                  onClick={() => setOrderType('pickup')}
                  className={`flex-1 py-2.5 transition-colors ${
                    orderType === 'pickup' ? 'bg-[#DFB15B] text-black' : 'bg-neutral-900 text-neutral-400 hover:text-white'
                  }`}
                >
                  🏠 Pickup
                </button>
              </div>

              {/* Cart Items */}
              {cart.length === 0 ? (
                <p className="text-neutral-500 text-center py-8 text-sm">Your cart is empty. Browse the menu below.</p>
              ) : (
                <div className="space-y-2">
                  {cart.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-neutral-900 p-3 rounded-lg border border-neutral-800 gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm truncate">{item.name}</p>
                        <p className="text-[#DFB15B] text-xs font-bold mt-0.5">₹{item.price * item.qty}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button onClick={() => decreaseQty(item.name)} className="w-7 h-7 rounded-full bg-neutral-700 hover:bg-red-500 text-white font-bold text-base flex items-center justify-center transition-colors">−</button>
                        <span className="w-5 text-center font-bold text-sm">{item.qty}</span>
                        <button onClick={() => increaseQty(item.name)} className="w-7 h-7 rounded-full bg-neutral-700 hover:bg-[#DFB15B] hover:text-black text-white font-bold text-base flex items-center justify-center transition-colors">+</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Customer Details & Address Form */}
              {cart.length > 0 && (
                <div className="space-y-2.5">
                  <p className="text-xs text-neutral-500 uppercase tracking-widest font-bold border-t border-neutral-800 pt-4">Customer Details</p>
                  <input
                    value={customerName} onChange={e => setCustomerName(e.target.value)}
                    placeholder="Full Name *"
                    className="w-full bg-neutral-900 border border-neutral-800 text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#DFB15B] placeholder:text-neutral-600 transition-colors"
                  />
                  <input
                    value={phone} onChange={e => setPhone(e.target.value)}
                    placeholder="Mobile Number *" type="tel"
                    className="w-full bg-neutral-900 border border-neutral-800 text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#DFB15B] placeholder:text-neutral-600 transition-colors"
                  />

                  {orderType === 'delivery' && (
                    <>
                      <p className="text-xs text-neutral-500 uppercase tracking-widest font-bold border-t border-neutral-800 pt-3">Delivery Address</p>
                      <input
                        value={flat} onChange={e => setFlat(e.target.value)}
                        placeholder="Flat / House No. *"
                        className="w-full bg-neutral-900 border border-neutral-800 text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#DFB15B] placeholder:text-neutral-600 transition-colors"
                      />
                      <input
                        value={street} onChange={e => setStreet(e.target.value)}
                        placeholder="Street / Area *"
                        className="w-full bg-neutral-900 border border-neutral-800 text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#DFB15B] placeholder:text-neutral-600 transition-colors"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          value={landmark} onChange={e => setLandmark(e.target.value)}
                          placeholder="Landmark"
                          className="w-full bg-neutral-900 border border-neutral-800 text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#DFB15B] placeholder:text-neutral-600 transition-colors"
                        />
                        <input
                          value={pincode} onChange={e => setPincode(e.target.value)}
                          placeholder="Pincode" type="number"
                          className="w-full bg-neutral-900 border border-neutral-800 text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#DFB15B] placeholder:text-neutral-600 transition-colors"
                        />
                      </div>
                    </>
                  )}

                  <textarea
                    value={specialInstructions} onChange={e => setSpecialInstructions(e.target.value)}
                    placeholder="Special Instructions (optional)..." rows={2}
                    className="w-full bg-neutral-900 border border-neutral-800 text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#DFB15B] placeholder:text-neutral-600 resize-none transition-colors"
                  />
                </div>
              )}
            </div>

            {/* ── Footer: Bill + Checkout ── */}
            {cart.length > 0 && (() => {
              const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
              const gst = Math.round(subtotal * 0.05);
              const grandTotal = subtotal + gst;
              return (
                <div className="px-4 sm:px-6 py-4 border-t border-neutral-800 shrink-0 bg-[#0f0f0f]">
                  <div className="space-y-1.5 mb-3">
                    <div className="flex justify-between text-sm text-neutral-400">
                      <span>Subtotal</span><span className="text-white font-medium">₹{subtotal}</span>
                    </div>
                    <div className="flex justify-between text-sm text-neutral-400">
                      <span>GST (5%)</span><span className="text-white font-medium">₹{gst}</span>
                    </div>
                    <div className="flex justify-between text-base font-bold text-[#DFB15B] border-t border-neutral-800 pt-2">
                      <span>Grand Total</span><span>₹{grandTotal}</span>
                    </div>
                  </div>
                  <button
                    onClick={checkoutWhatsApp}
                    className="w-full py-3 sm:py-4 bg-[#DFB15B] text-black font-bold text-base sm:text-lg rounded-xl hover:bg-[#F3A833] transition-colors"
                  >
                    📲 SEND ORDER TO WHATSAPP
                  </button>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* ═══════════════ TOP BANNER ═══════════════ */}
      <div className="w-full bg-[#DFB15B] text-black text-center py-3 font-bold text-sm shadow-md z-50 relative">
        🎓 Exclusive Offer: 10% Discount available with a valid Student ID (Dine-in only).
      </div>

      {/* ═══════════════ HEADER ═══════════════ */}
      <header className="w-full px-3 sm:px-4 md:px-8 py-3 flex justify-between items-center gap-2 border-b border-neutral-800 bg-[#0B0B0C]/90 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <img src="/logo.jpg" alt="Logo" className="h-9 w-9 sm:h-12 sm:w-auto object-contain rounded-full border-2 border-[#DFB15B] shrink-0" />
          <h1 className="text-base sm:text-xl md:text-2xl font-serif font-bold text-[#DFB15B] tracking-widest uppercase truncate">Majesty</h1>
        </div>
        <button onClick={() => setIsCartOpen(true)} className="shrink-0 bg-neutral-800 px-3 sm:px-6 py-2 rounded-lg text-[#DFB15B] font-bold text-sm sm:text-base border border-neutral-700 hover:border-[#DFB15B] transition-all flex items-center gap-1 sm:gap-2 shadow-lg">
          CART <span className="bg-[#DFB15B] text-black px-2 py-0.5 rounded-full text-xs">{cart.reduce((sum, item) => sum + item.qty, 0)}</span>
        </button>
      </header>

      {/* ═══════════════ SCROLL-BOUND CANVAS SECTION ═══════════════ */}
      <div ref={scrollContainerRef} className="relative w-full h-[300vh] bg-[#0B0B0C]">
        <div className="sticky top-0 w-full h-screen flex items-center justify-center pointer-events-none">
          <canvas
            ref={canvasRef}
            className="w-full h-full object-contain mix-blend-screen scale-[1.7] sm:scale-125 md:scale-100"
          />
        </div>
      </div>

      {/* ═══════════════ HERO SECTION ═══════════════ */}
      <section className="w-full py-12 md:py-20 flex flex-col items-center justify-center text-center px-4 sm:px-6 md:px-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0B0B0C] pointer-events-none z-10" />
        <motion.div 
          initial={{ opacity: 0, y: 50 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          viewport={{ once: true, margin: "-100px" }} 
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col items-center z-20 w-full"
        >
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-serif mb-3 sm:mb-4 text-white leading-tight">...TASTE THE LEGACY...</h2>
          <p className="text-sm sm:text-base md:text-lg text-neutral-400 mb-8 sm:mb-12 max-w-lg px-2">Experience the ultimate authentic Arabian dining right here in Hanamkonda.</p>
          <div className="w-full max-w-xs sm:max-w-md md:max-w-2xl animate-[bounce_4s_ease-in-out_infinite]">
            <img src={heroImages[currentHeroIdx]} alt="Signature Mandi" className="w-full h-auto object-contain drop-shadow-[0_0_30px_rgba(223,177,91,0.3)] transition-opacity duration-700 ease-in-out" />
          </div>
        </motion.div>
      </section>

      {/* ═══════════════ THE MAJESTY EXPERIENCE (NARRATIVE ABOUT) ═══════════════ */}
      <section className="w-full py-12 md:py-20 px-4 sm:px-6 md:px-12 lg:px-24">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-serif text-[#DFB15B] mb-6 sm:mb-8">The Majesty Experience</h3>
          <div className="w-16 h-[2px] bg-[#DFB15B] mx-auto mb-8 sm:mb-10" />
          <p className="text-neutral-300 text-sm sm:text-base md:text-lg leading-relaxed font-light">
            Majesty Mandi House is a popular dining destination in Hanumakonda that specializes in authentic Arabian-style mandi and traditional Middle Eastern flavors. Known for its fragrant rice, tender meat preparations, and generous portions, the restaurant offers a unique culinary experience for mandi lovers in Greater Warangal.
          </p>
          <p className="text-neutral-300 text-sm sm:text-base md:text-lg leading-relaxed font-light mt-4 sm:mt-6">
            The restaurant serves a variety of chicken, mutton, and special mandi dishes prepared using aromatic spices and traditional cooking techniques. With its comfortable seating, family-friendly atmosphere, and flavorful menu, Majesty Mandi House has become a preferred choice for families, friends, and food enthusiasts looking to enjoy authentic Arabian cuisine.
          </p>
          <p className="text-neutral-300 text-sm sm:text-base md:text-lg leading-relaxed font-light mt-4 sm:mt-6">
            Whether you&apos;re visiting for a family dinner, group gathering, or a special meal with friends, Majesty Mandi House provides a memorable dining experience with quality food and warm hospitality.
          </p>

          {/* ─── FEATURES GRID ─── */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mt-10 sm:mt-14">
            {features.map((feature, idx) => (
              <span key={idx} className="border border-[#DFB15B] text-[#DFB15B] px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm hover:bg-[#DFB15B] hover:text-black transition-colors cursor-default">
                {feature}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ MENU GRID ═══════════════ */}
      <section className="w-full max-w-7xl mx-auto py-12 md:py-16 px-4 sm:px-6 md:px-12">
        <h3 className="text-2xl sm:text-3xl font-serif text-[#DFB15B] text-center mb-6 sm:mb-8 border-b border-neutral-800 pb-4">The Royal Selection</h3>

        {/* ── Category Filter Bar ── */}
        <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 mb-8 sm:mb-12 scrollbar-none">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`shrink-0 px-5 sm:px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 ${
                activeCategory === cat
                  ? 'bg-[#DFB15B] text-black shadow-[0_0_15px_rgba(223,177,91,0.4)]'
                  : 'border border-neutral-700 text-neutral-400 hover:text-white hover:border-neutral-500'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* ── Menu Grid with AnimatePresence ── */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
          style={{ perspective: 1000 }}
        >
          <AnimatePresence mode="popLayout">
            {menuItems
              .filter(item => activeCategory === 'All' || item.category === activeCategory)
              .map(item => (
                <motion.div
                  key={item.name}
                  layout
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.88 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                >
                  <TiltCard className="relative bg-[#121212] border border-neutral-800 rounded-2xl p-5 sm:p-6 flex flex-col items-center text-center shadow-xl hover:border-[#DFB15B] transition-colors duration-300 group overflow-hidden h-full">
                    <div className="w-36 h-36 sm:w-48 sm:h-48 mb-4 sm:mb-6 flex items-center justify-center lg:group-hover:scale-105 transition-transform duration-500" style={{ transform: 'translateZ(20px)' }}>
                      <img src={item.img} alt={item.name} className="w-full h-full object-contain drop-shadow-xl" />
                    </div>
                    <div className="flex-1 flex flex-col items-center">
                      <span className="text-xs font-bold tracking-widest text-[#DFB15B]/50 uppercase mb-1">{item.category}</span>
                      <h4 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2" style={{ transform: 'translateZ(15px)' }}>{item.name}</h4>
                      <p className="text-[#DFB15B] font-bold text-lg sm:text-xl mb-4 sm:mb-6" style={{ transform: 'translateZ(12px)' }}>₹{item.price}</p>
                    </div>
                    {(() => {
                      const cartItem = cart.find(i => i.name === item.name);
                      return cartItem ? (
                        <div className="flex items-center justify-between w-full bg-[#DFB15B]/10 border border-[#DFB15B]/50 rounded-full px-4 py-2.5">
                          <button onClick={() => decreaseQty(item.name)} className="w-8 h-8 rounded-full bg-[#DFB15B] text-black font-bold text-lg flex items-center justify-center hover:bg-[#F3A833] transition-colors">−</button>
                          <span className="text-[#DFB15B] font-bold text-base">{cartItem.qty} in cart</span>
                          <button onClick={() => increaseQty(item.name)} className="w-8 h-8 rounded-full bg-[#DFB15B] text-black font-bold text-lg flex items-center justify-center hover:bg-[#F3A833] transition-colors">+</button>
                        </div>
                      ) : (
                        <MagneticButton
                          onClick={() => addToCart(item)}
                          className="w-full py-3 bg-neutral-800 text-white border border-[#DFB15B] font-bold text-sm sm:text-base rounded-lg hover:bg-[#DFB15B] hover:text-black transition-colors lg:cursor-none cursor-auto"
                        >
                          ADD TO ORDER
                        </MagneticButton>
                      );
                    })()}
                  </TiltCard>
                </motion.div>
              ))}
          </AnimatePresence>
        </motion.div>
      </section>

      {/* ═══════════════ GALLERY GRID ═══════════════ */}
      <section ref={ambianceRef} className="w-full bg-[#121212] py-12 md:py-16 px-4 sm:px-6 md:px-12 border-t border-neutral-800">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-2xl sm:text-3xl font-serif text-[#DFB15B] text-center mb-8 sm:mb-12">The Royal Ambiance</h3>
          <motion.div 
            initial={{ opacity: 0, y: 50 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true, margin: "-100px" }} 
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
          >
            {galleryImages.map((img, idx) => (
              <div key={idx} className="relative w-full h-56 sm:h-64 md:h-72 lg:h-80 rounded-2xl overflow-hidden border border-neutral-800 shadow-lg lg:cursor-none cursor-auto group">
                <motion.img
                  src={img}
                  alt={`Ambiance ${idx}`}
                  className="w-full h-[130%] object-cover transition-transform duration-[800ms] ease-out md:group-hover:scale-110"
                  style={{ y: parallaxY }}
                />
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════ INFINITE MARQUEE BAND ═══════════════ */}
      <div className="w-full overflow-hidden bg-[#DFB15B]/10 border-y border-[#DFB15B]/30 py-6 flex whitespace-nowrap">
        <motion.div 
          className="flex whitespace-nowrap text-[#DFB15B] font-serif text-lg md:text-xl tracking-[0.2em] font-medium select-none"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ repeat: Infinity, ease: "linear", duration: 30 }}
        >
          {/* Half 1 */}
          <div className="flex gap-16 pr-16 shrink-0">
            <span>✦ TASTE THE LEGACY</span>
            <span>✦ AUTHENTIC ARABIAN DINING</span>
            <span>✦ THE ROYAL EXPERIENCE</span>
            <span>✦ MAJESTY MANDI HOUSE</span>
          </div>
          {/* Half 2 */}
          <div className="flex gap-16 pr-16 shrink-0">
            <span>✦ TASTE THE LEGACY</span>
            <span>✦ AUTHENTIC ARABIAN DINING</span>
            <span>✦ THE ROYAL EXPERIENCE</span>
            <span>✦ MAJESTY MANDI HOUSE</span>
          </div>
        </motion.div>
      </div>

      {/* ═══════════════ FOOTER ═══════════════ */}
      <footer className="w-full bg-[#0B0B0C] border-t border-[#DFB15B] py-12 md:py-16 px-4 sm:px-6 md:px-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 text-center md:text-left">
          <div>
            <h4 className="text-[#DFB15B] text-base sm:text-xl font-bold mb-3 sm:mb-4 uppercase">Majesty Mandi House</h4>
            <p className="text-neutral-400 text-sm sm:text-base">Above ARAVIND STORE, 2nd Floor KSR Plaza,<br/>Kishanpura, Naimnagar,<br/>Hanamkonda, Telangana</p>
          </div>
          <div>
            <h4 className="text-[#DFB15B] text-base sm:text-xl font-bold mb-3 sm:mb-4 uppercase">Contact</h4>
            <p className="text-neutral-400 text-sm sm:text-base mb-2">WhatsApp: <span className="text-white font-bold">8121213533</span></p>
            <p className="text-neutral-400 text-sm sm:text-base">Instagram: <span className="text-white font-bold">@Majestyhanamkonda</span></p>
          </div>
          <div className="w-full h-48 sm:h-56 rounded-xl overflow-hidden border border-neutral-800">
            <iframe src="https://maps.google.com/maps?q=Majesty+Mandi+House,+Above+ARAVIND+STORE,+Kishanpura,+Hanamkonda&t=&z=15&ie=UTF8&iwloc=&output=embed" width="100%" height="100%" style={{ border: 0 }} allowFullScreen={true} loading="lazy"></iframe>
          </div>
        </div>
      </footer>
    </main>
  );
}
