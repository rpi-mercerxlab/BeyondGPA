import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authentication/auth";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ project_id: string }> }
) {
  const { project_id } = await params;
  const json = await request.json();
  const new_owner_email = json.email;
  if (!new_owner_email) {
    return new Response(undefined, { status: 400 });
  }

  const session = await getServerSession(authOptions);

  if (!session) {
    return new Response(undefined, { status: 401 });
  }

  try {
    const project = await prisma.project.findUnique({
      where: { id: project_id },
      select: {
        ownerId: true,
        contributors: {
          select: { email: true, name: true, id: true, role: true },
        },
      },
    });

    if (!project) {
      return new Response("Project Not Found", { status: 404 });
    }

    if (project.ownerId !== session.user.id) {
      return new Response(undefined, { status: 403 });
    }

    const new_owner = await prisma.user.findUnique({
      where: { email: new_owner_email },
      select: { id: true, email: true, firstName: true, lastName: true },
    });

    if (!new_owner) {
      return new Response("New Owner Not Found", { status: 404 });
    }

    await prisma.project.update({
      where: { id: project_id },
      data: {
        ownerId: new_owner.id,
      },
    });

    // If the new owner is not already a contributor, add them as an editor
    if (
      !project.contributors.some(
        (contributor) => contributor.email === new_owner_email
      )
    ) {
      await prisma.project.update({
        where: { id: project_id },
        data: {
          contributors: {
            create: {
              email: new_owner.email!,
              name: `${new_owner.firstName} ${new_owner.lastName}`.trim(),
              userId: new_owner.id,
              role: "EDITOR",
            },
          },
        },
      });
    }

    // If the new owner is already a contributor, update their role to editor
    // Find the contributor entry
    const contributor = project.contributors.find(
      (contributor) => contributor.email === new_owner_email
    );

    if (contributor && contributor.role !== "EDITOR") {
      await prisma.project.update({
        where: { id: project_id },
        data: {
          contributors: {
            update: {
              where: { id: contributor.id },
              data: { role: "EDITOR" },
            },
          },
        },
      });
    }

    // Get the updated info
    const updated_project = await prisma.project.findUnique({
      where: { id: project_id },
      select: {
        owner: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        contributors: {
          select: { name: true, email: true, id: true, role: true },
        },
      },
    });

    const response = {
      name: `${updated_project?.owner.firstName} ${updated_project?.owner.lastName}`.trim(),
      email: updated_project?.owner.email,
      contributors: updated_project?.contributors.map((contributor) => ({
        name: contributor.name,
        email: contributor.email,
        id: contributor.id,
        role: contributor.role,
      })),
    };

    return new Response(JSON.stringify(response), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(undefined, { status: 500 });
  }
}
