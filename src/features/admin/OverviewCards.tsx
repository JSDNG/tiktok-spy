import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface OverviewCardsProps {
  overview: {
    totalUsers: number;
    totalTasks: number;
    successRate: number | null;
  };
}

export function OverviewCards({ overview }: OverviewCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Người dùng</CardTitle>
        </CardHeader>
        <CardContent className="text-2xl font-semibold">{overview.totalUsers}</CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Tổng lượt spy</CardTitle>
        </CardHeader>
        <CardContent className="text-2xl font-semibold">{overview.totalTasks}</CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Tỷ lệ thành công</CardTitle>
        </CardHeader>
        <CardContent className="text-2xl font-semibold">
          {overview.successRate === null ? '—' : `${(overview.successRate * 100).toFixed(1)}%`}
        </CardContent>
      </Card>
    </div>
  );
}
