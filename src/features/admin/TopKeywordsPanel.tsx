import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface TopKeywordsPanelProps {
  keywords: { keyword: string; spyCount: number; totalItemsFound: number }[];
}

export function TopKeywordsPanel({ keywords }: TopKeywordsPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Từ khoá nổi trội</CardTitle>
      </CardHeader>
      <CardContent>
        {keywords.length === 0 ? (
          <p className="text-sm text-muted-foreground">Chưa có dữ liệu.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Từ khoá</TableHead>
                <TableHead>Số lần spy</TableHead>
                <TableHead>Tổng sản phẩm thu được</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {keywords.map((row) => (
                <TableRow key={row.keyword}>
                  <TableCell className="max-w-xs truncate" title={row.keyword}>
                    {row.keyword}
                  </TableCell>
                  <TableCell>{row.spyCount}</TableCell>
                  <TableCell>{row.totalItemsFound}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
