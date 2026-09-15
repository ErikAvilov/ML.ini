import { redirect } from "next/navigation";

/** Legacy Kingdom hub → World (canonical product home). */
export default function RoyaumeRedirectPage() {
  redirect("/app");
}
