"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  LogOut,
  Search,
  ShoppingBag,
  Settings,
  Package,
  Heart,
  LayoutDashboard,
  Tag,
  ShoppingCart,
} from "lucide-react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Monitor scroll untuk efek glassmorphism
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    // Ambil data user dari API
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (data.user) setUser(data.user);
      } catch (err) {
        console.error("Gagal mengambil data user");
      }
    };

    fetchUser();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        setUser(null);
        router.push("/auth/login");
        router.refresh();
      }
    } catch (err) {
      console.error("Logout gagal");
    }
  };

  return (
    <nav
      className={`fixed top-0 w-full z-[100] transition-all duration-500 px-6 md:px-12 py-4 flex justify-between items-center ${
        scrolled
          ? "bg-[#B6AB91]/80 backdrop-blur-xl border-b border-black/10 shadow-lg py-3"
          : "bg-[#B6AB91] py-5"
      }`}
    >
      {/* LOGO */}
      <Link
        href="/"
        className="text-2xl font-black tracking-[0.3em] text-[#020202]"
      >
        AIRBAG.
      </Link>

      {/* CENTER MENU */}
      <div className="hidden md:flex gap-10 text-[10px] font-black tracking-[0.4em] text-[#020202]/60">
        <Link href="/" className="hover:text-[#020202] transition-colors">
          HOME
        </Link>
        <Link href="/shop" className="hover:text-[#020202] transition-colors">
          SHOP
        </Link>
        <Link href="/about" className="hover:text-[#020202] transition-colors">
          ABOUT
        </Link>
        <Link
          href="/contact"
          className="hover:text-[#020202] transition-colors"
        >
          CONTACT
        </Link>
      </div>

      {/* RIGHT SECTION: ICONS & PROFILE */}
      <div className="flex items-center gap-4">
        <button className="p-2 text-[#020202] hover:scale-110 transition">
          <Search size={18} />
        </button>
        <button className="p-2 text-[#020202] hover:scale-110 transition relative">
          <ShoppingBag size={18} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-600 rounded-full border border-[#B6AB91]"></span>
        </button>

        <div className="h-6 w-[1px] bg-black/10 mx-2 hidden sm:block"></div>

        {user ? (
          /* USER LOGGED IN - DROPDOWN */
          <div className="relative group">
            <div className="flex items-center gap-3 cursor-pointer">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-[9px] font-black text-black/40 uppercase tracking-tighter">
                  {user.role === "ADMIN"
                    ? "Authorized Admin"
                    : "Customer Account"}
                </span>
                <span className="text-[11px] font-black text-[#020202] uppercase tracking-widest">
                  {user.name.split(" ")[0]}
                </span>
              </div>
              <div
                className={`${
                  user.role === "ADMIN"
                    ? "bg-red-950 shadow-red-900/20"
                    : "bg-[#020202] shadow-black/20"
                } p-2.5 rounded-full text-[#B6AB91] shadow-xl hover:scale-105 transition-transform duration-300`}
              >
                <User size={18} />
              </div>
            </div>

            {/* DROPDOWN BOX */}
            <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-4 group-hover:translate-y-0 overflow-hidden">
              <div className="p-2 flex flex-col">
                {user.role === "ADMIN" ? (
                  /* ADMIN MENU */
                  <>
                    <Link
                      href="/admin"
                      className="flex items-center gap-3 px-4 py-3 text-[10px] font-black text-gray-700 hover:bg-[#B6AB91]/10 rounded-xl transition uppercase tracking-widest"
                    >
                      <LayoutDashboard size={14} /> Dashboard
                    </Link>

                    {/* Perhatikan perubahan href di bawah ini menjadi /admin/produck */}
                    <Link
                      href="/admin/produck"
                      className="flex items-center gap-3 px-4 py-3 text-[10px] font-black text-gray-700 hover:bg-[#B6AB91]/10 rounded-xl transition uppercase tracking-widest"
                    >
                      <Package size={14} /> Manage Products
                    </Link>

                    <Link
                      href="/admin/promo"
                      className="flex items-center gap-3 px-4 py-3 text-[10px] font-black text-gray-700 hover:bg-[#B6AB91]/10 rounded-xl transition uppercase tracking-widest"
                    >
                      <Tag size={14} /> Promotions
                    </Link>
                  </>
                ) : (
                  /* CUSTOMER MENU */
<>
  <Link
    href="/account?tab=profile" // Tambahkan param agar konsisten
    className="flex items-center gap-3 px-4 py-3 text-[10px] font-black text-gray-700 hover:bg-[#B6AB91]/10 rounded-xl transition uppercase tracking-widest"
  >
    <Settings size={14} /> My Profile
  </Link>

  <Link
    href="/cart"
    className="flex items-center gap-3 px-4 py-3 text-[10px] font-black text-gray-700 hover:bg-[#B6AB91]/10 rounded-xl transition uppercase tracking-widest"
  >
    <ShoppingCart size={14} /> My Cart
  </Link>

  {/* MODIFIKASI DISINI: Arahkan ke /account dengan query tab=orders */}
  <Link
    href="/account?tab=orders" 
    className="flex items-center gap-3 px-4 py-3 text-[10px] font-black text-gray-700 hover:bg-[#B6AB91]/10 rounded-xl transition uppercase tracking-widest"
  >
    <Package size={14} /> My Orders
  </Link>

  <Link
    href="/wishlist"
    className="flex items-center gap-3 px-4 py-3 text-[10px] font-black text-gray-700 hover:bg-[#B6AB91]/10 rounded-xl transition uppercase tracking-widest"
  >
    <Heart size={14} /> Wishlist
  </Link>
</>
                )}

                <div className="my-2 border-t border-gray-50"></div>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 text-[10px] font-black text-red-600 hover:bg-red-50 rounded-xl transition uppercase tracking-widest"
                >
                  <LogOut size={14} /> Sign Out
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* NOT LOGGED IN */
          <div className="flex items-center gap-3">
            <Link
              href="/auth/login"
              className="hidden sm:block text-[10px] font-black text-[#020202] hover:underline underline-offset-8 tracking-[0.2em]"
            >
              SIGN IN
            </Link>
            <Link
              href="/auth/login"
              className="bg-[#020202] p-2.5 rounded-full text-[#B6AB91] hover:scale-110 transition shadow-xl"
            >
              <User size={18} />
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
