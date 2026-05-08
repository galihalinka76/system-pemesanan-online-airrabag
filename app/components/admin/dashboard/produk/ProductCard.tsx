import { Edit2, Trash2, Plus } from "lucide-react";

interface ProductProps {
  id: number;
  name: string;
  category: string;
  price: string;
  stock: number;
  image: string;
  description?: string;
  onDelete: (id: number) => void;
  onEdit: (product: any) => void;
  onAddToPromo: (product: any) => void; 
}

export default function ProductCard({ id, name, category, price, stock, image, description, onAddToPromo, onEdit, onDelete }: ProductProps) {
  return (
    <div className="bg-[#063130] rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow relative group text-white">
      <div className="flex justify-between items-center mb-3">
        <button 

  onClick={() => onEdit({ 
    id, 
    name, 
    category, 
    price, 
    stock, 
    image, 
    description: description 
  })}
          className="flex items-center text-[10px] font-medium text-gray-200 hover:text-white transition-colors"
        >
          <Edit2 size={12} className="mr-1" /> Edit
        </button>
        <button 
          onClick={() => onDelete(id)}
          className="text-gray-200 hover:text-red-400 transition-colors"
        >
          <Trash2 size={14} />
        </button>
      </div>

      <div className="aspect-square w-full rounded-lg overflow-hidden bg-gray-800 mb-4">
        <img src={image} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
      </div>

      <div className="space-y-2">
        <div className="min-h-[32px]">
          <h3 className="font-semibold text-[11px] leading-tight line-clamp-2">{name}</h3>
          <p className="text-[9px] text-gray-400 mt-0.5">{category}</p>
        </div>
        
        <div className="flex justify-between items-center">
          <p className="font-bold text-sm">{price}</p>
          <div className="text-[10px] border border-white/40 px-1.5 py-0.5 rounded bg-transparent">{stock}</div>
        </div>

        {/* Klik Button ini untuk memicu modal */}
        <button 
          onClick={() => onAddToPromo({ id, name, category, price, image, description })}
          className="w-full mt-2 bg-[#DDCC9D] hover:bg-[#B6AB91] text-[#0f3433] text-[10px] font-bold py-1.5 rounded-full transition-colors flex items-center justify-center"
        >
          Tambah Ke Promo <Plus size={10} className="ml-1" />
        </button>
      </div>
    </div>
  );
}