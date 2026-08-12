'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { TaskHistorySidebar } from '@/features/history/TaskHistorySidebar';

export function DashboardSidebar({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();
  const isAdminSection = isAdmin && pathname.startsWith('/admin');

  return (
    <div className="flex h-full flex-col">
      {isAdmin && (
        <nav className="flex flex-col gap-1 border-b p-3">
          <Link
            href="/"
            className={cn(
              'rounded px-2 py-1.5 text-sm font-medium hover:bg-muted',
              !isAdminSection && 'bg-muted',
            )}
          >
            TikTok Spy
          </Link>
          <Link
            href="/admin"
            className={cn(
              'rounded px-2 py-1.5 text-sm font-medium hover:bg-muted',
              isAdminSection && 'bg-muted',
            )}
          >
            Thống kê
          </Link>
        </nav>
      )}
      {!isAdminSection && <TaskHistorySidebar />}
    </div>
  );
}
