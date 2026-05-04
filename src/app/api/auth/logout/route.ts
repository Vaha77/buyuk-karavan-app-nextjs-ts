import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ message: "Chiqildi" });

  // 🔥 COOKIE O‘CHIRAMIZ
  res.cookies.set("bk_user", "", {
    path: "/",
    maxAge: 0,
  });

  return res;
}