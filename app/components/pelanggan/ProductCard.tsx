"use client";
import Image from "next/image";
import { ShoppingCart, Heart } from "lucide-react"; 

export default function ProductCard({ product }: { product: any }) {
  return (
    <div className="group relative bg-[#062C2C] rounded-lg p-6 flex flex-col items-center 
      transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:-translate-y-2 border border-white/5">
      {/* Product Name */}
      <h3 className="text-white text-[13px] font-light tracking-wide mb-5 text-center px-2">
        {product.name}
      </h3>

      {/* Image Container */}
      <div className="relative w-full aspect-square rounded-lg overflow-hidden mb-5 bg-[#083636]">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-1000 ease-in-out"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500 text-[10px] uppercase tracking-tighter">
            No Image Available
          </div>
        )}
        {/* Subtle Overlay */}
        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500"></div>
      </div>

      {/* Price */}
      <p className="text-white text-[16px] font-bold mb-6 tracking-tight">
        {new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
          minimumFractionDigits: 0,
        }).format(product.price)}
      </p>

      {/* Action Buttons (Cart & Wishlist) */}
      <div className="w-full flex justify-between items-center px-4 mb-6">
        <button className="text-white/80 hover:text-white transition-all active:scale-90">
          <ShoppingCart size={18} strokeWidth={2} />
        </button>
        <button className="text-white/80 hover:text-red-400 transition-all active:scale-90">
          <Heart size={18} strokeWidth={2} />
        </button>
      </div>

      {/* Buy Button */}
      <button className="w-[85%] bg-white text-[#062C2C] py-2.5 rounded-full font-extrabold text-[12px] uppercase tracking-[0.2em] hover:bg-[#B6AB91] hover:text-white transition-all duration-300 shadow-lg">
        Beli
      </button>

      {/* Bottom Decor Line */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-8 h-[2px] bg-white/20 group-hover:w-16 group-hover:bg-[#B6AB91] transition-all duration-500 rounded-full"></div>
    </div>
  );
}