import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authentication/auth";
import { assert, profile } from "console";

export default async function GET(
  req: Request,
  { params }: { params: Promise<{ user_id: string }> }
) {
  const { user_id } = await params;

  const session = await getServerSession(authOptions);

  const isProfileOwner = session?.user?.id === user_id;

  const userProfile = await prisma.profile.findUnique({
    where: {
      userId: user_id,
    },
    select: {
      bio: true,
      preferredFirstName: true,
      preferredLastName: true,
      degrees: {
        select: {
          degreeType: true,
          degreeName: true,
          institution: true,
          startDate: true,
          endDate: true,
          id: true,
        },
      },
      description: true,
      picture: {
        select: {
          imageUrl: true,
        },
      },
      visibility: true,
      links: {
        select: {
          id: true,
          label: true,
          url: true,
        },
      },
      professionalExperience: {
        select: {
          id: true,
          position: true,
          company: true,
          ongoing: true,
          startDate: true,
          endDate: true,
          description: true,
        },
      },
      researchExperience: {
        select: {
          id: true,
          institution: true,
          projectTitle: true,
          startDate: true,
          endDate: true,
          description: true,
        },
      },
    },
  });

  if (!userProfile && !isProfileOwner) {
    return new Response(
      JSON.stringify({
        message: "User profile not found.",
        statusCode: 404,
        profile: undefined,
      }),
      { status: 404 }
    );
  }

  if (!userProfile && isProfileOwner) {
    // Create a new profile for the user with as much information filled in as possible
    const user = session.user;
    const userProfile = await prisma.profile.create({
      data: {
        userId: user.id,
        preferredFirstName: user.firstName || "",
        preferredLastName: user.lastName || "",
        visibility: "PRIVATE",
        bio: "",
        description: "",
        picture: {
          create: {
            imageUrl: `https://api.dicebear.com/9.x/identicon/svg?seed=${user.id}`,
            imageType: "DEFAULT",
          },
        },
      },
      select: {
        preferredFirstName: true,
        preferredLastName: true,
        bio: true,
        description: true,
        visibility: true,
        picture: {
          select: {
            imageUrl: true,
          },
        },
      },
    });
    const responseBody = {
      message: "CREATED",
      statusCode: 201,
      profile: {
        firstName: userProfile.preferredFirstName,
        lastName: userProfile.preferredLastName,
        degrees: [],
        bio: userProfile.bio,
        description: userProfile.description,
        visibility: userProfile.visibility,
        profilePictureLink: userProfile.picture?.imageUrl || null,
        links: [],
        professionalExperience: [],
        researchExperience: [],
      },
    };

    return new Response(JSON.stringify(responseBody), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (userProfile?.visibility === "PRIVATE" && !isProfileOwner) {
    return new Response(
      JSON.stringify({
        message: "User profile not found.",
        statusCode: 404,
        profile: undefined,
      }),
      { status: 404 }
    );
  }

  if (!userProfile) {
    // We should never get here, but just in case
    console.error("User profile is undefined but was not handled as expected.");
    return new Response(
      JSON.stringify({
        message: "Internal Server Error",
        statusCode: 500,
        profile: undefined,
      }),
      { status: 500 }
    );
  }

  const responseBody = {
    message: "OK",
    statusCode: 200,
    profile: {
      firstName: userProfile.preferredFirstName,
      lastName: userProfile.preferredLastName,
      degrees: userProfile.degrees,
      bio: userProfile.bio,
      description: userProfile.description,
      visibility: userProfile.visibility,
      profilePictureLink: userProfile.picture?.imageUrl || null,
      links: userProfile.links,
      professionalExperience: userProfile.professionalExperience,
      researchExperience: userProfile.researchExperience,
    },
  };
  return new Response(JSON.stringify(responseBody), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
