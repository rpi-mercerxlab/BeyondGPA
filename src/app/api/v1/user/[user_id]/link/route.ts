import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authentication/auth";

export async function POST(
    request: Request,
    { params }: { params: Promise<{ user_id: string }> }
){
    const { user_id } = await params;
    const session = await getServerSession(authOptions);
    if (!session) {
        return new Response("Unauthorized", { status: 401 });
    }

    const json = await request.json();
    const url = json.url;
    const label = json.label;

    try {
        const profile = await prisma.profile.findUnique({
            where: {
                userId: user_id,
            },
        });

        if (!session.user_id){
            return new Response("User not found", { status: 404 });
        }

        if (session.user_id != user_id){
            return new Response("Forbidden", { status: 403 });
        }

        if (!profile) {
            return new Response("Profile not found", { status: 404 });
        }

        const newLink = await prisma.profile.create({
            data: {
                userId: user_id,
                url: url,
                label: label
            }
        });

        return new Response(JSON.stringify(newLink), { status: 200 });
    } catch (error) {
        console.error("Error creating link:", error);
        return new Response("Internal Server Error", { status: 500 });
    }
}