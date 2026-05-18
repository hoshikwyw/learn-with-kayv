import { createClient } from "@/lib/supabase/server";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CreateNewsDialog } from "./create-news-dialog";
import { NewsRow, type NewsItem } from "./news-row";

export const metadata = { title: "News" };

export default async function AdminNewsPage() {
  const supabase = await createClient();
  const { data: items } = await supabase
    .from("news_items")
    .select("id, title, body, published_on, image_url")
    .order("published_on", { ascending: false })
    .returns<NewsItem[]>();

  const list = items ?? [];

  return (
    <>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">News</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage news items. Pick which appear on the landing page from{" "}
            <a className="underline hover:text-foreground" href="/admin/content">
              Site content
            </a>
            .
          </p>
        </div>
        <CreateNewsDialog />
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Image</TableHead>
              <TableHead className="w-32">Date</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Body</TableHead>
              <TableHead className="w-32 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.map((n) => (
              <NewsRow key={n.id} item={n} />
            ))}
            {list.length === 0 && (
              <TableRow>
                <td
                  colSpan={5}
                  className="py-16 text-center text-sm text-muted-foreground"
                >
                  No news yet. Add the first item.
                </td>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
