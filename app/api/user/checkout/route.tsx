import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, items, total } = body; 
    // items = [{ productId: 1, quantity: 1, price: 50000 }, ...]

    if (!userId || !items || items.length === 0) {
      return NextResponse.json({ message: "Data tidak valid" }, { status: 400 });
    }

    // 🔥 Gunakan Transaction untuk memastikan jika satu gagal, semua batal (Atomicity)
    const result = await prisma.$transaction(async (tx) => {
      
      // 1. Buat Order Baru
      const newOrder = await tx.order.create({
        data: {
          userId: Number(userId),
          total: parseFloat(total),
          status: "PENDING",
          // Buat OrderItem sekaligus
          orderItems: {
            create: items.map((item: any) => ({
              productId: Number(item.productId),
              quantity: Number(item.quantity),
              priceAtPurchase: parseFloat(item.price) 
            })),
          },
        },
        include: { orderItems: true }
      });

      // 2. Kurangi Stok Produk
      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: Number(item.productId) }
        });

        if (!product || product.stock < item.quantity) {
          throw new Error(`Stok produk ${product?.name || item.productId} tidak mencukupi`);
        }

        await tx.product.update({
          where: { id: Number(item.productId) },
          data: { stock: { decrement: Number(item.quantity) } }
        });
      }

      return newOrder;
    });

    return NextResponse.json({ message: "Pesanan berhasil dibuat", data: result }, { status: 201 });

  } catch (error: any) {
    console.error("ERROR_CHECKOUT:", error);
    return NextResponse.json(
      { message: error.message || "Terjadi kesalahan saat checkout" }, 
      { status: 500 }
    );
  }
}