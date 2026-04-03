import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authentication/auth";
import createDOMPurify from "dompurify";
import { JSDOM } from "jsdom";

const domPurify = createDOMPurify(new JSDOM().window);

export async function PUT(request: Request, { params }: { params: Promise<{ user_id: string }> }) {
	const { user_id } = await params;
	const session = await getServerSession(authOptions);
	if (!session) {
		return new Response("Unauthorized", { status: 401 });
	}
	const json = await request.json();
	const { description } = json;

	try {
		const profile = await prisma.profile.findUnique({
			where: {
				userId: user_id,
			},
		});

		if (!session.user.id) {
			return new Response("User not found", { status: 404 });
		}

		if (session.user.id != user_id) {
			return new Response("Forbidden", { status: 403 });
		}

		if (description.length > 5000 || typeof description !== "string") {
			return new Response("Invalid description", { status: 400 });
		}

		const sanitizedDescription = domPurify.sanitize(description, {
			ALLOWED_TAGS: [
				"b",
				"i",
				"u",
				"sup",
				"sub",
				"em",
				"strong",
				"p",
				"ul",
				"ol",
				"li",
				"pre",
				"code",
			],
			ALLOWED_ATTR: ["class"],
		});

		if (typeof sanitizedDescription !== "string") {
			return new Response("Invalid description", { status: 400 });
		}

		if (!profile) {
			return new Response("Profile not found", { status: 404 });
		}

		const updatedDescription = await prisma.profile.update({
			where: {
				userId: user_id,
			},
			data: {
				description: sanitizedDescription,
			},
		});

		return new Response(JSON.stringify(updatedDescription), { status: 200 });
	} catch (error) {
		console.error("Error updating description:", error);
		return new Response("Internal Server Error", { status: 500 });
	}
}
