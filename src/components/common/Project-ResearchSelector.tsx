"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function ProjectResearchSelector() {
  const pathname = usePathname();

  return (
    <div className="flex items-center border-2 border-primary w-full rounded-lg text-lg h-8">
      <Link
        href="/"
        className={`w-1/2 h-full text-center ${
          pathname === "/" ? "bg-primary text-white" : "text-primary"
        }`}
      >
        Student Projects
      </Link>
      <Link
        href="/research-opportunities"
        className={`w-1/2 h-full text-center ${
          pathname === "/research-opportunities"
            ? "bg-primary text-white"
            : "text-primary"
        }`}
      >
        Research Opportunities
      </Link>
    </div>
  );
}
