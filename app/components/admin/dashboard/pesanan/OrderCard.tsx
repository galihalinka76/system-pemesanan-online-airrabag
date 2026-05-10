import {
  CheckCircle2,
  Clock,
  Package,
  XCircle,
  MessageCircle,
} from "lucide-react";

interface OrderProps {
  id: number;
  name: string;
  price: number;
  customer: string;
  phone: string; // Tambahkan prop baru
  date: string;
  images: string[];
  status: string;
  items: any[];
}

export default function OrderCard({
  id,
  name,
  price,
  customer,
  phone,
  date,
  images,
  status,
  items,
}: OrderProps) {
  const statusConfig: any = {
    PENDING: {
      label: "Menunggu",
      color: "text-amber-500",
      bg: "bg-amber-50",
      icon: <Clock size={12} />,
    },
    PROSES: {
      label: "Diproses",
      color: "text-blue-500",
      bg: "bg-blue-50",
      icon: <Package size={12} />,
    },
    SELESAI: {
      label: "Selesai",
      color: "text-emerald-500",
      bg: "bg-emerald-50",
      icon: <CheckCircle2 size={12} />,
    },
    BATAL: {
      label: "Batal",
      color: "text-red-500",
      bg: "bg-red-50",
      icon: <XCircle size={12} />,
    },
  };

  const current = statusConfig[status] || statusConfig.PENDING;
  const isBundling = items.length > 1;

  const formatIDR = (val: number) => new Intl.NumberFormat("id-ID").format(val);

  // Fungsi untuk handle WhatsApp
  const handleWhatsAppFollowUp = () => {
    if (!phone) return alert("Nomor telepon tidak tersedia");

    // Bersihkan nomor telepon (hilangkan karakter non-angka)
    const cleanPhone = phone.replace(/\D/g, "");
    // Pastikan format 62 jika diawali 0
    const formattedPhone = cleanPhone.startsWith("0")
      ? `62${cleanPhone.slice(1)}`
      : cleanPhone;

    const message = `Halo ${customer}, kami dari admin toko. Kami melihat ada pesanan #${id} (${name}) yang masih menunggu pembayaran. Apakah ada yang bisa kami bantu?`;
    const waUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;

    window.open(waUrl, "_blank");
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-slate-100 transition-all hover:shadow-md flex flex-col h-full">
      <div className="h-40 bg-slate-100 relative overflow-hidden flex">
        <div
          className={`absolute z-20 top-3 left-3 ${current.bg} backdrop-blur px-3 py-1 rounded-full flex items-center gap-1.5 border border-white/50 shadow-sm`}
        >
          <span className={current.color}>{current.icon}</span>
          <span
            className={`text-[9px] font-bold uppercase tracking-tight ${current.color}`}
          >
            {current.label}
          </span>
        </div>

        {isBundling ? (
          <>
            <div className="w-1/2 h-full border-r border-white">
              <img
                src={images[0] || "/placeholder.jpg"}
                className="w-full h-full object-cover"
                alt="product-1"
              />
            </div>
            <div className="w-1/2 h-full">
              <img
                src={images[1] || "/placeholder.jpg"}
                className="w-full h-full object-cover"
                alt="product-2"
              />
            </div>
          </>
        ) : (
          <img
            src={images[0] || "/placeholder.jpg"}
            className="w-full h-full object-cover"
            alt={name}
          />
        )}
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-xs text-slate-800 leading-tight w-2/3 line-clamp-2 uppercase">
            {name}
          </h3>
          <div className="text-right">
            <p className="text-[9px] font-black text-emerald-600 leading-none">
              IDR
            </p>
            <p className="font-black text-sm text-emerald-700">
              {formatIDR(price)}
            </p>
          </div>
        </div>

        <div className="mb-4 flex-grow">
          {items.map((item, idx) => (
            <p
              key={idx}
              className="text-[8px] text-slate-500 font-medium truncate"
            >
              • {item.product.name}
            </p>
          ))}
        </div>

        <div className="flex justify-between items-center text-[9px] text-slate-400 font-bold mb-5 uppercase tracking-tighter border-t pt-3">
          <p className="truncate w-1/2 text-emerald-900">{customer}</p>
          <p>{date}</p>
        </div>

        {/* Tombol Khusus PENDING */}
        {status.toLowerCase() === "pending" && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleWhatsAppFollowUp();
            }}
            className="w-full cursor-pointer py-2.5 bg-[#062C2C] hover:bg-emerald-900 text-[#B6AB91] rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95"
          >
            <MessageCircle size={14} className="text-[#2bca75]" />
            <span className="text-[10px] font-black uppercase tracking-widest">
              Follow Up
            </span>
          </button>
        )}

        {status === "PROSES" && (
          <button className="w-full cursor-pointer py-2.5 border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
            Kirim Barang
          </button>
        )}
      </div>
    </div>
  );
}
