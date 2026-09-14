"use client";

import { usePathname } from "next/navigation";

/**
 * Global Arcane Academy atmosphere for marketing / legacy routes.
 * Hidden on `/app` so Editorial Cartographic canvas never leaks Adventure Tech texture.
 */
export function SiteAtmosphere() {
  const pathname = usePathname();
  if (pathname.startsWith("/app")) return null;

  return (
    <div className="ml-atmosphere" aria-hidden>
      <div className="ml-atmosphere__stone" />
      <div className="ml-atmosphere__wash" />
      <div className="ml-atmosphere__veil" />
    </div>
  );
}
