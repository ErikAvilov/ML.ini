import Link from "next/link";
import { AuthProviders } from "@/components/auth/AuthProviders";
import { getAuthIdentity } from "@/lib/auth/get-identity";
import { getBetterAuthSocialStatus } from "@/lib/better-auth/social-status";
import { safeInternalPath } from "@/lib/auth/safe-next";
import { playerDisplayName } from "@/lib/auth/username";
import { getCommonMessages } from "@/i18n/messages/common";
import { getRequestLocale } from "@/i18n/get-request-locale";

interface AuthPageProps {
  searchParams: Promise<{ next?: string; error?: string }>;
}

function oauthErrorMessage(
  error: string | undefined,
  messages: ReturnType<typeof getCommonMessages>
): string | null {
  if (!error) return null;
  const code = error.toLowerCase();
  if (code === "email_not_found") return messages.authEmailNotFound;
  if (code === "account_not_linked") return messages.authAccountNotLinked;
  if (
    code === "oauth_callback" ||
    code === "unable_to_get_user_info" ||
    code === "provider_not_found" ||
    code === "invalid_code" ||
    code === "state_not_found"
  ) {
    return messages.authCallbackError;
  }
  if (code === "profile_missing") return messages.usernameProfileMissingHelp;
  return messages.authCallbackError;
}

/** Utility auth — minimal Editorial Cartographic. Behavior unchanged. */
export default async function AuthPage({ searchParams }: AuthPageProps) {
  const params = await searchParams;
  const messages = getCommonMessages(await getRequestLocale());
  const nextPath = safeInternalPath(params.next, "/app");
  const identity = await getAuthIdentity();
  const socialConfigured = getBetterAuthSocialStatus();
  const oauthError = oauthErrorMessage(params.error, messages);

  if (identity) {
    return (
      <div className="mx-auto flex min-h-full w-full max-w-md flex-col justify-center px-4 py-12 sm:px-6">
        <h1 className="font-display text-2xl font-semibold text-ml-text-primary">
          {playerDisplayName(identity.profile, messages.authSignedInTitle)}
        </h1>
        <p className="mt-2 text-[length:var(--ml-text-sm)] text-ml-text-muted">
          {messages.authAlreadyConnectedHelp}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/app/profile"
            className="inline-flex items-center border border-ml-state-active bg-ml-state-active px-4 py-2.5 text-[length:var(--ml-text-sm)] font-semibold text-ml-text-inverse hover:bg-ml-state-active-hover"
            style={{ borderRadius: "var(--ml-frame-radius)" }}
          >
            {messages.navProfile}
          </Link>
          <Link
            href={nextPath}
            className="inline-flex items-center border border-ml-border px-4 py-2.5 text-[length:var(--ml-text-sm)] text-ml-text-muted hover:border-ml-border-strong hover:text-ml-text-primary"
            style={{ borderRadius: "var(--ml-frame-radius)" }}
          >
            {messages.authContinueApp}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-full w-full max-w-md flex-col justify-center px-4 py-12 sm:px-6">
      <h1 className="font-display text-2xl font-semibold text-ml-text-primary sm:text-3xl">
        {messages.authTitle}
      </h1>
      <p className="mt-3 text-[length:var(--ml-text-sm)] leading-relaxed text-ml-text-muted">
        {messages.authLead}
      </p>

      {oauthError && (
        <p
          role="alert"
          className="mt-4 text-[length:var(--ml-text-sm)] text-ml-state-error"
        >
          {oauthError}
        </p>
      )}

      <div className="mt-6">
        <AuthProviders
          nextPath={nextPath}
          socialConfigured={socialConfigured}
        />
      </div>

      <p className="mt-6 text-[length:var(--ml-text-xs)] leading-relaxed text-ml-text-muted">
        En créant un compte, vous acceptez les{" "}
        <Link
          href="/terms"
          className="text-ml-state-active underline-offset-2 hover:underline"
        >
          Conditions d&apos;utilisation
        </Link>{" "}
        et reconnaissez avoir pris connaissance de la{" "}
        <Link
          href="/privacy"
          className="text-ml-state-active underline-offset-2 hover:underline"
        >
          Politique de confidentialité
        </Link>
        .
      </p>
    </div>
  );
}
