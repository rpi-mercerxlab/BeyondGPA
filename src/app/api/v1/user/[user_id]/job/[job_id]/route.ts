import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authentication/auth";
import createDOMPurify from "dompurify";
import { JSDOM } from "jsdom";

const domPurify = createDOMPurify(new JSDOM().window);

export async function PUT(
	request: Request,
	{ params }: { params: Promise<{ user_id: string; job_id: string }> },
) {
	const { user_id, job_id } = await params;
	const session = await getServerSession(authOptions);
	if (!session) {
		return Response.json(
			{
				statusCode: 401,
				message: "Unauthorized",
			},
			{ status: 401 },
		);
	}

	const json = await request.json();
	const company = json.company;
	const title = json.title;
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
					message: "Profile not found",
				},
				{ status: 404 },
			);
		}

		if (session.user.id !== profile.userId) {
			return Response.json(
				{
					statusCode: 403,
					message: "Forbidden",
				},
				{ status: 403 },
			);
		}

		if (description.length > 5000 || typeof description !== "string") {
			return Response.json(
				{
					statusCode: 400,
					message: "Invalid description",
				},
				{ status: 400 },
			);
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
			return Response.json(
				{
					statusCode: 400,
					message: "Invalid description",
				},
				{ status: 400 },
			);
		}

		const updatedJob = await prisma.professionalExperience.update({
			where: {
				id: job_id,
			},
			data: {
				company: company,
				position: title,
				startDate: new Date(startDate),
				ongoing: ongoing,
				endDate: endDate ? new Date(endDate) : null,
				description: description,
				profile: {
					connect: {
						userId: user_id,
					},
				},
			},
		});

		return Response.json(
			{
				statusCode: 200,
				message: "Job experience updated",
				job: updatedJob,
			},
			{ status: 200 },
		);
	} catch (error) {
		console.error("Error updating job experience:", error);
		return Response.json(
			{
				statusCode: 500,
				message: "Internal Server Error",
			},
			{ status: 500 },
		);
	}
}

export async function DELETE({ params }: { params: Promise<{ user_id: string; job_id: string }> }) {
	const { user_id, job_id } = await params;
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

		if (session.user.id !== profile.userId) {
			return new Response("Forbidden", { status: 403 });
		}

		await prisma.professionalExperience.delete({
			where: {
				id: job_id,
			},
		});

		return new Response("Job experience deleted", { status: 200 });
	} catch (error) {
		console.error("Error deleting job experience:", error);
		return new Response("Internal Server Error", { status: 500 });
	}
}
