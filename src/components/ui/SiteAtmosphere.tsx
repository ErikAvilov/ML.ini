"use client";

import { usePathname } from "next/navigation";

/**
 * Subtle cartographic atmosphere for public marketing surfaces only.
 * App / utility / mission shells stay opaque Editorial canvas.
 */
export function SiteAtmosphere() {
  const pathname = usePathname() ?? "";
  const publicSurface =
    pathname === "/" ||
    pathname.startsWith("/privacy") ||
    pathname.startsWith("/terms");
  if (!publicSurface) return null;

  return (
    <div className="ml-atmosphere" aria-hidden>
      <div className="ml-atmosphere__grid" />
      <div className="ml-atmosphere__wash" />
    </div>
  );
}
