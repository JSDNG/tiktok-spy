import { TaskHistorySidebar } from '@/features/history/TaskHistorySidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen">
      <TaskHistorySidebar />
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  );
}
