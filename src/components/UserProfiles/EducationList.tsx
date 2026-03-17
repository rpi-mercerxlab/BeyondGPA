import { Education } from "@/types/user_profiles";

export default function EducationList({ degrees }: { degrees: Education[] }) {
  return (
    <div className="space-y-4 w-11/12">
      {degrees.map((degree, index) => (
        <div key={index} className=" rounded-lg">
          <h3 className="text-2xl font-semibold">
            {degree.degreeType} {degree.degreeName}
          </h3>
          <p className="text-lg text-gray-600">{degree.institution}</p>
          <p className="text-md text-gray-500">
            {degree.startDate} to {degree.endDate}
          </p>
        </div>
      ))}
    </div>
  );
}
