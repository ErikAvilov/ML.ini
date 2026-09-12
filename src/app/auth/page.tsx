import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthProviders } from "@/components/auth/AuthProviders";
import { getAuthIdentity } from "@/lib/auth/get-identity";
import { safeInternalPath } from "@/lib/auth/safe-next";
import {
  isUsernameConfigured,
  playerDisplayName,
} from "@/lib/auth/username";
import { getCommonMessages } from "@/i18n/messages/common";
import { DEFAULT_LOCALE } from "@/i18n/config";

interface AuthPageProps {
  searchParams: Promise<{ next?: string; error?: string }>;
}

export default async function AuthPage({ searchParams }: AuthPageProps) {
  const params = await searchParams;
  const messages = getCommonMessages(DEFAULT_LOCALE);
  const nextPath = safeInternalPath(params.next, "/");
  const identity = await getAuthIdentity();

  if (identity && !isUsernameConfigured(identity.profile?.username)) {
    redirect(
      `/onboarding/username?next=${encodeURIComponent(nextPath)}`
    );
  }

  if (identity) {
    return (
      <div className="mx-auto flex min-h-full w-full max-w-lg flex-col justify-center px-4 py-10 sm:px-6">
        <section
          className="border border-ml-border bg-[color-mix(in_srgb,var(--ml-surface-1)_92%,transparent)] p-6 sm:p-8"
          style={{ borderRadius: "var(--ml-frame-radius-lg)" }}
        >
          <p className="font-mono text-[11px] tracking-[0.14em] text-ml-accent uppercase">
            {messages.authAlreadyConnected}
          </p>
          <h1 className="mt-2 font-display text-3xl text-ml-text">
            {playerDisplayName(identity.profile, messages.authSignedInTitle)}
          </h1>
          <p className="mt-2 text-[length:var(--ml-text-sm)] text-ml-text-body">
            {messages.authAlreadyConnectedHelp}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/profil"
              className="inline-flex items-center bg-ml-accent px-4 py-2.5 text-[length:var(--ml-text-sm)] font-medium text-[var(--ml-text-on-primary)] hover:bg-ml-accent-bright"
              style={{ borderRadius: "var(--ml-frame-radius)" }}
            >
              {messages.navProfile}
            </Link>
            <Link
              href={nextPath}
              className="inline-flex items-center border border-ml-border px-4 py-2.5 text-[length:var(--ml-text-sm)] text-ml-text-secondary hover:border-ml-border-strong hover:text-ml-text"
              style={{ borderRadius: "var(--ml-frame-radius)" }}
            >
              {messages.authContinueApp}
            </Link>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-full w-full max-w-lg flex-col justify-center px-4 py-10 sm:px-6">
      <section
        className="border border-ml-border bg-[color-mix(in_srgb,var(--ml-surface-1)_92%,transparent)] p-6 sm:p-8"
        style={{ borderRadius: "var(--ml-frame-radius-lg)" }}
      >
        <p className="font-mono text-[11px] tracking-[0.14em] text-ml-accent uppercase">
          {messages.authEyebrow}
        </p>
        <h1 className="mt-2 font-display text-3xl text-ml-text sm:text-4xl">
          {messages.authTitle}
        </h1>
        <p className="mt-3 text-[length:var(--ml-text-sm)] leading-relaxed text-ml-text-body">
          {messages.authLead}
        </p>

        {params.error === "oauth_callback" && (
          <p className="mt-4 border-l-2 border-ml-danger pl-2.5 text-[length:var(--ml-text-sm)] text-ml-danger">
            {messages.authCallbackError}
          </p>
        )}
        {params.error === "profile_missing" && (
          <p className="mt-4 border-l-2 border-ml-danger pl-2.5 text-[length:var(--ml-text-sm)] text-ml-danger">
            {messages.usernameProfileMissingHelp}
          </p>
        )}

        <div className="mt-6">
          <AuthProviders nextPath={nextPath} />
        </div>
      </section>
    </div>
  );
}
