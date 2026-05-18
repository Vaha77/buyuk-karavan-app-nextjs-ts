"use client";

import { useEffect, useState } from "react";

type User = {
  id: string;
  name: string;
  phone: string;
  role: string;
  status: string;
  password: string;
  salesLimit: number | null;
};

const ROLE_COLORS: Record<string, { bg: string; color: string }> = {
  SUPER_ADMIN: { bg: "#EEEDFE", color: "#3C3489" },
  ADMIN: { bg: "#E6F1FB", color: "#0C447C" },
  MANAGER: { bg: "#E1F5EE", color: "#085041" },
  SELLER: { bg: "#FAEEDA", color: "#633806" },
  VIEWER: { bg: "#F1EFE8", color: "#444441" },
};

const AVATAR_COLORS = [
  { bg: "#EEEDFE", color: "#3C3489" },
  { bg: "#E1F5EE", color: "#085041" },
  { bg: "#FAEEDA", color: "#633806" },
  { bg: "#E6F1FB", color: "#0C447C" },
  { bg: "#FBEAF0", color: "#72243E" },
  { bg: "#FAECE7", color: "#712B13" },
];

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function getAvatarColor(name: string) {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [deleteModal, setDeleteModal] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [limitModal, setLimitModal] = useState<User | null>(null);
  const [limitValue, setLimitValue] = useState("");
  const [savingLimit, setSavingLimit] = useState(false);

  async function loadUsers() {
    const res = await fetch("/api/admin/users");
    setUsers(await res.json());
  }

  useEffect(() => { loadUsers(); }, []);

  function togglePassword(id: string) {
    setVisiblePasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  async function changeRole(userId: string, newRole: string) {
    await fetch("/api/admin/update-user-role", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, role: newRole }),
    });
    loadUsers();
  }

  async function handleDelete() {
    if (!deleteModal) return;
    setDeleting(true);
    await fetch("/api/admin/delete-user", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: deleteModal.id }),
    });
    setDeleting(false);
    setDeleteModal(null);
    loadUsers();
  }

  async function handleSaveLimit() {
    if (!limitModal) return;
    setSavingLimit(true);
    await fetch("/api/admin/update-user-role", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: limitModal.id,
        role: limitModal.role,
        salesLimit: limitValue === "" ? null : Number(limitValue),
      }),
    });
    setSavingLimit(false);
    setLimitModal(null);
    setLimitValue("");
    loadUsers();
  }

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">

      {/* O'chirish modal */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <div className="flex items-center justify-center w-12 h-12 bg-red-50 rounded-full mx-auto mb-4">
              <span className="text-2xl">🗑️</span>
            </div>
            <h3 className="text-base font-bold text-gray-900 text-center mb-2">O'chirishni tasdiqlang</h3>
            <p className="text-sm text-gray-500 text-center mb-1">
              <span className="font-semibold text-gray-700">{deleteModal.name}</span>
            </p>
            <p className="text-xs text-gray-400 text-center mb-6">Bu foydalanuvchi o'chirilsa qaytarib bo'lmaydi!</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteModal(null)}
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold">
                Bekor
              </button>
              <button onClick={handleDelete} disabled={deleting}
                className="flex-1 py-3 bg-red-500 text-white rounded-xl text-sm font-semibold disabled:opacity-50">
                {deleting ? "O'chirilmoqda..." : "O'chirish"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Limit modal */}
      {limitModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h3 className="text-base font-bold text-gray-900 mb-1">Limit belgilash</h3>
            <p className="text-sm text-gray-500 mb-4">{limitModal.name}</p>
            <div className="mb-3">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                Oylik limit ($) — bo'sh qoldiring = limitsiz
              </p>
              <input
                type="number"
                value={limitValue}
                onChange={(e) => setLimitValue(e.target.value)}
                placeholder="Masalan: 50000 — bo'sh = limitsiz"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gray-400"
              />
            </div>
            <div className="flex gap-2 mb-3">
              {[10000, 25000, 50000, 100000].map((v) => (
                <button key={v} onClick={() => setLimitValue(String(v))}
                  className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-200">
                  ${v/1000}k
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={handleSaveLimit} disabled={savingLimit}
                className="flex-1 py-3 bg-gray-900 text-white rounded-xl text-sm font-semibold disabled:opacity-50">
                {savingLimit ? "Saqlanmoqda..." : "Saqlash"}
              </button>
              <button onClick={() => { setLimitModal(null); setLimitValue(""); }}
                className="px-4 py-3 bg-gray-100 text-gray-600 rounded-xl text-sm font-semibold">
                Bekor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Foydalanuvchilar</h1>
        <p className="text-sm text-gray-400 mt-1">{users.length} ta foydalanuvchi</p>
      </div>

      {/* Users list */}
      <div className="flex flex-col gap-3">
        {users.map((user) => {
          const avatarColor = getAvatarColor(user.name);
          const roleColor = ROLE_COLORS[user.role] || ROLE_COLORS.VIEWER;
          const isPasswordVisible = visiblePasswords[user.id];

          return (
            <div key={user.id}
              className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div style={{ background: avatarColor.bg, color: avatarColor.color }}
                  className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {getInitials(user.name)}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                    <span style={{ background: roleColor.bg, color: roleColor.color }}
                      className="text-xs font-semibold px-2 py-0.5 rounded-full">
                      {user.role.replace("_", " ")}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-50 text-green-700">
                      {user.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mb-2">{user.phone}</p>

                  {/* Parol */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs">🔑</span>
                    <span className="text-xs text-gray-500 font-mono tracking-widest">
                      {isPasswordVisible ? user.password : "••••••••"}
                    </span>
                    <button onClick={() => togglePassword(user.id)}
                      className="text-gray-400 hover:text-gray-600 transition text-sm">
                      {isPasswordVisible ? "🙈" : "👁️"}
                    </button>
                  </div>

                  {/* Limit */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs">📊</span>
                    {user.salesLimit ? (
                      <span className="text-xs font-semibold text-blue-600">
                        Limit: ${user.salesLimit.toLocaleString()}/oy
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">Limitsiz</span>
                    )}
                    <button onClick={() => { setLimitModal(user); setLimitValue(user.salesLimit ? String(user.salesLimit) : ""); }}
                      className="text-xs text-blue-500 hover:text-blue-700 font-medium">
                      ✏️
                    </button>
                  </div>
                </div>

                {/* Amallar */}
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <select value={user.role}
                    onChange={(e) => changeRole(user.id, e.target.value)}
                    className="text-xs px-2 py-2 border border-gray-200 rounded-xl bg-gray-50 text-gray-700 cursor-pointer focus:outline-none">
                    <option value="SUPER_ADMIN">Super Admin</option>
                    <option value="ADMIN">Admin</option>
                    <option value="MANAGER">Manager</option>
                    <option value="SELLER">Sotuvchi</option>
                    <option value="VIEWER">Viewer</option>
                  </select>
                  <button onClick={() => setDeleteModal(user)}
                    className="text-xs px-3 py-2 bg-red-50 text-red-500 rounded-xl border border-red-100 font-semibold hover:bg-red-100 transition flex items-center justify-center gap-1">
                    🗑️ O'chir
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}