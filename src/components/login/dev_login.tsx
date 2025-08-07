"use client";

import { redirect } from "next/navigation";

export default function DevLogin() {
  return (
    <form
      className="flex flex-col space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        const rcsid = formData.get("rcsid");
        const firstName = formData.get("firstName");
        const lastName = formData.get("lastName");
        const role = formData.get("eduScopedPersonAffiliation");
        const department = formData.get("department");
        await fetch("/api/auth/dev-login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            rcsid,
            firstName,
            lastName,
            role,
            department,
            email: `${rcsid}@rpi.edu`, 
          }),
        }).then((res) => {
          if (!res.ok) {
            console.error("Error during login:", res.statusText);
            return;
          }
          redirect("/"); // Redirect to home page after login
        });
      }}
    >
      <input type="text" name="rcsid" placeholder="RCSID" />
      <input type="text" name="firstName" placeholder="First Name" />
      <input type="text" name="lastName" placeholder="Last Name" />
      <input
        type="text"
        name="eduScopedPersonAffiliation"
        placeholder="Affiliation"
      />
      <button type="submit">Login as Mock User</button>
    </form>
  );
}
