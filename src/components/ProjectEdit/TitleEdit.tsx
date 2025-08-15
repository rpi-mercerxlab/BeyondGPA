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

  

  return (
    <div>
      
    </div>
  );
}
