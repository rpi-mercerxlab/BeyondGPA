import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authentication/auth";

export async function POST(
  _: Request,
  { params }: { params: Promise<{ project_id: string; tag_id: string }> }
) {
  const { project_id, tag_id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response(undefined, { status: 401 });
  }

  try {
    const project = await prisma.project.findUnique({
      where: { id: project_id },
      include: {
        contributors: { select: { email: true, role: true } },
        skillTags: { select: { id: true } },
      },
    });

    if (!project) {
      return new Response("Project Not Found", { status: 404 });
    }

    if (
      project.contributors.includes({
        email: session.user.email,
        role: "EDITOR",
      }) === false
    ) {
      return new Response(undefined, { status: 403 });
    }

    if (project.skillTags.includes({ id: tag_id }) === true) {
      return new Response(undefined, { status: 200 });
    }

    await prisma.project.update({
      where: { id: project_id },
      data: {
        skillTags: {
          connect: { id: tag_id },
        },
      },
    });

    return new Response(undefined, { status: 200 });
  } catch (error) {
    console.error("Error adding skill tag to project:", error);
    return new Response(undefined, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ project_id: string; tag_id: string }> }
) {
  const { project_id, tag_id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response(undefined, { status: 401 });
  }

  try {
    const project = await prisma.project.findUnique({
      where: { id: project_id },
      include: {
        contributors: { select: { email: true, role: true } },
        skillTags: { select: { id: true } },
      },
    });

    if (!project) {
      return new Response("Project Not Found", { status: 404 });
    }

    if (
      project.contributors.includes({
        email: session.user.email,
        role: "EDITOR",
      }) === false
    ) {
      return new Response(undefined, { status: 403 });
    }

    if (project.skillTags.includes({ id: tag_id }) === false) {
      return new Response("Skill Tag Not Associated with Project", {
        status: 404,
      });
    }

    await prisma.project.update({
      where: { id: project_id },
      data: {
        skillTags: {
          disconnect: { id: tag_id },
        },
      },
    });

    return new Response(undefined, { status: 204 });
  } catch (error) {
    console.error("Error removing skill tag from project:", error);
    return new Response(undefined, { status: 500 });
  }
}
