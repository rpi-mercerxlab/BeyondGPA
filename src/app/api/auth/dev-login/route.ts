import { User } from "next-auth";
import { prisma } from "@/prisma";
import { randomUUID } from "crypto";

export async function POST(request: Request) {
  if (process.env.NEXTAUTH_ENV === "production") {
    return new Response(
      "This endpoint is only available in development mode.",
      {
        status: 403,
      }
    );
  }

  const user: User = await request.json();
  const email = user.email;

  console.log(user);

  const resp = await prisma.user.upsert({
    where: { email },
    create: {
      email: user.email,
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      rcsid: user.rcsid || "",
      role: user.role || "student",
      emailVerified: null, // Set to null for mock users
    },
    update: {},
  });

  const session_token = randomUUID();

  await prisma.session.create({
    data: {
      sessionToken: session_token,
      userId: resp.id,
      expires: new Date(
        Date.now() +
          parseInt(process.env.SESSION_LIFETIME_DAYS || "30") *
            24 *
            60 *
            60 *
            1000 // Convert days to milliseconds
      ).toISOString(),
    },
  });

  const cookieString = `next-auth.session-token=${session_token}; Path=/; HttpOnly; SameSite=Lax`;

  const res = new Response(JSON.stringify({ user: resp }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": cookieString,
    },
  });

  return res;
}
