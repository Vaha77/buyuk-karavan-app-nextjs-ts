"use client";

import { useEffect, useState } from "react";

type Filial = {
  id: string;
  name: string;
  manzil: string;
  limit: number;
  _count: { tolovlar: number };
};

type Sotuvchi = {
  id: string;
  name: string;
  phone: string;
};

type Tolov = {
  id: string;
  sana: string;
  filialId: string;
  filial: { name: string };
  sotuvchiId: string;
  sotuvchi: { name: string };
  mijoz: string;
  summa: number;
  tolovTuri: string;
  izoh: string;
  createdAt: string;
};

const emptyForm = {
  sana: new Date().toISOString().split("T")[0],
  filialId: "",
  sotuvchiId: "",
  mijoz: "",
  summa: "",
  tolovTuri: "Naqd",
  izoh: "",
};

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

const AVATAR_COLORS = [
  { bg: "#EEEDFE", color: "#3C3489" },
  { bg: "#E1F5EE", color: "#085041" },
  { bg: "#FAEEDA", color: "#633806" },
  { bg: "#E6F1FB", color: "#0C447C" },
  { bg: "#FBEAF0", color: "#72243E" },
];

function getAvatarColor(name: string) {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
}

export default function KassaPage() {
  const [filiallar, setFiliallar] = useState<Filial[]>([]);
  const [sotuvchilar, setSotuvchilar] = useState<Sotuvchi[]>([]);
  const [tolovlar, setTolovlar] = useState<Tolov[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [showFilialForm, setShowFilialForm] = useState(false);
  const [filialForm, setFilialForm] = useState({ name: "", manzil: "", limit: "500000" });
  const [savingFilial, setSavingFilial] = useState(false);
  const [deleteTolov, setDeleteTolov] = useState<Tolov | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState("");

  async function loadAll() {
    const [f, s, t] = await Promise.all([
      fetch("/api/filial").then((r) => r.json()),
      fetch("/api/admin/users").then((r) => r.json()),
      fetch("/api/tolov").then((r) => r.json()),
    ]);
    setFiliallar(f);
    setSotuvchilar(s.filter((u: any) => u.role === "SELLER" || u.role === "ADMIN" || u.role === "SUPER_ADMIN"));
    setTolovlar(t);
  }

  useEffect(() => { loadAll(); }, []);

  const bugunTushum = tolovlar
    .filter((t) => new Date(t.createdAt).toDateString() === new Date().toDateString())
    .reduce((sum, t) => sum + t.summa, 0);

  const oylikTushum = tolovlar
    .filter((t) => {
      const d = new Date(t.createdAt);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((sum, t) => sum + t.summa, 0);

  const jami = tolovlar.reduce((sum, t) => sum + t.summa, 0);

  async function handleSubmit() {
    if (!form.filialId || !form.sotuvchiId || !form.mijoz || !form.summa) {
      setMessage("Barcha maydonlarni to'ldiring ❗");
      return;
    }
    if (saving) return;
    setSaving(true);
    setMessage("");
    const res = await fetch("/api/tolov", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setForm(emptyForm);
      setMessage("Saqlandi ✅");
      await loadAll();
    } else {
      setMessage("Xatolik ❌");
    }
    setSaving(false);
  }

  async function handleSaveFilial() {
    if (!filialForm.name.trim()) return;
    setSavingFilial(true);
    await fetch("/api/filial", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(filialForm),
    });
    setSavingFilial(false);
    setShowFilialForm(false);
    setFilialForm({ name: "", manzil: "", limit: "500000" });
    await loadAll();
  }

  async function handleDeleteTolov() {
    if (!deleteTolov) return;
    setDeleting(true);
    await fetch("/api/tolov", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: deleteTolov.id }),
    });
    setDeleting(false);
    setDeleteTolov(null);
    await loadAll();
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">

      {/* O'chirish modal */}
      {deleteTolov && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <div className="flex items-center justify-center w-12 h-12 bg-red-50 rounded-full mx-auto mb-4">
              <span className="text-2xl">🗑️</span>
            </div>
            <h3 className="text-base font-bold text-gray-900 text-center mb-2">O'chirishni tasdiqlang</h3>
            <p className="text-sm text-gray-500 text-center mb-1">
              <span className="font-semibold text-gray-700">{deleteTolov.mijoz}</span> — ${deleteTolov.summa}
            </p>
            <p className="text-xs text-gray-400 text-center mb-6">Bu to'lov o'chirilsa qaytarib bo'lmaydi!</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTolov(null)}
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold">
                Bekor
              </button>
              <button onClick={handleDeleteTolov} disabled={deleting}
                className="flex-1 py-3 bg-red-500 text-white rounded-xl text-sm font-semibold disabled:opacity-50">
                {deleting ? "O'chirilmoqda..." : "O'chirish"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filial qo'shish modal */}
      {showFilialForm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h3 className="text-base font-bold text-gray-900 mb-4">Yangi filial</h3>
            <div className="flex flex-col gap-3 mb-4">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Filial nomi</p>
                <input type="text" value={filialForm.name}
                  onChange={(e) => setFilialForm({ ...filialForm, name: e.target.value })}
                  placeholder="Masalan: 1-filial (Toshkent)"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gray-400" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Manzil</p>
                <input type="text" value={filialForm.manzil}
                  onChange={(e) => setFilialForm({ ...filialForm, manzil: e.target.value })}
                  placeholder="Shahar, ko'cha..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gray-400" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">6 oylik limit ($)</p>
                <input type="number" value={filialForm.limit}
                  onChange={(e) => setFilialForm({ ...filialForm, limit: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gray-400" />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={handleSaveFilial} disabled={savingFilial || !filialForm.name.trim()}
                className="flex-1 py-3 bg-gray-900 text-white rounded-xl text-sm font-semibold disabled:opacity-50">
                {savingFilial ? "Saqlanmoqda..." : "Saqlash"}
              </button>
              <button onClick={() => setShowFilialForm(false)}
                className="px-4 py-3 bg-gray-100 text-gray-600 rounded-xl text-sm font-semibold">
                Bekor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kassa</h1>
          <p className="text-sm text-gray-400 mt-1">To'lovlar va hisobot</p>
        </div>
        <button onClick={() => setShowFilialForm(true)}
          className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-xl text-sm font-semibold">
          + Filial qo'shish
        </button>
      </div>

      {/* Statistika */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-gray-50 rounded-2xl p-4">
          <p className="text-xs text-gray-400 mb-1">Bugungi tushum</p>
          <p className="text-xl font-bold text-green-600">${bugunTushum.toLocaleString()}</p>
        </div>
        <div className="bg-gray-50 rounded-2xl p-4">
          <p className="text-xs text-gray-400 mb-1">Bu oylik</p>
          <p className="text-xl font-bold text-gray-900">${oylikTushum.toLocaleString()}</p>
        </div>
        <div className="bg-gray-50 rounded-2xl p-4">
          <p className="text-xs text-gray-400 mb-1">Jami</p>
          <p className="text-xl font-bold text-gray-900">${jami.toLocaleString()}</p>
        </div>
      </div>

      {/* Filiallar */}
      {filiallar.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-2xl p-4 mb-6 shadow-sm">
          <p className="text-sm font-bold text-gray-900 mb-3">Filiallar</p>
          <div className="flex flex-col gap-3">
            {filiallar.map((f) => {
              const filialTushum = tolovlar
                .filter((t) => t.filialId === f.id)
                .reduce((sum, t) => sum + t.summa, 0);
              const foiz = Math.min((filialTushum / f.limit) * 100, 100);
              const color = foiz >= 80 ? "#1D9E75" : foiz >= 50 ? "#EF9F27" : "#E24B4A";
              return (
                <div key={f.id}>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-sm font-semibold text-gray-800">{f.name}</span>
                    <span className="text-xs text-gray-400">${filialTushum.toLocaleString()} / ${f.limit.toLocaleString()}</span>
                  </div>
                  <div className="bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div style={{ width: `${foiz}%`, background: color }} className="h-full rounded-full transition-all" />
                  </div>
                  <p className="text-xs mt-1" style={{ color }}>{Math.round(foiz)}% — ${(f.limit - filialTushum).toLocaleString()} qoldi</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Yangi to'lov */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4 mb-6 shadow-sm">
        <p className="text-sm font-bold text-gray-900 mb-4">Yangi to'lov kiritish</p>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Sana</p>
            <input type="date" value={form.sana}
              onChange={(e) => setForm({ ...form, sana: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-gray-400" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Filial</p>
            <select value={form.filialId}
              onChange={(e) => setForm({ ...form, filialId: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-gray-400 bg-white">
              <option value="">— Tanlang —</option>
              {filiallar.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Sotuvchi</p>
            <select value={form.sotuvchiId}
              onChange={(e) => setForm({ ...form, sotuvchiId: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-gray-400 bg-white">
              <option value="">— Tanlang —</option>
              {sotuvchilar.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Mijoz</p>
            <input type="text" value={form.mijoz}
              onChange={(e) => setForm({ ...form, mijoz: e.target.value })}
              placeholder="Mijoz ismi..."
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-gray-400" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Summa ($)</p>
            <input type="number" value={form.summa}
              onChange={(e) => setForm({ ...form, summa: e.target.value })}
              placeholder="0.00"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-gray-400" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">To'lov turi</p>
            <select value={form.tolovTuri}
              onChange={(e) => setForm({ ...form, tolovTuri: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-gray-400 bg-white">
              <option>Naqd</option>
              <option>Plastik</option>
              <option>Bank o'tkazma</option>
            </select>
          </div>
        </div>
        <div className="mb-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Izoh</p>
          <input type="text" value={form.izoh}
            onChange={(e) => setForm({ ...form, izoh: e.target.value })}
            placeholder="Qo'shimcha ma'lumot..."
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-gray-400" />
        </div>
        {message && (
          <p className={`text-xs font-medium mb-3 ${message.includes("❌") ? "text-red-500" : message.includes("✅") ? "text-green-600" : "text-gray-500"}`}>
            {message}
          </p>
        )}
        <button onClick={handleSubmit} disabled={saving}
          className="w-full py-3 bg-gray-900 text-white rounded-xl text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed">
          {saving ? "Saqlanmoqda..." : "+ Saqlash"}
        </button>
      </div>

      {/* So'nggi to'lovlar */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
        <p className="text-sm font-bold text-gray-900 mb-4">So'nggi to'lovlar</p>
        {tolovlar.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-3xl mb-2">💵</p>
            <p className="text-gray-400 text-sm">Hali to'lov yo'q</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {tolovlar.map((t) => {
              const avatarColor = getAvatarColor(t.sotuvchi.name);
              return (
                <div key={t.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div style={{ background: avatarColor.bg, color: avatarColor.color }}
                    className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {getInitials(t.sotuvchi.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <p className="text-sm font-semibold text-gray-900">{t.sotuvchi.name}</p>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">{t.filial.name}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-700">{t.tolovTuri}</span>
                    </div>
                    <p className="text-xs text-gray-400">Mijoz: {t.mijoz}{t.izoh ? ` · ${t.izoh}` : ""}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-green-600">+${t.summa.toLocaleString()}</p>
                    <p className="text-xs text-gray-400">{new Date(t.createdAt).toLocaleDateString("uz-UZ")}</p>
                  </div>
                  <button onClick={() => setDeleteTolov(t)}
                    className="text-red-400 hover:text-red-600 transition ml-1 flex-shrink-0">
                    🗑️
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}