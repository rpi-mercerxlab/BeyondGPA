export default function Footer() {
  return (
    <footer className="bg-primary text-white p-4 w-full flex flex-col items-center justify-center">
      <p className="text-sm font-sans">
        &copy; {new Date().getFullYear()} Mercer XLab. All rights reserved.
      </p>
      <p className="text-sm text-center pt-4 sm:pt-0">
        An{" "}
        <a
          href="https://github.com/rpi-mercerxlab/BeyondGPA"
          className="text-white underline pr-1"
        >
          Open Source Project
        </a>
        built by members of the{" "}
        <a href="https://mercerxlab.rpi.edu/" className="text-white underline pr-1">
          Mercer XLab
        </a>
        at Rensselaer Polytechnic Institute.
      </p>
    </footer>
  );
}
