import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authentication/auth";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ user_id: string }> },
) {
  const { user_id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) {
    return Response.json(
      {
        statusCode: 401,
        message: "Unauthorized",
      },
      { status: 401 },
    );
  }

  try {
    const profile = await prisma.profile.findUnique({
      where: {
        userId: user_id,
      },
    });

    if (!profile) {
      return Response.json(
        {
          statusCode: 404,
          message: "Profile not found",
        },
        { status: 404 },
      );
    }

    if (session.user.id !== profile.userId) {
      return Response.json(
        {
          statusCode: 403,
          message: "Forbidden",
        },
        { status: 403 },
      );
    }

    const newResearch = await prisma.researchExperience.createMany({
      data: {
        institution: "Rensselaer Polytechnic Institute",
        researchGroup: "",
        projectTitle: "",
        piName: "",
        startDate: new Date(),
        ongoing: true,
        endDate: null,
        description: "",
        profileId: profile.userId,
      },
    });

    return Response.json(
      {
        statusCode: 200,
        message: "Research experience created",
        job: newResearch,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error adding research experience:", error);
    return Response.json(
      {
        statusCode: 500,
        message: "Internal Server Error",
      },
      { status: 500 },
    );
  }
}
