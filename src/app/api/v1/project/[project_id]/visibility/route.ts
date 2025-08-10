import { NextApiRequest } from "next";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authentication/auth";

export async function PUT(request: NextApiRequest, { params }: { params: { project_id: string } }) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return new Response(JSON.stringify({ visibility: undefined }), { status: 401 });
    }

    const visibility = request.body.visibility;
    if (visibility !== "PUBLIC" && visibility !== "DRAFT") {
        return new Response(JSON.stringify({ visibility: undefined }), { status: 400 });
    }

    try {
        const project = await prisma.project.findUnique({
            where: { id: params.project_id },
            include: { owner: { select: { id: true } } },
        });

        if (!project) {
            return new Response(JSON.stringify({ visibility: undefined }), { status: 404 });
        }

        if (project.owner.id !== session.user.id) {
            return new Response(JSON.stringify({ visibility: undefined }), { status: 403 });
        }

        await prisma.project.update({
            where: { id: params.project_id },
            data: { visibility }
        });

        return new Response(JSON.stringify({ visibility }), { status: 200 });
    } catch (error) {
        console.error("Error updating project visibility:", error);
        return new Response(JSON.stringify({ visibility: undefined }), { status: 500 });
    }
}