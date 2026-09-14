/**
 * Mission focus segment — viewport lock; AppShell already hides World|Skill Tree.
 */
export default function AppMissionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      {children}
    </div>
  );
}
