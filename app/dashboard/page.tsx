import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { authClient } from "@/lib/auth-client"; // Optional: if you want client-side signout
import { SignOutButton } from "../../components/sign-out-button";

export default async function DashboardPage() {
    // 1. Fetch the session securely on the server
    const session = await auth.api.getSession({
        headers: await headers(), // 'await' is required in Next.js 15+
    });

    // 2. Protect the route: Kick unauthenticated users back to the landing page
    if (!session) {
        redirect("/");
    }

    return (
        <div className="min-h-screen bg-gray-100 p-8 font-sans">
            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-8 border-b border-gray-100 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                        <p className="text-gray-500 mt-1">Welcome back, {session.user.name}</p>
                    </div>
                    <SignOutButton />
                </div>

                <div className="p-8">
                    <h2 className="text-xl font-semibold mb-4">Your Account Details</h2>
                    <div className="bg-gray-50 p-4 rounded-lg text-sm font-mono text-gray-700 overflow-x-auto">
                        <p><span className="font-bold">Email:</span> {session.user.email}</p>
                        <p><span className="font-bold">ID:</span> {session.user.id}</p>
                        <p><span className="font-bold">Email Verified:</span> {session.user.emailVerified ? "Yes" : "No"}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}