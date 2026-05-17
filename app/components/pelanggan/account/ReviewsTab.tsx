"use client";
import { useState, useEffect } from "react";
import { Star, MessageSquare, Send, CheckCircle2, UserCircle2, Quote, Trash2, Edit3, X } from "lucide-react";
import Swal from "sweetalert2";

type Review = {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user?: { name: string } | null;
};

export default function ReviewsTab() {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [myReviews, setMyReviews] = useState<Review[]>([]);
  
  // State untuk melacak ulasan yang sedang diedit
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchReviews = async () => {
    try {
      const res = await fetch("/api/user/reviews");
      if (res.ok) {
        const data = await res.json();
        setMyReviews(data);
      }
    } catch (error) {
      console.error("Gagal mengambil ulasan:", error);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  // Fungsi untuk memicu mode edit
  const handleEditClick = (rev: Review) => {
    setEditingId(rev.id);
    setRating(rev.rating);
    setComment(rev.comment);
    
    // Scroll otomatis ke form agar user tahu data sudah masuk ke input
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Fungsi untuk membatalkan edit
  const cancelEdit = () => {
    setEditingId(null);
    setRating(0);
    setComment("");
  };

  const handleSubmit = async () => {
    if (rating === 0 || !comment.trim()) {
      return Swal.fire({
        icon: "warning",
        title: "Data Tidak Lengkap",
        text: "Silakan berikan rating dan komentar.",
        confirmButtonColor: "#062C2C",
      });
    }

    setLoading(true);
    try {
      // Jika editingId ada, gunakan method PUT, jika tidak gunakan POST
      const method = editingId ? "PUT" : "POST";
      const url = editingId ? `/api/user/reviews?id=${editingId}` : "/api/user/reviews";

      const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment }),
      });

      if (res.ok) {
        Swal.fire({
          icon: "success",
          title: editingId ? "Ulasan Diperbarui!" : "Berhasil Terkirim!",
          showConfirmButton: false,
          timer: 1500,
        });
        
        // Reset form dan refresh data
        cancelEdit();
        fetchReviews();
      } else {
        const data = await res.json();
        throw new Error(data.message || "Gagal memproses ulasan");
      }
    } catch (error: any) {
      Swal.fire({ icon: "error", title: "Oops...", text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: "Hapus Ulasan?",
      text: "Tindakan ini tidak dapat dibatalkan.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#062C2C",
      confirmButtonText: "Ya, Hapus!",
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`/api/user/reviews?id=${id}`, { method: "DELETE" });
        if (res.ok) {
          Swal.fire("Dihapus!", "Ulasan telah dihapus.", "success");
          if (editingId === id) cancelEdit(); // Jika sedang diedit lalu dihapus, reset form
          fetchReviews();
        }
      } catch (error: any) {
        Swal.fire("Error", error.message, "error");
      }
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
      
      {/* KIRI: Form Input (Dinamis Tambah/Edit) */}
      <div className="lg:col-span-5 space-y-8">
        <div className={`bg-white p-8 rounded-[2.5rem] border shadow-sm transition-all duration-500 ${editingId ? 'border-[#B6AB91] ring-2 ring-[#B6AB91]/10' : 'border-gray-100'}`}>
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 ${editingId ? 'bg-[#B6AB91]' : 'bg-[#062C2C]'} rounded-full flex items-center justify-center transition-colors`}>
                {editingId ? <Edit3 size={18} className="text-white" /> : <Quote size={18} className="text-[#B6AB91]" />}
              </div>
              <div>
                <h3 className="font-black text-[#062C2C] uppercase tracking-widest text-sm leading-tight">
                  {editingId ? "Update Review" : "Store Review"}
                </h3>
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">
                  {editingId ? "Modify your previous feedback" : "Share your service experience"}
                </p>
              </div>
            </div>
            {editingId && (
              <button onClick={cancelEdit} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
                <X size={16} />
              </button>
            )}
          </div>

          <div className="space-y-6">
            {/* Star Rating Input */}
            <div className="flex flex-col items-center py-8 bg-gray-50 rounded-[2rem] border border-dashed border-gray-200">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Rate Our Service</p>
              <div className="flex gap-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onMouseEnter={() => setHover(star)}
                    onMouseLeave={() => setHover(0)}
                    onClick={() => setRating(star)}
                    className="transition-all active:scale-90"
                  >
                    <Star
                      size={32}
                      className={`${star <= (hover || rating) ? "fill-[#B6AB91] text-[#B6AB91]" : "text-gray-200"}`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Comment Input */}
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2 mb-2 block">Your Feedback</label>
              <textarea 
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full bg-gray-50 border-none rounded-[2rem] p-6 text-sm focus:ring-2 focus:ring-[#B6AB91] min-h-[150px]"
                placeholder="How was our service?..."
              ></textarea>
            </div>

            <button 
              onClick={handleSubmit}
              disabled={loading}
              className={`w-full ${editingId ? 'bg-[#B6AB91] text-white' : 'bg-[#062C2C] text-[#B6AB91]'} py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] shadow-xl transition-all flex items-center justify-center gap-3 ${loading ? 'opacity-50' : 'hover:-translate-y-1'}`}
            >
              {loading ? "Processing..." : editingId ? "Update Feedback" : "Submit Feedback"} 
              <Send size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* KANAN: Daftar History */}
      <div className="lg:col-span-7 space-y-6">
        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mb-4 ml-2 uppercase">Feedback History</h3>
        
        {myReviews.map((rev) => (
          <div key={rev.id} className={`relative group bg-white p-8 rounded-[2.5rem] border transition-all ${editingId === rev.id ? 'border-[#B6AB91] ring-2 ring-[#B6AB91]/5 shadow-lg' : 'border-gray-100 shadow-sm hover:shadow-md'}`}>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100 flex-shrink-0">
                <UserCircle2 size={32} className="text-[#062C2C]" />
              </div>

              <div className="flex-grow">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="text-sm font-black text-[#062C2C] uppercase tracking-widest">{rev.user?.name}</h4>
                    <span className="text-[9px] font-bold text-gray-300 uppercase">
                      {new Date(rev.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  
                  {/* AKSI: EDIT & HAPUS */}
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleEditClick(rev)}
                      className="p-2 text-gray-300 hover:text-[#B6AB91] transition-colors"
                      title="Edit Ulasan"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(rev.id)}
                      className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                      title="Hapus Ulasan"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={12} className={`${i < rev.rating ? "fill-[#B6AB91] text-[#B6AB91]" : "text-gray-100"}`} />
                  ))}
                </div>

                <div className="relative">
                  <p className="text-sm text-gray-600 leading-relaxed italic relative z-10">
                    "{rev.comment}"
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}

        {myReviews.length === 0 && !loading && (
          <div className="text-center py-24 bg-gray-50/50 rounded-[3rem] border border-dashed border-gray-200">
            <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">No feedbacks yet</p>
          </div>
        )}
      </div>
    </div>
  );
}