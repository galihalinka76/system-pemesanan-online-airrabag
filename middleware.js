import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "rahasia_super_aman_123");

export async function middleware(request) {
  const token = request.cookies.get('session_token')?.value;
  const { pathname } = request.nextUrl;

  let payload = null;

  if (token) {
    try {
      const verified = await jwtVerify(token, secret);
      payload = verified.payload;
    } catch (err) {
      payload = null;
    }
  }

  // --- 1. HALAMAN AUTH (/auth/login, /auth/register) ---
  if (pathname.startsWith('/auth/')) {
    if (payload) {
      // Jika sudah login, kembalikan ke tempat yang sesuai role
      const target = payload.role === 'ADMIN' ? '/admin' : '/';
      return NextResponse.redirect(new URL(target, request.url));
    }
    return NextResponse.next();
  }

  // --- 2. AREA ADMIN (/admin/:path*) ---
  if (pathname.startsWith('/admin')) {
    // Kecuali halaman login admin itu sendiri
    if (pathname === '/admin/login') {
      if (payload && payload.role === 'ADMIN') {
        return NextResponse.redirect(new URL('/admin', request.url));
      }
      return NextResponse.next();
    }

    // Blokir jika bukan ADMIN
    if (!payload || payload.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // --- 3. AREA PROTEKSI USER (/pemesanan-saya, dll) ---
  if (pathname.startsWith('/pemesanan-saya')) {
    // Jika dia ADMIN, jangan lempar ke login user umum, 
    // tapi biarkan dia lewat atau lempar ke dashboard admin saja.
    if (payload && payload.role === 'ADMIN') {
      return NextResponse.redirect(new URL('/admin', request.url));
    }

    // Jika bukan USER (atau tidak login), lempar ke login user
    if (!payload || payload.role !== 'USER') {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }

  // Halaman lain (Beranda, Shop, About) dibiarkan bebas akses
  return NextResponse.next();
}

export const config = {
  // Pastikan matcher hanya mengawasi rute yang memang butuh proteksi
  matcher: ['/admin/:path*', '/pemesanan-saya/:path*', '/auth/:path*'],
};