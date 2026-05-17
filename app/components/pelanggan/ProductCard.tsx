"use client";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { ShoppingCart, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ProductCard({ 
  product, 
  onBuy, 
  onAddToCart,
  onToggleFavorite,
  userId
}: { 
  product: any, 
  onBuy: (item: any) => void,
  onAddToCart?: (item: any) => void 
  onToggleFavorite?: (item: any) => void
  userId: any
}) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [showHeartOverlay, setShowHeartOverlay] = useState(false); // State untuk animasi IG
  const [coords, setCoords] = useState({ startX: 0, startY: 0, endX: 0, endY: 0 });
  const [mounted, setMounted] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);
  const [isLoved, setIsLoved] = useState(false);
  // Helper untuk mendapatkan key yang sama dengan HomePage
  const getFavKey = () => userId ? `favorites_${userId}` : "favorites_guest";

  useEffect(() => {
    const favKey = getFavKey();
    const favorites = JSON.parse(localStorage.getItem(favKey) || "[]");
    setIsLoved(favorites.some((fav: any) => fav.id === product.id));
  }, [product.id, userId]); // <-- Dependency userId penting di sini

// Sinkronisasi status Love dengan LocalStorage
  useEffect(() => {
    const updateLoveStatus = () => {
      const favKey = getFavKey();
      const favorites = JSON.parse(localStorage.getItem(favKey) || "[]");
      setIsLoved(favorites.some((fav: any) => fav.id === product.id));
    };

    updateLoveStatus();

    // Tambahkan listener agar jika di klik di satu tempat, card lain dengan produk sama ikut update
    window.addEventListener("favoritesUpdated", updateLoveStatus);
    return () => window.removeEventListener("favoritesUpdated", updateLoveStatus);
  }, [product.id, userId]);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const toggleFav = () => {
    if (onToggleFavorite) {
      onToggleFavorite(product);
      // Biarkan useEffect di atas yang mengubah state isLoved 
      // setelah localStorage diupdate oleh fungsi onToggleFavorite di parent
    }
  };

  const handleDoubleTap = () => {
    setShowHeartOverlay(true);
    if (!isLoved) {
      toggleFav();
    }
    setTimeout(() => setShowHeartOverlay(false), 1000);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    toggleFav();
  };

  const handleFlyToCart = () => {
    const cartIcon = document.getElementById("cart-icon");
    if (onAddToCart) onAddToCart(product);

    if (cartIcon && imageRef.current) {
      const rect = imageRef.current.getBoundingClientRect();
      const cartRect = cartIcon.getBoundingClientRect();

      setCoords({
        startX: rect.left + rect.width / 2,
        startY: rect.top + rect.height / 2,
        endX: cartRect.left + cartRect.width / 2,
        endY: cartRect.top + cartRect.height / 2
      });

      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 1000);
    }
  };

  return (
    <div 
      onDoubleClick={handleDoubleTap}
      className="group relative bg-[#062C2C] rounded-lg p-6 flex flex-col items-center 
        transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:-translate-y-2 border border-white/5 select-none"
    >
      
      {/* Portal Animasi Fly To Cart */}
      {mounted && createPortal(
        <AnimatePresence>
          {isAnimating && (
            <motion.div
              initial={{ position: "fixed", top: coords.startY, left: coords.startX, x: "-50%", y: "-50%", scale: 1, opacity: 1, zIndex: 999999 }}
              animate={{ top: coords.endY, left: coords.endX, scale: 0.05, opacity: [1, 0.8, 0], rotate: 1080 }}
              transition={{ duration: 1.0, ease: [0.6, -0.05, 0.01, 0.99] }}
              className="fixed pointer-events-none"
            >
              <div className="w-24 h-24 relative overflow-hidden rounded-full border-2 border-[#B6AB91] bg-[#062C2C] shadow-[0_0_40px_rgba(182,171,145,0.8)]">
                <Image src={product.image} alt="flying" fill className="object-cover" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Product Name */}
      <h3 className="text-white text-[13px] font-light tracking-wide mb-5 text-center px-2">
        {product.name}
      </h3>

      {/* Image Container with Double Click Heart Overlay */}
      <div ref={imageRef} className="relative w-full aspect-square rounded-lg overflow-hidden mb-5 bg-[#083636]">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover group-hover:scale-110 transition-transform duration-1000 ease-in-out"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500 text-[10px] uppercase tracking-tighter">
            No Image
          </div>
        )}

        {/* --- ANIMASI HATI IG (Overlay) --- */}
        <AnimatePresence>
          {showHeartOverlay && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.3, y: 20 }}
              animate={{ opacity: 1, scale: [0.3, 1.2, 1], y: 0 }}
              exit={{ opacity: 0, scale: 1.5, transition: { duration: 0.2 } }}
              className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none"
            >
              <Heart size={80} fill="white" className="text-white drop-shadow-2xl" />
            </motion.div>
          )}
        </AnimatePresence>
        {/* ------------------------------- */}
      </div>

      {/* Price */}
      <p className="text-white text-[16px] font-bold mb-6 tracking-tight">
        {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(product.price)}
      </p>

      {/* Actions */}
      <div className="w-full flex justify-between items-center px-4 mb-6">
        <button 
          onClick={handleFlyToCart}
          className="text-white/80 hover:text-[#B6AB91] transition-all active:scale-75"
        >
          <ShoppingCart size={18} strokeWidth={2} />
        </button>
        
        <button 
          onClick={handleFavoriteClick}
          className={`transition-all active:scale-75 ${isLoved ? 'text-red-500' : 'text-white/80 hover:text-red-400'}`}
        >
          <Heart 
            size={18} 
            strokeWidth={2} 
            fill={isLoved ? "currentColor" : "none"}
          />
        </button>
      </div>

      {/* Buy Button */}
      <div className="relative w-full flex flex-col items-center">
        <button 
          onClick={() => onBuy(product)}
          className="w-[85%] bg-white text-[#062C2C] py-2.5 rounded-full font-extrabold text-[12px] uppercase tracking-[0.2em] hover:bg-[#B6AB91] hover:text-white transition-all duration-300 shadow-lg"
        >
          Beli
        </button>

        <div className="absolute -bottom-5 right-[2%] flex items-center gap-1">
          <span className={`text-[10px] font-bold ${product.stock > 0 ? 'text-[#B6AB91]' : 'text-red-500'}`}>
            {product.stock ?? 0}
          </span>
        </div>
      </div>
      
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-8 h-[2px] bg-white/20 group-hover:w-16 group-hover:bg-[#B6AB91] transition-all duration-500 rounded-full"></div>
    </div>
  );
}