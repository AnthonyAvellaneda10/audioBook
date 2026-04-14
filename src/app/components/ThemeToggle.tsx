import { Moon, Sun } from 'lucide-react';
import { motion } from 'motion/react';

interface ThemeToggleProps {
  theme: 'light' | 'dark';
  onToggle: () => void;
}

export function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  const isDark = theme === 'dark';

  return (
    <button
      onClick={onToggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-pressed={isDark}
      className="
        relative flex items-center justify-center
        w-10 h-10 rounded-xl
        bg-muted hover:bg-accent
        text-muted-foreground hover:text-foreground
        transition-colors duration-200
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
        cursor-pointer
      "
    >
      <motion.span
        key={theme}
        initial={{ rotate: -30, opacity: 0, scale: 0.8 }}
        animate={{ rotate: 0, opacity: 1, scale: 1 }}
        exit={{ rotate: 30, opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="flex items-center justify-center"
      >
        {isDark ? (
          <Sun size={18} aria-hidden="true" />
        ) : (
          <Moon size={18} aria-hidden="true" />
        )}
      </motion.span>
    </button>
  );
}
