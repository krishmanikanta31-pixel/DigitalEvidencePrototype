import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="toast-container" role="region" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className="toast" style={{
          borderLeft: toast.type === 'success' ? '4px solid #10b981' :
                     toast.type === 'error' ? '4px solid #ef4444' :
                     toast.type === 'warning' ? '4px solid #f59e0b' : '4px solid #0284c7'
        }}>
          {toast.type === 'success' && <CheckCircle2 size={18} color="#10b981" />}
          {toast.type === 'error' && <AlertCircle size={18} color="#ef4444" />}
          {toast.type === 'warning' && <AlertTriangle size={18} color="#f59e0b" />}
          {toast.type === 'info' && <Info size={18} color="#0284c7" />}
          
          <span style={{ flex: 1, fontSize: '0.88rem' }}>{toast.message}</span>
          
          <button
            onClick={() => onDismiss(toast.id)}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '2px',
              display: 'flex',
              alignItems: 'center'
            }}
            title="Dismiss"
          >
            <X size={15} />
          </button>
        </div>
      ))}
    </div>
  );
};
