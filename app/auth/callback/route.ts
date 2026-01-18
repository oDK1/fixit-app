import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Validates and sanitizes the redirect path to prevent open redirect attacks.
 * Only allows relative paths that start with a single slash.
 */
function sanitizeRedirectPath(path: string | null): string {
  if (!path) return '/';

  // Must start with exactly one slash (not // which browsers interpret as protocol-relative)
  if (!path.startsWith('/') || path.startsWith('//')) {
    return '/';
  }

  // Block any attempts to include protocol or domain
  if (path.includes('://') || path.includes('\\')) {
    return '/';
  }

  // Block encoded characters that could bypass validation
  const decoded = decodeURIComponent(path);
  if (decoded.startsWith('//') || decoded.includes('://')) {
    return '/';
  }

  return path;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = sanitizeRedirectPath(searchParams.get('next'));

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Add welcome=true to trigger the intro video for new Google auth users
      const redirectUrl = next === '/' ? '/?welcome=true' : next;
      return NextResponse.redirect(`${origin}${redirectUrl}`);
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-error`);
}
