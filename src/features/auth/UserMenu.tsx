import { signOut } from '@/server/auth';

export function UserMenu({ label }: { label: string }) {
  return (
    <form
      action={async () => {
        'use server';
        await signOut({ redirectTo: '/login' });
      }}
      className="flex items-center gap-3 text-sm"
    >
      <span className="truncate text-muted-foreground">{label}</span>
      <button type="submit" className="shrink-0 underline">
        Đăng xuất
      </button>
    </form>
  );
}
