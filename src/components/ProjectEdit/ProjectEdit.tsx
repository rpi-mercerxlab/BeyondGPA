"use client";

import { Contributor, Group, StudentProject } from "@/types/student_project";
import { getSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Session } from "next-auth";
import TitleEdit from "./TitleEdit";
import OwnersToolbox from "./OwnersToolbox";
import { redirect } from "next/navigation";
import { group } from "console";

export default function ProjectEditBody({
  project_id,
}: {
  project_id: string;
}) {
  const [project, setProject] = useState<StudentProject | null>(null);
  const [availableGroups, setAvailableGroups] = useState<Group[]>([]);
  const [session, setSession] = useState<Session | null>(null);
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const [projectResp, groupsResp, sessionResp] = await Promise.all([
        fetch(`/api/v1/project/${project_id}`),
        fetch(`/api/v1/project/groups`),
        getSession(),
      ]);

      if (groupsResp.ok) {
        const groupsData = await groupsResp.json();
        setAvailableGroups(groupsData.groups);
      }

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
    const response = await fetch(`/api/v1/project/${project_id}/visibility`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ visibility }),
    });

    return { ok: response.ok, message: await response.text() };
  };

  const updateTitle = async (title: string) => {
    const res = await fetch(`/api/v1/project/${project_id}/title`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title }),
    });

    if (!res.ok) {
      setError(await res.text());
      return;
    }
  };

  const transferOwnership = async (email: string) => {
    const res = await fetch(`/api/v1/project/${project_id}/owner`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    if (!res.ok) {
      return { ok: false, message: await res.text() };
    }

    redirect(`/project/${project_id}`);
  };

  const createNewGroup = async (name: string) => {
    const res = await fetch(`/api/v1/project/groups`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name }),
    });

    if (!res.ok) {
      return { ok: false, message: await res.text() };
    }

    const group = await res.json();
    setAvailableGroups((prev) => [...prev, group]);
    return { ok: true, message: undefined, group };
  };

  const assignGroup = async (groupId?: string) => {
    const res = await fetch(`/api/v1/project/${project_id}/group`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ group_id: groupId }),
    });

    if (!res.ok) {
      return { ok: false, message: await res.text() };
    }

    return { ok: res.ok, message: undefined };
  };

  const deleteProject = async () => {
    const res = await fetch(`/api/v1/project/${project_id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      return { ok: false, message: await res.text() };
    }
    redirect("/");
  };

  const addContributor = async () => {
    const res = await fetch(`/api/v1/project/${project_id}/contributor`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      return { ok: false, message: await res.text() };
    }

    return { ok: true, message: undefined };
  };

  const removeContributor = async (contributorId: string) => {
    const res = await fetch(
      `/api/v1/project/${project_id}/contributor/${contributorId}`,
      {
        method: "DELETE",
      }
    );

    if (!res.ok) {
      return { ok: false, message: await res.text() };
    }

    return { ok: true, message: undefined };
  };

  const updateContributor = async (contributor: Contributor) => {
    const res = await fetch(
      `/api/v1/project/${project_id}/contributor/${contributor.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: contributor.name,
          email: contributor.email,
          role: contributor.role,
        }),
      }
    );

    if (!res.ok) {
      return { ok: false, message: await res.text() };
    }

    return { ok: true, message: undefined };
  };

  return (
    <div className="flex flex-col space-y-4 w-full p-4">
      {project && availableGroups ? (
        <div className="flex flex-col space-y-4 w-full">
          <a href={`/project/${project!.project_id}`}>View Project</a>
          <input
            className="w-full bg-bg-base-200 border border-gray-300 rounded-md p-1 focus:outline-none focus:ring-2 focus:ring-primary text-3xl font-bold text-primary"
            type="text"
            placeholder="Enter project title"
            defaultValue={project.title}
            onBlur={async (e) => updateTitle(e.target.value)}
          />
          {isOwner && (
            <OwnersToolbox
              project={project}
              availableGroups={availableGroups}
              setVisibility={setVisibility}
              transferOwnership={transferOwnership}
              onCreateGroup={createNewGroup}
              onSetGroup={assignGroup}
              onDeleteProject={deleteProject}
              onAddContributor={addContributor}
              onRemoveContributor={removeContributor}
              onUpdateContributor={updateContributor}
            />
          )}
        </div>
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
}
