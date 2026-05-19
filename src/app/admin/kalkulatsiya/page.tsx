"use client";

import { useEffect, useState, useRef } from "react";

type Kategoriya = { id: string; name: string; };
type Product = { id: string; name: string; priceUsd: number; birlik: string; kgPerMetr: number; };
type Qism = { id: string; nom: string; mahsulot: string; miqdor: number; narx: number; };
type Hisob = {
  id: string;
  mijozIsm: string;
  mijozTel: string;
  brend: string;
  model: string;
  foiz: number;
  tanNarxi: number;
  jamiNarx: number;
  createdAt: string;
  sotuvchi: { name: string };
  qismlar: Qism[];
};

const BRENDLAR = [
  { value: "xueing", label: "Xueing" },
  { value: "bitzer", label: "Bitzer" },
  { value: "cold", label: "Cold" },
];

const MODELLAR: Record<string, string[]> = {
  xueing: ["Kompressor XUEING BR+10G", "Kompressor XUEING BR+20PG", "Kompressor XUEING BR+30PG", "Vazdushniy Agregat BR+10G", "Vazdushniy Agregat BR+20PG"],
  bitzer: ["Bitzer 4FES-3", "Bitzer 4NES-14", "Bitzer 4TES-12", "Bitzer 6FE-44"],
  cold: ["Cold agregat 10kw", "Cold agregat 20kw", "Cold agregat 30kw"],
};

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

export default function KalkulatsiyaPage() {
  const [kategoriyalar, setKategoriyalar] = useState<Kategoriya[]>([]);
  const [hisoblar, setHisoblar] = useState<Hisob[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [kurs, setKurs] = useState(12986);
  const [sotuvchiId, setSotuvchiId] = useState("");

  const [mijozIsm, setMijozIsm] = useState("");
  const [mijozTel, setMijozTel] = useState("");
  const [brend, setBrend] = useState("");
  const [model, setModel] = useState("");
  const [foiz, setFoiz] = useState(0);
  const [qismlar, setQismlar] = useState<Qism[]>([]);

  const [showQismModal, setShowQismModal] = useState(false);
  const [qismKat, setQismKat] = useState("");
  const [qismMahsulotlar, setQismMahsulotlar] = useState<Product[]>([]);
  const [qismMahsulot, setQismMahsulot] = useState("");
  const [qismMiqdor, setQismMiqdor] = useState(1);

  const [deleteModal, setDeleteModal] = useState<Hisob | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("bk_user");
    if (saved) setSotuvchiId(JSON.parse(saved).id);
    loadKategoriyalar();
    loadHisoblar();
    fetch("https://cbu.uz/uz/arkhiv-kursov-valyut/json/USD/")
      .then(r => r.json())
      .then(data => { if (data?.[0]?.Rate) setKurs(Number(data[0].Rate) + 1000); })
      .catch(() => {});
  }, []);

  async function loadKategoriyalar() {
    const res = await fetch("/api/kategoriya");
    setKategoriyalar(await res.json());
  }

  async function loadHisoblar() {
    const res = await fetch("/api/hisob");
    setHisoblar(await res.json());
  }

  async function loadQismMahsulotlar(kat: string) {
    setQismKat(kat);
    setQismMahsulot("");
    if (!kat) { setQismMahsulotlar([]); return; }
    const res = await fetch(`/api/products?category=${encodeURIComponent(kat)}`);
    setQismMahsulotlar(await res.json());
  }

  const tanNarxi = qismlar.reduce((sum, q) => sum + q.narx * q.miqdor, 0);
  const qoshimcha = Math.round(tanNarxi * foiz / 100);
  const jamiNarx = tanNarxi + qoshimcha;
  const jamiSom = Math.round(jamiNarx * kurs);

  function qismQosh() {
    const mahsulot = qismMahsulotlar.find(p => p.id === qismMahsulot);
    if (!mahsulot || !qismKat) return;
    setQismlar(prev => [...prev, {
      id: Date.now().toString(),
      nom: qismKat,
      mahsulot: mahsulot.name,
      miqdor: qismMiqdor,
      narx: mahsulot.priceUsd,
    }]);
    setShowQismModal(false);
    setQismKat(""); setQismMahsulot(""); setQismMiqdor(1);
  }

  function qismOchir(id: string) {
    setQismlar(prev => prev.filter(q => q.id !== id));
  }

  function qismMiqdorOzgartir(id: string, delta: number) {
    setQismlar(prev => prev.map(q => q.id === id ? { ...q, miqdor: Math.max(1, q.miqdor + delta) } : q));
  }

  async function handleSave() {
    if (!mijozIsm.trim()) { setMessage("Mijoz ismi kiritilmagan ❗"); return; }
    if (!brend || !model) { setMessage("Brend va model tanlang ❗"); return; }
    if (qismlar.length === 0) { setMessage("Kamida 1 ta qism qo'shing ❗"); return; }
    if (saving) return;
    setSaving(true);
    const res = await fetch("/api/hisob", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mijozIsm, mijozTel, brend, model, foiz, tanNarxi, jamiNarx, sotuvchiId, qismlar }),
    });
    if (res.ok) {
      setShowForm(false);
      setMijozIsm(""); setMijozTel(""); setBrend(""); setModel(""); setFoiz(0); setQismlar([]);
      setMessage("");
      await loadHisoblar();
    } else { setMessage("Xatolik ❌"); }
    setSaving(false);
  }

  async function handleDelete() {
    if (!deleteModal) return;
    setDeleting(true);
    await fetch("/api/hisob", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: deleteModal.id }),
    });
    setDeleting(false);
    setDeleteModal(null);
    await loadHisoblar();
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">

      {/* O'chirish modal */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <div className="flex items-center justify-center w-12 h-12 bg-red-50 rounded-full mx-auto mb-4">
              <span className="text-2xl">🗑️</span>
            </div>
            <h3 className="text-base font-bold text-gray-900 text-center mb-2">O'chirishni tasdiqlang</h3>
            <p className="text-sm text-gray-500 text-center mb-6">
              <span className="font-semibold">{deleteModal.mijozIsm}</span> — ${deleteModal.jamiNarx.toLocaleString()}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteModal(null)} className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold">Bekor</button>
              <button onClick={handleDelete} disabled={deleting} className="flex-1 py-3 bg-red-500 text-white rounded-xl text-sm font-semibold disabled:opacity-50">
                {deleting ? "O'chirilmoqda..." : "O'chirish"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Qism qo'shish modal */}
      {showQismModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h3 className="text-base font-bold text-gray-900 mb-4">Qism qo'shish</h3>
            <div className="flex flex-col gap-3 mb-4">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Kategoriya</p>
                <select value={qismKat} onChange={e => loadQismMahsulotlar(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none bg-white">
                  <option value="">— Tanlang —</option>
                  {kategoriyalar.map(k => <option key={k.id} value={k.name}>{k.name}</option>)}
                </select>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Mahsulot</p>
                <select value={qismMahsulot} onChange={e => setQismMahsulot(e.target.value)}
                  disabled={!qismKat || qismMahsulotlar.length === 0}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none bg-white disabled:opacity-50">
                  <option value="">— Tanlang —</option>
                  {qismMahsulotlar.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} — ${p.birlik === "kg" && p.kgPerMetr > 0 ? (4 * p.kgPerMetr * p.priceUsd).toFixed(2) : p.priceUsd}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Miqdor</p>
                <div className="flex items-center gap-3">
                  <button onClick={() => setQismMiqdor(m => Math.max(1, m - 1))}
                    className="w-10 h-10 rounded-xl border border-gray-200 bg-gray-50 text-lg font-bold flex items-center justify-center">−</button>
                  <span className="text-lg font-semibold text-gray-900 min-w-8 text-center">{qismMiqdor}</span>
                  <button onClick={() => setQismMiqdor(m => m + 1)}
                    className="w-10 h-10 rounded-xl border border-gray-200 bg-gray-50 text-lg font-bold flex items-center justify-center">+</button>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={qismQosh} disabled={!qismMahsulot}
                className="flex-1 py-3 bg-gray-900 text-white rounded-xl text-sm font-semibold disabled:opacity-50">
                Qo'shish
              </button>
              <button onClick={() => setShowQismModal(false)}
                className="px-4 py-3 bg-gray-100 text-gray-600 rounded-xl text-sm font-semibold">
                Bekor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Yangi hisob formasi */}
      {showForm && (
        <div className="fixed inset-0 z-40 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl overflow-hidden max-h-[95vh] flex flex-col">
            <div className="flex justify-center pt-3 pb-1 sm:hidden">
              <div className="w-10 h-1 bg-gray-200 rounded-full"></div>
            </div>
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <button onClick={() => setShowForm(false)} className="text-gray-400">✕</button>
              <h2 className="text-base font-bold text-gray-900">Yangi hisob</h2>
              <button onClick={handleSave} disabled={saving}
                className="bg-gray-900 text-white px-4 py-1.5 rounded-xl text-sm font-semibold disabled:opacity-50">
                {saving ? "..." : "Saqlash"}
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-4 flex flex-col gap-4">

              {/* Mijoz */}
              <div className="bg-gray-50 rounded-2xl p-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Mijoz ma'lumotlari</p>
                <div className="flex flex-col gap-2">
                  <input type="text" value={mijozIsm} onChange={e => setMijozIsm(e.target.value)}
                    placeholder="Mijoz ismi" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-gray-400" />
                  <input type="text" value={mijozTel} onChange={e => setMijozTel(e.target.value)}
                    placeholder="Telefon: +998 90 123 45 67" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-gray-400" />
                </div>
              </div>

              {/* Komplekt */}
              <div className="bg-gray-50 rounded-2xl p-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Komplekt tanlash</p>
                <div className="flex flex-col gap-2">
                  <select value={brend} onChange={e => { setBrend(e.target.value); setModel(""); }}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none bg-white">
                    <option value="">— Brend tanlang —</option>
                    {BRENDLAR.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
                  </select>
                  <select value={model} onChange={e => setModel(e.target.value)}
                    disabled={!brend}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none bg-white disabled:opacity-50">
                    <option value="">— Model tanlang —</option>
                    {(MODELLAR[brend] || []).map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </div>

              {/* Qismlar */}
              <div className="bg-gray-50 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Qismlar</p>
                  <button onClick={() => setShowQismModal(true)}
                    className="text-xs px-3 py-1.5 bg-gray-900 text-white rounded-lg font-semibold">
                    + Qo'shish
                  </button>
                </div>
                {qismlar.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">Hali qism qo'shilmagan</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {qismlar.map(q => (
                      <div key={q.id} className="bg-white rounded-xl p-3 border border-gray-100">
                        <div className="flex justify-between items-center mb-2">
                          <p className="text-xs font-semibold text-gray-500">{q.nom}</p>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-green-600">${(q.narx * q.miqdor).toFixed(2)}</p>
                            <button onClick={() => qismOchir(q.id)} className="text-red-400 text-sm">🗑️</button>
                          </div>
                        </div>
                        <p className="text-xs text-gray-700 mb-2">{q.mahsulot}</p>
                        <div className="flex items-center gap-2">
                          <button onClick={() => qismMiqdorOzgartir(q.id, -1)}
                            className="w-7 h-7 rounded-lg border border-gray-200 bg-gray-50 text-sm font-bold flex items-center justify-center">−</button>
                          <span className="text-sm font-semibold text-gray-900 min-w-6 text-center">{q.miqdor}</span>
                          <button onClick={() => qismMiqdorOzgartir(q.id, 1)}
                            className="w-7 h-7 rounded-lg border border-gray-200 bg-gray-50 text-sm font-bold flex items-center justify-center">+</button>
                          <span className="text-xs text-gray-400">dona</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Narx */}
              {qismlar.length > 0 && (
                <div className="bg-gray-50 rounded-2xl p-4">
                  <div className="flex justify-between mb-2">
                    <p className="text-sm text-gray-500">Tan narxi</p>
                    <p className="text-sm font-semibold text-gray-900">${tanNarxi.toFixed(2)}</p>
                  </div>
                  <div className="flex justify-between mb-1 pb-2 border-b border-gray-200">
                    <p className="text-base font-bold text-gray-900">Jami narx</p>
                    <p className="text-xl font-bold text-green-600">${jamiNarx.toFixed(2)}</p>
                  </div>
                  <p className="text-xs text-gray-400 text-right mb-3">{jamiSom.toLocaleString()} so'm</p>

                  {/* Foyda/Ziyon */}
                  {foiz !== 0 && (
                    <div className={`flex justify-between items-center px-3 py-2 rounded-xl mb-3 ${foiz > 0 ? "bg-blue-50" : "bg-red-50"}`}>
                      <p className={`text-sm font-semibold ${foiz > 0 ? "text-blue-700" : "text-red-600"}`}>
                        {foiz > 0 ? "💰 Foyda" : "📉 Ziyon"}
                      </p>
                      <p className={`text-sm font-bold ${foiz > 0 ? "text-blue-700" : "text-red-600"}`}>
                        {foiz > 0 ? "+" : ""}{qoshimcha < 0 ? "-" : ""}${Math.abs(qoshimcha).toFixed(2)}
                      </p>
                    </div>
                  )}

                  {/* Ustama/Chegirma */}
                  <div className="bg-white rounded-xl p-3 border border-gray-100">
                    <div className="flex justify-between mb-2">
                      <p className="text-xs text-gray-500">Ustama / Chegirma</p>
                      <span className={`text-sm font-bold ${foiz > 0 ? "text-blue-600" : foiz < 0 ? "text-red-500" : "text-gray-600"}`}>
                        {foiz > 0 ? "+" : ""}{foiz}%
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button onClick={() => setFoiz(f => Math.max(-50, f - 1))}
                        className="w-9 h-9 rounded-xl border border-gray-200 bg-gray-50 text-lg font-bold flex items-center justify-center">−</button>
                      <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div style={{ width: `${((foiz + 50) / 100) * 100}%`, background: foiz > 0 ? "#185FA5" : "#E24B4A" }}
                          className="h-full rounded-full transition-all" />
                      </div>
                      <button onClick={() => setFoiz(f => Math.min(50, f + 1))}
                        className="w-9 h-9 rounded-xl border border-gray-200 bg-gray-50 text-lg font-bold flex items-center justify-center">+</button>
                    </div>
                  </div>
                </div>
              )}

              {message && (
                <p className={`text-xs font-medium ${message.includes("❌") ? "text-red-500" : "text-gray-500"}`}>{message}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kalkulatsiya</h1>
          <p className="text-sm text-gray-400 mt-1">Kurs: {kurs.toLocaleString()} so'm</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="bg-gray-900 text-white px-4 py-2 rounded-xl text-sm font-semibold">
          + Yangi hisob
        </button>
      </div>

      {/* Hisoblar ro'yxati */}
      {hisoblar.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-4xl mb-3">🧮</p>
          <p className="text-gray-400">Hali hisob yo'q</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {hisoblar.map(h => (
            <div key={h.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-sm font-bold text-blue-700 flex-shrink-0">
                  {getInitials(h.mijozIsm)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{h.mijozIsm}</p>
                  <p className="text-xs text-gray-400">{h.mijozTel} · {h.brend} {h.model}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-green-600">${h.jamiNarx.toLocaleString()}</p>
                  <p className="text-xs text-gray-400">{new Date(h.createdAt).toLocaleDateString("uz-UZ")}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-400">{h.qismlar.length} ta qism · Tan: ${h.tanNarxi.toLocaleString()}</p>
                <button onClick={() => setDeleteModal(h)}
                  className="text-xs px-3 py-1.5 bg-red-50 text-red-500 rounded-lg font-semibold">
                  🗑️ O'chir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}