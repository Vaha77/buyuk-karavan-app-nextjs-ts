import { prisma } from "../../../../lib/prisma";

export async function POST(req: Request) {
  const { userId, role } = await req.json();

  const user = await prisma.user.update({
    where: { id: userId },
    data: { role },
  });

  return Response.json(user);
}