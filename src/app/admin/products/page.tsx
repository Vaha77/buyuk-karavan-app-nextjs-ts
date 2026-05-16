"use client";

import { useEffect, useState, useRef } from "react";

type Product = {
  id: string;
  name: string;
  category: string;
  country: string;
  image: string;
  images: string[];
  priceUsd: number;
  priceUzs: number;
  shortDesc: string;
  rating: number;
};

const emptyForm = {
  name: "",
  category: "",
  country: "",
  image: "",
  images: [] as string[],
  shortDesc: "",
  fullDesc: "",
  priceUsd: "",
  rating: "",
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [message, setMessage] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [removingBg, setRemovingBg] = useState(false);
  const [viewer360, setViewer360] = useState<{ product: Product; index: number } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  async function loadProducts() {
    const res = await fetch("/api/products");
    const data = await res.json();
    setProducts(data);
  }

  useEffect(() => { loadProducts(); }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleMainImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
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

  async function handleGalleryUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    const urls: string[] = [];
    for (const file of files) {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) urls.push(data.url);
    }
    setForm((f) => ({ ...f, images: [...f.images, ...urls] }));
    setUploading(false);
  }

  async function handleAiAnalyze() {
    if (!form.image) { setMessage("Avval asosiy rasmni yuklang ❗"); return; }
    setAnalyzing(true);
    setMessage("AI tahlil qilmoqda... 🤖");
    const res = await fetch("/api/ai-analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageUrl: form.image }),
    });
    const data = await res.json();
    if (!data.error) {
      setForm((f) => ({
        ...f,
        name: data.name || f.name,
        category: data.category || f.category,
        shortDesc: data.shortDesc || f.shortDesc,
        fullDesc: data.fullDesc || f.fullDesc,
        priceUsd: data.priceUsd ? String(data.priceUsd) : f.priceUsd,
        rating: data.rating ? String(data.rating) : f.rating,
      }));
      setMessage("AI to'ldirdi ✅ — tekshirib saqlang");
    } else {
      setMessage("AI xato ❌");
    }
    setAnalyzing(false);
  }

  async function handleRemoveBg() {
    if (!form.image) { setMessage("Avval asosiy rasmni yuklang ❗"); return; }
    setRemovingBg(true);
    setMessage("Fon olib tashlanmoqda... ✂️");
    const res = await fetch("/api/remove-bg", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageUrl: form.image }),
    });
    const data = await res.json();
    if (data.url) {
      setForm((f) => ({ ...f, image: data.url }));
      setMessage("Fon olib tashlandi ✅");
    } else {
      setMessage("Xatolik ❌ " + data.error);
    }
    setRemovingBg(false);
  }

  function openAddForm() {
    setEditProduct(null);
    setForm(emptyForm);
    setMessage("");
    setShowForm(true);
  }

  function openEditForm(product: Product) {
    setEditProduct(product);
    setForm({
      name: product.name,
      category: product.category,
      country: product.country,
      image: product.image,
      images: product.images || [],
      shortDesc: product.shortDesc,
      fullDesc: "",
      priceUsd: String(product.priceUsd),
      rating: String(product.rating),
    });
    setMessage("");
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { setMessage("Mahsulot nomi kiritilmagan ❗"); return; }
    if (!form.priceUsd) { setMessage("Narx kiritilmagan ❗"); return; }
    if (!form.image) { setMessage("Asosiy rasm yuklanmagan ❗"); return; }

    const body = {
      ...(editProduct ? { id: editProduct.id } : {}),
      name: form.name,
      category: form.category,
      country: form.country,
      image: form.image,
      images: form.images,
      priceUsd: form.priceUsd,
      shortDesc: form.shortDesc,
      fullDesc: form.fullDesc,
      rating: form.rating,
    };
    const res = await fetch("/api/products", {
      method: editProduct ? "PUT" : "POST",
      body: JSON.stringify(body),
    });
    if (res.ok) {
      setMessage(editProduct ? "Yangilandi ✅" : "Qo'shildi ✅");
      setForm(emptyForm);
      setEditProduct(null);
      setShowForm(false);
      await loadProducts();
    } else {
      setMessage("Xatolik ❌");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("O'chirishni tasdiqlaysizmi?")) return;
    const res = await fetch("/api/products", {
      method: "DELETE",
      body: JSON.stringify({ id }),
    });
    if (res.ok) await loadProducts();
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Mahsulotlar</h1>
        <button onClick={openAddForm} className="rounded-xl bg-slate-950 px-6 py-3 font-semibold text-white">
          ➕ Yangi mahsulot
        </button>
      </div>

      {showForm && (
        <div className="mb-8 rounded-3xl bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-bold">{editProduct ? "✏️ Tahrirlash" : "➕ Yangi mahsulot"}</h2>
            <button onClick={() => setShowForm(false)} className="text-xl text-slate-400 hover:text-slate-700">✕</button>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Asosiy rasm */}
            <div className="mb-4">
              <p className="mb-2 text-sm font-semibold text-slate-600">📸 Asosiy rasm</p>
              <div className="flex gap-3 items-start">
                <div
                  onClick={() => fileRef.current?.click()}
                  className="flex h-32 w-32 flex-shrink-0 cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 hover:border-slate-500 bg-slate-50"
                >
                  {form.image ? (
                    <img src={form.image} className="h-full w-full rounded-2xl object-cover" />
                  ) : (
                    <span className="text-3xl">📷</span>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleMainImageUpload} />
                  <button type="button" onClick={() => fileRef.current?.click()}
                    className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold hover:bg-slate-50">
                    {uploading ? "Yuklanmoqda..." : "📁 Rasm tanlash"}
                  </button>
                  <button type="button" onClick={handleAiAnalyze} disabled={analyzing || !form.image}
                    className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50">
                    {analyzing ? "Tahlil qilmoqda..." : "🤖 AI bilan to'ldirish"}
                  </button>
                  <button type="button" onClick={handleRemoveBg} disabled={removingBg || !form.image}
                    className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50">
                    {removingBg ? "Olib tashlanmoqda..." : "✂️ Fonni olib tashlash"}
                  </button>
                </div>
              </div>
            </div>

            {/* 360° rasmlar */}
            <div className="mb-4">
              <p className="mb-2 text-sm font-semibold text-slate-600">🌀 360° rasmlar (har tomondan)</p>
              <div className="flex flex-wrap gap-2">
                {form.images.map((url, i) => (
                  <div key={i} className="relative">
                    <img src={url} className="h-16 w-16 rounded-xl object-cover" />
                    <button type="button"
                      onClick={() => setForm((f) => ({ ...f, images: f.images.filter((_, j) => j !== i) }))}
                      className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">✕</button>
                  </div>
                ))}
                <div onClick={() => galleryRef.current?.click()}
                  className="flex h-16 w-16 cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-slate-300 hover:border-slate-500 text-2xl text-slate-400">+</div>
                <input ref={galleryRef} type="file" accept="image/*" multiple className="hidden" onChange={handleGalleryUpload} />
              </div>
              {form.images.length > 0 && (
                <p className="mt-1 text-xs text-slate-400">{form.images.length} ta rasm — 360° viewer ishlaydi</p>
              )}
            </div>

            {/* Maydonlar */}
            <div className="grid gap-4 md:grid-cols-2">
              <input name="name" value={form.name} onChange={handleChange} placeholder="Mahsulot nomi" className="rounded-xl border border-slate-300 p-3" />
              <input name="category" value={form.category} onChange={handleChange} placeholder="Kategoriya" className="rounded-xl border border-slate-300 p-3" />
              <input name="country" value={form.country} onChange={handleChange} placeholder="Davlat: Xitoy, Germaniya..." className="rounded-xl border border-slate-300 p-3" />
              <input name="priceUsd" type="number" value={form.priceUsd} onChange={handleChange} placeholder="Narx USD" className="rounded-xl border border-slate-300 p-3" />
              <input name="shortDesc" value={form.shortDesc} onChange={handleChange} placeholder="Qisqa ma'lumot" className="rounded-xl border border-slate-300 p-3 md:col-span-2" />
              <textarea name="fullDesc" value={form.fullDesc} onChange={handleChange} placeholder="To'liq ma'lumot" className="min-h-28 rounded-xl border border-slate-300 p-3 md:col-span-2" />
              <input name="rating" type="number" step="0.1" value={form.rating} onChange={handleChange} placeholder="Rating: 4.9" className="rounded-xl border border-slate-300 p-3" />
            </div>

            <div className="mt-5 flex gap-3">
              <button type="submit" className="rounded-xl bg-slate-950 px-6 py-3 font-semibold text-white">
                {editProduct ? "Saqlash" : "Qo'shish"}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="rounded-xl border border-slate-300 px-6 py-3 font-semibold text-slate-600">
                Bekor qilish
              </button>
            </div>

            {message && <p className="mt-4 text-sm font-medium text-slate-700">{message}</p>}
          </form>
        </div>
      )}

      {/* 360° Modal */}
      {viewer360 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-6">
            <button onClick={() => setViewer360(null)} className="absolute right-4 top-4 text-2xl text-slate-400 hover:text-slate-700">✕</button>
            <h3 className="mb-4 text-lg font-bold">🌀 360° Ko'rinish</h3>
            <img src={viewer360.product.images[viewer360.index]} className="w-full rounded-2xl object-contain" style={{ maxHeight: 350 }} />
            <div className="mt-4 flex items-center justify-between">
              <button onClick={() => setViewer360((v) => v && { ...v, index: (v.index - 1 + v.product.images.length) % v.product.images.length })}
                className="rounded-xl bg-slate-100 px-5 py-2 font-bold hover:bg-slate-200">◀</button>
              <span className="text-sm text-slate-500">{viewer360.index + 1} / {viewer360.product.images.length}</span>
              <button onClick={() => setViewer360((v) => v && { ...v, index: (v.index + 1) % v.product.images.length })}
                className="rounded-xl bg-slate-100 px-5 py-2 font-bold hover:bg-slate-200">▶</button>
            </div>
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {viewer360.product.images.map((url, i) => (
                <img key={i} src={url} onClick={() => setViewer360((v) => v && { ...v, index: i })}
                  className={`h-14 w-14 flex-shrink-0 cursor-pointer rounded-xl object-cover border-2 ${viewer360.index === i ? "border-slate-900" : "border-transparent"}`} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mahsulotlar */}
      <div className="grid gap-5 md:grid-cols-3">
        {products.map((product) => (
          <div key={product.id} className="flex flex-col rounded-3xl bg-white p-4 shadow-sm">
            <div className="relative">
              {product.image ? (
                <img src={product.image} alt={product.name} className="h-48 w-full rounded-2xl bg-slate-100 object-cover" />
              ) : (
                <div className="flex h-48 w-full items-center justify-center rounded-2xl bg-slate-100 text-slate-400">Rasm yo'q</div>
              )}
              {product.images?.length > 0 && (
                <button onClick={() => setViewer360({ product, index: 0 })}
                  className="absolute bottom-2 right-2 rounded-xl bg-black/60 px-3 py-1 text-xs font-semibold text-white hover:bg-black/80">
                  🌀 360°
                </button>
              )}
            </div>
            <div className="mt-4 flex flex-1 flex-col">
              <p className="text-xs font-semibold text-blue-600">{product.country || "—"}</p>
              <h3 className="mt-1 font-bold">{product.name || "Nomsiz"}</h3>
              <p className="text-sm text-slate-500 line-clamp-2">{product.shortDesc}</p>
              <div className="mt-3">
                <p className="font-bold text-slate-900">${product.priceUsd}</p>
                <p className="text-sm text-slate-500">{product.priceUzs.toLocaleString()} so'm</p>
              </div>
              <p className="mt-2 text-sm">⭐ {product.rating}</p>
              <div className="mt-4 flex gap-2">
                <button onClick={() => openEditForm(product)} className="flex-1 rounded-xl border border-slate-300 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">✏️ Tahrirlash</button>
                <button onClick={() => handleDelete(product.id)} className="flex-1 rounded-xl bg-red-500 py-2 text-sm font-semibold text-white hover:bg-red-600">🗑️ O'chirish</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}