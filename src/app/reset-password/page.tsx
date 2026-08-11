"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PasswordStrengthMeter from "@/components/PasswordStrengthMeter";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = useMemo(() => searchParams.get("token") || "", [searchParams]);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    startTransition(async () => {
      setError("");
      setSuccess("");

      if (!token) {
        setError("Missing reset token. Request a new password reset link.");
        return;
      }

      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }

      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to reset password");
        return;
      }

      setSuccess("Password reset successful. Redirecting to login...");
      setTimeout(() => router.push("/login"), 1200);
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
            Reset Password
          </h1>

          <div className="mt-6 flex flex-col gap-1">
            <label htmlFor="reset-password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              New Password
            </label>
            <input
              id="reset-password"
              type="password"
              className="rounded-md border border-gray-300 bg-white p-3 text-gray-900 plachholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
            <PasswordStrengthMeter password={password} />
          </div>

          <div className="mt-4 flex flex-col gap-1">
            <label htmlFor="reset-confirm" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Confirm Password
            </label>
            <input
              id="reset-confirm"
              type="password"
              className="rounded-md border border-gray-300 bg-white p-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-500"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
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

          <button
            type="submit"
            disabled={isPending}
            className="mt-5 w-full rounded-md bg-blue-600 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? "Resetting..." : "Reset password"}
          </button>
        </form>
      </div>
    </main>
  );
}