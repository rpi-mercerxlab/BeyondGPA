export default function ResearchExperienceEditor() {
  return (
    <div className="w-full flex flex-col items-center">
      <label htmlFor="research_experience" className="text-lg font-medium mb-2">
        Research Experience
      </label>
      <input
        type="text"
        id="research_experience"
        className="input input-bordered w-full max-w-xs mb-4"
        placeholder="Enter your research experience"
      />
      <button className="btn btn-primary">Save Research Experience</button>
    </div>
  );
}
