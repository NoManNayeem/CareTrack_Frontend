import type { Metadata } from "next";
import { Suspense } from "react";
import { Logo } from "@/components/brand/logo";
import { Skeleton } from "@/components/ui/skeleton";
import { LoginForm } from "@/features/auth/login-form";
import { LoginShowcase } from "./showcase";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <main className="grid min-h-svh lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <section className="flex flex-col px-6 py-8 sm:px-10">
        <Logo />
        <div className="flex flex-1 items-center justify-center py-12">
          <div className="w-full max-w-[360px] animate-in duration-300 fade-in slide-in-from-bottom-1">
            <div className="mb-7 space-y-1.5">
              <h1 className="text-[22px] font-semibold tracking-[-0.015em]">Sign in to CareTrack</h1>
              <p className="text-sm text-muted-foreground">
                Administrator access only. Your session is encrypted and expires after 8 hours.
              </p>
            </div>
            <Suspense fallback={<Skeleton className="h-64 w-full" />}>
              <LoginForm />
            </Suspense>
          </div>
        </div>
        <p className="text-xs text-subtle-foreground">CareTrack · For authorised clinical staff only</p>
      </section>
      <LoginShowcase />
    </main>
  );
}
