import { ProfessionalExperience } from "@/types/user_profiles";

export default function ProfessionalExperienceList({
  experiences,
}: {
  experiences: ProfessionalExperience[];
}) {
  return (
    <div className="space-y-4 w-11/12">
      {experiences.map((experience, index) => (
        <div key={index} className="rounded-lg">
          <h3 className="text-2xl font-semibold">{experience.title}</h3>
          <h4 className="text-xl text-gray-600">{experience.company}</h4>
          <p className="text-lg text-gray-600">
            {experience.startDate} to{" "}
            {!experience.ongoing ? experience.endDate! : "Present"}
          </p>
          <p className="text-md text-gray-500">{experience.description}</p>
        </div>
      ))}
    </div>
  );
}
