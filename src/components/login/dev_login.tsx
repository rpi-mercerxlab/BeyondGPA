"use client";

import { signIn } from "next-auth/react";

export default function DevLogin() {
  return (
    <form
      className="flex flex-col space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        const rcsid = formData.get("rcsid");
        const name = formData.get("name");
        const eduPersonAffiliation = formData.get("eduPersonAffiliation");
        const department = formData.get("department");
        await signIn("mock-login", {
          rcsid,
          name,
          eduPersonAffiliation,
          department,
        });
      }}
    >
      <input type="text" name="rcsid" placeholder="RCSID" />
      <input type="text" name="name" placeholder="Name" />
      <input
        type="text"
        name="eduPersonAffiliation"
        placeholder="Affiliation"
      />
      <input type="text" name="department" placeholder="Department" />
      <button type="submit">Login as Mock User</button>
    </form>
  );
}
