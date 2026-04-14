import { ProcessingStatusResponse, UploadUrlResponse } from '../types';

// ─── API Configuration ───────────────────────────────────────────────────────
// TODO: Move to environment variables (e.g., VITE_API_BASE_URL)
// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

// ─── Audiobook Service ───────────────────────────────────────────────────────

export const audiobookService = {
  /**
   * Requests a presigned S3 upload URL from the backend.
   *
   * TODO: Replace simulation with:
   *   POST ${API_BASE_URL}/api/upload-url
   *   Body: { fileName, fileType, fileSize }
   *   Returns: { uploadUrl, jobId }
   */
  getUploadUrl: async (
    fileName: string,
    fileType: string,
    fileSize: number
  ): Promise<UploadUrlResponse> => {
    // Simulated network delay
    await delay(300);
    return {
      uploadUrl: `https://s3.amazonaws.com/your-bucket/${fileName}?presigned=TODO`,
      jobId: `job_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    };
  },

  /**
   * Uploads a file directly to S3 using a presigned URL.
   * Reports upload progress via callback.
   *
   * TODO: Replace simulation with:
   *   PUT ${uploadUrl}
   *   Headers: { 'Content-Type': file.type }
   *   Body: file (binary)
   *   Use XMLHttpRequest to track upload progress via xhr.upload.onprogress
   */
  uploadToStorage: async (
    file: File,
    uploadUrl: string,
    onProgress: (progress: number) => void
  ): Promise<void> => {
    return new Promise((resolve) => {
      let progress = 0;
      const totalDuration = 2200; // ms
      const intervalMs = 80;
      const steps = totalDuration / intervalMs;
      const increment = 100 / steps;

      const interval = setInterval(() => {
        progress = Math.min(progress + increment + Math.random() * increment * 0.5, 100);
        onProgress(Math.round(progress));

        if (progress >= 100) {
          clearInterval(interval);
          onProgress(100);
          resolve();
        }
      }, intervalMs);
    });
  },

  /**
   * Polls the backend for audiobook processing status.
   *
   * TODO: Replace simulation with:
   *   GET ${API_BASE_URL}/api/jobs/${jobId}/status
   *   Returns: { jobId, status, audioUrl?, error? }
   *
   *   Consider using WebSocket or Server-Sent Events (SSE) for real-time updates
   *   instead of polling, to reduce latency and backend load.
   *
   * AWS Architecture note:
   *   - File lands in S3 → triggers Lambda → Lambda invokes Polly/TTS → outputs MP3 to S3
   *   - Lambda updates DynamoDB with job status
   *   - Frontend polls API Gateway → Lambda → DynamoDB
   */
  pollProcessingStatus: async (jobId: string): Promise<ProcessingStatusResponse> => {
    // Simulate processing time (3–4 seconds for TTS generation)
    const processingTime = 3000 + Math.random() * 1000;
    await delay(processingTime);

    // TODO: Replace with actual presigned S3 URL from the backend response
    return {
      jobId,
      status: 'completed',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    };
  },

  /**
   * Cancels an in-progress job.
   *
   * TODO: Replace simulation with:
   *   DELETE ${API_BASE_URL}/api/jobs/${jobId}
   */
  cancelJob: async (jobId: string): Promise<void> => {
    await delay(200);
    // TODO: Call backend to cancel job and clean up S3 resources
  },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
