"use client";

import { useEffect, useState, useRef } from "react";

type Kategoriya = { id: string; name: string; parentId?: string | null; children?: Kategoriya[]; };
type Product = {
  id: string; name: string; category: string; tur: string;
  birlik: string; kgPerMetr: number; image: string; images: string[];
  priceUsd: number; priceUzs: number; shortDesc: string; fullDesc: string;
  rating: number; isActive: boolean;
};

const emptyForm = {
  name: "", category: "", tur: "oddiy", birlik: "dona",
  kgPerMetr: "", image: "", images: [] as string[],
  shortDesc: "", fullDesc: "", priceUsd: "",
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [kategoriyalar, setKategoriyalar] = useState<Kategoriya[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [removingBg, setRemovingBg] = useState(false);
  const [message, setMessage] = useState("");
  const [showNewKat, setShowNewKat] = useState(false);
  const [newKatName, setNewKatName] = useState("");
  const [savingKat, setSavingKat] = useState(false);
  const [search, setSearch] = useState("");
  const [activeKat, setActiveKat] = useState("barchasi");
  const [deleteModal, setDeleteModal] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [kurs, setKurs] = useState<number>(0);
  const [kursDiff, setKursDiff] = useState<number | null>(null);
  const [sana, setSana] = useState("");
  const [selectedMainCategory, setSelectedMainCategory] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const sotishKursi = kurs > 0 ? kurs : 0;

  const mainCategories = kategoriyalar.filter(k => !k.parentId);
  const subCategories = selectedMainCategory
    ? kategoriyalar.filter(k => k.parentId === selectedMainCategory)
    : [];

  useEffect(() => {
    loadProducts();
    loadKategoriyalar();
    fetch("https://cbu.uz/uz/arkhiv-kursov-valyut/json/USD/")
      .then((r) => r.json())
      .then((data) => {
        if (data?.[0]?.Rate) setKurs(Number(data[0].Rate));
        if (data?.[0]?.Diff !== undefined) setKursDiff(Number(data[0].Diff));
      })
      .catch(() => {});
    const interval = setInterval(() => {
      const hozir = new Date();
      const format = hozir.toLocaleString("uz-UZ", {
        day: "2-digit", month: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit", second: "2-digit",
      });
      setSana(format);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  async function loadProducts() {
    const res = await fetch("/api/products");
    setProducts(await res.json());
  }

  async function loadKategoriyalar() {
    const res = await fetch("/api/kategoriya");
    setKategoriyalar(await res.json());
  }

  const filteredProducts = products.filter((p) => {
    const matchKat = activeKat === "barchasi" || p.category === activeKat;
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase());
    return matchKat && matchSearch;
  });

  function openAddForm() {
    setEditProduct(null);
    setForm(emptyForm);
    setSelectedMainCategory("");
    setMessage("");
    setShowForm(true);
  }

  function openEditForm(p: Product) {
    setEditProduct(p);
    setForm({
      name: p.name, category: p.category, tur: p.tur, birlik: p.birlik,
      kgPerMetr: p.kgPerMetr ? String(p.kgPerMetr) : "",
      image: p.image, images: p.images || [],
      shortDesc: p.shortDesc, fullDesc: p.fullDesc, priceUsd: String(p.priceUsd),
    });

    const cat = kategoriyalar.find(k => k.name === p.category);
    if (cat?.parentId) {
      setSelectedMainCategory(cat.parentId);
    } else {
      setSelectedMainCategory(cat?.id || "");
    }

    setMessage("");
    setShowForm(true);
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

  async function handleAiAnalyze() {
    if (!form.image) { setMessage("Avval rasm yuklang ❗"); return; }
    setAnalyzing(true); setMessage("AI tahlil qilmoqda...");
    const res = await fetch("/api/ai-analyze", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageUrl: form.image }),
    });
    const data = await res.json();
    if (!data.error) {
      setForm((f) => ({
        ...f,
        name: data.name || f.name,
        shortDesc: data.shortDesc || f.shortDesc,
        fullDesc: data.fullDesc || f.fullDesc,
        priceUsd: data.priceUsd ? String(data.priceUsd) : f.priceUsd,
      }));
      setMessage("AI to'ldirdi ✅");
    } else { setMessage("AI xato ❌"); }
    setAnalyzing(false);
  }

  async function handleRemoveBg() {
    if (!form.image) { setMessage("Avval rasm yuklang ❗"); return; }
    setRemovingBg(true); setMessage("Fon olib tashlanmoqda...");
    const res = await fetch("/api/remove-bg", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageUrl: form.image }),
    });
    const data = await res.json();
    if (data.url) { setForm((f) => ({ ...f, image: data.url })); setMessage("Fon olib tashlandi ✅"); }
    else { setMessage("Xatolik ❌"); }
    setRemovingBg(false);
  }

  async function handleSaveKat() {
    if (!newKatName.trim()) return;
    setSavingKat(true);
    const res = await fetch("/api/kategoriya", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newKatName,
        parentId: selectedMainCategory && selectedMainCategory !== "__new__" ? selectedMainCategory : null,
      }),
    });
    const data = await res.json();
    await loadKategoriyalar();
    setForm((f) => ({ ...f, category: data.name }));
    setNewKatName("");
    setShowNewKat(false);
    setSavingKat(false);
  }

  async function handleSubmit() {
    if (!form.name.trim()) { setMessage("Mahsulot nomi kiritilmagan ❗"); return; }
    if (!form.priceUsd) { setMessage("Narx kiritilmagan ❗"); return; }
    if (saving) return;
    setSaving(true);
    setMessage("Saqlanmoqda...");
    const body = {
      ...(editProduct ? { id: editProduct.id } : {}),
      name: form.name, category: form.category, tur: form.tur,
      birlik: form.birlik, kgPerMetr: form.kgPerMetr ? Number(form.kgPerMetr) : 0,
      image: form.image, images: form.images,
      priceUsd: form.priceUsd,
      priceUzs: 0,
      shortDesc: form.shortDesc, fullDesc: form.fullDesc,
    };
    const res = await fetch("/api/products", {
      method: editProduct ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      setShowForm(false); setForm(emptyForm); setEditProduct(null);
      setMessage(""); await loadProducts();
    } else { setMessage("Xatolik ❌"); }
    setSaving(false);
  }

  async function handleDelete() {
    if (!deleteModal) return;
    setDeleting(true);
    await fetch("/api/products", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: deleteModal.id }),
    });
    setDeleting(false);
    setDeleteModal(null);
    await loadProducts();
  }

  const priceUzs = form.priceUsd && sotishKursi > 0
    ? Math.round(Number(form.priceUsd) * sotishKursi).toLocaleString()
    : "—";

  const trubaHisob = form.birlik === "kg" && form.kgPerMetr && form.priceUsd
    ? (4 * Number(form.kgPerMetr) * Number(form.priceUsd)).toFixed(2) : null;

  return (
    <div className="min-h-screen bg-gray-50">

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
            <p className="text-xs text-gray-400 text-center mb-6">Bu mahsulot o'chirilsa qaytarib bo'lmaydi!</p>
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

      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Mahsulotlar</h1>
            {kurs > 0 && (
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-1 flex-wrap">
                  <p className="text-xs text-gray-500">
                    <span className="font-bold text-gray-800">{sotishKursi.toLocaleString()} so'm</span>
                  </p>
                  {kursDiff !== null && (
                    <span className={`text-xs font-bold flex items-center gap-0.5 ${
                      kursDiff >= 0 ? "text-green-500" : "text-red-500"
                    }`}>
                      {kursDiff >= 0 ? (
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                          <path d="M6 1L11 8H1L6 1Z"/>
                        </svg>
                      ) : (
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                          <path d="M6 11L1 4H11L6 11Z"/>
                        </svg>
                      )}
                      {Math.abs(kursDiff).toFixed(2)}
                    </span>
                  )}
                </div>
                {sana && <p className="text-xs text-gray-400">{sana}</p>}
              </div>
            )}
          </div>
          <button onClick={openAddForm}
            className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-xl text-sm font-semibold">
            + Qo'shish
          </button>
        </div>
        <div className="relative mb-2.5">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <input type="text" value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Mahsulot qidirish..."
            className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gray-400" />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">✕</button>
          )}
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          <button onClick={() => setActiveKat("barchasi")}
            className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
              activeKat === "barchasi" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-500"
            }`}>
            Barchasi ({products.length})
          </button>
          {kategoriyalar.map((k) => (
            <button key={k.id} onClick={() => setActiveKat(k.name)}
              className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
                activeKat === k.name ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-500"
              }`}>
              {k.name} ({products.filter((p) => p.category === k.name).length})
            </button>
          ))}
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl overflow-hidden max-h-[95vh] flex flex-col">
            <div className="flex justify-center pt-3 pb-1 sm:hidden">
              <div className="w-10 h-1 bg-gray-200 rounded-full"></div>
            </div>
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">✕</button>
              <h2 className="text-base font-bold text-gray-900">
                {editProduct ? "Tahrirlash" : "Yangi mahsulot"}
              </h2>
              <button onClick={handleSubmit} disabled={saving}
                className="bg-gray-900 text-white px-4 py-1.5 rounded-xl text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed">
                {saving ? "Yuklanmoqda..." : editProduct ? "Saqlash" : "Qo'shish"}
              </button>
            </div>

            <div className="overflow-y-auto flex-1">

              <div className="relative mx-4 rounded-2xl overflow-hidden cursor-pointer"
                style={{ height: 180, background: "linear-gradient(135deg, #e8ede9, #dde8de)" }}
                onClick={() => fileRef.current?.click()}>
                {form.image ? (
                  <img src={form.image} alt="" className="w-full h-full object-contain" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                    <span className="text-4xl">📷</span>
                    <p className="text-sm text-gray-500 font-medium">Rasm yuklash</p>
                  </div>
                )}
                {form.image && <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />}
                {form.name && (
                  <div className="absolute bottom-3 left-3 right-3">
                    <p className="text-white font-semibold text-sm drop-shadow">{form.name}</p>
                    <p className="text-white/80 text-xs">{form.priceUsd ? `$${form.priceUsd}` : ""} · {form.birlik}</p>
                  </div>
                )}
                <div className="absolute top-3 right-3 flex gap-2" onClick={(e) => e.stopPropagation()}>
                  <button onClick={handleAiAnalyze} disabled={analyzing || !form.image}
                    className="bg-white/90 backdrop-blur text-blue-600 text-xs font-semibold px-3 py-1.5 rounded-lg disabled:opacity-50">
                    {analyzing ? "..." : "🤖 AI"}
                  </button>
                  <button onClick={handleRemoveBg} disabled={removingBg || !form.image}
                    className="bg-white/90 backdrop-blur text-green-600 text-xs font-semibold px-3 py-1.5 rounded-lg disabled:opacity-50">
                    {removingBg ? "..." : "✂️ Fon"}
                  </button>
                </div>
                {uploading && (
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <p className="text-white font-semibold text-sm">Yuklanmoqda...</p>
                  </div>
                )}
              </div>

              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              {message && (
                <p className={`mx-4 mt-2 text-xs font-medium ${
                  message.includes("❌") ? "text-red-500" :
                  message.includes("✅") ? "text-green-600" : "text-gray-500"
                }`}>
                  {message}
                </p>
              )}

              <div className="px-4 pt-4 pb-6 flex flex-col gap-4">
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Mahsulot nomi</p>
                  <input type="text" value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="Masalan: MisTruba F 54"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gray-400" />
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                    Asosiy kategoriya
                  </p>
                  <select value={selectedMainCategory}
                    onChange={(e) => {
                      if (e.target.value === "__new__") {
                        setShowNewKat(true);
                        setSelectedMainCategory("");
                      } else {
                        setSelectedMainCategory(e.target.value);
                        setForm((f) => ({ ...f, category: "" }));
                      }
                    }}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gray-400 bg-white">
                    <option value="">— Tanlang —</option>
                    {mainCategories.map((k) => (
                      <option key={k.id} value={k.id}>{k.name}</option>
                    ))}
                    <option value="__new__">＋ Yangi kategoriya</option>
                  </select>
                </div>

                {selectedMainCategory && selectedMainCategory !== "__new__" && subCategories.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                      Sub-kategoriya
                    </p>
                    <select value={form.category}
                      onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gray-400 bg-white">
                      <option value="">— Tanlang —</option>
                      {subCategories.map((k) => (
                        <option key={k.id} value={k.name}>{k.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                {selectedMainCategory && selectedMainCategory !== "__new__" && subCategories.length === 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                      Kategoriya
                    </p>
                    <select value={form.category}
                      onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gray-400 bg-white">
                      <option value="">— Tanlang —</option>
                      {mainCategories.find(k => k.id === selectedMainCategory) && (
                        <option value={mainCategories.find(k => k.id === selectedMainCategory)!.name}>
                          {mainCategories.find(k => k.id === selectedMainCategory)!.name}
                        </option>
                      )}
                    </select>
                  </div>
                )}

                {showNewKat && (
                  <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-xl flex gap-2">
                    <input type="text" value={newKatName}
                      onChange={(e) => setNewKatName(e.target.value)}
                      placeholder="Kategoriya nomi..."
                      className="flex-1 border border-blue-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none"
                      autoFocus onKeyDown={(e) => e.key === "Enter" && handleSaveKat()} />
                    <button onClick={handleSaveKat} disabled={savingKat}
                      className="bg-gray-900 text-white px-3 py-2 rounded-lg text-sm font-semibold">
                      {savingKat ? "..." : "Saqlash"}
                    </button>
                    <button onClick={() => setShowNewKat(false)} className="text-gray-400 px-2">✕</button>
                  </div>
                )}

                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Birlik</p>
                  <div className="flex gap-2">
                    {[{ val: "dona", label: "Dona" }, { val: "kg", label: "Kg" }, { val: "metr", label: "Metr" }].map((b) => (
                      <button key={b.val}
                        onClick={() => setForm((f) => ({ ...f, birlik: b.val, kgPerMetr: "" }))}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition ${
                          form.birlik === b.val ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600"
                        }`}>
                        {b.label}
                      </button>
                    ))}
                  </div>
                </div>

                {form.birlik === "kg" && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                    <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-2">1 metrda og'irligi</p>
                    <div className="flex items-center gap-2">
                      <input type="number" value={form.kgPerMetr}
                        onChange={(e) => setForm((f) => ({ ...f, kgPerMetr: e.target.value }))}
                        placeholder="0.000"
                        className="flex-1 border border-blue-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none" />
                      <span className="text-sm text-gray-500 font-medium flex-shrink-0">kg/metr</span>
                    </div>
                    <p className="text-xs text-blue-500 mt-1.5">F-54 = 5.300 · F-42 = 3.800 · F-22 = 1.700</p>
                    {trubaHisob && (
                      <div className="mt-2 pt-2 border-t border-blue-200 flex justify-between items-center">
                        <p className="text-xs text-blue-500">4m × {form.kgPerMetr}kg × ${form.priceUsd || 0}</p>
                        <p className="text-sm font-bold text-blue-700">${trubaHisob}</p>
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                    Narx (USD) — 1 {form.birlik} uchun
                  </p>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">$</span>
                    <input type="number" value={form.priceUsd}
                      onChange={(e) => setForm((f) => ({ ...f, priceUsd: e.target.value }))}
                      placeholder="0.00"
                      className="w-full border border-gray-200 rounded-xl pl-8 pr-4 py-3 text-sm focus:outline-none focus:border-gray-400" />
                  </div>
                  {form.priceUsd && sotishKursi > 0 && (
                    <p className="text-xs text-gray-400 mt-1">
                      {priceUzs} so'm · Kurs: {sotishKursi.toLocaleString()} so'm
                    </p>
                  )}
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Qisqa ma'lumot</p>
                  <input type="text" value={form.shortDesc}
                    onChange={(e) => setForm((f) => ({ ...f, shortDesc: e.target.value }))}
                    placeholder="Bir qator tavsif..."
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gray-400" />
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Batafsil ma'lumot</p>
                  <textarea value={form.fullDesc}
                    onChange={(e) => setForm((f) => ({ ...f, fullDesc: e.target.value }))}
                    placeholder="To'liq texnik tavsif..." rows={4}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gray-400 resize-none" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PRODUCTS LIST */}
      <div className="p-4">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-3">{search ? "🔍" : "📦"}</p>
            <p className="text-gray-400 font-medium">
              {search ? `"${search}" topilmadi` : "Hali mahsulot yo'q"}
            </p>
            {!search && (
              <button onClick={openAddForm} className="mt-3 text-blue-600 text-sm font-semibold">
                Birinchi mahsulotni qo'shing
              </button>
            )}
          </div>
        ) : (
          <>
            <p className="text-xs text-gray-400 mb-3">{filteredProducts.length} ta mahsulot</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {filteredProducts.map((p) => (
                <div key={p.id} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                  <div className="relative h-28 bg-gradient-to-br from-gray-50 to-gray-100">
                    {p.image ? (
                      <img src={p.image} alt={p.name} className="w-full h-full object-contain p-2" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl">📦</div>
                    )}
                    <span className={`absolute top-2 left-2 text-xs font-semibold px-2 py-0.5 rounded-full ${
                      p.tur === "komplekt" ? "bg-purple-100 text-purple-700"
                      : p.birlik === "kg" ? "bg-orange-50 text-orange-600"
                      : p.birlik === "metr" ? "bg-green-50 text-green-600"
                      : "bg-blue-50 text-blue-600"
                    }`}>
                      {p.tur === "komplekt" ? "Komplekt" : p.birlik}
                    </span>
                    {p.kgPerMetr > 0 && (
                      <span className="absolute bottom-2 right-2 text-xs bg-black/50 text-white px-2 py-0.5 rounded-full">
                        {p.kgPerMetr} kg/m
                      </span>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-xs text-gray-400 truncate mb-0.5">{p.category || "—"}</p>
                    <p className="text-sm font-semibold text-gray-900 mb-1 leading-snug">{p.name}</p>
                    <p className="text-sm font-bold text-gray-900">
                      ${p.birlik === "kg" && p.kgPerMetr > 0
                        ? (4 * p.kgPerMetr * p.priceUsd).toFixed(2)
                        : p.priceUsd}
                    </p>
                    <p className="text-xs text-gray-400">
                      {p.birlik === "kg" && p.kgPerMetr > 0
                        ? `4m uchun · $${p.priceUsd}/kg`
                        : sotishKursi > 0
                          ? `${Math.round(p.priceUsd * sotishKursi).toLocaleString()} so'm`
                          : `${p.priceUzs.toLocaleString()} so'm`}
                    </p>
                    <div className="flex gap-1.5 mt-3">
                      <button onClick={() => openEditForm(p)}
                        className="flex-1 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold">
                        ✏️ Tahrir
                      </button>
                      <button onClick={() => setDeleteModal(p)}
                        className="flex-1 py-1.5 bg-red-50 text-red-500 rounded-lg text-xs font-semibold">
                        🗑️ O'chir
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}