import { writeFile } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 🔥 GET ALL PRODUCT
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Gagal mengambil data" }, { status: 500 });
  }
}

// 🔥 CREATE PRODUCT
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    
    const name = formData.get("name") as string;
    const description = formData.get("description") as string; // Ambil deskripsi
    const price = formData.get("price") as string;
    const stock = formData.get("stock") as string;
    const category = formData.get("category") as string;
    const file = formData.get("file") as File;

    if (!name || !price || !stock || !category) {
      return NextResponse.json({ message: "Data tidak lengkap" }, { status: 400 });
    }

    let imageUrl = "";

    if (file && file.size > 0) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filename = `${Date.now()}_${file.name.replace(/\s+/g, "_")}`;
      const filePath = path.join(process.cwd(), "public/uploads", filename);
      await writeFile(filePath, buffer);
      imageUrl = `/uploads/${filename}`;
    }

    const product = await prisma.product.create({
      data: {
        name,
        description: description || null, // Jika kosong, set null
        category,
        price: parseFloat(price),
        stock: parseInt(stock),
        image: imageUrl,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Gagal menambahkan produk" }, { status: 500 });
  }
}

// 🔥 UPDATE PRODUCT
export async function PUT(req: NextRequest) {
  try {
    const formData = await req.formData();
    const id = formData.get("id") as string;
    const name = formData.get("name") as string;
    const description = formData.get("description") as string; // Ambil deskripsi
    const price = formData.get("price") as string;
    const stock = formData.get("stock") as string;
    const category = formData.get("category") as string;
    const file = formData.get("file") as File;

    if (!id) {
      return NextResponse.json({ message: "ID wajib diisi" }, { status: 400 });
    }

    let updateData: any = {
      name,
      description: description !== undefined ? description : undefined, 
      category,
      price: price ? parseFloat(price) : undefined,
      stock: stock ? parseInt(stock) : undefined,
    };

    if (file && file.size > 0) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filename = `${Date.now()}_${file.name.replace(/\s+/g, "_")}`;
      const filePath = path.join(process.cwd(), "public/uploads", filename);
      await writeFile(filePath, buffer);
      updateData.image = `/uploads/${filename}`;
    }

    const product = await prisma.product.update({
      where: { id: Number(id) },
      data: updateData,
    });

    return NextResponse.json(product, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Gagal update produk" }, { status: 500 });
  }
}

// 🔥 DELETE PRODUCT
export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ message: "ID wajib diisi" }, { status: 400 });
    }

    await prisma.product.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ message: "Produk dihapus" }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Gagal hapus produk" }, { status: 500 });
  }
}