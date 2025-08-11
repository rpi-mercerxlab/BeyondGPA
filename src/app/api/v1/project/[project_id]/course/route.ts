import { authOptions } from "@/lib/authentication/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

export async function PUT(
  request: Request,
  { params }: { params: { project_id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const project = await prisma.project.findUnique({
      where: {
        id: params.project_id,
      },
      select: {
        contributors: {
          select: {
            email: true,
            role: true,
          },
        },
      },
    });

    if (!project) {
      return new Response("Project not found", { status: 404 });
    }

    if (
      !project.contributors.some(
        (c) => c.email === session.user.email && c.role === "EDITOR"
      )
    ) {
      return new Response("Forbidden", { status: 403 });
    }

    const reqJSON = await request.json();
    const new_group = reqJSON.group;

    await prisma.project.update({
      where: {
        id: params.project_id,
      },
      data: {
        group: new_group,
      },
    });

    return new Response(JSON.stringify({ group: new_group }), { status: 200 });
  } catch (error) {
    console.error("Error updating project:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
