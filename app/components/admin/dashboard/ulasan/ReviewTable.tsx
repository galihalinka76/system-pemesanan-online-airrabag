"use client";
import { Star, User, Calendar, Trash2, Eye, EyeOff } from "lucide-react";
import Swal from "sweetalert2";

interface Review {
  id: number;
  rating: number;
  comment: string;
  isActive: boolean;
  createdAt: string;
  user: { name: string; email: string };
}

export default function ReviewTable({ reviews, refresh }: { reviews: Review[], refresh: () => void }) {
  
  const toggleStatus = async (id: number, currentStatus: boolean) => {
    const res = await fetch("/api/admin/reviews", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isActive: !currentStatus })
    });
    if (res.ok) refresh();
  };

  const deleteReview = async (id: number) => {
    const result = await Swal.fire({
      title: "Hapus ulasan?",
      text: "Data ini akan hilang permanen!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Ya, Hapus!"
    });

    if (result.isConfirmed) {
      const res = await fetch(`/api/admin/reviews?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        Swal.fire("Deleted!", "Ulasan berhasil dihapus.", "success");
        refresh();
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="p-5 text-xs font-bold text-emerald-900 uppercase tracking-widest">Pelanggan</th>
              <th className="p-5 text-xs font-bold text-emerald-900 uppercase tracking-widest text-center">Rating</th>
              <th className="p-5 text-xs font-bold text-emerald-900 uppercase tracking-widest">Komentar</th>
              <th className="p-5 text-xs font-bold text-emerald-900 uppercase tracking-widest text-center">Status</th>
              <th className="p-5 text-xs font-bold text-emerald-900 uppercase tracking-widest text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {reviews.map((rev) => (
              <tr key={rev.id} className={`hover:bg-emerald-50/30 transition-colors group ${!rev.isActive ? 'bg-gray-50/50' : ''}`}>
                <td className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
                      <User size={14} />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-gray-700">{rev.user.name}</p>
                      <p className="text-[10px] text-gray-400 lowercase">{rev.user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="p-5 text-center">
                  <div className="flex justify-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={12} className={i < rev.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"} />
                    ))}
                  </div>
                </td>
                <td className="p-5">
                  <p className={`text-sm max-w-xs line-clamp-1 group-hover:line-clamp-none ${!rev.isActive ? 'text-gray-400 italic' : 'text-gray-600'}`}>
                    {rev.comment}
                  </p>
                </td>
                <td className="p-5 text-center">
                  <button 
                    onClick={() => toggleStatus(rev.id, rev.isActive)}
                    className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter transition-all ${
                      rev.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {rev.isActive ? 'Visible' : 'Hidden'}
                  </button>
                </td>
                <td className="p-5 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button 
                      onClick={() => toggleStatus(rev.id, rev.isActive)}
                      className="p-2 hover:bg-white rounded-lg text-gray-400 hover:text-emerald-600 transition-colors"
                    >
                      {rev.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                    <button 
                      onClick={() => deleteReview(rev.id)}
                      className="p-2 hover:bg-white rounded-lg text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}