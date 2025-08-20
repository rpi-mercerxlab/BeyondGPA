"use client";

import { StudentProjectPreview } from "@/types/student_project";
import Image from "next/image";
import { useRef, useEffect } from "react";

export default function ProjectsList({
  projects,
  loadMore,
}: {
  projects: StudentProjectPreview[];
  loadMore: () => void;
}) {
  const loaderRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const ref = loaderRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          loadMore();
        }
      },
      { root: null, rootMargin: "200px", threshold: 0 }
    );

    if (ref) {
      observer.observe(ref);
    }

    return () => {
      if (ref) {
        observer.unobserve(ref);
      }
    };
  }, [loadMore]);

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 mt-2">
      {projects.map((project) => (
        <a
          key={project.project_id}
          className="bg-bg-base-100 rounded-lg shadow-lg w-96 h-[400px]"
          href={`/project/${project.project_id}`}
          title={`Click here to learn more about ${project.title}.`}
        >
          {project.thumbnail && (
            <Image
              src={project.thumbnail.url}
              alt={project.thumbnail.alt}
              className="w-full h-auto max-h-48 rounded-t-lg object-contain"
            />
          )}
          <div className="p-2">
            <h2 className="text-2xl text-primary text-center line-clamp-2">
              {project.title}
            </h2>
            <div className="w-full flex items-center">
              <h3 className="text-sm font-semibold text-primary mr-1">
                Contributors:
              </h3>
              <p className="truncate text-sm">
                {project.contributors.join(", ")}
              </p>
            </div>
            <div className="flex items-center border-b border-primary">
              <h3 className="text-sm font-semibold text-primary mr-1">
                Skills:
              </h3>
              <p className="truncate text-sm">{project.skillTags.join(", ")}</p>
            </div>
            <p
              className="line-clamp-4"
              dangerouslySetInnerHTML={{ __html: project.description }}
            ></p>
          </div>
        </a>
      ))}
      {/* Sentinel div for infinite scroll */}
      <div ref={loaderRef} style={{ height: "1px" }} />
    </div>
  );
}
