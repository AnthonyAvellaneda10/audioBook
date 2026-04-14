import { File, FileImage, FileText, FileType, X } from 'lucide-react';
import { motion } from 'motion/react';

interface FilePreviewProps {
  file: File;
  onRemove: () => void;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function getFileIcon(type: string) {
  if (type === 'application/pdf') return FileType;
  if (type.startsWith('image/')) return FileImage;
  if (type === 'text/plain') return FileText;
  return File;
}

function getFileLabel(type: string, name: string): string {
  if (type === 'application/pdf') return 'PDF Document';
  if (
    type === 'application/msword' ||
    type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    return 'Word Document';
  }
  if (type === 'text/plain') return 'Text File';
  if (type.startsWith('image/')) return 'Image';
  return name.split('.').pop()?.toUpperCase() ?? 'File';
}

export function FilePreview({ file, onRemove }: FilePreviewProps) {
  const Icon = getFileIcon(file.type);
  const label = getFileLabel(file.type, file.name);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8, scale: 0.97 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="
        flex items-center gap-3 p-3.5 rounded-xl
        bg-muted/60 border border-border
      "
      role="region"
      aria-label={`Selected file: ${file.name}`}
    >
      {/* File icon */}
      <div
        className="
          shrink-0 flex items-center justify-center
          w-10 h-10 rounded-lg
          bg-primary/10 dark:bg-primary-foreground/10
        "
        aria-hidden="true"
      >
        <Icon size={18} className="text-primary dark:text-blue-400" />
      </div>

      {/* File info */}
      <div className="flex-1 min-w-0">
        <p
          className="text-sm text-foreground truncate"
          style={{ fontWeight: 500 }}
          title={file.name}
        >
          {file.name}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {label} · {formatBytes(file.size)}
        </p>
      </div>

      {/* Remove button */}
      <button
        onClick={onRemove}
        aria-label={`Remove ${file.name}`}
        className="
          shrink-0 flex items-center justify-center
          w-7 h-7 rounded-lg
          text-muted-foreground
          hover:bg-muted hover:text-foreground
          transition-colors duration-150
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
          cursor-pointer
        "
      >
        <X size={14} aria-hidden="true" />
      </button>
    </motion.div>
  );
}
