"use client";
import { useState, useEffect } from "react";
import { Loader2, MessageSquare, Star } from "lucide-react";
import ReviewTable from "../../../components/admin/dashboard/ulasan/ReviewTable";

export default function UlasanAdminPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

const fetchAllReviews = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/reviews");
      if (!res.ok) throw new Error("Gagal mengambil data");
      const data = await res.json();
      setReviews(data);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // 2. Panggil saat komponen pertama kali dimuat
  useEffect(() => {
    fetchAllReviews();
  }, []);

  const avgRating = reviews.length > 0 
    ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1)
    : "0.0";

  return (
    <section>
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-emerald-900">Ulasan Pelanggan</h1>
          <p className="text-gray-400 text-sm">Monitor feedback pelanggan dalam satu tampilan tabel.</p>
        </div>
        
        {/* Ringkasan Statistik */}
        <div className="flex items-center gap-4">
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
            <div className="p-3 bg-yellow-50 rounded-xl text-yellow-500">
              <Star size={20} fill="currentColor" />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Avg Rating</p>
              <p className="text-xl font-bold text-emerald-900">{avgRating} / 5.0</p>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
            <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
              <MessageSquare size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Reviews</p>
              <p className="text-xl font-bold text-emerald-900">{reviews.length}</p>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
          <Loader2 className="animate-spin text-emerald-900 mb-2" />
          <p className="text-sm text-gray-400 font-medium">Memuat data ulasan...</p>
        </div>
      ) : (
        <>
          {reviews.length > 0 ? (
            <ReviewTable reviews={reviews} refresh={fetchAllReviews} />
          ) : (
            <div className="text-center py-32 bg-white rounded-3xl border border-dashed border-gray-200">
              <MessageSquare size={40} className="mx-auto text-gray-200 mb-4" />
              <p className="text-gray-400 font-medium">Belum ada ulasan masuk.</p>
            </div>
          )}
        </>
      )}
    </section>
  );
}