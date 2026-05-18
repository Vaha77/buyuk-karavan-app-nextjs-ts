import { prisma } from "../../../../lib/prisma";

export async function POST(req: Request) {
  const { userId, role, salesLimit } = await req.json();

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      role,
      ...(salesLimit !== undefined ? { salesLimit: salesLimit } : {}),
    },
  });

  return Response.json(user);
}