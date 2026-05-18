"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Profile } from "@/types/db";
import { AddUserDialog } from "./add-user-dialog";
import { BlockToggleButton } from "./user-row-actions";

const TABS = [
  { key: "admin", label: "Admins" },
  { key: "teacher", label: "Teachers" },
  { key: "student", label: "Students" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

function UserTable({
  users,
  currentUserId,
}: {
  users: Profile[];
  currentUserId: string;
}) {
  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead className="w-20 text-center">Details</TableHead>
            <TableHead className="w-24 text-center">Block</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((u) => (
            <TableRow key={u.id}>
              <TableCell className="font-medium">
                <span className="flex items-center gap-2">
                  {u.full_name ?? "—"}
                  {u.blocked === true && (
                    <Badge variant="destructive" className="text-xs">
                      Blocked
                    </Badge>
                  )}
                </span>
              </TableCell>
              <TableCell className="text-muted-foreground">{u.email}</TableCell>
              <TableCell className="text-muted-foreground">
                {new Date(u.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-center">
                <Button
                  variant="ghost"
                  size="sm"
                  render={<Link href={`/admin/users/${u.id}`} />}
                >
                  View
                </Button>
              </TableCell>
              <TableCell className="text-center">
                {u.id !== currentUserId && (
                  <BlockToggleButton userId={u.id} blocked={u.blocked ?? false} />
                )}
              </TableCell>
            </TableRow>
          ))}
          {users.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={5}
                className="py-10 text-center text-sm text-muted-foreground"
              >
                No users in this group yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

export function UsersPageClient({
  admins,
  teachers,
  students,
  currentUserId,
}: {
  admins: Profile[];
  teachers: Profile[];
  students: Profile[];
  currentUserId: string;
}) {
  const [active, setActive] = useState<TabKey>("admin");

  const counts: Record<TabKey, number> = {
    admin: admins.length,
    teacher: teachers.length,
    student: students.length,
  };

  const data: Record<TabKey, Profile[]> = {
    admin: admins,
    teacher: teachers,
    student: students,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between border-b">
        <nav className="-mb-px flex gap-1 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setActive(t.key)}
              className={cn(
                "flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-2 text-sm font-medium transition",
                active === t.key
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {t.label}
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-xs font-medium",
                  active === t.key
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {counts[t.key]}
              </span>
            </button>
          ))}
        </nav>

        {active !== "student" && (
          <div className="pb-2">
            <AddUserDialog />
          </div>
        )}
      </div>

      <UserTable users={data[active]} currentUserId={currentUserId} />
    </div>
  );
}
