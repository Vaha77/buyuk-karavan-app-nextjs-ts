"use client";

import { useEffect, useState } from "react";

interface Kategoriya {
  id: string;
  name: string;
  slug: string;
  icon: string;
  parentId?: string | null;
  children?: Kategoriya[];
  _count: { mahsulotlar: number };
}

const IKONKALAR = [
  "📦", "⚙️", "🔧", "❄️", "💨", "🌡️", "🔩", "🛢️", "⚡", "🏭",
];

export default function KategoriyaPage() {
  const [kategoriyalar, setKategoriyalar] = useState<Kategoriya[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [deleteModal, setDeleteModal] = useState<Kategoriya | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("📦");
  const [parentId, setParentId] = useState<string>("");
  const [selectedForAssign, setSelectedForAssign] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

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
    setParentId("");
    setShowForm(true);
  };

  const openEdit = (k: Kategoriya) => {
    setEditId(k.id);
    setName(k.name);
    setIcon(k.icon || "📦");
    setParentId(k.parentId || "");
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    if (editId) {
      await fetch("/api/kategoriya", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editId, name, icon, parentId: parentId || null }),
      });
    } else {
      await fetch("/api/kategoriya", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, icon, parentId: parentId || null }),
      });
    }
    setSaving(false);
    setShowForm(false);
    fetchData();
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    const hasProducts = deleteModal._count.mahsulotlar > 0;
    const hasChildren = deleteModal.children && deleteModal.children.length > 0;
    if (hasProducts || hasChildren) {
      setDeleteModal(null);
      return;
    }
    setDeleting(true);
    await fetch("/api/kategoriya", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: deleteModal.id }),
    });
    setDeleting(false);
    setDeleteModal(null);
    fetchData();
  };

  const handleAssignExisting = async () => {
    if (!parentId.trim() || selectedForAssign.length === 0) return;
    setSaving(true);
    for (const katId of selectedForAssign) {
      await fetch("/api/kategoriya", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: katId, parentId }),
      });
    }
    setSaving(false);
    setShowAssignForm(false);
    setParentId("");
    setSelectedForAssign([]);
    fetchData();
  };

  const openAssignForm = () => {
    setParentId("");
    setSelectedForAssign([]);
    setShowAssignForm(true);
  };

  const toggleCategorySelect = (katId: string) => {
    setSelectedForAssign(prev =>
      prev.includes(katId) ? prev.filter(id => id !== katId) : [...prev, katId]
    );
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">

      {/* O'chirish modal */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <div className="flex items-center justify-center w-12 h-12 bg-red-50 rounded-full mx-auto mb-4">
              <span className="text-2xl">🗑️</span>
            </div>
            {deleteModal._count.mahsulotlar > 0 || (deleteModal.children && deleteModal.children.length > 0) ? (
              <>
                <h3 className="text-base font-bold text-gray-900 text-center mb-2">
                  O'chirib bo'lmaydi!
                </h3>
                <p className="text-sm text-gray-500 text-center mb-6">
                  <span className="font-semibold text-gray-700">{deleteModal.name}</span> kategoriyasida{" "}
                  {deleteModal._count.mahsulotlar > 0 && (
                    <span><span className="font-bold text-red-500">{deleteModal._count.mahsulotlar} ta mahsulot</span> bor. </span>
                  )}
                  {deleteModal.children && deleteModal.children.length > 0 && (
                    <span><span className="font-bold text-red-500">{deleteModal.children.length} ta sub-kategoriya</span> bor. </span>
                  )}
                  Avval o'chirib tashlang!
                </p>
                <button
                  onClick={() => setDeleteModal(null)}
                  className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold"
                >
                  Tushunarli
                </button>
              </>
            ) : (
              <>
                <h3 className="text-base font-bold text-gray-900 text-center mb-2">
                  O'chirishni tasdiqlang
                </h3>
                <p className="text-sm text-gray-500 text-center mb-1">
                  <span className="font-semibold text-gray-700">{deleteModal.name}</span>
                </p>
                <p className="text-xs text-gray-400 text-center mb-6">
                  Bu kategoriya o'chirilsa qaytarib bo'lmaydi!
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setDeleteModal(null)}
                    className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold"
                  >
                    Bekor
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex-1 py-3 bg-red-500 text-white rounded-xl text-sm font-semibold disabled:opacity-50"
                  >
                    {deleting ? "O'chirilmoqda..." : "O'chirish"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kategoriyalar</h1>
          <p className="text-sm text-gray-500 mt-1">
            Mahsulot kategoriyalarini boshqaring
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={openAssignForm}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-blue-700 transition"
          >
            📌 Mavjud kategoriyani qo'shish
          </button>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-xl font-semibold hover:bg-gray-700 transition"
          >
            + Yangi kategoriya
          </button>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold mb-4">
              {editId ? "Kategoriyani tahrirlash" : "Yangi kategoriya"}
            </h2>

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

            <div className="mb-4">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
                Ata kategoriya (ixtiyoriy)
              </label>
              <select
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400"
              >
                <option value="">— Asosiy kategoriya —</option>
                {kategoriyalar
                  .filter((k) => !k.parentId && k.id !== editId)
                  .map((k) => (
                    <option key={k.id} value={k.id}>
                      {k.name}
                    </option>
                  ))}
              </select>
            </div>

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

      {/* Assign Existing Category Modal */}
      {showAssignForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold mb-4">Mavjud kategoriyani sub-kategoriya qiling</h2>

            <div className="mb-4">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
                Ata kategoriya (parent)
              </label>
              <select
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400"
              >
                <option value="">— Tanlang —</option>
                {kategoriyalar
                  .filter((k) => !k.parentId)
                  .map((k) => (
                    <option key={k.id} value={k.id}>
                      {k.name}
                    </option>
                  ))}
              </select>
            </div>

            <div className="mb-6">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 block">
                Sub-kategoriyalar (ko'pchta tanlash mumkin)
              </label>
              <div className="space-y-2 max-h-60 overflow-y-auto border border-gray-200 rounded-xl p-3">
                {kategoriyalar
                  .filter((k) => !k.parentId && k.id !== parentId)
                  .map((k) => (
                    <label key={k.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                      <input
                        type="checkbox"
                        checked={selectedForAssign.includes(k.id)}
                        onChange={() => toggleCategorySelect(k.id)}
                        className="w-4 h-4 rounded border-gray-300"
                      />
                      <span className="text-sm">{k.icon} {k.name}</span>
                    </label>
                  ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleAssignExisting}
                disabled={saving || !parentId.trim() || selectedForAssign.length === 0}
                className="flex-1 bg-blue-600 text-white rounded-xl py-3 font-semibold hover:bg-blue-700 transition disabled:opacity-50"
              >
                {saving ? "Qo'shilmoqda..." : `Qo'shish (${selectedForAssign.length})`}
              </button>
              <button
                onClick={() => setShowAssignForm(false)}
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
        <div className="space-y-2">
          {kategoriyalar
            .filter((k) => !k.parentId)
            .map((mainCat) => (
              <div key={mainCat.id}>
                {/* Main category */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3 hover:shadow-md transition">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{mainCat.icon || "📦"}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-gray-900 truncate">{mainCat.name}</div>
                      <div className="text-xs text-gray-400">{mainCat.slug}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                      mainCat._count.mahsulotlar > 0
                        ? "bg-blue-50 text-blue-600"
                        : "bg-gray-100 text-gray-400"
                    }`}>
                      {mainCat._count.mahsulotlar} mahsulot
                      {mainCat.children && mainCat.children.length > 0 && (
                        <span className="ml-1">· {mainCat.children.length} sub-kategoriya</span>
                      )}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(mainCat)}
                        className="text-xs px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
                      >
                        ✏️ Tahrir
                      </button>
                      <button
                        onClick={() => setDeleteModal(mainCat)}
                        className="text-xs px-3 py-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition font-medium"
                      >
                        🗑️ O'chir
                      </button>
                    </div>
                  </div>
                </div>

                {/* Sub-categories */}
                {mainCat.children && mainCat.children.length > 0 && (
                  <div className="ml-6 space-y-2 mt-2">
                    {mainCat.children.map((subCat) => (
                      <div
                        key={subCat.id}
                        className="bg-gray-50 rounded-lg border border-gray-100 p-4 flex flex-col gap-2 hover:shadow-sm transition"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{subCat.icon || "📦"}</span>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-gray-800 truncate">{subCat.name}</div>
                            <div className="text-xs text-gray-400">{subCat.slug}</div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            subCat._count.mahsulotlar > 0
                              ? "bg-blue-50 text-blue-600"
                              : "bg-gray-100 text-gray-400"
                          }`}>
                            {subCat._count.mahsulotlar} mahsulot
                          </span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => openEdit(subCat)}
                              className="text-xs px-2.5 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition font-medium"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => setDeleteModal(subCat)}
                              className="text-xs px-2.5 py-1 bg-red-100 text-red-500 rounded hover:bg-red-200 transition font-medium"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
        </div>
      )}
    </div>
  );
}