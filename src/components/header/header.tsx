import Image from "next/image";
import HeaderLoginButton from "./user_info";

export default function Header() {
  return (
    <header className="bg-primary text-white p-2 w-full flex items-center justify-start">
      <Image
        src="/Mercer-X-Logo.png"
        alt="Mercer XLab Logo"
        width={25}
        height={25}
        className="inline-block mr-2"
      />
      <h1 className="text-xl xs:text-2xl font-sans">
        <span className="font-bold">Mercer XLab</span>
        <span className="p-2">-</span>
        <span className="font-light italic">BeyondGPA</span>
      </h1>
      <div className="flex grow shrink basis-auto"></div>
      <HeaderLoginButton />
    </header>
  );
}
