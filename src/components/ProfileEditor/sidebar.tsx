import Header from "@/components/common/header/header";
import StyledHorizonalSeperator from "../common/BeyondComponents/StyledHorizontalSeperator";
import ProfilePictureEditor from "./ProfilePictureEditor";
import NameEditor from "./NameEditor";
import LinksInput from "./LinksEditor";

export default function ProfileEditorSidebar() {
  return (
    <div className="w-1/4 flex flex-col bg-bg-base-200 p-4 max-h-full overflow-y-auto ">
      <ProfilePictureEditor />
      <div>
        <input type="checkbox" className="toggle toggle-primary" checked />
        <span className="ml-2 text-sm">Make my profile visible to other users</span>
      </div>
      <StyledHorizonalSeperator />
      <NameEditor />
      <StyledHorizonalSeperator />
      <LinksInput />
    </div>
  );
}
