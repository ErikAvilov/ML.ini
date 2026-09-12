"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ACCOUNT_DELETE_CONFIRM_PHRASE } from "@/data/legal/constants";
import { useLocale } from "@/i18n/locale-context";

export function AccountDeletionPanel() {
  const { messages, t } = useLocale();
  const [open, setOpen] = useState(false);
  const [phrase, setPhrase] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit =
    phrase.trim() === ACCOUNT_DELETE_CONFIRM_PHRASE && !pending;

  async function submit() {
    if (!canSubmit) return;
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/account/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmation: phrase.trim() }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };
      if (!res.ok || !data.ok) {
        setError(messages.accountDeleteError);
        setPending(false);
        return;
      }
      // Hard navigation: account is gone; clear SSR shell completely.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- intentional full reload after account wipe
      window.location.assign("/");
    } catch {
      setError(messages.accountDeleteError);
      setPending(false);
    }
  }

  return (
    <section
      className="border border-[color-mix(in_srgb,var(--ml-danger)_35%,var(--ml-border))] bg-[color-mix(in_srgb,var(--ml-danger)_6%,transparent)] p-5 sm:p-6"
      style={{ borderRadius: "var(--ml-frame-radius-lg)" }}
    >
      <h2 className="font-display text-lg text-ml-text">
        {messages.accountDeleteTitle}
      </h2>
      <p className="mt-2 max-w-xl text-[length:var(--ml-text-sm)] text-ml-text-muted">
        {messages.accountDeleteHelp}
      </p>
      <p className="mt-2 max-w-xl text-[length:var(--ml-text-sm)] text-ml-text-muted">
        {messages.accountDeleteLocalNote}
      </p>

      {!open ? (
        <Button
          variant="danger"
          className="mt-4"
          onClick={() => {
            setOpen(true);
            setError(null);
            setPhrase("");
          }}
        >
          {messages.accountDeleteAction}
        </Button>
      ) : (
        <div className="mt-4 max-w-md space-y-3">
          <p className="text-[length:var(--ml-text-sm)] text-ml-danger">
            {messages.accountDeleteIrreversible}
          </p>
          <label className="block">
            <span className="text-[length:var(--ml-text-xs)] text-ml-text-muted">
              {t(messages.accountDeleteTypeConfirm, {
                phrase: ACCOUNT_DELETE_CONFIRM_PHRASE,
              })}
            </span>
            <input
              type="text"
              autoComplete="off"
              spellCheck={false}
              value={phrase}
              disabled={pending}
              onChange={(e) => setPhrase(e.target.value)}
              className="mt-1.5 w-full border border-ml-border-strong bg-ml-bg-0 px-3 py-2.5 font-mono text-[length:var(--ml-text-sm)] text-ml-text outline-none focus:border-ml-danger disabled:opacity-60"
              style={{ borderRadius: "var(--ml-frame-radius)" }}
            />
          </label>
          {error && (
            <p className="border-l-2 border-ml-danger pl-2.5 text-[length:var(--ml-text-sm)] text-ml-danger">
              {error}
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="danger"
              disabled={!canSubmit}
              onClick={() => void submit()}
            >
              {pending
                ? messages.accountDeletePending
                : messages.accountDeleteConfirm}
            </Button>
            <Button
              variant="ghost"
              disabled={pending}
              onClick={() => {
                setOpen(false);
                setPhrase("");
                setError(null);
              }}
            >
              {messages.accountDeleteCancel}
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
