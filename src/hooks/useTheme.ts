import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

const STORAGE_KEY = 'audiobook-theme';

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Read persisted preference from localStorage
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
      if (stored === 'light' || stored === 'dark') return stored;
    } catch {}
    // Fallback to system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {}
  }, [theme]);

  const toggleTheme = () =>
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'));

  return { theme, toggleTheme };
}
