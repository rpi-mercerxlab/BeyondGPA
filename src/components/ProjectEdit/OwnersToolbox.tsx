"use client";
import { StudentProject } from "@/types/student_project";
import { useEffect, useState } from "react";

export default function OwnersToolbox({
  project,
  setVisibility,
  transferOwnership,
}: {
  project: StudentProject;
  setVisibility: (
    visibility: string
  ) => Promise<{ ok: boolean; message?: string }>;
  transferOwnership: (
    email: string
  ) => Promise<{ ok: boolean; message?: string }>;
}) {
  const [error, setError] = useState<string | null>(null);
  const [availableGroups, setAvailableGroups] = useState<string[]>([]);

  useEffect(() => {
    // Fetch available groups for the project
    const fetchGroups = async () => {
      const response = await fetch(`/api/projects/groups`);
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
      <div>Set Project Group</div>
    </div>
  );
}
