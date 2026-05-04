export default function AdminPage() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <p className="text-slate-500">Mahsulotlar</p>
        <h2 className="mt-2 text-3xl font-bold">0</h2>
      </div>

      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <p className="text-slate-500">Foydalanuvchilar</p>
        <h2 className="mt-2 text-3xl font-bold">0</h2>
      </div>

      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <p className="text-slate-500">Buyurtmalar</p>
        <h2 className="mt-2 text-3xl font-bold">0</h2>
      </div>
    </div>
  );
}