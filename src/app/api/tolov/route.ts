import { prisma } from "../../../lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const filialId = searchParams.get("filialId");
  const sotuvchiId = searchParams.get("sotuvchiId");

  const tolovlar = await prisma.tolov.findMany({
    where: {
      ...(filialId ? { filialId } : {}),
      ...(sotuvchiId ? { sotuvchiId } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: {
      filial: { select: { name: true } },
      sotuvchi: { select: { name: true } },
    },
  });
  return Response.json(tolovlar);
}

export async function POST(req: Request) {
  const body = await req.json();
  const tolov = await prisma.tolov.create({
    data: {
      sana: body.sana ? new Date(body.sana) : new Date(),
      filialId: body.filialId,
      sotuvchiId: body.sotuvchiId,
      mijoz: body.mijoz,
      summa: Number(body.summa),
      tolovTuri: body.tolovTuri || "Naqd",
      izoh: body.izoh || "",
    },
    include: {
      filial: { select: { name: true } },
      sotuvchi: { select: { name: true } },
    },
  });
  return Response.json(tolov);
}

export async function DELETE(req: Request) {
  const { id } = await req.json();
  await prisma.tolov.delete({ where: { id } });
  return Response.json({ ok: true });
}