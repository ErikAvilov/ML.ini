import { PROJECT_LABEL } from "@/data/narrative/canon";
import { MILDRED_CAPABILITY_CATALOG } from "@/data/narrative/mildred-capabilities";
import type { Locale } from "@/i18n/config";
import type { CommonMessages } from "@/i18n/messages/common";

interface HomeMildredTeaserProps {
  locale: Locale;
  messages: CommonMessages;
  unlockedCapabilities: string[];
}

type TeaserCap = {
  id: string;
  label: string;
  online: boolean;
};

export function HomeMildredTeaser({
  locale,
  messages,
  unlockedCapabilities,
}: HomeMildredTeaserProps) {
  const catalogCaps: TeaserCap[] = (
    ["classification", "business-rules", "structured-output"] as const
  ).map((id) => {
    const entry = MILDRED_CAPABILITY_CATALOG[id];
    return {
      id,
      label: entry.label[locale],
      online: unlockedCapabilities.includes(id),
    };
  });

  /* Cold visitors: show the project’s first capability online so the build path is visible. */
  if (unlockedCapabilities.length === 0 && catalogCaps[0]) {
    catalogCaps[0] = { ...catalogCaps[0], online: true };
  }

  const futureCaps: TeaserCap[] = [
    { id: "data-parsing", label: messages.homeMildredCapParsing, online: false },
    {
      id: "decision-logic",
      label: messages.homeMildredCapDecision,
      online: false,
    },
    {
      id: "ai-integration",
      label: messages.homeMildredCapIntegration,
      online: false,
    },
  ];

  const caps = [...catalogCaps, ...futureCaps];

  return (
    <div className="w-full max-w-md text-left">
      <p className="font-mono text-[length:var(--ml-text-xs)] tracking-[0.16em] text-ml-reward uppercase">
        {messages.homeMildredTitle || PROJECT_LABEL}
      </p>
      <p className="mt-2 text-[length:var(--ml-text-sm)] leading-relaxed text-ml-text-muted">
        {messages.homeMildredLead}
      </p>
      <ul className="mt-4 space-y-2">
        {caps.map((cap) => (
          <li
            key={cap.id}
            className="flex items-center justify-between gap-3 text-[length:var(--ml-text-sm)]"
          >
            <span
              className={
                cap.online ? "text-ml-text-body" : "text-ml-text-muted"
              }
            >
              {cap.label}
            </span>
            <span className="flex items-center gap-2 font-mono text-[length:var(--ml-text-xs)] tracking-wide uppercase">
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  cap.online
                    ? "bg-ml-accent"
                    : "bg-[color-mix(in_srgb,var(--ml-secondary)_40%,transparent)]"
                }`}
                aria-hidden
              />
              <span
                className={
                  cap.online ? "text-ml-accent" : "text-ml-text-muted"
                }
              >
                {cap.online
                  ? messages.homeMildredOnline
                  : messages.homeMildredOffline}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
