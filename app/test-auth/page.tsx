"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client"; // Ensure this path matches your client config

export default function TestAuth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  // This hook automatically checks the current authentication state
  const { data: session, isPending } = authClient.useSession();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data, error } = await authClient.signUp.email({
      email,
      password,
      name,
    });
    
    if (error) {
        alert(`Error: ${error.message}`);
    } else {
        alert("Signed up successfully!");
    }
  };

  const handleSignOut = async () => {
    await authClient.signOut();
  };

  if (isPending) return <div className="p-10">Loading auth state...</div>;

  return (
    <div className="p-10 max-w-md mx-auto flex flex-col gap-6 font-sans">
      <h1 className="text-2xl font-bold">Better Auth Test</h1>

      {session ? (
        <div className="p-4 border rounded-md bg-green-50/10 border-green-500">
          <p className="font-semibold text-green-600 mb-4">
            ✅ Logged in as: {session.user.email}
          </p>
          <button
            onClick={handleSignOut}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Sign Out
          </button>
          
          <div className="mt-4 pt-4 border-t text-xs overflow-auto">
            <p className="font-bold mb-2">Raw Session Data:</p>
            <pre className="bg-gray-900 text-gray-100 p-2 rounded">
              {JSON.stringify(session, null, 2)}
            </pre>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSignUp} className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="p-2 border rounded-md text-black"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-2 border rounded-md text-black"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="p-2 border rounded-md text-black"
            required
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
          >
            Sign Up
          </button>
        </form>
      )}
    </div>
  );
}