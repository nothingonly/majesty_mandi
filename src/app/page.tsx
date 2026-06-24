'use client';
import React, { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export default function Home() {
  const [cart, setCart] = useState<{name: string, price: number, qty: number}[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Canvas Preloader States and Refs
  const TOTAL_FRAMES = 240;
  const FRAME_PREFIX = "ezgif-frame-";
  const FRAME_PADDING = 3;
  const FRAME_EXTENSION = ".jpg";
  const FRAME_START_INDEX = 1;

  const [isPreloaderMounted, setIsPreloaderMounted] = useState(true);
  const [isPreloaderFading, setIsPreloaderFading] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const animationFrameId = useRef<number | null>(null);

  const heroImages = ["/chicken juicy mandi.png", "/mutton juicy mandi.png", "/fish platter mandi.png"];
  const [currentHeroIdx, setCurrentHeroIdx] = useState(0);

  // Preload and play canvas animation
  useEffect(() => {
    let loadedCount = 0;
    const images: HTMLImageElement[] = [];

    // Preload all frames
    for (let i = FRAME_START_INDEX; i < FRAME_START_INDEX + TOTAL_FRAMES; i++) {
      const img = new Image();
      const frameNum = String(i).padStart(FRAME_PADDING, '0');
      img.src = `/logo-frames/${FRAME_PREFIX}${frameNum}${FRAME_EXTENSION}`;
      img.onload = () => {
        loadedCount++;
        if (loadedCount === TOTAL_FRAMES) {
          startAnimation();
        }
      };
      img.onerror = () => {
        loadedCount++;
        if (loadedCount === TOTAL_FRAMES) {
          startAnimation();
        }
      };
      images.push(img);
    }
    imagesRef.current = images;

    let currentFrame = 0;
    let lastTime = 0;
    const fpsInterval = 1000 / 24; // 24 FPS

    function startAnimation() {
      // Draw first frame immediately
      drawFrame(0);
      requestAnimationFrame(animate);
    }

    function drawFrame(frameIdx: number) {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const img = imagesRef.current[frameIdx];
          if (img && img.complete) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          }
        }
      }
    }

    function animate(timestamp: number) {
      if (!lastTime) lastTime = timestamp;
      const elapsed = timestamp - lastTime;

      if (elapsed > fpsInterval) {
        lastTime = timestamp - (elapsed % fpsInterval);

        drawFrame(currentFrame);
        currentFrame++;

        if (currentFrame >= TOTAL_FRAMES) {
          // Reached final frame. Pause for 1 second, then fade out.
          setTimeout(() => {
            setIsPreloaderFading(true);
            setTimeout(() => {
              setIsPreloaderMounted(false);
            }, 1000); // 1s fade-out duration
          }, 1000); // 1s pause at the end
          return; // Stop animation loop
        }
      }

      animationFrameId.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);

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

  const menuItems = [
    { name: "Mutton Juicy Mandi", img: "/mutton juicy mandi.png", price: 650 },
    { name: "Chicken Faham Mandi", img: "/chicken faham Mandi.png", price: 450 },
    { name: "Fish Platter Mandi", img: "/fish platter mandi.png", price: 750 },
    { name: "Chicken Madfoon", img: "/chicken madfoon Mandi.png", price: 480 },
    { name: "Chicken Majestic", img: "/chicken majestic.png", price: 350 },
    { name: "Chicken Juicy Mandi", img: "/chicken juicy mandi.png", price: 400 },
    { name: "Chicken Broasted Mandi", img: "/chicken broasted mandi.png", price: 420 },
    { name: "Chicken Crispy Mandi", img: "/chicken crispy mandi.png", price: 430 },
    { name: "Chicken Fry Mandi", img: "/chicken fry mandi.png", price: 390 },
    { name: "Chicken Lollipop Mandi", img: "/chicken lollipop mandi.png", price: 440 },
    { name: "Chilli Chicken", img: "/chilli chicken.png", price: 320 },
    { name: "Fish Fry Mandi", img: "/fish fry mandi.png", price: 550 },
    { name: "Mutton Fry Mandi", img: "/mutton fry mandi.png", price: 700 },
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
    setIsCartOpen(true);
  };

  const checkoutWhatsApp = () => {
    const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const text = `👑 *MAJESTY MANDI HOUSE ORDER* 👑%0A%0A` + 
                 cart.map(i => `${i.qty}x ${i.name} - ₹${i.price * i.qty}`).join('%0A') + 
                 `%0A%0A*Total: ₹${total}*`;
    window.open(`https://wa.me/918121213533?text=${text}`, '_blank');
  };

  return (
    <main className="min-h-screen bg-[#0B0B0C] text-white font-sans overflow-x-hidden relative cursor-none">

      {/* ═══════════════ CUSTOM AURA CURSOR ═══════════════ */}
      <motion.div
        className="fixed top-0 left-0 w-3 h-3 bg-[#DFB15B] rounded-full pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 hidden md:block"
        style={{ x: cursorX, y: cursorY }}
      />
      <motion.div
        className="fixed top-0 left-0 w-8 h-8 border border-[#DFB15B] rounded-full pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 hidden md:block"
        style={{ x: cursorRingX, y: cursorRingY }}
      />

      {/* ═══════════════ CINEMATIC PRELOADER (THE AURA) ═══════════════ */}
      {isPreloaderMounted && (
        <div 
          className="fixed inset-0 bg-[#0B0B0C] z-[9999] flex flex-col items-center justify-center transition-opacity duration-1000 ease-in-out"
          style={{ opacity: isPreloaderFading ? 0 : 1, pointerEvents: isPreloaderFading ? 'none' : 'auto' }}
        >
          <div className="flex flex-col items-center gap-6">
            <canvas
              ref={canvasRef}
              width={500}
              height={500}
              className="w-64 h-64 md:w-[400px] md:h-[400px]"
              style={{ mixBlendMode: 'screen' }}
            />
            <span className="text-[#DFB15B] font-serif text-xl tracking-[0.3em] uppercase animate-pulse">
              Majesty
            </span>
          </div>
        </div>
      )}

      {/* ═══════════════ CART DRAWER OVERLAY ═══════════════ */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex justify-end">
          <div className="w-full max-w-md bg-[#121212] h-full p-6 flex flex-col border-l border-[#DFB15B] shadow-2xl">
            <div className="flex justify-between items-center mb-8 border-b border-neutral-800 pb-4">
              <h2 className="text-2xl font-serif text-[#DFB15B]">Your Order</h2>
              <button onClick={() => setIsCartOpen(false)} className="text-white text-xl font-bold hover:text-red-500">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {cart.length === 0 ? (
                <p className="text-neutral-500 text-center mt-10">Your cart is empty.</p>
              ) : (
                cart.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center mb-4 bg-neutral-900 p-4 rounded-lg border border-neutral-800">
                    <span className="font-medium">{item.qty}x {item.name}</span>
                    <span className="text-[#DFB15B] font-bold">₹{item.price * item.qty}</span>
                  </div>
                ))
              )}
            </div>
            <button 
              onClick={checkoutWhatsApp} 
              disabled={cart.length === 0}
              className="w-full py-4 bg-[#DFB15B] text-black font-bold text-lg rounded-xl mt-4 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#F3A833] transition-colors"
            >
              SEND ORDER TO WHATSAPP
            </button>
          </div>
        </div>
      )}

      {/* ═══════════════ TOP BANNER ═══════════════ */}
      <div className="w-full bg-[#DFB15B] text-black text-center py-3 font-bold text-sm shadow-md z-50 relative">
        🎓 Exclusive Offer: 10% Discount available with a valid Student ID (Dine-in only).
      </div>

      {/* ═══════════════ HEADER ═══════════════ */}
      <header className="w-full p-4 md:px-8 flex justify-between items-center border-b border-neutral-800 bg-[#0B0B0C]/90 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <img src="/logo.jpg" alt="Logo" className="h-12 w-auto object-contain rounded-full border-2 border-[#DFB15B]" />
          <h1 className="text-xl md:text-2xl font-serif font-bold text-[#DFB15B] tracking-widest uppercase">Majesty</h1>
        </div>
        <button onClick={() => setIsCartOpen(true)} className="bg-neutral-800 px-6 py-2 rounded-lg text-[#DFB15B] font-bold border border-neutral-700 hover:border-[#DFB15B] transition-all flex items-center gap-2 shadow-lg">
          CART <span className="bg-[#DFB15B] text-black px-2 py-0.5 rounded-full text-xs">{cart.reduce((sum, item) => sum + item.qty, 0)}</span>
        </button>
      </header>

      {/* ═══════════════ HERO SECTION ═══════════════ */}
      <section className="w-full py-20 flex flex-col items-center justify-center text-center px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0B0B0C] pointer-events-none z-10" />
        <motion.div 
          initial={{ opacity: 0, y: 50 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          viewport={{ once: true, margin: "-100px" }} 
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col items-center z-20 w-full"
        >
          <h2 className="text-4xl md:text-6xl font-serif mb-4 text-white">...TASTE THE LEGACY...</h2>
          <p className="text-neutral-400 mb-12 max-w-lg">Experience the ultimate authentic Arabian dining right here in Hanamkonda.</p>
          <div className="w-full max-w-2xl animate-[bounce_4s_ease-in-out_infinite]">
            <img src={heroImages[currentHeroIdx]} alt="Signature Mandi" className="w-full h-auto object-contain drop-shadow-[0_0_30px_rgba(223,177,91,0.3)] transition-opacity duration-700 ease-in-out" />
          </div>
        </motion.div>
      </section>

      {/* ═══════════════ THE MAJESTY EXPERIENCE (NARRATIVE ABOUT) ═══════════════ */}
      <section className="w-full py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-3xl md:text-4xl font-serif text-[#DFB15B] mb-8">The Majesty Experience</h3>
          <div className="w-16 h-[2px] bg-[#DFB15B] mx-auto mb-10" />
          <p className="text-neutral-300 text-lg md:text-xl leading-relaxed font-light">
            Majesty Mandi House is a popular dining destination in Hanumakonda that specializes in authentic Arabian-style mandi and traditional Middle Eastern flavors. Known for its fragrant rice, tender meat preparations, and generous portions, the restaurant offers a unique culinary experience for mandi lovers in Greater Warangal.
          </p>
          <p className="text-neutral-300 text-lg md:text-xl leading-relaxed font-light mt-6">
            The restaurant serves a variety of chicken, mutton, and special mandi dishes prepared using aromatic spices and traditional cooking techniques. With its comfortable seating, family-friendly atmosphere, and flavorful menu, Majesty Mandi House has become a preferred choice for families, friends, and food enthusiasts looking to enjoy authentic Arabian cuisine.
          </p>
          <p className="text-neutral-300 text-lg md:text-xl leading-relaxed font-light mt-6">
            Whether you&apos;re visiting for a family dinner, group gathering, or a special meal with friends, Majesty Mandi House provides a memorable dining experience with quality food and warm hospitality.
          </p>

          {/* ─── FEATURES GRID ─── */}
          <div className="flex flex-wrap justify-center gap-3 mt-14">
            {features.map((feature, idx) => (
              <span key={idx} className="border border-[#DFB15B] text-[#DFB15B] px-4 py-2 rounded-full text-sm hover:bg-[#DFB15B] hover:text-black transition-colors cursor-default">
                {feature}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ MENU GRID ═══════════════ */}
      <section className="w-full max-w-7xl mx-auto py-16 px-4">
        <h3 className="text-3xl font-serif text-[#DFB15B] text-center mb-12 border-b border-neutral-800 pb-4">The Royal Selection</h3>
        <motion.div 
          initial={{ opacity: 0, y: 50 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          viewport={{ once: true, margin: "-100px" }} 
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {menuItems.map((item, idx) => (
            <div key={idx} className="bg-[#121212] border border-neutral-800 rounded-2xl p-6 flex flex-col items-center text-center shadow-xl hover:border-[#DFB15B] transition-colors duration-300 group">
              <div className="w-48 h-48 mb-6 flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                <img src={item.img} alt={item.name} className="max-w-[200px] max-h-[200px] object-contain drop-shadow-xl" />
              </div>
              <h4 className="text-xl font-bold mb-2">{item.name}</h4>
              <p className="text-[#DFB15B] font-bold text-xl mb-6">₹{item.price}</p>
              <button onClick={() => addToCart(item)} className="w-full py-3 bg-neutral-800 text-white border border-[#DFB15B] font-bold rounded-lg hover:bg-[#DFB15B] hover:text-black transition-colors">
                ADD TO ORDER
              </button>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ═══════════════ GALLERY GRID ═══════════════ */}
      <section className="w-full bg-[#121212] py-16 px-4 border-t border-neutral-800">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-3xl font-serif text-[#DFB15B] text-center mb-12">The Royal Ambiance</h3>
          <motion.div 
            initial={{ opacity: 0, y: 50 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true, margin: "-100px" }} 
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {galleryImages.map((img, idx) => (
              <div key={idx} className="w-full h-64 rounded-xl overflow-hidden border border-neutral-800">
                <img src={img} alt={`Ambiance ${idx}`} className="w-full h-full object-cover hover:scale-110 transition-transform duration-700" />
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
      <footer className="w-full bg-[#0B0B0C] border-t border-[#DFB15B] py-16 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
          <div>
            <h4 className="text-[#DFB15B] text-xl font-bold mb-4 uppercase">Majesty Mandi House</h4>
            <p className="text-neutral-400">Above ARAVIND STORE, 2nd Floor KSR Plaza,<br/>Kishanpura, Naimnagar,<br/>Hanamkonda, Telangana</p>
          </div>
          <div>
            <h4 className="text-[#DFB15B] text-xl font-bold mb-4 uppercase">Contact</h4>
            <p className="text-neutral-400 mb-2">WhatsApp: <span className="text-white font-bold">8121213533</span></p>
            <p className="text-neutral-400">Instagram: <span className="text-white font-bold">@Majestyhanamkonda</span></p>
          </div>
          <div className="w-full h-48 rounded-xl overflow-hidden border border-neutral-800">
            <iframe src="https://maps.google.com/maps?q=Majesty+Mandi+House,+Above+ARAVIND+STORE,+Kishanpura,+Hanamkonda&t=&z=15&ie=UTF8&iwloc=&output=embed" width="100%" height="100%" style={{ border: 0 }} allowFullScreen={true} loading="lazy"></iframe>
          </div>
        </div>
      </footer>
    </main>
  );
}
