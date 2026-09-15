import { AppProfileView } from "@/components/profile/AppProfileView";
import { getAuthIdentity } from "@/lib/auth/get-identity";

/** Soft-auth Profile inside `/app` shell — Editorial Cartographic. */
export default async function AppProfilePage() {
  const identity = await getAuthIdentity();
  return <AppProfileView identity={identity} />;
}
