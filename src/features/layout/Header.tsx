import { UserMenu } from '@/features/auth/UserMenu';

export function Header({ userLabel }: { userLabel: string }) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b px-4">
      <span className="font-semibold">TikTok Spy</span>
      <UserMenu label={userLabel} />
    </header>
  );
}
