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
          <h3 className="text-lg font-semibold">{experience.title}</h3>
          <h4>{experience.company}</h4>
          <p className="text-sm text-gray-600">
            {experience.startDate} -{" "}
            {!experience.ongoing ? experience.endDate! : "Present"}
          </p>
          <p className="text-sm text-gray-500">{experience.description}</p>
        </div>
      ))}
    </div>
  );
}
