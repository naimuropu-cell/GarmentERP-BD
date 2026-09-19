import React from 'react';
import { AlertTriangle, CheckCircle2, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'primary';
  onConfirm: () => void;
  onCancel: () => void;
  isProcessing?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'primary',
  onConfirm,
  onCancel,
  isProcessing = false
}) => {
  if (!isOpen) return null;

  let headerColor = 'text-slate-900';
  let iconBg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  let confirmBtnClass = 'bg-emerald-700 hover:bg-emerald-800 text-white';
  let IconComponent = CheckCircle2;

  if (type === 'danger') {
    headerColor = 'text-rose-950';
    iconBg = 'bg-rose-50 text-rose-700 border-rose-200';
    confirmBtnClass = 'bg-rose-700 hover:bg-rose-800 text-white';
    IconComponent = AlertTriangle;
  } else if (type === 'warning') {
    headerColor = 'text-amber-950';
    iconBg = 'bg-amber-50 text-amber-700 border-amber-200';
    confirmBtnClass = 'bg-amber-600 hover:bg-amber-700 text-white';
    IconComponent = AlertTriangle;
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 shadow-2xl relative space-y-4 animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onCancel}
          disabled={isProcessing}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-700 cursor-pointer p-1 rounded-lg transition"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-start gap-3.5">
          <div className={`p-2.5 rounded-xl border shrink-0 ${iconBg}`}>
            <IconComponent className="h-5 w-5" />
          </div>
          <div>
            <h3 className={`text-base font-bold ${headerColor}`}>{title}</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onCancel}
            disabled={isProcessing}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg cursor-pointer transition disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isProcessing}
            className={`px-4 py-2 text-xs font-bold rounded-lg cursor-pointer transition flex items-center gap-1.5 shadow-sm disabled:opacity-50 ${confirmBtnClass}`}
          >
            {isProcessing && <div className="w-3 h-3 border-2 border-white/50 border-t-white rounded-full animate-spin" />}
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
