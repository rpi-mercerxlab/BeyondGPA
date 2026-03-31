"use client";
import StyledHorizonalSeperator from "../common/BeyondComponents/StyledHorizontalSeperator";
import RichTextEditor from "../common/RichTextEditor/component";
import EducationEditor from "./EducationEditor";
import ProfessionalExperienceEditor from "./ProfessionalExperienceEditor";
import ResearchExperienceEditor from "./ResearchExperienceEditor";

export default function ProfileMainItemsEditor() {
  return (
    <div className="w-3/4 p-4">
      <h2 className="text-3xl text-primary font-bold">Edit Your Profile</h2>
      <h4 className="text-xl ">Description:</h4>
      <RichTextEditor onBlur={() => {}} onChange={() => {}} />
      <StyledHorizonalSeperator />
      <div className="flex">
        <ProfessionalExperienceEditor />
        <ResearchExperienceEditor />
        <EducationEditor />
      </div>
    </div>
  );
}
