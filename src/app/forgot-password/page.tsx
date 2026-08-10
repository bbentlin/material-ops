"use client";

import { useState, useTransition } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [previewLink, setPreviewLink] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    startTransition(async () => {
      setError("");
      setSuccess("");
      setPreviewLink("");

      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to request password reset");
        return;
      }

      setSuccess(data.message || "If an account exists, reset instructions have been sent.");
      if (data.resetLink) setPreviewLink(data.resetLink);
    });
  }

  return (
    <main className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="mx-auto flex min-h-screen w-full max-w-md items-center px-4 py-8 sm:px-6">
        <form
          action={handleSubmit}
          className="w-full rounded-xl border border-gray-200 bg-white p-5 shadow-md dark:border-gray-700 dark:bg-gray-800 sm:p-8"
        >
          <h1 className="text-center text-xl font-bold text-gray-900 dark:text-gray-100 sm:text-2xl">
            Forgot Password
          </h1>
          <p className="mt-2 text-center text-sm text-gray-500 dark:text-gray-400">
            Enter your email and we will generate a reset link.
          </p>

          <div className="mt-6 flex flex-col gap-1">
            <label htmlFor="forgot-email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Email
            </label>
            <input
              id="forgot-email"
              type="email"
              placeholder="you@example.com"
              className="rounded-md border border-gray-300 bg-white p-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          {error && (
            <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300">
              {error}
            </div>
          )}

          {success && (
            <div className="mt-4 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700 dark:border-green-900/40 dark:bg-green-900/20 dark:text-green-300">
              {success}
            </div>
          )}

          {previewLink && (
            <div className="mt-3 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-700 dark:border-blue-900/40 dark:bg-blue-900/20 dark:text-blue-300 break-all">
              Dev reset link: <a href={previewLink} className="underline">{previewLink}</a>
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="mt-5 w-full rounded-md bg-blue-600 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? "Sending..." : "Send reset link"}
          </button>

          <div className="mt-4 text-center text-sm">
            <Link href="/login" className="text-blue-600 hover:underline dark:text-blue-400">
              Back to sign in
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}