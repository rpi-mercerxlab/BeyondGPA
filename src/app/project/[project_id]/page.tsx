export default function ProjectView({
  params,
}: {
  params: { project_id: string };
}) {
  const { project_id } = params;

  return (
    <div>
      <h1>View Project {project_id}</h1>
    </div>
  );
}
