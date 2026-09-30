"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "@/i18n/locale-context";

export function HeaderSignInLink() {
  const pathname = usePathname();
  const { messages } = useLocale();
  const next =
    !pathname || pathname === "/" ? "/app" : pathname;
  return (
    <Link
      href={`/auth?next=${encodeURIComponent(next)}`}
      className="inline-flex cursor-pointer items-center border border-ml-border-strong bg-ml-surface-raised px-3 py-1.5 text-[length:var(--ml-text-sm)] font-medium text-ml-text-primary transition hover:bg-ml-surface-hover"
      style={{ borderRadius: "var(--ml-frame-radius)" }}
    >
      {messages.authSignIn}
    </Link>
  );
}
