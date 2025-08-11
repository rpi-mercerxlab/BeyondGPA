"use client";

import { SessionProvider } from "next-auth/react";
import AdvancedSearch from "./AdvancedSearch";
import SearchBar from "./SearchBar";
import ProjectsList from "./ProjectsList";

export default function ProjectSearch() {
  return (
    <div>
      <SessionProvider>
        <SearchBar />
        <AdvancedSearch />
        <ProjectsList />
      </SessionProvider>
    </div>
  );
}
