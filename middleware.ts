import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import {
  checkRateLimit,
  getClientIdentifier,
  createRateLimitHeaders,
  AUTH_RATE_LIMIT,
} from '@/lib/rate-limit';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Apply stricter rate limiting to auth endpoints
  if (pathname.startsWith('/auth/')) {
    const identifier = getClientIdentifier(request);
    const { allowed, remaining, resetIn } = checkRateLimit(
      `auth:${identifier}`,
      AUTH_RATE_LIMIT
    );

    if (!allowed) {
      return new NextResponse(
        JSON.stringify({ error: 'Too many requests. Please try again later.' }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            ...createRateLimitHeaders(remaining, resetIn, AUTH_RATE_LIMIT),
          },
        }
      );
    }
  }

  // Apply general rate limiting to API-like routes
  if (pathname.startsWith('/api/')) {
    const identifier = getClientIdentifier(request);
    const { allowed, remaining, resetIn } = checkRateLimit(`api:${identifier}`);

    if (!allowed) {
      return new NextResponse(
        JSON.stringify({ error: 'Too many requests. Please try again later.' }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            ...createRateLimitHeaders(remaining, resetIn),
          },
        }
      );
    }
  }

  // Update Supabase session
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
