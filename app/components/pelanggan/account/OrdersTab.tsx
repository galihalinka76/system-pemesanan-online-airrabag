"use client";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function OrdersTab() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      try {
        console.log("--- Memulai Fetch Orders ---");
        const res = await fetch("/api/orders/me");
        const data = await res.json();
        
        // DEBUG LOG: Cek response mentah dari API
        console.log("Response API mentah:", data);

        const ordersData = data.orders || data; 
        
        // DEBUG LOG: Cek hasil setelah diekstrak
        console.log("Data orders yang diproses:", ordersData);

        setOrders(Array.isArray(ordersData) ? ordersData : []);
      } catch (err) {
        console.error("Gagal memuat pesanan:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  const getSteps = (currentStatus: string) => {
    const status = currentStatus?.toUpperCase() || "";
    const allSteps = ["PENDING", "PROSES", "SELESAI"]; 
    const currentIndex = allSteps.indexOf(status);
    
    return allSteps.map((label, index) => ({
      label,
      status: index < currentIndex ? "completed" : index === currentIndex ? "active" : "pending"
    }));
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-[#062C2C]" /></div>;
  
  if (orders.length === 0) return (
    <div className="text-center p-20 text-gray-400 uppercase text-xs font-bold tracking-widest">
      Belum ada pesanan ditemukan.
    </div>
  );

  const latestOrder = orders[0];
  
  // DEBUG LOG: Cek struktur pesanan terbaru
  console.log("Latest Order Object:", latestOrder);

  const displayItems = latestOrder.orderItems || latestOrder.items || [];
  
  // DEBUG LOG: Cek items yang akan dirender
  console.log("Items to display:", displayItems);

  const steps = getSteps(latestOrder.status);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end mb-12 border-b border-gray-50 pb-4">
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Journey Tracking</span>
        <span className="text-[9px] font-black text-[#062C2C]">ORDER #{latestOrder.id}</span>
      </div>

      <div className="bg-[#F6F6F6] rounded-xl p-10 relative overflow-hidden mb-12">
        <div className="flex justify-between items-center mb-16">
          <div>
            <p className="text-[10px] font-black text-gray-400 tracking-widest uppercase">Order Status</p>
            <h3 className="text-xl font-black text-[#062C2C] uppercase">{latestOrder.status}</h3>
          </div>
        </div>

        <div className="relative flex justify-between items-center px-4">
          <div className="absolute top-1/2 left-0 w-full h-[1px] bg-gray-200 -translate-y-1/2 z-0" />
          {steps.map((step, index) => (
            <div key={index} className="relative z-10 flex flex-col items-center gap-4">
              <div className={`w-3 h-3 rounded-full border-2 ${
                step.status === 'completed' ? 'bg-[#062C2C] border-[#062C2C]' :
                step.status === 'active' ? 'bg-white border-[#062C2C] scale-125' :
                'bg-white border-gray-200'
              }`} />
              <span className={`text-[8px] font-black tracking-widest ${
                step.status === 'pending' ? 'text-gray-300' : 'text-[#062C2C]'
              }`}>
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-2">Package Contents</p>
        {displayItems.map((item: any, idx: number) => (
          <div key={idx} className="flex items-center gap-6 p-4 border border-gray-100 rounded-2xl">
            <div className="w-16 h-16 bg-gray-100 rounded-xl overflow-hidden relative border border-gray-50">
              <img 
                src={item.product?.image || "/placeholder.jpg"} 
                alt="product" 
                className="w-full h-full object-cover" 
              />
            </div>
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-wider">
                {item.product?.name || "Product Name"}
              </h4>
              <p className="text-[10px] text-gray-400 mt-1">
                QTY: {item.quantity} — {item.variant || "Standard"}
              </p>
              <p className="text-[10px] font-black mt-1">
                {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(item.priceAtPurchase || item.price || 0)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}