import { authOptions } from "@/lib/authentication/auth";
import { getServerSession } from "next-auth";

export default async function Page({
  params,
}: {
  params: Promise<{ user_id: string }>;
}) {
  const { user_id } = await params;

  const session = await getServerSession(authOptions);

  let isCurrentUser = false;
    // Should we display the edit profile button
  if (session && session.user.id == user_id){
    isCurrentUser = true;
  }

  // Get the user profile information


}
