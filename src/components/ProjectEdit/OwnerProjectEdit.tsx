"use client";

import { Group, StudentProject } from "@/types/student_project";
import { useEffect, useState } from "react";
import OwnersToolbox from "./OwnersToolbox";
import {
  addContributor,
  assignGroup,
  createNewGroup,
  deleteProject,
  removeContributor,
  setVisibility,
  transferOwnership,
  updateContributor,
  updateTitle,
} from "@/lib/actions/student_project";

export default function OwnerProjectEdit({
  project,
}: {
  project: StudentProject;
}) {
  const [groupsFetched, setGroupsFetched] = useState(false);
  const [availableGroups, setAvailableGroups] = useState<Group[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGroups = async () => {
      const availableGroupsResp = await fetch(`/api/v1/project/groups`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!availableGroupsResp.ok) {
        setError(await availableGroupsResp.text());
        return;
      }

      const groups = await availableGroupsResp.json();
      setAvailableGroups(groups.groups);
      setGroupsFetched(true);
    };
    fetchGroups();
  }, []);

  const project_id = project.project_id;

  return (
    <div className="flex flex-col space-y-4 w-full p-4">
      {groupsFetched ? (
        <div className="flex flex-col space-y-4 w-full">
          <a href={`/project/${project!.project_id}`}>View Project</a>
          <input
            className="w-full bg-bg-base-200 border border-gray-300 rounded-md p-1 focus:outline-none focus:ring-2 focus:ring-primary text-3xl font-bold text-primary"
            type="text"
            placeholder="Enter project title"
            defaultValue={project.title}
            onBlur={async (e) => {
              const resp = await updateTitle(project_id, e.target.value);
              if (!resp.ok) {
                setError(resp.message);
              }
            }}
          />
          <OwnersToolbox
            project={project}
            availableGroups={availableGroups}
            setVisibility={async (visibility) =>
              await setVisibility(project.project_id, visibility)
            }
            transferOwnership={async (email) =>
              await transferOwnership(project.project_id, email)
            }
            onCreateGroup={async (name) => {
              const resp = await createNewGroup(name);
              if (!resp.ok) {
                return resp;
              }
              setAvailableGroups((prev) => [...prev, resp.group]);
              return resp;
            }}
            onSetGroup={async (group_id) => {
              const resp = await assignGroup(project_id, group_id);
              if (!resp.ok) {
                return resp;
              }
              project.group = resp.group;
              return resp;
            }}
            onDeleteProject={async () => await deleteProject(project_id)}
            onAddContributor={async () => await addContributor(project_id)}
            onRemoveContributor={async (contributorId) =>
              await removeContributor(project_id, contributorId)
            }
            onUpdateContributor={async (contributor) =>
              await updateContributor(project_id, contributor)
            }
          />
        </div>
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
}
