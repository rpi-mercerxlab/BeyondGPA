"use client";

import { StudentProject } from "@/types/student_project";
import { useState } from "react";

export default function TitleEdit({
  project_data,
  onError,
}: {
  project_data: StudentProject;
  onError: (error: string) => void;
}) {
  const [title, setTitle] = useState(project_data.title);

  const updateTitle = async () => {
    const res = await fetch(
      `/api/v1/project/${project_data.project_id}/title`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title }),
      }
    );

    if (!res.ok) {
      onError("Failed to update title.");
    }
  };

  return (
    <div>
      <h2>Edit Project Title</h2>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={updateTitle}
      />
    </div>
  );
}
