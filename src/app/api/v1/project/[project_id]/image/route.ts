import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authentication/auth";
import { minioClient } from "@/lib/minio";
import { randomUUID } from "crypto";
import QuotaStream from "@/lib/quota-stream";

const acceptedImageTypes = [
  `image/png`,
  `image/jpeg`,
  `image/gif`,
  `image/svg+xml`,
  `image/webp`,
  `image/x-icon`,
];

export async function POST(
  request: Request,
  { params }: { params: { project_id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const project = await prisma.project.findUnique({
      where: { id: params.project_id },
      select: {
        contributors: { select: { email: true, role: true } },
        storageRemaining: true,
      },
    });

    if (!project) {
      return new Response("Project Not Found", { status: 404 });
    }

    if (
      !project.contributors.some((contributor) => {
        return (
          contributor.email === session.user.email &&
          contributor.role === "EDITOR"
        );
      })
    ) {
      return new Response(undefined, { status: 403 });
    }

    if (request.headers.get("Content-Type")?.startsWith("application/json")) {
      const body = await request.json();
      const link = body.link;
      const alt = body.alt;

      if (typeof link !== "string" || link.length === 0 || link.length > 2048) {
        return new Response("Invalid Link", { status: 400 });
      }

      if (typeof alt !== "string" || alt.length > 256) {
        return new Response("Invalid Alt Text", { status: 400 });
      }

      const image = await prisma.image.create({
        data: {
          projectId: params.project_id,
          url: link,
          altText: alt,
        },
      });

      const responseBody = {
        id: image.id,
        url: `/api/v1/project/${params.project_id}/image/${image.id}`,
        altText: image.altText,
        storageRemaining: project.storageRemaining, // External links do not consume storage
      };

      return new Response(JSON.stringify(responseBody), { status: 201 });
    }

    if (
      !acceptedImageTypes.includes(request.headers.get("Content-Type") || "")
    ) {
      return new Response("Unsupported Media Type", { status: 415 });
    }

    if (!request.body) {
      return new Response("No Image Provided", { status: 400 });
    }

    const image_id = randomUUID();
    const quotaStream = new QuotaStream(request.body, project.storageRemaining);

    try {
      await minioClient.putObject(
        process.env.STUDENT_PROJECT_BUCKET_NAME!,
        `/${params.project_id}/${image_id}`,
        quotaStream,
        undefined,
        { "Content-Type": request.headers.get("Content-Type") || "" }
      );
    } catch (e: any) {
      if (e.message === "Quota exceeded") {
        // Delete any partial object if MinIO already created one
        try {
          await minioClient.removeObject(
            process.env.STUDENT_PROJECT_BUCKET_NAME!,
            `/${params.project_id}/${image_id}`
          );
        } catch (err) {
          console.error("Error deleting partial object:", err);
        }
        return new Response("Insufficient Storage", { status: 400 });
      }
      throw e; // rethrow unexpected errors
    }

    const obj = await minioClient.statObject(
      process.env.STUDENT_PROJECT_BUCKET_NAME!,
      `/${params.project_id}/${image_id}`
    );

    const image = await prisma.image.create({
      data: {
        id: image_id,
        projectId: params.project_id,
        url: `/api/v1/project/${params.project_id}/image/${image_id}`,
        altText: "",
      },
    });

    await prisma.project.update({
      where: { id: params.project_id },
      data: {
        storageRemaining: project.storageRemaining - obj.size,
        images: { connect: { id: image.id } },
      },
    });

    const responseBody = {
      id: image.id,
      url: image.url,
      altText: image.altText,
      storageRemaining: project.storageRemaining - obj.size,
    };

    return new Response(JSON.stringify(responseBody), { status: 201 });
  } catch (error) {
    console.error("Error uploading image:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
