import "server-only";

/** Which Better Auth social providers are wired from server-only env. */
export function getBetterAuthSocialStatus(): {
  google: boolean;
  github: boolean;
} {
  return {
    google: Boolean(
      process.env.GOOGLE_CLIENT_ID?.trim() &&
        process.env.GOOGLE_CLIENT_SECRET?.trim()
    ),
    github: Boolean(
      process.env.GITHUB_CLIENT_ID?.trim() &&
        process.env.GITHUB_CLIENT_SECRET?.trim()
    ),
  };
}
