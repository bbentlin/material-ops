"use client";

import { useState, useTransition } from "react";
import DraggableModal from "./DraggableModal";

const inputClass = 
  "border border-gray-300 p-2 rounded-md text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 selection:bg-blue-200 selection:text-gray-900"

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
      <form action={handleSubmit} className="p-6 flex flex-col gap-3">
        <h2 className="text-lg font-bold text-gray-900 mb-2">Edit User</h2>
        <input
          placeholder="Name *"
          className={inputClass}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email *"
          className={inputClass}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password *"
          className={inputClass}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <select
          className={inputClass}
          value={role}
          onChange={(e) => setRole(e.target.value)}
          disabled={isSelf}
        >
          <option value="VIEWER">Viewer</option>
          <option value="OPERATOR">Operator</option>
          <option value="ADMIN">Administrator</option>
        </select>
        {isSelf && (
          <p className="text-xs text-gray-400">You cannot change your own role.</p>
        )}
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <div className="flex gap-2 mt-2">
          <button
            type="button"
            onClick={onCloseAction}
            className="flex-1 border border-gray-300 text-gray-700 py-2 rounded hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isPending ? "Saving..." : "Save" }
          </button>
        </div>
        {!isSelf && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={isPending}
            className="w-full text-sm text-red-500 hover:text-red-700 hover:bg-red-50 py-2 rounded transition-colors disabled:opacity-50 mt-1"
          >
            Delete User
          </button>
        )}
      </form>
    </DraggableModal>
  );
}