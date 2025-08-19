"use client";

import { SessionProvider } from "next-auth/react";
import AdvancedSearch from "./AdvancedSearch";
import SearchBar from "./SearchBar";
import ProjectsList from "./ProjectsList";
import { useEffect, useState } from "react";
import { StudentProjectPreview } from "@/types/student_project";
import { searchProjects } from "@/lib/actions/student_project";

export default function ProjectSearch() {
  const [found_projects, setFoundProjects] = useState<StudentProjectPreview[]>(
    []
  );
  const [paginationToken, setPaginationToken] = useState<string | undefined>(
    undefined
  );

  async function performSearch(params: {
    keywords: string[];
    skills: string[];
    groups: string[];
  }) {
    const { keywords, skills, groups } = params;
    const result = await searchProjects(keywords, skills, groups);
    if (result.ok) {
      setFoundProjects(result.projects);
      setPaginationToken(result.paginationToken);
    } else {
      // Handle error
    }
  }

  async function loadMore() {
    if (!paginationToken) return;
    const result = await searchProjects([], [], [], paginationToken);
    if (result.ok) {
      setFoundProjects((prev) => [...prev, ...result.projects]);
      setPaginationToken(result.paginationToken);
    } else {
      // Handle error
    }
  }

  async function handleSimpleSearch(query: string) {
    const keywords = query.split(" ").filter(Boolean).splice(0, 10);
    performSearch({ keywords, skills: [], groups: [] });
  }

  useEffect(() => {
    performSearch({ keywords: [], skills: [], groups: [] });
  }, []);

  return (
    <div>
      <SessionProvider>
        <SearchBar onSearch={handleSimpleSearch} />
        <AdvancedSearch onSearch={performSearch} />
        <ProjectsList projects={found_projects} loadMore={loadMore} />
      </SessionProvider>
    </div>
  );
}
