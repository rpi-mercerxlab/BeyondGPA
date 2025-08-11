import { authOptions } from "@/lib/authentication/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

export async function POST(
  _: Request,
  { params }: { params: { project_id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response(undefined, { status: 401 });
  }

  try {
    const project = await prisma.project.findUnique({
      where: {
        id: params.project_id,
      },
      select: {
        contributors: { select: { email: true, role: true } },
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
      return new Response("Not a project contributor", { status: 403 });
    }

    const question = await prisma.questionPrompt.create({
      data: {
        projectId: params.project_id,
      },
    });

    return new Response(JSON.stringify({ id: question.id }), { status: 201 });
  } catch (error) {
    console.error("Error creating question:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
