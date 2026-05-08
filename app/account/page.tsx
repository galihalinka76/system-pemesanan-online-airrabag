"use client";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/app/components/pelanggan/Navbar";
import Sidebar from "../components/pelanggan/account/Sidebar";

// Import Komponen Tab (Pastikan kamu sudah membuat file-file ini)
// import ProfileTab from "../components/pelanggan/account/ProfileTab";
import OrdersTab from "../components/pelanggan/account/OrdersTab";
// import FavoritesTab from "../components/pelanggan/account/FavoritesTab";

function AccountContent() {
  const searchParams = useSearchParams();
  // Mengambil nilai 'tab' dari URL, default ke 'profile'
  const activeTab = searchParams.get("tab") || "profile";

  return (
    <section className="flex-grow bg-gray-50 rounded-4xl p-12 shadow-sm min-h-[80vh] overflow-hidden">
      <header className="mb-12">
        <h1 className="text-5xl font-black tracking-tight text-[#062C2C] mb-2">Your Sanctuary</h1>
        <p className="text-xs text-gray-400 max-w-md leading-relaxed uppercase tracking-tighter">
          A curated space for your personal archives, selections, and bespoke journey with AIRBAG.
        </p>
      </header>

      {/* RENDER KONTEN BERDASARKAN TAB DI URL */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* {activeTab === "profile" && <ProfileTab />} */}
        {activeTab === "orders" && <OrdersTab />}
        {activeTab === "shipments" && (
            <div className="py-20 text-center">
                <p className="text-[10px] font-black tracking-[0.5em] text-gray-300">NO ACTIVE SHIPMENTS</p>
            </div>
        )}
        {/* {activeTab === "favorites" && <FavoritesTab />} */}
      </div>
    </section>
  );
}

export default function AccountPage() {
  return (
    <main className="min-h-screen bg-[#EBEBEB] text-black">
      <Navbar />

      <div className="pt-32 pb-20 px-6 md:px-12 flex gap-12 max-w-7xl mx-auto h-full">
        {/* 
           SIDEBAR: Sekarang tidak perlu oper props manual, 
           Sidebar akan membaca & mengubah URL secara mandiri 
        */}
        <Suspense fallback={<div className="w-64 animate-pulse bg-gray-200 rounded-xl" />}>
           <Sidebar />
        </Suspense>

        {/* 
           CONTENT AREA: Dibungkus Suspense karena useSearchParams 
           memerlukannya pada Client Component di Next.js 
        */}
        <Suspense fallback={<div className="flex-grow bg-white rounded-md animate-pulse" />}>
          <AccountContent />
        </Suspense>
      </div>
    </main>
  );
}