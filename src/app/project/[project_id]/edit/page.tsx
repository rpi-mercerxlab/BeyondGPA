import Footer from "@/components/common/footer";
import Header from "@/components/common/header/header";
import ContributorProjectEdit from "@/components/ProjectEdit/ContributorEdit";
import OwnerProjectEdit from "@/components/ProjectEdit/OwnerProjectEdit";
import { authOptions } from "@/lib/authentication/auth";
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
  const project = await fetch(
    `${process.env.NEXTAUTH_URL}/api/v1/project/${project_id}`
  );

  if (!project.ok) {
    // TODO: 404 Page Needed
    return <div>Error loading project</div>;
  }

  const projectData: StudentProject = (await project.json()).project;

  const isOwner = projectData.owner.email === session.user.email;
  const canEdit = projectData.contributors.some(
    (c) => c.email === session.user.email && c.role === "EDITOR"
  );

  return (
    <div className="w-full h-full flex flex-col items-center justify-start min-h-screen">
      <Header />
      <div className="flex flex-col items-center justify-start w-2/3 grow shrink basis-auto">
        {isOwner && <OwnerProjectEdit project={projectData} />}
        {!isOwner && canEdit && (
          <ContributorProjectEdit project={projectData} />
        )}
        {!isOwner && !canEdit && (
          <div>You do not have permission to edit this project.</div>
        )}
      </div>
      <Footer />
    </div>
  );
}
