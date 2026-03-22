"use client";

import { useState, useTransition } from "react";
import DraggableModal from "./DraggableModal";

const inputClass =
  "border border-gray-300 p-2 rounded-md text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 selection:bg-blue-200 selection:text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-500";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export default function EditUserModal({
  user,
  currentUserId,
  onCloseAction,
  onSuccessAction,
}: {
  user: User;
  currentUserId: string;
  onCloseAction: () => void;
  onSuccessAction: () => void;
}) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [role, setRole] = useState(user.role);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const isSelf = user.id === currentUserId;

  function handleSubmit() {
    startTransition(async () => {
      setError("");
      const body: Record<string, string> = { name, email, role };
      if (password) body.password = password;

      const res = await fetch(`/api/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        onSuccessAction();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to update user");
      }
    });
  }

  function handleDelete() {
    if (!confirm(`Are you sure you want to delete user "${user.name}"?`)) return;
    startTransition(async () => {
      setError("");
      const res = await fetch(`/api/users/${user.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        onSuccessAction();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to delete user");
      }
    });
  }

  return (
    <DraggableModal className="w-96">
      <form action={handleSubmit} className="p-6 flex flex-col gap-4">
        <h2 className="text-lg font-bold text-gray-900 mb-1 dark:text-gray-100">Edit User</h2>

        <div className="flex flex-col gap-1">
          <label htmlFor="edituser-name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            id="edituser-name"
            placeholder="e.g. John Doe"
            className={inputClass}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="edituser-email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            id="edituser-email"
            type="email"
            placeholder="e.g. john@example.com"
            className={inputClass}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="edituser-password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            New Password
          </label>
          <input
            id="edituser-password"
            type="password"
            placeholder="Leave blank to keep current"
            className={inputClass}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="edituser-role" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Role
          </label>
          <select
            id="edituser-role"
            className={`${inputClass} ${isSelf ? "opacity-50 cursor-not-allowed" : ""}`}
            value={role}
            onChange={(e) => setRole(e.target.value)}
            disabled={isSelf}
          >
            <option value="VIEWER">Viewer</option>
            <option value="OPERATOR">Operator</option>
            <option value="ADMIN">Admin</option>
          </select>
          {isSelf && (
            <p className="text-xs text-gray-400 dark:text-gray-500">You cannot change your own role.</p>
          )}
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
            {isPending ? "Saving..." : "Save"}
          </button>
        </div>
        {!isSelf && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={isPending}
            className="w-full text-sm text-red-500 hover:text-red-700 hover:bg-red-50 py-2 rounded transition-colors disabled:opacity-50 mt-1 dark:hover:bg-red-900/30"
          >
            Delete User
          </button>
        )}
      </form>
    </DraggableModal>
  );
}