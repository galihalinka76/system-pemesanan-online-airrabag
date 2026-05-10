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
      return NextResponse.json({ orders: [] }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, secret);
    const userIdFromToken = Number(payload.id);

    const orders = await prisma.order.findMany({
      where: { userId: userIdFromToken },
      include: {
        // 1. Ambil alamat user untuk pengiriman/struk
        user: {
          select: { 
            name: true, 
            email: true, 
            address: true 
          }
        },
        // 2. Ambil detail pembayaran (WAJIB untuk label Lunas)
        payment: true, 
        // 3. Ambil item pesanan dan detail produk (WAJIB untuk struk)
        orderItems: {
          include: { 
            product: true 
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Formatting agar frontend lebih mudah membaca datanya
    const formattedOrders = orders.map(order => ({
      ...order,
      items: order.orderItems // Aliasing orderItems ke items agar konsisten dengan frontend
    }));

    return NextResponse.json({ orders: formattedOrders }, { status: 200 });
  } catch (error) {
    console.error("❌ DEBUG: API Error:", error);
    return NextResponse.json({ orders: [] }, { status: 500 });
  }
}