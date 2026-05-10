import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // --- 1. LOG DEBUGGING (Cek ini di terminal VS Code) ---
    console.log("--- MIDTRANS WEBHOOK INCOMING ---");
    console.log("Payload:", JSON.stringify(body, null, 2));

    const transactionStatus = body.transaction_status;
    const fraudStatus = body.fraud_status;
    const transactionId = body.transaction_id;
    const orderIdRaw = body.order_id; // Format: ORDER-ID-TIMESTAMP
    const paymentType = body.payment_type;
    const grossAmount = parseFloat(body.gross_amount);

    // --- 2. PARSING ORDER ID ---
    // Pastikan ID yang diambil benar (index ke-1 dari split)
    const idParts = orderIdRaw.split("-");
    const orderId = parseInt(idParts[1]);

    console.log(`Parsed Order ID: ${orderId}`);

    if (isNaN(orderId)) {
      console.error("❌ Error: Gagal parsing Order ID dari", orderIdRaw);
      return NextResponse.json({ message: "Invalid Order ID" }, { status: 400 });
    }

    // --- 3. FILTER STATUS (Hanya proses jika lunas) ---
    const isSuccess = 
      transactionStatus === "settlement" || 
      (transactionStatus === "capture" && fraudStatus === "accept");

    if (isSuccess) {
      console.log(`Processing Success Payment for Order #${orderId}...`);

      // Cari order beserta itemnya
      const orderData = await prisma.order.findUnique({
        where: { id: orderId },
        include: { orderItems: true }
      });

      if (!orderData) {
        console.error(`❌ Error: Order #${orderId} tidak ditemukan di database!`);
        return NextResponse.json({ message: "Order not found" }, { status: 404 });
      }

      // --- 4. DATABASE TRANSACTION ---
      await prisma.$transaction(async (tx) => {
        // A. Update Status Order
        await tx.order.update({
          where: { id: orderId },
          data: { status: "PROSES" },
        });

        // B. Catat Detail Pembayaran (Upsert untuk jaga-jaga duplikasi webhook)
        await tx.payment.upsert({
          where: { orderId: orderId },
          update: { 
            transactionId, 
            paymentType, 
            status: transactionStatus, 
            grossAmount 
          },
          create: { 
            orderId, 
            transactionId, 
            paymentType, 
            status: transactionStatus, 
            grossAmount 
          },
        });

        // C. Kurangi Stok Produk
        for (const item of orderData.orderItems) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } }
          });
          console.log(`📉 Stok Produk ID ${item.productId} dikurangi ${item.quantity}`);
        }
      });

    } else {
     
    }

    return NextResponse.json({ message: "OK" });

  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}