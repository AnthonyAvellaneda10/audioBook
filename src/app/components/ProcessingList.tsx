import { AnimatePresence, motion } from 'motion/react';
import { BookOpen, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { AudiobookItem, PaginationMetadata } from '../../types';
import { ProcessingItem } from './ProcessingItem';
import { SkeletonItem } from './SkeletonItem';

interface ProcessingListProps {
  /** null = initial loading, [] = loaded but empty, [...] = has data */
  items: AudiobookItem[] | null;
  onRemove: (id: string) => void;
  nextPage?: PaginationMetadata;
  loadingMore?: boolean;
  onLoadMore?: () => void;
}

const SKELETON_COUNT = 3;

export function ProcessingList({
  items,
  onRemove,
  nextPage,
  loadingMore = false,
  onLoadMore,
}: ProcessingListProps) {
  const isInitialLoading = items === null;
  const isEmpty = !isInitialLoading && items.length === 0;

  // Don't render anything if the initial load is done and there's nothing
  if (isEmpty) return null;

  const completedCount = (items ?? []).filter((i) => i.status === 'completed').length;
  const activeCount    = (items ?? []).filter(
    (i) =>
      i.status === 'uploading' ||
      i.status === 'processing' ||
      i.status === 'processing_text' ||
      i.status === 'generating_audio'
  ).length;

  const hasNextPage  = !!nextPage?.startKey;
  const hasPrevPage  = false; // We only append, so previous is always in the existing list

  return (
    <section
      aria-labelledby="processing-list-heading"
      className="w-full max-w-2xl mx-auto px-4 sm:px-6 pb-16"
    >
      {/* Divider */}
      <div className="flex items-center gap-4 mb-6" aria-hidden="true">
        <div className="flex-1 h-px bg-border" />
        <div className="flex items-center gap-2 text-muted-foreground">
          <BookOpen size={14} />
        </div>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* Heading + stats */}
      <div className="flex items-center justify-between mb-4">
        <h2
          id="processing-list-heading"
          className="text-base text-foreground"
          style={{ fontWeight: 600 }}
        >
          Your Audiobooks
        </h2>

        <div className="flex items-center gap-2" aria-live="polite" aria-atomic="true">
          {activeCount > 0 && (
            <span
              className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400"
              style={{ fontWeight: 500 }}
            >
              {activeCount} processing
            </span>
          )}
          {completedCount > 0 && (
            <span
              className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 dark:text-green-400"
              style={{ fontWeight: 500 }}
            >
              {completedCount} ready
            </span>
          )}
        </div>
      </div>

      {/* List */}
      <ul
        className="space-y-3"
        aria-label="Uploaded audiobook files"
        aria-live="polite"
        aria-relevant="additions removals"
        aria-busy={isInitialLoading}
      >
        {isInitialLoading ? (
          /* Skeleton screens during initial load */
          Array.from({ length: SKELETON_COUNT }).map((_, i) => (
            <SkeletonItem key={`skeleton-${i}`} />
          ))
        ) : (
          <AnimatePresence initial={false}>
            {items.map((item) => (
              <ProcessingItem key={item.id} item={item} onRemove={onRemove} />
            ))}
          </AnimatePresence>
        )}
      </ul>

      {/* Pagination controls */}
      {!isInitialLoading && (hasNextPage || hasPrevPage) && (
        <div className="flex items-center justify-center gap-3 mt-6">
          {/* Previous — always disabled since we append-only */}
          <button
            disabled
            aria-label="Previous page"
            className="
              inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm
              border border-border text-muted-foreground
              opacity-40 cursor-not-allowed
            "
            style={{ fontWeight: 500 }}
          >
            <ChevronLeft size={15} aria-hidden="true" />
            Previous
          </button>

          {/* Load More */}
          <button
            onClick={onLoadMore}
            disabled={loadingMore || !hasNextPage}
            aria-label="Load more audiobooks"
            className="
              inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm
              border border-border
              transition-all duration-150
              hover:bg-muted/50
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
              disabled:opacity-40 disabled:cursor-not-allowed
              cursor-pointer
            "
            style={{ fontWeight: 500 }}
          >
            {loadingMore ? (
              <>
                <Loader2 size={14} className="animate-spin" aria-hidden="true" />
                Loading…
              </>
            ) : (
              <>
                Next
                <ChevronRight size={15} aria-hidden="true" />
              </>
            )}
          </button>
        </div>
      )}
    </section>
  );
}
