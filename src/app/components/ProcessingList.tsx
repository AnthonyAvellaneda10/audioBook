import { AnimatePresence, motion } from 'motion/react';
import { BookOpen, InboxIcon } from 'lucide-react';
import { AudiobookItem } from '../../types';
import { ProcessingItem } from './ProcessingItem';

interface ProcessingListProps {
  items: AudiobookItem[];
  onRemove: (id: string) => void;
}

export function ProcessingList({ items, onRemove }: ProcessingListProps) {
  if (items.length === 0) return null;

  const completedCount = items.filter((i) => i.status === 'completed').length;
  const activeCount = items.filter(
    (i) => i.status === 'uploading' || i.status === 'processing'
  ).length;

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
      >
        <AnimatePresence initial={false}>
          {items.map((item) => (
            <ProcessingItem key={item.id} item={item} onRemove={onRemove} />
          ))}
        </AnimatePresence>
      </ul>

      {/* Empty state (should not appear since we check items.length above, kept for completeness) */}
      {items.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center py-12 text-muted-foreground gap-3"
        >
          <InboxIcon size={32} className="opacity-40" aria-hidden="true" />
          <p className="text-sm">No files uploaded yet</p>
        </motion.div>
      )}
    </section>
  );
}
