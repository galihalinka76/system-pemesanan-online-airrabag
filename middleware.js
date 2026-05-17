import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "rahasia_super_aman_123");

export async function middleware(request) {
  const token = request.cookies.get('session_token')?.value;
  const { pathname, searchParams } = request.nextUrl; 

  let payload = null;

  if (token) {
    try {
      const verified = await jwtVerify(token, secret);
      payload = verified.payload;
    } catch (err) {
      payload = null;
    }
  }

  // 1. AREA AUTH (Login/Register)
  if (pathname.startsWith('/auth/')) {
    if (payload) {
      const target = payload.role === 'ADMIN' ? '/admin' : '/';
      return NextResponse.redirect(new URL(target, request.url));
    }
    return NextResponse.next();
  }

  // 2. AREA ADMIN
  if (pathname.startsWith('/admin')) {
    if (pathname === '/admin/login') {
      if (payload && payload.role === 'ADMIN') {
        return NextResponse.redirect(new URL('/admin', request.url));
      }
      return NextResponse.next();
    }
    if (!payload || payload.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // 3. AREA ACCOUNT & CART LOGIC
  if (pathname.startsWith('/account')) {
    const tab = searchParams.get('tab');
    
    // Izinkan akses jika tab-nya adalah 'cart' (meskipun belum login)
    if (tab === 'cart') {
      return NextResponse.next();
    }

    // Jika akses tab lain (profile, orders, dll) tapi belum login
    if (!payload) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*', 
    '/account/:path*', 
    '/auth/:path*'
  ],
};