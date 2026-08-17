"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import SubPageLayout from "@/components/SubPageLayout";
import PasswordStrengthMeter from "@/components/PasswordStrengthMeter";

type Me = {
  id: string;
  name: string;
  email: string;
  role: string;
};

const inputClass = 
  "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-500";

export default function ProfilePage() {
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);
  const [name, setName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    fetch("api/auth/me")
      .then((res) => {
        if (res.status === 401) {
          router.push("/login");
          throw new Error("Unauthorized");
        }
        if (!res.ok) throw new Error("Failure to load profile");
        return res.json();
      })
      .then((data) => {
        setMe(data);
        setName(data.name ?? "");
      })
      .catch((e) => setError(e.message || "Failed to load profile"))
      .finally(() => setLoading(false));
  }, [router]);

  function handleSubmit() {
    startTransition(async () => {
      setError("");
      setSuccess("");

      if (newPassword && newPassword !== confirmNewPassword) {
        setError("New password and confirmation do not match");
        return;
      }

      const payload: Record<string, string> = {};
      if (name.trim()) payload.name = name.trim();
      if (currentPassword) payload.currentPassword = currentPassword;
      if (newPassword) payload.newPassword = newPassword;

      const res = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to update profile");
        return;
      }

      setSuccess("Profile updated successfully");
      setMe({
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role,
      });
      setName(data.name ?? "");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    });
  }

  return (
    <SubPageLayout
      title="My Profile"
      backHref="/dashboard"
      backLabel="← Back to Dashboard"
      maxWidth="max-w-5xl"
      loading={loading} 
    >
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:p-6">
        <form action={handleSubmit} className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <label htmlFor="profile-name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Name
              </label>
              <input
                id="profile-name"
                className={inputClass}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="profile-email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </label>
              <input
                id="profile-email"
                className={inputClass + "opacity-80"}
                value={me?.email ?? ""}
                disabled
                readOnly
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Email changes remain admin-managed.
              </p>
            </div>
          </div>

          <div className="mt-2 border-t border-gray-200 pt-4 dark:border-gray-700">
            <h3 className="mb-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
              Change Password
            </h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1">
                <label htmlFor="current-password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Current Password
                </label>
                <input
                  id="current-password"
                  type="password"
                  className={inputClass}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Required to set a new password"
                  autoComplete="current-password"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="new-password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  New Password
                </label>
                <input
                  id="new-password"
                  type="password"
                  className={inputClass}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Leave blank to keep current password"
                  autoComplete="new-password"
                />
                <PasswordStrengthMeter password={newPassword} />
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-1 sm:max-w-sm">
              <label htmlFor="confirm-new-password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Confirm New Password
              </label>
              <input
                id="confirm-new-password"
                type="password"
                className={inputClass}
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder="Re-enter new password"
                autoComplete="new-password"
              />
            </div>
          </div>

          {error && (
            <div role="alert" className="rounded-md border border-red-200 bg-red-50 p-2 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-md border border-green-200 bg-green-50 p-2 text-sm text-green-700 dark:border-green-900/40 dark:bg-green-900/20 dark:text-green-300">
              {success}
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="rounded border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isPending ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </SubPageLayout>
  );
} 