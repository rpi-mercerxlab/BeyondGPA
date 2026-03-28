import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/authentication/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Header from "@/components/common/header/header";
import StyledHorizonalSeperator from "@/components/common/BeyondComponents/StyledHorizontalSeperator";
import ProfilePicture from "@/components/UserProfiles/ProfilePicture";
import EducationList from "@/components/UserProfiles/EducationList";
import ProfessionalExpereinceList from "@/components/UserProfiles/ProfessionalExperienceList";
import ResearchExperienceList from "@/components/UserProfiles/ResearchExperienceList";
import ProjectList from "@/components/UserProfiles/ProjectList";
import { UserProfile } from "@/types/user_profiles";
import BeyondButtonLink from "@/components/common/BeyondComponents/BeyondButtonLink";
import BeyondLink from "@/components/common/BeyondComponents/BeyondLink";
import Sidebar from "@/components/UserProfiles/Sidebar";
import Footer from "@/components/common/footer";

export default async function Page({
  params,
}: {
  params: Promise<{ user_id: string }>;
}) {
  const { user_id } = await params;

  const session = await getServerSession(authOptions);

  // Get the user_id from the RCSID
  const user = await prisma.user.findUnique({
    where: {
      rcsid: user_id,
    },
    select: {
      id: true,
      email: true,
    },
  });

  if (!user) {
    redirect("/not-found");
  }

  let isCurrentUser = user.id === session?.user.id; // Check if the profile being viewed belongs to the current user

  // Fetch the user profile information from the database
  // const userProfile = await prisma.profile.findUnique({
  //   where: { userId: user_id },
  //   select: {
  //     preferredFirstName: true,
  //     preferredLastName: true,
  //     bio: true,
  //     description: true,
  //     degrees: true,
  //     links: true,
  //     picture: true,
  //     visibility: true,
  //     professionalExperience: true,
  //     researchExperience: true,
  //   },
  // });

  const userProfile: UserProfile = {
    id: user.id,
    rcsid: user_id,
    firstName: "John",
    lastName: "Doe",
    bio: "Computer Science student at XYZ University.",
    description:
      "Passionate about software development and machine learning. Experienced in building web applications and conducting research in AI.",
    degrees: [
      {
        institution: "XYZ University",
        degreeType: "Bachelor's",
        degreeName: "Computer Science",
        startDate: "2020-08-01",
        endDate: "2024-05-31",
      },
    ],
    professionalExperience: [
      {
        title: "Software Engineering Intern",
        company: "Tech Company",
        startDate: "2023-06-01",
        ongoing: false,
        endDate: "2023-08-31",
        description:
          "Worked on developing new features for the company's main product using React and Node.js.",
      },
    ],
    researchExperience: [
      {
        title: "Undergraduate Research Assistant",
        researchGroup: "AI Research Lab",
        piName: "Dr. Smith",
        startDate: "2022-09-01",
        ongoing: true,
        endDate: "",
        description:
          "Conducting research on natural language processing and deep learning techniques.",
        institution: "XYZ University",
      },
    ],
    visibility: "PUBLIC",
    profilePictureLink: "",
    links: [
      {
        label: "LinkedIn",
        url: "https://www.linkedin.com/in/johndoe",
      },
      {
        label: "GitHub",
        url: "https://github.com",
      },
    ],
  };

  // If the profile doesn't exist or is private and the current user is not the owner, redirect to a not found page
  // if (
  //   !userProfile ||
  //   (userProfile.visibility === "PRIVATE" && !isCurrentUser)
  // ) {
  //   redirect("/not-found");
  // }

  // Render the user profile page with the fetched data
  return (
    <div className="w-full flex flex-col items-center justify-start min-h-screen">
      <Header />
      <div className="flex flex-row w-full grow shrink basis-auto">
        <Sidebar userProfile={userProfile} isCurrentUser={isCurrentUser} />
        <div className="w-3/4 p-4">
          <h2 className="text-4xl font-bold text-primary">Who am I?</h2>
          <StyledHorizonalSeperator />
          <p className="text-xl mb-4">{userProfile.description}</p>
          <div className="flex flex-row space-x-4">
            <div className="flex flex-col w-1/3">
              <h2 className="text-3xl font-bold text-primary">Education</h2>
              <StyledHorizonalSeperator />
              <EducationList degrees={userProfile.degrees} />
            </div>
            <div className="flex flex-col w-1/3">
              <h2 className="text-3xl font-bold text-primary">
                Professional Experience
              </h2>
              <StyledHorizonalSeperator />
              <ProfessionalExpereinceList
                experiences={userProfile.professionalExperience}
              />
            </div>
            <div className="flex flex-col w-1/3">
              <h2 className="text-3xl font-bold text-primary">
                Research Experience
              </h2>
              <StyledHorizonalSeperator />
              <ResearchExperienceList
                experiences={userProfile.researchExperience}
              />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-primary">Projects</h2>
          <StyledHorizonalSeperator />
          <ProjectList projects={[]} />{" "}
          {/* Placeholder for projects, can be fetched similarly to profile data */}
          {isCurrentUser && (
            <>
              <h2 className="text-3xl font-bold text-primary" id="drafts">
                Draft Projects (Only Visible to You)
              </h2>
              <StyledHorizonalSeperator />
              <ProjectList projects={[]} />{" "}
              {/* Placeholder for draft projects, can be fetched similarly to profile data */}
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
