import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Profile } from "@/types/db";

export const metadata = { title: "Users" };

export default async function AdminUsersPage() {
  const supabase = await createClient();
  const { data: users } = await supabase
    .from("profiles")
    .select("id, email, full_name, avatar_url, role, created_at, updated_at")
    .order("created_at", { ascending: false })
    .returns<Profile[]>();

  return (
    <>
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Users</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Everyone enrolled or working in the school.
        </p>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="text-right">Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(users ?? []).map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-medium">
                  {u.full_name ?? "—"}
                </TableCell>
                <TableCell className="text-muted-foreground">{u.email}</TableCell>
                <TableCell>
                  <Badge variant={u.role === "admin" ? "default" : "secondary"}>
                    {u.role}
                  </Badge>
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {new Date(u.created_at).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
            {(!users || users.length === 0) && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  No users yet. Run the SQL migration and sign up to see yourself here.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
