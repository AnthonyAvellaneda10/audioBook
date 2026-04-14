import { CheckCircle2, Clock, Loader2, XCircle } from 'lucide-react';
import type { ElementType } from 'react';
import { UploadStatus } from '../../types';

interface StatusBadgeProps {
  status: UploadStatus;
  progress?: number;
}

const STATUS_CONFIG = {
  idle: {
    label: 'Idle',
    icon: Clock,
    className: 'bg-muted text-muted-foreground',
    iconClass: '',
    spin: false,
  },
  uploading: {
    label: 'Uploading',
    icon: Loader2,
    className: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    iconClass: 'text-blue-500 dark:text-blue-400',
    spin: true,
  },
  processing: {
    label: 'Processing',
    icon: Loader2,
    className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    iconClass: 'text-amber-500 dark:text-amber-400',
    spin: true,
  },
  completed: {
    label: 'Completed',
    icon: CheckCircle2,
    className: 'bg-green-500/10 text-green-600 dark:text-green-400',
    iconClass: 'text-green-500 dark:text-green-400',
    spin: false,
  },
  error: {
    label: 'Error',
    icon: XCircle,
    className: 'bg-destructive/10 text-destructive dark:text-destructive-foreground',
    iconClass: 'text-destructive dark:text-destructive-foreground',
    spin: false,
  },
} satisfies Record<UploadStatus, {
  label: string;
  icon: ElementType;
  className: string;
  iconClass: string;
  spin: boolean;
}>;

export function StatusBadge({ status, progress }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  const displayLabel =
    status === 'uploading' && progress !== undefined
      ? `Uploading ${progress}%`
      : config.label;

  return (
    <span
      role="status"
      aria-label={displayLabel}
      className={`
        inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs
        ${config.className}
      `}
      style={{ fontWeight: 500 }}
    >
      <Icon
        size={12}
        aria-hidden="true"
        className={`${config.iconClass} ${config.spin ? 'animate-spin' : ''}`}
      />
      {displayLabel}
    </span>
  );
}