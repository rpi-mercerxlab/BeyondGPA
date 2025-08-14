import { authOptions } from "@/lib/authentication/auth";
import { minioClient } from "@/lib/minio";
import { prisma } from "@/lib/prisma";
import QuotaStream from "@/lib/quota-stream";
import { getServerSession } from "next-auth";
import { randomUUID } from "node:crypto";

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
      where: {
        id: project_id,
      },
      select: {
        contributors: {
          select: {
            email: true,
            role: true,
          },
        },
        storageRemaining: true,
      },
    });

    if (!project) {
      return new Response("Project not found", { status: 404 });
    }

    if (
      !project.contributors.some(
        (c) => c.email === session.user.email && c.role === "EDITOR"
      )
    ) {
      return new Response("Forbidden", { status: 403 });
    }

    if (request.headers.get("content-type") === "application/json") {
      const reqJSON = await request.json();
      const image = reqJSON.image;

      if (!image) {
        return new Response("Image data is required", { status: 400 });
      }

      const thumbnail = await prisma.project.update({
        where: {
          id: project_id,
        },
        data: {
          thumbnail: {
            create: {
              url: image,
              altText: reqJSON.alt || "",
              external: true,
              size: 0,
            },
          },
        },
        select: {
          thumbnail: {
            select: {
              id: true,
              url: true,
              altText: true,
            },
          },
        },
      });

      return new Response(
        JSON.stringify({
          id: thumbnail.thumbnail?.id,
          url: thumbnail.thumbnail?.url,
          altText: thumbnail.thumbnail?.altText,
        }),
        {
          status: 201,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
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

    const image = await prisma.project.update({
      where: { id: project_id },
      data: {
        thumbnail: {
          create: {
            altText: "",
            id: image_id,
            url: `/api/v1/project/${project_id}/image/${image_id}`,
            external: false,
            size: obj.size,
          },
        },
      },
      select: {
        thumbnail: {
          select: {
            id: true,
            url: true,
            altText: true,
          },
        },
      },
    });

    const responseBody = {
      id: image.thumbnail?.id,
      url: image.thumbnail?.url,
      altText: image.thumbnail?.altText,
      storageRemaining: project.storageRemaining - obj.size,
    };

    return new Response(JSON.stringify(responseBody), { status: 201 });
  } catch (error) {
    console.error(error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

export async function PUT(
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
      select: { contributors: { select: { email: true, role: true } } },
    });

    if (!project) {
      return new Response("Project not found", { status: 404 });
    }

    if (
      !project.contributors.some(
        (c) => c.email === session.user.email && c.role === "EDITOR"
      )
    ) {
      return new Response("Forbidden", { status: 403 });
    }

    const reqJSON = await request.json();
    if (!reqJSON.alt) {
      return new Response("Alt text is required", { status: 400 });
    }

    const thumbnail = await prisma.project.update({
      where: { id: project_id },
      data: {
        thumbnail: {
          update: {
            altText: reqJSON.alt,
          },
        },
      },
      select: {
        thumbnail: {
          select: {
            id: true,
            url: true,
            altText: true,
          },
        },
      },
    });

    const responseBody = {
      id: thumbnail.thumbnail?.id,
      url: thumbnail.thumbnail?.url,
      altText: thumbnail.thumbnail?.altText,
    };

    return new Response(JSON.stringify(responseBody), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(
  _: Request,
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
        thumbnail: {
          select: { external: true, size: true, id: true },
        },
      },
    });

    if (!project) {
      return new Response("Project not found", { status: 404 });
    }

    if (
      !project.contributors.some(
        (c) => c.email === session.user.email && c.role === "EDITOR"
      )
    ) {
      return new Response("Forbidden", { status: 403 });
    }

    if (!project.thumbnail) {
      return new Response("Thumbnail not found", { status: 404 });
    }

    if (!project.thumbnail.external) {
      await minioClient.removeObject(
        process.env.STUDENT_PROJECT_BUCKET_NAME!,
        `${project_id}/${project.thumbnail.id}`
      );
    }

    const remaining_size = await prisma.project.update({
      where: { id: project_id },
      data: {
        thumbnail: {
          delete: true,
        },
        storageRemaining: {
          increment: project.thumbnail.size,
        },
      },
      select: {
        storageRemaining: true,
      },
    });

    return new Response(
      JSON.stringify({ storage_remaining: remaining_size.storageRemaining }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error(error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
