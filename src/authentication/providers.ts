import Credentials from "next-auth/providers/credentials";
import { Provider } from "next-auth/providers/index";

export function RPI_SHIBBOLETH_PROVIDER(config: RPI_PROVIDER_CONFIG): Provider {
  const RPI_SHIBBOLETH_PROVIDER: Provider = {
    id: "rpi",
    name: "RPI Shibboleth",
    type: "oauth",
    clientId: config.clientId,
    clientSecret: config.clientSecret,
    authorization: {
      url: config.authorizationUrl,
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
    token: config.tokenUrl,
    userinfo: config.userinfoUrl,
    issuer: config.issuer,
    jwks_endpoint: config.jwksEndpoint,

    async profile(profile, tokens) {
      if (tokens?.access_token) {
        try {
          const profile = await fetchUserProfile(
            tokens.access_token,
            config.userinfoUrl
          );

          const user = {
            email: profile.email,
            role: profile.eduPersonScopedAffiliation || "student",
            rcsid: profile.preferred_username || profile.sub.split("@")[0],
            id: profile.sub, // Use the sub from the profile as the unique identifier
            firstName: profile.given_name || "",
            lastName: profile.family_name || "",
            emailVerified: new Date().toISOString(), // Assuming email is verified since they authed with RPI
          };

          return user;
        } catch (err) {
          console.error("Failed to fetch RPI userinfo:", err);
        }
      }

      const names = profile.name.split(" ,");

      return {
        id: profile.sub,
        firstName: names[1] || "",
        lastName: names[0] || "",
        rcsid: profile.preferred_username || profile.sub.split("@")[0],
        email: profile.email,
        role: "student", // Default value if userinfo fetch fails
        emailVerified: null, // Set to null if not available
      };
    },
  };

  return RPI_SHIBBOLETH_PROVIDER;
}

async function fetchUserProfile(
  accessToken: string,
  userinfo_endpoint: string
): Promise<USER_PROFILE> {
  const res = await fetch(userinfo_endpoint, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) throw new Error(`Failed to fetch userinfo: ${res.statusText}`);

  const userinfo = await res.json();
  return userinfo;
}

type RPI_PROVIDER_CONFIG = {
  clientId: string;
  clientSecret: string;
  authorizationUrl: string;
  tokenUrl: string;
  userinfoUrl: string;
  issuer: string;
  jwksEndpoint: string;
};

type USER_PROFILE = {
  sub: string;
  email: string;
  eduPersonScopedAffiliation?: string;
  preferred_username?: string;
  given_name?: string;
  family_name?: string;
};

export const DEVELOPMENT_PROVIDER: Provider = Credentials({
  name: "Mock Login",
  credentials: {
    rcsid: { label: "RCSID", type: "text" },
    firstName: { label: "Name", type: "text" },
    lastName: { label: "Last Name", type: "text" },
    eduScopedPersonAffiliation: { label: "Affiliation", type: "text" },
    department: { label: "Department", type: "text" },
  },
  async authorize(credentials) {
    if (!credentials) {
      return null;
    }

    const user = {
      id: `${credentials.rcsid}@rpi.edu`, // Use RCS ID as the unique identifier
      firstName: credentials.firstName || "",
      lastName: credentials.lastName || "",
      rcsid: credentials.rcsid,
      email: `${credentials.rcsid}@rpi.edu`,
      role: credentials.eduScopedPersonAffiliation || "student",
      department: credentials.department || "General Studies",
    };
    return user;
  },
});
