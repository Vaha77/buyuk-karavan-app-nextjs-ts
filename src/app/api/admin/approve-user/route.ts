import { prisma } from "../../../../lib/prisma";

export async function POST(req: Request) {
  const { id } = await req.json();

  await prisma.user.update({
    where: { id },
    data: { status: "ACTIVE" },
  });

  return Response.json({ message: "Tasdiqlandi" });
}