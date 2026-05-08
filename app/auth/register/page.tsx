"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, User, MapPin, ArrowRightIcon, Key, Loader2 } from "lucide-react";
import Navbar from "@/app/components/pelanggan/Navbar";
import Swal from "sweetalert2";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // State untuk menampung data form
  const [formData, setFormData] = useState({
    name: "",
    address: "", // Pastikan di API/Prisma juga menangani field alamat jika diperlukan
    email: "",
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
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          address: formData.address, // Sudah aktif sesuai update schema Prisma
        }),
      });

      const data = await res.json();

      if (res.ok) {
        // Menggunakan gaya Toast agar konsisten dengan Login
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
        // Gaya Alert Gagal tetap formal namun warna konsisten
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
    <main className="min-h-screen bg-[#D9CDB8] text-black">
      <Navbar />
      
      <div className="pt-23 pb-2 flex justify-center items-center px-4">
        <div className="bg-[#EBEBEB] w-full max-w-lg rounded-xl p-6 md:p-8 shadow-xl">
          <div className="mb-4">
            <h1 className="text-3xl font-black text-[#062C2C] leading-tight">
              Buat Akun Baru
            </h1>
            <p className="text-sm text-gray-500 mt-2 leading-relaxed">
              Silakan lengkapi data diri Anda untuk bergabung bersama AIRA Jogja.
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-5">
            {[
              { label: "Nama Lengkap", name: "name", icon: <User size={18} />, placeholder: "Tuliskan Nama Lengkap Anda", type: "text" },
              { label: "Alamat Lengkap", name: "address", icon: <MapPin size={18} />, placeholder: "Tuliskan Alamat Rumah Lengkap", type: "text" },
              { label: "Alamat Email", name: "email", icon: <Mail size={18} />, placeholder: "Tuliskan Alamat Email", type: "email" },
              { label: "Password", name: "password", icon: <Key size={18} />, placeholder: "Tuliskan Password", type: "password" },
            ].map((field, idx) => (
              <div key={idx} className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-[#062C2C] ml-1">
                  {field.label}
                </label>
                <div className="flex overflow-hidden rounded-xl border border-gray-200 shadow-sm">
                  <div className="bg-[#062C2C] p-4 flex items-center justify-center text-white">
                    {field.icon}
                  </div>
                  <input
                    required
                    name={field.name}
                    type={field.type}
                    value={(formData as any)[field.name]}
                    onChange={handleChange}
                    placeholder={field.placeholder}
                    className="flex-grow p-4 bg-white text-sm focus:outline-none"
                  />
                </div>
              </div>
            ))}

            <button 
              disabled={loading}
              type="submit"
              className="w-full bg-[#062C2C] text-white py-5 rounded-xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-black transition-all shadow-lg active:scale-95 mt-8 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} /> Memproses...
                </>
              ) : (
                <>
                  Daftar Sekarang <ArrowRightIcon size={16} />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 text-center">
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