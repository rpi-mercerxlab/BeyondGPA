import { SkillTag } from "@/types/student_project";
import React, { useState, useMemo, useEffect, useCallback } from "react";

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
      // Optimistic update
      const newSelection = [...selected, tag];
      setSelected(newSelection);
      setQuery("");
      setHighlightIndex(0);

      const success = await onTagSelect(tag);
      if (!success) {
        // Rollback if failed
        setSelected((prev) => prev.filter((t) => t.id !== tag.id));
      }
    },
    [selected, onTagSelect]
  );

  const handleRemove = useCallback(
    async (tag: SkillTag) => {
      // Optimistic update
      const newSelection = selected.filter((t) => t.id !== tag.id);
      setSelected(newSelection);

      const success = await onTagDeselect(tag);
      if (!success) {
        // Rollback if failed
        setSelected((prev) => [...prev, tag]);
      }
    },
    [selected, onTagDeselect]
  );

  const handleCreate = useCallback(async () => {
    if (debouncedQuery.trim()) {
      const success = await onCreateTag(debouncedQuery.trim());
      if (success) {
        handleSelect(success);
        setQuery("");
        setHighlightIndex(0);
      }
    }
  }, [debouncedQuery, onCreateTag]);

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
    <div className="w-full max-w-md mx-auto relative">
      {/* Selected tags */}
      <div className="flex flex-wrap gap-2 mb-2">
        {selected.map((tag) => (
          <span
            key={tag.id}
            className="px-2 py-1 bg-primary text-white rounded-full text-sm flex items-center gap-1"
          >
            {tag.name}
            <button
              type="button"
              className="text-blue-500 hover:text-blue-700"
              onClick={() => handleRemove(tag)}
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
        placeholder="Search or create a tag..."
        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
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
            <div>You have already selected the tag “{debouncedQuery}”.</div>
          )}
        </div>
      )}
    </div>
  );
}
