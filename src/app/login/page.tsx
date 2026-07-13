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
        headers: { "Content-Type": "application/json"},
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

  const shouldCrashApp = 
    process.env.NEXT_PUBLIC_E2E_CRASH === "1" && 
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).has("e2eCrashApp");

  if (shouldCrashApp) {
    throw new Error("E2E app boundary crash");
  }

  return (
    <main className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="mx-auto flex min-h-screen w-full max-w-md items-center px-4 py-8 sm:px-6">
        <form
          action={handleSubmit}
          className="w-full rounded-xl border border-gray-200 bg-white p-5 shadow-md dark:border-gray-700 dark:bg-gray-800 sm:p-8"
        >
          <h1 className="text-center text-xl font-bold text-gray-900 dark:text-gray-100 sm:text-2xl">
            LogiCore Inventory Management System
          </h1>
          <p className="mt-2 text-center text-sm text-gray-500 dark:text-gray-400">
            Sign in to your account
          </p>

          <div className="mt-6 space-y-4">
            <div className="flex flex-col gap-1">
              <label
                htmlFor="login-email"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Email
              </label>
              <input
                id="login-email"
                type="email"
                placeholder="you@example.com"
                className="rounded-md border border-gray-300 bg-white p-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label
                htmlFor="login-password"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Password
              </label>
              <input
                id="login-password"
                type="password"
                placeholder="Enter your password"
                className="rounded-md border border-gray-300 bg-white p-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required 
              />
            </div>
          </div>

          {error && (
            <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-center text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="mt-5 w-full rounded-md bg-blue-600 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </main>
  );
}