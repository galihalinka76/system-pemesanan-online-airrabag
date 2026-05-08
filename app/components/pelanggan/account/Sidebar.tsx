"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { User, Package, Truck, Heart, LogOut } from "lucide-react";

export default function Sidebar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "profile"; // Default ke profile jika kosong

  const menus = [
    { id: "profile", label: "PROFILE", icon: <User size={16} /> },
    { id: "orders", label: "ORDERS", icon: <Package size={16} /> },
    { id: "shipments", label: "SHIPMENTS", icon: <Truck size={16} /> },
    { id: "favorites", label: "FAVORITES", icon: <Heart size={16} /> },
  ];

  const handleNavigation = (id: string) => {
    // Ini akan mengubah URL menjadi /account?tab=id tanpa reload halaman
    router.push(`/account?tab=${id}`, { scroll: false });
  };

  return (
    <aside className="w-64 flex flex-col h-full py-2">
      <div className="mb-12">
        <h2 className="text-xl font-black tracking-tight text-[#062C2C]">Concierge Hub</h2>
        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em]">Exclusive Member</span>
      </div>

      <nav className="flex flex-col gap-6 mb-8">
        {menus.map((item) => (
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
            {item.label}
          </button>
        ))}
      </nav>

      <div className="mt--12 space-y-8">
        <button className="flex items-center gap-3 text-[11px] font-black tracking-[0.3em] text-gray-400 hover:text-red-600 transition-colors uppercase">
          <LogOut size={16} /> Logout
        </button>
        <button className="w-full bg-[#062C2C] text-white py-4 rounded-full text-[9px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg active:scale-95">
          Request Assistance
        </button>
      </div>
    </aside>
  );
}