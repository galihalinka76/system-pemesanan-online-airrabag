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
      className={`
        z-[100] flex
        w-full
        px-6 py-4
        transition-all
        fixed top-0 duration-500 justify-between items-center
        md:px-12
        ${
          scrolled
            ? "bg-[#B6AB91]/80 backdrop-blur-xl border-b border-black/10 shadow-lg py-3"
            : "bg-[#B6AB91] py-5"
        }
      `}
    >
      {/* LOGO */}
      <Link
        href="/"
        className="
          text-2xl font-black tracking-[0.3em] text-[#020202]
        "
      >
        AIRBAG.
      </Link>

      {/* CENTER MENU */}
      <div
        className="
          hidden
          text-[10px] font-black tracking-[0.4em] text-[#020202]/60
          gap-10
          md:flex
        "
      >
        <Link
          href="/"
          className="
            transition-colors
            hover:text-[#020202]
          "
        >
          HOME
        </Link>
        <Link
          href="/shop"
          className="
            transition-colors
            hover:text-[#020202]
          "
        >
          SHOP
        </Link>
        <Link
          href="/about"
          className="
            transition-colors
            hover:text-[#020202]
          "
        >
          ABOUT
        </Link>
        <Link
          href="/contact"
          className="
            transition-colors
            hover:text-[#020202]
          "
        >
          CONTACT
        </Link>
      </div>

      {/* RIGHT SECTION: ICONS & PROFILE */}
      <div
        className="
          flex
          items-center gap-4
        "
      >
        <button
          className="
            p-2
            text-[#020202]
            hover:scale-110 transition
          "
        >
          <Search size={18} />
        </button>
        <button
          className="
            p-2
            text-[#020202]
            hover:scale-110 transition relative
          "
        >
          <ShoppingBag size={18} />
          <span
            className="
              w-2 h-2
              bg-red-600
              rounded-full border border-[#B6AB91]
              absolute top-1 right-1
            "
          ></span>
        </button>

        <div
          className="
            hidden
            h-6 w-[1px]
            mx-2
            bg-black/10
            sm:block
          "
        ></div>

        {user ? (
          /* USER LOGGED IN - DROPDOWN */
          <div
            className="
              relative group
            "
          >
            <div
              className="
                flex
                cursor-pointer
                items-center gap-3
              "
            >
              <div
                className="
                  hidden flex-col
                  items-end
                  sm:flex
                "
              >
                <span
                  className="
                    text-[9px] font-black text-black/40 tracking-tighter
                    uppercase
                  "
                >
                  {user.role === "ADMIN"
                    ? "Authorized Admin"
                    : "Customer Account"}
                </span>
                <span
                  className="
                    text-[11px] font-black text-[#020202] tracking-widest
                    uppercase
                  "
                >
                  {user.name.split(" ")[0]}
                </span>
              </div>
              <div
                className={`
                  p-2.5
                  text-[#B6AB91]
                  rounded-full
                  shadow-xl transition-transform
                  hover:scale-105 duration-300
                  ${
                    user.role === "ADMIN"
                      ? "bg-red-950 shadow-red-900/20"
                      : "bg-[#020202] shadow-black/20"
                  }
                `}
              >
                <User size={18} />
              </div>
            </div>

            {/* DROPDOWN BOX */}
            <div
              className="
                overflow-hidden
                w-56
                mt-3
                bg-white
                rounded-2xl border border-gray-100
                shadow-[0_20px_50px_rgba(0,0,0,0.15)] opacity-0 transition-all
                absolute right-0 invisible group-hover:opacity-100 group-hover:visible duration-300 transform translate-y-4 group-hover:translate-y-0
              "
            >
              <div
                className="
                  flex flex-col
                  p-2
                "
              >
                {user.role === "ADMIN" ? (
                  /* ADMIN MENU */
                  <>
                    <Link
                      href="/admin"
                      className="
                        flex
                        px-4 py-3
                        text-[10px] font-black text-gray-700 tracking-widest
                        rounded-xl
                        items-center gap-3 hover:bg-[#B6AB91]/10 transition uppercase
                      "
                    >
                      <LayoutDashboard size={14} /> Dashboard
                    </Link>

                    {/* Perhatikan perubahan href di bawah ini menjadi /admin/produck */}
                    <Link
                      href="/admin/produck"
                      className="
                        flex
                        px-4 py-3
                        text-[10px] font-black text-gray-700 tracking-widest
                        rounded-xl
                        items-center gap-3 hover:bg-[#B6AB91]/10 transition uppercase
                      "
                    >
                      <Package size={14} /> Manage Products
                    </Link>

                    <Link
                      href="/admin/promo"
                      className="
                        flex
                        px-4 py-3
                        text-[10px] font-black text-gray-700 tracking-widest
                        rounded-xl
                        items-center gap-3 hover:bg-[#B6AB91]/10 transition uppercase
                      "
                    >
                      <Tag size={14} /> Promotions
                    </Link>
                  </>
                ) : (
                  /* CUSTOMER MENU */
                  <>
                    <Link
                      href="/account?tab=profile"
                      className="
                        flex
                        px-4 py-3
                        text-[10px] font-black text-gray-700 tracking-widest
                        rounded-xl
                        items-center gap-3 hover:bg-[#B6AB91]/10 transition uppercase
                      "
                    >
                      <Settings size={14} /> My Profile
                    </Link>

                    <Link
                      href="/cart"
                      className="
                        flex
                        px-4 py-3
                        text-[10px] font-black text-gray-700 tracking-widest
                        rounded-xl
                        items-center gap-3 hover:bg-[#B6AB91]/10 transition uppercase
                      "
                    >
                      <ShoppingCart size={14} /> My Cart
                    </Link>

                    {/* MODIFIKASI DISINI: Arahkan ke /account dengan query tab=orders */}
                    <Link
                      href="/account?tab=orders"
                      className="
                        flex
                        px-4 py-3
                        text-[10px] font-black text-gray-700 tracking-widest
                        rounded-xl
                        items-center gap-3 hover:bg-[#B6AB91]/10 transition uppercase
                      "
                    >
                      <Package size={14} /> My Orders
                    </Link>

                    <Link
                      href="/wishlist"
                      className="
                        flex
                        px-4 py-3
                        text-[10px] font-black text-gray-700 tracking-widest
                        rounded-xl
                        items-center gap-3 hover:bg-[#B6AB91]/10 transition uppercase
                      "
                    >
                      <Heart size={14} /> Wishlist
                    </Link>
                  </>
                )}

                <div
                  className="
                    my-2
                    border-t border-gray-50
                  "
                ></div>

                <button
                  onClick={handleLogout}
                  className="
                    flex
                    px-4 py-3
                    text-[10px] font-black text-red-600 tracking-widest
                    rounded-xl
                    items-center gap-3 hover:bg-red-50 transition uppercase
                  "
                >
                  <LogOut size={14} /> Sign Out
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* NOT LOGGED IN */
          <div
            className="
              flex
              items-center gap-3
            "
          >
            <Link
              href="/auth/login"
              className="
                hidden
                text-[10px] font-black text-[#020202] tracking-[0.2em]
                hover:underline underline-offset-8
                sm:block
              "
            >
              SIGN IN
            </Link>
            <Link
              href="/auth/login"
              className="
                p-2.5
                text-[#B6AB91]
                bg-[#020202]
                rounded-full
                shadow-xl
                hover:scale-110 transition
              "
            >
              <User size={18} />
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
