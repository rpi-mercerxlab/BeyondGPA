import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authentication/auth";

export async function PUT(
  request: Request,
  { params }: { params: { project_id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response(JSON.stringify("Invalid Session Token"), {
      status: 401,
    });
  }

  const json = await request.json();
  const visibility = json.visibility;
  if (visibility !== "PUBLIC" && visibility !== "DRAFT") {
    return new Response(
      JSON.stringify("Visibility must be either 'PUBLIC' or 'DRAFT'"),
      {
        status: 400,
      }
    );
  }

  try {
    const project = await prisma.project.findUnique({
      where: { id: params.project_id },
      include: { owner: { select: { id: true } } },
    });

    if (!project) {
      return new Response(JSON.stringify("Project not found"), {
        status: 404,
      });
    }

    if (project.owner.id !== session.user.id) {
      return new Response(
        JSON.stringify("Only project owners can update visibility"),
        {
          status: 403,
        }
      );
    }

    await prisma.project.update({
      where: { id: params.project_id },
      data: { visibility },
    });

    return new Response(JSON.stringify({ visibility }), { status: 200 });
  } catch (error) {
    console.error("Error updating project visibility:", error);
    return new Response("Internal Server Error.", {
      status: 500,
    });
  }
}
