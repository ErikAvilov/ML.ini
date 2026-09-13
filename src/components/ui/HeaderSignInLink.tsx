"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "@/i18n/locale-context";

export function HeaderSignInLink() {
  const pathname = usePathname();
  const { messages } = useLocale();
  return (
    <Link
      href={`/auth?next=${encodeURIComponent(pathname || "/")}`}
      className="inline-flex cursor-pointer items-center border border-ml-border-strong bg-ml-surface-1 px-2.5 py-1.5 font-mono text-[11px] tracking-[0.08em] text-ml-text uppercase transition hover:border-ml-accent hover:bg-ml-surface-hover hover:text-ml-accent"
      style={{ borderRadius: "var(--ml-frame-radius)" }}
    >
      {messages.authSignIn}
    </Link>
  );
}
