"use client";

import { useState } from "react";

export default function AdminLoginPage() {
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    const form = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: form.get("phone"),
          password: form.get("password"),
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setMessage(data.error || "Xatolik yuz berdi");
        return;
      }

      localStorage.setItem("bk_user", JSON.stringify(data.user));
      window.location.href = "/admin";
    } catch {
      setMessage("Serverga ulanishda xatolik. Qayta urinib ko'ring.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-3xl bg-white p-6 shadow-sm"
      >
        <h1 className="text-2xl font-bold text-slate-900">Admin Login</h1>
        <p className="mt-2 text-slate-500">
          Buyuk Karavan admin paneliga kirish
        </p>

        <div className="mt-6 space-y-4">
          <input
            name="phone"
            placeholder="Telefon raqam"
            className="w-full rounded-xl border border-slate-300 p-3 outline-none focus:border-blue-500"
          />

         <div className="relative">
  <input
    name="password"
    type={showPassword ? "text" : "password"}
    placeholder="Parol"
    className="w-full rounded-xl border border-slate-300 p-3 pr-16 outline-none focus:border-blue-500"
  />

  <button
    type="button"
    onClick={() => setShowPassword(!showPassword)}
    className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-500"
  >
    {showPassword ? "Yashir" : "Ko‘rish"}
  </button>
</div>

          <button
            disabled={loading}
            className="w-full rounded-xl bg-slate-950 p-3 font-semibold text-white disabled:opacity-60"
          >
            {loading ? "Yuklanmoqda..." : "Kirish"}
          </button>
        </div>
<p className="mt-4 text-center text-sm text-slate-500">
  Hali akkauntingiz yo‘qmi?{" "}
  <a href="/admin/register" className="font-semibold text-blue-600">
    Ro‘yxatdan o‘tish
  </a>
</p>
        {message && (
          <p className="mt-4 rounded-xl bg-red-50 p-3 text-center text-sm text-red-600">
            {message}
          </p>
        )}
      </form>
    </div>
  );
}