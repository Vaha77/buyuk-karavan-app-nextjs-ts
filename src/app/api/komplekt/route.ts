import { prisma } from "../../../lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const source = searchParams.get("source");
  const search = searchParams.get("search");

  const komplektlar = await prisma.komplekt.findMany({
    where: {
      ...(source && source !== "all" ? { source } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search } },
              { modelCode: { contains: search } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  return Response.json(komplektlar);
}

export async function POST(req: Request) {
  const body = await req.json();

  const komplekt = await prisma.komplekt.create({
    data: {
      name: String(body.name),
      image: String(body.image),
      source: String(body.source),
      modelCode: String(body.modelCode),
      fan: String(body.fan),
      nerj: String(body.nerj),
      truba: String(body.truba || ""),
      extras: body.extras || [],
      priceUsd: Number(body.priceUsd),
      description: String(body.description || ""),
    },
  });

  return Response.json(komplekt);
}

export async function PUT(req: Request) {
  const body = await req.json();

  const komplekt = await prisma.komplekt.update({
    where: { id: body.id },
    data: {
      name: String(body.name),
      image: String(body.image),
      source: String(body.source),
      modelCode: String(body.modelCode),
      fan: String(body.fan),
      nerj: String(body.nerj),
      truba: String(body.truba || ""),
      extras: body.extras || [],
      priceUsd: Number(body.priceUsd),
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