"use client";

export default function SearchBar() {
  return (
    <form
      className="flex items-center space-x-2 w-full shadow-xl rounded-full mt-2"
      onSubmit={(e) => {
        e.preventDefault();
        console.log(
          "TODO: Call to Search API:",
          (document.getElementById("project-search")! as HTMLInputElement).value
        );
      }}
    >
      <div className="w-3"></div>
      <input
        type="text"
        id="project-search"
        className="w-full h-8 ml-2 ring-0 pl-2 focus:ring-2 focus:ring-primary focus:outline-0 rounded-full border-1 border-gray-300 "
      />
      <button type="submit" className=" pr-2 py-1" aria-label="Search">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8 fill-primary"
          viewBox="0 0 40 40"
        >
          <circle
            cx="15"
            cy="15"
            r="8"
            strokeWidth={3}
            className="fill-bg-base-100 stroke-primary"
          />
          <line
            x1="21"
            y1="21"
            x2="32"
            y2="32"
            strokeWidth="4"
            className="stroke-primary"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </form>
  );
}
