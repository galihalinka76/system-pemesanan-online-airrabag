"use client";
import { useState, useEffect } from "react";
import { Trash2, ShoppingCart, HeartOff, Package } from "lucide-react";
import Image from "next/image";

export default function WishlistTab() {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Fungsi load data dipisah agar bisa dipanggil berulang
  const loadFavorites = (userId: any) => {
    const favKey = userId ? `favorites_${userId}` : "favorites_guest";
    const saved = localStorage.getItem(favKey);
    if (saved) {
      setFavorites(JSON.parse(saved));
    } else {
      setFavorites([]);
    }
  };

  useEffect(() => {
    // 1. Ambil data Auth
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        const userId = data.user?.id || null;
        setCurrentUser(userId);
        // 2. Langsung ambil data favorit setelah tahu ID-nya
        loadFavorites(userId);
      })
      .catch(() => {
        setCurrentUser(null);
        loadFavorites(null);
      })
      .finally(() => {
        // 3. Baru matikan loading setelah data favorit SIAP di state
        setLoading(false);
      });

    // Listener untuk update jika ada perubahan di tab lain
    const handleUpdate = () => {
      // Kita perlu ID terbaru, tapi karena ini didalam useEffect mount, 
      // kita pakai cara manual ambil dari localStorage berdasarkan state saat itu
      const savedUser = currentUser; 
      loadFavorites(savedUser);
    };

    window.addEventListener("favoritesUpdated", handleUpdate);
    return () => window.removeEventListener("favoritesUpdated", handleUpdate);
  }, []); // Cukup dijalankan sekali saat mount

  const removeFavorite = (id: string | number) => {
    const favKey = currentUser ? `favorites_${currentUser}` : "favorites_guest";
    const updated = favorites.filter((item) => item.id !== id);

    setFavorites(updated);
    localStorage.setItem(favKey, JSON.stringify(updated));

    // Trigger event agar Navbar/komponen lain tahu jumlahnya berubah
    window.dispatchEvent(new Event("favoritesUpdated"));
  };

if (loading) {
    return (
      <div className="py-20 text-center flex flex-col items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#062C2C] mb-4"></div>
        <div className="text-xs text-gray-400">Synchronizing Your Wishlist...</div>
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="py-32 text-center flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-3xl">
        <HeartOff size={48} className="text-gray-300 mb-4" />

        <p className="text-[10px] font-black tracking-[0.5em] text-gray-400 uppercase">
          Your curation is empty
        </p>

        <button
          onClick={() => (window.location.href = "/?show=true")}
          className="mt-6 text-[9px] font-bold underline tracking-widest text-[#062C2C]"
        >
          EXPLORE COLLECTIONS
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {favorites.map((item) => (
        <div
          key={item.id}
          className="group flex items-center bg-white p-5 rounded-3xl border border-gray-100 hover:shadow-xl hover:shadow-black/5 transition-all duration-500"
        >
          {/* Thumbnail Area */}
          <div className="relative w-32 h-24 flex-shrink-0">
            {item.isBundle ? (
              /* TAMPILAN KHUSUS BUNDLING: Dua Gambar Bertumpuk */
              <div className="relative w-full h-full flex items-center justify-center">
                <div className="absolute left-0 w-16 h-20 bg-gray-100 rounded-xl overflow-hidden border-2 border-white shadow-md z-10 rotate-[-5deg] group-hover:rotate-0 transition-transform duration-500">
                  <img
                    src={item.bundleItems?.[0]?.image || item.image}
                    className="w-full h-full object-cover"
                    alt="Main Item"
                  />
                </div>
                <div className="absolute right-2 w-16 h-20 bg-gray-200 rounded-xl overflow-hidden border-2 border-white shadow-md z-0 translate-y-2 rotate-[5deg] group-hover:rotate-0 transition-transform duration-500">
                  <img
                    src={item.bundleItems?.[1]?.image || item.image}
                    className="w-full h-full object-cover"
                    alt="Sub Item"
                  />
                </div>
              </div>
            ) : (
              /* TAMPILAN PRODUK BIASA */
              <div className="w-24 h-24 bg-[#F5F5F5] rounded-2xl overflow-hidden">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
            )}
          </div>

          {/* Info Section */}
          <div className="ml-4 flex-grow">
            <div className="flex items-start justify-between">
              <div>
                {item.isBundle && (
                  <span className="flex items-center gap-1 text-[7px] font-black text-[#B6AB91] uppercase tracking-[0.2em] mb-1">
                    <Package size={10} /> Exclusive Bundle
                  </span>
                )}
                <h3 className="text-sm font-bold text-[#062C2C] uppercase tracking-tight line-clamp-1">
                  {item.name}
                </h3>
              </div>
            </div>

            <p className="text-[#062C2C] font-black text-sm mt-1">
              IDR {item.price?.toLocaleString()}
            </p>

            {/* List Item Bundling (Hanya muncul jika bundle) */}
            {item.isBundle && item.bundleItems && (
              <div className="mt-2 flex flex-wrap gap-1">
                {item.bundleItems.map((bi: any, idx: number) => (
                  <span
                    key={idx}
                    className="text-[8px] bg-gray-50 text-gray-500 px-2 py-0.5 rounded border border-gray-100"
                  >
                    {bi.name}
                  </span>
                ))}
              </div>
            )}

            <div className="flex gap-4 mt-4">
              <button className="flex items-center gap-2 text-[9px] font-black tracking-widest text-[#B6AB91] hover:text-[#062C2C] transition-colors">
                <ShoppingCart size={14} /> ADD TO CART
              </button>
              <button
                onClick={() => removeFavorite(item.id)}
                className="flex items-center gap-2 text-[9px] font-black tracking-widest text-gray-300 hover:text-red-500 transition-colors"
              >
                <Trash2 size={14} /> REMOVE
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
