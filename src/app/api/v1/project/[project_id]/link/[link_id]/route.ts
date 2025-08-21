import { authOptions } from "@/lib/authentication/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ project_id: string; link_id: string }> }
) {
  const { project_id, link_id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response(undefined, { status: 401 });
  }

  try {
    const { url, label } = await request.json();

    if (!isValidUrl(url)) {
      return new Response("Invalid URL", { status: 400 });
    }

    const project = await prisma.project.findUnique({
      where: {
        id: project_id,
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

    await prisma.link.update({
      where: {
        id: link_id,
      },
      data: {
        url,
        label,
      },
    });

    return new Response(JSON.stringify({ url, label, id: link_id }), {
      status: 200,
    });
  } catch (error) {
    console.error("Error updating link:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

function isValidUrl(str: string): boolean {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ project_id: string; link_id: string }> }
) {
  const { project_id, link_id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response(undefined, { status: 401 });
  }

  try {
    const project = await prisma.project.findUnique({
      where: {
        id: project_id,
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

    await prisma.link.delete({
      where: {
        id: link_id,
      },
    });

    return new Response(undefined, { status: 204 });
  } catch (error) {
    console.error("Error deleting link:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
