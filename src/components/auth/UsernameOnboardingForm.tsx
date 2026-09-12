"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { safeInternalPath } from "@/lib/auth/safe-next";
import {
  normalizeUsernameInput,
  validateUsernameFormat,
  type UsernameFormatError,
} from "@/lib/auth/username";
import { useLocale } from "@/i18n/locale-context";

type RemoteStatus = "checking" | "available" | "taken" | "error";

interface UsernameOnboardingFormProps {
  nextPath?: string;
}

function formatMessage(
  err: UsernameFormatError,
  messages: {
    usernameErrTooShort: string;
    usernameErrTooLong: string;
    usernameErrInvalidChars: string;
  }
): string {
  if (err === "too_short") return messages.usernameErrTooShort;
  if (err === "too_long") return messages.usernameErrTooLong;
  return messages.usernameErrInvalidChars;
}

export function UsernameOnboardingForm({
  nextPath = "/",
}: UsernameOnboardingFormProps) {
  const { messages } = useLocale();
  const router = useRouter();
  const [value, setValue] = useState("");
  const [remote, setRemote] = useState<{
    forValue: string;
    status: RemoteStatus;
  } | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const reqId = useRef(0);

  const trimmed = normalizeUsernameInput(value);
  const formatError = trimmed ? validateUsernameFormat(trimmed) : null;
  const localError = formatError
    ? formatMessage(formatError, messages)
    : null;

  useEffect(() => {
    if (!trimmed || formatError) return;

    const id = ++reqId.current;
    const timer = window.setTimeout(() => {
      void (async () => {
        setRemote({ forValue: trimmed, status: "checking" });
        try {
          const res = await fetch("/api/username/available", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: trimmed }),
          });
          if (id !== reqId.current) return;
          if (res.status === 401) {
            router.replace(
              `/auth?next=${encodeURIComponent(`/onboarding/username?next=${nextPath}`)}`
            );
            return;
          }
          const data = (await res.json().catch(() => ({}))) as {
            available?: boolean;
            error?: string;
          };
          if (!res.ok || typeof data.available !== "boolean") {
            setRemote({ forValue: trimmed, status: "error" });
            return;
          }
          setRemote({
            forValue: trimmed,
            status: data.available ? "available" : "taken",
          });
        } catch {
          if (id !== reqId.current) return;
          setRemote({ forValue: trimmed, status: "error" });
        }
      })();
    }, 350);

    return () => {
      window.clearTimeout(timer);
      reqId.current += 1;
    };
  }, [trimmed, formatError, nextPath, router]);

  const remoteForValue =
    remote && remote.forValue === trimmed ? remote.status : null;

  const availability = !trimmed
    ? "idle"
    : formatError
      ? "invalid"
      : remoteForValue === "available"
        ? "available"
        : remoteForValue === "taken"
          ? "taken"
          : remoteForValue === "error"
            ? "invalid"
            : "checking";

  const statusMessage =
    localError ??
    (availability === "checking"
      ? messages.usernameChecking
      : availability === "available"
        ? messages.usernameAvailable
        : availability === "taken"
          ? messages.usernameTaken
          : remoteForValue === "error"
            ? messages.usernameErrCheckFailed
            : null);

  const canSubmit =
    availability === "available" &&
    !formatError &&
    trimmed.length > 0 &&
    !saving;

  async function submit() {
    if (!canSubmit) return;
    setSaving(true);
    setSubmitError(null);

    try {
      const res = await fetch("/api/username", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: trimmed }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };

      if (res.status === 401) {
        router.replace(
          `/auth?next=${encodeURIComponent(`/onboarding/username?next=${nextPath}`)}`
        );
        return;
      }

      if (res.status === 409 || data.error === "taken") {
        setRemote({ forValue: trimmed, status: "taken" });
        setSubmitError(messages.usernameErrTakenRace);
        setSaving(false);
        return;
      }

      if (data.error === "invalid") {
        setSubmitError(messages.usernameErrInvalidChars);
        setSaving(false);
        return;
      }

      if (data.error === "missing") {
        setSubmitError(messages.usernameErrProfileMissing);
        setSaving(false);
        return;
      }

      if (!res.ok || !data.ok) {
        setSubmitError(messages.usernameErrSaveFailed);
        setSaving(false);
        return;
      }

      const dest = safeInternalPath(nextPath, "/");
      router.replace(dest);
      router.refresh();
    } catch {
      setSubmitError(messages.usernameErrSaveFailed);
      setSaving(false);
    }
  }

  const statusTone =
    availability === "available"
      ? "text-ml-accent"
      : availability === "taken" || availability === "invalid"
        ? "text-ml-danger"
        : "text-ml-text-muted";

  return (
    <form
      className="mt-6 space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
    >
      <label className="block">
        <span className="sr-only">{messages.usernameLabel}</span>
        <input
          type="text"
          name="username"
          autoComplete="username"
          autoFocus
          spellCheck={false}
          maxLength={20}
          value={value}
          disabled={saving}
          onChange={(e) => {
            setValue(e.target.value);
            setSubmitError(null);
          }}
          placeholder={messages.usernamePlaceholder}
          aria-invalid={availability === "invalid" || availability === "taken"}
          aria-describedby="username-status"
          className="w-full border border-ml-border-strong bg-ml-bg-0 px-3 py-3 font-mono text-[length:var(--ml-text-md)] text-ml-text outline-none transition placeholder:text-ml-text-muted focus:border-ml-accent disabled:opacity-60"
          style={{ borderRadius: "var(--ml-frame-radius)" }}
        />
      </label>

      <p
        id="username-status"
        className={`min-h-[1.25rem] text-[length:var(--ml-text-sm)] ${statusTone}`}
        aria-live="polite"
      >
        {statusMessage ?? "\u00a0"}
      </p>

      <p className="text-[length:var(--ml-text-xs)] text-ml-text-muted">
        {messages.usernameRules}
      </p>

      {submitError && (
        <p className="border-l-2 border-ml-danger pl-2.5 text-[length:var(--ml-text-sm)] text-ml-danger">
          {submitError}
        </p>
      )}

      <button
        type="submit"
        disabled={!canSubmit}
        className="inline-flex w-full items-center justify-center bg-ml-accent px-4 py-3 text-[length:var(--ml-text-sm)] font-medium tracking-[0.06em] text-[var(--ml-text-on-primary)] uppercase transition hover:bg-ml-accent-bright disabled:cursor-not-allowed disabled:opacity-50"
        style={{ borderRadius: "var(--ml-frame-radius)" }}
      >
        {saving ? messages.usernameSaving : messages.usernameContinue}
      </button>
    </form>
  );
}
