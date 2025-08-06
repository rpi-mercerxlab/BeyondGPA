"use client";

import { Session } from "next-auth";
import { signOut } from "next-auth/react";

export default function LogOutButton({ session }: { session: Session }) {
  const greeting =
    new Date().getHours() < 12
      ? "Good Morning"
      : new Date().getHours() < 18
      ? "Good Afternoon"
      : "Good Evening";

  return (
    <>
      <h2>
        {greeting},{" "}
        {`${session.user?.firstName} ${session.user?.lastName || ""}`.trim()}!
      </h2>
      <button
        onClick={() => {
          console.log("signing_out");
          signOut({ callbackUrl: "/" });
        }}
      >
        Log Out
      </button>
    </>
  );
}
