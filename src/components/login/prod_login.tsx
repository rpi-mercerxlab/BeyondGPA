"use client";

import { signIn } from "next-auth/react";
import BeyondButton from "../common/BeyondButton";

export default function ProductionLogin() {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 w-full">
      <h1 className="text-5xl xs:text-6xl font-bold font-sans text-primary pt-4 text-center">
        Students & Faculty Login
      </h1>
      <p className="text-center">Use your RCSID to see and create posts on BeyondGPA.</p>
      <BeyondButton
        className="w-3/4 text-3xl xs:text-4xl p-4"
        onClick={async () => {
          await signIn("rpi");
        }}
      >
        Login with RCSID
      </BeyondButton>
    </div>
  );
}
