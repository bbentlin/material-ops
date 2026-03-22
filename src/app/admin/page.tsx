"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AddUserModal from "@/components/AddUserModal";
import EditUserModal from "@/components/EditUserModal";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
};

type CurrentUser = {
  id: string;
  name: string;
  email: string;
  role: string;
};

const roleBadge: Record<string, string> = {
  ADMIN: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200",
  OPERATOR: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200",
  VIEWER: "bg-gray-100 text-gray-600 dark:bg-gray-900 dark:text-blue-200",
};

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddUser, setShowAddUser] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [search, setSearch] = useState("");
  const router = useRouter();

  function fetchUsers() {
    fetch("/api/users")
      .then((res) => {
        if (res.status === 401 || res.status === 403) {
          router.push("/dashboard");
          throw new Error("Unauthorized");
        }
        if (!res.ok) throw new Error("Failed to fetch users");
        return res.json();
      })
      .then(setUsers)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  function fetchCurrentUser() {
    fetch("/api/auth/me")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch current user");
        return res.json();
      })
      .then(setCurrentUser)
      .catch(() => {});
  }

  useEffect(() => {
    fetchUsers();
    fetchCurrentUser();
  }, []);

  const filteredUsers = users.filter((user) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return(
      user.name.toLowerCase().includes(q) ||
      user.email.toLowerCase().includes(q) ||
      user.role.toLowerCase().includes(q)
    );
  });

  if (loading) {
    return(
      <div className="min-h-screen bg-gray-100 flex items-center justify-center dark:bg-gray-900">
        <div className="text-gray-500 text-lg dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/dashboard")}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors dark:text-gray-400 dark:hover:text-gray-200"
            >
              ⬅ Back to Dashboard
            </button>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">👥 User Management</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700 dark:placeholder-gray-500 dark:focus:ring-blue-400"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-100 dark:hover:text-gray-300"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6 dark:bg-red-900/30 dark:border-red-800 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Users</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{users.length}</div>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Admins</div>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-100">
              {users.filter((u) => u.role === "ADMIN").length}
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Operators</div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-100">
              {users.filter((u) => u.role === "OPERATOR").length}
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Viewers</div>
            <div className="text-2xl font-bold text-gray-600 dark:text-gray-100">
              {users.filter((u) => u.role === "VIEWER").length}
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden dark:bg-gray-800 dark:border-gray-700">
          <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Users</h2>
            <button
              onClick={() => setShowAddUser(true)}
              className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              + Add User
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 dark:bg-gray-700/50 dark:text-gray-400 uppercase tracking-wider">
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">Email</th>
                  <th className="px-5 py-3">Role</th>
                  <th className="px-5 py-3">Created</th>
                  <th className="px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-5 py-4 font-medium text-gray-900 dark:text-gray-100">
                      <div className="flex items-center gap-2">
                        {user.name}
                        {currentUser?.id === user.id && (
                          <span className="text-xs text-gray-400 font-normal">(you)</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-500 dark:text-gray-400 text-sm">{user.email}</td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full ${
                          roleBadge[user.role] || "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm tex-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => setEditUser(user)}
                        className="text-sm font-medium bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors"
                      >
                        ✏️ Edit
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center text-gray-400 dark:text-gray-500">
                      {search ? `No users matching "${search}"` : "No users found."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Add User Modal */}
      {showAddUser && (
        <AddUserModal
          onCloseAction={() => setShowAddUser(false)}
          onSuccessAction={() => {
            setShowAddUser(false);
            fetchUsers();
          }}
        />
      )}

      {/* Edit User Modal */}
      {editUser && currentUser && (
        <EditUserModal
          user={editUser}
          currentUserId={currentUser.id}
          onCloseAction={() => setEditUser(null)}
          onSuccessAction={() => {
            setEditUser(null);
            fetchUsers();
          }}
        />
      )}
    </div>
  );
}