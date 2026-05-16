"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [message, setMessage] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formElement = e.currentTarget;
    const form = new FormData(formElement);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name: form.get("name"),
        phone: form.get("phone"),
        password: form.get("password"),
      }),
    });

    const data = await res.json();

    if (data.error) {
      setMessage(data.error);
      return;
    }

    setMessage("Ro‘yxatdan o‘tildi. Admin tasdiqlashini kuting.");
    formElement.reset();

    setTimeout(() => {
      router.push("/admin/login");
    }, 1500);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-3xl bg-white p-6 shadow-sm"
      >
        <h1 className="text-2xl font-bold text-slate-900">
          Ro‘yxatdan o‘tish
        </h1>

        <p className="mt-2 text-slate-500">
          Admin panelga kirish uchun ariza yuboring
        </p>

        <div className="mt-6 space-y-4">
          <input
            name="name"
            placeholder="Ism"
            className="w-full rounded-xl border border-slate-300 p-3 outline-none focus:border-blue-500"
          />

          <input
            name="phone"
            placeholder="+998 00 000 00 00"
            className="w-full rounded-xl border border-slate-300 p-3 outline-none focus:border-blue-500"
          />

          <input
            name="password"
            type="password"
            placeholder="Parol"
            className="w-full rounded-xl border border-slate-300 p-3 outline-none focus:border-blue-500"
          />

          <button
            type="submit"
            className="w-full rounded-xl bg-slate-950 p-3 font-semibold text-white"
          >
            Ro‘yxatdan o‘tish
          </button>
        </div>

        {message && (
          <p className="mt-4 rounded-xl bg-slate-100 p-3 text-center text-sm text-slate-700">
            {message}
          </p>
        )}
      </form>
    </div>
  );
}