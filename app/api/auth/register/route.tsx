import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    // Tambahkan no_telp di destrukturisasi json
    const { name, email, password, address, no_telp } = await request.json();

    // 1. Cek apakah user sudah ada
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "Email sudah terdaftar" },
        { status: 400 }
      );
    }

    // 2. Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Simpan ke Database (sertakan no_telp)
    const user = await prisma.user.create({
      data: {
        name,
        email,
        no_telp, // 👈 Simpan ke kolom baru
        address,
        password: hashedPassword,
        role: "USER", 
      },
    });

    return NextResponse.json(
      { message: "Registrasi berhasil", userId: user.id },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}