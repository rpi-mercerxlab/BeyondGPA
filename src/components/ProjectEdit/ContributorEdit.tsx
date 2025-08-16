"use client";

import { StudentProject } from "@/types/student_project";
import { useState } from "react";
import ReadOnlyOwnerOptions from "./ReadOnlyOwnerOptions";

export default function ContributorProjectEdit({
  project,
}: {
  project: StudentProject;
}) {
  const [error, setError] = useState<string | null>(null);

  const project_id = project.project_id;

  return (
    <div className="flex flex-col space-y-4 w-full p-4">
      <div className="flex flex-col space-y-4 w-full">
        <a href={`/project/${project!.project_id}`}>View Project</a>
        <h1 className="text-2xl font-bold text-primary">{project.title}</h1>
        {error && (
          <div className="text-red-500 flex items-center space-x-2">
            <span className="bg-red-500 text-white w-4 h-4 rounded-full flex items-center justify-center mx-2">
              !
            </span>
            {error}. Please try again.
          </div>
        )}
        <ReadOnlyOwnerOptions project={project} />
      </div>
    </div>
  );
}
