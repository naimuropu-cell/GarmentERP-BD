import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

interface ToastContextType {
  toasts: ToastItem[];
  showToast: (type: ToastType, message: string, title?: string, duration?: number) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((type: ToastType, message: string, title?: string, duration = 4000) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newToast: ToastItem = { id, type, title, message, duration };

    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  const success = useCallback((msg: string, title?: string) => showToast('success', msg, title || 'Success'), [showToast]);
  const error = useCallback((msg: string, title?: string) => showToast('error', msg, title || 'Action Failed'), [showToast]);
  const warning = useCallback((msg: string, title?: string) => showToast('warning', msg, title || 'Attention'), [showToast]);
  const info = useCallback((msg: string, title?: string) => showToast('info', msg, title || 'Information'), [showToast]);

  return (
    <ToastContext.Provider value={{ toasts, showToast, success, error, warning, info, removeToast }}>
      {children}
      {/* Toast Notification HUD Container */}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-md w-full pointer-events-none px-3">
        {toasts.map((t) => {
          let bgClass = 'bg-white border-slate-200 text-slate-900';
          let icon = <Info className="w-5 h-5 text-sky-600 shrink-0" />;

          if (t.type === 'success') {
            bgClass = 'bg-white border-emerald-300 text-slate-900 shadow-emerald-500/10';
            icon = <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />;
          } else if (t.type === 'error') {
            bgClass = 'bg-white border-rose-300 text-slate-900 shadow-rose-500/10';
            icon = <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />;
          } else if (t.type === 'warning') {
            bgClass = 'bg-white border-amber-300 text-slate-900 shadow-amber-500/10';
            icon = <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />;
          }

          return (
            <div
              key={t.id}
              className={`pointer-events-auto p-4 rounded-xl border shadow-lg transition-all duration-300 ease-out transform translate-y-0 flex items-start gap-3 relative ${bgClass}`}
              role="alert"
            >
              {icon}
              <div className="flex-1 pr-4">
                {t.title && <div className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-0.5">{t.title}</div>}
                <div className="text-xs font-medium text-slate-600 leading-snug">{t.message}</div>
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="text-slate-400 hover:text-slate-600 transition p-0.5 rounded cursor-pointer shrink-0"
                aria-label="Close notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
