export default async function ProjectView({
  params,
}: {
  params: Promise<{ project_id: string }>;
}) {
  const { project_id } = await params;

  return (
    <div>
      <h1>View Project {project_id}</h1>
    </div>
  );
}
