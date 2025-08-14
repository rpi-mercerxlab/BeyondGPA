"use client";

import { StudentProject } from "@/types/student_project";
import { getSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Session } from "next-auth";
import TitleEdit from "./TitleEdit";
import OwnersToolbox from "./OwnersToolbox";

export default function ProjectEditBody({
  project_id,
}: {
  project_id: string;
}) {
  const [project, setProject] = useState<StudentProject | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const [projectResp, sessionResp] = await Promise.all([
        fetch(`/api/v1/project/${project_id}`),
        getSession(),
      ]);

      if (projectResp.ok) {
        const data = await projectResp.json();
        setProject(data.project);
        setIsOwner(sessionResp?.user.email === data.project.owner.email);
        console.log("Project data:", data.project);
      } else {
        setError("Failed to fetch project");
      }

      setSession(sessionResp);
    };
    fetchData();
  }, []);

  const setVisibility = async (visibility: string) => {
    const response = await fetch(
      `/api/v1/project/${project!.project_id}/visibility`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ visibility }),
      }
    );

    return { ok: response.ok, message: await response.text() };
  };

  return (
    <div>
      {project ? (
        <div>
          <a href={`/project/${project!.project_id}`}>View Project</a>
          <TitleEdit
            project_data={project}
            onError={(error) => setError(error)}
          />
          {isOwner && (
            <OwnersToolbox project={project} setVisibility={setVisibility} />
          )}
        </div>
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
}
