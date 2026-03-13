import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authentication/auth";

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ user_id: string; research_id: string }> }
) {
    const { user_id, research_id } = await params;
    const session = await getServerSession(authOptions);
    if (!session) {
        return new Response("Unauthorized", { status: 401 });
    }

    const json = await request.json();
    const researchGroup = json.researchGroup;
    const title = json.title;
    const piName = json.piName;
    const startDate = json.startDate;
    const ongoing = json.ongoing;
    const endDate = json.endDate;
    const description = json.description;

    try {
        const profile = await prisma.profile.findUnique({
            where: {
                userId: user_id,
            },
        });

        if (!profile) {
            return new Response("Profile not found", { status: 404 });
        }

        if (session.user_id !== profile.userId) {
            return new Response("Forbidden", { status: 403 });
        }

        const updatedResearch = await prisma.researchExperience.update({
            where: {
                id: research_id,
            },
            data: {
                researchGroup: researchGroup,
                title: title,
                piName: piName,
                startDate: new Date(startDate),
                ongoing: ongoing,
                endDate: endDate ? new Date(endDate) : null,
                description: description,
                profile: {
                    connect: {
                        userId: user_id,
                    },
                },
            }
        });

        return new Response(JSON.stringify(updatedResearch), { status: 200 });
    } catch (error) {
        console.error("Error updating research experience:", error);
        return new Response("Internal Server Error", { status: 500 });
    } 
}

export async function DELETE(
    { params }: { params: Promise<{ user_id: string; research_id: string }> }
){
    const { user_id, research_id } = await params;
    const session = await getServerSession(authOptions);

    if (!session) {
        return new Response("Unauthorized", { status: 401 });
    }

    try {
        const profile = await prisma.profile.findUnique({
            where: {
                userId: user_id,
            },
        });

        if (!profile) {
            return new Response("Profile not found", { status: 404 });
        }

        if (session.user_id !== profile.userId) {
            return new Response("Forbidden", { status: 403 });
        }

        const deletedResearch = await prisma.researchExperience.delete({
            where: {
                id: research_id,
            },
        });

        return new Response(JSON.stringify(deletedResearch), { status: 200 });
    } catch(error) {
        console.error("Error deleting research experience:", error);
        return new Response("Internal Server Error", { status: 500 });
    }
}