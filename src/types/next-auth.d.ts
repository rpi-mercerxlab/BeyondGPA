// types/next-auth.d.ts
import NextAuth from "next-auth";

declare module "next-auth" {
  export interface Session {
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      role: string;
      rcsid?: string | null;
    };
  }

  interface User {
    id: string;
    rcsid?: string | null;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    emailVerified?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    rcsid?: string | null;
  }
}
