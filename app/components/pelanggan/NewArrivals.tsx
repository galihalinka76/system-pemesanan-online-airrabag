// components/pelanggan/NewArrivals.tsx
"use client";
import ProductCard from "./ProductCard";

export default function NewArrivals({ products, onBuy }: { products: any[]; onBuy: (item: any) => void }) {
  // Filter produk yang dibuat dalam 3 hari terakhir
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

  const newProducts = products.filter((product) => {
    const createdDate = new Date(product.createdAt);
    return createdDate >= threeDaysAgo;
  });

  if (newProducts.length === 0) return null;

  return (
    <div className="mb-10">
      <div className="flex items-center gap-4 mb-10">
        <div className="h-px bg-black/10 flex-grow"></div>
        <h3 className="text-md font-black tracking-[0.5em] text-black uppercase whitespace-nowrap">
          New Arrivals
        </h3>
        <div className="h-px bg-black/10 flex-grow"></div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
        {newProducts.map((product) => (
          <ProductCard key={product.id} product={product} onBuy={onBuy} />
        ))}
      </div>
    </div>
  );
}