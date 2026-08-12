import { auth } from '@/server/auth';
import { DashboardSidebar } from '@/features/layout/DashboardSidebar';
import { Header } from '@/features/layout/Header';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const isAdmin = session?.user?.role === 'ADMIN';

  return (
    <div className="flex h-screen flex-col">
      <Header userLabel={session?.user?.name ?? session?.user?.email ?? ''} />
      <div className="flex flex-1 overflow-hidden">
        <div className="h-full w-64 border-r">
          <DashboardSidebar isAdmin={isAdmin} />
        </div>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
