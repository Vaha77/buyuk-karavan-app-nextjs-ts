import { prisma } from "../../../lib/prisma";

const KURS = 12500;

export async function GET() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  });
  return Response.json(products);
}

export async function POST(req: Request) {
  const body = await req.json();

  const product = await prisma.product.create({
    data: {
      name:      String(body.name),
      category:  String(body.category || ""),
      tur:       String(body.tur || "oddiy"),
      birlik:    String(body.birlik || "dona"),
      kgPerMetr: Number(body.kgPerMetr || 0),
      image:     String(body.image || ""),
      images:    body.images || [],
      priceUsd:  Number(body.priceUsd || 0),
      priceUzs:  Number(body.priceUsd || 0) * KURS,
      shortDesc: String(body.shortDesc || ""),
      fullDesc:  String(body.fullDesc || ""),
      rating:    0,
      isActive:  true,
    },
  });

  return Response.json(product);
}

export async function PUT(req: Request) {
  const body = await req.json();

  const product = await prisma.product.update({
    where: { id: body.id },
    data: {
      name:      String(body.name),
      category:  String(body.category || ""),
      tur:       String(body.tur || "oddiy"),
      birlik:    String(body.birlik || "dona"),
      kgPerMetr: Number(body.kgPerMetr || 0),
      image:     String(body.image || ""),
      images:    body.images || [],
      priceUsd:  Number(body.priceUsd || 0),
      priceUzs:  Number(body.priceUsd || 0) * KURS,
      shortDesc: String(body.shortDesc || ""),
      fullDesc:  String(body.fullDesc || ""),
    },
  });

  return Response.json(product);
}

export async function DELETE(req: Request) {
  const { id } = await req.json();
  await prisma.product.delete({ where: { id } });
  return Response.json({ ok: true });
}