import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";

const prisma = new PrismaClient();
const secret = new TextEncoder().encode(process.env.JWT_SECRET || "rahasia_super_aman_123");

async function getAuthPayload() {
  const cookieStore = cookies();
  const token = (await cookieStore).get("session_token")?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch (err) {
    return null;
  }
}

// 1. POST: Mengirim Ulasan Baru
export async function POST(req: Request) {
  try {
    const payload = await getAuthPayload();
    if (!payload || !payload.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { rating, comment } = await req.json();
    if (!rating || !comment) {
      return NextResponse.json({ message: "Rating dan komentar wajib diisi" }, { status: 400 });
    }

    const newReview = await prisma.storeReview.create({
      data: {
        userId: Number(payload.id),
        rating: parseInt(rating),
        comment: comment,
      },
    });

    return NextResponse.json({ message: "Feedback sent", data: newReview }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}

// 2. GET: Mengambil riwayat ulasan milik user tersebut
export async function GET(req: Request) {
  try {
    const payload = await getAuthPayload();
    if (!payload || !payload.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const reviews = await prisma.storeReview.findMany({
      where: { userId: Number(payload.id) },
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true } } },
    });

    return NextResponse.json(reviews, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}


// 3. PUT: Update Ulasan (Fungsi Edit)
export async function PUT(req: Request) {
  try {
    const payload = await getAuthPayload();
    if (!payload || !payload.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const { rating, comment } = await req.json();

    // Perbaikan: Konversi ID ke Number
    if (!id) return NextResponse.json({ message: "ID ulasan diperlukan" }, { status: 400 });
    const reviewId = Number(id); 

    // Pastikan ulasan ini benar-benar milik user yang login
    const existingReview = await prisma.storeReview.findFirst({
      where: { 
        id: reviewId, // Gunakan hasil konversi
        userId: Number(payload.id) 
      }
    });

    if (!existingReview) {
      return NextResponse.json({ message: "Ulasan tidak ditemukan atau akses dilarang" }, { status: 404 });
    }

    const updatedReview = await prisma.storeReview.update({
      where: { id: reviewId }, // Gunakan hasil konversi
      data: {
        rating: parseInt(rating),
        comment: comment,
      },
    });

    return NextResponse.json({ message: "Ulasan diperbarui", data: updatedReview }, { status: 200 });
  } catch (error) {
    console.error("Error updating review:", error);
    return NextResponse.json({ message: "Gagal memperbarui ulasan" }, { status: 500 });
  }
}

// 4. DELETE: Hapus Ulasan
export async function DELETE(req: Request) {
  try {
    const payload = await getAuthPayload();
    if (!payload || !payload.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    // Perbaikan: Konversi ID ke Number
    if (!id) return NextResponse.json({ message: "ID ulasan diperlukan" }, { status: 400 });
    const reviewId = Number(id);

    // Pastikan ulasan milik user sebelum dihapus
    const existingReview = await prisma.storeReview.findFirst({
      where: { 
        id: reviewId, // Gunakan hasil konversi
        userId: Number(payload.id) 
      }
    });

    if (!existingReview) {
      return NextResponse.json({ message: "Akses dilarang" }, { status: 403 });
    }

    await prisma.storeReview.delete({
      where: { id: reviewId }, // Gunakan hasil konversi
    });

    return NextResponse.json({ message: "Ulasan berhasil dihapus" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting review:", error);
    return NextResponse.json({ message: "Gagal menghapus ulasan" }, { status: 500 });
  }
}