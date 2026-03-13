import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authentication/auth";

export async function POST(
    request: Request,
    { params }: { params: Promise<{ user_id: string }> }
) {
    const { user_id } = await params;
    const session = await getServerSession(authOptions);
    if (!session) {
        return Response.json(  
        {
            statusCode: 401,
            message: "Unauthorized"
        },
        { status: 401 }
        );
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
            return Response.json(  
                {
                    statusCode: 404,
                    message: "Profile not found"
                },
                { status: 404 }
                );
        }

        if (session.user_id !== profile.userId) {
            return Response.json(  
                {
                    statusCode: 403,
                    message: "Forbidden"
                },
                { status: 403 }
            );
        }

        const newResearch = await prisma.researchExperience.createMany({
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

        return Response.json(
            {
                statusCode: 200,
                message: "Research experience created",
                job: newResearch
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error adding research experience:", error);
        return Response.json(  
            {
                statusCode: 500,
                message: "Internal Server Error"
            },
            { status: 500 }
        );
    } 
}