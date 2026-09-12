import type { ReactNode } from "react";
import {
  LEGAL_LAST_UPDATED_LABEL,
  LEGAL_OPERATOR,
} from "@/data/legal/constants";

export function LegalDocument({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <article className="mx-auto w-full max-w-[52rem] px-4 py-10 sm:px-6 sm:py-14">
      <header className="border-b border-ml-border pb-6">
        <p className="font-mono text-[11px] tracking-[0.14em] text-ml-accent uppercase">
          {LEGAL_OPERATOR.productName}
        </p>
        <h1 className="mt-2 font-display text-3xl text-ml-text sm:text-4xl">
          {title}
        </h1>
        <p className="mt-3 text-[length:var(--ml-text-sm)] text-ml-text-muted">
          Dernière mise à jour : {LEGAL_LAST_UPDATED_LABEL}
        </p>
      </header>
      <div className="legal-prose mt-8 space-y-8 text-[length:var(--ml-text-base)] leading-[var(--ml-leading-body)] text-ml-text-body">
        {children}
      </div>
    </article>
  );
}

export function LegalSection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-8">
      <h2 className="font-display text-xl text-ml-text sm:text-2xl">{title}</h2>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}

export function LegalContactBlock() {
  return (
    <div className="border border-ml-border bg-ml-surface-1/60 px-4 py-3 text-[length:var(--ml-text-sm)]"
      style={{ borderRadius: "var(--ml-frame-radius)" }}
    >
      <p className="font-medium text-ml-text">{LEGAL_OPERATOR.commercialName}</p>
      <p>Exploitant : {LEGAL_OPERATOR.operatorName}</p>
      <p>SIREN : {LEGAL_OPERATOR.siren}</p>
      <p>
        Email :{" "}
        <a
          href={`mailto:${LEGAL_OPERATOR.email}`}
          className="text-ml-accent underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ml-accent"
        >
          {LEGAL_OPERATOR.email}
        </a>
      </p>
    </div>
  );
}
