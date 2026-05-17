"use client";

import { useEffect, useState } from "react";

type User = {
  id: string;
  name: string;
  phone: string;
  role: string;
  status: string;
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);

  async function fetchUsers() {
    const res = await fetch("/api/admin/users");
    const data = await res.json();
    setUsers(data);
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  async function changeRole(userId: string, newRole: string) {
    await fetch("/api/admin/update-user-role", {
      method: "POST",
      body: JSON.stringify({ userId, role: newRole }),
    });

    fetchUsers();
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Foydalanuvchilar</h1>

      <div className="space-y-4">
        {users.map((user) => (
          <div
            key={user.id}
            className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div>
              <h2 className="font-semibold text-lg">{user.name}</h2>
              <p className="text-sm text-gray-500">{user.phone}</p>
            </div>

            <div className="flex items-center gap-4">
              <span
                className={`px-3 py-1 text-xs font-bold rounded-full ${
                  user.status === "ACTIVE"
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {user.status}
              </span>

              <select
                value={user.role}
                onChange={(e) => changeRole(user.id, e.target.value)}
                className="cursor-pointer rounded-full border border-slate-200 bg-slate-950 px-2 py-2 text-sm font-semibold text-white shadow-sm outline-none transition hover:bg-slate-800 focus:ring-2 focus:ring-blue-500"
              >
                <option value="SUPER_ADMIN">Super Admin</option>
                <option value="ADMIN">Admin</option>
                <option value="MANAGER">Manager</option>
                <option value="SELLER">Sotuvchi</option>
                <option value="VIEWER">Viewer</option>
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}