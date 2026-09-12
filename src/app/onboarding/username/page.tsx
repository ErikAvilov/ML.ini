import { redirect } from "next/navigation";
import { UsernameOnboardingForm } from "@/components/auth/UsernameOnboardingForm";
import { getAuthIdentity } from "@/lib/auth/get-identity";
import { safeInternalPath } from "@/lib/auth/safe-next";
import { isUsernameConfigured } from "@/lib/auth/username";
import { getCommonMessages } from "@/i18n/messages/common";
import { DEFAULT_LOCALE } from "@/i18n/config";

interface UsernameOnboardingPageProps {
  searchParams: Promise<{ next?: string }>;
}

export default async function UsernameOnboardingPage({
  searchParams,
}: UsernameOnboardingPageProps) {
  const params = await searchParams;
  const nextPath = safeInternalPath(params.next, "/");
  const messages = getCommonMessages(DEFAULT_LOCALE);
  const identity = await getAuthIdentity();

  if (!identity) {
    redirect(
      `/auth?next=${encodeURIComponent(`/onboarding/username?next=${nextPath}`)}`
    );
  }

  if (isUsernameConfigured(identity.profile?.username)) {
    redirect(nextPath === "/onboarding/username" ? "/" : nextPath);
  }

  if (!identity.profile) {
    return (
      <div className="mx-auto flex min-h-full w-full max-w-md flex-col justify-center px-4 py-10 sm:px-6">
        <section
          className="border border-ml-border bg-[color-mix(in_srgb,var(--ml-surface-1)_92%,transparent)] p-6 sm:p-8"
          style={{ borderRadius: "var(--ml-frame-radius-lg)" }}
        >
          <p className="font-mono text-[11px] tracking-[0.14em] text-ml-danger uppercase">
            {messages.usernameSystemError}
          </p>
          <h1 className="mt-2 font-display text-2xl text-ml-text">
            {messages.usernameProfileMissingTitle}
          </h1>
          <p className="mt-3 text-[length:var(--ml-text-sm)] text-ml-text-body">
            {messages.usernameProfileMissingHelp}
          </p>
        </section>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-full w-full max-w-md flex-col justify-center px-4 py-10 sm:px-6">
      <section
        className="border border-ml-border bg-[color-mix(in_srgb,var(--ml-surface-1)_92%,transparent)] p-6 sm:p-8"
        style={{ borderRadius: "var(--ml-frame-radius-lg)" }}
      >
        <p className="font-mono text-[11px] tracking-[0.14em] text-ml-accent uppercase">
          {messages.usernameEyebrow}
        </p>
        <h1 className="mt-2 font-display text-3xl text-ml-text">
          {messages.usernameTitle}
        </h1>
        <p className="mt-3 text-[length:var(--ml-text-sm)] leading-relaxed text-ml-text-body">
          {messages.usernameLead}
        </p>
        <UsernameOnboardingForm nextPath={nextPath} />
      </section>
    </div>
  );
}
