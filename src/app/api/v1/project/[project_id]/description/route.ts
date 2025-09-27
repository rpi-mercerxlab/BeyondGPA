import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authentication/auth";
import createDOMPurify from "dompurify";
import { JSDOM } from "jsdom";

const domPurify = createDOMPurify(new JSDOM().window);

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ project_id: string }> }
) {
  const { project_id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const json = await request.json();
  const description = json.description;

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
    return new Response("Invalid Description", { status: 400 });
  }

  try {
    const project = await prisma.project.findUnique({
      where: { id: project_id },
      include: { contributors: { select: { email: true, role: true } } },
    });

    if (!project) {
      return new Response("Project Not Found", { status: 404 });
    }

    if (
      project.contributors.some(
        (c) => c.email === session.user.email && c.role === "EDITOR"
      ) === false
    ) {
      return new Response("Forbidden", { status: 403 });
    }

    await prisma.project.update({
      where: { id: project_id },
      data: { description: sanitizedDescription },
    });

    return new Response(JSON.stringify({ description: sanitizedDescription }), {
      status: 200,
    });
  } catch (error) {
    console.error("Error updating project description:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
