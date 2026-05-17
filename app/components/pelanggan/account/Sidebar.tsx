"use client";
import { useState, useEffect } from "react"; // Tambahkan ini
import { useRouter, useSearchParams } from "next/navigation";
import { User, Package, Truck, Heart, LogOut, ShoppingCart, Star } from "lucide-react";

export default function Sidebar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "profile";
  
  // State untuk simpan data user
  const [user, setUser] = useState(null);

  // Cek status login saat komponen di-mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (data.user) setUser(data.user);
      } catch (err) {
        setUser(null);
      }
    };
    fetchUser();
  }, []);

  const allMenus = [
    { id: "profile", label: "PROFILE", icon: <User size={16} /> },
    { id: "orders", label: "ORDERS", icon: <Package size={16} /> },
    { id: "shipments", label: "SHIPMENTS", icon: <Truck size={16} /> },
    { id: "favorites", label: "FAVORITES", icon: <Heart size={16} /> },
    { id: "cart", label: "MY CART", icon: <ShoppingCart size={16} /> },
    { id: "reviews", label: "REVIEWS", icon: <Star size={16} /> },
  ];

  // LOGIKA FILTER: Jika tidak ada user, hanya sisakan 'cart'
  const visibleMenus = user 
    ? allMenus 
    : allMenus.filter(menu => menu.id === "cart");

  const handleNavigation = (id: string) => {
    router.push(`/account?tab=${id}`, { scroll: false });
  };

  const handleLogout = async () => {
    const res = await fetch("/api/auth/logout", { method: "POST" });
    if (res.ok) {
      window.location.href = "/"; // Redirect ke home setelah logout
    }
  };

  return (
    <aside className="w-64 flex flex-col h-full py-2">
      <div className="mb-12">
        <h2 className="text-xl font-black tracking-tight text-[#062C2C]">Concierge Hub</h2>
        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em]">
          {user ? "Exclusive Member" : "Guest Voyager"}
        </span>
      </div>

      <nav className="flex flex-col gap-6 mb-8">
        {visibleMenus.map((item) => (
          <button
            key={item.id}
            onClick={() => handleNavigation(item.id)}
            className={`flex items-center gap-4 text-[11px] font-black tracking-[0.3em] transition-all group ${
              activeTab === item.id ? "text-[#062C2C]" : "text-gray-400 hover:text-[#062C2C]"
            }`}
          >
            <div className={`w-[2px] h-4 bg-[#062C2C] transition-all ${
              activeTab === item.id ? "opacity-100" : "opacity-0"
            }`} />
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>

      <div className="mt-auto space-y-8">
        {/* Tombol Logout hanya muncul jika user sudah login */}
        {user && (
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 text-[11px] font-black tracking-[0.3em] text-gray-400 hover:text-red-600 transition-colors uppercase"
          >
            <LogOut size={16} /> Logout
          </button>
        )}
        
        <button className="w-full bg-[#062C2C] text-white py-4 rounded-full text-[9px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg active:scale-95">
          Request Assistance
        </button>
      </div>
    </aside>
  );
}