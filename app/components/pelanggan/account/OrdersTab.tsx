"use client";
import { useState, useEffect } from "react";
import {
  Loader2,
  MapPin,
  AlertCircle,
  ChevronRight,
  CreditCard,
  Printer,
  Package, CheckCircle2, Clock 
} from "lucide-react";
import Link from "next/link";
import Swal from "sweetalert2";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";


// Helper untuk warna status yang lebih modern
const getStatusStyles = (status: string) => {
  switch (status) {
    case "SELESAI":
      return "bg-emerald-50 text-emerald-600 border-emerald-100";
    case "PROSES":
      return "bg-blue-50 text-blue-600 border-blue-100";
    case "PENDING":
      return "bg-amber-50 text-amber-600 border-amber-100";
    default:
      return "bg-gray-50 text-gray-600 border-gray-100";
  }
};

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
      <div className="py-20 text-center flex flex-col items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#062C2C] mb-4"></div>
        <div className="text-xs text-gray-400">Synchronizing Your Order...</div>
      </div>
    );

  if (orders.length === 0)
    return (
      <div className="text-center p-20 text-gray-400 uppercase text-xs font-bold tracking-widest">
        Belum ada pesanan ditemukan.
      </div>
    );

return (
    <div className="space-y-6">
      <AnimatePresence>
        {orders.map((order: any, index: number) => {
          const items = order.orderItems || order.items || [];
          const isBundling = items.length > 1;
          const userAddress = order.user?.address;

          return (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group relative bg-white border border-gray-100 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl hover:shadow-black/5 transition-all duration-500"
            >
              {/* Header: Glassy Effect */}
              <div className="bg-gray-50/50 backdrop-blur-sm p-5 px-8 flex justify-between items-center border-b border-gray-50">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm border border-gray-100">
                    <Package size={18} className="text-[#062C2C]" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] block leading-none mb-1">
                      Transaction ID
                    </span>
                    <p className="text-xs font-black text-[#062C2C] tracking-wider">
                    #{String(order.id).slice(-8).toUpperCase()}
                  </p>
                  </div>
                </div>

                <div className={`px-4 py-1.5 rounded-full border ${getStatusStyles(order.status)} flex items-center gap-2`}>
                  {order.status === "SELESAI" ? <CheckCircle2 size={12} /> : <Clock size={12} className="animate-spin-slow" />}
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    {order.status}
                  </span>
                </div>
              </div>

              <div className="p-8">
                <div className="flex flex-col lg:flex-row gap-8">
                  {/* Visual: Image Stack */}
                  <div className="relative flex-shrink-0 mx-auto lg:mx-0">
                    <div className="relative w-32 h-32 flex items-center justify-center">
                      {isBundling ? (
                        <div className="relative w-full h-full">
                          {items.slice(0, 3).map((item: any, idx: number) => (
                            <motion.div
                              key={idx}
                              whileHover={{ scale: 1.05, zIndex: 30 }}
                              className="absolute w-20 h-20 rounded-2xl border-4 border-white shadow-2xl overflow-hidden transition-all duration-300"
                              style={{ 
                                left: `${idx * 20}px`, 
                                top: `${idx * 10}px`,
                                zIndex: 20 - idx,
                                opacity: 1 - idx * 0.2
                              }}
                            >
                              <Image
                                src={item.product?.image || "/placeholder.jpg"}
                                alt="thumb"
                                fill
                                className="object-cover"
                              />
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <div className="w-28 h-28 rounded-[2rem] overflow-hidden border-4 border-gray-50 shadow-lg rotate-3 group-hover:rotate-0 transition-transform duration-500">
                          <Image
                            src={items[0]?.product?.image || "/placeholder.jpg"}
                            alt="product"
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Info Detail */}
                  <div className="flex-grow flex flex-col justify-center">
                    <h4 className="text-lg font-black text-[#062C2C] leading-tight mb-2 group-hover:text-emerald-900 transition-colors">
                      {isBundling ? "Eksklusif Bundling Package" : items[0]?.product?.name}
                    </h4>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {items.map((item: any, idx: number) => (
                        <span key={idx} className="text-[9px] bg-[#F6F6F6] text-gray-500 px-3 py-1 rounded-lg font-bold border border-gray-100 uppercase">
                          {item.qty}x {item.product?.name}
                        </span>
                      ))}
                    </div>

                    {/* Alamat Mini-Card */}
                    <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100/50 relative overflow-hidden">
                      <div className="flex items-start gap-3">
                        <MapPin size={14} className="text-[#B6AB91] mt-1" />
                        <div className="flex-grow">
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Shipping To</p>
                          {userAddress ? (
                            <p className="text-[11px] text-gray-600 font-medium line-clamp-1">{userAddress}</p>
                          ) : (
                            <Link href="/account?tab=profile" className="flex items-center gap-1 text-[10px] font-bold text-amber-600 hover:underline">
                              Lengkapi alamat pengiriman <ChevronRight size={10} />
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Total & Action */}
                  <div className="lg:w-64 flex flex-col justify-between items-center lg:items-end border-t lg:border-t-0 lg:border-l border-gray-100 pt-6 lg:pt-0 lg:pl-8">
                    <div className="text-center lg:text-right mb-4 lg:mb-0">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-1">Grand Total</p>
                      <p className="text-2xl font-black text-[#062C2C] tracking-tighter">
                        {formatIDR(order.total)}
                      </p>
                      {order.payment && (
                        <div className="inline-flex items-center gap-1.5 mt-2 px-2 py-0.5 bg-emerald-50 rounded-md">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-[9px] font-black text-emerald-600 uppercase">Paid via {order.payment.paymentType}</span>
                        </div>
                      )}
                    </div>

                    <div className="w-full space-y-3">
                      {order.status === "PENDING" && userAddress && (
                        <button
                          onClick={() => handlePayment(order)}
                          className="w-full bg-[#062C2C] text-[#B6AB91] py-4 rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-emerald-950/20 active:scale-95 transition-all group/btn"
                        >
                          <CreditCard size={18} className="group-hover/btn:-translate-y-1 transition-transform" />
                          <span className="text-[11px] font-black uppercase tracking-widest">Pay Securely</span>
                        </button>
                      )}

                      {(order.status === "PROSES" || order.status === "SELESAI") && (
                        <button
                          onClick={() => handlePrintInvoice(order)}
                          className="w-full border-2 border-gray-100 hover:border-[#062C2C] text-[#062C2C] py-3 rounded-2xl flex items-center justify-center gap-2 transition-all font-black text-[10px] uppercase tracking-[0.2em]"
                        >
                          <Printer size={16} />
                          Print Invoice
                        </button>
                      )}

                      {order.status === "PENDING" && !userAddress && (
                         <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 flex items-center gap-2 animate-pulse">
                            <AlertCircle size={14} className="text-amber-600 flex-shrink-0" />
                            <p className="text-[9px] text-amber-700 font-bold uppercase tracking-tight">Address Required for Payment</p>
                         </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
