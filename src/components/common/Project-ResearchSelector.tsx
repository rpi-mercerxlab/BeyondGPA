"use client";

import { usePathname } from "next/navigation";

export function ProjectResearchSelector() {
  const pathname = usePathname();

  return (
    <div className="flex items-center border-2 border-primary w-full rounded-lg text-lg h-8">
      <a
        href="/"
        className={`w-1/2 h-full text-center ${
          pathname === "/" ? "bg-primary text-white" : "text-primary"
        }`}
      >
        Student Projects
      </a>
      <a
        href="/research-opportunities"
        className={`w-1/2 h-full text-center ${
          pathname === "/research-opportunities"
            ? "bg-primary text-white"
            : "text-primary"
        }`}
      >
        Research Opportunities
      </a>
    </div>
  );
}
