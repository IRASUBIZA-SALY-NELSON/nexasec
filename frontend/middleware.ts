import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define protected path prefixes
const protectedPrefixes = ['/dashboard', '/profile', '/security', '/subscriptions', '/settings'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow login and public assets
  if (pathname.startsWith('/auth/login') || pathname.startsWith('/auth/signup') || pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.startsWith('/favicon') || pathname.startsWith('/logo')) {
    return NextResponse.next();
  }

  // If path is protected and no auth cookie, redirect to login
  if (protectedPrefixes.some((p) => pathname.startsWith(p))) {
    const authCookie = request.cookies.get('auth_token');
    if (!authCookie) {
      const url = request.nextUrl.clone();
      url.pathname = '/auth/login';
      url.searchParams.set('next', pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|api|favicon.ico).*)'],
};


