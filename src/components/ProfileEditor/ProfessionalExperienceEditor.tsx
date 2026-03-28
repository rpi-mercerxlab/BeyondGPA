export default function ProfessionalExperienceEditor() {
    return (
        <div className="w-full flex flex-col items-center">
            <label htmlFor="professional_experience" className="text-lg font-medium mb-2">Professional Experience</label>
            <input type="text" id="professional_experience" className="input input-bordered w-full max-w-xs mb-4" placeholder="Enter your professional experience" />
            <button className="btn btn-primary">Save Professional Experience</button>
        </div>
    );
}
