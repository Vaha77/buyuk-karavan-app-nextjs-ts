import { prisma } from "../../../../lib/prisma";

export async function POST(req: Request) {
  const body = await req.json();
  const { name, phone, password } = body;

  if (!name || !phone || !password) {
    return Response.json(
      { error: "Ma'lumot yetarli emas" },
      { status: 400 }
    );
  }

  const existingUser = await prisma.user.findUnique({
    where: {
      phone: String(phone),
    },
  });

  if (existingUser) {
    return Response.json(
      { error: "Bu telefon/email bilan foydalanuvchi mavjud" },
      { status: 400 }
    );
  }

  const user = await prisma.user.create({
    data: {
      name: String(name),
      phone: String(phone),
      password: String(password),
      status: "PENDING",
      role: "VIEWER",
    },
  });

  return Response.json({
    message: "Ro‘yxatdan o‘tildi. Admin tasdiqlashini kuting.",
    user,
  });
}