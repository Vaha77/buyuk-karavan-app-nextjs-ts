"use client";

import { useState } from "react";

export default function AdminLoginPage() {
  const [message, setMessage] = useState("");
const [showPassword, setShowPassword] = useState(false);
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const form = new FormData(e.currentTarget);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        phone: form.get("phone"),
        password: form.get("password"),
      }),
    });

    const data = await res.json();

    if (data.error) {
      setMessage(data.error);
      return;
    }

    localStorage.setItem("bk_user", JSON.stringify(data.user));
    window.location.href = "/admin";
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
            placeholder="Telefon yoki email"
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

          <button className="w-full rounded-xl bg-slate-950 p-3 font-semibold text-white">
            Kirish
          </button>
        </div>

        {message && (
          <p className="mt-4 rounded-xl bg-red-50 p-3 text-center text-sm text-red-600">
            {message}
          </p>
        )}
      </form>
    </div>
  );
}