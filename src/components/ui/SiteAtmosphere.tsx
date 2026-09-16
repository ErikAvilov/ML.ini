"use client";

import { usePathname } from "next/navigation";

/**
 * Optional public canvas wash. Decorative grids/textures removed — sober canvas only.
 */
export function SiteAtmosphere() {
  const pathname = usePathname() ?? "";
  const publicSurface =
    pathname === "/" ||
    pathname.startsWith("/privacy") ||
    pathname.startsWith("/terms");
  if (!publicSurface) return null;

  return <div className="ml-atmosphere" aria-hidden />;
}
