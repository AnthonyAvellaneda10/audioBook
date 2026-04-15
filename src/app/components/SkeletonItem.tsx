/**
 * SkeletonItem — animated placeholder matching the ProcessingItem card layout.
 * Shown while the initial history is loading.
 */
export function SkeletonItem() {
  return (
    <li
      className="rounded-xl border border-border bg-card overflow-hidden shadow-sm"
      aria-hidden="true"
    >
      {/* shimmer top bar */}
      <div className="h-0.5 bg-muted overflow-hidden">
        <div className="h-full w-1/3 bg-border/60 animate-pulse rounded-full" />
      </div>

      <div className="p-4 flex items-start gap-3">
        {/* icon placeholder */}
        <div className="shrink-0 w-10 h-10 rounded-lg bg-muted animate-pulse" />

        <div className="flex-1 space-y-2">
          {/* title line */}
          <div className="h-3.5 w-2/3 rounded bg-muted animate-pulse" />
          {/* subtitle line */}
          <div className="h-2.5 w-1/3 rounded bg-muted/70 animate-pulse" />
        </div>

        {/* badge placeholder */}
        <div className="shrink-0 h-6 w-20 rounded-full bg-muted animate-pulse" />
      </div>
    </li>
  );
}
