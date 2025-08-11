import AboveTheFold from "@/components/common/AboveTheFold";
import { ProjectResearchSelector } from "../common/Project-ResearchSelector";
import ProjectSearch from "./Project-Search/component";

export default function Body() {
  return (
    <main className="flex flex-col items-center justify-start w-full grow shrink basis-auto">
      <AboveTheFold />
      <div className="flex flex-col w-2/3 m-2">
        <ProjectResearchSelector />
        <ProjectSearch />
      </div>
    </main>
  );
}
