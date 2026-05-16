import { prisma } from "../../../../lib/prisma";

export async function POST(req: Request) {
  const { id } = await req.json();

  const user = await prisma.user.update({
    where: { id },
    data: { status: "BLOCKED" },
  });

  return Response.json(user);
}