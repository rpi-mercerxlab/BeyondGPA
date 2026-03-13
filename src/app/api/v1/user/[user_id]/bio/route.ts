import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authentication/auth";

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ user_id: string }> }
){
    const { user_id } = await params;
    const session = await getServerSession(authOptions);
    if (!session) {
        return new Response("Unauthorized", { status: 401 });
    }
    const json = await request.json();
    const bio = json.bio;

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

        if (bio.length > 400 || typeof bio !== "string") {
            return new Response("Invalid bio", { status: 400 });
        }

        if (!profile) {
            return new Response("Profile not found", { status: 404 });
        }
        
        const updatedBio = await prisma.profile.update({
            where: {
                userID: user_id,
            },
            data: {
                personalBio: bio,
            }
        });

        return new Response(JSON.stringify(updatedBio), { status: 200 });
    } catch (error) {
        console.error("Error updating bio:", error);
        return new Response("Internal Server Error", { status: 500 });
    }
}