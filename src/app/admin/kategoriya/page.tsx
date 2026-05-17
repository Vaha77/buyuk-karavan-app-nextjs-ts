"use client";

import { useEffect, useState } from "react";

interface Kategoriya {
  id: string;
  name: string;
  slug: string;
  icon: string;
  _count: { mahsulotlar: number };
}

const IKONKALAR = [
  "📦", "⚙️", "🔧", "❄️", "💨", "🌡️", "🔩", "🛢️", "⚡", "🏭",
];

export default function KategoriyaPage() {
  const [kategoriyalar, setKategoriyalar] = useState<Kategoriya[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("📦");
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    const res = await fetch("/api/kategoriya");
    const data = await res.json();
    setKategoriyalar(data);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const openAdd = () => {
    setEditId(null);
    setName("");
    setIcon("📦");
    setShowForm(true);
  };

  const openEdit = (k: Kategoriya) => {
    setEditId(k.id);
    setName(k.name);
    setIcon(k.icon || "📦");
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    if (editId) {
      await fetch("/api/kategoriya", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editId, name, icon }),
      });
    } else {
      await fetch("/api/kategoriya", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, icon }),
      });
    }
    setSaving(false);
    setShowForm(false);
    fetchData();
  };

  const handleDelete = async (id: string, mahsulotCount: number) => {
    if (mahsulotCount > 0) {
      alert("Bu kategoriyada mahsulotlar bor! Avval mahsulotlarni o'chiring.");
      return;
    }
    if (!confirm("O'chirilsinmi?")) return;
    await fetch("/api/kategoriya", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchData();
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kategoriyalar</h1>
          <p className="text-sm text-gray-500 mt-1">
            Mahsulot kategoriyalarini boshqaring
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-xl font-semibold hover:bg-gray-700 transition"
        >
          + Yangi kategoriya
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold mb-4">
              {editId ? "Kategoriyani tahrirlash" : "Yangi kategoriya"}
            </h2>

            {/* Icon tanlash */}
            <div className="mb-4">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
                Ikonka
              </label>
              <div className="flex flex-wrap gap-2">
                {IKONKALAR.map((i) => (
                  <button
                    key={i}
                    onClick={() => setIcon(i)}
                    className={`text-2xl p-2 rounded-xl border-2 transition ${
                      icon === i
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    {i}
                  </button>
                ))}
              </div>
            </div>

            {/* Nom */}
            <div className="mb-6">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
                Kategoriya nomi
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Masalan: Kompressorlar"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400"
                onKeyDown={(e) => e.key === "Enter" && handleSave()}
                autoFocus
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSave}
                disabled={saving || !name.trim()}
                className="flex-1 bg-gray-900 text-white rounded-xl py-3 font-semibold hover:bg-gray-700 transition disabled:opacity-50"
              >
                {saving ? "Saqlanmoqda..." : "Saqlash"}
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-3 bg-gray-100 text-gray-600 rounded-xl font-semibold hover:bg-gray-200 transition"
              >
                Bekor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="text-center py-20 text-gray-400">Yuklanmoqda...</div>
      ) : kategoriyalar.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">📂</div>
          <p className="text-gray-500">Hali kategoriya yo'q</p>
          <button
            onClick={openAdd}
            className="mt-4 text-blue-600 font-semibold hover:underline"
          >
            Birinchi kategoriyani yarating
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {kategoriyalar.map((k) => (
            <div
              key={k.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3 hover:shadow-md transition"
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">{k.icon || "📦"}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-gray-900 truncate">{k.name}</div>
                  <div className="text-xs text-gray-400">{k.slug}</div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs bg-blue-50 text-blue-600 font-semibold px-3 py-1 rounded-full">
                  {k._count.mahsulotlar} mahsulot
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEdit(k)}
                    className="text-xs px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
                  >
                    ✏️ Tahrir
                  </button>
                  <button
                    onClick={() => handleDelete(k.id, k._count.mahsulotlar)}
                    className="text-xs px-3 py-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition font-medium"
                  >
                    🗑️ O'chir
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}