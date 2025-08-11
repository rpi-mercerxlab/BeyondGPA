import { authOptions } from "@/lib/authentication/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { randomUUID } from "node:crypto";

export async function POST(
  request: Request,
  { params }: { params: { project_id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response(undefined, { status: 401 });
  }

  try {
    const project = await prisma.project.findUnique({
      where: { id: params.project_id },
      select: { contributors: { select: { email: true, role: true } } },
    });

    if (!project) {
      return new Response("Project Not Found", { status: 404 });
    }

    if (
      !project.contributors.some(
        (c) => c.email === session.user.email && c.role === "EDITOR"
      )
    ) {
      return new Response("Forbidden", { status: 403 });
    }

    const link_id = randomUUID();

    const updatedProject = await prisma.project.update({
      where: { id: params.project_id },
      data: {
        links: {
          create: {
            id: link_id,
          },
        },
      },
    });

    return new Response(JSON.stringify({ id: link_id }), { status: 200 });
  } catch (error) {
    console.error("Error fetching project:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
