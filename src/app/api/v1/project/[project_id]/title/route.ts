import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authentication/auth";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ project_id: string }> }
) {
  const { project_id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response(JSON.stringify({ visibility: undefined }), {
      status: 401,
    });
  }

  const json = await request.json();
  const new_title = json.title;
  if (
    typeof new_title !== "string" ||
    new_title.length === 0 ||
    new_title.length > 100
  ) {
    return new Response(JSON.stringify({ title: undefined }), { status: 400 });
  }

  try {
    const project = await prisma.project.findUnique({
      where: { id: project_id },
      include: { owner: { select: { id: true } } },
    });

    if (!project) {
      return new Response(JSON.stringify({ title: undefined }), {
        status: 404,
      });
    }

    if (project.owner.id !== session.user.id) {
      return new Response(JSON.stringify({ title: undefined }), {
        status: 403,
      });
    }

    await prisma.project.update({
      where: { id: project_id },
      data: { title: new_title },
    });

    return new Response(JSON.stringify({ title: new_title }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error updating project title:", error);
    return new Response(JSON.stringify({ title: undefined }), { status: 500 });
  }
}
