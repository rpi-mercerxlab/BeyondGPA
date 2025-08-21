import React, { useState, useMemo, useEffect, useCallback } from "react";

interface GroupselectorProps {
  availableGroups: string[];
  selectedGroups: string[];
  onGroupselect: (course: string) => void;
  onCourseDeselect: (course: string) => void;
}

export default function CourseGroupSelector({
  availableGroups, // All Groups available
  selectedGroups, // Groups already assigned to this project
  onGroupselect,
  onCourseDeselect,
}: GroupselectorProps) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [highlightIndex, setHighlightIndex] = useState(0);

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedQuery(query), 200);
    return () => clearTimeout(handler);
  }, [query]);

  const filteredGroups = useMemo(() => {
    const lowerQuery = debouncedQuery.toLowerCase();
    return availableGroups.filter((group) =>
      group.toLowerCase().includes(lowerQuery)
    );
  }, [debouncedQuery, availableGroups]);

  const hasNoMatches = debouncedQuery && filteredGroups.length === 0;

  const handleSelect = useCallback(
    (group: string) => {
      setQuery("");
      setHighlightIndex(0);
      onGroupselect(group);
    },
    [onGroupselect]
  );

  const handleRemove = useCallback(
    (group: string) => {
      onCourseDeselect(group);
    },
    [onCourseDeselect]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!debouncedQuery && e.key !== "Escape") return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((prev) =>
        Math.min(prev + 1, hasNoMatches ? 0 : filteredGroups.length - 1)
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();

      handleSelect(filteredGroups[highlightIndex]);
    } else if (e.key === "Escape") {
      setQuery("");
      setHighlightIndex(0);
    }
  };

  return (
    <div className="w-full mx-auto relative bg-bg-base-100 px-2 rounded-md h-fit">
      {/* Selected tags */}
      <div className="flex flex-wrap gap-2 mb-2 mt-1">
        {selectedGroups.map((group) => (
          <span
            key={group}
            className="px-2 py-1 bg-primary text-white rounded-sm text-sm flex items-center gap-1"
          >
            {group}

            <button
              type="button"
              className="text-white hover:text-gray-300"
              onClick={() => handleRemove(group)}
            >
              ✕
            </button>
          </span>
        ))}
      </div>

      {/* Search input */}
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search Groups"
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        onKeyDown={handleKeyDown}
      />

      {/* Dropdown */}
      {debouncedQuery && (
        <div className="mt-1 border rounded-md bg-white shadow-md max-h-40 overflow-y-auto z-10">
          {filteredGroups.length > 0 ? (
            filteredGroups.map((group, idx) => (
              <div
                key={group}
                className={`px-3 py-2 cursor-pointer ${
                  idx === highlightIndex ? "bg-red-100" : "hover:bg-red-50"
                }`}
                onMouseEnter={() => setHighlightIndex(idx)}
                onClick={() => handleSelect(group)}
              >
                {group}
              </div>
            ))
          ) : !selectedGroups.some(
              (g) => g.toLowerCase() === debouncedQuery.toLowerCase()
            ) ? (
            <div className="px-3 py-2 text-gray-500">
              Group &ldquo;{debouncedQuery}&rdquo; does not exist.
            </div>
          ) : (
            <div className="px-3 py-2 text-gray-500">
              You have already selected the group &ldquo;{debouncedQuery}
              &rdquo;.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
