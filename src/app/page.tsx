import ProjectSearch from "@/components/Main-Page/Project-Search/component";
import AboveTheFold from "@/components/common/AboveTheFold";
import { ProjectResearchSelector } from "@/components/common/Project-ResearchSelector";

export default function Home() {
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
