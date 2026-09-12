import { auth } from "@/lib/better-auth/auth";
import { toNextJsHandler } from "better-auth/next-js";

/** Better Auth catch-all — sole OAuth/session HTTP surface (`/api/auth/*`). */
export const { GET, POST } = toNextJsHandler(auth);
