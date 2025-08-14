"use client";

import { Contributor } from "@/types/student_project";
import { use, useState } from "react";
import { ContributorsEdit } from "./ContributiorsEdit";

export default function ContributorsList({
  contributors,
  project_id,
}: {
  contributors: Contributor[];
  project_id: string;
}) {
  const [contributorsList, setContributorsList] =
    useState<Contributor[]>(contributors);
  const [error, setError] = useState<string | null>(null);

  const onUpdate = async (contributor: Contributor) => {
    const res = await fetch(
      `/api/v1/projects/${project_id}/contributors/${contributor.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(contributor),
      }
    );

    if (!res.ok) {
      const error = await res.text();
      setError(error);
      return;
    }

    setContributorsList((prev) =>
      prev.map((c) => (c.id === contributor.id ? contributor : c))
    );
  };

  const onDelete = async (id: string) => {
    const res = await fetch(
      `/api/v1/projects/${project_id}/contributors/${id}`,
      {
        method: "DELETE",
      }
    );

    if (!res.ok) {
      const error = await res.text();
      setError(error);
      return;
    }

    setContributorsList((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div className="flex flex-col">
      <div>{error && <p className="text-red-500">{error}</p>}</div>
      {contributorsList.map((contributor) => (
        <ContributorsEdit
          key={contributor.id}
          contributor={contributor}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
