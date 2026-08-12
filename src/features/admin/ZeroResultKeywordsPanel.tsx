import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface ZeroResultKeywordsPanelProps {
  items: { id: string; keyword: string; createdAt: string }[];
}

export function ZeroResultKeywordsPanel({ items }: ZeroResultKeywordsPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Từ khoá không ra kết quả</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">Không có từ khoá nào 0 kết quả.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Từ khoá</TableHead>
                <TableHead>Thời điểm</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="max-w-xs truncate" title={item.keyword}>
                    {item.keyword}
                  </TableCell>
                  <TableCell>{new Date(item.createdAt).toLocaleString('vi-VN')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
