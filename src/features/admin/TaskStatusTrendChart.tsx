'use client';

import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const STATUSES = ['PENDING', 'RUNNING', 'SUCCEEDED', 'FAILED', 'TIMEOUT'] as const;

const STATUS_COLORS: Record<(typeof STATUSES)[number], string> = {
  PENDING: '#eab308',
  RUNNING: '#3b82f6',
  SUCCEEDED: '#22c55e',
  FAILED: '#ef4444',
  TIMEOUT: '#f97316',
};

interface TaskStatusTrendChartProps {
  trend: { day: string; status: string; count: number }[];
}

export function TaskStatusTrendChart({ trend }: TaskStatusTrendChartProps) {
  const byDay = new Map<string, Record<string, number>>();
  for (const row of trend) {
    const day = row.day.slice(0, 10);
    const entry = byDay.get(day) ?? {};
    entry[row.status] = row.count;
    byDay.set(day, entry);
  }
  const data = [...byDay.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([day, counts]) => ({ day, ...counts }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Xu hướng lượt spy theo trạng thái (30 ngày)</CardTitle>
      </CardHeader>
      <CardContent className="h-72">
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground">Chưa có dữ liệu.</p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" fontSize={12} />
              <YAxis allowDecimals={false} fontSize={12} />
              <Tooltip />
              <Legend />
              {STATUSES.map((status) => (
                <Area
                  key={status}
                  type="monotone"
                  dataKey={status}
                  stackId="1"
                  name={status}
                  stroke={STATUS_COLORS[status]}
                  fill={STATUS_COLORS[status]}
                  fillOpacity={0.5}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
