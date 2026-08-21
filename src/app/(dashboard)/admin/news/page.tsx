import { createClient } from "@/lib/supabase/server";
import { Newspaper } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CreateNewsDialog } from "./create-news-dialog";
import { NewsRow, type NewsItem } from "./news-row";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/empty-state";

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
      <PageHeader
        title="News"
        description={
          <>
            Manage news items. Pick which appear on the landing page from{" "}
            <a className="underline hover:text-foreground" href="/admin/content">
              Site content
            </a>
            .
          </>
        }
        action={<CreateNewsDialog />}
      />

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
                <TableCell colSpan={5} className="p-0">
                  <EmptyState icon={Newspaper} title="No news yet. Add the first item." />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
