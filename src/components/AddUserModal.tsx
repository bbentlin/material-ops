"use client";

import { useState, useTransition } from "react";
import DraggableModal from "./DraggableModal";

const inputClass =
  "border border-gray-300 p-2 rounded-md text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 selection:bg-blue-200 selection:text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-500";

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
    <DraggableModal className="w-96">
      <form action={handleSubmit} className="p-6 flex flex-col gap-4">
        <h2 className="text-lg font-bold text-gray-900 mb-1 dark:text-gray-100">Add New User</h2>

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

        {error && <div className="text-red-600 text-sm">{error}</div>}
        <div className="flex gap-2 mt-1">
          <button
            type="button"
            onClick={onCloseAction}
            className="flex-1 border border-gray-300 text-gray-700 py-2 rounded hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isPending ? "Creating..." : "Create User"}
          </button>
        </div>
      </form>
    </DraggableModal>
  );
}