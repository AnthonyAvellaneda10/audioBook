import { Pause, Play, Volume2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useAudioPlayer } from '../../hooks/useAudioPlayer';

interface AudioPlayerProps {
  audioUrl: string;
  fileName: string;
}

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function AudioPlayer({ audioUrl, fileName }: AudioPlayerProps) {
  const { isPlaying, currentTime, duration, progress, isLoading, hasError, togglePlay, seekByPercent } =
    useAudioPlayer(audioUrl);

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = ((e.clientX - rect.left) / rect.width) * 100;
    seekByPercent(Math.max(0, Math.min(100, percent)));
  };

  const handleProgressKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowRight') seekByPercent(Math.min(progress + 2, 100));
    if (e.key === 'ArrowLeft') seekByPercent(Math.max(progress - 2, 0));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="
        mt-3 p-4 rounded-xl
        bg-background border border-border
        shadow-sm
      "
      aria-label={`Audio player for ${fileName}`}
    >
      {/* Track info */}
      <div className="flex items-center gap-2.5 mb-3">
        <div
          className="
            shrink-0 flex items-center justify-center
            w-8 h-8 rounded-lg
            bg-primary/10 dark:bg-blue-400/10
          "
          aria-hidden="true"
        >
          <Volume2 size={14} className="text-primary dark:text-blue-400" />
        </div>
        <div className="min-w-0 flex-1">
          <p
            className="text-xs text-foreground truncate"
            style={{ fontWeight: 500 }}
            title={fileName}
          >
            {fileName}
          </p>
          <p className="text-xs text-muted-foreground">Audiobook Preview</p>
        </div>
      </div>

      {hasError ? (
        <p className="text-xs text-destructive text-center py-2" role="alert">
          Unable to load audio. The presigned URL may have expired.
        </p>
      ) : (
        <>
          {/* Progress bar */}
          <div
            role="slider"
            aria-label="Playback position"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress)}
            aria-valuetext={`${formatTime(currentTime)} of ${formatTime(duration)}`}
            tabIndex={0}
            onClick={handleProgressClick}
            onKeyDown={handleProgressKeyDown}
            className="
              group relative h-1.5 w-full rounded-full
              bg-muted cursor-pointer
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
              mb-3
            "
          >
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full bg-primary dark:bg-blue-400"
              style={{ width: `${progress}%` }}
              transition={{ ease: 'linear' }}
            />
            {/* Thumb */}
            <div
              className="
                absolute top-1/2 -translate-y-1/2 -translate-x-1/2
                w-3 h-3 rounded-full
                bg-primary dark:bg-blue-400
                opacity-0 group-hover:opacity-100
                transition-opacity duration-150
                shadow-sm
              "
              style={{ left: `${progress}%` }}
              aria-hidden="true"
            />
          </div>

          {/* Controls row */}
          <div className="flex items-center justify-between">
            {/* Time labels */}
            <span className="text-xs text-muted-foreground tabular-nums" aria-live="off">
              {formatTime(currentTime)}
            </span>

            {/* Play / Pause */}
            <button
              onClick={togglePlay}
              disabled={isLoading}
              aria-label={isPlaying ? 'Pause' : 'Play'}
              className="
                flex items-center justify-center
                w-9 h-9 rounded-full
                bg-primary text-primary-foreground
                hover:opacity-90 active:scale-95
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-150
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
                cursor-pointer
              "
            >
              {isLoading ? (
                <span
                  className="w-3.5 h-3.5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"
                  aria-hidden="true"
                />
              ) : isPlaying ? (
                <Pause size={14} fill="currentColor" aria-hidden="true" />
              ) : (
                <Play size={14} fill="currentColor" aria-hidden="true" />
              )}
            </button>

            <span className="text-xs text-muted-foreground tabular-nums">
              {formatTime(duration)}
            </span>
          </div>
        </>
      )}
    </motion.div>
  );
}
