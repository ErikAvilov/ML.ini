import { redirect } from "next/navigation";

/** Legacy → canonical Profile. */
export default function ProfilRedirectPage() {
  redirect("/app/profile");
}
