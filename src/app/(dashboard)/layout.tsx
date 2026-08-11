import { auth } from '@/server/auth';
import { TaskHistorySidebar } from '@/features/history/TaskHistorySidebar';
import { UserMenu } from '@/features/auth/UserMenu';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <div className="flex h-screen">
      <div className="flex h-full w-64 flex-col border-r">
        <TaskHistorySidebar />
        <UserMenu label={session?.user?.name ?? session?.user?.email ?? ''} />
      </div>
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  );
}
