import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authentication/auth";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ user_id: string }> }
) {
    const { user_id } = await params;
    const session = await getServerSession(authOptions);

    if (!session) {
        return new Response("Unauthorized", { status: 401 });
    }
    
    try {
        const profile = await prisma.profile.findUnique({
            where: {
                userId: user_id,
            }
        });

        if (!profile) {
            return new Response("Profile not found", { status: 404 });
        }


    
    } catch (error) {        
        console.error("Error fetching profile:", error);
        return new Response("Internal Server Error", { status: 500 });
    }
}