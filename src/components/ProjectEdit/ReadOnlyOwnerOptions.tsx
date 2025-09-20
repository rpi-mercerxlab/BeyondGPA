import { StudentProject } from "@/types/student_project";

export default function ReadOnlyOwnerOptions({
  project,
}: {
  project: StudentProject;
}) {
  return (
    <div className="flex flex-col items-start justify-start w-full shadow p-2 rounded-md">
      <h1 className="text-xl font-bold text-primary pl-2">
        Project Owner Settings
      </h1>
      <p className="pl-2">
        Only the project owner, <span className="font-bold text-primary">{project.owner.name}</span>, can change these settings.{" "}
      </p>
      <div className="flex flex-col items-start justify-between w-full p-2">
        <div className="w-full flex items-center justify-between pb-2 border-b border-gray-300">
          <p className="w-fit text-center">Visibility Setting</p>
          <p className="w-fit text-center">{project.visibility}</p>
        </div>
        <div className="w-full flex flex-col items-start space-y-2 border-b border-gray-300 py-2">
          <p>Contributors</p>
          {project.contributors.map((contributor) => (
            <div
              className="w-full flex items-center justify-between"
              key={contributor.id}
            >
              <p className="text-sm">{contributor.name}</p>
              <p className="text-sm">{contributor.email}</p>
              <p className="text-sm">{contributor.role}</p>
            </div>
          ))}
        </div>
        <div className="w-full flex items-center justify-between py-2 border-b border-gray-300 space-y-2">
          <p className="mb-0">Project Group</p>
          <p>
            {project.group.name.length > 0 ? project.group.name : "No Group"}
          </p>
        </div>
      </div>
    </div>
  );
}
