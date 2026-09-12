"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { betterAuthClient } from "@/lib/better-auth/client";
import { playerDisplayName } from "@/lib/auth/username";
import { useLocale } from "@/i18n/locale-context";
import type { AuthIdentity } from "@/lib/auth/types";

interface AuthUserMenuProps {
  identity: AuthIdentity;
}

export function AuthUserMenu({ identity }: AuthUserMenuProps) {
  const { messages } = useLocale();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const label = playerDisplayName(identity.profile, messages.authSignedInTitle);
  const avatarUrl = identity.profile?.avatar_url;

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  async function signOut() {
    if (signingOut) return;
    setSigningOut(true);
    setOpen(false);
    try {
      await betterAuthClient.signOut();
    } catch {
      // Still navigate home so the shell can re-render logged-out.
    }
    router.replace("/");
    router.refresh();
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-ml-border bg-ml-surface-2 transition hover:border-ml-accent"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={messages.authAccountMenu}
      >
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt=""
            width={32}
            height={32}
            className="h-full w-full object-cover"
            unoptimized
          />
        ) : (
          <span className="font-mono text-[11px] font-semibold text-ml-accent">
            {label.slice(0, 1).toUpperCase()}
          </span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-40 mt-2 w-52 border border-ml-border bg-ml-surface-1 py-1 shadow-lg"
          style={{ borderRadius: "var(--ml-frame-radius)" }}
        >
          <p className="truncate border-b border-ml-border px-3 py-2 text-[length:var(--ml-text-sm)] text-ml-text">
            {label}
          </p>
          <Link
            role="menuitem"
            href="/profil"
            className="block px-3 py-2 text-[length:var(--ml-text-sm)] text-ml-text-secondary transition hover:bg-ml-surface-hover hover:text-ml-text"
            onClick={() => setOpen(false)}
          >
            {messages.navProfile}
          </Link>
          <button
            role="menuitem"
            type="button"
            disabled={signingOut}
            onClick={() => void signOut()}
            className="block w-full px-3 py-2 text-left text-[length:var(--ml-text-sm)] text-ml-text-secondary transition hover:bg-ml-surface-hover hover:text-ml-text disabled:opacity-50"
          >
            {signingOut ? messages.authSigningOut : messages.authSignOut}
          </button>
        </div>
      )}
    </div>
  );
}
