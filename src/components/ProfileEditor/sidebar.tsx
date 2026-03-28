import Header from "@/components/common/header/header";
import StyledHorizonalSeperator from "../common/BeyondComponents/StyledHorizontalSeperator";
import ProfilePictureEditor from "./ProfilePictureEditor";
import NameEditor from "./NameEditor";
import LinksInput from "./LinksEditor";

export default function ProfileEditorSidebar() {
  return (
    <div className="w-1/4 flex flex-col bg-bg-base-200 p-4 grow shrink basis-auto ">
      <ProfilePictureEditor />
      <StyledHorizonalSeperator />
      <NameEditor />
      <StyledHorizonalSeperator />
      <LinksInput />
    </div>
  );
}
