"use client";

import { useState } from "react";
import { betterAuthClient } from "@/lib/better-auth/client";
import { safeInternalPath } from "@/lib/auth/safe-next";
import { useLocale } from "@/i18n/locale-context";

type Provider = "google" | "github";

interface AuthProvidersProps {
  nextPath?: string;
  socialConfigured?: { google: boolean; github: boolean };
}

export function AuthProviders({
  nextPath = "/",
  socialConfigured = { google: true, github: true },
}: AuthProvidersProps) {
  const { messages } = useLocale();
  const [pending, setPending] = useState<Provider | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function startOAuth(provider: Provider) {
    setPending(provider);
    setError(null);
    try {
      if (!socialConfigured[provider]) {
        setError(messages.authOauthNotConfigured);
        setPending(null);
        return;
      }

      const safeNext = safeInternalPath(nextPath, "/");
      const { error: oauthError } = await betterAuthClient.signIn.social({
        provider,
        callbackURL: `/auth/continue?next=${encodeURIComponent(safeNext)}`,
        errorCallbackURL: "/auth",
      });
      if (oauthError) {
        setError(messages.authOauthStartError);
        setPending(null);
      }
    } catch {
      setError(messages.authOauthStartError);
      setPending(null);
    }
  }

  const btnClass =
    "inline-flex w-full cursor-pointer items-center justify-center border border-ml-border-strong bg-ml-surface-1 px-4 py-3 text-[length:var(--ml-text-sm)] font-medium text-ml-text transition hover:border-ml-accent hover:bg-ml-surface-hover disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <div className="space-y-3">
      <button
        type="button"
        className={btnClass}
        style={{ borderRadius: "var(--ml-frame-radius)" }}
        disabled={pending !== null}
        onClick={() => void startOAuth("google")}
      >
        {pending === "google"
          ? messages.authRedirecting
          : messages.authContinueGoogle}
      </button>
      <button
        type="button"
        className={btnClass}
        style={{ borderRadius: "var(--ml-frame-radius)" }}
        disabled={pending !== null}
        onClick={() => void startOAuth("github")}
      >
        {pending === "github"
          ? messages.authRedirecting
          : messages.authContinueGithub}
      </button>
      {error && (
        <p className="border-l-2 border-ml-danger pl-2.5 text-[length:var(--ml-text-sm)] text-ml-danger">
          {error}
        </p>
      )}
    </div>
  );
}
