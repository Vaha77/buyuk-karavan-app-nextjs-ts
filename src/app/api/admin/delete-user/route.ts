import { prisma } from "../../../../lib/prisma";

export async function DELETE(req: Request) {
  const { id } = await req.json();
  await prisma.user.delete({ where: { id } });
  return Response.json({ ok: true });
}