"use client";

import BeyondButton from "@/components/common/BeyondComponents/BeyondButton";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import KeywordSelector from "@/components/common/KeywordSelector";
import TagSelector from "@/components/common/SkillTagSelector";
import { Group, SkillTag } from "@/types/student_project";
import CourseGroupSelector from "@/components/common/CourseGroupSelector";

export default function AdvancedSearch({
  onSearch,
}: {
  onSearch: (params: {
    keywords: string[];
    skills: string[];
    groups: string[];
  }) => void;
}) {
  const { data: session } = useSession();
  const [projectCreateError, setProjectCreateError] = useState<string | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [advancedSearchEnabled, setAdvancedSearchEnabled] = useState(false);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<SkillTag[]>([]);

  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [availableSkillTags, setAvailableSkillTags] = useState<SkillTag[]>([]);
  const [availableGroups, setAvailableGroups] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const [skillTagsResp, groupsResp] = await Promise.all([
        fetch(`/api/v1/project/skill-tags`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }),
        fetch(`/api/v1/project/groups`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }),
      ]);

      if (!skillTagsResp.ok) {
        setError(await skillTagsResp.text());
        return;
      }

      if (!groupsResp.ok) {
        setError(await groupsResp.text());
        return;
      }

      const skillTags = await skillTagsResp.json();
      const groups = await groupsResp.json();
      setAvailableSkillTags(skillTags.tags);
      setAvailableGroups(groups.groups.map((group: Group) => group.name));
      setLoaded(true);
    };
    fetchData();
  }, []);

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
      {loaded && (
        <div
          className={`bg-bg-base-100 overflow-y-auto transition-all duration-300 rounded-md shadow-lg ${
            advancedSearchEnabled ? "max-h-96" : "max-h-0"
          }`}
        >
          <h3 className="text-lg font-semibold px-2 text-primary">
            Project Keywords
          </h3>
          <KeywordSelector
            selectedKeywords={selectedKeywords}
            onKeywordSelect={(keyword) => {
              setSelectedKeywords((prev) => [...prev, keyword]);
            }}
            onKeywordDeselect={(keyword) => {
              setSelectedKeywords((prev) => prev.filter((k) => k !== keyword));
            }}
          />
          <h3 className="text-lg font-semibold px-2 text-primary mt-2">
            Skills Used
          </h3>
          <TagSelector
            allowTagCreation={false}
            availableTags={availableSkillTags}
            existingTags={selectedSkills}
            onTagSelect={async (tag) => {
              setSelectedSkills((prev) => [...prev, tag]);
              return { ok: true };
            }}
            onTagDeselect={async (tag) => {
              setSelectedSkills((prev) => prev.filter((t) => t !== tag));
              return { ok: true };
            }}
          />
          <h3 className="text-lg font-semibold px-2 text-primary mt-2 ">
            Course / Group
          </h3>
          <CourseGroupSelector
            availableGroups={availableGroups}
            selectedGroups={selectedGroups}
            onGroupselect={(group) =>
              setSelectedGroups((prev) => [...prev, group])
            }
            onCourseDeselect={(group) =>
              setSelectedGroups((prev) => prev.filter((g) => g !== group))
            }
          />
          <div className="flex w-full p-2 space-x-2 justify-end">
            <BeyondButton
              onClick={() => {
                onSearch({
                  keywords: selectedKeywords,
                  groups: selectedGroups,
                  skills: selectedSkills.map((skill) => skill.name),
                });
              }}
            >
              Search
            </BeyondButton>
        
          </div>
        </div>
      )}
    </div>
  );
}
