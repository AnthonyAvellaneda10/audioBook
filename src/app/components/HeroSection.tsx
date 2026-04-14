import { ArrowDown, Headphones, Sparkles, Zap } from 'lucide-react';
import { motion } from 'motion/react';

interface HeroSectionProps {
  onUploadClick: () => void;
}

const FEATURE_PILLS = [
  { icon: Zap, label: 'Instant conversion' },
  { icon: Headphones, label: 'High-quality audio' },
  { icon: Sparkles, label: 'AI-powered voices' },
];

export function HeroSection({ onUploadClick }: HeroSectionProps) {
  return (
    <section
      aria-labelledby="hero-heading"
      className="
        relative flex flex-col items-center justify-center text-center
        px-4 sm:px-6
        min-h-[calc(100dvh-4rem)]
      "
    >
      {/* Subtle radial gradient backdrop */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute inset-0 overflow-hidden
        "
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% -5%, rgba(99,102,241,0.12) 0%, transparent 70%)',
        }}
      />

      {/* Inner content — capped width for readability */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-4xl">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="
            mb-6 inline-flex items-center gap-1.5 px-3 py-1 rounded-full
            bg-accent text-accent-foreground
            border border-primary/20
            text-xs tracking-wide
          "
          style={{ fontWeight: 500 }}
        >
          <Sparkles size={12} aria-hidden="true" />
          Powered by AI text-to-speech
        </motion.div>

        {/* Heading */}
        <motion.h1
          id="hero-heading"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.08, ease: 'easeOut' }}
          className="
            max-w-3xl
            text-4xl sm:text-5xl lg:text-6xl xl:text-7xl
            text-foreground
            tracking-tight
          "
          style={{ fontWeight: 700, lineHeight: 1.1 }}
        >
          Convert your files into{' '}
          <span className="relative inline-block">
            <span className="relative z-10 text-primary">audiobooks</span>
            <span
              aria-hidden="true"
              className="
                absolute inset-x-0 bottom-1 h-3
                bg-primary/15
                -z-0 rounded
              "
            />
          </span>{' '}
          instantly
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.16, ease: 'easeOut' }}
          className="
            mt-6 max-w-xl
            text-base sm:text-lg
            text-muted-foreground
            leading-relaxed
          "
        >
          Upload a PDF, Word document, text file, or image — our AI transforms it into a
          natural-sounding audiobook in seconds. No account required.
        </motion.p>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.24, ease: 'easeOut' }}
          className="mt-10 flex flex-col sm:flex-row gap-3 items-center"
        >
          <button
            onClick={onUploadClick}
            aria-label="Upload your file to generate an audiobook"
            className="
              group relative inline-flex items-center gap-2 px-7 py-3.5 rounded-xl
              bg-primary text-primary-foreground
              shadow-lg shadow-primary/30
              transition-all duration-200
              hover:opacity-90 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-0.5
              active:translate-y-0 active:shadow-md
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
              cursor-pointer
            "
            style={{ fontWeight: 600 }}
          >
            <ArrowDown size={16} aria-hidden="true" className="group-hover:animate-bounce" />
            Upload your file
          </button>

          <span className="text-sm text-muted-foreground">
            PDF, DOCX, TXT, or image — free
          </span>
        </motion.div>

        {/* Feature pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4, ease: 'easeOut' }}
          className="mt-14 flex flex-wrap justify-center gap-3"
          aria-label="Key features"
        >
          {FEATURE_PILLS.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="
                flex items-center gap-2 px-4 py-2 rounded-xl
                bg-white dark:bg-muted
                text-foreground dark:text-muted-foreground
                text-sm
                border border-border
                shadow-sm
              "
            >
              <Icon size={14} aria-hidden="true" className="text-primary" />
              {label}
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator — sits at the very bottom of the hero */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.7, ease: 'easeOut' }}
        onClick={onUploadClick}
        aria-label="Scroll down to upload section"
        className="
          absolute bottom-8
          flex flex-col items-center gap-1.5
          text-muted-foreground/60 hover:text-muted-foreground
          transition-colors duration-200 cursor-pointer
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg p-1
        "
      >
        <span className="text-xs tracking-widest uppercase" style={{ fontWeight: 500 }}>
          Scroll
        </span>
        <motion.div
          animate={{ y: [0, 5, 0] }}
          transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
        >
          <ArrowDown size={16} aria-hidden="true" />
        </motion.div>
      </motion.button>
    </section>
  );
}