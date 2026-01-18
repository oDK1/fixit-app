'use client';

import Link from 'next/link';

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="text-6xl mb-6">⚠️</div>
        <h1 className="text-2xl font-bold mb-4">Authentication Error</h1>
        <p className="text-gray-400 mb-8">
          There was a problem signing you in. This could happen if:
        </p>
        <ul className="text-left text-gray-400 mb-8 space-y-2">
          <li>• The sign-in link expired</li>
          <li>• You denied access permissions</li>
          <li>• There was a network error</li>
        </ul>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition"
        >
          Try Again
        </Link>
      </div>
    </div>
  );
}
