import { getServerSession } from "next-auth";
import { authOptions } from "@/authentication/auth";
import LogOutButton from "./log_out";

export default async function HeaderLoginButton() {
  const session = await getServerSession(authOptions);

  return (
    <div className="flex items-center space-x-4">
      {session ? (
        <LogOutButton session={session} />
      ) : (
        <a href="/login"> Log In </a>
      )}
    </div>
  );
}
