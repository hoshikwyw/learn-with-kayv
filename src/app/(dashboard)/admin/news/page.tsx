import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CreateNewsForm } from "./create-news-form";
import { NewsRow, type NewsItem } from "./news-row";

export const metadata = { title: "News" };

export default async function AdminNewsPage() {
  const supabase = await createClient();
  const { data: items } = await supabase
    .from("news_items")
    .select("id, title, body, published_on")
    .order("published_on", { ascending: false })
    .returns<NewsItem[]>();

  return (
    <>
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">News</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage news items. Pick which 5 appear on the landing page from{" "}
          <a className="underline" href="/admin/content">
            /admin/content
          </a>
          .
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add news item</CardTitle>
          <CardDescription>
            New items appear at the top of the table and are immediately
            available to feature.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CreateNewsForm />
        </CardContent>
      </Card>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-32">Date</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Body</TableHead>
              <TableHead className="w-32 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(items ?? []).map((n) => (
              <NewsRow key={n.id} item={n} />
            ))}
            {(!items || items.length === 0) && (
              <TableRow>
                <td colSpan={4} className="p-6 text-center text-sm text-muted-foreground">
                  No news yet. Add the first item above.
                </td>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
