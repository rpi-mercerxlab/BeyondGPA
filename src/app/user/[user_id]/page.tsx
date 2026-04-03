import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/authentication/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Header from "@/components/common/header/header";
import StyledHorizonalSeperator from "@/components/common/BeyondComponents/StyledHorizontalSeperator";
import EducationList from "@/components/UserProfiles/EducationList";
import ProfessionalExpereinceList from "@/components/UserProfiles/ProfessionalExperienceList";
import ResearchExperienceList from "@/components/UserProfiles/ResearchExperienceList";
import ProjectList from "@/components/UserProfiles/ProjectList";
import { UserProfile } from "@/types/user_profiles";
import Sidebar from "@/components/UserProfiles/Sidebar";
import Footer from "@/components/common/footer";

export default async function Page({ params }: { params: Promise<{ user_id: string }> }) {
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
			firstName: true,
			lastName: true,
		},
	});

	if (!user) {
		redirect("/not-found");
	}

	let isCurrentUser = user.id === session?.user.id; // Check if the profile being viewed belongs to the current user

	// Fetch the user profile information from the database
	let userProfileDB = await prisma.profile.findUnique({
		where: { userId: user.id },
		select: {
			preferredFirstName: true,
			preferredLastName: true,
			bio: true,
			description: true,
			degrees: true,
			links: true,
			picture: true,
			visibility: true,
			professionalExperience: true,
			researchExperience: true,
		},
	});

	// If the profile doesn't exist or is private and the current user is not the owner, redirect to a not found page
	if ((!userProfileDB || userProfileDB.visibility === "PRIVATE") && !isCurrentUser) {
		redirect("/not-found");
	}

  // TODO: Refactor this to be DRY
	// If the user profile does not exist, create a default one (this can be done in a more sophisticated way, but for simplicity, we'll just create an empty profile)
	if (!userProfileDB) {
		await prisma.profile.create({
			data: {
				userId: user.id,
				preferredFirstName: user.firstName || "",
				preferredLastName: user.lastName || "",
				bio: "",
				description: "",
				visibility: "PRIVATE",
        picture: {
          create: {
            imageType: "LINK",
            imageUrl: `https://api.dicebear.com/9.x/identicon/svg?seed=${user.id}`,
          }
        }
			},
		});

		userProfileDB = {
			preferredFirstName: user.firstName || "",
			preferredLastName: user.lastName || "",
			bio: "",
			description: "",
			degrees: [],
			links: [],
			picture: null,
			visibility: "PRIVATE",
			professionalExperience: [],
			researchExperience: [],
		};
	}

	const userProfile: UserProfile = {
		firstName: userProfileDB.preferredFirstName,
		lastName: userProfileDB.preferredLastName,
		bio: userProfileDB.bio,
		description: userProfileDB.description,
		degrees: userProfileDB.degrees.map((degree) => {
			return {
				degreeName: degree.degreeName,
				institution: degree.institution,
				endDate: degree.endDate,
				degreeType: degree.degreeType,
				startDate: degree.startDate,
				id: degree.id,
			};
		}),
		id: user.id,
		links: userProfileDB.links,
		professionalExperience: userProfileDB.professionalExperience.map((experience) => {
			return {
				company: experience.company,
				description: experience.description,
				endDate: experience.endDate,
				ongoing: experience.ongoing,
				startDate: experience.startDate,
				title: experience.position,
				id: experience.id,
			};
		}),
		researchExperience: userProfileDB.researchExperience.map((experience) => {
			return {
				institution: experience.institution,
				description: experience.description,
				endDate: experience.endDate,
				ongoing: experience.ongoing,
				piName: experience.piName,
				projectTitle: experience.projectTitle,
				researchGroup: experience.researchGroup,
				startDate: experience.startDate,
				title: experience.projectTitle,
				id: experience.id,
			};
		}),
		visibility: userProfileDB.visibility,
		rcsid: user_id,
		profilePictureLink: userProfileDB.picture?.imageUrl || "", // Assuming picture is an object with an imageUrl property
	};

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
							<h2 className="text-3xl font-bold text-primary">Professional Experience</h2>
							<StyledHorizonalSeperator />
							<ProfessionalExpereinceList experiences={userProfile.professionalExperience} />
						</div>
						<div className="flex flex-col w-1/3">
							<h2 className="text-3xl font-bold text-primary">Research Experience</h2>
							<StyledHorizonalSeperator />
							<ResearchExperienceList experiences={userProfile.researchExperience} />
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
