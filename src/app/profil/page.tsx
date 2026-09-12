import { redirect } from "next/navigation";
import { ProfileView } from "@/components/profile/ProfileView";
import { getAuthIdentity } from "@/lib/auth/get-identity";
import { isUsernameConfigured } from "@/lib/auth/username";

export default async function ProfilPage() {
  const identity = await getAuthIdentity();
  if (identity && !isUsernameConfigured(identity.profile?.username)) {
    redirect("/onboarding/username?next=%2Fprofil");
  }
  return <ProfileView identity={identity} />;
}
