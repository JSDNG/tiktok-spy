'use client';

import type { inferRouterOutputs } from '@trpc/server';
import { trpc } from '@/server/trpc/client';
import type { AppRouter } from '@/server/trpc/routers/_app';
import { OverviewCards } from './OverviewCards';
import { TaskStatusTrendChart } from './TaskStatusTrendChart';
import { TopKeywordsPanel } from './TopKeywordsPanel';
import { ZeroResultKeywordsPanel } from './ZeroResultKeywordsPanel';
import { UserActivityTable } from './UserActivityTable';
import { ProviderHealthPanel } from './ProviderHealthPanel';

type AdminOutputs = inferRouterOutputs<AppRouter>['admin'];

interface AdminDashboardProps {
  initialData: {
    overview: AdminOutputs['overview'];
    userActivity: AdminOutputs['userActivity'];
    topKeywords: AdminOutputs['topKeywords'];
    zeroResultKeywords: AdminOutputs['zeroResultKeywords'];
    taskStatusTrend: AdminOutputs['taskStatusTrend'];
    providerHealth: AdminOutputs['providerHealth'];
  };
}

export function AdminDashboard({ initialData }: AdminDashboardProps) {
  const { data: overview } = trpc.admin.overview.useQuery({}, { initialData: initialData.overview });
  const { data: userActivity } = trpc.admin.userActivity.useQuery({}, { initialData: initialData.userActivity });
  const { data: topKeywords } = trpc.admin.topKeywords.useQuery({}, { initialData: initialData.topKeywords });
  const { data: zeroResultKeywords } = trpc.admin.zeroResultKeywords.useQuery(
    {},
    { initialData: initialData.zeroResultKeywords },
  );
  const { data: taskStatusTrend } = trpc.admin.taskStatusTrend.useQuery(
    {},
    { initialData: initialData.taskStatusTrend },
  );
  const { data: providerHealth } = trpc.admin.providerHealth.useQuery({}, { initialData: initialData.providerHealth });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Thống kê quản trị</h1>
      <OverviewCards overview={overview} />
      <TaskStatusTrendChart trend={taskStatusTrend} />
      <div className="grid gap-6 lg:grid-cols-2">
        <TopKeywordsPanel keywords={topKeywords} />
        <ZeroResultKeywordsPanel items={zeroResultKeywords} />
      </div>
      <UserActivityTable users={userActivity} />
      <ProviderHealthPanel health={providerHealth} />
    </div>
  );
}
