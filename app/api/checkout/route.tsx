import { NextResponse } from "next/server";
import { PrismaClient, OrderStatus } from "@prisma/client";
import { jwtVerify } from "jose";

const prisma = new PrismaClient();
const secret = new TextEncoder().encode(process.env.JWT_SECRET || "rahasia_super_aman_123");

export async function POST(req: Request) {
  try {
    const token = req.headers.get("cookie")?.split("session_token=")[1]?.split(";")[0];
    
    if (!token) {
      return NextResponse.json({ message: "Silahkan login terlebih dahulu" }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, secret);
    const authenticatedUserId = Number(payload.id);

    const { items, totalPrice, quantity } = await req.json();

    const result = await prisma.$transaction(async (tx) => {
      // 1. Buat Order dengan status PENDING
      const order = await tx.order.create({
        data: {
          userId: authenticatedUserId, 
          total: totalPrice,
          status: "PENDING", 
          orderItems: {
            create: items.map((item: any) => ({
              productId: Number(item.id),
              quantity: Number(quantity),
              priceAtPurchase: Number(item.price),
            }))
          }
        },
        include: { orderItems: true }
      });

      // BAGIAN UPDATE STOK DIHAPUS/DIKOMENTARI
      /* 
      for (const item of items) {
        await tx.product.update({
          where: { id: Number(item.id) },
          data: { stock: { decrement: Number(quantity) } }
        });
      }
      */

      return order;
    });

    return NextResponse.json({ success: true, order: result }, { status: 200 });
  } catch (error: any) {
    console.error("PRISMA ERROR:", error);
    return NextResponse.json(
      { message: "Gagal memproses pesanan", detail: error.message }, 
      { status: 500 }
    );
  }
}