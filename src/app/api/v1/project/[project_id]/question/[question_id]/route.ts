import { authOptions } from "@/lib/authentication/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import createDOMPurify from "dompurify";
import { JSDOM } from "jsdom";

const domPurify = createDOMPurify(new JSDOM().window);

export async function PUT(
  request: Request,
  {
    params,
  }: {
    params: Promise<{
      project_id: string;
      question_id: string;
    }>;
  }
) {
  const { project_id, question_id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const project = await prisma.project.findUnique({
      where: {
        id: project_id,
      },
      select: {
        contributors: {
          select: {
            email: true,
            role: true,
          },
        },
      },
    });

    if (!project) {
      return new Response("Project not found", { status: 404 });
    }

    if (
      !project.contributors.some(
        (c) => c.email === session.user.email && c.role === "EDITOR"
      )
    ) {
      return new Response("Forbidden", { status: 403 });
    }

    const reqJSON = await request.json();
    const prompt = reqJSON.question;
    const answer = reqJSON.answer;

    const sanitizedAnswer = domPurify.sanitize(answer, {
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

    await prisma.questionPrompt.update({
      where: {
        id: question_id,
      },
      data: {
        question: prompt,
        answer: sanitizedAnswer,
      },
    });

    return new Response(
      JSON.stringify({ prompt, answer: sanitizedAnswer, id: question_id }),
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error updating image alt text:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ project_id: string; question_id: string }> }
) {
  const { project_id, question_id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const project = await prisma.project.findUnique({
      where: {
        id: project_id,
      },
      select: {
        contributors: {
          select: {
            email: true,
            role: true,
          },
        },
      },
    });

    if (!project) {
      return new Response("Project not found", { status: 404 });
    }

    if (
      !project.contributors.some(
        (c) => c.email === session.user.email && c.role === "EDITOR"
      )
    ) {
      return new Response("Forbidden", { status: 403 });
    }

    await prisma.questionPrompt.delete({
      where: {
        id: question_id,
      },
    });

    return new Response(undefined, { status: 204 });
  } catch (error) {
    console.error("Error deleting question:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
