'use client';

import { useState } from 'react';
import { authClient } from '@/lib/auth-client';
import Button from './Button';

interface SignOutButtonProps {
    className?: string;
}

export function SignOutButton({ className = "" }: SignOutButtonProps) {
    const [isLoading, setIsLoading] = useState(false);

    return (
        <Button
            variant="secondary"
            isLoading={isLoading}
            onClick={async () => {
                setIsLoading(true);
                try {
                    await authClient.signOut();
                    window.location.href = '/';
                } catch (error) {
                    console.error('Sign out failed:', error);
                    setIsLoading(false);
                }
            }}
            className={`!text-red-500 !bg-red-50 !border-red-200 hover:!bg-red-100 ${className}`}
        >
            Sign Out
        </Button>
    );
}
