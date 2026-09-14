import Link from "next/link";
import { getRequestLocale } from "@/i18n/get-request-locale";
import { getCommonMessages } from "@/i18n/messages/common";

/**
 * Temporary Skill Tree placeholder — Phase 1 nav target only.
 * Final tree chrome ships later; existing /skills remains the full UI.
 */
export default async function AppTreePlaceholderPage() {
  const messages = getCommonMessages(await getRequestLocale());

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10 lg:px-8">
      <p className="font-mono text-[length:var(--ml-text-xs)] tracking-[0.08em] text-ml-text-muted uppercase">
        {messages.navSkillTree}
      </p>
      <h1 className="font-display mt-2 text-[length:var(--ml-text-2xl)] font-semibold text-ml-text-primary">
        {messages.appTreePlaceholderTitle}
      </h1>
      <p className="mt-3 max-w-xl text-[length:var(--ml-text-sm)] text-ml-text-muted">
        {messages.appTreePlaceholderLead}
      </p>
      <Link
        href="/skills"
        className="mt-6 inline-flex items-center border border-ml-border bg-ml-surface-1 px-3 py-2 text-[length:var(--ml-text-sm)] font-medium text-ml-text-primary transition-colors duration-150 hover:border-ml-state-active focus-visible:outline-none"
        style={{ borderRadius: "var(--ml-frame-radius)" }}
      >
        {messages.appOpenTreeCta}
      </Link>
    </div>
  );
}
