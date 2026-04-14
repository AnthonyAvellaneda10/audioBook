import { useCallback, useState } from 'react';
import { AudiobookItem } from '../types';
import { audiobookService } from '../services/audiobook.service';

export function useProcessingList() {
  const [items, setItems] = useState<AudiobookItem[]>([]);

  const addItem = useCallback((item: AudiobookItem) => {
    setItems((prev) => [item, ...prev]);
  }, []);

  const updateItem = useCallback(
    (id: string, updates: Partial<AudiobookItem>) => {
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
      );
    },
    []
  );

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  /**
   * Orchestrates the full upload → process flow for a single file.
   * Follows the service layer for all API interactions.
   */
  const startUpload = useCallback(
    async (file: File) => {
      console.log('[useProcessingList] Starting workflow for:', file.name);
      const id = `item_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

      // 1. Add item in uploading state
      const newItem: AudiobookItem = {
        id,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        status: 'uploading',
        progress: 0,
        timestamp: new Date(),
      };
      addItem(newItem);

      try {
        // 2. Get presigned upload URL
        console.log('[useProcessingList] Getting upload URL...');
        const { uploadUrl, jobId } = await audiobookService.getUploadUrl(
          file.name,
          file.type,
          file.size
        );
        console.log('[useProcessingList] Job ID assigned:', jobId);
        updateItem(id, { jobId });

        // 3. Upload file with progress tracking
        console.log('[useProcessingList] Uploading to S3...');
        await audiobookService.uploadToStorage(file, uploadUrl, (progress) => {
          updateItem(id, { progress });
        });

        // 4. Transition to initial processing state
        console.log('[useProcessingList] Upload successful. Starting polling.');
        updateItem(id, { status: 'processing', progress: 100 });

        // 5. Poll for completion every 10 seconds
        let isCompleted = false;
        while (!isCompleted) {
          console.log('[useProcessingList] Waiting 10s for next poll...');
          // Wait 10 seconds before polling (or between polls)
          await new Promise((resolve) => setTimeout(resolve, 10000));

          console.log('[useProcessingList] Polling status...');
          const result = await audiobookService.pollProcessingStatus(jobId);
          
          // Map backend status to frontend status
          const apiStatus = (result.status || '').toLowerCase();
          console.log('[useProcessingList] Current API status:', apiStatus);
          
          if (apiStatus === 'completed') {
            console.log('[useProcessingList] Processing completed! Audio URL:', result.audioUrl);
            updateItem(id, {
              status: 'completed',
              audioUrl: result.audioUrl,
            });
            isCompleted = true;
          } else if (apiStatus === 'error') {
            console.error('[useProcessingList] Backend reported error:', result.error);
            throw new Error(result.error ?? 'Processing failed.');
          } else if (apiStatus === 'processing' || apiStatus === 'processing_text' || apiStatus === 'generating_audio') {
            console.log('[useProcessingList] Updating status to:', apiStatus);
            updateItem(id, { status: apiStatus as any });
          } else {
            console.log('[useProcessingList] Status is in progress or unknown:', apiStatus);
          }
        }
      } catch (err) {
        console.error('[useProcessingList] Workflow failed:', err);
        const message =
          err instanceof Error ? err.message : 'An unexpected error occurred.';
        updateItem(id, { status: 'error', error: message });
      }
    },
    [addItem, updateItem]
  );

  return { items, startUpload, removeItem };
}