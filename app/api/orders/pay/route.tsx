import { NextResponse } from "next/server";
// Gunakan import standar
import midtransClient from "midtrans-client";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId, total, customerName, customerEmail } = body;

    // Pastikan Server Key ada
    if (!process.env.MIDTRANS_SERVER_KEY) {
      throw new Error("MIDTRANS_SERVER_KEY tidak ditemukan di .env");
    }

    // Inisialisasi di dalam POST untuk memastikan instance segar
    const snap = new midtransClient.Snap({
      isProduction: false,
      serverKey: process.env.MIDTRANS_SERVER_KEY,
      clientKey: process.env.MIDTRANS_CLIENT_KEY || "",
    });

    // PAKSA TOTAL MENJADI ANGKA BULAT (Integer)
    // Midtrans akan error jika menerima desimal atau string
    const amount = Math.round(Number(total));

    const parameter = {
      transaction_details: {
        // Gunakan ID yang unik agar tidak bentrok saat testing berulang kali
        order_id: `ORDER-${orderId}-${Date.now()}`,
        gross_amount: amount,
      },
      customer_details: {
        first_name: customerName || "Customer",
        email: customerEmail || "no-email@example.com",
      },
      usage_limit: 1,
    };

    const transaction = await snap.createTransaction(parameter);
    
    return NextResponse.json({ token: transaction.token });

  } catch (error: any) {
    console.error("--- DETAIL ERROR MIDTRANS ---");
    // Midtrans sering menyimpan pesan error di error.ApiResponse.error_messages
    if (error.ApiResponse && error.ApiResponse.error_messages) {
      console.error("Alasan Error:", error.ApiResponse.error_messages);
    } else {
      console.error(error);
    }
    
    return NextResponse.json(
      { message: error.ApiResponse?.error_messages?.[0] || error.message || "Internal Server Error" }, 
      { status: 500 }
    );
  
    
   
  }
}