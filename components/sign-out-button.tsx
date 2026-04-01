"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function SignOutButton() {
    const router = useRouter();
    const [isPending, setIsPending] = useState(false);

    const handleSignOut = async () => {
        setIsPending(true);
        await authClient.signOut({
            fetchOptions: {
                onSuccess: () => {
                    router.push("/"); // Redirect to landing page after logout
                    router.refresh(); // Force Next.js to clear any cached protected routes
                },
            },
        });
        setIsPending(false);
    };

    return (
        <button
            onClick={handleSignOut}
            disabled={isPending}
            className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors disabled:opacity-50"
        >
            {isPending ? "Signing out..." : "Sign Out"}
        </button>
    );
}