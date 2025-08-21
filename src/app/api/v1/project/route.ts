import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authentication/auth";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const keywords: string[] =
      url.searchParams.get("keywords")?.split(",") || [];

    const skills: string[] = url.searchParams.get("skills")?.split(",") || [];
    const groups: string[] = url.searchParams.get("groups")?.split(",") || [];

    const limit = Math.min(
      parseInt(url.searchParams.get("limit") || "24"),
      100
    );
    const token = url.searchParams.get("token") || undefined;

    if (isNaN(limit) || limit <= 0) {
      return new Response("Invalid limit parameter", { status: 400 });
    }

    if (keywords.length > 10 || skills.length > 10 || groups.length > 10) {
      return new Response("Too many filter parameters", { status: 400 });
    }

    const resp = await prisma.project.findMany({
      where: {
        AND: [
          {
            visibility: { equals: "PUBLIC" },
          },
          groups.length > 0
            ? {
                group: {
                  name: {
                    in: groups,
                    mode: "insensitive",
                  },
                },
              }
            : {},
          skills.length > 0
            ? {
                skillTags: {
                  some: {
                    name: {
                      in: skills,
                      mode: "insensitive",
                    },
                  },
                },
              }
            : {},
          keywords.length > 0
            ? {
                OR: keywords.flatMap((keyword) => [
                  { title: { contains: keyword, mode: "insensitive" } },
                  { description: { contains: keyword, mode: "insensitive" } },
                ]),
              }
            : {},
        ],
      },
      select: {
        id: true,
        title: true,
        description: true,
        thumbnail: { select: { url: true, altText: true, id: true } },
        contributors: { select: { name: true }, orderBy: { createdAt: "asc" } },
        skillTags: { select: { name: true } },
        group: { select: { name: true } },
      },
      take: limit + 1,
      cursor: token ? { id: token } : undefined,
      orderBy: { createdAt: "desc" },
    });

    let nextToken: string | undefined = undefined;
    if (resp.length > limit) {
      const nextItem = resp.pop();
      nextToken = nextItem?.id;
    }

    const responseBody = {
      paginationToken: nextToken,
      projects: resp.map((project) => ({
        project_id: project.id,
        title: project.title,
        description: project.description,
        thumbnail: project.thumbnail
          ? {
              id: project.thumbnail.id,
              url: project.thumbnail.url,
              alt: project.thumbnail.altText,
            }
          : null,
        contributors: project.contributors.map(
          (contributor) => contributor.name
        ),
        skillTags: project.skillTags.map((skill) => skill.name),
        group: project.group?.name,
      })),
    };

    return new Response(JSON.stringify(responseBody), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response("Internal Server Error", { status: 500 });
  }
}

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response(JSON.stringify({ project_id: undefined }), {
      status: 401,
    });
  }

  if (session.user.role !== "student") {
    return new Response(JSON.stringify({ project_id: undefined }), {
      status: 403,
    });
  }

  try {
    const resp = await prisma.project.create({
      data: {
        ownerId: session.user.id,
        contributors: {
          create: {
            email: session.user.email,
            name: `${session.user.firstName} ${session.user.lastName}`,
            role: "EDITOR",
            userId: session.user.id,
          },
        },
      },
    });

    return new Response(JSON.stringify({ project_id: resp.id }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ project_id: undefined }), {
      status: 500,
    });
  }
}

