import NextAuth, { NextAuthOptions } from "next-auth";
import { Provider } from "next-auth/providers/index";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import {
  RPI_SHIBBOLETH_PROVIDER,
  DEVELOPMENT_PROVIDER,
} from "@/lib/authentication/providers";

const isProduction = process.env.NEXTAUTH_ENV === "production";

let providers: Provider[] = [];
if (!isProduction) {
  providers = [DEVELOPMENT_PROVIDER()];
} else {
  providers = [
    RPI_SHIBBOLETH_PROVIDER({
      clientId: process.env.RPI_SHIBBOLETH_CLIENT_ID || "",
      clientSecret: process.env.RPI_SHIBBOLETH_CLIENT_SECRET || "",
      authorizationUrl: "https://shib.auth.rpi.edu/idp/profile/oidc/authorize",
      tokenUrl: "https://shib.auth.rpi.edu/idp/profile/oidc/token",
      userinfoUrl: "https://shib.auth.rpi.edu/idp/profile/oidc/userinfo",
      issuer: "https://shib.auth.rpi.edu",
      jwksEndpoint: "https://shib.auth.rpi.edu/idp/profile/oidc/keyset",
    }),
  ];
}

export const authOptions: NextAuthOptions = {
  providers,
  secret: process.env.NEXTAUTH_SECRET,
  // @ts-ignore
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "database",
    maxAge: parseInt(process.env.SESSION_LIFETIME_DAYS || "30") * 24 * 60 * 60, // Convert days to seconds
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "rpi") {
        // For RPI login, we can skip additional checks
        return true;
      }

      // For the mock, we look to see if the user is already in the database
      const existingUser = await prisma.user.findUnique({
        where: { email: user.email },
      });

      if (!existingUser) {
        // If the user doesn't exist, create a new user record
        await prisma.user.create({
          data: {
            email: user.email,
            firstName: user.firstName || "",
            lastName: user.lastName || "",
            rcsid: user.rcsid || "",
            role: user.role || "student",
            emailVerified: null,
          },
        });
      }

      return true;
    },

    async session({ session, user }) {
      session.user = user;
      return session;
    },
  },
  debug: process.env.NEXTAUTH_DEBUG === "true",
};

export const handlers = NextAuth(authOptions);
