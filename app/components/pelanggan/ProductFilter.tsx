"use client";

interface FilterProps {
  selectedPrice: string;
  setSelectedPrice: (val: string) => void;
  selectedModel: string;
  setSelectedModel: (val: string) => void;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
}

export default function ProductFilter({
  selectedPrice,
  setSelectedPrice,
  selectedModel,
  setSelectedModel,
  searchQuery,
  setSearchQuery,
}: FilterProps) {
  const priceRanges = [
    { label: "All Prices", value: "all" },
    { label: "Under 1jt", value: "0-1000000" },
    { label: "2jt - 3jt", value: "2000000-3000000" },
    { label: "3jt - 4jt", value: "3000000-4000000" },
    { label: "5jt - 10jt", value: "5000000-10000000" },
  ];

  const models = ["All Models", "Tas Pria", "Tas Wanita", "Backpack", "Pouch", "Wallet", "Accessories"];

  return (
    <div className="w-full md:w-64 flex-shrink-0 space-y-10 pr-8 border-r border-gray-100 hidden md:block">
      {/* Search by Name */}
      <div>
        <h4 className="text-[14px] font-black uppercase tracking-[0.3em] mb-4 text-black">Search</h4>
        <input
          type="text"
          placeholder="Product Name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="text-[14px] w-full bg-transparent border-b border-gray-300 py-2 text-xs focus:outline-none focus:border-black transition-colors"
        />
      </div>

      {/* Filter by Model */}
      <div>
        <h4 className="text-[14px] font-black uppercase tracking-[0.3em] mb-4 text-black">Category</h4>
        <ul className="space-y-2">
          {models.map((m) => (
            <li 
              key={m}
              onClick={() => setSelectedModel(m)}
              className={`text-[12px] uppercase tracking-widest cursor-pointer transition-all ${
                selectedModel === m ? "text-black font-bold translate-x-2" : "text-gray-400 hover:text-black"
              }`}
            >
              {m}
            </li>
          ))}
        </ul>
      </div>

      {/* Filter by Price */}
      <div>
        <h4 className="text-[14px] font-black uppercase tracking-[0.3em] mb-4 text-black">Price Range</h4>
        <div className="space-y-2">
          {priceRanges.map((range) => (
            <label key={range.value} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="radio"
                name="price"
                checked={selectedPrice === range.value}
                onChange={() => setSelectedPrice(range.value)}
                className="accent-black"
              />
              <span className={`text-[12px] uppercase tracking-tighter transition-colors ${
                selectedPrice === range.value ? "text-black font-bold" : "text-gray-400 group-hover:text-black"
              }`}>
                {range.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Reset Button */}
      <button 
        onClick={() => { setSelectedPrice("all"); setSelectedModel("All Models"); setSearchQuery(""); }}
        className="text-[12px] font-bold text-red-800 uppercase tracking-[0.2em] pt-4 hover:underline"
      >
        Reset Filters
      </button>
    </div>
  );
}