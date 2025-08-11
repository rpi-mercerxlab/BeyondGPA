export default async function ProjectEdit({
  params,
}: {
  params: Promise<{ project_id: string }>;
}) {
  const { project_id } = await params;

  return (
    <div>
      <h1>Edit Project {project_id}</h1>
    </div>
  );
}
