"use client";
import { useState, useEffect } from "react";
import OrderStats from "../../../components/admin/dashboard/pesanan/OrderStats";
import OrderCard from "../../../components/admin/dashboard/pesanan/OrderCard";
import { Loader2 } from "lucide-react";

export default function PesananPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAllOrders() {
      try {
        const res = await fetch("/api/admin/orders");
        const data = await res.json();
        setOrders(data);
      } catch (err) {
        console.error("Gagal memuat data pesanan admin");
      } finally {
        setLoading(false);
      }
    }
    fetchAllOrders();
  }, []);

  return (
    <section>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-emerald-900">Pesanan</h1>
        <p className="text-gray-400 text-sm">Kelola pesanan masuk dari seluruh pengguna.</p>
      </div>

      <OrderStats orders={orders} />

      {loading ? (
        <div className="flex justify-center p-20">
          <Loader2 className="animate-spin text-emerald-900" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mt-8">
         {orders.map((order) => {
  const items = order.orderItems || [];
  const isBundling = items.length > 1;
  
  // Ambil semua gambar produk dalam pesanan ini
  const allImages = items.map((it: any) => it.product.image);
  
  const displayName = isBundling 
    ? "Eksklusif Bundling" 
    : (items[0]?.product?.name || "Produk");

            return (
              <OrderCard 
      key={order.id} 
      id={order.id}
      name={displayName}
      phone={order.user.no_telp}
      price={order.total}
      customer={order.user.name}
      date={new Date(order.createdAt).toLocaleDateString('id-ID')}
      images={allImages} // Kirim array gambar
      items={items}     // Kirim data item untuk list detail
      status={order.status}
    />
            );
          })}
        </div>
      )}
      
      {orders.length === 0 && !loading && (
        <div className="text-center p-20 text-gray-400">Belum ada pesanan masuk.</div>
      )}
    </section>
  );
}