import Footer from "@/components/common/footer";
import Header from "@/components/common/header/header";
import ProjectEditBody from "@/components/ProjectEdit/ProjectEdit";
import { StudentProject } from "@/types/student_project";

export default async function ProjectEdit({
  params,
}: {
  params: Promise<{ project_id: string }>;
}) {
  const { project_id } = await params;

  return (
    <div className="w-full h-full flex flex-col items-center justify-start min-h-screen">
      <Header />
      <div className="flex flex-col items-center justify-start w-2/3 grow shrink basis-auto">
        <ProjectEditBody project_id={project_id} />
      </div>
      <Footer />
    </div>
  );
}
