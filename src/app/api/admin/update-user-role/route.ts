import { prisma } from "../../../../lib/prisma";

export async function POST(req: Request) {
  const { id, role } = await req.json();

  const user = await prisma.user.update({
    where: { id },
    data: { role },
  });

  return Response.json(user);
}