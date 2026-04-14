import { BookAudio } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

interface NavbarProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export function Navbar({ theme, onToggleTheme }: NavbarProps) {
  return (
    <header
      role="banner"
      className="
        sticky top-0 z-50
        w-full
        bg-background/80 backdrop-blur-md
        border-b border-border
        transition-colors duration-300
      "
    >
      <nav
        aria-label="Main navigation"
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between"
      >
        {/* Logo */}
        <a
          href="/"
          aria-label="AudioBook AI — Home"
          className="
            flex items-center gap-2.5
            text-foreground
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg
            transition-opacity hover:opacity-80
          "
        >
          <span
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground"
            aria-hidden="true"
          >
            <BookAudio size={18} />
          </span>
          <span className="text-[15px] tracking-tight" style={{ fontWeight: 600 }}>
            AudioBook<span className="text-primary/70"> AI</span>
          </span>
        </a>

        {/* Right side controls */}
        <div className="flex items-center gap-3">
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        </div>
      </nav>
    </header>
  );
}