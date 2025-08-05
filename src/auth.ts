import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { Provider } from 'next-auth/providers/index';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from "@/prisma"

const isProduction = process.env.NEXTAUTH_ENV === 'production';

const RPI_SHIBBOLETH_PROVIDER: Provider = {
    id: "rpi",
    name: "RPI Shibboleth",
    type: "oauth",
    clientId: process.env.RPI_SHIBBOLETH_CLIENT_ID,
    clientSecret: process.env.RPI_SHIBBOLETH_CLIENT_SECRET,
    wellKnown: "https://shib.auth.rpi.edu/idp/profile/oidc/configuration",
    authorization: { params: { scope: "openid profile email" } },
    profile(profile) {
        console.log(profile);
        return {
            id: profile.sub,
            name: profile.name,
            email: profile.email,
        };
    },
    idToken: true,
    checks: ["pkce", "state"]
}

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
    }
});

let providers: Provider[] = [];
if (!isProduction) {
    providers = [
        // Add development providers here
        DEVELOPMENT_PROVIDER
    ];
} else {
    providers = [
        // Add production providers here
        RPI_SHIBBOLETH_PROVIDER
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
        async session({ session, user }) {
            session.user = user;
            return session;
        }
    },
    debug: process.env.NEXTAUTH_DEBUG === "true",
});

