import { PaginatedResponse, ProcessingStatusResponse, UploadUrlResponse } from '../types';

// ─── API Configuration ────────────────────────────────────────────────────────

const CONVERT_URL = import.meta.env.VITE_API_CONVERT_URL;
const STATUS_URL = import.meta.env.VITE_API_STATUS_URL;
const PAGE_LIMIT = 10;

// ─── Audiobook Service ────────────────────────────────────────────────────────

export const audiobookService = {
  /**
   * Requests a presigned S3 upload URL from the backend.
   * POST /convert { fileName, fileType } → { uploadUrl, jobId }
   */
  getUploadUrl: async (
    fileName: string,
    fileType: string,
    fileSize: number,
    targetLanguage: string
  ): Promise<UploadUrlResponse> => {
    console.log('[audiobookService] Requesting upload URL:', { fileName, fileType, fileSize, targetLanguage });
    const response = await fetch(CONVERT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileName, fileType, fileSize, targetLanguage }),
    });

    console.log('[audiobookService] Response status:', response.status, response.statusText);
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[audiobookService] Error response body:', errorText);
      throw new Error(`Failed to get upload URL: ${response.statusText}`);
    }
    const data = await response.json();
    console.log('[audiobookService] Upload URL received:', data);
    return data;
  },

  /**
   * Uploads a file directly to S3 using a presigned URL.
   * PUT {uploadUrl} with binary body and exact Content-Type.
   */
  uploadToStorage: async (
    file: File,
    uploadUrl: string,
    onProgress?: (progress: number) => void
  ): Promise<void> => {
    console.log('[audiobookService] Uploading binary file to S3:', {
      name: file.name,
      type: file.type,
      size: file.size,
    });
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && onProgress) {
          onProgress(Math.round((event.loaded / event.total) * 100));
        }
      };
      xhr.onload = () => {
        console.log('[audiobookService] S3 Upload status:', xhr.status);
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(new Error(`S3 upload failed with status ${xhr.status}`));
        }
      };
      xhr.onerror = () => {
        console.error('[audiobookService] S3 Upload network error');
        reject(new Error('S3 upload network error'));
      };
      xhr.open('PUT', uploadUrl);
      xhr.setRequestHeader('Content-Type', file.type);
      xhr.send(file);
    });
  },

  /**
   * GET /status?limit=10&startKey=...&startAt=...
   * Returns a paginated list of history items.
   */
  getHistory: async (opts?: {
    startKey?: string;
    startAt?: string;
  }): Promise<PaginatedResponse> => {
    const url = new URL(STATUS_URL);
    url.searchParams.append('limit', PAGE_LIMIT.toString());
    if (opts?.startKey) url.searchParams.append('startKey', opts.startKey);
    if (opts?.startAt) url.searchParams.append('startAt', opts.startAt);
    console.log('[audiobookService] Fetching history:', url.toString());
    const response = await fetch(url.toString());
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[audiobookService] History error:', errorText);
      throw new Error(`Failed to fetch history: ${response.statusText}`);
    }
    return response.json();
  },

  /**
   * GET /status?jobId={jobId}
   * Returns the status of a single job.
   */
  pollProcessingStatus: async (jobId: string): Promise<ProcessingStatusResponse> => {
    const url = new URL(STATUS_URL);
    url.searchParams.append('jobId', jobId);
    console.log('[audiobookService] Polling job:', jobId);
    const response = await fetch(url.toString());
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[audiobookService] Polling error body:', errorText);
      throw new Error(`Failed to get job status: ${response.statusText}`);
    }
    const data = await response.json();
    console.log('[audiobookService] Poll result:', data);
    return data;
  },

  /**
   * Placeholder for cancel job endpoint.
   */
  cancelJob: async (_jobId: string): Promise<void> => {
    await delay(100);
  },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
