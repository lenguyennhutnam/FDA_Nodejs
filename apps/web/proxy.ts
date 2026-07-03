import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const PUBLIC_PATHS = ['/login'];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip asset files and api routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('favicon.ico')
  ) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get(ACCESS_TOKEN_KEY)?.value;
  const refreshToken = request.cookies.get(REFRESH_TOKEN_KEY)?.value;

  // Handle public paths (e.g. /login)
  if (PUBLIC_PATHS.includes(pathname)) {
    // If access token is valid, redirect to dashboard
    if (accessToken) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    
    // If no access token but refresh token is available, try refreshing first
    if (refreshToken) {
      const newTokens = await tryRefreshToken(refreshToken);
      if (newTokens) {
        const response = NextResponse.redirect(new URL('/dashboard', request.url));
        setResponseCookies(response, newTokens.accessToken, newTokens.refreshToken);
        return response;
      }
    }

    return NextResponse.next();
  }

  // Handle protected paths
  if (!accessToken) {
    // Access token is missing or expired, check if we can refresh it using refresh token
    if (refreshToken) {
      const newTokens = await tryRefreshToken(refreshToken);
      if (newTokens) {
        // Refresh successful. Propagate new cookies to the current request and the client response.
        request.cookies.set(ACCESS_TOKEN_KEY, newTokens.accessToken);
        request.cookies.set(REFRESH_TOKEN_KEY, newTokens.refreshToken);

        const response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        });

        setResponseCookies(response, newTokens.accessToken, newTokens.refreshToken);
        return response;
      }
    }

    // No valid token and refresh failed/not available -> redirect to login
    const loginUrl = new URL('/login', request.url);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete(ACCESS_TOKEN_KEY);
    response.cookies.delete(REFRESH_TOKEN_KEY);
    return response;
  }

  return NextResponse.next();
}

async function tryRefreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string } | null> {
  try {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:3001/api';
    const res = await fetch(`${apiBaseUrl}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.accessToken && data.refreshToken) {
        return {
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        };
      }
    }
  } catch (err) {
    console.error('Error refreshing token in proxy:', err);
  }
  return null;
}

function setResponseCookies(response: NextResponse, accessToken: string, refreshToken: string) {
  response.cookies.set(ACCESS_TOKEN_KEY, accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 15, // 15 minutes
    path: '/',
  });
  
  response.cookies.set(REFRESH_TOKEN_KEY, refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
};
