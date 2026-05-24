import { prisma } from "../../../../lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { phone, password } = body;

    if (!phone || !password) {
      return NextResponse.json(
        { error: "Telefon va parol kiriting" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { phone: String(phone) },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Foydalanuvchi topilmadi" },
        { status: 404 }
      );
    }

    if (user.password !== String(password)) {
      return NextResponse.json(
        { error: "Parol noto’g’ri" },
        { status: 401 }
      );
    }

    if (user.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Siz hali tasdiqlanmagansiz" },
        { status: 403 }
      );
    }

    const safeUser = {
      id: user.id,
      name: user.name,
      phone: user.phone,
      role: user.role,
      status: user.status,
    };

    const res = NextResponse.json({
      message: "Kirish muvaffaqiyatli",
      user: safeUser,
    });

    res.cookies.set("bk_user", JSON.stringify(safeUser), {
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  } catch (err) {
    console.error("Login xatosi:", err);
    return NextResponse.json(
      { error: "Server xatosi. Qayta urinib ko’ring." },
      { status: 500 }
    );
  }
}