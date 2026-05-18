import { prisma } from "../../../lib/prisma";

export async function GET() {
  const filiallar = await prisma.filial.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      _count: { select: { tolovlar: true } },
    },
  });
  return Response.json(filiallar);
}

export async function POST(req: Request) {
  const body = await req.json();
  const filial = await prisma.filial.create({
    data: {
      name: String(body.name),
      manzil: body.manzil || "",
      limit: body.limit ? Number(body.limit) : 500000,
    },
  });
  return Response.json(filial);
}

export async function PUT(req: Request) {
  const body = await req.json();
  const filial = await prisma.filial.update({
    where: { id: body.id },
    data: {
      name: String(body.name),
      manzil: body.manzil || "",
      limit: Number(body.limit),
    },
  });
  return Response.json(filial);
}

export async function DELETE(req: Request) {
  const { id } = await req.json();
  await prisma.filial.delete({ where: { id } });
  return Response.json({ ok: true });
}