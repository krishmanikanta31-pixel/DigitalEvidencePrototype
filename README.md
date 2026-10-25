# Digital Evidence Integrity System (DEIS)
**A Client-Side Cryptographic Chain-of-Custody & Forensic Verification Prototype**

Developed as a college computer forensics project demonstrating cryptographic hashing (SHA-256), bitstream integrity verification, and local chain-of-custody tracking.

---

## 🌟 Key Features

1. **Cryptographic SHA-256 Fingerprinting**:
   - Uses the browser's native **W3C Web Cryptography API** (`window.crypto.subtle.digest`) for genuine, client-side SHA-256 calculations.
   - Computes hashes directly from raw file bytes in volatile RAM without transmitting any data over the internet.

2. **Executive Forensic Dashboard**:
   - Total registered evidence count.
   - Successful integrity matches vs. failed tamper alerts.
   - Recent activity audit trail (new registrations, verification attempts).
   - Evidence distribution by category (Disk Images, Network PCAP, System Logs, Memory Dumps, Documents).

3. **Evidence Registration & Chain of Custody**:
   - Drag-and-drop file picker supporting any file format (`.raw`, `.dd`, `.pcap`, `.log`, `.pdf`, `.zip`, etc.).
   - Automatic SHA-256 calculation with chunked/compact hex views.
   - Auto-generated or custom Evidence IDs (e.g., `EV-2026-001`) with duplicate prevention.
   - Forensic metadata fields: Case Reference Number, Evidence Name, Category, Custodian/Investigator, Timestamp, and Notes.

4. **Cryptographic Verification**:
   - Select any registered evidence baseline and choose a candidate file to audit.
   - Performs side-by-side SHA-256 comparison.
   - Displays clear **MATCH** (Integrity Intact) or **MISMATCH** (Tampering Detected) verdicts.
   - Records every verification attempt in the audit ledger with timestamp and tester notes.

5. **Evidence Master Ledger & History**:
   - Filter and search by ID, Case Number, Name, or SHA-256 hash.
   - Expandable Chain-of-Custody dossier with printable audit sheet.
   - Export evidence ledger to CSV for external examination.
   - Permanent delete confirmation controls.

6. **Interactive Demo Lab**:
   - Pre-loaded forensic sample cases (`[DEMO]`) isolated from real user records.
   - 1-Click interactive simulation to test authentic matching and tampered mismatching.
   - Downloadable authentic and tampered sample files to test the physical file picker on your Mac.
   - Demonstrates the **SHA-256 Avalanche Effect** (showing how changing a single byte alters the entire 64-char fingerprint).

7. **Zero-Cloud Privacy & Local IndexedDB**:
   - All metadata and verification logs are stored locally in browser **IndexedDB** (`DigitalEvidenceDB`).
   - Raw file binaries are **never** uploaded to remote servers or stored permanently in browser cache.
   - Full JSON database export/backup and restore capabilities.

---

## 💻 macOS Setup and Run Instructions

### Prerequisites
- macOS (Sonoma, Sequoia, or earlier)
- [Node.js](https://nodejs.org/) (version 18 or later recommended)
- Modern web browser with Web Crypto API support (Google Chrome, Apple Safari, Mozilla Firefox, or Brave)

### Quick Start Commands

1. **Open Terminal** and navigate to this project folder:
   ```bash
   cd /Users/vamsikrishna/Desktop/DigitalEvidencePrototype
   ```

2. **Install dependencies** (if not already installed):
   ```bash
   npm install
   ```

3. **Start the local development server**:
   ```bash
   npm run dev
   ```

4. **Open in Browser**:
   Open your browser and navigate to:
   ```
   http://localhost:5173
   ```
   *(Or the custom port displayed in your terminal)*

5. **Build for Production** (optional verification):
   ```bash
   npm run build
   ```

---

## 🔒 Academic Project Notice & Limitations

> [!WARNING]
> **Academic Prototype Disclaimer**:
> This application is an educational prototype developed for collegiate computer forensics demonstration.
> - Browser-local storage (IndexedDB) is **not tamper-proof** against local operating system administrative access or developer tools manipulation.
> - This prototype is **not** an ISO/IEC 27037 or CJIS certified legal evidence management system.
> - Clearing browser cookies or website data will remove local IndexedDB records unless exported using the **Export JSON Ledger Backup** tool under the *Privacy & Limits* tab.
