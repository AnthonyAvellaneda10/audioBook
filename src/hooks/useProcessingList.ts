import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AudiobookItem,
  PaginatedResponse,
  PaginationMetadata,
  ProcessingStatusResponse,
  UploadStatus,
} from '../types';
import { audiobookService } from '../services/audiobook.service';

// ─── Constants ────────────────────────────────────────────────────────────────

/** How often to poll a single job that is actively processing */
const ACTIVE_POLL_INTERVAL_MS = 10_000;       // 10 s
/** How often to refresh the full history list (catches cross-tab uploads) */
const HISTORY_REFRESH_INTERVAL_MS = 30_000;  // 30 s
/** Refresh the audioUrl if the item is older than this threshold */
const AUDIO_URL_TTL_MS = 55 * 60 * 1000;    // 55 min

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * All statuses that mean a job is NOT yet done and NOT in error.
 * Any raw string from the backend that isn't in the known-list will also
 * be treated as "in progress" via the fallback in mapStatus.
 */
const TERMINAL_STATUSES: UploadStatus[] = ['completed', 'error'];

function isTerminal(status: UploadStatus) {
  return TERMINAL_STATUSES.includes(status);
}

/** Map any raw backend string to one of our typed UploadStatus values. */
function mapStatus(raw: string): UploadStatus {
  const s = raw.toLowerCase();
  const known: UploadStatus[] = [
    'idle',
    'uploading',
    'processing',
    'processing_text',
    'generating_audio',
    'completed',
    'error',
  ];
  return known.includes(s as UploadStatus) ? (s as UploadStatus) : 'processing';
}

/** Convert a backend history record to an internal AudiobookItem. */
function fromApiItem(raw: ProcessingStatusResponse): AudiobookItem {
  return {
    id: raw.jobId,
    jobId: raw.jobId,
    fileName: raw.fileName ?? raw.jobId,
    fileSize: raw.fileSize ?? 0,
    fileType: raw.fileType ?? '',
    status: mapStatus(raw.status as string),
    progress: raw.status?.toLowerCase() === 'completed' ? 100 : 0,
    timestamp: raw.timestamp ? new Date(raw.timestamp) : new Date(),
    audioUrl: raw.audioUrl,
    error: raw.error,
  };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useProcessingList() {
  // null = initial loading, [] = loaded but empty, [...] = has data
  const [items, setItems]             = useState<AudiobookItem[] | null>(null);
  const [nextPage, setNextPage]       = useState<PaginationMetadata | undefined>(undefined);
  const [loadingMore, setLoadingMore] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  // Track which jobIds are actively being polled so we never double-start
  const pollingRef = useRef<Set<string>>(new Set());

  // ── Merge helpers ──────────────────────────────────────────────────────────

  /** Upsert a partial update into the item list, matching by id or jobId. */
  const upsertItem = useCallback((update: Partial<AudiobookItem> & { id: string }) => {
    setItems((prev) => {
      if (prev === null) return prev;
      const exists = prev.some(
        (i) => i.id === update.id || (update.jobId && i.jobId === update.jobId)
      );
      if (exists) {
        return prev.map((i) =>
          i.id === update.id || (update.jobId && i.jobId === update.jobId)
            ? { ...i, ...update }
            : i
        );
      }
      // Shouldn't normally happen – prepend as a safety net
      return [update as AudiobookItem, ...prev];
    });
  }, []);

  /** Append new items from a paginated page, skipping duplicates by jobId. */
  const mergeItems = useCallback((incoming: AudiobookItem[], prepend = false) => {
    setItems((prev) => {
      const base = prev ?? [];
      const existing = new Set(base.map((i) => i.jobId ?? i.id));
      const fresh = incoming.filter((i) => !existing.has(i.jobId ?? i.id));
      return prepend ? [...fresh, ...base] : [...base, ...fresh];
    });
  }, []);

  // ── Per-job polling orchestrator ───────────────────────────────────────────

  const pollJob = useCallback(
    async (jobId: string, localId: string) => {
      if (pollingRef.current.has(jobId)) return; // already running
      pollingRef.current.add(jobId);
      console.log('[useProcessingList] Starting poll for', jobId);

      try {
        while (true) {
          await new Promise((r) => setTimeout(r, ACTIVE_POLL_INTERVAL_MS));
          const result = await audiobookService.pollProcessingStatus(jobId);
          const status = mapStatus(result.status as string);

          console.log('[useProcessingList]', jobId, '→', status, result.audioUrl ?? '');
          upsertItem({ id: localId, jobId, status, audioUrl: result.audioUrl, error: result.error });

          if (isTerminal(status)) break;
        }
      } catch (err) {
        console.error('[useProcessingList] Polling error for', jobId, err);
        const message = err instanceof Error ? err.message : 'Polling failed.';
        upsertItem({ id: localId, jobId, status: 'error', error: message });
      } finally {
        pollingRef.current.delete(jobId);
      }
    },
    [upsertItem]
  );

  // Start polling for any non-terminal history items that aren't being watched
  useEffect(() => {
    if (!items) return;
    items.forEach((item) => {
      if (
        item.jobId &&
        !isTerminal(item.status) &&
        item.status !== 'uploading' &&
        !pollingRef.current.has(item.jobId)
      ) {
        pollJob(item.jobId, item.id);
      }
    });
  }, [items, pollJob]);

  // ── History loading ────────────────────────────────────────────────────────

  /**
   * Fetches the first page of history from the backend.
   * On subsequent calls (background refresh) it MERGES new items rather than
   * replacing the whole list, so in-progress items are not lost.
   */
  const fetchHistory = useCallback(async (isBackgroundRefresh = false) => {
    if (!isBackgroundRefresh) {
      console.log('[useProcessingList] Fetching initial history');
    }
    setHistoryError(null);
    try {
      const resp: PaginatedResponse = await audiobookService.getHistory();
      const mapped = resp.items.map(fromApiItem);

      if (isBackgroundRefresh) {
        // Merge only truly new items; leave in-progress optimistic items intact
        mergeItems(mapped, true);
      } else {
        setItems(mapped);
        setNextPage(resp.nextPage);
      }
    } catch (err) {
      console.error('[useProcessingList] History load failed:', err);
      const msg = err instanceof Error ? err.message : 'Failed to load history.';
      setHistoryError(msg);
      if (!isBackgroundRefresh) setItems([]); // exit null/loading state
    }
  }, [mergeItems]);

  // Initial fetch on mount
  useEffect(() => { fetchHistory(false); }, [fetchHistory]);

  // Background refresh every 30 s (catches jobs from other tabs)
  useEffect(() => {
    const id = setInterval(() => {
      console.log('[useProcessingList] Background history refresh');
      fetchHistory(true);
    }, HISTORY_REFRESH_INTERVAL_MS);
    return () => clearInterval(id);
  }, [fetchHistory]);

  // ── Load More (pagination) ─────────────────────────────────────────────────

  const loadMore = useCallback(async () => {
    if (!nextPage || loadingMore) return;
    setLoadingMore(true);
    console.log('[useProcessingList] Loading more with', nextPage);
    try {
      const resp: PaginatedResponse = await audiobookService.getHistory(nextPage);
      mergeItems(resp.items.map(fromApiItem), false);
      setNextPage(resp.nextPage);
    } catch (err) {
      console.error('[useProcessingList] Load more failed:', err);
    } finally {
      setLoadingMore(false);
    }
  }, [nextPage, loadingMore, mergeItems]);

  // ── Upload flow ────────────────────────────────────────────────────────────

  const startUpload = useCallback(
    async (file: File) => {
      console.log('[useProcessingList] Starting upload for:', file.name);
      const localId = `local_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

      const newItem: AudiobookItem = {
        id: localId,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        status: 'uploading',
        progress: 0,
        timestamp: new Date(),
      };

      // Optimistically prepend while the upload is in flight
      setItems((prev) => [newItem, ...(prev ?? [])]);

      try {
        const { uploadUrl, jobId } = await audiobookService.getUploadUrl(
          file.name,
          file.type,
          file.size
        );
        upsertItem({ id: localId, jobId });

        await audiobookService.uploadToStorage(file, uploadUrl, (progress) => {
          upsertItem({ id: localId, progress });
        });

        upsertItem({ id: localId, status: 'processing', progress: 100 });
        pollJob(jobId, localId);
      } catch (err) {
        console.error('[useProcessingList] Upload failed:', err);
        const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
        upsertItem({ id: localId, status: 'error', error: message });
      }
    },
    [upsertItem, pollJob]
  );

  // ── Audio URL freshness ────────────────────────────────────────────────────

  /**
   * Returns a fresh audioUrl for playback.
   * If the stored URL is older than 55 minutes it re-fetches from the API.
   */
  const requestPlayback = useCallback(
    async (item: AudiobookItem): Promise<string | undefined> => {
      if (!item.jobId) return item.audioUrl;
      const age = Date.now() - item.timestamp.getTime();
      if (item.audioUrl && age < AUDIO_URL_TTL_MS) return item.audioUrl;

      console.log('[useProcessingList] Refreshing audio URL for', item.jobId);
      try {
        const result = await audiobookService.pollProcessingStatus(item.jobId);
        if (result.audioUrl) {
          upsertItem({ id: item.id, jobId: item.jobId, audioUrl: result.audioUrl });
          return result.audioUrl;
        }
      } catch (err) {
        console.error('[useProcessingList] Audio URL refresh failed:', err);
      }
      return item.audioUrl;
    },
    [upsertItem]
  );

  // ── Remove ─────────────────────────────────────────────────────────────────

  const removeItem = useCallback((id: string) => {
    setItems((prev) => (prev ?? []).filter((item) => item.id !== id));
  }, []);

  // ── Public API ─────────────────────────────────────────────────────────────

  return {
    items,           // null = loading, [] = empty, [...] = data
    nextPage,
    loadingMore,
    historyError,
    startUpload,
    loadMore,
    removeItem,
    requestPlayback,
  };
}