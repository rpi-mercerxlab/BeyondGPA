import { NextApiRequest } from "next";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authentication/auth";

export async function PUT(
    request: NextApiRequest,
    { params }: { params: { project_id: string } }
) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return new Response(undefined, { status: 401 });
    }

    const description = request.body.description;

    if (typeof description !== "string" || description.length > 5000) {
        return new Response("Invalid Description", { status: 400 });
    }

    try {
        const project = await prisma.project.findUnique({
            where: { id: params.project_id },
            include: { contributors: { select: { email: true, role: true } } },
        });

        if (!project) {
            return new Response("Project Not Found", { status: 404 });
        }

        if (
            project.contributors.includes({
                email: session.user.email,
                role: "EDITOR",
            }) === false
        ) {
            return new Response(undefined, { status: 403 });
        }

        await prisma.project.update({
            where: { id: params.project_id },
            data: { description },
        });

        return new Response(JSON.stringify({ description }), { status: 200 });
    } catch (error) {
        console.error("Error updating project description:", error);
        return new Response(undefined, { status: 500 });
    }
}