import React, { useState } from 'react';
import { Copy, Check, Hash, SlidersHorizontal } from 'lucide-react';
import { formatHashGrouped } from '../services/crypto';

interface HashDisplayProps {
  hash: string;
  label?: string;
  showChunkToggle?: boolean;
}

export const HashDisplay: React.FC<HashDisplayProps> = ({
  hash,
  label = 'SHA-256 Cryptographic Hash',
  showChunkToggle = true,
}) => {
  const [copied, setCopied] = useState(false);
  const [grouped, setGrouped] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(hash.toLowerCase());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const displayText = grouped ? formatHashGrouped(hash, 8) : hash.toLowerCase();

  return (
    <div className="hash-pill-container">
      <div className="hash-pill-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Hash size={14} color="#38bdf8" />
          <span>{label}</span>
          <span className="hash-algo-tag">SHA-256 (256-bit)</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {showChunkToggle && (
            <button
              type="button"
              className="copy-hash-btn"
              onClick={() => setGrouped(!grouped)}
              title="Toggle 8-byte block view"
            >
              <SlidersHorizontal size={12} />
              <span>{grouped ? 'Compact' : 'Blocks'}</span>
            </button>
          )}

          <button
            type="button"
            className="copy-hash-btn"
            onClick={handleCopy}
            title="Copy full SHA-256 hash"
          >
            {copied ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      <div className="hash-value-text">
        <span className="hash-value-highlight">{displayText}</span>
      </div>
    </div>
  );
};
