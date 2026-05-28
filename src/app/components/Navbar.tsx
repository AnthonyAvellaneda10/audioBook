import { BookAudio, LogIn, LogOut, User, Loader2 } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { useAuth } from '../../hooks/useAuth';
import { Button } from './ui/button';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from './ui/dropdown-menu';

interface NavbarProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export function Navbar({ theme, onToggleTheme }: NavbarProps) {
  const { isAuthenticated, isLoading, isRedirecting, user, login, logout } = useAuth();

  // Detect if there is a cached user session to show the correct skeleton shape on page load
  const hasLocalSession = Object.keys(sessionStorage).some(key => key.startsWith('oidc.user:'));

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
          
          {isRedirecting ? (
            <Button 
              variant="default" 
              size="sm" 
              disabled 
              className="gap-1.5 cursor-not-allowed opacity-80 text-xs font-semibold rounded-lg shadow-xs"
            >
              <Loader2 size={14} className="animate-spin" />
              <span>Redirigiendo...</span>
            </Button>
          ) : isLoading ? (
            hasLocalSession ? (
              // If session was likely active, show a round avatar skeleton
              <div className="w-8 h-8 rounded-full bg-muted/60 animate-pulse border border-border" />
            ) : (
              // If no session, show a button skeleton to prevent layout shift
              <div className="w-24 h-8 rounded-lg bg-muted/60 animate-pulse border border-border" />
            )
          ) : isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="relative h-8 w-8 rounded-full border border-border cursor-pointer outline-hidden hover:ring-2 hover:ring-primary/20 transition-all flex items-center justify-center overflow-hidden">
                  <Avatar className="h-full w-full">
                    <AvatarImage src={user.profile?.picture} alt={user.name || "Usuario"} />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs flex items-center justify-center w-full h-full">
                      {user.email ? user.email.slice(0, 2).toUpperCase() : <User size={14} />}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 mt-1" align="end">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-[11px] leading-none text-muted-foreground">Hola,</p>
                    <p className="text-sm font-semibold truncate text-foreground" title={user.email}>
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={logout} 
                  className="text-destructive focus:text-destructive focus:bg-destructive/10 dark:focus:bg-destructive/20 cursor-pointer gap-2"
                >
                  <LogOut size={14} />
                  <span>Cerrar sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button 
              variant="default" 
              size="sm" 
              onClick={login} 
              className="gap-1.5 cursor-pointer text-xs font-semibold rounded-lg shadow-xs"
            >
              <LogIn size={14} />
              <span>Iniciar Sesión</span>
            </Button>
          )}
        </div>
      </nav>
    </header>
  );
}