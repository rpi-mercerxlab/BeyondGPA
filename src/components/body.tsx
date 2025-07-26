export default function Body() {
  return (
    <main className="flex flex-col items-center justify-center w-full grow shrink basis-auto">
      <h1 className="text-5xl xs:text-6xl font-bold font-sans text-primary pt-4">BeyondGPA</h1>
      <p className="w-11/12 sm:w-1/3 text-center m-8">
        BeyondGPA connects students with professors for undergraduate research
        projects and internships by showcasing student skills through personal
        and club projects.
      </p>
      <h2 className="text-4xl font-bold font-sans text-primary text-center px-4">
        Site Under Construction - Check Back Soon
      </h2>
      <h3 className="text-2xl font-bold font-sans text-primary text-center m-8">
        For More Information:
      </h3>
      <ul className="list-disc list-inside text-base xs:text-lg font-sans mx-4 ">
        <li>
          <a
            href="https://mercerxlab.notion.site/mercer-x-beyond-gpa"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Project Overview
          </a>{" "}
        </li>
        <li>
          Product Owner: Dr. Shayla Sawyer -{" "}
          <a href="mailto:sawyes@rpi.edu" className="text-primary hover:underline">sawyes@rpi.edu</a>
        </li>
        <li>
          Lead Developer: Cooper Werner -{" "}
          <a href="mailto:wernec6@rpi.edu" className="text-primary hover:underline">wernec6@rpi.edu</a>
        </li>
      </ul>
    </main>
  );
}
