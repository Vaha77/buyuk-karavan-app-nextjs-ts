import { prisma } from "../../../../lib/prisma";

export async function GET() {
  const users = await prisma.user.findMany({
    where: {
      status: "ACTIVE",
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return Response.json(users);
}