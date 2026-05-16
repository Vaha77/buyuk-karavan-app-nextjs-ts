import { prisma } from "../../../lib/prisma";

export async function GET() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  });
  return Response.json(products);
}

export async function POST(req: Request) {
  const body = await req.json();
  const kurs = 12500;

  const product = await prisma.product.create({
    data: {
      name: String(body.name),
      category: String(body.category),
      country: String(body.country),
      image: String(body.image),
      images: body.images || [],
      priceUsd: Number(body.priceUsd),
      priceUzs: Number(body.priceUsd) * kurs,
      shortDesc: String(body.shortDesc),
      fullDesc: String(body.fullDesc),
      rating: Number(body.rating || 5),
      isActive: true,
    },
  });

  return Response.json(product);
}

export async function PUT(req: Request) {
  const body = await req.json();
  const kurs = 12500;

  const product = await prisma.product.update({
    where: { id: body.id },
    data: {
      name: String(body.name),
      category: String(body.category),
      country: String(body.country),
      image: String(body.image),
      images: body.images || [],
      priceUsd: Number(body.priceUsd),
      priceUzs: Number(body.priceUsd) * kurs,
      shortDesc: String(body.shortDesc),
      fullDesc: String(body.fullDesc),
      rating: Number(body.rating || 5),
    },
  });

  return Response.json(product);
}

export async function DELETE(req: Request) {
  const { id } = await req.json();
  await prisma.product.delete({ where: { id } });
  return Response.json({ ok: true });
}