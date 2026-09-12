import { ProfileView } from "@/components/profile/ProfileView";
import { getAuthIdentity } from "@/lib/auth/get-identity";

export default async function ProfilPage() {
  const identity = await getAuthIdentity();
  return <ProfileView identity={identity} />;
}
