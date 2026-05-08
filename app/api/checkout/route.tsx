import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { jwtVerify } from "jose"; // Import jose untuk verifikasi token

const prisma = new PrismaClient();
const secret = new TextEncoder().encode(process.env.JWT_SECRET || "rahasia_super_aman_123");

export async function POST(req: Request) {
  try {
    // 1. Ambil token dari cookie
    const token = req.headers.get("cookie")?.split("session_token=")[1]?.split(";")[0];
    
    if (!token) {
      return NextResponse.json({ message: "Silahkan login terlebih dahulu" }, { status: 401 });
    }

    // 2. Verifikasi token untuk mendapatkan ID user yang SEBENARNYA login
    const { payload } = await jwtVerify(token, secret);
    const authenticatedUserId = Number(payload.id); // Ini ID asli dari session

    const { items, totalPrice, quantity } = await req.json();

    const result = await prisma.$transaction(async (tx) => {
      // 3. Gunakan authenticatedUserId (Bukan userId dari frontend)
      const order = await tx.order.create({
        data: {
          userId: authenticatedUserId, 
          total: totalPrice,
          status: "PROSES",
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

      for (const item of items) {
        await tx.product.update({
          where: { id: Number(item.id) },
          data: { stock: { decrement: Number(quantity) } }
        });
      }

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