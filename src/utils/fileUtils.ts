// ─── File Size Formatting ─────────────────────────────────────────────────────

const UNITS = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

/**
 * Converts a raw byte count into a human-readable string with the appropriate
 * unit suffix.
 *
 * @param bytes    - The raw number of bytes to format.
 * @param decimals - Number of decimal places in the output (default: 2).
 * @returns A formatted string such as "1.45 MB" or "512 Bytes".
 *
 * @example
 *   formatBytes(0)           // "0 Bytes"
 *   formatBytes(1024)        // "1 KB"
 *   formatBytes(1048576, 1)  // "1 MB"
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';
  if (!Number.isFinite(bytes) || bytes < 0) return '—';

  const k    = 1024;
  const dm   = Math.max(0, decimals);
  const i    = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), UNITS.length - 1);
  const value = parseFloat((bytes / Math.pow(k, i)).toFixed(dm));

  return `${value} ${UNITS[i]}`;
}
