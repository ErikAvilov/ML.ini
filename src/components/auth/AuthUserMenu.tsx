"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { GitFork, LogOut, Map, UserRound } from "lucide-react";
import { betterAuthClient } from "@/lib/better-auth/client";
import { playerDisplayName } from "@/lib/auth/username";
import { useLocale } from "@/i18n/locale-context";
import type { AuthIdentity } from "@/lib/auth/types";

interface AuthUserMenuProps {
  identity: AuthIdentity;
}

type MenuItem =
  | {
      kind: "link";
      id: string;
      href: string;
      label: string;
      icon: ReactNode;
      match: string;
    }
  | {
      kind: "action";
      id: string;
      label: string;
      icon: ReactNode;
      danger?: boolean;
      onSelect: () => void;
      disabled?: boolean;
    };

const itemClass = (opts: {
  active?: boolean;
  danger?: boolean;
  disabled?: boolean;
}) => {
  const base =
    "flex w-full cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-[length:var(--ml-text-sm)] outline-none transition-colors";
  if (opts.disabled) {
    return `${base} cursor-not-allowed text-ml-text-muted opacity-50`;
  }
  if (opts.danger) {
    return `${base} text-ml-text-secondary hover:bg-[color-mix(in_srgb,var(--ml-danger)_14%,transparent)] hover:text-ml-danger focus-visible:bg-[color-mix(in_srgb,var(--ml-danger)_14%,transparent)] focus-visible:text-ml-danger data-[highlighted=true]:bg-[color-mix(in_srgb,var(--ml-danger)_14%,transparent)] data-[highlighted=true]:text-ml-danger`;
  }
  if (opts.active) {
    return `${base} bg-[color-mix(in_srgb,var(--ml-accent)_14%,transparent)] text-ml-text hover:bg-[color-mix(in_srgb,var(--ml-accent)_20%,transparent)] focus-visible:bg-[color-mix(in_srgb,var(--ml-accent)_20%,transparent)] data-[highlighted=true]:bg-[color-mix(in_srgb,var(--ml-accent)_20%,transparent)]`;
  }
  return `${base} text-ml-text-secondary hover:bg-ml-surface-hover hover:text-ml-text focus-visible:bg-ml-surface-hover focus-visible:text-ml-text data-[highlighted=true]:bg-ml-surface-hover data-[highlighted=true]:text-ml-text`;
};

export function AuthUserMenu({ identity }: AuthUserMenuProps) {
  const { messages } = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const menuId = useId();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Array<HTMLElement | null>>([]);

  const label = playerDisplayName(identity.profile, messages.authSignedInTitle);
  const username = identity.profile?.username?.trim() || null;
  const email = identity.email?.trim() || null;
  const avatarUrl = identity.profile?.avatar_url;
  const initial = label.slice(0, 1).toUpperCase();

  const close = useCallback(() => {
    setOpen(false);
    setHighlighted(0);
  }, []);

  async function signOut() {
    if (signingOut) return;
    setSigningOut(true);
    close();
    try {
      await betterAuthClient.signOut();
    } catch {
      // Navigate home anyway so the shell re-renders logged-out.
    }
    router.replace("/");
    router.refresh();
  }

  const items: MenuItem[] = [
    {
      kind: "link",
      id: "profile",
      href: "/profil",
      label: messages.navProfile,
      match: "/profil",
      icon: <UserRound className="h-4 w-4 shrink-0 opacity-80" aria-hidden />,
    },
    {
      kind: "link",
      id: "kingdom",
      href: "/royaume",
      label: messages.navKingdoms,
      match: "/royaume",
      icon: <Map className="h-4 w-4 shrink-0 opacity-80" aria-hidden />,
    },
    {
      kind: "link",
      id: "skills",
      href: "/skills",
      label: messages.navTree,
      match: "/skills",
      icon: <GitFork className="h-4 w-4 shrink-0 opacity-80" aria-hidden />,
    },
    {
      kind: "action",
      id: "signout",
      label: signingOut ? messages.authSigningOut : messages.authSignOut,
      danger: true,
      disabled: signingOut,
      onSelect: () => void signOut(),
      icon: <LogOut className="h-4 w-4 shrink-0 opacity-80" aria-hidden />,
    },
  ];

  useEffect(() => {
    if (!open) return;

    function onDocPointer(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) close();
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
      }
    }

    document.addEventListener("mousedown", onDocPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  useEffect(() => {
    if (!open) return;
    itemRefs.current[highlighted]?.focus();
  }, [open, highlighted]);

  function onTriggerKeyDown(e: ReactKeyboardEvent<HTMLButtonElement>) {
    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setOpen(true);
      setHighlighted(0);
    }
  }

  function onMenuKeyDown(e: ReactKeyboardEvent<HTMLDivElement>) {
    const last = items.length - 1;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted((i) => (i >= last ? 0 : i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((i) => (i <= 0 ? last : i - 1));
    } else if (e.key === "Home") {
      e.preventDefault();
      setHighlighted(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setHighlighted(last);
    } else if (e.key === "Tab") {
      close();
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        id={`${menuId}-trigger`}
        aria-controls={menuId}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={messages.authAccountMenu}
        onClick={() =>
          setOpen((v) => {
            if (!v) setHighlighted(0);
            return !v;
          })
        }
        onKeyDown={onTriggerKeyDown}
        className={`flex h-8 w-8 cursor-pointer items-center justify-center overflow-hidden rounded-full border bg-ml-surface-2 transition duration-150 ${
          open
            ? "scale-105 border-ml-accent ring-2 ring-[color-mix(in_srgb,var(--ml-accent)_40%,transparent)]"
            : "border-ml-border hover:scale-105 hover:border-ml-accent hover:ring-2 hover:ring-[color-mix(in_srgb,var(--ml-accent)_28%,transparent)] active:scale-95"
        }`}
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
            {initial}
          </span>
        )}
      </button>

      {open && (
        <div
          id={menuId}
          role="menu"
          aria-labelledby={`${menuId}-trigger`}
          tabIndex={-1}
          onKeyDown={onMenuKeyDown}
          className="absolute right-0 z-50 mt-2 w-[16.5rem] origin-top-right animate-[ml-menu-in_120ms_ease-out] border border-ml-border-strong bg-ml-surface-1 py-1.5 shadow-[0_12px_40px_rgba(0,0,0,0.45)]"
          style={{ borderRadius: "var(--ml-frame-radius-lg)" }}
        >
          <div className="flex items-start gap-3 px-3 pb-2.5 pt-1.5">
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-ml-border bg-ml-surface-2">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt=""
                  width={36}
                  height={36}
                  className="h-full w-full object-cover"
                  unoptimized
                />
              ) : (
                <span className="font-mono text-xs font-semibold text-ml-accent">
                  {initial}
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[length:var(--ml-text-sm)] font-medium text-ml-text">
                {label}
              </p>
              {username && (
                <p className="truncate font-mono text-[11px] text-ml-text-muted">
                  @{username}
                </p>
              )}
              {email && (
                <p className="mt-0.5 truncate text-[11px] text-ml-text-muted">
                  {email}
                </p>
              )}
            </div>
          </div>

          <div
            className="mx-2 my-1 h-px bg-ml-border"
            role="separator"
            aria-hidden
          />

          <div className="px-1.5 py-0.5">
            {items.map((item, index) => {
              if (item.kind === "link") {
                const active = pathname.startsWith(item.match);
                return (
                  <Link
                    key={item.id}
                    ref={(el) => {
                      itemRefs.current[index] = el;
                    }}
                    role="menuitem"
                    href={item.href}
                    data-highlighted={highlighted === index ? "true" : undefined}
                    className={itemClass({ active })}
                    onMouseEnter={() => setHighlighted(index)}
                    onFocus={() => setHighlighted(index)}
                    onClick={close}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                );
              }

              return (
                <div key={item.id}>
                  <div
                    className="mx-0.5 my-1 h-px bg-ml-border"
                    role="separator"
                    aria-hidden
                  />
                  <button
                    ref={(el) => {
                      itemRefs.current[index] = el;
                    }}
                    role="menuitem"
                    type="button"
                    disabled={item.disabled}
                    data-highlighted={
                      highlighted === index ? "true" : undefined
                    }
                    className={itemClass({
                      danger: item.danger,
                      disabled: item.disabled,
                    })}
                    onMouseEnter={() => setHighlighted(index)}
                    onFocus={() => setHighlighted(index)}
                    onClick={item.onSelect}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
