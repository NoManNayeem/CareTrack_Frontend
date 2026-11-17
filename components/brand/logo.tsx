import { cn } from "@/lib/utils";

/** CareTrack mark: an open ring (care) with a tracked point. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={cn("size-6", className)}>
      <rect width="24" height="24" rx="6" className="fill-brand" />
      <path
        d="M16.6 8.2A6 6 0 1 0 16.6 15.8"
        fill="none"
        strokeWidth="2.2"
        strokeLinecap="round"
        className="stroke-primary-foreground"
      />
      <circle cx="16.9" cy="12" r="1.7" className="fill-primary-foreground" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark />
      <span className="text-[15px] font-semibold tracking-[-0.01em]">CareTrack</span>
    </span>
  );
}
