import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const secret = new TextEncoder().encode(process.env.JWT_SECRET || "rahasia_super_aman_123");

export async function GET(request: Request) {
  try {
    const token = request.headers.get("cookie")?.split("session_token=")[1]?.split(";")[0];
    if (!token) return NextResponse.json({ user: null }, { status: 401 });

    const { payload } = await jwtVerify(token, secret);

    const user = await prisma.user.findUnique({
      where: { id: payload.id as number },
      select: { 
        id: true,
        name: true, 
        email: true, 
        no_telp:true,
        address: true, 
        role: true 
      }
    });

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ user: null }, { status: 500 });
  }
}