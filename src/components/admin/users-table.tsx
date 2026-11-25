"use client";

import { useMemo, useState, useTransition } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { Search } from "lucide-react";
import type { Profile, UserRole } from "@/types/database";
import { adminUpdateUserRoleAction } from "@/features/admin/actions";

export function UsersTable({
  initialUsers,
  currentAdminId,
}: {
  initialUsers: Profile[];
  currentAdminId: string;
}) {
  const [users, setUsers] = useState<Profile[]>(initialUsers);
  const [globalFilter, setGlobalFilter] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    setError(null);
    startTransition(async () => {
      const res = await adminUpdateUserRoleAction({ userId, role: newRole });
      if (res?.error) {
        setError(res.error);
        return;
      }
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
    });
  };

  const columns = useMemo<ColumnDef<Profile>[]>(
    () => [
      {
        accessorKey: "full_name",
        header: "Аты-жөні",
        cell: ({ row }) => (
          <div className="font-medium text-foreground">
            {row.original.full_name || "—"}
          </div>
        ),
      },
      {
        accessorKey: "email",
        header: "Электрондық пошта",
        cell: ({ row }) => (
          <div className="text-muted-foreground">{row.original.email}</div>
        ),
      },
      {
        accessorKey: "grade",
        header: "Сынып",
        cell: ({ row }) => (
          <span>
            {row.original.grade ? `${row.original.grade}-сынып` : "—"}
          </span>
        ),
      },
      {
        accessorKey: "role",
        header: "Рөлі",
        cell: ({ row }) => {
          const user = row.original;
          const isSelf = user.id === currentAdminId;
          return (
            <select
              value={user.role}
              disabled={isSelf || isPending}
              onChange={(e) =>
                handleRoleChange(user.id, e.target.value as UserRole)
              }
              className="rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs font-semibold text-foreground outline-none focus:border-primary disabled:opacity-60"
            >
              <option value="student">student (Оқушы)</option>
              <option value="teacher">teacher (Мұғалім)</option>
              <option value="admin">admin (Әкімші)</option>
            </select>
          );
        },
      },
    ],
    [currentAdminId, isPending]
  );

  const table = useReactTable({
    data: users,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={globalFilter ?? ""}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="Аты немесе email бойынша іздеу..."
          className="w-full rounded-xl border border-input bg-card py-2 pl-10 pr-4 text-sm text-foreground outline-none focus:border-primary"
        />
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-xs">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className="border-b border-border bg-muted/50">
                {hg.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-border/60 last:border-none hover:bg-muted/30"
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3.5">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
