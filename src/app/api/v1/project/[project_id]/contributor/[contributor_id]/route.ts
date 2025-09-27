import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authentication/auth";

export async function PUT(
  request: Request,
  {
    params,
  }: { params: Promise<{ project_id: string; contributor_id: string }> }
) {
  const { project_id, contributor_id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const json = await request.json();
  const contributor_name = json.name;
  const contributor_email = json.email;
  const contributor_role = json.role;

  if (!(contributor_role === "EDITOR" || contributor_role === "VIEWER")) {
    return new Response("Invalid Request Body", { status: 400 });
  }

  try {
    const project = await prisma.project.findUnique({
      where: { id: project_id },
      include: { owner: { select: { id: true, email: true } } },
    });

    if (!project) {
      return new Response("Project Not Found", { status: 404 });
    }

    if (project.owner.id !== session.user.id) {
      return new Response("Forbidden", { status: 403 });
    }

    const contributor = await prisma.contributor.findUnique({
      where: { id: contributor_id },
    });

    if (!contributor) {
      return new Response("Contributor Not Found", { status: 404 });
    }

    if (contributor.email === project.owner.email) {
      return new Response(
        "Cannot edit the collaborator info for the project owner.",
        { status: 400 }
      );
    }

    // Check if the contributor is a registered user
    const registeredUser = await prisma.user.findUnique({
      where: { email: contributor_email },
      select: { id: true },
    });

    const resp = await prisma.contributor.update({
      where: { id: contributor_id },
      data: {
        name: contributor_name,
        email: contributor_email,
        role: contributor_role,
        id: registeredUser ? registeredUser.id : undefined,
      },
    });

    const responseBody = {
      name: resp.name,
      email: resp.email,
      role: resp.role,
      id: resp.id,
    };

    return new Response(JSON.stringify(responseBody), { status: 200 });
  } catch (error) {
    console.error("Error transferring project ownership:", error);
    return new Response(undefined, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  {
    params,
  }: { params: Promise<{ project_id: string; contributor_id: string }> }
) {
  const { project_id, contributor_id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const project = await prisma.project.findUnique({
      where: { id: project_id },
      include: { owner: { select: { id: true } } },
    });

    if (!project) {
      return new Response("Project Not Found", { status: 404 });
    }

    if (project.owner.id !== session.user.id) {
      return new Response("Forbidden", { status: 403 });
    }

    const contributor = await prisma.contributor.findUnique({
      where: { id: contributor_id },
    });

    if (!contributor) {
      return new Response("Contributor Not Found", { status: 404 });
    }

    if (contributor.userId === project.owner.id) {
      return new Response("Cannot remove project owner", { status: 400 });
    }

    await prisma.contributor.delete({
      where: { id: contributor_id },
    });

    return new Response(undefined, { status: 204 });
  } catch (error) {
    console.error("Error deleting contributor:", error);
    return new Response(undefined, { status: 500 });
  }
}
