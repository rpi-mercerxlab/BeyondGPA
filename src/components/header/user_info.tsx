import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authentication/auth";
import LogOutButton from "./log_out";
import BeyondButtonLink from "../common/BeyondButtonLink";

export default async function HeaderLoginButton() {
  const session = await getServerSession(authOptions);

  return (
    <div className="flex items-center space-x-4">
      {session ? (
        <LogOutButton session={session} />
      ) : (
        <BeyondButtonLink href="/login"> Log In </BeyondButtonLink>
      )}
    </div>
  );
}
