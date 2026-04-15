import { useCallback, useEffect, useRef, useState } from 'react';
import { AudiobookItem, PaginatedResponse, PaginationMetadata, ProcessingStatusResponse, UploadStatus } from '../types';
import { audiobookService } from '../services/audiobook.service';

const POLL_INTERVAL_MS = 10_000;
const AUDIO_URL_TTL_MS  = 55 * 60 * 1000; // refresh if older than 55 min

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Map a raw backend status string to a typed UploadStatus */
function mapStatus(raw: string): UploadStatus {
  const s = raw.toLowerCase();
  const known: UploadStatus[] = [
    'idle', 'uploading', 'processing', 'processing_text', 'generating_audio', 'completed', 'error',
  ];
  return known.includes(s as UploadStatus) ? (s as UploadStatus) : 'processing';
}

/** Convert a backend history item to an AudiobookItem */
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

  // null = initial loading, [] = loaded but empty
  const [items, setItems]         = useState<AudiobookItem[] | null>(null);
  const [nextPage, setNextPage]   = useState<PaginationMetadata | undefined>(undefined);
  const [loadingMore, setLoadingMore] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  // Track which jobIds are actively being polled so we don't double-start
  const pollingRef = useRef<Set<string>>(new Set());

  // ── Merge helpers ────────────────────────────────────────────────────────

  /** Upsert a partial update into items by `id` or `jobId` */
  const upsertItem = useCallback((update: Partial<AudiobookItem> & { id: string }) => {
    setItems((prev) => {
      if (prev === null) return prev;
      const exists = prev.some((i) => i.id === update.id || (update.jobId && i.jobId === update.jobId));
      if (exists) {
        return prev.map((i) =>
          (i.id === update.id || (update.jobId && i.jobId === update.jobId))
            ? { ...i, ...update }
            : i
        );
      }
      // Item not in list yet – prepend (shouldn't normally happen)
      return [update as AudiobookItem, ...prev];
    });
  }, []);

  /** Merge a list of api items, avoiding duplicates by jobId */
  const mergeItems = useCallback((incoming: AudiobookItem[], prepend = false) => {
    setItems((prev) => {
      const base = prev ?? [];
      const existingJobIds = new Set(base.map((i) => i.jobId ?? i.id));
      const fresh = incoming.filter((i) => !existingJobIds.has(i.jobId ?? i.id));
      return prepend ? [...fresh, ...base] : [...base, ...fresh];
    });
  }, []);

  // ── Polling orchestrator ─────────────────────────────────────────────────

  const pollJob = useCallback(async (jobId: string, localId: string) => {
    if (pollingRef.current.has(jobId)) return; // already polling
    pollingRef.current.add(jobId);
    console.log('[useProcessingList] Starting poll for', jobId);

    try {
      while (true) {
        await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
        const result = await audiobookService.pollProcessingStatus(jobId);
        const status = mapStatus(result.status as string);

        console.log('[useProcessingList]', jobId, '→', status);

        upsertItem({ id: localId, jobId, status, audioUrl: result.audioUrl, error: result.error });

        if (status === 'completed' || status === 'error') break;
      }
    } catch (err) {
      console.error('[useProcessingList] Polling error for', jobId, err);
      const message = err instanceof Error ? err.message : 'Polling failed.';
      upsertItem({ id: localId, jobId, status: 'error', error: message });
    } finally {
      pollingRef.current.delete(jobId);
    }
  }, [upsertItem]);

  // Whenever items change, start polling for any non-completed/non-error items
  useEffect(() => {
    if (!items) return;
    items.forEach((item) => {
      const needsPoll =
        item.jobId &&
        item.status !== 'completed' &&
        item.status !== 'error' &&
        item.status !== 'uploading' &&
        !pollingRef.current.has(item.jobId);

      if (needsPoll) {
        pollJob(item.jobId!, item.id);
      }
    });
  }, [items, pollJob]);

  // ── History loading ──────────────────────────────────────────────────────

  const fetchHistory = useCallback(async () => {
    console.log('[useProcessingList] Fetching initial history');
    setHistoryError(null);
    try {
      const resp: PaginatedResponse = await audiobookService.getHistory();
      const mapped = resp.items.map(fromApiItem);
      setItems(mapped);
      setNextPage(resp.nextPage);
    } catch (err) {
      console.error('[useProcessingList] History load failed:', err);
      setHistoryError(err instanceof Error ? err.message : 'Failed to load history.');
      setItems([]); // ensure we leave the null/loading state
    }
  }, []);

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

  // Fetch history on mount
  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  // ── Upload flow ──────────────────────────────────────────────────────────

  const startUpload = useCallback(async (file: File) => {
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

    // Prepend optimistically into the list
    setItems((prev) => [newItem, ...(prev ?? [])]);

    try {
      // 1. Get presigned URL
      const { uploadUrl, jobId } = await audiobookService.getUploadUrl(file.name, file.type, file.size);
      upsertItem({ id: localId, jobId });

      // 2. Upload to S3
      await audiobookService.uploadToStorage(file, uploadUrl, (progress) => {
        upsertItem({ id: localId, progress });
      });

      // 3. Move to processing and start polling
      upsertItem({ id: localId, status: 'processing', progress: 100 });
      pollJob(jobId, localId);

    } catch (err) {
      console.error('[useProcessingList] Upload failed:', err);
      const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
      upsertItem({ id: localId, status: 'error', error: message });
    }
  }, [upsertItem, pollJob]);

  // ── Audio URL freshness ──────────────────────────────────────────────────

  const requestPlayback = useCallback(async (item: AudiobookItem): Promise<string | undefined> => {
    if (!item.jobId) return item.audioUrl;
    const age = Date.now() - item.timestamp.getTime();
    if (item.audioUrl && age < AUDIO_URL_TTL_MS) return item.audioUrl;
    // Refresh
    console.log('[useProcessingList] Refreshing audio URL for', item.jobId);
    try {
      const result = await audiobookService.pollProcessingStatus(item.jobId);
      if (result.audioUrl) {
        upsertItem({ id: item.id, jobId: item.jobId, audioUrl: result.audioUrl });
        return result.audioUrl;
      }
    } catch (err) {
      console.error('[useProcessingList] Failed to refresh audio URL:', err);
    }
    return item.audioUrl;
  }, [upsertItem]);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => (prev ?? []).filter((item) => item.id !== id));
  }, []);

  return {
    items,            // null = loading, [] = empty, [...] = data
    nextPage,
    loadingMore,
    historyError,
    startUpload,
    loadMore,
    removeItem,
    requestPlayback,
  };
}