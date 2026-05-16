"use client";

import { useEffect, useState } from "react";

type User = {
  id: string;
  name: string;
  phone: string;
  role: string;
  status: string;
};

export default function PendingUsers() {
  const [users, setUsers] = useState<User[]>([]);

  async function loadUsers() {
    const res = await fetch("/api/admin/pending-users");
    const data = await res.json();
    setUsers(data);
  }

  async function approveUser(id: string) {
    await fetch("/api/admin/approve-user", {
      method: "POST",
      body: JSON.stringify({ id }),
    });

    loadUsers();
  }
  async function rejectUser(id: string) {
  await fetch("/api/admin/reject-user", {
    method: "POST",
    body: JSON.stringify({ id }),
  });

  loadUsers();
}

  useEffect(() => {
    loadUsers();
  }, []);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Tasdiq kutayotganlar</h1>

      <div className="space-y-4">
        {users.map((user) => (
          <div
            key={user.id}
            className="flex items-center justify-between rounded-2xl bg-white p-5 shadow-sm"
          >
            <div>
              <p className="font-semibold">{user.name}</p>
              <p className="text-sm text-slate-500">{user.phone}</p>
              <p className="mt-1 text-xs text-orange-600">{user.status}</p>
            </div>

     <div className="flex gap-3">
  <button
    onClick={() => approveUser(user.id)}
    className="rounded-xl bg-green-600 px-4 py-2 font-semibold text-white"
  >
    Tasdiqlash
  </button>

  <button
    onClick={() => rejectUser(user.id)}
    className="rounded-xl bg-red-600 px-4 py-2 font-semibold text-white"
  >
    Rad etish
  </button>
</div>
          </div>
        ))}

        {users.length === 0 && (
          <p className="rounded-2xl bg-white p-5 text-slate-500">
            Tasdiq kutayotgan foydalanuvchi yo‘q
          </p>
        )}
      </div>
    </div>
  );
}