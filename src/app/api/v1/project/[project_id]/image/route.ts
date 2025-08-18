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
  { params }: { params: Promise<{ project_id: string }> }
) {
  const { project_id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const project = await prisma.project.findUnique({
      where: { id: project_id },
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
      const reqJSON = await request.json();
      const image = reqJSON.image;

      if (!image) {
        return new Response("Image data is required", { status: 400 });
      }

      const resp = await prisma.image.create({
        data: {
          projectId: project_id,
          url: image,
          external: true,
          size: 0,
        },
      });

      const responseBody = {
        id: resp.id,
        url: resp.url,
        altText: resp.altText,
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
        `/${project_id}/${image_id}`,
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
            `/${project_id}/${image_id}`
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
      `/${project_id}/${image_id}`
    );

    const image = await prisma.image.create({
      data: {
        id: image_id,
        projectId: project_id,
        url: `/api/v1/project/${project_id}/image/${image_id}`,
        altText: "",
        external: false,
        size: obj.size,
      },
    });

    await prisma.project.update({
      where: { id: project_id },
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
