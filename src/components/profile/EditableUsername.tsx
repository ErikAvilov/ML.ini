"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  normalizeUsernameInput,
  validateUsernameFormat,
  type UsernameFormatError,
} from "@/lib/auth/username";
import { useLocale } from "@/i18n/locale-context";

type RemoteStatus = "checking" | "available" | "taken" | "error";

function formatError(
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

interface EditableUsernameProps {
  initialUsername: string;
}

export function EditableUsername({ initialUsername }: EditableUsernameProps) {
  const { messages } = useLocale();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const reqId = useRef(0);

  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(initialUsername);
  const [remote, setRemote] = useState<RemoteStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const trimmed = normalizeUsernameInput(value);
  const formatErr = trimmed ? validateUsernameFormat(trimmed) : "too_short";
  const unchanged =
    trimmed.toLowerCase() === initialUsername.toLowerCase();
  const needsCheck = editing && !!trimmed && !formatErr && !unchanged;

  useEffect(() => {
    if (editing) inputRef.current?.select();
  }, [editing]);

  useEffect(() => {
    if (!needsCheck) return;

    const id = ++reqId.current;
    const timer = window.setTimeout(() => {
      void (async () => {
        setRemote("checking");
        try {
          const res = await fetch("/api/username/available", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: trimmed }),
          });
          if (id !== reqId.current) return;
          const data = (await res.json().catch(() => ({}))) as {
            available?: boolean;
          };
          if (!res.ok || typeof data.available !== "boolean") {
            setRemote("error");
            return;
          }
          setRemote(data.available ? "available" : "taken");
        } catch {
          if (id !== reqId.current) return;
          setRemote("error");
        }
      })();
    }, 350);

    return () => {
      window.clearTimeout(timer);
      reqId.current += 1;
    };
  }, [needsCheck, trimmed]);

  function startEdit() {
    setValue(initialUsername);
    setRemote(null);
    setError(null);
    setSaving(false);
    setEditing(true);
  }

  function cancel() {
    setEditing(false);
    setValue(initialUsername);
    setError(null);
    setRemote(null);
    setSaving(false);
  }

  async function save() {
    if (saving) return;
    if (unchanged) {
      cancel();
      return;
    }
    if (formatErr) {
      setError(formatError(formatErr, messages));
      return;
    }
    if (remote !== "available") return;

    setSaving(true);
    setError(null);
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

      if (res.status === 409 || data.error === "taken") {
        setRemote("taken");
        setError(messages.usernameErrTakenRace);
        setSaving(false);
        return;
      }
      if (data.error === "invalid") {
        setError(messages.usernameErrInvalidChars);
        setSaving(false);
        return;
      }
      if (!res.ok || !data.ok) {
        setError(messages.usernameErrSaveFailed);
        setSaving(false);
        return;
      }

      setEditing(false);
      setSaving(false);
      router.refresh();
    } catch {
      setError(messages.usernameErrSaveFailed);
      setSaving(false);
    }
  }

  const status =
    formatErr && trimmed
      ? formatError(formatErr, messages)
      : needsCheck && remote === "checking"
        ? messages.usernameChecking
        : needsCheck && remote === "available"
          ? messages.usernameAvailable
          : needsCheck && remote === "taken"
            ? messages.usernameTaken
            : needsCheck && remote === "error"
              ? messages.usernameErrCheckFailed
              : null;

  const canSave =
    !saving &&
    !formatErr &&
    trimmed.length > 0 &&
    (unchanged || remote === "available");

  if (!editing) {
    return (
      <button
        type="button"
        onClick={startEdit}
        className="mt-1 group cursor-pointer text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ml-accent"
        title={messages.profileUsernameEditHint}
        aria-label={messages.profileUsernameEditHint}
      >
        <h1 className="font-display text-3xl font-semibold text-ml-text underline-offset-4 transition group-hover:text-ml-accent group-hover:underline sm:text-4xl">
          {initialUsername}
        </h1>
        <span className="mt-1 block font-mono text-[length:var(--ml-text-xs)] text-ml-text-muted opacity-70 transition group-hover:text-ml-accent group-hover:opacity-100 group-focus-visible:opacity-100">
          {messages.profileUsernameEditHint}
        </span>
      </button>
    );
  }

  return (
    <div className="mt-1 max-w-sm space-y-2">
      <label className="block">
        <span className="sr-only">{messages.usernameLabel}</span>
        <input
          ref={inputRef}
          type="text"
          name="username"
          autoComplete="username"
          spellCheck={false}
          maxLength={20}
          value={value}
          disabled={saving}
          onChange={(e) => {
            setValue(e.target.value);
            setError(null);
            setRemote(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              e.preventDefault();
              cancel();
            }
            if (e.key === "Enter") {
              e.preventDefault();
              void save();
            }
          }}
          className="w-full border border-ml-border-strong bg-ml-bg-0 px-3 py-2 font-display text-2xl text-ml-text outline-none focus:border-ml-accent disabled:opacity-60 sm:text-3xl"
          style={{ borderRadius: "var(--ml-frame-radius)" }}
        />
      </label>
      <p
        className={`min-h-[1.1rem] text-[length:var(--ml-text-xs)] ${
          remote === "taken" || formatErr || error
            ? "text-ml-danger"
            : remote === "available"
              ? "text-ml-accent"
              : "text-ml-text-muted"
        }`}
        aria-live="polite"
      >
        {error ?? status ?? messages.usernameRules}
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={!canSave}
          onClick={() => void save()}
          className="border border-ml-accent bg-ml-accent px-3 py-1.5 text-[length:var(--ml-text-xs)] font-medium text-[var(--ml-text-on-primary)] transition hover:bg-ml-accent-bright disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
          style={{ borderRadius: "var(--ml-frame-radius)" }}
        >
          {saving ? messages.usernameSaving : messages.profileUsernameSave}
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={cancel}
          className="cursor-pointer border border-ml-border px-3 py-1.5 text-[length:var(--ml-text-xs)] text-ml-text-secondary transition hover:border-ml-border-strong hover:bg-ml-surface-hover hover:text-ml-text disabled:cursor-not-allowed disabled:opacity-50"
          style={{ borderRadius: "var(--ml-frame-radius)" }}
        >
          {messages.profileUsernameCancel}
        </button>
      </div>
    </div>
  );
}
