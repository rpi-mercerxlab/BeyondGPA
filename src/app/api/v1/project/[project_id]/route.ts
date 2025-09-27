import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authentication/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ project_id: string }> }
) {
  const { project_id } = await params;
  const session = await getServerSession(authOptions);

  try {
    const project = await prisma.project.findUnique({
      where: { id: project_id },
      select: {
        id: true,
        title: true,
        description: true,
        visibility: true,
        thumbnail: { select: { url: true, altText: true, id: true } },
        contributors: {
          select: { name: true, email: true, id: true, role: true },
          orderBy: { createdAt: "desc" },
        },
        skillTags: { select: { name: true, id: true } },
        images: {
          select: { url: true, altText: true, id: true },
          orderBy: { createdAt: "desc" },
        },
        owner: { select: { firstName: true, lastName: true, email: true } },
        links: { select: { url: true, label: true, id: true } },
        questionPrompts: { select: { question: true, answer: true, id: true } },
        createdAt: true,
        updatedAt: true,
        group: { select: { id: true, name: true } },
        storageRemaining: true,
      },
    });

    if (!project || project.visibility === "DELETED") {
      return new Response(JSON.stringify({ project: undefined }), {
        status: 404,
      });
    }

    if (project.visibility === "DRAFT") {
      const isOwner = project.owner.email === session?.user.email;
      const isContributor = project.contributors.some(
        (contributor) => contributor.email === session?.user.email
      );
      if (!isOwner && !isContributor) {
        return new Response(JSON.stringify({ project: undefined }), {
          status: 403,
        });
      }
    }

    const responseBody = {
      project: {
        project_id: project.id,
        title: project.title,
        visibility: project.visibility,
        owner: {
          name: `${project.owner.firstName} ${project.owner.lastName}`,
          email: project.owner.email,
        },
        contributors: project.contributors.map((contributor) => ({
          name: contributor.name,
          email: contributor.email,
          id: contributor.id,
          role: contributor.role,
        })),
        skill_tags: project.skillTags,
        images: project.images.map((image) => ({
          link: image.url,
          caption: image.altText,
          id: image.id,
        })),
        links: project.links.map((link) => ({
          link: link.url,
          coverText: link.label,
          id: link.id,
        })),
        description: project.description,
        thumbnail: {
          link: project.thumbnail?.url,
          caption: project.thumbnail?.altText,
          id: project.thumbnail?.id,
        },
        questions: project.questionPrompts.map((q) => ({
          // ! This map is redundant, consider removing it
          question: q.question,
          answer: q.answer,
          id: q.id,
        })),
        group: {
          name: project.group?.name || "",
          id: project.group?.id || "",
        },
        createdAt: project.createdAt.toISOString(),
        updatedAt: project.updatedAt.toISOString(),
        storageRemaining: project.storageRemaining,
      },
    };

    return new Response(JSON.stringify(responseBody), { status: 200 });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ project: undefined }), {
      status: 500,
    });
  }
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ project_id: string }> }
) {
  const { project_id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response(undefined, { status: 401 });
  }

  try {
    const project = await prisma.project.findUnique({
      where: { id: project_id },
      select: { ownerId: true },
    });

    if (!project) {
      return new Response(undefined, { status: 404 });
    }

    if (project.ownerId !== session.user.id) {
      return new Response(undefined, { status: 403 });
    }

    await prisma.project.update({
      where: { id: project_id },
      data: { visibility: "DELETED" },
    });

    return new Response(undefined, { status: 204 });
  } catch (e) {
    console.error(e);
    return new Response(undefined, { status: 500 });
  }
}
