import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const secret = new TextEncoder().encode(process.env.JWT_SECRET || "rahasia_super_aman_123");

export async function PUT(request: Request) {
  try {
    const token = request.headers.get("cookie")?.split("session_token=")[1]?.split(";")[0];
    if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { payload } = await jwtVerify(token, secret);
    
    // AMBIL KEDUA DATA DARI REQUEST BODY
    const { address, no_telp } = await request.json(); 

    const updatedUser = await prisma.user.update({
      where: { id: payload.id as number },
      data: { 
        address, 
        no_telp 
      }
    });

    return NextResponse.json({ user: updatedUser }, { status: 200 });
  } catch (error) {
    console.error(error); // Tambahkan log untuk debug jika ada error prisma
    return NextResponse.json({ message: "Error updating profile" }, { status: 500 });
  }
}