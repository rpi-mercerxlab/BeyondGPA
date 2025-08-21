import BeyondButtonLink from "@/components/common/BeyondComponents/BeyondButtonLink";
import BeyondLink from "@/components/common/BeyondComponents/BeyondLink";
import Footer from "@/components/common/footer";
import Header from "@/components/common/header/header";
import { authOptions } from "@/lib/authentication/auth";
import { prisma } from "@/lib/prisma";
import { ArrowLeft } from "lucide-react";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function ProjectView({
  params,
}: {
  params: Promise<{ project_id: string }>;
}) {
  const { project_id } = await params;

  const projectData = await prisma.project.findUnique({
    where: { id: project_id },
    select: {
      title: true,
      description: true,
      thumbnail: {
        select: { url: true, altText: true, id: true },
      },
      images: {
        select: { url: true, altText: true, id: true },
      },
      contributors: {
        select: { name: true, email: true, id: true, role: true },
        orderBy: { createdAt: "asc" },
      },
      group: {
        select: { id: true, name: true },
      },
      links: {
        select: { id: true, url: true, label: true },
      },
      skillTags: {
        select: { id: true, name: true },
      },
      visibility: true,
      questionPrompts: {
        select: { id: true, question: true, answer: true },
      },
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!projectData) {
    redirect("/404");
  }

  if (projectData.visibility === "DELETED") {
    redirect("/404");
  }

  const session = await getServerSession(authOptions);

  if (!session && projectData.visibility === "DRAFT") {
    redirect("/login");
  }

  if (
    projectData.visibility === "DRAFT" &&
    !projectData.contributors.some(
      (contributor) => contributor.email === session?.user.email
    )
  ) {
    redirect("/404");
  }

  const canEdit = projectData.contributors.some(
    (contributor) =>
      contributor.email === session?.user.email && contributor.role === "EDITOR"
  );

  return (
    <div className="flex flex-col w-full items-center min-h-screen justify-start">
      <Header />
      <div className="flex flex-col w-2/3 grow shrink basis-auto mt-2">
        <div className="flex w-full items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-primary">
            <ArrowLeft size={32} /> Back to Project Search
          </Link>

          {canEdit && (
            <BeyondButtonLink
              className="h-8 flex items-center"
              href={`/project/${project_id}/edit`}
            >
              Edit Project
            </BeyondButtonLink>
          )}
        </div>
        <div className="flex space-x-2">
          <div className="w-2/3">
            <h1 className="text-[20pt] text-primary">{projectData.title}</h1>
            <p
              dangerouslySetInnerHTML={{ __html: projectData.description }}
            ></p>
            {projectData.questionPrompts.length > 0 &&
              projectData.questionPrompts.map((q) => (
                <div key={q.id} className="mt-4">
                  <h2 className="text-2xl text-primary">{q.question}</h2>
                  <p dangerouslySetInnerHTML={{ __html: q.answer }} />
                </div>
              ))}
          </div>
          <div className="w-1/3 flex flex-col rounded-md shadow-md p-2 mb-2">
            <p className="text-gray-500">
              Created On: {projectData.createdAt.toLocaleDateString()}
            </p>
            <p className="text-gray-500">
              Updated: {projectData.updatedAt.toLocaleDateString()}
            </p>
            <h2 className="text-2xl text-primary">Collaborators</h2>
            {projectData.contributors.map((contributor) => (
              <div
                key={contributor.id}
                className="flex items-center space-x-2 text-sm"
              >
                <span>{contributor.name}</span>
                <BeyondLink href={`mailto:${contributor.email}`}>
                  Email
                </BeyondLink>
              </div>
            ))}
            <h2 className="text-2xl text-primary mt-2">Skills Used</h2>
            <div className="flex flex-wrap gap-2">
              {projectData.skillTags.map((tag) => (
                <span
                  key={tag.id}
                  className="text-sm bg-primary text-white px-2 py-1 rounded"
                >
                  {tag.name}
                </span>
              ))}
            </div>
            <h2 className="text-2xl text-primary mt-2">Course / Group</h2>
            {projectData.group ? (
              <div className="flex items-center space-x-2 text-sm">
                <span>{projectData.group.name}</span>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No group assigned</p>
            )}
            <h2 className="text-2xl text-primary mt-2">Relevant Links</h2>
            <div className="flex flex-col space-y-2">
              {projectData.links.map((link) => (
                <BeyondLink key={link.id} href={link.url}>
                  {link.label}
                </BeyondLink>
              ))}
            </div>
            {projectData.thumbnail && (
              <>
                <h2 className="text-2xl text-primary mt-2">Thumbnail</h2>
                <img
                  src={projectData.thumbnail.url}
                  alt={projectData.thumbnail.altText}
                  className="w-full h-auto rounded-md"
                />
              </>
            )}
            {projectData.images.length > 0 && (
              <>
                <h2 className="text-2xl text-primary mt-2">Images</h2>
                <div className="flex flex-col space-y-2">
                  {projectData.images.map((image) => (
                    <div key={image.id} className="flex flex-col items-center">
                      <img
                        src={image.url}
                        alt={image.altText}
                        className="w-full h-auto rounded-md "
                      />
                      <p className="text-sm">{image.altText}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
