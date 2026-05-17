"use client";
import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { Mail, MapPin, Save, Loader2, Phone } from "lucide-react";
import Swal from "sweetalert2";

const MapSection = dynamic(() => import("../../../components/MapSection"), { 
  ssr: false,
  loading: () => (
    <div className="h-80 w-full bg-gray-50 animate-pulse rounded-[2.5rem] flex flex-col items-center justify-center border border-dashed border-gray-200">
      <Loader2 className="animate-spin text-gray-300 mb-2" size={24} />
      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
        Initiating Map Systems...
      </span>
    </div>
  )
});

export default function ProfileTab() {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [address, setAddress] = useState("");
  const [no_telp, setPhone] = useState(""); 
  const [position, setPosition] = useState<[number, number]>([-6.2000, 106.8166]);

  const Toast = useMemo(() => Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
  }), []);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (data.user) {
          setUserData(data.user);
          setAddress(data.user.address || "");
          setPhone(data.user.no_telp || ""); 
        }
      } catch (err) {
        console.error("Gagal memuat profil");
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  const handleLocationSelect = (lat: number, lng: number, addr: string) => {
    setPosition([lat, lng]);
    setAddress(addr);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/user/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, no_telp }), // Kirim phone dan address
      });
      
      if (res.ok) {
        Toast.fire({ 
          icon: "success", 
          title: "Profile Updated", 
          background: "#062C2C", 
          color: "#B6AB91"
        });
      } else {
        throw new Error();
      }
    } catch (err) {
      Toast.fire({ icon: "error", title: "Update Failed" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center flex flex-col items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#062C2C] mb-4"></div>
        <div className="text-xs text-gray-400">Synchronizing Your Profile...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="space-y-10">
        
        {/* --- PROFILE CARD HEADER --- */}
        <div className="p-8 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="w-24 h-24 bg-[#062C2C] rounded-3xl flex items-center justify-center text-[#B6AB91] font-black text-4xl shadow-inner uppercase">
              {userData?.name?.charAt(0)}
            </div>
            <div className="flex-1 text-center sm:text-left">
              <div className="inline-block px-3 py-1 bg-emerald-50 rounded-full mb-2">
                <p className="text-[9px] text-emerald-700 font-black tracking-widest uppercase">
                  Verified {userData?.role || 'Member'}
                </p>
              </div>
              <h2 className="text-3xl font-black text-[#062C2C] uppercase tracking-tighter leading-tight">
                {userData?.name}
              </h2>
              
              {/* Kontak Info Langsung di Bawah Nama */}
              <div className="mt-4 flex flex-wrap justify-center sm:justify-start gap-4">
                <div className="flex items-center gap-2 text-gray-500">
                  <Mail size={14} className="text-[#062C2C]" />
                  <span className="text-xs font-bold">{userData?.email}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500 border-l border-gray-200 pl-4">
                  <Phone size={14} className="text-[#062C2C]" />
                  <span className="text-xs font-bold">{no_telp || "No phone added"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleUpdateProfile} className="space-y-8 px-2">
          
          <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-[#062C2C] border-b border-gray-100 pb-4">
            Personal Details
          </h3>

          {/* --- PHONE EDIT SECTION --- */}
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2 px-1">
              <Phone size={12} /> Contact Number
            </label>
            <input 
              type="text" 
              value={no_telp} 
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+62..."
              className="w-full bg-white border border-gray-100 focus:border-[#062C2C] focus:ring-1 focus:ring-[#062C2C] rounded-2xl p-5 text-xs font-bold transition-all outline-none" 
            />
          </div>

          {/* --- ADDRESS & MAP SECTION --- */}
          <div className="space-y-4 w-full">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2 px-1">
              <MapPin size={12} /> Shipping Sanctuary
            </label>
            
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Detailed shipping address..."
              className="w-full bg-white border border-gray-100 focus:border-[#062C2C] focus:ring-1 focus:ring-[#062C2C] rounded-[2rem] p-6 text-[11px] font-bold leading-relaxed transition-all outline-none resize-none shadow-sm min-h-[100px]"
            />

            {/* Peta Dinamis */}
            <MapSection 
              position={position} 
              address={address} 
              onLocationSelect={handleLocationSelect} 
            />
          </div>

          {/* --- ACTION BUTTON --- */}
          <button 
            type="submit" 
            disabled={saving} 
            className="w-full bg-[#062C2C] text-[#B6AB91] py-6 rounded-[2rem] font-black text-[11px] tracking-[0.4em] uppercase flex items-center justify-center gap-3 hover:bg-black transition-all active:scale-95 disabled:opacity-50 shadow-xl"
          >
            {saving ? (
              <><Loader2 className="animate-spin" size={18} /> Updating...</>
            ) : (
              <><Save size={18} /> Save Archives</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}