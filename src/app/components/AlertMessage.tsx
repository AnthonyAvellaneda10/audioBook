import { AlertCircle, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type AlertVariant = 'error' | 'info';

interface AlertMessageProps {
  message: string;
  variant?: AlertVariant;
  onDismiss?: () => void;
  id?: string;
}

const CONFIG = {
  error: {
    icon: AlertCircle,
    containerClass:
      'bg-destructive/8 border-destructive/20 text-destructive dark:text-destructive-foreground',
    iconClass: 'text-destructive dark:text-destructive-foreground',
    role: 'alert' as const,
    ariaLive: 'assertive' as const,
  },
  info: {
    icon: Info,
    containerClass:
      'bg-primary/8 border-primary/20 text-primary dark:text-blue-300',
    iconClass: 'text-primary dark:text-blue-400',
    role: 'status' as const,
    ariaLive: 'polite' as const,
  },
};

export function AlertMessage({
  message,
  variant = 'error',
  onDismiss,
  id,
}: AlertMessageProps) {
  const { icon: Icon, containerClass, iconClass, role, ariaLive } = CONFIG[variant];

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          key={message}
          initial={{ opacity: 0, y: -8, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.97 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          role={role}
          aria-live={ariaLive}
          aria-atomic="true"
          id={id}
          className={`
            flex items-start gap-3 p-4 rounded-xl border
            ${containerClass}
          `}
        >
          <Icon size={16} aria-hidden="true" className={`mt-0.5 shrink-0 ${iconClass}`} />
          <p className="text-sm flex-1 leading-relaxed">{message}</p>
          {onDismiss && (
            <button
              onClick={onDismiss}
              aria-label="Dismiss alert"
              className="
                shrink-0 rounded-md p-0.5
                opacity-60 hover:opacity-100
                transition-opacity
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
                cursor-pointer
              "
            >
              <X size={14} aria-hidden="true" />
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
