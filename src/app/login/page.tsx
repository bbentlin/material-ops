"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit() {
    startTransition(async () => {
      setError("");
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        router.push("/dashboard");
      } else {
        const data = await res.json();
        setError(data.error || "Login failed");
      }
    });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <form
        action={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-md w-96 flex flex-col gap-4"
      >
        <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">MaterialOps</h1>
        <p className="text-gray-500 text-center text-sm mb-4">Sign in to your account</p>
        <input
          type="email"
          placeholder="Email"
          className="border border-gray-300 p-3 rounded-md text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 selection:bg-blue-200 selection:text-gray-900"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="border border-gray-300 p-3 rounded-md text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 selection:bg-blue-200 selection:text-gray-900"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <div className="text-red-600 text-sm text-center">{error}</div>}
        <button
          type="submit"
          disabled={isPending}
          className="bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 disabled:opacity-50 font-medium"
        >
          {isPending ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </div>
  );
}