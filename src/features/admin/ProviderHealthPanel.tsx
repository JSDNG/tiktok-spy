import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface ProviderHealthPanelProps {
  health: {
    totalRequests: number;
    errorRate: number | null;
    avgDurationMs: number | null;
    statusBreakdown: { httpStatus: number; count: number }[];
  };
}

export function ProviderHealthPanel({ health }: ProviderHealthPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sức khoẻ Provider</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <div className="text-xs text-muted-foreground">Tổng request</div>
            <div className="text-lg font-medium">{health.totalRequests}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Tỷ lệ lỗi</div>
            <div className="text-lg font-medium">
              {health.errorRate === null ? '—' : `${(health.errorRate * 100).toFixed(1)}%`}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Thời gian phản hồi TB</div>
            <div className="text-lg font-medium">
              {health.avgDurationMs === null ? '—' : `${Math.round(health.avgDurationMs)} ms`}
            </div>
          </div>
        </div>
        {health.statusBreakdown.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>HTTP Status</TableHead>
                <TableHead>Số lượng</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {health.statusBreakdown.map((row) => (
                <TableRow key={row.httpStatus}>
                  <TableCell>{row.httpStatus}</TableCell>
                  <TableCell>{row.count}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
