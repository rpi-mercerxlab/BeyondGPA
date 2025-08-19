import React, { useState, useMemo, useEffect, useCallback } from "react";

interface KeywordSelectorProps {
  selectedKeywords: string[];
  onKeywordSelect: (keyword: string) => void;
  onKeywordDeselect: (keyword: string) => void;
}

export default function KeywordSelector({
  selectedKeywords,
  onKeywordSelect,
  onKeywordDeselect,
}: KeywordSelectorProps) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedQuery(query), 50);
    return () => clearTimeout(handler);
  }, [query]);

  const handleSelect = useCallback(
    async (keyword: string) => {
      setQuery("");

      onKeywordSelect(keyword);
    },
    [onKeywordSelect]
  );

  const handleRemove = useCallback(
    async (keyword: string) => {
      onKeywordDeselect(keyword);
    },
    [onKeywordDeselect]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!debouncedQuery && e.key !== "Escape") return;
    if (e.key === "Enter") {
      e.preventDefault();
      if (debouncedQuery.trim()) {
        handleSelect(debouncedQuery.trim());
      }
    } else if (e.key === "Escape") {
      setQuery("");
    }
  };

  return (
    <div className="w-full mx-auto relative bg-bg-base-100 px-2 rounded-md h-fit">
      {/* Selected tags */}
      <div className="flex flex-wrap gap-2 mb-2">
        {selectedKeywords.map((keyword) => (
          <span
            key={keyword}
            className="px-2 py-1 bg-primary text-white rounded-sm text-sm flex items-center gap-1"
          >
            {keyword}
            <button
              type="button"
              className="text-white hover:text-gray-300"
              onClick={() => handleRemove(keyword)}
            >
              &times;
            </button>
          </span>
        ))}
      </div>

      {/* Search input */}
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Add Keywords"
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        onKeyDown={handleKeyDown}
      />

      {/* Dropdown */}
      {debouncedQuery && (
        <div className=" mt-1 border rounded-md bg-white shadow-md max-h-40 overflow-y-auto z-10 p-2">
          {selectedKeywords.some(
            (keyword) => keyword.toLowerCase() === debouncedQuery.toLowerCase()
          ) ? (
            <div className="px-3 py-2 text-gray-500">
              You have already selected the keyword “{debouncedQuery}”.
            </div>
          ) : (
            <div
              className={`px-3 py-2 cursor-pointer bg-red-100 hover:bg-red-50 text-red-600`}
              onClick={() => handleSelect(debouncedQuery)}
            >
              Add Keyword “{debouncedQuery}”
            </div>
          )}
        </div>
      )}
    </div>
  );
}
