import { redirect } from "next/navigation";

/** Legacy → canonical Skill Tree. */
export default function SkillsRedirectPage() {
  redirect("/app/tree");
}
