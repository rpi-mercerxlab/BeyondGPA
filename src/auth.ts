import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { Provider } from "next-auth/providers/index";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/prisma";

const isProduction = process.env.NEXTAUTH_ENV === "production";

const RPI_SHIBBOLETH_PROVIDER: Provider = {
  id: "rpi",
  name: "RPI Shibboleth",
  type: "oauth",
  clientId: process.env.RPI_SHIBBOLETH_CLIENT_ID,
  clientSecret: process.env.RPI_SHIBBOLETH_CLIENT_SECRET,
  authorization: {
    url: "https://shib.auth.rpi.edu/idp/profile/oidc/authorize",
    params: {
      scope: "openid profile email",
      claims: {
        id_token: {
          sub: { essential: true },
          email: { essential: true },
          name: { essential: true },
        },
      },
    },
  },
  token: "https://shib.auth.rpi.edu/idp/profile/oidc/token",
  userinfo: "https://shib.auth.rpi.edu/idp/profile/oidc/userinfo",
  issuer: "https://shib.auth.rpi.edu",
  jwks_endpoint: "https://shib.auth.rpi.edu/idp/profile/oidc/keyset",

  async profile(profile, tokens) {
    console.log("User Profile: ", profile);
    if (tokens?.access_token) {
      try {
        const res = await fetch(
          "https://shib.auth.rpi.edu/idp/profile/oidc/userinfo",
          {
            headers: {
              Authorization: `Bearer ${tokens.access_token}`,
            },
          }
        );

        if (!res.ok) throw new Error("Failed to fetch userinfo");

        const userinfo = await res.json();
        console.log("Userinfo fetched: ", userinfo);

        const user = {
          email: userinfo.email || profile.email,
          role: userinfo.eduPersonScopedAffiliation || "student",
          rcsid: userinfo.preferred_username || profile.sub.split("@")[0],
          id: profile.sub, // Use the sub from the profile as the unique identifier
          firstName: userinfo.given_name || "",
          lastName: userinfo.family_name || "",
          emailVerified: new Date().toISOString(), // Assuming email is verified since they authed with RPI
        };

        console.log("Final user object: ", user);
        return user;
      } catch (err) {
        console.error("Failed to fetch RPI userinfo:", err);
      }
    }

    return {
      id: profile.sub,
      name: profile.name,
      email: profile.email,
      role: "student", // Default value if userinfo fetch fails
    };
  },
};

const DEVELOPMENT_PROVIDER: Provider = Credentials({
  name: "Mock Login",
  credentials: {
    rcsid: { label: "RCSID", type: "text" },
    name: { label: "Name", type: "text" },
    eduPersonAffiliation: { label: "Affiliation", type: "text" },
    department: { label: "Department", type: "text" },
  },
  async authorize(credentials) {
    if (!credentials) {
      return null;
    }

    const user = {
      id: credentials.rcsid, // Use RCS ID as the unique identifier
      name: credentials.name,
      email: `${credentials.rcsid}@rpi.edu`,
      eduPersonAffiliation: credentials.eduPersonAffiliation || "student",
      department: credentials.department || "General Studies",
    };
    return user;
  },
});

let providers: Provider[] = [];
if (!isProduction) {
  providers = [
    // Add development providers here
    DEVELOPMENT_PROVIDER,
  ];
} else {
  providers = [
    // Add production providers here
    RPI_SHIBBOLETH_PROVIDER,
  ];
}

export const handlers = NextAuth({
  providers,
  secret: process.env.NEXTAUTH_SECRET,
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "database",
    maxAge: parseInt(process.env.SESSION_LIFETIME_DAYS || "30") * 24 * 60 * 60, // Convert days to seconds
  },
  callbacks: {
    async session({ session, token, user }) {
      console.log("Session Callback: ", session, token, user);
      session.user = user;
      return session;
    },
  },
  debug: process.env.NEXTAUTH_DEBUG === "true",
});
