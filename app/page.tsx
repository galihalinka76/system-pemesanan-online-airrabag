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
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "next/navigation";

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
  const [checkoutData, setCheckoutData] = useState<{
    items: any[];
    total: number;
  }>({ items: [], total: 0 });
  // Di dalam function HomePage()
  const [isFlying, setIsFlying] = useState(false);
  const [flyCoords, setFlyCoords] = useState({
    startX: 0,
    startY: 0,
    endX: 0,
    endY: 0,
  });
  const [flyImage, setFlyImage] = useState("");

  const [currentUser, setCurrentUser] = useState<any>(null);
  // Tambahkan ini di bagian deklarasi state
const [favorites, setFavorites] = useState<any[]>([]);


const getCartKey = (userId: any) => userId ? `cart_${userId}` : "cart_guest";
const getFavKey = (userId: any) => userId ? `favorites_${userId}` : "favorites_guest";

const handleAddToCartOnly = (item: any) => {
  const cartKey = getCartKey(currentUser); // Menggunakan kunci dinamis
  const existingCart = JSON.parse(localStorage.getItem(cartKey) || "[]");

  const isExist = existingCart.find((cartItem: any) => cartItem.id === item.id);

  let newCart;
  if (!isExist) {
    newCart = [...existingCart, { ...item, quantity: 1 }];
  } else {
    newCart = existingCart.map((cartItem: any) =>
      cartItem.id === item.id
        ? { ...cartItem, quantity: (cartItem.quantity || 1) + 1 }
        : cartItem
    );
  }

  localStorage.setItem(cartKey, JSON.stringify(newCart));
  window.dispatchEvent(new Event("cartUpdated"));
};


const handleToggleFavorite = (item: any) => {
  const favKey = getFavKey(currentUser); // Menggunakan kunci dinamis
  const currentFavorites = JSON.parse(localStorage.getItem(favKey) || "[]");
  
  const index = currentFavorites.findIndex((fav: any) => fav.id === item.id);

  let newFavorites;
  if (index === -1) {
    newFavorites = [...currentFavorites, { ...item, savedAt: new Date().toISOString() }];
  } else {
    newFavorites = currentFavorites.filter((fav: any) => fav.id !== item.id);
  }

  localStorage.setItem(favKey, JSON.stringify(newFavorites)); // Simpan ke kunci user
  setFavorites(newFavorites);
  window.dispatchEvent(new Event("favoritesUpdated"));
};

useEffect(() => {
  // PENTING: Gunakan currentUser sebagai dependency
  const favKey = getFavKey(currentUser);
  const savedFavorites = JSON.parse(localStorage.getItem(favKey) || "[]");
  setFavorites(savedFavorites);
}, [currentUser]); 


const fetchUser = async () => {
  try {
    const res = await fetch("/api/auth/me");
    if (res.status === 401) {
      setCurrentUser(null);
      return;
    }

    const data = await res.json();

    if (data && data.user) {
      setCurrentUser(data.user.id);
    } else {
      setCurrentUser(null);
    }
  } catch (err) {
    setCurrentUser(null);
  }
};

  useEffect(() => {
    fetchUser();
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

    const matchPromoName = p.name?.toLowerCase().includes(query);

    const matchMainProduct = p.mainProduct?.name?.toLowerCase().includes(query);
    const matchSecondProduct = (p.secondProduct?.name || p.subProduct?.name)
      ?.toLowerCase()
      .includes(query);

    const matchModel =
      selectedModel === "All Models" ||
      p.mainProduct?.category?.toLowerCase() === selectedModel.toLowerCase();

    let matchPrice = true;
    if (selectedPrice !== "all") {
      const [min, max] = selectedPrice.split("-").map(Number);
      matchPrice = p.promoPrice >= min && p.promoPrice <= max;
    }

    return (
      (matchPromoName || matchMainProduct || matchSecondProduct) &&
      matchModel &&
      matchPrice
    );
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


  const handleFlyBundle = (e: React.MouseEvent, data: any) => {
    const cartIcon = document.getElementById("cart-icon");
    const cardElement = (e.currentTarget as HTMLElement).closest(".group");
    const imgElement = cardElement?.querySelector("img");

    if (cartIcon && imgElement) {
      const rect = imgElement.getBoundingClientRect();
      const cartRect = cartIcon.getBoundingClientRect();

      setFlyImage(data.image);
      setFlyCoords({
        startX: rect.left + rect.width / 2 + window.scrollX,
        startY: rect.top + rect.height / 2 + window.scrollY,
        endX: cartRect.left + cartRect.width / 2 + window.scrollX,
        endY: cartRect.top + cartRect.height / 2 + window.scrollY,
      });

      setIsFlying(true);

      handleAddToCartOnly(data);

      setTimeout(() => setIsFlying(false), 1000);
    } else {
      handleAddToCartOnly(data);
    }
  };

  // Di dalam HomePage.js
  const searchParams = useSearchParams();
  const showParam = searchParams.get("show");

  useEffect(() => {
    if (showParam === "true") {
      setShowProducts(true);
    }
  }, [showParam]);

  return (
    <main className="min-h-screen bg-olive-200 text-black transition-all duration-500 overflow-x-hidden">
      <Navbar />

      <div className="pt-16">
        {!showProducts ? (
          <section className="relative w-full h-[calc(100vh-4rem)] flex flex-col overflow-hidden">
            <div className="flex-grow relative z-0">
              <Image
                src="/home/wel.png"
                alt="Airbag"
                fill
                className="object-cover animate-fadeIn"
                priority
              />
              <div className="absolute inset-0 bg-black/50 z-10"></div>

              <div className="absolute inset-0 z-20 flex items-center justify-center animate-fadeIn">
                <div className="flex flex-col items-center translate-y-64">
                  <div className="animate-bounce mb-2">
                    <svg
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#B6AB91"
                      strokeWidth="3"
                    >
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
            <div className="relative z-30 bg-[#B6AB91]  w-full h-16"></div>
          </section>
        ) : (
          <section className="animate-slideUp">
            <PromoSection promos={promos} />

            <div id="shop-section" className="px-6 md:px-12">
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

                      // --- PERBARUI BAGIAN INI ---
                      const bundleData = {
                        id: p.id,
                        name: p.name || "Paket Bundling",
                        price: p.promoPrice,
                        image: p.mainProduct?.image, 
                        isBundle: true,
                        // Tambahkan detail item agar di halaman favorit bisa ditampilkan keduanya
                        bundleItems: [
                          {
                            name: p.mainProduct?.name,
                            price: p.mainProduct?.price,
                            image: p.mainProduct?.image,
                          },
                          {
                            name: p.secondProduct?.name || p.subProduct?.name,
                            price:
                              p.secondProduct?.price || p.subProduct?.price,
                            image:
                              p.secondProduct?.image || p.subProduct?.image,
                          },
                        ],
                        description: p.description,
                      };

                      const isFavorite = favorites.some(
                        (fav) => fav.id === p.id,
                      );

                      // Fungsi khusus untuk Double Click di Card (Hanya menambah, tidak menghapus)
                      const handleLikeOnly = (e: React.MouseEvent) => {
                        const currentFavorites = JSON.parse(
                          localStorage.getItem("favorites") || "[]",
                        );
                        const exists = currentFavorites.some(
                          (fav: any) => fav.id === bundleData.id,
                        );

                        if (!exists) {
                          handleToggleFavorite(bundleData); // Tambah jika belum ada
                        }
                        // Jika sudah ada, diamkan saja (seperti Instagram)
                      };

                      return (
                        <div
                          key={p.id}
                          // 1. Tambahkan Double Click di sini (Efek seperti Instagram)
                          onDoubleClick={handleLikeOnly}
                          className={`group relative bg-[#062C2C] rounded-2xl p-8 border transition-all duration-500 overflow-hidden cursor-pointer select-none ${
                            isFavorite
                              ? "border-red-500/50"
                              : "border-white/5 hover:border-[#B6AB91]/30"
                          }`}
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
                                  onClick={() =>
                                    handleOpenCheckout(
                                      [
                                        p.mainProduct,
                                        p.secondProduct || p.subProduct,
                                      ],
                                      p.promoPrice,
                                    )
                                  }
                                  className="flex-grow bg-[#B6AB91] text-[#062C2C] py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-white transition-all shadow-lg active:scale-95"
                                >
                                  Beli Bundle {formatIDR(p.promoPrice)}
                                </button>

                                {/* Icon Cart di dalam Bundle Grid */}
                                <button
                                  onClick={(e) =>
                                    handleFlyBundle(e, {
                                      id: p.id,
                                      name: p.name || "Paket Bundling",
                                      price: p.promoPrice,
                                      image: p.mainProduct?.image,
                                      isBundle: true,

                                      bundleImages: [
                                        p.mainProduct?.image,
                                        p.secondProduct?.image ||
                                          p.subProduct?.image,
                                      ],
                                      bundleItems: [
                                        p.mainProduct?.name,
                                        p.secondProduct?.name ||
                                          p.subProduct?.name,
                                      ],
                                    })
                                  }
                                  className="p-4 bg-white/5 rounded-xl text-white hover:bg-[#B6AB91] hover:text-[#062C2C] transition-all group/icon"
                                >
                                  <ShoppingCart
                                    size={18}
                                    className="group-hover/icon:scale-110 transition-transform"
                                  />
                                </button>

                                <button
                                  onClick={(e) => {
                                    e.stopPropagation(); // Sangat penting agar Double Click Card tidak terpicu
                                    handleToggleFavorite(bundleData);
                                  }}
                                  className={`p-4 rounded-xl transition-all active:scale-90 ${
                                    isFavorite
                                      ? "bg-red-500 text-white"
                                      : "bg-white/5 text-white hover:bg-red-500/20"
                                  }`}
                                >
                                  <Heart
                                    size={18}
                                    fill={isFavorite ? "currentColor" : "none"}
                                    className={`transition-transform duration-300 ${isFavorite ? "scale-125" : "scale-100"}`}
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
                            userId={currentUser}
                            onBuy={(item) =>
                              handleOpenCheckout([item], item.price)
                            }
                            onAddToCart={(item) => handleAddToCartOnly(item)}
                            onToggleFavorite={handleToggleFavorite}
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
        userId={currentUser}
      />

      {typeof document !== "undefined" &&
        isFlying &&
        createPortal(
          <AnimatePresence>
            <motion.div
              initial={{
                position: "absolute",
                top: flyCoords.startY,
                left: flyCoords.startX,
                x: "-50%",
                y: "-50%",
                scale: 1,
                opacity: 1,
                zIndex: 999999,
              }}
              animate={{
                top: flyCoords.endY,
                left: flyCoords.endX,
                scale: 0.1,
                opacity: [1, 0.8, 0],
                rotate: 720,
              }}
              transition={{
                duration: 0.8,
                ease: [0.45, 0, 0.55, 1],
              }}
              className="pointer-events-none"
            >
              <div className="w-20 h-20 relative overflow-hidden rounded-full border-2 border-[#B6AB91] shadow-[0_0_20px_rgba(182,171,145,0.5)] bg-white">
                <Image
                  src={flyImage || "/placeholder.jpg"}
                  alt="flying"
                  fill
                  className="object-cover"
                />
              </div>
            </motion.div>
          </AnimatePresence>,
          document.body,
        )}
    </main>
  );
}
