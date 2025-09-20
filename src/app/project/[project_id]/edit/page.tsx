import Footer from "@/components/common/footer";
import Header from "@/components/common/header/header";
import ContributorProjectEdit from "@/components/ProjectEdit/ContributorEdit";
import OwnerProjectEdit from "@/components/ProjectEdit/OwnerProjectEdit";
import { authOptions } from "@/lib/authentication/auth";
import { prisma } from "@/lib/prisma";
import { StudentProject } from "@/types/student_project";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function ProjectEdit({
  params,
}: {
  params: Promise<{ project_id: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect(`${process.env.NEXTAUTH_URL}/login`);
  }

  const project_id = (await params).project_id;
  const projectData = await prisma.project.findUnique({
    where: { id: project_id },
    select: {
      id: true,
      title: true,
      description: true,
      visibility: true,
      thumbnail: { select: { url: true, altText: true, id: true } },
      contributors: {
        select: { name: true, email: true, id: true, role: true },
        orderBy: { createdAt: "asc" },
      },
      skillTags: { select: { name: true, id: true } },
      images: {
        select: { url: true, altText: true, id: true },
        orderBy: { createdAt: "desc" },
      },
      owner: { select: { firstName: true, lastName: true, email: true } },
      links: { select: { url: true, label: true, id: true } },
      questionPrompts: { select: { question: true, answer: true, id: true } },
      createdAt: true,
      updatedAt: true,
      group: { select: { id: true, name: true } },
      storageRemaining: true,
    },
  });

  if (!projectData || projectData.visibility === "DELETED") {
    // TODO: 404 Page Needed
    return <div>Error loading project</div>;
  }

  const project: StudentProject = {
    project_id: projectData.id,
    title: projectData.title,
    visibility: projectData.visibility,
    owner: {
      name: `${projectData.owner.firstName} ${projectData.owner.lastName}`,
      email: projectData.owner.email,
    },
    contributors: projectData.contributors.map((contributor) => ({
      name: contributor.name,
      email: contributor.email,
      id: contributor.id,
      role: contributor.role,
    })),
    skillTags: projectData.skillTags,
    images: projectData.images.map((image) => ({
      url: image.url,
      alt: image.altText,
      id: image.id,
    })),
    links: projectData.links.map((link) => ({
      link: link.url,
      coverText: link.label,
      id: link.id,
    })),
    description: projectData.description,
    thumbnail: projectData.thumbnail
      ? {
          url: projectData.thumbnail.url,
          alt: projectData.thumbnail.altText,
          id: projectData.thumbnail.id!,
        }
      : null,
    questions: projectData.questionPrompts.map((q) => ({
      question: q.question,
      answer: q.answer,
      id: q.id,
    })),
    group: {
      name: projectData.group?.name || "",
      id: projectData.group?.id || "",
    },
    createdAt: projectData.createdAt.toISOString(),
    updatedAt: projectData.updatedAt.toISOString(),
    storageRemaining: projectData.storageRemaining,
  };

  const isOwner = project.owner.email === session.user.email;
  const canEdit = project.contributors.some(
    (c) => c.email === session.user.email && c.role === "EDITOR"
  );

  return (
    <div className="w-full h-full flex flex-col items-center justify-start min-h-screen">
      <Header />
      <div className="flex flex-col items-center justify-start w-full sm:w-11/12 md:w-5/6 lg:w-2/3 grow shrink basis-auto">
        {isOwner && <OwnerProjectEdit project={project} />}
        {!isOwner && canEdit && <ContributorProjectEdit project={project} />}
        {!isOwner && !canEdit && (
          <div>You do not have permission to edit this project.</div>
        )}
      </div>
      <Footer />
    </div>
  );
}
