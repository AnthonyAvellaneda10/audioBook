import { AnimatePresence, motion } from 'motion/react';
import {
  ChevronDown,
  ChevronUp,
  File,
  FileImage,
  FileText,
  FileType,
  Headphones,
  Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { AudiobookItem } from '../../types';
import { AudioPlayer } from './AudioPlayer';
import { StatusBadge } from './StatusBadge';

interface ProcessingItemProps {
  item: AudiobookItem;
  onRemove: (id: string) => void;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function formatTimestamp(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

function getFileIcon(type: string) {
  if (type === 'application/pdf') return FileType;
  if (type.startsWith('image/')) return FileImage;
  if (type === 'text/plain') return FileText;
  return File;
}

export function ProcessingItem({ item, onRemove }: ProcessingItemProps) {
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const Icon = getFileIcon(item.fileType);
  const isActive =
    item.status === 'uploading' ||
    item.status === 'processing' ||
    item.status === 'processing_text' ||
    item.status === 'generating_audio';

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -16, scale: 0.97 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="
        rounded-xl border border-border
        bg-card
        overflow-hidden
        shadow-sm hover:shadow-md
        transition-shadow duration-200
      "
      aria-label={`Audiobook item: ${item.fileName}, status: ${item.status}`}
    >
      {/* Upload progress bar (uploading state only) */}
      {item.status === 'uploading' && (
        <div
          className="h-0.5 bg-muted"
          role="progressbar"
          aria-label={`Upload progress: ${item.progress}%`}
          aria-valuenow={item.progress}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <motion.div
            className="h-full bg-blue-500"
            style={{ width: `${item.progress}%` }}
            transition={{ ease: 'linear' }}
          />
        </div>
      )}

      {/* Processing shimmer (processing state) */}
      {(item.status === 'processing' ||
        item.status === 'processing_text' ||
        item.status === 'generating_audio') && (
        <div className="h-0.5 bg-muted overflow-hidden" aria-hidden="true">
          <motion.div
            className="h-full w-1/3 bg-amber-400/70 rounded-full"
            animate={{ x: ['-100%', '400%'] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      )}

      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* File icon */}
          <div
            className="
              shrink-0 flex items-center justify-center
              w-10 h-10 rounded-lg
              bg-muted
            "
            aria-hidden="true"
          >
            <Icon size={18} className="text-muted-foreground" />
          </div>

          {/* Main info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p
                  className="text-sm text-foreground truncate"
                  style={{ fontWeight: 500 }}
                  title={item.fileName}
                >
                  {item.fileName}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formatBytes(item.fileSize)} · {formatTimestamp(item.timestamp)}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1.5 shrink-0">
                <StatusBadge status={item.status} progress={item.progress} />

                {!isActive && (
                  <button
                    onClick={() => onRemove(item.id)}
                    aria-label={`Remove ${item.fileName}`}
                    className="
                      flex items-center justify-center
                      w-7 h-7 rounded-lg
                      text-muted-foreground
                      hover:text-destructive hover:bg-destructive/10
                      transition-colors duration-150
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
                      cursor-pointer
                    "
                  >
                    <Trash2 size={13} aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>

            {/* Error message */}
            {item.status === 'error' && item.error && (
              <p
                className="mt-2 text-xs text-destructive dark:text-destructive-foreground"
                role="alert"
              >
                {item.error}
              </p>
            )}

            {/* Play Audio button */}
            {item.status === 'completed' && item.audioUrl && (
              <div className="mt-3">
                <button
                  onClick={() => setIsPlayerOpen((prev) => !prev)}
                  aria-expanded={isPlayerOpen}
                  aria-controls={`player-${item.id}`}
                  aria-label={isPlayerOpen ? 'Hide audio player' : `Play audiobook: ${item.fileName}`}
                  className="
                    inline-flex items-center gap-2 px-3 py-1.5 rounded-lg
                    bg-primary/8 dark:bg-blue-400/10
                    text-primary dark:text-blue-400
                    text-xs
                    hover:bg-primary/15 dark:hover:bg-blue-400/20
                    transition-colors duration-150
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
                    cursor-pointer
                  "
                  style={{ fontWeight: 500 }}
                >
                  <Headphones size={13} aria-hidden="true" />
                  {isPlayerOpen ? 'Hide Player' : 'Play Audio'}
                  {isPlayerOpen ? (
                    <ChevronUp size={12} aria-hidden="true" />
                  ) : (
                    <ChevronDown size={12} aria-hidden="true" />
                  )}
                </button>

                <AnimatePresence>
                  {isPlayerOpen && (
                    <motion.div
                      id={`player-${item.id}`}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25, ease: 'easeOut' }}
                    >
                      <AudioPlayer audioUrl={item.audioUrl} fileName={item.fileName} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.li>
  );
}