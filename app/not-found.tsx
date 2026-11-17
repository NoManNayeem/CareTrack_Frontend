import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 px-6 text-center">
      <Logo />
      <div className="space-y-2">
        <p className="font-mono text-xs text-muted-foreground">404</p>
        <h1 className="text-xl font-semibold tracking-tight">This page doesn’t exist</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          The link may be outdated, or the record may have been removed.
        </p>
      </div>
      <Button asChild variant="outline">
        <Link href="/dashboard">Back to dashboard</Link>
      </Button>
    </main>
  );
}
