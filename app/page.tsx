"use client";
import { useState, useEffect } from "react";
import { ShoppingCart, Heart } from "lucide-react";
import Navbar from "./components/pelanggan/Navbar";
import ProductCard from "./components/pelanggan/ProductCard";
import PromoSection from "./components/pelanggan/PromoSection";
import NewArrivals from "./components/pelanggan/NewArrivals";
import ProductFilter from "./components/pelanggan/ProductFilter";
import Image from "next/image";
import CheckoutModal from "./components/pelanggan/checkout/CheckoutModal";

export default function HomePage() {
  const [showProducts, setShowProducts] = useState(false);
  const [products, setProducts] = useState([]);
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedPrice, setSelectedPrice] = useState("all");
  const [selectedModel, setSelectedModel] = useState("All Models");
  const [searchQuery, setSearchQuery] = useState("");
  // 1. Tambahkan state baru di HomePage
const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
const [checkoutData, setCheckoutData] = useState<{items: any[], total: number}>({ items: [], total: 0 });



  useEffect(() => {
    async function fetchData() {
      try {
        const [resProd, resPromo] = await Promise.all([
          fetch("/api/admin/produk"),
          fetch("/api/admin/promo"),
        ]);
        setProducts(await resProd.json());
        setPromos(await resPromo.json());
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredProducts = products.filter((p: any) => {
    const matchName = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchModel =
      selectedModel === "All Models" ||
      p.category?.toLowerCase() === selectedModel.toLowerCase() ||
      p.description?.toLowerCase().includes(selectedModel.toLowerCase());

    let matchPrice = true;
    if (selectedPrice !== "all") {
      const [min, max] = selectedPrice.split("-").map(Number);
      matchPrice = p.price >= min && p.price <= max;
    }
    return matchName && matchModel && matchPrice;
  });

  // --- TAMBAHKAN INI: Filter untuk Mini Promo Grid ---
const filteredPromos = promos.filter((p: any) => {
  const query = searchQuery.toLowerCase();
  
  // Cocokkan dengan Nama Promo
  const matchPromoName = p.name?.toLowerCase().includes(query);
  
  // Cocokkan dengan Nama Produk di dalam promo (Main & Second/Sub)
  const matchMainProduct = p.mainProduct?.name?.toLowerCase().includes(query);
  const matchSecondProduct = (p.secondProduct?.name || p.subProduct?.name)?.toLowerCase().includes(query);

  // Filter berdasarkan Model/Kategori (Opsional: Jika promo ingin ikut filter model)
  const matchModel = selectedModel === "All Models" || 
                     p.mainProduct?.category?.toLowerCase() === selectedModel.toLowerCase();

  // Filter berdasarkan Harga Promo
  let matchPrice = true;
  if (selectedPrice !== "all") {
    const [min, max] = selectedPrice.split("-").map(Number);
    matchPrice = p.promoPrice >= min && p.promoPrice <= max;
  }

  return (matchPromoName || matchMainProduct || matchSecondProduct) && matchModel && matchPrice;
});

  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

  const newArrivalsData = filteredProducts.filter(
    (p: any) => new Date(p.createdAt) >= threeDaysAgo,
  );
  const archiveProductsData = filteredProducts.filter(
    (p: any) => new Date(p.createdAt) < threeDaysAgo,
  );

  const formatIDR = (price: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price || 0);


    // 2. Buat fungsi helper untuk buka modal
const handleOpenCheckout = (items: any[], total: number) => {
  setCheckoutData({ items, total });
  setIsCheckoutOpen(true);
};

  return (
    <main className="min-h-screen bg-olive-200 text-black transition-all duration-500 overflow-x-hidden">
      <Navbar />

      <div className="pt-16">
        {!showProducts ? (
          <section className="relative w-full h-[calc(100vh-4rem)] flex flex-col overflow-hidden">
            <div className="flex-grow relative z-0">
              <Image src="/home/wel.png" alt="Airbag" fill className="object-cover animate-fadeIn" priority />
              <div className="absolute inset-0 bg-black/50 z-10"></div>
              
              <div className="absolute inset-0 z-20 flex items-center justify-center animate-fadeIn">
                <div className="flex flex-col items-center translate-y-64">
                  <div className="animate-bounce mb-2">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#B6AB91" strokeWidth="3">
                      <path d="M7 13l5 5 5-5M7 6l5 5 5-5" />
                    </svg>
                  </div>
                  <button
                    onClick={() => setShowProducts(true)}
                    className="text-[#B6AB91] hover:text-white px-10 py-2 font-black tracking-[0.4em] transition-all text-xs border-b border-[#B6AB91]/30 hover:border-[#B6AB91]" 
                  >
                    TAB HIRE 
                  </button>
                </div>
              </div>
            </div>
            <div className="relative z-30 bg-[#B6AB91] w-full h-16"></div>
          </section>
        ) : (
          <section className="animate-slideUp">
            <PromoSection promos={promos} />

            <div className="px-6 md:px-12">
              <div className="flex justify-between items-end mb-6 border-b border-gray-100 pb-8">
                <div>
                  <span className="text-[10px] text-gray-400 uppercase tracking-[0.3em]">
                    Curated Selection
                  </span>
                  <h2 className="text-4xl font-bold tracking-tighter text-black mt-1 uppercase">
                    Signature Pieces
                  </h2>
                </div>
              </div>

              <div className="flex flex-col md:flex-row">
                <ProductFilter
                  selectedPrice={selectedPrice}
                  setSelectedPrice={setSelectedPrice}
                  selectedModel={selectedModel}
                  setSelectedModel={setSelectedModel}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                />

                <div className="flex-grow md:pl-10">
                  {/* --- MINI PROMO GRID --- */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-10">
                    {filteredPromos.map((p: any) => {
    const totalNormal =
      (p.mainProduct?.price || 0) +
      (p.secondProduct?.price || p.subProduct?.price || 0);

                      return (
                        <div
                          key={p.id}
                          className="group relative bg-[#062C2C] rounded-lg p-10  transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:-translate-y-2 flex flex-col"
                        >
                          <div className="mb-4 border-b border-white/10 flex justify-between items-center pb-4">
                            <div>
                              <h4 className="text-[#B6AB91] text-xs font-black uppercase tracking-[0.4em] mb-1">
                                {p.name || "Exclusive Bundle"}
                              </h4>
                              <p className="text-white/50 text-[10px] uppercase tracking-widest">
                                Special Package
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-white/30 text-[9px] uppercase tracking-tighter line-through">
                                Total Normal
                              </p>
                              <p className="text-white font-bold text-lg">
                                {formatIDR(p.promoPrice)}
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-6 mb-2">
                            {/* Produk Utama */}
                            <div className="flex flex-col gap-3">
                              <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden bg-[#083636] shadow-xl">
                                <Image
                                  src={
                                    p.mainProduct?.image || "/placeholder.jpg"
                                  }
                                  alt="Main"
                                  fill
                                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                                />
                              </div>
                              <div className="px-2">
                                <p className="text-white text-[11px] font-bold truncate uppercase">
                                  {p.mainProduct?.name}
                                </p>
                                <p className="text-[#B6AB91] text-[10px] font-medium">
                                  {formatIDR(p.mainProduct?.price)}
                                </p>
                              </div>
                            </div>

                            {/* Produk Kedua */}
                            <div className="flex flex-col gap-3 mt-10">
                              <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden bg-[#083636] shadow-xl border border-white/5">
                                <Image
                                  src={
                                    p.secondProduct?.image ||
                                    p.subProduct?.image ||
                                    "/placeholder.jpg"
                                  }
                                  alt="Sub"
                                  fill
                                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                                />
                              </div>
                              <div className="px-2">
                                <p className="text-white text-[11px] font-bold truncate uppercase">
                                  {p.secondProduct?.name || p.subProduct?.name}
                                </p>
                                <p className="text-[#B6AB91] text-[10px] font-medium">
                                  {formatIDR(
                                    p.secondProduct?.price ||
                                      p.subProduct?.price,
                                  )}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="mt-auto pt-4">
                            <p className="text-gray-400 text-[11px] leading-relaxed mb-8 line-clamp-2 italic border-l-2 border-[#B6AB91]/30 pl-4">
                              {p.description}
                            </p>

                            <div className="flex flex-col gap-4">
                              {/* Baris Harga Hemat */}
                              <div className="flex justify-between items-end px-2">
                                <span className="text-white text-[10px] font-bold bg-[#B6AB91]/20 px-2 py-1 rounded-md">
                                  Hemat!
                                </span>
                                <div className="text-right">
                                  <span className="text-white/20 text-[10px] uppercase line-through block">
                                    {formatIDR(totalNormal)}
                                  </span>
                                </div>
                              </div>

                              {/* Baris Action Buttons */}
                              <div className="flex items-center gap-2">
                                <button
                                onClick={() => handleOpenCheckout(
                                  [p.mainProduct, p.secondProduct || p.subProduct], 
                                  p.promoPrice 
                                )}
                                className="flex-grow bg-[#B6AB91] text-[#062C2C] py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-white transition-all shadow-lg active:scale-95">
                                  Beli Bundle {formatIDR(p.promoPrice)}
                                </button>

                                {/* Icon Cart */}
                                <button className="p-4 bg-white/5 rounded-xl text-white hover:bg-[#B6AB91] hover:text-[#062C2C] transition-all group/icon">
                                  <ShoppingCart
                                    size={18}
                                    className="group-hover/icon:scale-110 transition-transform"
                                  />
                                </button>

                                {/* Icon Love */}
                                <button className="p-4 bg-white/5 rounded-xl text-white hover:bg-red-500 transition-all group/icon">
                                  <Heart
                                    size={18}
                                    className="group-hover/icon:scale-110 transition-transform"
                                  />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* NEW ARRIVALS */}
                  {!loading && newArrivalsData.length > 0 && (
                    <NewArrivals
                      products={newArrivalsData}
                      onBuy={(item) => handleOpenCheckout([item], item.price)}
                    />
                  )}

                  {/* FULL COLLECTION */}
                  <div className="mb-12">
                    <div className="flex items-center justify-between mb-6 border-t border-gray-100 pt-10">
                      <h3 className="text-md font-black tracking-[0.4em] text-gray-600 uppercase">
                        Archive Collection
                      </h3>
                      <span className="text-[10px] text-gray-300">
                        {filteredProducts.length} Products Found
                      </span>
                    </div>

                    {loading ? (
                      <div className="text-center py-20 text-gray-400 animate-pulse text-xs uppercase tracking-widest">
                        Loading...
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12 pb-32">
                        {archiveProductsData.map((product: any) => (
                         <ProductCard 
                          key={product.id} 
                          product={product} 
                          onBuy={(item) => handleOpenCheckout([item], item.price)} 
                        />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
      <CheckoutModal 
      isOpen={isCheckoutOpen} 
      onClose={() => setIsCheckoutOpen(false)} 
      items={checkoutData.items} 
      totalPrice={checkoutData.total}
      userId={1} // Sementara hardcode user ID 1
    />
    </main>
  );
}
