"use client";

import { useState } from "react";
import StyledHorizonalSeperator from "../common/BeyondComponents/StyledHorizontalSeperator";
import BeyondButton from "../common/BeyondComponents/BeyondButton";
import BeyondLineEdit from "../common/BeyondComponents/BeyondLineEdit";
import RichTextEditor from "../common/RichTextEditor/component";
import { ResearchExperience } from "@/types/user_profiles";

export default function ResearchExperienceEditor() {
	const [experience, setExperience] = useState<ResearchExperience[]>([]);

	return (
		<div className="w-full flex flex-col items-center">
			<h2 className="text-lg font-semibold mb-1">Research Experience:</h2>
			<div className="w-full max-h-full overflow-y-auto p-2">
				{experience.map((exp, index) => (
					<div key={index} className="flex flex-col">
						<BeyondLineEdit
							placeholder="Research Title"
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
							placeholder="Institution"
							value={exp.institution}
							onChange={(value) => {
								setExperience((prevExp) => {
									prevExp[index].institution = value;
									return [...prevExp];
								});
							}}
							className="w-full p-2 border border-gray-300 rounded mb-2"
						/>
						<BeyondLineEdit
							placeholder="Principal Investigator"
							value={exp.piName}
							onChange={(value) => {
								setExperience((prevExp) => {
									prevExp[index].piName = value;
									return [...prevExp];
								});
							}}
							className="w-full p-2 border border-gray-300 rounded mb-2"
						/>
						<BeyondLineEdit
							placeholder="Research Group"
							value={exp.researchGroup}
							onChange={(value) => {
								setExperience((prevExp) => {
									prevExp[index].researchGroup = value;
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
								placeholder="Start Date"
								value={exp.startDate}
								onChange={(e) => {
									setExperience((prevExp) => {
										prevExp[index].startDate = e.target.value;
										return [...prevExp];
									});
								}}
							/>
						</label>
						<label className="text-sm font-medium mb-1">
							Are you currently working with this research group?
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
									placeholder="End Date"
									value={exp.endDate}
									onChange={(e) => {
										setExperience((prevExp) => {
											prevExp[index].endDate = e.target.value;
											return [...prevExp];
										});
									}}
								/>
							</label>
						)}
						<p className="">Description: </p>
						<RichTextEditor
							onBlur={() => {}}
							onChange={(html) => {
								setExperience((prevExp) => {
									prevExp[index].description = html;
									return [...prevExp];
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
							institution: "",
							description: "",
							ongoing: false,
							startDate: "",
							endDate: "",
							piName: "",
							researchGroup: "",
						},
					])
				}
			>
				Add Research Experience
			</BeyondButton>
		</div>
	);
}
