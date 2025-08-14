"use client";

import { Contributor } from "@/types/student_project";
import { useState } from "react";

export function ContributorsEdit({
  contributor,
  onUpdate,
  onDelete,
}: {
  contributor: Contributor;
  onUpdate: (contributor: Contributor) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [contributorState, setContributorState] =
    useState<Contributor>(contributor);

  return (
    <div key={contributor.id}>
      <input
        type="text"
        value={contributor.name}
        onChange={(e) => {
          setContributorState({ ...contributorState, name: e.target.value });
        }}
        onBlur={() => onUpdate(contributorState)}
      />
      <input
        type="email"
        value={contributor.email}
        onChange={(e) => {
          setContributorState({ ...contributorState, email: e.target.value });
        }}
        onBlur={() => onUpdate(contributorState)}
      />
      <select
        value={contributor.role}
        onChange={(e) => {
          setContributorState({
            ...contributorState,
            role: e.target.value as "EDITOR" | "VIEWER",
          });
        }}
        onBlur={() => onUpdate(contributorState)}
      >
        <option value="EDITOR">Editor</option>
        <option value="VIEWER">Viewer</option>
      </select>
      <button onClick={() => onDelete(contributor.id)}>Delete</button>
    </div>
  );
}
