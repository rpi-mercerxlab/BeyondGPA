export default function LinksInput() {
  return (
    <div className="w-full flex flex-col items-center">
      <label htmlFor="links" className="text-lg font-medium mb-2">
        Links
      </label>
      <input
        type="text"
        id="links"
        className="input input-bordered w-full max-w-xs mb-4"
        placeholder="Enter your links (e.g., LinkedIn, GitHub)"
      />
      <button className="btn btn-primary">Save Links</button>
    </div>
  );
}
