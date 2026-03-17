import { StudentProject } from "@/types/student_project";

export default function ProjectList({
  projects,
}: {
  projects: StudentProject[];
}) {
  return (
    <div className="space-y-4">
      {projects.map((project, index) => (
        <a
          key={project.project_id}
          className="bg-bg-base-100 rounded-lg shadow-lg max-w-sm w-full xs:h-[400px]"
          href={`/project/${project.project_id}`}
          title={`Click here to learn more about ${project.title}.`}
        >
          {project.thumbnail && (
            <img
              src={project.thumbnail.url}
              alt={project.thumbnail.alt}
              className="w-full h-auto max-h-48 rounded-t-lg object-contain"
            />
          )}
          <div className="p-2 w-full">
            <h2 className="text-2xl text-primary text-center line-clamp-2">
              {project.title}
            </h2>
            <div className="max-w-full flex items-center truncate">
              <h3 className="text-sm font-semibold text-primary mr-1 ">
                Contributors:
              </h3>
              <p className=" truncate text-sm min-w-0">
                {project.contributors.join(", ")}
              </p>
            </div>
            <div className="flex items-center border-b border-primary truncate">
              <h3 className="text-sm font-semibold text-primary mr-1">
                Skills:
              </h3>
              <p className="truncate text-sm min-w-0">
                {project.skillTags.join(", ")}
              </p>
            </div>
            <p
              className="line-clamp-4"
              dangerouslySetInnerHTML={{ __html: project.description }}
            ></p>
          </div>
        </a>
      ))}
    </div>
  );
}
