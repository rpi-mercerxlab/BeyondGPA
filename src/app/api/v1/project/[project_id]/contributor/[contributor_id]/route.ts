import { NextApiRequest } from "next";
import { prisma } from "@/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/authentication/auth";

export async function PUT(
    request: NextApiRequest,
    { params }: { params: { project_id: string; contributor_id: string } }
) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return new Response(undefined, { status: 401 });
    }

    const contributor_name = request.body.name;
    const contributor_email = request.body.email;
    const contributor_role = request.body.role;

    if (
        !contributor_name ||
        !contributor_email ||
        (contributor_role !== "EDITOR" && contributor_role !== "VIEWER")
    ) {
        return new Response("Invalid Request Body", { status: 400 });
    }

    try {
        const project = await prisma.project.findUnique({
            where: { id: params.project_id },
            include: { owner: { select: { id: true } } },
        });

        if (!project) {
            return new Response("Project Not Found", { status: 404 });
        }

        if (project.owner.id !== session.user.id) {
            return new Response(undefined, { status: 403 });
        }

        const contributor = await prisma.user.findUnique({
            where: { id: params.contributor_id },
        });

        if (!contributor) {
            return new Response("Contributor Not Found", { status: 404 });
        }

        // Check if the contributor is a registered user
        const registeredUser = await prisma.user.findUnique({
            where: { email: contributor_email },
            select: { id: true },
        });

        const resp = await prisma.contributor.update({
            where: { id: params.contributor_id },
            data: {
                name: contributor_name,
                email: contributor_email,
                role: contributor_role,
                id: registeredUser ? registeredUser.id : undefined,
            },
        });

        const responseBody = {
            name: resp.name,
            email: resp.email,
            role: resp.role,
            id: resp.id,
        };

        return new Response(JSON.stringify(responseBody), { status: 200 });
    } catch (error) {
        console.error("Error transferring project ownership:", error);
        return new Response(undefined, { status: 500 });
    }

}

export async function DELETE(
    request: NextApiRequest,
    { params }: { params: { project_id: string; contributor_id: string } }
) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return new Response(undefined, { status: 401 });
    }

    try {
        const project = await prisma.project.findUnique({
            where: { id: params.project_id },
            include: { owner: { select: { id: true } } },
        });

        if (!project) {
            return new Response("Project Not Found", { status: 404 });
        }

        if (project.owner.id !== session.user.id) {
            return new Response(undefined, { status: 403 });
        }

        const contributor = await prisma.contributor.findUnique({
            where: { id: params.contributor_id },
        });

        if (!contributor) {
            return new Response("Contributor Not Found", { status: 404 });
        }

        await prisma.contributor.delete({
            where: { id: params.contributor_id },
        });

        return new Response(undefined, { status: 204 });
    } catch (error) {
        console.error("Error deleting contributor:", error);
        return new Response(undefined, { status: 500 });
    }
}
