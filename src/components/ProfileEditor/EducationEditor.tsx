export default function EducationEditor() {
    return (
        <div className="w-full flex flex-col items-center">
            <label htmlFor="education" className="text-lg font-medium mb-2">Education</label>
            <input type="text" id="education" className="input input-bordered w-full max-w-xs mb-4" placeholder="Enter your education background" />
            <button className="btn btn-primary">Save Education</button>
        </div>
    );
}