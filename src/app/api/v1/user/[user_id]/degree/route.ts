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
    return new Response("Unauthorized", { status: 401 });
  }

  const json = await request.json();
  const university = json.university;
  const degreeType = json.degreeType;
  const degreeName = json.degreeName;
  const startDate = json.startDate;
  const endDate = json.endDate;

  try {
    const profile = await prisma.profile.findUnique({
      where: {
        userId: user_id,
      },
    });

    if (session.user.id !== user_id) {
      return new Response("Forbidden", { status: 403 });
    }

    if (!profile) {
      return new Response("Profile not found", { status: 404 });
    }

    const newDegree = await prisma.education.create({
      data: {
        institution: university,
        degreeType: degreeType,
        degreeName: degreeName,
        startDate: startDate,
        endDate: endDate,
        profile: {
          connect: {
            userId: user_id,
          },
        },
      },
    });

    return new Response(JSON.stringify(newDegree), { status: 201 });
  } catch (error) {
    console.error("Error adding degree:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
