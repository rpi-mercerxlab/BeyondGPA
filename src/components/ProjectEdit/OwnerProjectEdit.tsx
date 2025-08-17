"use client";

import { Group, StudentProject } from "@/types/student_project";
import { use, useEffect, useState } from "react";
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
import ContributorEditableItems from "./ContributorEditableItems";

export default function OwnerProjectEdit({
  project,
}: {
  project: StudentProject;
}) {
  const [clientProject, updateProject] = useState<StudentProject>(project);
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
              if (resp.ok) {
                updateProject((prev) => ({
                  ...prev,
                  title: e.target.value,
                }));
              }
              setError(resp.message);
            }}
          />
          <OwnersToolbox
            project={clientProject}
            availableGroups={availableGroups}
            setVisibility={async (visibility) => {
              const resp = await setVisibility(project.project_id, visibility);
              if (resp.ok) {
                updateProject((prev) => ({
                  ...prev,
                  visibility,
                }));
              }
              return resp;
            }}
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
              if (resp.ok) {
                updateProject((prev) => ({
                  ...prev,
                  group: resp.group,
                }));
              }
              return resp;
            }}
            onDeleteProject={async () => await deleteProject(project_id)}
            onAddContributor={async () => {
              const resp = await addContributor(project_id);
              if (resp.ok) {
                updateProject((prev) => ({
                  ...prev,
                  contributors: [
                    ...prev.contributors,
                    { id: resp.id, name: "", email: "", role: "VIEWER" },
                  ],
                }));
              }
              return resp;
            }}
            onRemoveContributor={async (contributorId) => {
              const resp = await removeContributor(project_id, contributorId);
              if (resp.ok) {
                updateProject((prev) => ({
                  ...prev,
                  contributors: prev.contributors.filter(
                    (c) => c.id !== contributorId
                  ),
                }));
              }
              return resp;
            }}
            onUpdateContributor={async (contributor) => {
              const resp = await updateContributor(project_id, contributor);
              if (resp.ok) {
                updateProject((prev) => ({
                  ...prev,
                  contributors: prev.contributors.map((c) =>
                    c.id === contributor.id ? contributor : c
                  ),
                }));
              }
              return resp;
            }}
          />
          <ContributorEditableItems
            project={project}
            availableSkillTags={availableSkillTags}
            onThumbnailChange={onThumbnailChange}
            onThumbnailCaptionChange={onThumbnailCaptionChange}
            onThumbnailDelete={onThumbnailDelete}
            onAddImage={onAddImage}
            onImageCaptionChange={onImageCaptionChange}
            onImageDelete={onImageDelete}
            onAddSkillTag={onAddSkillTag}
            onRemoveSkillTag={onRemoveSkillTag}
            onCreateSkillTag={onCreateSkillTag}
            onAddLink={onAddLink}
            onLinkChange={onLinkChange}
            onLinkDelete={onLinkDelete}
            onDescriptionChange={onDescriptionChange}
            onAddQuestion={onAddQuestion}
            onQuestionChange={onQuestionChange}
            onQuestionDelete={onQuestionDelete}
          />
        </div>
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
}
