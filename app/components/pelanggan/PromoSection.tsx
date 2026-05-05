"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

export default function PromoSection({ promos }: { promos: any[] }) {
  const [index, setIndex] = useState(0);

  // Auto Slide setiap 5 detik
  useEffect(() => {
    if (promos.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % promos.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [promos]);

  if (!promos || promos.length === 0) return null;

  const currentPromo = promos[index];

  return (
    <div className="relative w-full h-[80vh] bg-[#F9F9F7] overflow-hidden mb-12">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="relative w-full h-full flex"
        >
          {/* Produk A (Kiri) */}
<div className="relative w-1/2 h-full">
  <Image
    src={currentPromo.mainProduct?.image || "/placeholder.jpg"}
    // Gunakan nama produk dari relasi database sebagai alt
    alt={currentPromo.mainProduct?.name || "Premium Bag Selection"} 
    fill
    className="object-cover"
  />
</div>

{/* Produk B (Kanan) */}
<div className="relative w-1/2 h-full">
  <Image
    src={currentPromo.secondProduct?.image || "/placeholder.jpg"}
    // Gunakan nama produk kedua sebagai alt
    alt={currentPromo.secondProduct?.name || "Luxury Accessory"} 
    fill
    className="object-cover"
  />
</div>

          {/* Overlay Content (Floating Box ala Luxe Atelier) */}
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none">
            <div className="bg-white/70 backdrop-blur-md px-12 py-8 text-center border border-white/50 pointer-events-auto">
               <span className="text-[10px] tracking-[0.3em] uppercase text-gray-500 mb-2 block">
                 Limited Time Offer
               </span>
               <h2 className="text-4xl font-bold tracking-tight text-black mb-4">
                 Save 20% on Duo
               </h2>
               <div className="flex gap-4 items-center justify-center text-xs font-mono text-black/60 mb-6">
                  <div><span className="block text-lg font-bold text-black">02</span> DAYS</div>
                  <div className="w-px h-6 bg-black/10"></div>
                  <div><span className="block text-lg font-bold text-black">14</span> HR</div>
                  <div className="w-px h-6 bg-black/10"></div>
                  <div><span className="block text-lg font-bold text-black">55</span> MIN</div>
               </div>
               <button className="bg-[#B6AB91] text-white text-[10px] font-bold px-10 py-3 uppercase tracking-widest hover:bg-black transition-all">
                 Shop Bundle
               </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Indikator Slide */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {promos.map((_, i) => (
          <div 
            key={i} 
            className={`h-1 transition-all duration-500 ${i === index ? 'w-8 bg-[#B6AB91]' : 'w-2 bg-gray-300'}`}
          />
        ))}
      </div>
    </div>
  );
}