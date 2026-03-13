import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authentication/auth";

const ALLOWED_TYPES = [
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/svg+xml",
  "image/webp",
  "image/x-icon",
  "application/json",
];

const MAX_SIZE = 1024 * 1024;

export async function POST(
    request: Request, 
    { params }: { params: Promise<{ user_id: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return new Response("Unauthorized", { status: 401 });
    }
    const { user_id } = await params;
    try {
        const profile = await prisma.profile.findUnique({
            where: {
                userId: user_id,
            },
        });
        if (!session.user_id) {
            return new Response("User not found", { status: 404 });
        }
        if (!profile) {
            return new Response("Profile not found", { status: 404 });
        }  
        if (session.user_id !== profile.user_id) {
            return new Response("Forbidden", { status: 403 });
        } 
        const picType = request.headers.get("Content-Type");

        if (!ALLOWED_TYPES.includes(picType || "")) {
            return new Response("Unsupported Media Type", { status: 400 });
        }

        let imageLink: string;

        if (picType === "application/json") {
            const body = await request.json();
            imageLink = body.image;
        }

        else if (picType && ALLOWED_TYPES.includes(picType)) {
            const buffer = await request.arrayBuffer();

            if (buffer.byteLength > MAX_SIZE) {
                return Response.json("Image exceeds 1MB", { status: 400 });
            }

            imageLink = "";
        }

        else {
            imageLink = "";
        }

        const updatedPic = await prisma.profile.update({
            where: { userId: user_id },
            data: { profilePictureLink: imageLink,
                    alt: `${profile.userId} profile picture`
             },
        });

        return new Response(JSON.stringify(updatedPic), { status: 200 });
    } catch (error) {
        console.error("Error fetching profile:", error);
        return new Response("Internal Server Error", { status: 500 });
    }
}

export async function GET(
    request: Request,
    { params }: { params: Promise<{ user_id: string }> }
) {
  const session = await getServerSession(authOptions);
  const { user_id } = await params;

  try {
    const userProfile = await prisma.profile.findUnique({
      where: {
        userId: user_id,
      },
    });
    
    if (!userProfile) {
      return new Response("User not found", { status: 404 });
    }

    if (userProfile.isPrivate) {
      return new Response("Profile is private", { status: 404 });
    }

    if (!userProfile.profilePictureLink) {
        return new Response("Profile picture not found", { status: 404 });
    }

    const image = await fetch(userProfile.profilePictureLink);
    if (!image.ok) {
        return new Response("Failed to fetch profile picture", { status: 404 });
    }

    return new Response(image.body,)

    } catch (error) { 
        console.error("Error fetching user profile:", error);
        return new Response("Internal Server Error", { status: 500 });
    }  
  }
  