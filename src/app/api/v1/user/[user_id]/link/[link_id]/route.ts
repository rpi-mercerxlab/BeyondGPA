import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authentication/auth";

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ user_id: string, link_id: string }> }
) {
    const { user_id, link_id } = await params;
    const session = await getServerSession(authOptions);
    if (!session) {
        return new Response("Unauthorized", { status: 401 });
    }

    const json = await request.json();
    const url = json.url;
    const label = json.label;

    try {
        const oldLink = await prisma.link.findUnique({
            where: {
                userId: user_id,
                id: link_id
            },
        });

        if (!session.user_id){
            return new Response("User not found", { status: 404 });
        }

        if (session.user_id != user_id){
            return new Response("Forbidden", { status: 403 });
        }

        if (!oldLink) {
            return new Response("Link not found", { status: 404 });
        }

        const updatedLink = await prisma.link.update({
            where: {
                userId: user_id,
                id: link_id
            },
            data: {
                url: url,
                label: label
            }
        });

        return new Response(JSON.stringify(updatedLink), { status: 200 });
    } catch (error) {
        console.error("Error updating link:", error);
        return new Response("Internal Server Error", { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ user_id: string, link_id: string }> }
) {
    const { user_id, link_id } = await params;
    const session = await getServerSession(authOptions);
    if (!session) {
        return new Response("Unauthorized", { status: 401 });
    }

    try {
        const oldLink = await prisma.link.findUnique({
            where: {
                userId: user_id,
                id: link_id
            },
        });

        if (!session.user_id){
            return new Response("User not found", { status: 404 });
        }

        if (session.user_id != user_id){
            return new Response("Forbidden", { status: 403 });
        }   

        if (!oldLink) {
            return new Response("Link not found", { status: 404 });
        }

        const deletedLink = await prisma.link.delete({
            where: {
                userId: user_id,
                id: link_id
            }
        });

        return new Response(JSON.stringify(deletedLink), { status: 200 });
    } catch (error) {
        console.error("Error deleting link:", error);
        return new Response("Internal Server Error", { status: 500 });
    }
}

