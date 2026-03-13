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

    if (session.user_id !== user_id){
        return new Response("Forbidden", { status: 403 });
    }

    const json = await request.json();
    const firstName = json.firstName;
    const lastName = json.lastName;
    
    try {
        const existingProfile = await prisma.profile.findUnique({
            where: {
                userID: user_id,
            }
        });

        if (!existingProfile) {
            return new Response("Profile not found", { status: 404 });
        }

        const updatedProfile = await prisma.profile.update({
            where: {
                userID: user_id,
            },
            data: {
                firstName: firstName,
                lastName: lastName,
            }
        });

        return new Response(JSON.stringify(updatedProfile), { status: 200 });
    } catch (error) {
        console.error("Error updating preferred name:", error);
        return new Response("Internal Server Error", { status: 500 });
    }
}