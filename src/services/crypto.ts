/**
 * Web Crypto API SHA-256 hashing service
 * Uses the browser's native window.crypto.subtle for true client-side cryptographic hashing.
 * No data is transmitted over the network.
 */

export function isCryptoSupported(): boolean {
  return typeof window !== 'undefined' && !!window.crypto && !!window.crypto.subtle;
}

/**
 * Computes the SHA-256 hash of a File object using Web Crypto API.
 */
export async function calculateSHA256(file: File): Promise<string> {
  if (!isCryptoSupported()) {
    throw new Error('Web Crypto API is not supported in this browser environment.');
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hexHash = hashArray.map((byte) => byte.toString(16).padStart(2, '0')).join('');
    return hexHash;
  } catch (error) {
    console.error('Error computing SHA-256 hash:', error);
    throw new Error(
      `Failed to compute SHA-256 hash: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Computes the SHA-256 hash of a string using Web Crypto API.
 */
export async function calculateTextSHA256(text: string): Promise<string> {
  if (!isCryptoSupported()) {
    throw new Error('Web Crypto API is not supported in this browser environment.');
  }

  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Compares two SHA-256 hashes strictly in a case-insensitive manner.
 */
export function compareHashes(hashA: string, hashB: string): boolean {
  if (!hashA || !hashB) return false;
  return hashA.trim().toLowerCase() === hashB.trim().toLowerCase();
}

/**
 * Formats a 64-character hash into groups of 8 characters separated by spaces for visual inspection.
 */
export function formatHashGrouped(hash: string, groupSize: number = 8): string {
  if (!hash) return '';
  const clean = hash.trim().toLowerCase();
  const chunks: string[] = [];
  for (let i = 0; i < clean.length; i += groupSize) {
    chunks.push(clean.slice(i, i + groupSize));
  }
  return chunks.join(' ');
}

/**
 * Formats bytes into a human-readable string (KB, MB, GB).
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}
