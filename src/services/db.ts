import { EvidenceRecord, VerificationRecord } from '../types';
import { calculateTextSHA256 } from './crypto';
import { AUTHENTIC_DEMO_TEXT, TAMPERED_DEMO_TEXT } from './sampleFiles';

const DB_NAME = 'DigitalEvidenceDB';
const DB_VERSION = 1;
const EVIDENCE_STORE = 'evidence';
const VERIFICATION_STORE = 'verifications';

class EvidenceDatabase {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private getDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        reject(new Error('IndexedDB is not supported by your browser.'));
        return;
      }

      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Evidence store
        if (!db.objectStoreNames.contains(EVIDENCE_STORE)) {
          const evidenceStore = db.createObjectStore(EVIDENCE_STORE, { keyPath: 'id' });
          evidenceStore.createIndex('category', 'category', { unique: false });
          evidenceStore.createIndex('registeredAt', 'registeredAt', { unique: false });
          evidenceStore.createIndex('isDemo', 'isDemo', { unique: false });
        }

        // Verifications store
        if (!db.objectStoreNames.contains(VERIFICATION_STORE)) {
          const verifyStore = db.createObjectStore(VERIFICATION_STORE, { keyPath: 'id' });
          verifyStore.createIndex('evidenceId', 'evidenceId', { unique: false });
          verifyStore.createIndex('verifiedAt', 'verifiedAt', { unique: false });
          verifyStore.createIndex('result', 'result', { unique: false });
          verifyStore.createIndex('isDemo', 'isDemo', { unique: false });
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error || new Error('Failed to open IndexedDB database.'));
      };
    });

    return this.dbPromise;
  }

  // --- Evidence Operations ---

  async getAllEvidence(includeDemo: boolean = true): Promise<EvidenceRecord[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(EVIDENCE_STORE, 'readonly');
      const store = transaction.objectStore(EVIDENCE_STORE);
      const request = store.getAll();

      request.onsuccess = () => {
        const all = (request.result as EvidenceRecord[]) || [];
        if (!includeDemo) {
          resolve(all.filter((item) => !item.isDemo));
        } else {
          resolve(all);
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  async getEvidenceById(id: string): Promise<EvidenceRecord | null> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(EVIDENCE_STORE, 'readonly');
      const store = transaction.objectStore(EVIDENCE_STORE);
      const request = store.get(id);

      request.onsuccess = () => {
        resolve(request.result || null);
      };

      request.onerror = () => reject(request.error);
    });
  }

  async saveEvidence(evidence: EvidenceRecord): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(EVIDENCE_STORE, 'readwrite');
      const store = transaction.objectStore(EVIDENCE_STORE);
      const request = store.put(evidence);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async deleteEvidence(id: string): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([EVIDENCE_STORE, VERIFICATION_STORE], 'readwrite');
      const evidenceStore = transaction.objectStore(EVIDENCE_STORE);
      evidenceStore.delete(id);

      // Also remove associated verification records
      const verifyStore = transaction.objectStore(VERIFICATION_STORE);
      const index = verifyStore.index('evidenceId');
      const request = index.openCursor(IDBKeyRange.only(id));

      request.onsuccess = (e) => {
        const cursor = (e.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        }
      };

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  // --- Verification Operations ---

  async getAllVerifications(includeDemo: boolean = true): Promise<VerificationRecord[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(VERIFICATION_STORE, 'readonly');
      const store = transaction.objectStore(VERIFICATION_STORE);
      const request = store.getAll();

      request.onsuccess = () => {
        const all = (request.result as VerificationRecord[]) || [];
        if (!includeDemo) {
          resolve(all.filter((v) => !v.isDemo));
        } else {
          resolve(all);
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  async getVerificationsForEvidence(evidenceId: string): Promise<VerificationRecord[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(VERIFICATION_STORE, 'readonly');
      const store = transaction.objectStore(VERIFICATION_STORE);
      const index = store.index('evidenceId');
      const request = index.getAll(IDBKeyRange.only(evidenceId));

      request.onsuccess = () => {
        const records = (request.result as VerificationRecord[]) || [];
        // Sort descending by timestamp
        records.sort((a, b) => new Date(b.verifiedAt).getTime() - new Date(a.verifiedAt).getTime());
        resolve(records);
      };

      request.onerror = () => reject(request.error);
    });
  }

  async saveVerification(verification: VerificationRecord): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(VERIFICATION_STORE, 'readwrite');
      const store = transaction.objectStore(VERIFICATION_STORE);
      const request = store.put(verification);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // --- Reset & Seeding ---

  async seedDemoRecords(): Promise<void> {
    const authenticHash = await calculateTextSHA256(AUTHENTIC_DEMO_TEXT);
    const tamperedHash = await calculateTextSHA256(TAMPERED_DEMO_TEXT);

    const demo1: EvidenceRecord = {
      id: 'DEMO-EV-001',
      caseNumber: 'CASE-CR-2026-409',
      name: 'Primary Workstation Audit Log (Demo)',
      category: 'System & Event Logs',
      description: 'Audit log exported from suspect terminal during forensic triage.',
      custodian: 'Det. Sarah Vance (Digital Forensics Unit)',
      fileName: 'workstation_audit_trail.log',
      fileSize: new Blob([AUTHENTIC_DEMO_TEXT]).size,
      fileType: 'text/plain',
      fileLastModified: 1714000000000,
      sha256Hash: authenticHash,
      registeredAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
      isDemo: true,
    };

    const demo2: EvidenceRecord = {
      id: 'DEMO-EV-002',
      caseNumber: 'CASE-CR-2026-409',
      name: 'Exfiltrated Database Contract PDF (Demo)',
      category: 'Document & Contract',
      description: 'Financial agreement recovered from unallocated storage clusters.',
      custodian: 'Analyst Michael Chen',
      fileName: 'acquisition_agreement_v2.pdf',
      fileSize: 45056,
      fileType: 'application/pdf',
      fileLastModified: 1714086400000,
      sha256Hash: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
      registeredAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
      isDemo: true,
    };

    const demo3: EvidenceRecord = {
      id: 'DEMO-EV-003',
      caseNumber: 'CASE-CYBER-881',
      name: 'Perimeter Firewall PCAP Capture (Demo)',
      category: 'Network Capture (PCAP)',
      description: 'Ingress and egress network traffic capture during DDoS attack window.',
      custodian: 'Agent Laura Croft',
      fileName: 'perimeter_sniff_0920.pcap',
      fileSize: 128450,
      fileType: 'application/vnd.tcpdump.pcap',
      fileLastModified: 1714172800000,
      sha256Hash: '9b71d224bd62f3785d96d46ad3ea3d73319bfbc2890caadae2dff72519673ca7',
      registeredAt: new Date(Date.now() - 3600000 * 18).toISOString(),
      isDemo: true,
    };

    await this.saveEvidence(demo1);
    await this.saveEvidence(demo2);
    await this.saveEvidence(demo3);

    // Seed sample verification attempts for DEMO-EV-001
    const v1: VerificationRecord = {
      id: 'demo-ver-1',
      evidenceId: 'DEMO-EV-001',
      evidenceName: 'Primary Workstation Audit Log (Demo)',
      verifiedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
      testFileName: 'workstation_audit_trail.log',
      testFileSize: new Blob([AUTHENTIC_DEMO_TEXT]).size,
      computedHash: authenticHash,
      originalHash: authenticHash,
      result: 'MATCH',
      notes: 'Initial laboratory intake check. Authentic file matches master registered hash.',
      isDemo: true,
    };

    const v2: VerificationRecord = {
      id: 'demo-ver-2',
      evidenceId: 'DEMO-EV-001',
      evidenceName: 'Primary Workstation Audit Log (Demo)',
      verifiedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      testFileName: 'workstation_audit_trail_tampered.log',
      testFileSize: new Blob([TAMPERED_DEMO_TEXT]).size,
      computedHash: tamperedHash,
      originalHash: authenticHash,
      result: 'MISMATCH',
      notes: 'Tamper simulation test. Changed 1 word; SHA-256 avalanche effect produced mismatched hash.',
      isDemo: true,
    };

    await this.saveVerification(v1);
    await this.saveVerification(v2);
  }

  async clearDemoRecords(): Promise<void> {
    const allEvidence = await this.getAllEvidence(true);
    for (const ev of allEvidence) {
      if (ev.isDemo) {
        await this.deleteEvidence(ev.id);
      }
    }
  }

  async clearAllData(keepDemo: boolean = false): Promise<void> {
    const allEvidence = await this.getAllEvidence(true);
    for (const ev of allEvidence) {
      if (!keepDemo || !ev.isDemo) {
        await this.deleteEvidence(ev.id);
      }
    }
  }

  async exportDatabase(): Promise<string> {
    const evidence = await this.getAllEvidence(true);
    const verifications = await this.getAllVerifications(true);
    const backup = {
      exportedAt: new Date().toISOString(),
      version: '1.0',
      evidence,
      verifications,
    };
    return JSON.stringify(backup, null, 2);
  }

  async importDatabase(jsonString: string): Promise<{ importedEvidence: number; importedVerifications: number }> {
    const data = JSON.parse(jsonString);
    if (!Array.isArray(data.evidence) || !Array.isArray(data.verifications)) {
      throw new Error('Invalid backup file structure: missing evidence or verifications array.');
    }

    let importedEvidence = 0;
    let importedVerifications = 0;

    for (const ev of data.evidence) {
      if (ev.id && ev.sha256Hash) {
        await this.saveEvidence(ev);
        importedEvidence++;
      }
    }

    for (const ver of data.verifications) {
      if (ver.id && ver.evidenceId) {
        await this.saveVerification(ver);
        importedVerifications++;
      }
    }

    return { importedEvidence, importedVerifications };
  }
}

export const evidenceDB = new EvidenceDatabase();
