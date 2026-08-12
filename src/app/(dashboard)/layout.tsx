import { auth } from '@/server/auth';
import { TaskHistorySidebar } from '@/features/history/TaskHistorySidebar';
import { Header } from '@/features/layout/Header';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <div className="flex h-screen flex-col">
      <Header
        userLabel={session?.user?.name ?? session?.user?.email ?? ''}
        isAdmin={session?.user?.role === 'ADMIN'}
      />
      <div className="flex flex-1 overflow-hidden">
        <div className="h-full w-64 border-r">
          <TaskHistorySidebar />
        </div>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
