import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authentication/auth";
import { ProfilePicture } from "@/generated/prisma/client";
import { minioClient } from "@/lib/minio";
import QuotaStream from "@/lib/quota-stream";
import { randomUUID } from "node:crypto";

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
  { params }: { params: Promise<{ user_id: string }> },
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

    if (!session.user.id) {
      return new Response("User not found", { status: 404 });
    }

    if (!profile) {
      return new Response("Profile not found", { status: 404 });
    }

    if (session.user.id !== profile.userId) {
      return new Response("Forbidden", { status: 403 });
    }

    const picType = request.headers.get("Content-Type");

    if (!ALLOWED_TYPES.includes(picType || "")) {
      return new Response("Unsupported Media Type", { status: 415 });
    }

    let updatedPic: ProfilePicture;

    if (picType === "application/json") {
      const json = await request.json();
      let picLink = json.image;

      if (typeof picLink !== "string" || !picLink.startsWith("http")) {
        // Then set the user's profile picture to an identicon based on their user ID
        picLink = `https://api.dicebear.com/9.x/identicon/svg?seed=${profile.userId}`;
      }

      updatedPic = await prisma.profilePicture.update({
        where: {
          profileId: profile.userId,
        },
        data: {
          imageType: "LINK",
          imageUrl: picLink,
        },
      });
    } else {
      // First we need to check if the user already has a profile picture, and if so, delete it from the database
      const existingPic = await prisma.profilePicture.findUnique({
        where: {
          profileId: profile.userId,
        },
      });

      if (existingPic?.imageType === "UPLOADED") {
        minioClient.removeObject("profile-pictures", existingPic.imageId!);
      }

      const stream = new QuotaStream(request.body!, MAX_SIZE);

      const imageId = randomUUID();

      try {
        await minioClient.putObject(
          process.env.STUDENT_PROJECT_BUCKET_NAME!,
          `/${profile.userId}/${imageId}`,
          stream,
          undefined,
          { "Content-Type": request.headers.get("Content-Type") || "" },
        );
      } catch (e: unknown) {
        if (e instanceof Error && e.message === "Quota exceeded") {
          // Delete any partial object if MinIO already created one
          try {
            await minioClient.removeObject(
              process.env.STUDENT_PROJECT_BUCKET_NAME!,
              `/${profile.userId}/${imageId}`,
            );
          } catch (err) {
            console.error("Error deleting partial object:", err);
          }
          return new Response("Insufficient Storage", { status: 400 });
        }
        throw e; // rethrow unexpected errors
      }

      updatedPic = await prisma.profilePicture.update({
        where: {
          profileId: profile.userId,
        },
        data: {
          imageType: "UPLOADED",
          imageId: imageId,
          imageUrl: `/api/v1/user/${profile.userId}/pic`,
        },
      });
    }

    return new Response(JSON.stringify(updatedPic), { status: 200 });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ user_id: string }> },
) {
  const session = await getServerSession(authOptions);
  const { user_id } = await params;

  try {
    const userProfile = await prisma.profile.findUnique({
      where: {
        userId: user_id,
      },
    });

    const profilePicture = await prisma.profilePicture.findUnique({
      where: {
        profileId: user_id,
      },
    });

    if (!userProfile) {
      return new Response("User not found", { status: 404 });
    }

    if (!profilePicture) {
      // The user exists, the profile exists, since the user should have a default profile picture. If this
      // happens something is very wrong, so we will throw an error to be caught us.
      throw new Error("Profile picture not found for user " + user_id);
    }

    if (
      userProfile.visibility === "PRIVATE" &&
      (!session || session.user.id !== user_id)
    ) {
      return new Response("Profile is private", { status: 404 });
    }

    if (profilePicture?.imageType === "LINK") {
      return new Response("Profile Picture is a Link to an External Image", {
        status: 404,
      });
    }

    // Get image content type and length
    const imageMetadata = await minioClient.statObject(
      process.env.STUDENT_PROJECT_BUCKET_NAME!,
      `${userProfile.userId}/${profilePicture.imageId}`,
    );

    if (!imageMetadata) {
      // Another situation that should never happen, since if the database has a record of an uploaded image,
      // then MinIO should have the image and its metadata. If this happens something is very wrong, so we will throw an error to be caught by us.
      throw new Error("Image metadata not found for user " + user_id);
    }

    const headers = new Headers();

    headers.set(
      "Content-Type",
      imageMetadata.metaData["content-type"] || "application/octet-stream",
    );
    headers.set("Content-Length", imageMetadata.size.toString());
    headers.set(
      "Content-Disposition",
      `inline; filename="${profilePicture.imageId}"`,
    );

    const image = await minioClient.getObject(
      process.env.STUDENT_PROJECT_BUCKET_NAME!,
      `${userProfile.userId}/${profilePicture.imageId}`,
    );

    // Convert Node.js Readable stream to Web ReadableStream
    const webStream = new ReadableStream({
      start(controller) {
        image.on("data", (chunk) => controller.enqueue(chunk));
        image.on("end", () => controller.close());
        image.on("error", (err) => controller.error(err));
      },
    });

    return new Response(webStream, { status: 200, headers });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
