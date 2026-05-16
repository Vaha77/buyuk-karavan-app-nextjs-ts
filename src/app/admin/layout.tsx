"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type User = {
  id: string;
  name: string;
  phone: string;
  role: "SUPER_ADMIN" | "ADMIN" | "MANAGER" | "SELLER" | "VIEWER";
  status: string;
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("bk_user");

    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  if (pathname === "/admin/login" || pathname === "/admin/register") {
    return <>{children}</>;
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", {
      method: "POST",
    });

    localStorage.removeItem("bk_user");
    router.push("/admin/login");
  }

  const isSuperAdmin = user?.role === "SUPER_ADMIN";

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
        className={`fixed left-0 top-0 z-50 flex h-screen w-72 flex-col bg-slate-950 p-5 text-white transition-transform duration-300 lg:sticky lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-8 rounded-2xl bg-white/10 p-4">
          <p className="text-xs font-semibold text-blue-300">BUYUK KARAVAN</p>
          <h2 className="text-2xl font-bold">Admin Panel</h2>

    {user && (
  <div className="mt-2 text-sm">
    <p className="font-medium text-white">
      {user.name}
    </p>
    <span className="text-xs text-blue-400">
      {user.role}
    </span>
  </div>
)}
        </div>

        <nav className="grid gap-2">
          <Link
            onClick={() => setOpen(false)}
            href="/admin"
            className="rounded-xl px-4 py-3 hover:bg-white/10"
          >
            Dashboard
          </Link>

          <Link
            onClick={() => setOpen(false)}
            href="/admin/products"
            className="rounded-xl px-4 py-3 hover:bg-white/10"
          >
            Mahsulotlar
          </Link>

          {isSuperAdmin && (
            <>
              <Link
                onClick={() => setOpen(false)}
                href="/admin/users"
                className="rounded-xl px-4 py-3 hover:bg-white/10"
              >
                Foydalanuvchilar
              </Link>

              <Link
                onClick={() => setOpen(false)}
                href="/admin/pending"
                className="rounded-xl px-4 py-3 hover:bg-white/10"
              >
                Tasdiq kutayotganlar
              </Link>
            </>
          )}
        </nav>

        <button
          onClick={handleLogout}
          className="mt-auto rounded-xl bg-red-600 px-4 py-3 font-semibold text-white transition hover:bg-red-700"
        >
          Chiqish
        </button>
      </aside>

      <main className="flex-1 p-4 md:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">{children}</div>
      </main>
    </div>
  );
}