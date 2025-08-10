import { NextApiRequest } from "next";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authentication/auth";

export async function GET(
    _: NextApiRequest,
) {
    try {
        const skillTags = await prisma.skillTag.findMany({
            orderBy: { name: 'asc' },
        });

        return new Response(JSON.stringify(skillTags), { status: 200 });
    } catch (error) {
        console.error("Error fetching skill tags:", error);
        return new Response(undefined, { status: 500 });
    }
}

export async function POST(request: NextApiRequest) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return new Response(undefined, { status: 401 });
    }

    if (session.user.role !== "student") {
        return new Response(undefined, { status: 403 });
    }

    const skill = request.body.skill;

    try {

        // Check if skill tag already exists
        const existingTag = await prisma.skillTag.findUnique({
            where: { name: skill },
        });

        if (existingTag) {
            return new Response(JSON.stringify(existingTag), { status: 200 });
        }

        const newSkillTag = await prisma.skillTag.create({
            data: { name: skill },
        });

        return new Response(JSON.stringify(newSkillTag), { status: 201 });

    } catch (error) {
        console.error("Error creating skill tag:", error);
        return new Response(undefined, { status: 500 });
    }
}
