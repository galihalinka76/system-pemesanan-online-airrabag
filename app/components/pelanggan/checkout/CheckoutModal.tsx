"use client";
import { X, Loader2, CheckCircle2, Minus, Plus, MessageCircle } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: any[];
  totalPrice: number;
userId: any;
}

export default function CheckoutModal({ isOpen, onClose, items, totalPrice, userId }: CheckoutModalProps) {
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isReadMore, setIsReadMore] = useState(false);
  const router = useRouter(); 

  // Menentukan stok terkecil jika bundling (agar tidak over-order)
  const minStockAvailable = Math.min(...items.map(item => item.stock || 0));
  const isBundling = items.length > 1;
  
  // Gabungkan deskripsi jika bundling, atau ambil deskripsi produk tunggal
  const rawDescription = isBundling 
    ? `Paket bundling spesial: ${items.map(i => i.name).join(" & ")}. ${items[0].description || ""}`
    : items[0]?.description || "Tidak ada deskripsi produk.";

  const formatIDR = (price: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(price);

const handleCheckout = async () => {
  if (!userId) {
    router.push("/auth/login");
    return;
  }

  setLoading(true);
  
  try {
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: userId,
        items: items,
        totalPrice: totalPrice,
        quantity: quantity
      }),
    });

    if (res.ok) {
      setIsSuccess(true);
      // Tunggu 2 detik agar user melihat pesan sukses sebelum pindah halaman
      setTimeout(() => {
        router.push("/account?tab=orders"); // Arahkan ke tab orders
        onClose();
      }, 2000);
    } else {
      const errorData = await res.json();
      alert(errorData.message || "Terjadi kesalahan");
    }
  } catch (error) {
    alert("Gagal terhubung ke server");
  } finally {
    setLoading(false);
  }
};
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div className="bg-white w-full max-w-4xl rounded-[40px] overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-300 flex flex-col md:flex-row">
        
        <button 
          onClick={onClose} 
          className="absolute right-8 top-8 z-10 text-gray-800 hover:rotate-90 transition-transform duration-300"
        >
          <X size={28} />
        </button>

        {isSuccess ? (
          <div className="w-full p-20 flex flex-col items-center text-center justify-center min-h-[500px]">
            <div className="w-20 h-20 bg-[#062C2C] rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 size={40} className="text-[#B6AB91]" />
            </div>
            <h3 className="text-[#062C2C] font-black text-3xl uppercase">Berhasil!</h3>
            <p className="text-gray-500 mt-2">Pesanan Anda sedang kami siapkan.</p>
          </div>
        ) : (
          <>
            {/* SISI KIRI: Visual Produk */}
            <div className="w-full md:w-1/2 p-10 bg-white flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-gray-100">
              <div className="flex gap-4 items-center mb-6">
                 <div className="bg-[#E2D4B7] px-4 py-1 rounded-md text-[10px] font-bold tracking-tighter italic text-[#062C2C]">AIRABAG</div>
                 <div className="h-8 w-[1px] bg-gray-300 mx-2"></div>
                 <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold leading-tight">
                    Tas kulit kualitas<br/>premium jogja
                 </p>
              </div>

              <div className={`relative flex items-center justify-center ${isBundling ? 'flex-row -space-x-16' : 'w-full'}`}>
                {items.map((item, idx) => (
                  <div 
                    key={idx} 
                    className={`relative aspect-square rounded-[30px] border-[10px] border-[#062C2C] overflow-hidden shadow-2xl transition-transform hover:scale-105
                    ${isBundling ? 'w-56 h-56 z-' + (10 - idx) : 'w-full max-w-[360px]'}`}
                  >
                    <Image src={item.image || "/placeholder.jpg"} alt={item.name} fill className="object-cover" />
                  </div>
                ))}
              </div>

              <div className="mt-10 w-full max-w-[280px]">
                 <div className="flex items-center gap-4 mb-4">
                    <div className="h-[1px] flex-grow bg-gray-200"></div>
                    <span className="text-[10px] font-bold tracking-[0.3em] text-gray-400">VARIAN</span>
                    <div className="h-[1px] flex-grow bg-gray-200"></div>
                 </div>
                 <div className="flex justify-center gap-4 text-center">
                    {['Hitam', 'Putih', 'Cream'].map((v) => (
                        <div key={v} className="group cursor-pointer">
                            <div className={`w-26 h-14 rounded-lg border border-gray-200 mb-1 transition-transform group-hover:scale-110 ${v === 'Hitam' ? 'bg-black' : v === 'Putih' ? 'bg-white' : 'bg-[#E2D4B7]'}`}></div>
                            <span className="text-[9px] font-medium text-gray-500 uppercase tracking-tighter">{v}</span>
                        </div>
                    ))}
                 </div>
              </div>
            </div>

            {/* SISI KANAN: Detail & Actions */}
            <div className="w-full md:w-1/2 p-6 bg-gray-50/50 flex flex-col">
              <div className="flex-grow flex flex-col justify-center">
                <h2 className="text-[#062C2C] text-2xl font-black leading-tight uppercase mb-2">
                    {isBundling ? "Bundling Special Edition" : items[0].name}
                </h2>
                
                <div className="mb-6">
                    {isBundling && (
                        <span className="text-gray-400 line-through text-sm block mb-1">
                            {formatIDR(totalPrice + 500000)}
                        </span>
                    )}
                    <div className="flex items-center gap-3">
                        <span className="text-2xl font-black text-gray-600">{formatIDR(totalPrice)}</span>
                        {isBundling && (
                            <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Save 30%</span>
                        )}
                    </div>
                    <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase tracking-widest">
                        Tersedia: <span className={minStockAvailable < 5 ? "text-red-500" : "text-[#5D733F]"}>{minStockAvailable} Pcs</span>
                    </p>
                </div>

                <div className="text-[12px] text-gray-600 leading-relaxed italic relative">
                    <p className={isReadMore ? "" : "line-clamp-3"}>
                        {rawDescription}
                    </p>
                    {rawDescription.length > 120 && (
                        <button 
                            onClick={() => setIsReadMore(!isReadMore)}
                            className="text-[#062C2C] font-bold text-[10px] uppercase mt-1 underline underline-offset-4 hover:text-[#B6AB91]"
                        >
                            {isReadMore ? "Read Less" : "Read More"}
                        </button>
                    )}
                </div>

                {/* Quantity & Logic */}
                <div className="mt-10 flex items-center gap-4">
                    <div className="flex items-center bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
                        <button 
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            className="p-2 text-gray-500 hover:text-black transition-colors"
                        >
                            <Minus size={16}/>
                        </button>
                        <span className="px-4 font-black text-[#062C2C] min-w-[40px] text-center">{quantity}</span>
                        <button 
                            onClick={() => {
                                if (quantity < minStockAvailable) setQuantity(quantity + 1);
                            }}
                            disabled={quantity >= minStockAvailable}
                            className={`p-2 transition-colors ${quantity >= minStockAvailable ? 'text-gray-200' : 'text-gray-500 hover:text-black'}`}
                        >
                            <Plus size={16}/>
                        </button>
                    </div>
                    <button className="flex-grow bg-black text-white py-4 rounded-xl font-black text-[10px] tracking-[0.2em] hover:bg-[#062C2C] transition-all uppercase shadow-lg active:scale-95">
                        Add to Cart
                    </button>
                </div>

                <button className="mt-6 w-full border-2 border-[#5D733F] text-[#5D733F] py-3 rounded-xl font-bold text-[10px] tracking-widest flex items-center justify-center gap-2 hover:bg-[#5D733F] hover:text-white transition-all uppercase">
                    <MessageCircle size={16} /> Order via Whatsapp
                </button>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <button
        disabled={loading || minStockAvailable === 0}
        onClick={handleCheckout} 
        className="w-full bg-[#062C2C] text-[#B6AB91] py-5 rounded-2xl font-black text-lg tracking-[0.2em] shadow-xl hover:shadow-[#062C2C]/20 transition-all active:scale-95 disabled:grayscale"
      >
        {loading ? (
          <Loader2 className="animate-spin mx-auto" />
        ) : minStockAvailable === 0 ? (
          "Stok Habis"
        ) : (
          "Checkout Now"
        )}
      </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}