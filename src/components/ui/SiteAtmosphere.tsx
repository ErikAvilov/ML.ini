/**
 * Global Arcane Academy atmosphere.
 * Texture lives only in CSS (`.ml-atmosphere*`) — do not duplicate per page.
 */
export function SiteAtmosphere() {
  return (
    <div className="ml-atmosphere" aria-hidden>
      <div className="ml-atmosphere__stone" />
      <div className="ml-atmosphere__wash" />
      <div className="ml-atmosphere__veil" />
    </div>
  );
}
