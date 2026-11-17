"use client";

import { RotateCw, ServerCrash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api-client";
import { EmptyState } from "./empty-state";

export function ErrorState({
  error,
  onRetry,
  title = "We couldn't load this",
  className,
}: {
  error: unknown;
  onRetry?: () => void;
  title?: string;
  className?: string;
}) {
  const message =
    error instanceof ApiError
      ? error.message
      : "Check your connection and try again. If it keeps happening, the API may be down.";
  return (
    <EmptyState
      icon={ServerCrash}
      title={title}
      description={message}
      className={className}
      action={
        onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry}>
            <RotateCw /> Try again
          </Button>
        )
      }
    />
  );
}
