"use client";

import { useState, useTransition } from "react";
import DraggableModal from "./DraggableModal";
import PasswordStrengthMeter from "./PasswordStrengthMeter";

const inputClass =
  "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-500";

export default function AddUserModal({
  onCloseAction,
  onSuccessAction,
}: {
  onCloseAction: () => void;
  onSuccessAction: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("VIEWER");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    startTransition(async () => {
      setError("");
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });
      if (res.ok) {
        onSuccessAction();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to create user");
      }
    });
  }

  return (
    <DraggableModal onCloseAction={onCloseAction} labelledBy="add-user-title">
      <form action={handleSubmit} className="flex flex-col gap-4 p-4 sm:p-6">
        <h2 className="mb-1 text-lg font-bold text-gray-900 dark:text-gray-100">Add New User</h2>

        <div className="flex flex-col gap-1">
          <label htmlFor="adduser-name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            id="adduser-name"
            name="name"
            autoComplete="name"
            placeholder="e.g. John Doe"
            className={inputClass}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="adduser-email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            id="adduser-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="e.g. john@example.com"
            className={inputClass}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="adduser-password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Password <span className="text-red-500">*</span>
          </label>
          <input
            id="adduser-password"
            type="password"
            autoComplete="new-password"
            placeholder="Enter a password"
            className={inputClass}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <PasswordStrengthMeter password={password} />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="adduser-role" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Role
          </label>
          <select
            id="adduser-role"
            className={inputClass}
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="VIEWER">Viewer</option>
            <option value="OPERATOR">Operator</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>

        {error && (
          <div role="alert" className="rounded-md border border-red-200 bg-red-50 p-2 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300">
            {error}
          </div>
        )}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCloseAction}
            className="flex-1 rounded border border-gray-300 py-2 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="flex-1 rounded bg-blue-600 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isPending ? "Creating..." : "Create User"}
          </button>
        </div>
      </form>
    </DraggableModal>
  );
}