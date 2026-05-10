import { NextResponse } from "next/server";

export async function POST() {
  try {
    // Membuat response
    const response = NextResponse.json(
      { message: "Logout berhasil" },
      { status: 200 }
    );

    // Menghapus session_token dengan cara mengeset expired ke masa lalu
    response.cookies.set("session_token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      expires: new Date(0), // Langsung kadaluarsa
      path: "/",
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { message: "Terjadi kesalahan saat logout" },
      { status: 500 }
    );
  }
}