"use client";
import { useState, useEffect } from "react";
import { Trash2, Plus, Minus, ShoppingBag, Package, Check } from "lucide-react";

export default function CartTab() {
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 1. Ambil info user untuk menentukan key localStorage
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setCurrentUser(data.user.id);
      })
      .catch(() => setCurrentUser(null))
      .finally(() => setLoading(false));
  }, []);

  // 2. Load Cart berdasarkan currentUser
  useEffect(() => {
    if (loading) return;

    const loadCart = () => {
      const cartKey = currentUser ? `cart_${currentUser}` : "cart_guest";
      const saved = JSON.parse(localStorage.getItem(cartKey) || "[]");
      setCartItems(saved);
      setSelectedIds(saved.map((item: any) => item.id));
    };

    loadCart();
    window.addEventListener("cartUpdated", loadCart);
    return () => window.removeEventListener("cartUpdated", loadCart);
  }, [currentUser, loading]);

  const updateQuantity = (id: string, delta: number) => {
    const cartKey = currentUser ? `cart_${currentUser}` : "cart_guest";
    const newCart = cartItems.map((item) => {
      if (item.id === id) {
        const newQty = Math.max(1, (item.quantity || 1) + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    });
    setCartItems(newCart);
    localStorage.setItem(cartKey, JSON.stringify(newCart));
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const removeItem = (id: string) => {
    const cartKey = currentUser ? `cart_${currentUser}` : "cart_guest";
    const newCart = cartItems.filter((item) => item.id !== id);
    setCartItems(newCart);
    setSelectedIds(selectedIds.filter(sid => sid !== id));
    localStorage.setItem(cartKey, JSON.stringify(newCart));
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
    );
  };

  const selectedItems = cartItems.filter(item => selectedIds.includes(item.id));
  const totalPrice = selectedItems.reduce((acc, item) => acc + (item.price * (item.quantity || 1)), 0);

  const formatIDR = (price: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price || 0);

  if (loading) return <div className="py-20 text-center flex flex-col items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#062C2C] mb-4"></div>
        <div className="text-xs text-gray-400">Synchronizing Your Bag...</div>
      </div>;

  if (cartItems.length === 0) {
    return (
      <div className="py-20 text-center flex flex-col items-center justify-center animate-fadeIn">
        <ShoppingBag size={48} className="text-gray-200 mb-4" />
        <p className="text-[10px] font-black tracking-[0.5em] text-gray-300 uppercase">Your cart is empty</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Cart */}
      <div className="flex justify-between items-center px-4">
        <h3 className="text-[10px] font-black tracking-[0.3em] text-gray-400 uppercase">
          Shopping Bag ({cartItems.length})
        </h3>
        <button 
          onClick={() => setSelectedIds(selectedIds.length === cartItems.length ? [] : cartItems.map(i => i.id))}
          className="text-[10px] font-bold text-[#B6AB91] hover:text-[#062C2C] uppercase tracking-widest"
        >
          {selectedIds.length === cartItems.length ? "Deselect All" : "Select All"}
        </button>
      </div>

      {/* Grid Layout: 2 Card Horizontal pada layar besar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {cartItems.map((item) => {
          const displayName = item.name || (item.isBundle ? "Paket Bundling" : "Produk");
          const isSelected = selectedIds.includes(item.id);

          return (
            <div 
              key={item.id} 
              className={`group relative flex flex-col sm:flex-row items-center gap-6 p-6 rounded-[2.5rem] border transition-all duration-500 ${
                isSelected 
                ? "bg-white border-[#B6AB91]/30 shadow-xl shadow-[#062C2C]/5" 
                : "bg-gray-50/50 border-transparent opacity-60 scale-[0.98]"
              }`}
            >
              {/* Checkbox Floating */}
              <button 
                onClick={() => toggleSelect(item.id)}
                className={`absolute top-6 left-6 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all z-30 ${
                  isSelected ? "bg-[#062C2C] border-[#062C2C] text-white" : "border-gray-200 bg-white"
                }`}
              >
                {isSelected && <Check size={12} strokeWidth={4} />}
              </button>
              
              {/* Box Foto dengan Gaya Bundling Overlap */}
              <div className="relative w-32 h-32 flex-shrink-0 flex items-center justify-center">
                {item.isBundle ? (
                  <div className="relative w-full h-full scale-90">
                    <div className="absolute left-0 top-2 w-18 h-24 bg-gray-100 rounded-xl overflow-hidden border-2 border-white shadow-md z-10 rotate-[-8deg] group-hover:rotate-0 transition-transform duration-500">
                      <img 
                        src={item.bundleImages?.[0] || item.image} 
                        className="w-full h-full object-cover"
                        alt="Item 1"
                      />
                    </div>
                    <div className="absolute right-0 bottom-2 w-18 h-24 bg-gray-200 rounded-xl overflow-hidden border-2 border-white shadow-md z-0 rotate-[8deg] group-hover:rotate-0 transition-transform duration-500">
                      <img 
                        src={item.bundleImages?.[1] || item.image} 
                        className="w-full h-full object-cover"
                        alt="Item 2"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-sm">
                    <img src={item.image} alt={displayName} className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
              
              {/* Info & Actions */}
              <div className="flex-grow w-full">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className={`font-bold text-sm uppercase tracking-tight line-clamp-1 ${isSelected ? "text-[#062C2C]" : "text-gray-400"}`}>
                      {displayName}
                    </h4>
                    <p className="text-[11px] font-black text-[#B6AB91] mt-0.5">{formatIDR(item.price)}</p>
                  </div>
                  <button 
                    onClick={() => removeItem(item.id)}
                    className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {item.isBundle && item.bundleItems && (
                  <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-4 line-clamp-1 italic">
                    {item.bundleItems.join(" + ")}
                  </p>
                )}
                
                <div className="flex items-center justify-between mt-auto bg-gray-50/50 p-2 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <button onClick={() => updateQuantity(item.id, -1)} className="w-7 h-7 flex items-center justify-center rounded-full bg-white shadow-sm hover:text-[#B6AB91]">
                      <Minus size={12} />
                    </button>
                    <span className="font-bold text-xs w-4 text-center">{item.quantity || 1}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="w-7 h-7 flex items-center justify-center rounded-full bg-white shadow-sm hover:text-[#B6AB91]">
                      <Plus size={12} />
                    </button>
                  </div>
                  <span className="text-[10px] font-black text-[#062C2C] pr-2">
                    Sub: {formatIDR(item.price * (item.quantity || 1))}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Ringkasan Tetap Memanjang di Bawah */}
      <div className="mt-12 p-8 bg-[#062C2C] rounded-[3rem] text-white flex flex-col md:flex-row justify-between items-center gap-6 shadow-2xl">
        <div className="text-center md:text-left">
          <p className="text-[9px] font-black text-[#B6AB91] uppercase tracking-[0.4em] mb-1">Total Curated Value</p>
          <h3 className="text-3xl font-black">{formatIDR(totalPrice)}</h3>
        </div>
        <button 
          disabled={selectedItems.length === 0}
          className={`px-12 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] transition-all ${
            selectedItems.length > 0 ? "bg-[#B6AB91] text-[#062C2C] hover:bg-white" : "bg-white/10 text-white/30 cursor-not-allowed"
          }`}
        >
          Checkout ({selectedItems.length})
        </button>
      </div>
    </div>
  );
}