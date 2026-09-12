import { createAuthClient } from "better-auth/react";

/**
 * Better Auth browser client (login / logout / session).
 * Same-origin `/api/auth` — no public secrets required.
 */
export const betterAuthClient = createAuthClient();
