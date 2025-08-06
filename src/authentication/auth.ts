import NextAuth from "next-auth";
import { Provider } from "next-auth/providers/index";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/prisma";
import { RPI_SHIBBOLETH_PROVIDER, DEVELOPMENT_PROVIDER } from "@/authentication/providers";


const isProduction = process.env.NEXTAUTH_ENV === "production";

let providers: Provider[] = [];
if (!isProduction) {
  providers = [DEVELOPMENT_PROVIDER];
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
