import Header from "@/components/common/header/header";
import { StudentProject } from "@/types/student_project";

export default async function ProjectEdit({
  params,
}: {
  params: Promise<{ project_id: string }>;
}) {
  const { project_id } = await params;
  const project_data: StudentProject = await fetch(
    `/api/v1/project/${project_id}`
  ).then((res) => res.json());

  return (
    <div>
      <Header />
      <a href={`/project/${project_id}`}>Back to Project</a>
    </div>
  );
}
