"use client";

import { signIn } from "next-auth/react";

export default function ProductionLogin() {
  return (
    <div>
      <button
        onClick={async () => {
          await signIn("RPI-SHIBBOLETH");
        }}
      >
        Login with RCSID
      </button>
    </div>
  );
}
