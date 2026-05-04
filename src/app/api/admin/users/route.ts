import { prisma } from "../../../../lib/prisma";

export async function GET() {
  const users = await prisma.user.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return Response.json(users);
}