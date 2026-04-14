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
        const { uploadUrl, jobId } = await audiobookService.getUploadUrl(
          file.name,
          file.type,
          file.size
        );
        updateItem(id, { jobId });

        // 3. Upload file with progress tracking
        await audiobookService.uploadToStorage(file, uploadUrl, (progress) => {
          updateItem(id, { progress });
        });

        // 4. Transition to processing state
        updateItem(id, { status: 'processing', progress: 100 });

        // 5. Poll for completion
        const result = await audiobookService.pollProcessingStatus(jobId);

        if (result.status === 'completed' && result.audioUrl) {
          updateItem(id, {
            status: 'completed',
            audioUrl: result.audioUrl,
          });
        } else {
          throw new Error(result.error ?? 'Processing failed.');
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'An unexpected error occurred.';
        updateItem(id, { status: 'error', error: message });
      }
    },
    [addItem, updateItem]
  );

  return { items, startUpload, removeItem };
}