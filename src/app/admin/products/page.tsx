"use client";

import { useState } from "react";

export default function ProductsPage() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div>
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Mahsulotlar</h1>

        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl"
        >
          + Mahsulot qo‘shish
        </button>
      </div>

      {/* LIST */}
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <p className="text-gray-500">Hozircha mahsulot yo‘q</p>
      </div>

      {/* FORM MODAL */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              Yangi mahsulot qo‘shish
            </h2>

            <form className="space-y-4">
              <input
                placeholder="Mahsulot nomi"
                className="w-full border p-3 rounded-xl"
              />

              <input
                placeholder="Kategoriya (masalan: Kompressor)"
                className="w-full border p-3 rounded-xl"
              />

              <input
                type="number"
                placeholder="Tan narx ($)"
                className="w-full border p-3 rounded-xl"
              />

              <button className="w-full bg-blue-600 text-white py-3 rounded-xl">
                Saqlash
              </button>
            </form>

            <button
              onClick={() => setShowForm(false)}
              className="mt-3 text-gray-500"
            >
              Yopish
            </button>
          </div>
        </div>
      )}
    </div>
  );
}