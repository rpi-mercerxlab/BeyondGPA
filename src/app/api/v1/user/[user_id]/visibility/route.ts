import { prisma } from "@lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@lib/authentication/auth";

export async function PUT(
    request: Request, 
    { params }: { params: Promise<{ user_id: string }>}
){
    const { user_id } = await params;
    const session = await getServerSession(authOptions);
    if (!session){
        return new Response("Unauthorized", {status: 401});
    }

    const json = await request.json();
    const visibility = json.visibility;

    try {
        const profile = await prisma.profile.findUnique({
            where: {
                userId: user_id,
            },
        });

        if (!session.user_id){
            return new Response("User not found", { status: 404 });
        }

        if (session.user_id !== profile.user_id){
            return new Response("Forbidden", { status: 403 });
        }

        if (!profile) {
            return new Response("Profile not found", { status: 404 });
        }

        if (visibility !== "PUBLIC" && visibility !== "PRIVATE") {
            return new Response("Invalid visibility value", { status: 400 });
        }

        const vis = await prisma.visibility.update({
            where:
            {
                profileId: profile.id,
            },
            data: {
                visibility: visibility
            }
        })
        
        return new Response(JSON.stringify(vis), { status: 200 });

    } catch (error) {
        console.error("Error updating visibility:", error);
        return new Response("Internal Server Error", { status: 500 });
    }
}