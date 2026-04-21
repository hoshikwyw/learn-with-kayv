import Link from "next/link";
import { GraduationCap } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="mx-auto flex h-16 w-full max-w-7xl items-center px-6">
        <Link href="/" className="flex items-center gap-2">
          <GraduationCap className="size-6 text-primary" />
          <span className="text-lg font-semibold tracking-tight">
            Learn-with-kayv
          </span>
        </Link>
      </header>
      <div className="flex flex-1 items-center justify-center px-6 py-10">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
