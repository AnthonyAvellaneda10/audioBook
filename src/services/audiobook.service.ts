import { ProcessingStatusResponse, UploadUrlResponse } from '../types';

const CONVERT_URL = import.meta.env.VITE_API_CONVERT_URL;
const STATUS_URL = import.meta.env.VITE_API_STATUS_URL;

export const audiobookService = {
  /**
   * Requests a presigned S3 upload URL from the backend.
   */
  getUploadUrl: async (
    fileName: string,
    fileType: string,
    _fileSize: number
  ): Promise<UploadUrlResponse> => {
    console.log('[audiobookService] Requesting upload URL:', { fileName, fileType });
    
    try {
      const response = await fetch(CONVERT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName, fileType }),
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
    } catch (error) {
      console.error('[audiobookService] Fetch error:', error);
      throw error;
    }
  },

  /**
   * Uploads a file directly to S3 using a presigned URL.
   */
  uploadToStorage: async (
    file: File,
    uploadUrl: string,
    onProgress?: (progress: number) => void
  ): Promise<void> => {
    console.log('[audiobookService] Uploading binary file to S3:', { name: file.name, type: file.type, size: file.size });
    
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && onProgress) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          onProgress(percentComplete);
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
   * Polls the backend for audiobook processing status.
   */
  pollProcessingStatus: async (jobId: string): Promise<ProcessingStatusResponse> => {
    console.log('[audiobookService] Polling status for jobId:', jobId);
    
    try {
      const response = await fetch(`${STATUS_URL}?jobId=${jobId}`);
      console.log('[audiobookService] Polling response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[audiobookService] Polling error response body:', errorText);
        throw new Error(`Failed to get job status: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('[audiobookService] Job status data:', data);
      return data;
    } catch (error) {
      console.error('[audiobookService] Polling error:', error);
      throw error;
    }
  },

  /**
   * Cancels an in-progress job.
   */
  cancelJob: async (jobId: string): Promise<void> => {
    console.log('[audiobookService] Canceling job:', jobId);
    await delay(100);
  },
};

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
