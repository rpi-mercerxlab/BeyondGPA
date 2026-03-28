import Header from "@/components/common/header/header";
import ProfileMainItemsEditor from "@/components/ProfileEditor/main-items";
import Sidebar from "@/components/ProfileEditor/sidebar";
import { UserProfile } from "@/types/user_profiles";

const defaultProfileData: UserProfile = {
  bio: "",
  description: "",
  degrees: [],
  firstName: "",
  lastName: "",
  id: "",
  links: [],
  professionalExperience: [],
  researchExperience: [],
  visibility: "PRIVATE",
  profilePictureLink: "",
  rcsid: "",
};

export default async function Page({
  params,
}: {
  params: Promise<{ user_id: string }>;
}) {
  return (
    <div className="w-full flex flex-col items-center justify-start min-h-screen">
      <Header />
      <div className="flex flex-row w-full grow shrink basis-auto">
        <Sidebar />
        <ProfileMainItemsEditor />
      </div>
    </div>
  );
}
