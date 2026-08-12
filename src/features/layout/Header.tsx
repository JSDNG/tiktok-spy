import Link from 'next/link';
import { UserMenu } from '@/features/auth/UserMenu';

export function Header({ userLabel, isAdmin }: { userLabel: string; isAdmin: boolean }) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b px-4">
      <div className="flex items-center gap-4">
        <span className="font-semibold">TikTok Spy</span>
        {isAdmin && (
          <Link href="/admin" className="text-sm text-muted-foreground hover:text-foreground hover:underline">
            Quản trị
          </Link>
        )}
      </div>
      <UserMenu label={userLabel} />
    </header>
  );
}
