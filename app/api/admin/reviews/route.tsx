import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const reviews = await prisma.storeReview.findMany({
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true, email: true } } }
    });
    return NextResponse.json(reviews, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Gagal memuat ulasan" }, { status: 500 });
  }
}

// Update status isActive (Moderasi)
export async function PATCH(req: Request) {
  try {
    const { id, isActive } = await req.json();
    const updated = await prisma.storeReview.update({
      where: { id: Number(id) },
      data: { isActive: isActive }
    });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ message: "Gagal update status" }, { status: 500 });
  }
}

// Hapus permanen oleh Admin
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    await prisma.storeReview.delete({
      where: { id: Number(id) }
    });
    return NextResponse.json({ message: "Terhapus" });
  } catch (error) {
    return NextResponse.json({ message: "Gagal menghapus" }, { status: 500 });
  }
}