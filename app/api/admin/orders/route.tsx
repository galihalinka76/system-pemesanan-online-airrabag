import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: {
          // TAMBAHKAN no_telp DI SINI
          select: { 
            name: true, 
            email: true, 
            no_telp: true 
          }
        },
        orderItems: {
          include: { 
            product: true 
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(orders, { status: 200 });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json({ message: "Gagal mengambil data pesanan" }, { status: 500 });
  }
}