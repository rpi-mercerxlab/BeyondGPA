import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authentication/auth";
import { minioClient } from "@/lib/minio";

export async function GET(
  _: Request,
  { params }: { params: { project_id: string; image_id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const project = await prisma.project.findUnique({
      where: {
        id: params.project_id,
      },
      select: {
        contributors: {
          select: {
            email: true,
          },
        },
        visibility: true,
      },
    });

    if (!project) {
      return new Response("Project not found", { status: 404 });
    }

    if (
      project.visibility === "DRAFT" &&
      !project.contributors.some((c) => c.email === session.user.email)
    ) {
      return new Response("Forbidden", { status: 403 });
    }

    // Get image content type and length
    const imageMetadata = await minioClient.statObject(
      process.env.STUDENT_PROJECT_BUCKET_NAME!,
      `${params.project_id}/${params.image_id}`
    );
    if (!imageMetadata) {
      return new Response("Image not found", { status: 404 });
    }

    const headers = new Headers();
    headers.set(
      "Content-Type",
      imageMetadata.metaData["content-type"] || "application/octet-stream"
    );
    headers.set("Content-Length", imageMetadata.size.toString());
    headers.set("Content-Disposition", `inline; filename="${params.image_id}"`);

    const image = await minioClient.getObject(
      process.env.STUDENT_PROJECT_BUCKET_NAME!,
      `${params.project_id}/${params.image_id}`
    );
    if (!image) {
      return new Response("Image not found", { status: 404 });
    }

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
    console.error("Error fetching image:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

export async function PUT(
  request: Request,
  {
    params,
  }: {
    params: {
      project_id: string;
      image_id: string;
    };
  }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const project = await prisma.project.findUnique({
      where: {
        id: params.project_id,
      },
      select: {
        contributors: {
          select: {
            email: true,
            role: true,
          },
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

    const reqJSON = await request.json();
    const new_alt = reqJSON.alt;

    await prisma.image.update({
      where: {
        id: params.image_id,
      },
      data: {
        altText: new_alt,
      },
    });

    return new Response(JSON.stringify({ alt: new_alt }), { status: 200 });
  } catch (error) {
    console.error("Error updating image alt text:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(
  _: Request,
  { params }: { params: { project_id: string; image_id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const project = await prisma.project.findUnique({
      where: {
        id: params.project_id,
      },
      select: {
        contributors: {
          select: {
            email: true,
            role: true,
          },
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

    // Delete image from MinIO
    await minioClient.removeObject(
      process.env.STUDENT_PROJECT_BUCKET_NAME!,
      `${params.project_id}/${params.image_id}`
    );

    // Delete image record from database
    await prisma.image.delete({
      where: {
        id: params.image_id,
      },
    });

    return new Response("Image deleted successfully", { status: 200 });
  } catch (error) {
    console.error("Error deleting image:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
