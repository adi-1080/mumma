'use client';

import { authClient } from '@/lib/auth-client';

interface SignOutButtonProps {
    className?: string;
}

export function SignOutButton({ className = "" }: SignOutButtonProps) {
    return (
        <button
            onClick={async () => {
                await authClient.signOut();
                window.location.pathname = '/';
            }}
            className={`px-4 py-2 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 border-2 border-red-200 rounded-[10px] transition-colors ${className}`}
        >
            Sign Out
        </button>
    );
}
