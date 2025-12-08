
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "../../../../../lib/server-auth";


export async function POST(req: Request) {
  const session = await getAuthSession();
  if (!session?.user || session.user.role !== "admin") {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = await req.json();

  const newBook = await prisma.book.create({
    data: {
      title: body.title,
      description: body.description,
      userId: session.user.id,
    },
  });

  return Response.json({ success: true, book: newBook });
}
