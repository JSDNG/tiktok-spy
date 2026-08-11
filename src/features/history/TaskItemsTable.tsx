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
        className="h-20 w-20 shrink-0 rounded-md object-cover"
      />
    ),
  },
  {
    accessorKey: 'title',
    header: 'Tên sản phẩm',
    cell: ({ row }) => (
      <span className="line-clamp-2 max-w-xs" title={row.original.title}>
        {row.original.title}
      </span>
    ),
  },
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
                  <TableCell
                    key={cell.id}
                    className={cell.column.id === 'title' ? 'whitespace-normal' : undefined}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
