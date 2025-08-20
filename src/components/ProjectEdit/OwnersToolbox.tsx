"use client";
import { Group, ProjectVisibility } from "@/types/student_project";
import { StudentProject } from "@/types/student_project";
import { useState } from "react";
import BeyondButton from "../common/BeyondComponents/BeyondButton";
import { Contributor } from "@/types/student_project";
import BeyondLineEdit from "../common/BeyondComponents/BeyondLineEdit";

export default function OwnersToolbox({
  project,
  availableGroups,
  setVisibility,
  transferOwnership,
  onSetGroup,
  onCreateGroup,
  onDeleteProject,
  onAddContributor,
  onRemoveContributor,
  onUpdateContributor,
}: {
  project: StudentProject;
  availableGroups: Group[];
  setVisibility: (
    visibility: ProjectVisibility
  ) => Promise<{ ok: boolean; message?: string }>;
  transferOwnership: (
    email: string
  ) => Promise<{ ok: boolean; message?: string }>;
  // If groupId is not provided, it will unset the group
  onSetGroup: (groupId?: string) => Promise<{ ok: boolean; message?: string }>;
  onCreateGroup: (groupName: string) => Promise<{
    ok: boolean;
    group?: Group;
    message?: string;
  }>;
  onDeleteProject: () => Promise<{ ok: boolean; message?: string }>;
  onAddContributor: () => Promise<{ ok: boolean; message?: string }>;
  onRemoveContributor: (
    contributorId: string
  ) => Promise<{ ok: boolean; message?: string }>;
  onUpdateContributor: (
    contributor: Contributor
  ) => Promise<{ ok: boolean; message?: string }>;
}) {
  const [error, setError] = useState<string | null>(null);
  const [newGroupName, setNewGroupName] = useState<string>("");

  const handleGroupChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const groupId = e.target.value;
    if (groupId === "") {
      const resp = await onSetGroup();
      if (!resp.ok) {
        setError(resp.message || "Failed to unset group");
        return;
      }
    }
    const resp = await onSetGroup(groupId);
    if (!resp.ok) {
      setError(resp.message || "Failed to set group");
      return;
    }
    setError(null);
  };

  return (
    <div className="flex flex-col items-start justify-start w-full shadow p-2 rounded-md">
      <h1 className="text-xl font-bold text-primary">Project Owner Settings</h1>
      {error && (
        <div className="text-red-500 flex items-center space-x-2">
          <span className="bg-red-500 text-white w-4 h-4 rounded-full flex items-center justify-center mx-2">
            !
          </span>
          {error}. Please try again.
        </div>
      )}
      <div className="flex flex-col items-start justify-between w-full p-2">
        <div className="w-full flex items-center justify-between pb-2 border-b border-gray-300">
          <p className="w-fit text-center">Visibility Setting</p>
          <select
            className="w-fit bg-bg-base-200 border border-gray-300 rounded-md p-1 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            onChange={async (e) => {
              const visibility = e.target.value;
              const result = await setVisibility(
                visibility as ProjectVisibility
              );
              if (!result.ok) {
                setError(result.message || "Failed to update visibility");
                return;
              }
              setError(null);
            }}
            value={project.visibility}
          >
            <option value="DRAFT">Draft</option>
            <option value="PUBLIC">Public</option>
          </select>
        </div>
        <div className="w-full flex flex-col items-start space-y-2 border-b border-gray-300 py-2">
          <p>Contributors</p>
          {project.contributors.map((contributor) => (
            <div
              className="w-full flex items-center justify-between"
              key={contributor.id}
            >
              <BeyondLineEdit
                className="text-sm text-black font-normal"
                placeholder="Contributor Name"
                value={contributor.name}
                onChange={async (value) => {
                  const updatedContributor = {
                    ...contributor,
                    name: value,
                  };
                  const result = await onUpdateContributor(updatedContributor);
                  if (!result.ok) {
                    setError(result.message || "Failed to update contributor");
                    return;
                  }
                  setError(null);
                }}
              />
              <BeyondLineEdit
                placeholder="Contributor Email"
                value={contributor.email}
                onChange={async (value) => {
                  const updatedContributor = {
                    ...contributor,
                    email: value,
                  };
                  const result = await onUpdateContributor(updatedContributor);
                  if (!result.ok) {
                    setError(result.message || "Failed to update contributor");
                    return;
                  }
                  setError(null);
                }}
              />
              <select
                className="w-fit bg-bg-base-200 border border-gray-300 rounded-md p-1 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                defaultValue={contributor.role}
                onChange={async (e) => {
                  const updatedContributor = {
                    ...contributor,
                    role: e.target.value as "VIEWER" | "EDITOR",
                  };
                  const result = await onUpdateContributor(updatedContributor);
                  if (!result.ok) {
                    setError(result.message || "Failed to update contributor");
                    return;
                  }
                  setError(null);
                }}
              >
                <option value="VIEWER">Viewer</option>
                <option value="EDITOR">Editor</option>
              </select>
              {contributor.email !== project.owner.email ? (
                <BeyondButton
                  className="text-base h-8 flex items-center"
                  onClick={async () => {
                    const result = await onRemoveContributor(contributor.id);
                    if (!result.ok) {
                      setError(
                        result.message || "Failed to remove contributor"
                      );
                      return;
                    }
                    setError(null);
                  }}
                >
                  Remove Contributor
                </BeyondButton>
              ) : (
                <BeyondButton className="opacity-0">
                  Remove Contributor
                </BeyondButton>
              )}
            </div>
          ))}
          <BeyondButton
            className="text-base h-8 flex items-center"
            onClick={async () => {
              const resp = await onAddContributor();
              if (!resp.ok) {
                setError(resp.message || "Failed to add contributor");
                return;
              }
              setError(null);
            }}
          >
            Add Contributor
          </BeyondButton>
        </div>
        <div className="w-full flex items-center justify-between py-2 border-b border-gray-300">
          <p>Transfer Ownership</p>
          <select
            className="w-fit bg-bg-base-200 border border-gray-300 rounded-md p-1 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            defaultValue="select"
            onChange={async (e) => {
              const email = e.target.value;
              if (
                !confirm(
                  `Are you sure you want to transfer ownership to ${email}?`
                )
              )
                return;
              const result = await transferOwnership(email);
              if (!result.ok) {
                setError(result.message || "Failed to transfer ownership");
                return;
              }
            }}
          >
            <option value="select" disabled>
              Select a contributor
            </option>
            {project.contributors.map((contributor) => (
              <option key={contributor.id} value={contributor.email}>
                {contributor.name}
              </option>
            ))}
          </select>
        </div>
        <div className="w-full flex items-center justify-between py-2 border-b border-gray-300 space-y-2">
          <p className="mb-0">Set Project Group</p>
          <select
            className="w-fit bg-bg-base-200 border mb-0 border-gray-300 rounded-md p-1 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            onChange={async (e) => {
              handleGroupChange(e);
            }}
            defaultValue={project.group.id}
          >
            <option value="select" disabled>
              Select a group
            </option>
            <option value="">None</option>
            {availableGroups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
          <p className="font-bold text-primary mb-0">OR</p>
          <div className="flex items-center space-x-2">
            <BeyondLineEdit
              placeholder="Create a new group"
              value={newGroupName}
              onChange={setNewGroupName}
              debounceDuration={20}
            />
            <BeyondButton
              className="text-base h-8 flex items-center"
              onClick={async () => {
                if (newGroupName.trim() === "") return;
                const resp = await onCreateGroup(newGroupName);
                if (!resp.ok) {
                  setError(resp.message || "Failed to create group");
                  return;
                }
                setNewGroupName("");
                setError(null);
              }}
            >
              Create Group
            </BeyondButton>
          </div>
        </div>
        <div className="w-full flex items-center justify-between pt-2">
          <p>Delete Project</p>
          <BeyondButton
            className="text-base h-8 flex items-center"
            onClick={async () => {
              if (
                !confirm(
                  "Are you sure you want to delete this project? This action cannot be undone."
                )
              )
                return;
              const result = await onDeleteProject();
              if (!result.ok) {
                setError(result.message || "Failed to delete project");
                return;
              }
              setError(null);
            }}
          >
            Delete
          </BeyondButton>
        </div>
      </div>
    </div>
  );
}
