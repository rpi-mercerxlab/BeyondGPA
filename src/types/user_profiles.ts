export type UserProfile = {
        id: string,
        rcsid: string,
        firstName: string,
        lastName: string,
        degrees: Education[],
        bio: string,
        description: string,
        professionalExperience: ProfessionalExperience[],
        researchExperience: ResearchExperience[],
        links: Link[],
        visibility: Visibility,
        profilePictureLink: string,
    }

export type Education = {
            institution: string,
            degreeType: string,
            degreeName: string,
            startDate: string,
            endDate: string
        }

export type ProfessionalExperience = {
            title: string,
            company: string,
            startDate: string,
            ongoing: boolean,
            endDate: string,
            description: string
        }

export type ResearchExperience = {
            title: string,
            researchGroup: string,
            piName: string,
            startDate: string,
            ongoing: boolean,
            endDate: string,
            description: string,
            institution: string
        }

export type Link = {
            label: string,
            url: string
        }

export type Visibility = "PUBLIC" | "PRIVATE";
