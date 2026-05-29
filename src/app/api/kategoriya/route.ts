import { prisma } from "../../../lib/prisma";

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-");
}

export async function GET() {
  try {
    const kategoriyalar = await prisma.kategoriya.findMany({
      include: {
        children: { orderBy: { createdAt: "asc" } },
      },
      orderBy: { createdAt: "asc" },
    });

    const products = await prisma.product.findMany({
      select: { category: true },
    });

    const result = kategoriyalar.map((k) => ({
      ...k,
      _count: {
        mahsulotlar: products.filter((p) => p.category === k.name).length,
      },
    }));

    return Response.json(result);
  } catch (error) {
    console.error("Kategoriya GET error:", error);
    return Response.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const body = await req.json();
  const slug = slugify(body.name);
  const kategoriya = await prisma.kategoriya.create({
    data: {
      name: String(body.name),
      slug,
      icon: body.icon || "📦",
      parentId: body.parentId || null,
    },
  });
  return Response.json(kategoriya);
}

export async function PUT(req: Request) {
  const body = await req.json();

  const old = await prisma.kategoriya.findUnique({
    where: { id: body.id },
    select: { name: true },
  });

  const slug = slugify(body.name);

  const kategoriya = await prisma.kategoriya.update({
    where: { id: body.id },
    data: {
      name: String(body.name),
      slug,
      icon: body.icon,
      parentId: body.parentId || null,
    },
  });

  if (old && old.name !== body.name) {
    await prisma.product.updateMany({
      where: { category: old.name },
      data: { category: String(body.name) },
    });
  }

  return Response.json(kategoriya);
}

export async function DELETE(req: Request) {
  const { id } = await req.json();
  await prisma.kategoriya.delete({ where: { id } });
  return Response.json({ ok: true });
}