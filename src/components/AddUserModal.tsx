"use client";

import { useState, useTransition } from "react";
import DraggableModal from "./DraggableModal";

const inputClass = 
  "border border-gray-300 p-2 rounded-md text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 selection:bg-blue-200 selection:text-gray-900";

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
      <form action={handleSubmit} className="p-6 flex flex-col gap-3">
        <h2 className="text-lg font-bold text-gray-900 mb-2">Add New User</h2>
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
          required
        />
        <select
          className={inputClass}
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="VIEWER">Viewer</option>
          <option value="OPERATOR">Operator</option>
          <option value="ADMIN">Administrator</option>
        </select>
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
            {isPending ? "Creating..." : "Create User"}
          </button>
        </div>
      </form>
    </DraggableModal>
  );
}