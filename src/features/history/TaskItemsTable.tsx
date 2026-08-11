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
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface SpyTaskItemRow {
  id: string;
  imageUrl: string;
  title: string;
  price: number;
  currency: string;
  soldCount: number | null;
  rating: number | null;
}

const columns: ColumnDef<SpyTaskItemRow>[] = [
  {
    accessorKey: 'imageUrl',
    header: 'Ảnh',
    enableSorting: false,
    cell: ({ row }) => (
      <img
        src={row.original.imageUrl}
        alt={row.original.title}
        className="h-12 w-12 rounded object-cover"
      />
    ),
  },
  { accessorKey: 'title', header: 'Tên sản phẩm' },
  {
    accessorKey: 'price',
    header: 'Giá',
    cell: ({ row }) => `${(row.original.price / 100).toFixed(2)} ${row.original.currency}`,
  },
  { accessorKey: 'soldCount', header: 'Đã bán' },
  { accessorKey: 'rating', header: 'Đánh giá' },
];

export function TaskItemsTable({ items }: { items: SpyTaskItemRow[] }) {
  const [globalFilter, setGlobalFilter] = useState('');

  const table = useReactTable({
    data: items,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="flex flex-col gap-3">
      <Input
        placeholder="Tìm theo tên sản phẩm..."
        value={globalFilter}
        onChange={(event) => setGlobalFilter(event.target.value)}
        className="max-w-sm"
      />
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  onClick={header.column.getToggleSortingHandler()}
                  className={header.column.getCanSort() ? 'cursor-pointer select-none' : ''}
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
  );
}
