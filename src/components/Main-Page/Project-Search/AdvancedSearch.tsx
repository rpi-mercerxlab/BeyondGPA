"use client";

import BeyondButton from "@/components/common/BeyondComponents/BeyondButton";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdvancedSearch() {
  const { data: session } = useSession();
  const [projectCreateError, setProjectCreateError] = useState<string | null>(
    null
  );
  const [advancedSearchEnabled, setAdvancedSearchEnabled] = useState(false);
  const router = useRouter();

  const createNewProject = async () => {
    const resp = await fetch("/api/v1/project", {
      method: "POST",
    });
    if (!resp.ok) {
      if (resp.status === 401) {
        router.push("/login");
        return;
      }
      if (resp.status === 403) {
        setProjectCreateError("You do not have permission to create a project");
        return;
      }

      if (resp.status === 500) {
        setProjectCreateError(
          "An unexpected error occurred, if this happens again, please open an issue on GitHub."
        );
        return;
      }
    }

    const { project_id } = await resp.json();
    router.push(`/project/${project_id}/edit`);
  };

  return (
    <div className="flex flex-col ">
      <div className="flex items-center justify-between my-2">
        <button
          onClick={() => setAdvancedSearchEnabled(!advancedSearchEnabled)}
          className="flex items-center text-primary"
        >
          Advanced Search
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-4 w-4 fill-current ml-2 transition-transform ${
              !advancedSearchEnabled ? "rotate-180" : ""
            }`}
            viewBox="0 0 24 24"
          >
            <line
              x1="6"
              y1="9"
              x2="12"
              y2="15"
              strokeWidth="2"
              className="stroke-current"
              strokeLinecap="round"
            />
            <line
              x1="18"
              y1="9"
              x2="12"
              y2="15"
              strokeWidth="2"
              className="stroke-current"
              strokeLinecap="round"
            />
          </svg>
        </button>
        {session && session.user.role === "student" && (
          <BeyondButton
            onClick={() => createNewProject()}
            className="text-base h-8 flex items-center"
          >
            Create New Project
          </BeyondButton>
        )}
      </div>
      {projectCreateError && (
        <div className="text-red-500 text-sm my-0.5">
          Error Creating Project: {projectCreateError}
        </div>
      )}
      <form
        className={`bg-pink-500 overflow-y-hidden transition-all duration-300 ${
          advancedSearchEnabled ? "max-h-screen" : "max-h-0"
        }`}
      >
        <h1> TODO: Advanced Search </h1>
      </form>
      <hr className="border-t border-gray-300 my-2" />
    </div>
  );
}
