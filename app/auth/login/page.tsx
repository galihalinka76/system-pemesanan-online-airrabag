"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, Key, ArrowRightIcon, Loader2 } from "lucide-react";
import Navbar from "@/app/components/pelanggan/Navbar";
import Swal from "sweetalert2";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        // Notifikasi Berhasil
        const Toast = Swal.mixin({
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
        });

        await Toast.fire({
          icon: "success",
          title: `Selamat datang, ${data.user.name}`,
        });

        // Pengalihan berdasarkan Role dari API payload
        if (data.user.role === "ADMIN") {
          router.push("/admin/dashboard");
        } else {
          router.push("/"); // Beranda pelanggan
        }
        
        router.refresh(); // Segarkan state server untuk memperbarui navbar/session
      } else {
        Swal.fire({
          title: "Gagal Masuk",
          text: data.message || "Email atau password salah.",
          icon: "error",
          confirmButtonColor: "#062C2C",
        });
      }
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: "Terjadi gangguan koneksi ke server.",
        icon: "error",
        confirmButtonColor: "#062C2C",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#D9CDB8] text-black">
      <Navbar />
      
      <div className="pt-26 pb-2 flex justify-center items-center px-4">
        <div className="bg-[#EBEBEB] w-full max-w-lg rounded-xl p-8 shadow-xl flex flex-col items-center">
          {/* Icon Circle */}
          <div className="w-20 h-20 bg-[#062C2C] rounded-full flex items-center justify-center mb-4 shadow-lg">
            <Key className="text-[#D9CDB8]" size={32} />
          </div>

          <h1 className="text-3xl font-black tracking-[0.2em] text-[#062C2C] uppercase mb-10">
            LOGIN
          </h1>

          <form onSubmit={handleLogin} className="w-full space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#062C2C] ml-1">
                EMAIL
              </label>
              <div className="flex overflow-hidden rounded-xl border border-gray-200 shadow-sm">
                <div className="bg-[#062C2C] p-4 flex items-center justify-center text-white">
                  <Mail size={18} />
                </div>
                <input
                  required
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="nama@email.com"
                  className="flex-grow p-4 bg-white text-sm focus:outline-none"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#062C2C] ml-1">
                PASSWORD
              </label>
              <div className="flex overflow-hidden rounded-xl border border-gray-200 shadow-sm">
                <div className="bg-[#062C2C] p-4 flex items-center justify-center text-white">
                  <Lock size={18} />
                </div>
                <input
                  required
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="........"
                  className="flex-grow p-4 bg-white text-sm focus:outline-none"
                />
              </div>
              <div className="text-right">
                <button type="button" className="text-[9px] uppercase tracking-tighter text-gray-400 hover:text-[#062C2C]">
                  Lupa Password?
                </button>
              </div>
            </div>

            <button 
              disabled={loading}
              type="submit"
              className="w-full bg-[#062C2C] text-white py-4 rounded-xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-black transition-all shadow-lg active:scale-95 mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={16} /> Memproses...
                </>
              ) : (
                <>
                  Masuk Sekarang <ArrowRightIcon size={16} />
                </>
              )}
            </button>
          </form>

          <p className="mt-10 text-[11px] text-gray-500 font-medium">
            Belum punya akun?{" "}
            <Link href="/auth/register" className="text-[#062C2C] font-black hover:underline">
              Daftar di sini
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}