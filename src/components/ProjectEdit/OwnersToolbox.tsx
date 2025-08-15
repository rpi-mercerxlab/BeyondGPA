"use client";
import { Group } from "@/types/student_project";
import { StudentProject } from "@/types/student_project";
import { useEffect, useState } from "react";

export default function OwnersToolbox({
  project,
  setVisibility,
  transferOwnership,
  onSetGroup,
  onCreateGroup,
  onDeleteProject,
}: {
  project: StudentProject;
  setVisibility: (
    visibility: string
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
}) {
  const [error, setError] = useState<string | null>(null);
  const [availableGroups, setAvailableGroups] = useState<Group[]>([]);
  const [newGroupName, setNewGroupName] = useState<string>("");

  const handleGroupChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const groupId = e.target.value;
    if (groupId === "") {
      const resp = await onSetGroup();
      if (!resp.ok) {
        setError(resp.message || "Failed to unset group");
      }
    }
    const resp = await onSetGroup(groupId);
    if (!resp.ok) {
      setError(resp.message || "Failed to set group");
    }
  };

  useEffect(() => {
    // Fetch available groups for the project
    const fetchGroups = async () => {
      const response = await fetch(`/api/v1/project/groups`);
      const data = await response.json();
      if (response.ok) {
        setAvailableGroups(data.groups);
      } else {
        setError(data.message || "Failed to fetch groups");
      }
    };
    fetchGroups();
  }, []);

  return (
    <div>
      <div>
        <p>Visibility Setting</p>
        <select
          onChange={async (e) => {
            const visibility = e.target.value;
            const result = await setVisibility(visibility);
            if (!result.ok) {
              setError(result.message || "Failed to update visibility");
            }
          }}
          value={project.visibility}
        >
          <option value="DRAFT">Draft</option>
          <option value="PUBLIC">Public</option>
        </select>
      </div>
      <div>
        <p>Transfer Ownership</p>
        <select
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
      <div>
        <p>Set Project Group</p>
        <select onChange={async (e) => {}} value={project.group.id}>
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
        <p>OR</p>
        <input
          type="text"
          placeholder="Create a new group"
          onChange={(e) => setNewGroupName(e.target.value)}
          onBlur={async () => {
            if (newGroupName.trim() === "") return;
            const resp = await onCreateGroup(newGroupName);
            if (!resp.ok) {
              setError(resp.message || "Failed to create group");
              return;
            }
            setAvailableGroups((prev) => [...prev, resp.group!]);
          }}
        />
      </div>
      <div>
        <p>Delete Project</p>
        <button
          onClick={async () => {
            if (
              !confirm(
                "Are you sure you want to delete this project? This action cannot be undone."
              )
            )
              return;
            const result = await onDeleteProject(   );
            if (!result.ok) {
              setError(result.message || "Failed to delete project");
            }
          }}
        >
          Delete
        </button>
      </div>
    </div>
  );
}
