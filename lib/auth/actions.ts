'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { headers } from 'next/headers';

/**
 * Server-side logger that only logs in development.
 * This is duplicated here because server actions can't import client modules.
 */
const isDev = process.env.NODE_ENV === 'development';
const serverLog = {
  error: (...args: unknown[]) => {
    if (isDev) console.error('[DEV]', ...args);
  },
};

export async function signInWithGoogle() {
  const supabase = await createClient();
  const headersList = await headers();
  const origin = headersList.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/auth/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });

  if (error) {
    serverLog.error('Google sign-in error:', error.message);
    redirect('/auth/auth-error');
  }

  if (data.url) {
    redirect(data.url);
  }
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/');
}
