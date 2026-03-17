import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authentication/auth";
import { url } from "inspector/promises";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ user_id: string }> }
) {
    const { user_id } = await params;    
    const session = await getServerSession(authOptions);

    try {
        const url = new URL(request.url);

        const limit = Math.min(parseInt(url.searchParams.get("limit") || "24"), 100);
        const nextToken = url.searchParams.get("nextToken") || undefined;

        if (isNaN(limit) || limit < 0 || limit > 100) {
            return new Response("Invalid limit parameter", { status: 400 });
        }

        const profile = await prisma.profile.findUnique({
            where: {
                userId: user_id,
            },
        });

        if (!profile) {
            return new Response("Profile not found", { status: 404 });
        }

        if (session?.user?.id != profile.userId) {
            return new Response("Forbidden", { status: 404 });
        }

        const resp = await prisma.project.findMany({
        where: {
            ownerId: user_id,
        },
        select: {
            id: true,
            title: true,
            description: true,
            visibility: true,
            thumbnail: { select: { url: true, altText: true } },
            contributors: {
                select: { name: true },
                orderBy: { createdAt: "asc" },
            },
            skillTags: { select: { name: true } },
            group: { select: { name: true } },
        },
        take: limit + 1,
        cursor: nextToken ? { id: nextToken } : undefined,
        orderBy: { createdAt: "desc" },
        });

        let newNextToken: string | undefined = undefined;
        if (resp.length > limit) {
        const nextItem = resp.pop();
        newNextToken = nextItem?.id;
        }

        const responseBody = {
            paginationToken: nextToken,
            projects: resp.map((project) => ({
            project_id: project.id,
            title: project.title,
            description: project.description,
            thumbnail: project.thumbnail
                ? {
                    id: project.thumbnail,
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

    } catch (error) {        
        console.error("Error fetching profile:", error);
        return new Response("Internal Server Error", { status: 500 });
    }
}