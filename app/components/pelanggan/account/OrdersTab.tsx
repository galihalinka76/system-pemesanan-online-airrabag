"use client";
import { useState, useEffect } from "react";
import {
  Loader2,
  MapPin,
  AlertCircle,
  ChevronRight,
  CreditCard,
} from "lucide-react";
import Link from "next/link";
import Swal from "sweetalert2";

export default function OrdersTab() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch("/api/orders/me");
        const data = await res.json();
        const ordersData = data.orders || data;
        setOrders(Array.isArray(ordersData) ? ordersData : []);
      } catch (err) {
        console.error("Gagal memuat pesanan:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

const handlePayment = async (order: any) => {
  try {
    // Tampilkan loading state saat mengambil token
    Swal.fire({
      title: 'Menyiapkan Pembayaran...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    const res = await fetch("/api/orders/pay", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId: order.id,
        total: order.total,
        customerName: order.user?.name,
        customerEmail: order.user?.email,
      }),
    });

    const data = await res.json();
    Swal.close(); // Tutup loading

    if (data.token) {
      (window as any).snap.pay(data.token, {
        onSuccess: function (result: any) {
          Swal.fire({
            title: "Pembayaran Berhasil!",
            text: "Pesananmu sedang kami proses.",
            icon: "success",
            confirmButtonColor: "#062C2C",
          }).then(() => {
            window.location.reload();
          });
        },
        onPending: function (result: any) {
          Swal.fire({
            title: "Menunggu Pembayaran",
            text: "Silahkan selesaikan pembayaran sesuai instruksi.",
            icon: "info",
            confirmButtonColor: "#062C2C",
          });
        },
        onError: function (result: any) {
          Swal.fire({
            title: "Pembayaran Gagal",
            text: "Terjadi kesalahan saat memproses transaksi.",
            icon: "error",
            confirmButtonColor: "#062C2C",
          });
        },
        onClose: function () {
          Swal.fire({
            title: "Transaksi Dibatalkan",
            text: "Kamu menutup jendela pembayaran.",
            icon: "warning",
            confirmButtonColor: "#062C2C",
          });
        },
      });
    }
  } catch (err) {
    Swal.fire({
      title: "Error!",
      text: "Gagal menghubungkan ke server pembayaran.",
      icon: "error",
      confirmButtonColor: "#062C2C",
    });
    console.error("Gagal memproses pembayaran:", err);
  }
};


// Tambahkan di dalam komponen OrdersTab
const handlePrintInvoice = (order: any) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const itemsHtml = order.orderItems.map((item: any) => `
    <tr>
      <td style="padding: 8px 0;">${item.product.name} (x${item.quantity})</td>
      <td style="text-align: right;">${formatIDR(item.priceAtPurchase * item.quantity)}</td>
    </tr>
  `).join('');

  printWindow.document.write(`
    <html>
      <head>
        <title>Invoice #${order.id}</title>
        <style>
          body { font-family: 'Courier New', Courier, monospace; color: #333; padding: 20px; }
          .header { text-align: center; border-bottom: 2px dashed #eee; padding-bottom: 10px; }
          .details { margin: 20px 0; font-size: 12px; }
          table { width: 100%; border-collapse: collapse; }
          .total { border-top: 2px dashed #eee; margin-top: 10px; padding-top: 10px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>AIRRABAG STORE</h2>
          <p>Order ID: #${order.id}</p>
        </div>
        <div class="details">
          <p>Tanggal: ${new Date(order.createdAt).toLocaleDateString('id-ID')}</p>
          <p>Pelanggan: ${order.user.name}</p>
          <p>Alamat: ${order.user.address}</p>
        </div>
        <table>
          ${itemsHtml}
        </table>
        <div class="total">
          <div style="display: flex; justify-content: space-between;">
            <span>TOTAL BAYAR</span>
            <span>${formatIDR(order.total)}</span>
          </div>
        </div>
        <p style="text-align: center; margin-top: 30px; font-size: 10px;">Terima kasih telah berbelanja!</p>
      </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.print();
};

  const formatIDR = (price: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);

  if (loading)
    return (
      <div className="flex justify-center p-20">
        <Loader2 className="animate-spin text-[#062C2C]" />
      </div>
    );

  if (orders.length === 0)
    return (
      <div className="text-center p-20 text-gray-400 uppercase text-xs font-bold tracking-widest">
        Belum ada pesanan ditemukan.
      </div>
    );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
      {orders.map((order) => {
        const items = order.orderItems || order.items || [];
        const isBundling = items.length > 1;
        const userAddress = order.user?.address; // Ambil alamat

        return (
          <div
            key={order.id}
            className="border border-gray-100 rounded-3xl overflow-hidden bg-white shadow-sm"
          >
            {/* Header Order Tetap Sama */}
            <div className="bg-[#F6F6F6] p-4 px-6 flex justify-between items-center">
              <div>
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                  Order ID
                </span>
                <p className="text-[10px] font-black text-[#062C2C]">
                  #{order.id}
                </p>
              </div>
              <div className="text-right">
                <span
                  className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${
                    order.status === "SELESAI"
                      ? "bg-green-100 text-green-700"
                      : "bg-orange-100 text-orange-700"
                  }`}
                >
                  {order.status}
                </span>
              </div>
            </div>

            {/* Konten Card (Satu Card untuk Banyak Item) */}
            <div className="p-6">
              <div className="flex flex-col md:flex-row gap-6 items-center">
                {/* Visual Grouping */}
                <div className="relative flex items-center justify-center w-24 h-24">
                  {isBundling ? (
                    // Tampilan Tumpuk untuk Bundling
                    <div className="relative w-full h-full">
                      {items.slice(0, 2).map((item: any, idx: number) => (
                        <div
                          key={idx}
                          className={`absolute w-16 h-16 rounded-xl border-2 border-white shadow-md overflow-hidden transition-transform
                          ${idx === 0 ? "z-10 translate-x-0" : "z-0 translate-x-4 translate-y-4"}`}
                        >
                          <img
                            src={item.product?.image || "/placeholder.jpg"}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    // Tampilan Single
                    <div className="w-20 h-20 rounded-xl overflow-hidden border border-gray-100">
                      <img
                        src={items[0]?.product?.image || "/placeholder.jpg"}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>

                {/* Detail Informasi */}
                <div className="flex-grow text-center md:text-left">
                  <h4 className="text-sm font-black uppercase text-[#062C2C] tracking-tight">
                    {isBundling
                      ? "Eksklusif Bundling Package"
                      : items[0]?.product?.name}
                  </h4>
                  <div className="mt-1 flex flex-wrap justify-center md:justify-start gap-2">
                    {items.map((item: any, idx: number) => (
                      <span
                        key={idx}
                        className="text-[9px] bg-gray-100 px-2 py-0.5 rounded text-gray-500 font-bold uppercase"
                      >
                        {item.product?.name}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-6 flex flex-col md:flex-row justify-between items-center gap-4 border-t pt-4">
                  <div className="flex flex-col">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      Total Bayar
                    </p>
                    <p className="text-xl font-black text-[#062C2C]">
                      {formatIDR(order.total)}
                    </p>
                  </div>

                  {order.status === "PENDING" && (
                    <div className="w-full md:w-auto">
                      {userAddress ? (
                        <button
                          onClick={() => handlePayment(order)}
                          className="w-full md:w-64 bg-[#062C2C] hover:bg-emerald-900 text-[#B6AB91] py-3 px-6 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl group"
                        >
                          <CreditCard
                            size={18}
                            className="group-hover:rotate-12 transition-transform"
                          />
                          <span className="text-xs font-black uppercase tracking-widest">
                            Bayar Sekarang
                          </span>
                        </button>
                      ) : (
                        <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl flex items-center gap-2">
                          <AlertCircle size={14} className="text-amber-600" />
                          <p className="text-[10px] text-amber-700 font-bold uppercase">
                            Isi alamat untuk membayar
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Tampilkan tombol Cetak Struk jika sudah bayar */}
{(order.status === "PROSES" || order.status === "SELESAI") && (
  <button
    onClick={() => handlePrintInvoice(order)}
    className="w-full md:w-auto border-2 border-[#062C2C] text-[#062C2C] hover:bg-gray-50 py-2.5 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 font-black text-[10px] uppercase tracking-widest"
  >
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9V2h12v7"></path><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
    Cetak Struk
  </button>
)}

{/* Tampilkan Label "Sudah Dibayar" jika ada data payment */}
{order.payment && (
  <div className="mt-2 flex items-center gap-2">
    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
    <span className="text-[9px] font-black text-emerald-600 uppercase tracking-tighter">
      Lunas via {order.payment.paymentType}
    </span>
  </div>
)}
                </div>
              </div>

              {/* --- SECTION ALAMAT (BARU) --- */}
              <div className="mt-6 pt-6 border-t border-dashed border-gray-100">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gray-50 rounded-lg">
                    <MapPin size={14} className="text-[#062C2C]" />
                  </div>
                  <div className="flex-grow">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">
                      Alamat Pengiriman
                    </p>

                    {userAddress ? (
                      <p className="text-xs text-gray-600 font-medium leading-relaxed">
                        {userAddress}
                      </p>
                    ) : (
                      <div className="flex flex-col md:flex-row md:items-center gap-3">
                        <div className="flex items-center gap-1.5 text-amber-600">
                          <AlertCircle size={12} />
                          <p className="text-[10px] font-bold italic">
                            Alamat belum diatur
                          </p>
                        </div>
                        <Link
                          href="/account?tab=profile"
                          className="flex items-center gap-1 text-[10px] font-black text-[#062C2C] uppercase hover:underline"
                        >
                          Lengkapi Sekarang <ChevronRight size={10} />
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
