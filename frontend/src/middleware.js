import { NextResponse } from 'next/server';

export function middleware(request) {
  const token = request.cookies.get('token');
  const user = request.cookies.get('user');
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');
  const isAuthRoute = request.nextUrl.pathname.startsWith('/auth');

  // If trying to access admin routes without being logged in
  if (isAdminRoute && !token) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // If trying to access admin routes without admin role
  if (isAdminRoute && user) {
    try {
      const userData = JSON.parse(user.value);
      if (userData.role !== 'admin') {
        return NextResponse.redirect(new URL('/', request.url));
      }
    } catch (e) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }

  // If logged in and trying to access auth routes
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/auth/:path*'],
}; 