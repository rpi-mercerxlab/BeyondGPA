import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authentication/auth";

export async function POST(
  _: Request,
  { params }: { params: Promise<{ project_id: string }> }
) {
  const { project_id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response(JSON.stringify({ id: undefined }), { status: 401 });
  }

  try {
    const project = await prisma.project.findUnique({
      where: { id: project_id },
      include: { owner: { select: { id: true } } },
    });

    if (!project) {
      return new Response(JSON.stringify({ id: undefined }), { status: 404 });
    }

    if (project.owner.id !== session.user.id) {
      return new Response(JSON.stringify({ id: undefined }), { status: 403 });
    }

    const resp = await prisma.project.update({
      where: { id: project_id },
      data: {
        contributors: {
          create: {},
        },
      },
      select: {
        contributors: {
          select: {
            id: true,
            name: true,
          },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (resp.contributors.length !== 1) {
      return new Response(JSON.stringify({ id: undefined }), { status: 500 });
    }

    const newContributor = resp.contributors[0];

    if (newContributor.name !== "") {
      throw new Error("New contributor has a name already set.");
    }

    const responseBody = {
      id: newContributor.id,
    };

    return new Response(JSON.stringify(responseBody), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error adding Contributor:", error);
    return new Response(JSON.stringify({ id: undefined }), { status: 500 });
  }
}
