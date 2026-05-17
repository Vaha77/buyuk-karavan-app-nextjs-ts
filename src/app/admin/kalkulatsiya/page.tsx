"use client";

import { useEffect, useState, useRef } from "react";

type User = {
  role: "SUPER_ADMIN" | "ADMIN" | "MANAGER" | "SELLER" | "VIEWER";
};

type Kategoriya = {
  id: string;
  name: string;
};

type Komplekt = {
  id: string;
  name: string;
  image: string;
  source: string;
  modelCode: string;
  fan: string;
  nerj: string;
  truba: string;
  extras: string[];
  priceUsd: number;
  description: string;
  categoryId: string | null;
  category: Kategoriya | null;
};

const emptyForm = {
  name: "",
  image: "",
  source: "br",
  modelCode: "",
  fan: "",
  nerj: "",
  truba: "",
  extras: [] as string[],
  priceUsd: "",
  description: "",
  categoryId: "",
};

export default function KalkulatsiyaPage() {
  const [user, setUser] = useState<User | null>(null);
  const [komplektlar, setKomplektlar] = useState<Komplekt[]>([]);
  const [kategoriyalar, setKategoriyalar] = useState<Kategoriya[]>([]);
  const [source, setSource] = useState("all");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [showKatForm, setShowKatForm] = useState(false);
  const [editItem, setEditItem] = useState<Komplekt | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [newKatName, setNewKatName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("bk_user");
    if (saved) setUser(JSON.parse(saved));
  }, []);

  async function loadKategoriyalar() {
    const res = await fetch("/api/kategoriya");
    const data = await res.json();
    setKategoriyalar(data);
  }

  async function loadKomplektlar() {
    const params = new URLSearchParams();
    if (source !== "all") params.set("source", source);
    if (search) params.set("search", search);
    if (categoryFilter !== "all") params.set("categoryId", categoryFilter);
    const res = await fetch("/api/komplekt?" + params.toString());
    const data = await res.json();
    setKomplektlar(data);
  }

  useEffect(() => {
    loadKategoriyalar();
  }, []);

  useEffect(() => {
    loadKomplektlar();
  }, [source, search, categoryFilter]);

  const isSuperAdmin = user?.role === "SUPER_ADMIN";

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (data.url) setForm((f) => ({ ...f, image: data.url }));
    setUploading(false);
  }

  function openAddForm() {
    setEditItem(null);
    setForm(emptyForm);
    setMessage("");
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function openEditForm(k: Komplekt) {
    setEditItem(k);
    setForm({
      name: k.name,
      image: k.image,
      source: k.source,
      modelCode: k.modelCode,
      fan: k.fan,
      nerj: k.nerj,
      truba: k.truba,
      extras: k.extras || [],
      priceUsd: String(k.priceUsd),
      description: k.description,
      categoryId: k.categoryId || "",
    });
    setMessage("");
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { setMessage("Nomi kiritilmagan ❗"); return; }
    if (!form.priceUsd) { setMessage("Narx kiritilmagan ❗"); return; }
    if (!form.image) { setMessage("Rasm yuklanmagan ❗"); return; }

    const body = {
      ...(editItem ? { id: editItem.id } : {}),
      ...form,
      categoryId: form.categoryId || null,
    };

    const res = await fetch("/api/komplekt", {
      method: editItem ? "PUT" : "POST",
      body: JSON.stringify(body),
    });

    if (res.ok) {
      setMessage(editItem ? "Yangilandi ✅" : "Qo'shildi ✅");
      setForm(emptyForm);
      setEditItem(null);
      setShowForm(false);
      await loadKomplektlar();
    } else {
      setMessage("Xatolik ❌");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("O'chirishni tasdiqlaysizmi?")) return;
    const res = await fetch("/api/komplekt", {
      method: "DELETE",
      body: JSON.stringify({ id }),
    });
    if (res.ok) await loadKomplektlar();
  }

  async function handleAddKategoriya() {
    if (!newKatName.trim()) return;
    await fetch("/api/kategoriya", {
      method: "POST",
      body: JSON.stringify({ name: newKatName }),
    });
    setNewKatName("");
    await loadKategoriyalar();
  }

  async function handleDeleteKategoriya(id: string) {
    if (!confirm("Kategoriyani o'chirishni tasdiqlaysizmi?")) return;
    await fetch("/api/kategoriya", {
      method: "DELETE",
      body: JSON.stringify({ id }),
    });
    await loadKategoriyalar();
  }

  const sourceLabel: Record<string, string> = {
    br: "BR Magazin",
    bitzer: "Bitzer Magazin",
    ucs: "UCS Magazin",
    xitoy: "Xitoy DD/DJ",
  };

  return (
    <div>
      {/* Yuqori qism */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Kalkulatsiya</h1>
        {isSuperAdmin && (
          <div className="flex gap-2">
            <button
              onClick={() => setShowKatForm(!showKatForm)}
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              🗂️ Kategoriyalar
            </button>
            <button
              onClick={openAddForm}
              className="rounded-xl bg-slate-950 px-6 py-3 font-semibold text-white"
            >
              ➕ Yangi komplekt
            </button>
          </div>
        )}
      </div>

      {/* Kategoriya boshqaruvi - faqat SUPER_ADMIN */}
      {showKatForm && isSuperAdmin && (
        <div className="mb-6 rounded-3xl bg-white p-5 shadow-sm">
          <h3 className="mb-4 font-bold">🗂️ Kategoriyalar boshqaruvi</h3>
          <div className="mb-4 flex gap-2">
            <input
              type="text"
              value={newKatName}
              onChange={(e) => setNewKatName(e.target.value)}
              placeholder="Yangi kategoriya nomi"
              className="flex-1 rounded-xl border border-slate-300 p-3 text-sm"
              onKeyDown={(e) => e.key === "Enter" && handleAddKategoriya()}
            />
            <button
              onClick={handleAddKategoriya}
              className="rounded-xl bg-slate-950 px-5 py-2 text-sm font-semibold text-white"
            >
              Qo'shish
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {kategoriyalar.map((k) => (
              <div
                key={k.id}
                className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm"
              >
                <span>{k.name}</span>
                <button
                  onClick={() => handleDeleteKategoriya(k.id)}
                  className="text-red-400 hover:text-red-600"
                >
                  ✕
                </button>
              </div>
            ))}
            {kategoriyalar.length === 0 && (
              <p className="text-sm text-slate-400">Kategoriya yo'q</p>
            )}
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="mb-6 flex flex-wrap gap-3">
        <select
          value={source}
          onChange={(e) => setSource(e.target.value)}
          className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium"
        >
          <option value="all">Barchasi</option>
          <option value="br">BR Magazin narx</option>
          <option value="bitzer">Bitzer Magazin narx</option>
          <option value="ucs">UCS Magazin narx</option>
          <option value="xitoy">Xitoy DD/DJ Magazin narx</option>
        </select>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium"
        >
          <option value="all">Barcha kategoriyalar</option>
          {kategoriyalar.map((k) => (
            <option key={k.id} value={k.id}>
              {k.name}
            </option>
          ))}
        </select>

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="🔍 Qidirish..."
          className="min-w-48 flex-1 rounded-xl border border-slate-300 px-4 py-2 text-sm"
        />
      </div>

      {/* Komplekt qo'shish/tahrirlash formasi */}
      {showForm && isSuperAdmin && (
        <div className="mb-8 rounded-3xl bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-bold">
              {editItem ? "✏️ Tahrirlash" : "➕ Yangi komplekt"}
            </h2>
            <button
              onClick={() => setShowForm(false)}
              className="text-xl text-slate-400 hover:text-slate-700"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <p className="mb-2 text-sm font-semibold text-slate-600">📸 Rasm</p>
              <div className="flex items-start gap-3">
                <div
                  onClick={() => fileRef.current?.click()}
                  className="flex h-32 w-32 flex-shrink-0 cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 hover:border-slate-500"
                >
                  {form.image ? (
                    <img src={form.image} className="h-full w-full rounded-2xl object-cover" />
                  ) : (
                    <span className="text-3xl">📷</span>
                  )}
                </div>
                <div>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold hover:bg-slate-50"
                  >
                    {uploading ? "Yuklanmoqda..." : "📁 Rasm tanlash"}
                  </button>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <input name="name" value={form.name} onChange={handleChange} placeholder="Komplekt nomi" className="rounded-xl border border-slate-300 p-3" />
              <select name="source" value={form.source} onChange={handleChange} className="rounded-xl border border-slate-300 p-3">
                <option value="br">BR Magazin</option>
                <option value="bitzer">Bitzer Magazin</option>
                <option value="ucs">UCS Magazin</option>
                <option value="xitoy">Xitoy DD/DJ</option>
              </select>
              <select name="categoryId" value={form.categoryId} onChange={handleChange} className="rounded-xl border border-slate-300 p-3">
                <option value="">Kategoriya tanlang</option>
                {kategoriyalar.map((k) => (
                  <option key={k.id} value={k.id}>{k.name}</option>
                ))}
              </select>
              <input name="modelCode" value={form.modelCode} onChange={handleChange} placeholder="Model kodi: BR+20PG" className="rounded-xl border border-slate-300 p-3" />
              <input name="priceUsd" type="number" value={form.priceUsd} onChange={handleChange} placeholder="Narx (USD)" className="rounded-xl border border-slate-300 p-3" />
              <input name="fan" value={form.fan} onChange={handleChange} placeholder="Fan: FN160" className="rounded-xl border border-slate-300 p-3" />
              <input name="nerj" value={form.nerj} onChange={handleChange} placeholder="Nerjaveyka: DD160" className="rounded-xl border border-slate-300 p-3" />
              <input name="truba" value={form.truba} onChange={handleChange} placeholder='Truba: 10m' className="rounded-xl border border-slate-300 p-3" />
              <textarea name="description" value={form.description} onChange={handleChange} placeholder="Komplekt haqida ma'lumot" className="min-h-20 rounded-xl border border-slate-300 p-3 md:col-span-2" />
            </div>

            <div className="mt-5 flex gap-3">
              <button type="submit" className="rounded-xl bg-slate-950 px-6 py-3 font-semibold text-white">
                {editItem ? "Saqlash" : "Qo'shish"}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="rounded-xl border border-slate-300 px-6 py-3 font-semibold text-slate-600">
                Bekor qilish
              </button>
            </div>

            {message && <p className="mt-4 text-sm font-medium text-slate-700">{message}</p>}
          </form>
        </div>
      )}

      {/* Kartalar */}
      <div className="grid gap-5 md:grid-cols-3">
        {komplektlar.map((k) => (
          <div key={k.id} className="flex flex-col rounded-3xl bg-white p-4 shadow-sm">
            <div className="relative">
              {k.image ? (
                <img src={k.image} alt={k.name} className="h-48 w-full rounded-2xl bg-slate-100 object-cover" />
              ) : (
                <div className="flex h-48 w-full items-center justify-center rounded-2xl bg-slate-100 text-slate-400">Rasm yo'q</div>
              )}
              <span className="absolute left-2 top-2 rounded-xl bg-black/60 px-3 py-1 text-xs font-semibold text-white">
                {sourceLabel[k.source] || k.source}
              </span>
              {k.category && (
                <span className="absolute right-2 top-2 rounded-xl bg-blue-600/80 px-3 py-1 text-xs font-semibold text-white">
                  {k.category.name}
                </span>
              )}
            </div>

            <div className="mt-4 flex flex-1 flex-col">
              <p className="text-xs font-semibold text-blue-600">{k.modelCode}</p>
              <h3 className="mt-1 font-bold">{k.name}</h3>
              <p className="mt-1 text-sm text-slate-500 line-clamp-2">{k.description}</p>

              <div className="mt-3 rounded-xl bg-slate-50 p-3 text-xs text-slate-600 space-y-1">
                {k.fan && <p>🌀 Fan: <span className="font-medium">{k.fan}</span></p>}
                {k.nerj && <p>💧 Nerj: <span className="font-medium">{k.nerj}</span></p>}
                {k.truba && <p>🔧 Truba: <span className="font-medium">{k.truba}</span></p>}
              </div>

              <div className="mt-3">
                <p className="text-lg font-bold text-slate-900">${k.priceUsd.toLocaleString()}</p>
              </div>

              {isSuperAdmin && (
                <div className="mt-4 flex gap-2">
                  <button onClick={() => openEditForm(k)} className="flex-1 rounded-xl border border-slate-300 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                    ✏️ Tahrirlash
                  </button>
                  <button onClick={() => handleDelete(k.id)} className="flex-1 rounded-xl bg-red-500 py-2 text-sm font-semibold text-white hover:bg-red-600">
                    🗑️ O'chirish
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {komplektlar.length === 0 && (
          <div className="col-span-3 py-16 text-center text-slate-400">
            Hozircha komplekt yo'q
          </div>
        )}
      </div>
    </div>
  );
}