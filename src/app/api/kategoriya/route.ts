import { prisma } from "../../../lib/prisma";

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-");
}

export async function GET() {
  const kategoriyalar = await prisma.kategoriya.findMany({
    orderBy: { createdAt: "asc" },
    include: { _count: { select: { mahsulotlar: true } } },
  });
  return Response.json(kategoriyalar);
}

export async function POST(req: Request) {
  const body = await req.json();
  const slug = slugify(body.name);
  const kategoriya = await prisma.kategoriya.create({
    data: {
      name: String(body.name),
      slug,
      icon: body.icon || "📦",
    },
  });
  return Response.json(kategoriya);
}

export async function PUT(req: Request) {
  const body = await req.json();
  const slug = slugify(body.name);
  const kategoriya = await prisma.kategoriya.update({
    where: { id: body.id },
    data: {
      name: String(body.name),
      slug,
      icon: body.icon,
    },
  });
  return Response.json(kategoriya);
}

export async function DELETE(req: Request) {
  const { id } = await req.json();
  await prisma.kategoriya.delete({ where: { id } });
  return Response.json({ ok: true });
}