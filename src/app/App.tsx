import { useRef } from 'react';
import { useTheme } from '../hooks/useTheme';
import { useProcessingList } from '../hooks/useProcessingList';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { FileUploadZone } from './components/FileUploadZone';
import { ProcessingList } from './components/ProcessingList';

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const { items, startUpload, removeItem, nextPage, loadingMore, loadMore } = useProcessingList();

  // Ref to scroll to the upload section when CTA is clicked
  const uploadSectionRef = useRef<HTMLElement>(null);

  const handleScrollToUpload = () => {
    uploadSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Fire-and-forget: let each upload run in background so users can queue multiple files
  const handleUpload = (file: File, targetLanguage: string) => {
    startUpload(file, targetLanguage);
  };

  return (
    /*
     * Root container — `transition-colors` ensures a smooth theme switch.
     * The `dark` class is toggled on <html> by useTheme, so dark: variants apply here.
     */
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Skip-to-content link for keyboard/screen reader users */}
      <a
        href="#main-content"
        className="
          sr-only focus:not-sr-only
          fixed top-4 left-4 z-[100]
          px-4 py-2 rounded-xl
          bg-primary text-primary-foreground text-sm
          focus:outline-none focus:ring-2 focus:ring-ring
        "
        style={{ fontWeight: 600 }}
      >
        Skip to main content
      </a>

      {/* Navigation */}
      <Navbar theme={theme} onToggleTheme={toggleTheme} />

      {/* Main content */}
      <main id="main-content" className="flex flex-col items-stretch">
        {/* Hero */}
        <HeroSection onUploadClick={handleScrollToUpload} />

        {/* Upload zone */}
        <div className="mb-10">
          <FileUploadZone
            onUpload={handleUpload}
            sectionRef={uploadSectionRef}
          />
        </div>

        {/* Processing list */}
        <ProcessingList
          items={items}
          onRemove={removeItem}
          nextPage={nextPage}
          loadingMore={loadingMore}
          onLoadMore={loadMore}
        />
      </main>

      {/* Footer */}
      <footer
        className="
          border-t border-border
          py-6 px-4 sm:px-6
          text-center text-xs text-muted-foreground
          transition-colors duration-300
        "
        role="contentinfo"
        aria-label="Site footer"
      >
        <p>
          AudioBook AI — Convert documents to audiobooks instantly.
        </p>
        <p className="mt-1 opacity-60">
          © {new Date().getFullYear()} AudioBook AI. All rights reserved.
        </p>
      </footer>
    </div>
  );
}