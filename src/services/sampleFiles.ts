import { calculateTextSHA256 } from './crypto';

export const AUTHENTIC_DEMO_TEXT =
  'DIGITAL EVIDENCE FORENSIC SAMPLE: CONFIDENTIAL AUDIT TRAIL CASE CR-409 LOGS.\n' +
  'TIMESTAMP: 2026-10-24T10:15:30Z\n' +
  'OPERATOR: INVESTIGATOR_SARAH_VANCE\n' +
  'STATUS: INTEGRITY_LOCKED';

export const TAMPERED_DEMO_TEXT =
  'DIGITAL EVIDENCE FORENSIC SAMPLE: MODIFIED-AUDIT-TAMPERED CASE CR-409 LOGS.\n' +
  'TIMESTAMP: 2026-10-24T10:15:30Z\n' +
  'OPERATOR: INVESTIGATOR_SARAH_VANCE\n' +
  'STATUS: INTEGRITY_LOCKED';

export function createAuthenticDemoFile(): File {
  const blob = new Blob([AUTHENTIC_DEMO_TEXT], { type: 'text/plain;charset=utf-8' });
  return new File([blob], 'authentic_evidence_sample.log', {
    type: 'text/plain',
    lastModified: 1714000000000,
  });
}

export function createTamperedDemoFile(): File {
  const blob = new Blob([TAMPERED_DEMO_TEXT], { type: 'text/plain;charset=utf-8' });
  return new File([blob], 'tampered_evidence_sample.log', {
    type: 'text/plain',
    lastModified: 1714000000000,
  });
}

/**
 * Initiates browser download of a sample file for testing file verification via real file picker.
 */
export function downloadSampleFile(isAuthentic: boolean): void {
  const content = isAuthentic ? AUTHENTIC_DEMO_TEXT : TAMPERED_DEMO_TEXT;
  const filename = isAuthentic
    ? 'authentic_evidence_sample.log'
    : 'tampered_evidence_sample.log';

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

/**
 * Returns the exact calculated SHA-256 hash of the demo strings at runtime.
 */
export async function getAuthenticDemoHash(): Promise<string> {
  return calculateTextSHA256(AUTHENTIC_DEMO_TEXT);
}

export async function getTamperedDemoHash(): Promise<string> {
  return calculateTextSHA256(TAMPERED_DEMO_TEXT);
}
