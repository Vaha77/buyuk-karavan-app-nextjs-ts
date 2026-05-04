"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  if (pathname === "/admin/register" || pathname === "/admin/login") {
    return <>{children}</>;
  }

  
  return (
    <div className="min-h-screen bg-slate-100 lg:flex">
      <header className="sticky top-0 z-40 flex items-center justify-between bg-white px-4 py-3 shadow-sm lg:hidden">
        <div>
          <p className="text-xs font-semibold text-blue-600">BUYUK KARAVAN</p>
          <h1 className="text-lg font-bold">Admin Panel</h1>
        </div>

        <button
          onClick={() => setOpen(true)}
          className="rounded-xl bg-slate-950 px-4 py-2 text-white"
        >
          ☰
        </button>
      </header>

      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 h-screen w-72 bg-slate-950 p-5 text-white transition-transform duration-300 lg:sticky lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-8 flex items-start justify-between rounded-2xl bg-white/10 p-4">
          <div>
            <p className="text-xs font-semibold text-blue-300">BUYUK KARAVAN</p>
            <h2 className="text-2xl font-bold">Admin Panel</h2>
          </div>

          <button onClick={() => setOpen(false)} className="text-2xl lg:hidden">
            ×
          </button>
        </div>

        <nav className="grid gap-2">
          <Link onClick={() => setOpen(false)} href="/admin" className="rounded-xl px-4 py-3 hover:bg-white/10">
            Dashboard
          </Link>

          <Link onClick={() => setOpen(false)} href="/admin/products" className="rounded-xl px-4 py-3 hover:bg-white/10">
            Mahsulotlar
          </Link>

          <Link onClick={() => setOpen(false)} href="/admin/users" className="rounded-xl px-4 py-3 hover:bg-white/10">
            Foydalanuvchilar
          </Link>
        </nav>
      </aside>

      <main className="flex-1 p-4 md:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">{children}</div>
      </main>
    </div>
  );
}