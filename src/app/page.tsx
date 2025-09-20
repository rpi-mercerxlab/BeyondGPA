import ProjectSearch from "@/components/Main-Page/Project-Search/component";
import AboveTheFold from "@/components/common/AboveTheFold";
import { ProjectResearchSelector } from "@/components/common/Project-ResearchSelector";
import Footer from "@/components/common/footer";
import Header from "@/components/common/header/header";

export default function Home() {
  return (
    <div className="w-full h-full flex flex-col items-start justify-start min-h-screen">
      <Header />
      <main className="flex flex-col items-center justify-start w-full grow shrink basis-auto">
        <AboveTheFold />
        <div className="flex flex-col w-11/12 mx-2 sm:mx-0 sm:w-2/3 m-2">
          <ProjectResearchSelector />
          <ProjectSearch />
        </div>
      </main>
      <Footer />
    </div>
  );
}
