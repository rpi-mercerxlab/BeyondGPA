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
  const company = json.company;
  const title = json.title;
  const startDate = json.startDate;
  const ongoing = json.ongoing;
  const endDate = json.endDate;
  const description = json.description;

  try {
    const newJob = await prisma.professionalExperience.createMany({
      data: {
        company: company,
        position: title,
        startDate: new Date(startDate),
        ongoing: ongoing,
        endDate: endDate ? new Date(endDate) : null,
        description: description,
        profileId: user_id,
      },
    });

    return new Response(JSON.stringify(newJob), { status: 200 });
  } catch (error) {
    console.error("Error adding job:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
