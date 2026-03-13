import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authentication/auth";
    
export async function PUT(
    request: Request, 
    { params }: { params: Promise<{ user_id: string, degree_id: string }>}
){
    const { user_id, degree_id } = await params;
    const session = await getServerSession(authOptions);
    if (!session){
        return new Response("Unauthorized", { status: 401 });
    }

    const json = await request.json();
    const degreeType = json.degreeType;
    const degreeName = json.degreeName;
    const startDate = json.startDate;
    const endDate = json.endDate;

    try {
        const profile = await prisma.profile.findUnique({
            where: {
                userId: user_id,
            },
        });

        if (session.user_id !== user_id){
            return new Response("Forbidden", { status: 403 });
        }
        
        if (!profile) {
            return new Response("Profile not found", { status: 404 });
        }

        const updatedDegree = await prisma.degree.update({
            where: {
                id: degree_id,
            },
            data: {
                university: "Rensselaer Polytechnic Institute",
                degreeType: degreeType,
                degreeName: degreeName,
                startDate: startDate,
                endDate: endDate,
            },
        });
        return new Response(JSON.stringify(updatedDegree), { status: 200 });
    } catch (error) {
        console.error("Error updating degree:", error);
        return new Response("Internal Server Error", { status: 500 });
    }
}

export async function DELETE(
    request: Request, 
    { params }: { params: Promise<{ user_id: string, degree_id: string }>}
){
    const { user_id, degree_id } = await params;
    const session = await getServerSession(authOptions);    
    if (!session){
        return new Response("Unauthorized", { status: 401 });
    }

    try {
        const profile = await prisma.profile.findUnique({
            where: {
                userId: user_id,
            },
        });
        
        if (session.user_id !== user_id){
            return new Response("Forbidden", { status: 403 });
        } 

        if (!profile) {
            return new Response("Profile not found", { status: 404 });
        }   

        const deletedDegree = await prisma.degree.delete({
            where: {
                id: degree_id,
            },
        });
        
        return new Response(JSON.stringify(deletedDegree), { status: 200 });
    } catch (error) {
        console.error("Error finding profile:", error);
        return new Response("Internal Server Error", { status: 500 });
    }
}