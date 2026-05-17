import { prisma } from "../../../lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search");

  const komplektlar = await prisma.komplekt.findMany({
    where: {
      ...(search ? {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { modelCode: { contains: search, mode: "insensitive" } },
        ],
      } : {}),
    },
    include: {
      itemlar: {
        include: {
          mahsulot: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return Response.json(komplektlar);
}

export async function POST(req: Request) {
  const body = await req.json();

  const komplekt = await prisma.komplekt.create({
    data: {
      name:        String(body.name),
      modelCode:   String(body.modelCode || ""),
      image:       String(body.image || ""),
      description: String(body.description || ""),
      isActive:    true,
    },
  });

  return Response.json(komplekt);
}

export async function PUT(req: Request) {
  const body = await req.json();

  const komplekt = await prisma.komplekt.update({
    where: { id: body.id },
    data: {
      name:        String(body.name),
      modelCode:   String(body.modelCode || ""),
      image:       String(body.image || ""),
      description: String(body.description || ""),
    },
  });

  return Response.json(komplekt);
}

export async function DELETE(req: Request) {
  const { id } = await req.json();
  await prisma.komplekt.delete({ where: { id } });
  return Response.json({ ok: true });
}