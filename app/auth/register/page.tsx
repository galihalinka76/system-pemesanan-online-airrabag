"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Key, User, MapPin, ArrowRightIcon, Phone, Loader2 } from "lucide-react"; // Tambahkan Phone icon
import Navbar from "@/app/components/pelanggan/Navbar";
import Swal from "sweetalert2";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    email: "",
    no_telp: "", // 👈 Tambahkan ini
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData), // Kirim semua data termasuk no_telp
      });

      const data = await res.json();

      if (res.ok) {
        const Toast = Swal.mixin({
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
        });

        await Toast.fire({
          icon: "success",
          title: "Registrasi Berhasil!",
          text: "Silakan login dengan akun baru Anda.",
        });

        router.push("/auth/login");
      } else {
        Swal.fire({
          title: "Registrasi Gagal",
          text: data.message || "Terjadi kesalahan saat mendaftar.",
          icon: "error",
          confirmButtonColor: "#062C2C",
        });
      }
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: "Koneksi ke server terputus.",
        icon: "error",
        confirmButtonColor: "#062C2C",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#D9CDB8] text-black pb-4">
      <Navbar />
      
      <div className="pt-26 pb-4 flex justify-center items-center px-2">
        <div className="bg-[#EBEBEB] w-full max-w-xl rounded-xl p-6 md:p-10 shadow-xl"> {/* Lebar max-w ditingkatkan */}
          <div className="mb-4 text-center md:text-left">
            <h1 className="text-3xl font-black text-[#062C2C] leading-tight">
              Buat Akun Baru
            </h1>
            <p className="text-sm text-gray-500 leading-relaxed">
              Silakan lengkapi data diri Anda untuk bergabung bersama AIRA Jogja.
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-5">
            {/* Nama Lengkap - Full Width */}
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-[#062C2C] ml-1">Nama Lengkap</label>
              <div className="flex overflow-hidden rounded-xl border border-gray-200 shadow-sm bg-white">
                <div className="bg-[#062C2C] p-4 flex items-center justify-center text-white">
                  <User size={18} />
                </div>
                <input required name="name" type="text" value={formData.name} onChange={handleChange} placeholder="Tuliskan Nama Lengkap" className="flex-grow p-4 text-sm focus:outline-none" />
              </div>
            </div>

            {/* Email & No Telp - BARIS KIRI KANAN */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-[#062C2C] ml-1">Email</label>
                <div className="flex overflow-hidden rounded-xl border border-gray-200 shadow-sm bg-white">
                  <div className="bg-[#062C2C] p-4 flex items-center justify-center text-white">
                    <Mail size={18} />
                  </div>
                  <input required name="email" type="email" value={formData.email} onChange={handleChange} placeholder="email@contoh.com" className="flex-grow p-4 text-sm focus:outline-none" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-[#062C2C] ml-1">No. Telepon</label>
                <div className="flex overflow-hidden rounded-xl border border-gray-200 shadow-sm bg-white">
                  <div className="bg-[#062C2C] p-4 flex items-center justify-center text-white">
                    <Phone size={18} />
                  </div>
                  <input required name="no_telp" type="tel" value={formData.no_telp} onChange={handleChange} placeholder="0812xxxx" className="flex-grow p-4 text-sm focus:outline-none" />
                </div>
              </div>
            </div>

            {/* Alamat Lengkap - Full Width */}
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-[#062C2C] ml-1">Alamat Lengkap</label>
              <div className="flex overflow-hidden rounded-xl border border-gray-200 shadow-sm bg-white">
                <div className="bg-[#062C2C] p-4 flex items-center justify-center text-white">
                  <MapPin size={18} />
                </div>
                <input required name="address" type="text" value={formData.address} onChange={handleChange} placeholder="Tuliskan Alamat Rumah" className="flex-grow p-4 text-sm focus:outline-none" />
              </div>
            </div>

            {/* Password - Full Width */}
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-[#062C2C] ml-1">Password</label>
              <div className="flex overflow-hidden rounded-xl border border-gray-200 shadow-sm bg-white">
                <div className="bg-[#062C2C] p-4 flex items-center justify-center text-white">
                  <Key size={18} />
                </div>
                <input required name="password" type="password" value={formData.password} onChange={handleChange} placeholder="Minimal 6 karakter" className="flex-grow p-4 text-sm focus:outline-none" />
              </div>
            </div>

            <button 
              disabled={loading}
              type="submit"
              className="w-full bg-[#062C2C] text-white py-5 rounded-xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-black transition-all shadow-lg active:scale-95  disabled:opacity-70"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <>Daftar Sekarang <ArrowRightIcon size={16} /></>}
            </button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-[11px] text-gray-500 font-medium">
              Sudah memiliki akun?{" "}
              <Link href="/auth/login" className="text-[#062C2C] font-black hover:underline">
                Masuk di sini
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}