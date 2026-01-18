'use client';

import { signOut } from '@/lib/auth/actions';

interface SignOutButtonProps {
  className?: string;
}

export default function SignOutButton({ className }: SignOutButtonProps) {
  return (
    <form action={signOut}>
      <button
        type="submit"
        className={className || "w-full text-left p-4 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 hover:border-purple-600 transition"}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">🚪</span>
          <div>
            <div className="font-semibold text-white">Sign Out</div>
            <div className="text-sm text-gray-400">Return to landing page</div>
          </div>
        </div>
      </button>
    </form>
  );
}
