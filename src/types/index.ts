// ─── Upload & Processing Status ─────────────────────────────────────────────

export type UploadStatus =
  | 'idle'
  | 'uploading'
  | 'processing'
  | 'processing_text'
  | 'generating_audio'
  | 'completed'
  | 'error';

// ─── Audiobook Item ──────────────────────────────────────────────────────────

export interface AudiobookItem {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  status: UploadStatus;
  progress: number;
  timestamp: Date;
  audioUrl?: string;
  error?: string;
  jobId?: string;
}

// ─── API Response Types (for future backend integration) ─────────────────────

export interface UploadUrlResponse {
  /** Presigned S3 URL for direct upload */
  uploadUrl: string;
  /** Job ID to track processing status */
  jobId: string;
}

export interface ProcessingStatusResponse {
  jobId: string;
  status: UploadStatus;
  /** Presigned S3 URL for the generated MP3 */
  audioUrl?: string;
  error?: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  timestamp?: string;
}

export interface PaginationMetadata {
  startKey?: string;
  startAt?: string;
}

export interface PaginatedResponse {
  items: ProcessingStatusResponse[];
  nextPage?: PaginationMetadata;
}

// ─── File Validation ─────────────────────────────────────────────────────────

export const ACCEPTED_MIME_TYPES: Record<string, string> = {
  'application/pdf': 'PDF',
  'application/msword': 'Word Document',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word Document',
  'text/plain': 'Text File',
  'image/png': 'PNG Image',
  'image/jpeg': 'JPEG Image',
};

export const ACCEPTED_EXTENSIONS = ['.pdf', '.doc', '.docx', '.txt', '.png', '.jpg', '.jpeg'];

export const FILE_TYPE_ICONS: Record<string, string> = {
  'application/pdf': '📄',
  'application/msword': '📝',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '📝',
  'text/plain': '📃',
  'image/png': '🖼️',
  'image/jpeg': '🖼️',
};
