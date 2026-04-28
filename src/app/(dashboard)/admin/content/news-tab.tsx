"use client";

import Link from "next/link";
import { useTransition } from "react";
import toast from "react-hot-toast";
import { ArrowDown, ArrowUp, ExternalLink, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  addFeaturedNewsAction,
  moveFeaturedNewsAction,
  removeFeaturedNewsAction,
} from "./actions";

export type NewsItem = {
  id: string;
  title: string;
  body: string;
  published_on: string;
};

export function NewsTab({
  featured,
  available,
}: {
  featured: NewsItem[];
  available: NewsItem[];
}) {
  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">
              Featured on landing ({featured.length}/5)
            </h3>
            <p className="text-sm text-muted-foreground">
              These appear in the News section, in this order.
            </p>
          </div>
          <Button variant="ghost" size="sm" render={<Link href="/admin/news" />}>
            <ExternalLink className="size-4" />
            Manage news
          </Button>
        </div>

        {featured.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            None featured yet — pick from the list below.
          </p>
        ) : (
          <ul className="space-y-2">
            {featured.map((n, idx) => (
              <li
                key={n.id}
                className="flex items-center gap-3 rounded-lg border bg-card p-3"
              >
                <span className="text-sm font-mono text-muted-foreground">
                  {idx + 1}
                </span>
                <div className="flex-1">
                  <p className="font-medium">{n.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(n.published_on).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-1">
                  <form action={moveFeaturedNewsAction}>
                    <input type="hidden" name="id" value={n.id} />
                    <input type="hidden" name="direction" value="up" />
                    <Button type="submit" size="icon-sm" variant="ghost" disabled={idx === 0}>
                      <ArrowUp className="size-4" />
                    </Button>
                  </form>
                  <form action={moveFeaturedNewsAction}>
                    <input type="hidden" name="id" value={n.id} />
                    <input type="hidden" name="direction" value="down" />
                    <Button type="submit" size="icon-sm" variant="ghost" disabled={idx === featured.length - 1}>
                      <ArrowDown className="size-4" />
                    </Button>
                  </form>
                  <form action={removeFeaturedNewsAction}>
                    <input type="hidden" name="id" value={n.id} />
                    <Button type="submit" size="icon-sm" variant="ghost">
                      <X className="size-4" />
                    </Button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <div>
          <h3 className="text-lg font-semibold">Available news</h3>
          <p className="text-sm text-muted-foreground">
            Click + to feature on the landing page.
          </p>
        </div>

        {available.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No more news to feature.{" "}
            <Link href="/admin/news" className="underline">
              Add some at /admin/news
            </Link>
            .
          </p>
        ) : (
          <ul className="space-y-2">
            {available.map((n) => (
              <li
                key={n.id}
                className="flex items-center gap-3 rounded-lg border p-3"
              >
                <div className="flex-1">
                  <p className="font-medium">{n.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(n.published_on).toLocaleDateString()}
                  </p>
                </div>
                <FeatureNewsButton id={n.id} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function FeatureNewsButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();
  function handleClick() {
    const fd = new FormData();
    fd.append("id", id);
    startTransition(async () => {
      const result = await addFeaturedNewsAction(fd);
      if (result?.error) toast.error(result.error);
      else if (result?.success) toast.success(result.success);
    });
  }
  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      onClick={handleClick}
      disabled={pending}
    >
      <Plus className="size-4" />
      Feature
    </Button>
  );
}
