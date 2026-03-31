"use client";

import { useState } from "react";
import StyledHorizonalSeperator from "../common/BeyondComponents/StyledHorizontalSeperator";
import BeyondLineEdit from "../common/BeyondComponents/BeyondLineEdit";
import { Education } from "@/types/user_profiles";
import BeyondButton from "../common/BeyondComponents/BeyondButton";

export default function EducationEditor() {
	const [education, setEducation] = useState<Education[]>([]);

	return (
		<div className="w-full flex flex-col items-center">
			<h2 className="text-lg font-semibold mb-2">Education:</h2>
			<div className="w-full max-h-full overflow-y-auto p-2">
				{education.map((edu, index) => (
					<div key={index} className="flex flex-col mb-4">
						<BeyondLineEdit
							placeholder="Degree"
							value={edu.degreeName}
							onChange={(value) => {
								setEducation((prevEdu) => {
									prevEdu[index].degreeName = value;
									return [...prevEdu];
								});
							}}
							className="w-full p-2 border border-gray-300 rounded mb-2"
						/>
						<select
							className="w-full p-2 border border-gray-300 rounded mb-2 bg-bg-base-200 text-black"
							value={edu.degreeType}
							onChange={(e) => {
								const value = e.target.value;
								setEducation((prevEdu) => {
									prevEdu[index].degreeType = value;
									return [...prevEdu];
								});
							}}
						>
							<option value="">Select Degree Type</option>
							<option value="B.S.">Bachelors of Science (B.S.)</option>
							<option value="M.S.">Masters of Science (M.S.)</option>
							<option value="M.Eng.">Masters of Engineering (M.Eng.)</option>
							<option value="Ph.D.">Doctor of Philosophy (Ph.D.)</option>
							<option value="Other">Other</option>
						</select>
						<BeyondLineEdit
							placeholder="Institution"
							value={edu.institution}
							onChange={(value) => {
								setEducation((prevEdu) => {
									prevEdu[index].institution = value;
									return [...prevEdu];
								});
							}}
							className="w-full p-2 border border-gray-300 rounded mb-2"
						/>
                        <label className="text-sm font-medium mb-1">
                            Start Date:
                            <input
                                className="w-full bg-bg-base-200 border border-gray-300 rounded-md p-1 focus:outline-none focus:ring-2 focus:ring-primary text-sm  text-black mb-2 "
                                type="date"
                                value={edu.startDate}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setEducation((prevEdu) => {
                                        prevEdu[index].startDate = value;
                                        return [...prevEdu];
                                    });
                                }}
                            />
                        </label>
                        <label className="text-sm font-medium mb-1">
                            Graduation Date:
                            <input
                                className="w-full bg-bg-base-200 border border-gray-300 rounded-md p-1 focus:outline-none focus:ring-2 focus:ring-primary text-sm  text-black mb-2 "
                                type="date"
                                value={edu.endDate}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setEducation((prevEdu) => {
                                        prevEdu[index].endDate = value;
                                        return [...prevEdu];
                                    });
                                }}
                            />
                        </label>
						<StyledHorizonalSeperator />
					</div>
				))}
			</div>
			<BeyondButton
				onClick={() => {
					setEducation((prev) => {
						return [
							...prev,
							{ degreeName: "", degreeType: "", institution: "", startDate: "", endDate: "" },
						];
					});
				}}
			>
				Add Education
			</BeyondButton>
		</div>
	);
}
