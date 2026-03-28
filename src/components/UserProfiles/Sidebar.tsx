"use client";

import { UserProfile } from "@/types/user_profiles";
import ProfilePicture from "@/components/UserProfiles/ProfilePicture";
import StyledHorizonalSeperator from "@/components/common/BeyondComponents/StyledHorizontalSeperator";
import BeyondLink from "@/components/common/BeyondComponents/BeyondLink";
import BeyondButton from "../common/BeyondComponents/BeyondButton";
import { useState } from "react";
import { Link } from "lucide-react";
import BeyondButtonLink from "../common/BeyondComponents/BeyondButtonLink";

export default function Sidebar({
  userProfile,
  isCurrentUser,
}: {
  userProfile: UserProfile;
  isCurrentUser: Boolean;
}) {
  const [shareToastContent, setShareToastContent] = useState<
    String | undefined
  >(undefined);

  const handleShareProfile = () => {
    const profileUrl = `${window.location.origin}/user/${userProfile.rcsid}`;
    navigator.clipboard
      .writeText(profileUrl)
      .then(() => {
        setShareToastContent("Profile URL copied to clipboard!");
      })
      .catch((err) => {
        console.error("Failed to copy profile URL: ", err);
        setShareToastContent("Failed to copy profile URL. Please try again.");
      });

    // Clear the toast message after 3 seconds
    setTimeout(() => {
      setShareToastContent(undefined);
    }, 3000);
  };

  return (
    <div className="w-1/4 flex flex-col bg-bg-base-200 p-4 grow shrink basis-auto ">
      {/* Sidebar Information (e.g., contact info, links) can be added here) */}
      <div className="w-full flex justify-center">
        <ProfilePicture />
      </div>
      <div className="flex w-full justify-between items-center">
        <h1 className="text-5xl text-primary font-bold">
          {userProfile.firstName} {userProfile.lastName}
        </h1>
        {isCurrentUser && (
          <BeyondButtonLink
            href={`/user/${userProfile.rcsid}/edit`}
            className="text-base h-8 flex items-center"
          >
            Edit Profile
          </BeyondButtonLink>
        )}
      </div>

      <p className="text-2xl">{userProfile.bio}</p>
      {userProfile.visibility == "PUBLIC" ? (
        <BeyondButton onClick={handleShareProfile} className="text-xl mt-2">
          Share this profile!
        </BeyondButton>
      ) : (
        <p>
          {" "}
          This profile is private. Only you, the owner, can view and share
          it.{" "}
        </p>
      )}
      {shareToastContent && (
        <div className="bg-base-200 text-primary p-2 rounded-md mt-1">
          {shareToastContent}
        </div>
      )}
      <StyledHorizonalSeperator />
      {userProfile.links.length > 0 && (
        <div>
          <h2 className="text-3xl font-bold text-primary">Links</h2>
          <ul>
            {userProfile.links.map((link, index) => (
              <li key={index}>
                <BeyondLink className="text-2xl w-full " href={link.url}>
                  <div>
                    <span className="font-semibold">{link.label}</span>
                    <Link className="inline-block ml-1" size={18} />
                  </div>
                </BeyondLink>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
