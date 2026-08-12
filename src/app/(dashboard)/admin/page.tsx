import { redirect } from 'next/navigation';
import { auth } from '@/server/auth';
import { getServerCaller } from '@/server/trpc/server';
import { AdminDashboard } from '@/features/admin/AdminDashboard';

export default async function AdminPage() {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') redirect('/');

  const caller = await getServerCaller();
  const [overview, userActivity, topKeywords, zeroResultKeywords, taskStatusTrend, providerHealth] =
    await Promise.all([
      caller.admin.overview({}),
      caller.admin.userActivity({}),
      caller.admin.topKeywords({}),
      caller.admin.zeroResultKeywords({}),
      caller.admin.taskStatusTrend({}),
      caller.admin.providerHealth({}),
    ]);

  return (
    <AdminDashboard
      initialData={{ overview, userActivity, topKeywords, zeroResultKeywords, taskStatusTrend, providerHealth }}
    />
  );
}
