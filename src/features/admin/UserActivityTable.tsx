'use client';

import { useState } from 'react';
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface UserActivityRow {
  id: string;
  email: string;
  username: string | null;
  role: 'USER' | 'ADMIN';
  totalSpyCount: number;
  successRate: number | null;
  lastSpyAt: string | null;
}

const columns: ColumnDef<UserActivityRow>[] = [
  {
    accessorKey: 'email',
    header: 'Người dùng',
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span>{row.original.username ?? row.original.email}</span>
        <span className="text-xs text-muted-foreground">{row.original.email}</span>
      </div>
    ),
  },
  { accessorKey: 'role', header: 'Vai trò' },
  { accessorKey: 'totalSpyCount', header: 'Tổng lượt spy' },
  {
    accessorKey: 'successRate',
    header: 'Tỷ lệ thành công',
    cell: ({ row }) =>
      row.original.successRate === null ? '—' : `${(row.original.successRate * 100).toFixed(1)}%`,
  },
  {
    accessorKey: 'lastSpyAt',
    header: 'Lần spy gần nhất',
    cell: ({ row }) =>
      row.original.lastSpyAt ? new Date(row.original.lastSpyAt).toLocaleString('vi-VN') : '—',
  },
];

export function UserActivityTable({ users }: { users: UserActivityRow[] }) {
  const [globalFilter, setGlobalFilter] = useState('');

  const table = useReactTable({
    data: users,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hoạt động người dùng</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Input
          placeholder="Tìm theo email/username..."
          value={globalFilter}
          onChange={(event) => setGlobalFilter(event.target.value)}
          className="max-w-sm"
        />
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      onClick={header.column.getToggleSortingHandler()}
                      className={header.column.getCanSort() ? 'cursor-pointer select-none whitespace-nowrap' : 'whitespace-nowrap'}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {{ asc: ' ↑', desc: ' ↓' }[header.column.getIsSorted() as string] ?? ''}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
