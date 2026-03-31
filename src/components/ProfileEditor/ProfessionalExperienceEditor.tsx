"use client";

import StyledHorizonalSeperator from "../common/BeyondComponents/StyledHorizontalSeperator";
import { useState } from "react";
import BeyondLineEdit from "../common/BeyondComponents/BeyondLineEdit";
import BeyondButton from "../common/BeyondComponents/BeyondButton";
import { ProfessionalExperience } from "@/types/user_profiles";
import RichTextEditor from "../common/RichTextEditor/component";

export default function ProfessionalExperienceEditor() {
	const [experience, setExperience] = useState<ProfessionalExperience[]>([]);

	return (
		<div className="w-full flex flex-col items-center">
			<h2 className="text-lg font-semibold mb-2">Professional Experience:</h2>
			<div className="w-full max-h-full overflow-y-auto p-2">
				{experience.map((exp, index) => (
					<div key={index} className="flex flex-col">
						<BeyondLineEdit
							placeholder="Job Title"
							value={exp.title}
							onChange={(value) => {
								setExperience((prevExp) => {
									prevExp[index].title = value;
									return [...prevExp];
								});
							}}
							className="w-full p-2 border border-gray-300 rounded mb-2"
						/>
						<BeyondLineEdit
							placeholder="Company"
							value={exp.company}
							onChange={(value) => {
								setExperience((prevExp) => {
									prevExp[index].company = value;
									return [...prevExp];
								});
							}}
							className="w-full p-2 border border-gray-300 rounded mb-2"
						/>
						<label className="text-sm font-medium mb-1">
							Start Date:
							<input
								className="w-full bg-bg-base-200 border border-gray-300 rounded-md p-1 focus:outline-none focus:ring-2 focus:ring-primary text-sm  text-black mb-2 "
								type="date"
							/>
						</label>
						<label className="text-sm font-medium mb-1">
							Are you currently working here?
							<input
								type="checkbox"
								className="ml-2"
								checked={exp.ongoing}
								onChange={(e) => {
									setExperience((prevExp) => {
										prevExp[index].ongoing = e.target.checked;
										return [...prevExp];
									});
								}}
							/>
						</label>
						{!exp.ongoing && (
							<label className="text-sm font-medium mb-1">
								End Date:
								<input
									className="w-full bg-bg-base-200 border border-gray-300 rounded-md p-1 focus:outline-none focus:ring-2 focus:ring-primary text-sm  text-black mb-2 "
									type="date"
								/>
							</label>
						)}
                        <p className="">Description: </p>
						<RichTextEditor
							onBlur={() => {}}
							onChange={(html) => {
								setExperience((prevExperience) => {
									prevExperience[index].description = html;
									return [...prevExperience];
								});
							}}
						/>
						<div className="my-1" />
						<BeyondButton
							onClick={() => {
								const newExp = experience.filter((_, i) => i !== index);
								setExperience(newExp);
							}}
						>
							Delete
						</BeyondButton>
                        <StyledHorizonalSeperator />
					</div>

				))}
			</div>
			<BeyondButton
				onClick={() =>
					setExperience([
						...experience,
						{
							title: "",
							company: "",
							description: "",
							startDate: "",
							endDate: "",
							ongoing: false,
						},
					])
				}
			>
				Add Experience
			</BeyondButton>
		
		</div>
	);
}
