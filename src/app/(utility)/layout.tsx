import type { ReactNode } from "react";
import { UtilityShell } from "@/components/utility/UtilityShell";

/**
 * Auth / onboarding — minimal utility expression of Editorial Cartographic.
 * URLs: /auth, /auth/continue, /onboarding/username.
 */
export default function UtilityLayout({ children }: { children: ReactNode }) {
  return <UtilityShell>{children}</UtilityShell>;
}
