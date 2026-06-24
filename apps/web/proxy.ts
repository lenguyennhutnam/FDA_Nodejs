import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Replicate constant here to avoid importing next/headers in Edge runtime
const ACCESS_TOKEN_KEY = 'access_token';

const PUBLIC_PATHS = ['/login'];

export function proxy(request: NextRequest) {
  const token = request.cookies.get(ACCESS_TOKEN_KEY)?.value;
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.includes(pathname)) {
    if (token) return NextResponse.redirect(new URL('/dashboard', request.url));
    return NextResponse.next();
  }

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
};
