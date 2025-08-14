import React, { useState, useMemo, useEffect, useCallback } from "react";
import { SkillTag } from "@/types/student_project";

interface TagSelectorProps {
  availableTags: SkillTag[];
  onTagSelect: (tag: SkillTag) => Promise<boolean>;
  onTagDeselect: (tag: SkillTag) => Promise<boolean>;
  onCreateTag: (tagName: string) => Promise<SkillTag>;
}

export default function TagSelector({
  availableTags,
  onTagSelect,
  onTagDeselect,
  onCreateTag,
}: TagSelectorProps) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selected, setSelected] = useState<SkillTag[]>([]);
  const [highlightIndex, setHighlightIndex] = useState(0);

  // Track loading states for each tag
  const [loadingTags, setLoadingTags] = useState<Set<string>>(new Set());

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedQuery(query), 200);
    return () => clearTimeout(handler);
  }, [query]);

  const filteredTags = useMemo(() => {
    const lowerQuery = debouncedQuery.toLowerCase();
    return availableTags.filter(
      (t) =>
        t.name.toLowerCase().includes(lowerQuery) &&
        !selected.some((sel) => sel.id === t.id)
    );
  }, [debouncedQuery, availableTags, selected]);

  const hasNoMatches = debouncedQuery && filteredTags.length === 0;

  const handleSelect = useCallback(
    async (tag: SkillTag) => {
      // Optimistic UI update
      setSelected((prev) => [...prev, tag]);
      setQuery("");
      setHighlightIndex(0);
      setLoadingTags((prev) => new Set(prev).add(tag.id));

      const success = await onTagSelect(tag);

      setLoadingTags((prev) => {
        const copy = new Set(prev);
        copy.delete(tag.id);
        return copy;
      });

      if (!success) {
        // Roll back if failed
        setSelected((prev) => prev.filter((t) => t.id !== tag.id));
      }
    },
    [onTagSelect]
  );

  const handleRemove = useCallback(
    async (tag: SkillTag) => {
      // Optimistic UI update
      setSelected((prev) => prev.filter((t) => t.id !== tag.id));
      setLoadingTags((prev) => new Set(prev).add(tag.id));

      const success = await onTagDeselect(tag);

      setLoadingTags((prev) => {
        const copy = new Set(prev);
        copy.delete(tag.id);
        return copy;
      });

      if (!success) {
        // Roll back if failed
        setSelected((prev) => [...prev, tag]);
      }
    },
    [onTagDeselect]
  );

  const handleCreate = useCallback(async () => {
    if (debouncedQuery.trim()) {
      const createdTag = await onCreateTag(debouncedQuery.trim());
      if (createdTag) {
        handleSelect(createdTag);
        setQuery("");
        setHighlightIndex(0);
      }
    }
  }, [debouncedQuery, onCreateTag, handleSelect]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!debouncedQuery && e.key !== "Escape") return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((prev) =>
        Math.min(prev + 1, hasNoMatches ? 0 : filteredTags.length - 1)
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (hasNoMatches) {
        handleCreate();
      } else {
        handleSelect(filteredTags[highlightIndex]);
      }
    } else if (e.key === "Escape") {
      setQuery("");
      setHighlightIndex(0);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto relative bg-bg-base p-2 rounded-md">
      {/* Selected tags */}
      <div className="flex flex-wrap gap-2 mb-2">
        {selected.map((tag) => (
          <span
            key={tag.id}
            className="px-2 py-1 bg-primary text-white rounded-sm text-sm flex items-center gap-1"
          >
            {tag.name}
            {loadingTags.has(tag.id) ? (
              <svg
                className="animate-spin h-3 w-3 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                ></path>
              </svg>
            ) : (
              <button
                type="button"
                className="text-white hover:text-gray-300"
                onClick={() => handleRemove(tag)}
              >
                ✕
              </button>
            )}
          </span>
        ))}
      </div>

      {/* Search input */}
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search or create a tag..."
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        onKeyDown={handleKeyDown}
      />

      {/* Dropdown */}
      {debouncedQuery && (
        <div className="absolute w-full mt-1 border rounded-md bg-white shadow-md max-h-40 overflow-y-auto z-10">
          {filteredTags.length > 0 ? (
            filteredTags.map((tag, idx) => (
              <div
                key={tag.id}
                className={`px-3 py-2 cursor-pointer ${
                  idx === highlightIndex ? "bg-blue-100" : "hover:bg-blue-50"
                }`}
                onMouseEnter={() => setHighlightIndex(idx)}
                onClick={() => handleSelect(tag)}
              >
                {tag.name}
              </div>
            ))
          ) : !selected.some(
              (t) => t.name.toLowerCase() === debouncedQuery.toLowerCase()
            ) ? (
            <div
              className={`px-3 py-2 cursor-pointer ${
                highlightIndex === 0 ? "bg-blue-100" : "hover:bg-blue-50"
              } text-blue-600`}
              onMouseEnter={() => setHighlightIndex(0)}
              onClick={handleCreate}
            >
              Create “{debouncedQuery}”
            </div>
          ) : (
            <div className="px-3 py-2 text-gray-500">
              You have already selected the tag “{debouncedQuery}”.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
