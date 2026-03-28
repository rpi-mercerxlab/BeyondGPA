"use client";
import StyledHorizonalSeperator from "../common/BeyondComponents/StyledHorizontalSeperator";
import RichTextEditor from "../common/RichTextEditor/component";
import EducationEditor from "./EducationEditor";
import ProfessionalExperienceEditor from "./ProfessionalExperienceEditor";
import ResearchExperienceEditor from "./ResearchExperienceEditor";

export default function ProfileMainItemsEditor() {
  return (
    <div className="w-3/4 p-4">
      <h2>Edit Your Description:</h2>
      <RichTextEditor onBlur={() => {}} onChange={() => {}} />
      <StyledHorizonalSeperator />
      <h2>Describe Your Background:</h2>
      <div className="flex">
        <ProfessionalExperienceEditor />
        <ResearchExperienceEditor />
        <EducationEditor />
      </div>
    </div>
  );
}
