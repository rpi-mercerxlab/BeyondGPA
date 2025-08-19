"use client";

import { SessionProvider } from "next-auth/react";
import AdvancedSearch from "./AdvancedSearch";
import SearchBar from "./SearchBar";
import ProjectsList from "./ProjectsList";
import { useEffect, useState } from "react";
import { StudentProjectPreview } from "@/types/student_project";
import { searchProjects } from "@/lib/actions/student_project";
import Modal from "@/components/common/ModalBox";

export default function ProjectSearch() {
  const [found_projects, setFoundProjects] = useState<StudentProjectPreview[]>(
    []
  );
  const [paginationToken, setPaginationToken] = useState<string | undefined>(
    undefined
  );
  const [searchQuery, setSearchQuery] = useState<{
    keywords: string[];
    skills: string[];
    groups: string[];
  }>({
    keywords: [],
    skills: [],
    groups: [],
  });
  const [demoWarningVisible, setDemoWarningVisible] = useState(true);

  async function performSearch(params: {
    keywords: string[];
    skills: string[];
    groups: string[];
  }) {
    const { keywords, skills, groups } = params;
    setSearchQuery({ keywords, skills, groups });
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
    const result = await searchProjects(
      searchQuery.keywords,
      searchQuery.skills,
      searchQuery.groups,
      paginationToken
    );
    if (result.ok) {
      setFoundProjects((prev) => [...prev, ...result.projects]);
      setPaginationToken(result.paginationToken);
    } else {
      // Handle error
    }
  }

  async function handleSimpleSearch(query: string) {
    const keywords = query.split(" ").filter(Boolean).splice(0, 10);
    setSearchQuery({ keywords, skills: [], groups: [] });
    performSearch({ keywords, skills: [], groups: [] });
  }

  useEffect(() => {
    performSearch({ keywords: [], skills: [], groups: [] });
  }, []);

  return (
    <div>
      <SessionProvider>
        <Modal
          isOpen={demoWarningVisible}
          onClose={() => setDemoWarningVisible(false)}
        >
          <div className="p-4">
            <h2 className="text-xl font-semibold text-primary">
              Welcome to the BeyondGPA Demo!
            </h2>
            <p className="mt-2">
              BeyondGPA is still in its early stages of development. We will do
              our best to maintain compatibility, but that may not always be
              possible. Do not store important information here. We welcome any
              and all feedback, suggestions, or bug reports.
              <br />
              <a
                href="https://github.com/rpi-mercerxlab/BeyondGPA/issues/new"
                className="text-primary hover:underline"
              >
                Provide Feedback Here.
              </a>
            </p>
          </div>
        </Modal>
        <SearchBar onSearch={handleSimpleSearch} />
        <AdvancedSearch onSearch={performSearch} />
        <ProjectsList projects={found_projects} loadMore={loadMore} />
      </SessionProvider>
    </div>
  );
}
