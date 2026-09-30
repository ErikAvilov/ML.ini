"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface AppNavItemProps {
  href: string;
  label: string;
  /** Path prefix that marks this item active. */
  match: string;
}

export function AppNavItem({ href, label, match }: AppNavItemProps) {
  const pathname = usePathname();
  const active =
    match === "/app"
      ? pathname === "/app" || pathname === "/app/"
      : pathname === match || pathname.startsWith(`${match}/`);

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`rounded-lg px-3 py-1.5 text-[length:var(--ml-text-sm)] font-medium transition-colors duration-150 ease-out focus-visible:outline-none ${
        active
          ? "border-b-2 border-ml-state-active bg-ml-surface-inset text-ml-text-primary"
          : "border-b-2 border-transparent text-ml-text-muted hover:bg-ml-surface-inset/70 hover:text-ml-text-primary"
      }`}
    >
      {label}
    </Link>
  );
}
