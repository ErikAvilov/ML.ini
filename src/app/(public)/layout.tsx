import type { ReactNode } from "react";
import { getAppSessionState } from "@/lib/auth/app-session";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";
import { HeaderAuthFromSession } from "@/components/ui/HeaderAuth";

/**
 * Marketing / legal — one document scroll.
 * Footer comes after content (not pinned under the first viewport).
 */
export default async function PublicLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getAppSessionState();

  return (
    <div
      data-theme="editorial-cartographic"
      className="ml-public min-h-0 flex-1 overflow-y-auto bg-ml-canvas text-ml-text-body"
    >
      <PublicHeader
        authSlot={
          <HeaderAuthFromSession session={session} showProgress={false} />
        }
      />
      {children}
      <PublicFooter />
    </div>
  );
}
