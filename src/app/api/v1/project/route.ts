import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authentication/auth";
import { NextApiRequest } from "next";

export async function GET(request: NextApiRequest) {
    try {
        const keywords: string[] = request.query.keywords as string[] || [];
        const skills: string[] = request.query.skills as string[] || [];
        const groups: string[] = request.query.groups as string[] || [];
        const limit = Math.min(parseInt(request.query.limit as string || '24'), 100);
        const token = request.query.token as string || undefined;


        if (isNaN(limit) || limit <= 0) {
            return new Response("Invalid limit parameter", { status: 400 });
        }

        if (keywords.length > 10 || skills.length > 10 || groups.length > 10) {
            return new Response("Too many filter parameters", { status: 400 });
        }

        const resp = await prisma.project.findMany({
            where: filterQueryFactory(keywords, skills, groups),
            select: {
                id: true,
                title: true,
                description: true,
                thumbnail: { select: { url: true, altText: true } },
                contributors: { select: { name: true } },
                skillTags: { select: { name: true } },
                group: { select: { name: true } },
            },
            take: limit + 1,
            cursor: token ? { id: token } : undefined,
            orderBy: { createdAt: 'desc' },
        });

        if (resp.length === 0) {
            const responseBody = {
                paginationToken: undefined,
                projects: []
            };
            return new Response(JSON.stringify(responseBody), {
                status: 404,
                headers: { "Content-Type": "application/json" },
            });
        }

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
                thumbnail: {
                    link: project.thumbnail?.url,
                    caption: project.thumbnail?.altText,
                },
                contributors: project.contributors.map((contributor) => contributor.name),
                skillTags: project.skillTags.map((skill) => skill.name),
                group: project.group?.name,
            }))
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

export async function POST(_: NextApiRequest) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return new Response(JSON.stringify({ project_id: undefined }), { status: 401 });
    }

    if (session.user.role !== "student" && session.user.role !== "faculty") {
        return new Response(JSON.stringify({ project_id: undefined }), { status: 403 });
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
                    }
                }
            }
        });

        return new Response(JSON.stringify({ project_id: resp.id }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (e) {
        console.error(e);
        return new Response(JSON.stringify({ project_id: undefined }), { status: 500 });
    }
}

function filterQueryFactory(keywords: string[], skills: string[], groups: string[]): any {
    return {
        AND: [
            {
                visibility: { equals: "PUBLIC" },
            },
            {
                groupName: {
                    in: groups.length > 0 ? groups : undefined
                }
            },
            {
                skillTags: {
                    some:
                    {
                        name: { in: skills.length > 0 ? skills : undefined, mode: 'insensitive' }
                    }
                }
            },
            {
                OR: keywords.length > 0 ? keywords.map((keyword) => ({
                    title: { contains: keyword, mode: 'insensitive' },
                    description: { contains: keyword, mode: 'insensitive' },
                })) : undefined
            },
        ]
    }
}
