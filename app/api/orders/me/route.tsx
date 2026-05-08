import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const secret = new TextEncoder().encode(process.env.JWT_SECRET || "rahasia_super_aman_123");

export async function GET(request: Request) {
  try {
    const cookieHeader = request.headers.get("cookie");
    const token = cookieHeader?.split("session_token=")[1]?.split(";")[0];

    if (!token) {
      console.log("❌ DEBUG: Token tidak ditemukan di cookie");
      return NextResponse.json({ orders: [] }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, secret);
    
    // 1. Log Detail Payload
    console.log("--- DEBUG START ---");
    console.log("1. Payload dari JWT:", payload);
    console.log("2. Tipe payload.id:", typeof payload.id);

    const userIdFromToken = Number(payload.id);
    console.log("3. User ID setelah di-Number():", userIdFromToken);

    // 2. Cek apakah User dengan ID tersebut memang ada di DB
    const userInDb = await prisma.user.findUnique({
      where: { id: userIdFromToken }
    });
    console.log("4. Apakah User ditemukan di DB?:", userInDb ? "YA ✅" : "TIDAK ❌");

    // 3. Ambil SEMUA order tanpa filter untuk melihat perbandingan userId di DB
    const allOrders = await prisma.order.findMany({
      select: { id: true, userId: true }
    });
    console.log("5. Daftar semua Order di DB (ID & UserId):", allOrders);

    const orders = await prisma.order.findMany({
      where: { userId: userIdFromToken },
      include: {
        orderItems: {
          include: { product: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`6. Jumlah Order ditemukan untuk User ${userIdFromToken}:`, orders.length);
    console.log("--- DEBUG END ---");

    const formattedOrders = orders.map(order => ({
      ...order,
      items: order.orderItems
    }));

    return NextResponse.json({ orders: formattedOrders }, { status: 200 });
  } catch (error) {
    console.error("❌ DEBUG: API Error:", error);
    return NextResponse.json({ orders: [] }, { status: 500 });
  }
}