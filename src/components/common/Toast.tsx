import React from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { useMoneyFlow } from '../../context/MoneyFlowContext';

export const Toast: React.FC = () => {
  const { toast, hideToast } = useMoneyFlow();

  if (!toast) return null;

  const getBgColor = () => {
    switch (toast.type) {
      case 'error':
        return 'bg-red-900/90 border-red-500 text-red-100';
      case 'info':
        return 'bg-slate-800/90 border-slate-600 text-slate-100';
      case 'success':
      default:
        return 'bg-emerald-950/90 border-emerald-500 text-emerald-100';
    }
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-400 shrink-0" />;
      case 'success':
      default:
        return <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />;
    }
  };

  return (
    <div className="fixed top-24 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none animate-slide-up">
      <div
        className={`max-w-[360px] w-full px-4 py-3 rounded-2xl border backdrop-blur-md shadow-2xl flex items-center justify-between space-x-3 pointer-events-auto ${getBgColor()}`}
      >
        <div className="flex items-center space-x-3 text-sm font-medium leading-tight">
          {getIcon()}
          <span>{toast.message}</span>
        </div>
        <button
          onClick={hideToast}
          className="p-1 text-slate-400 hover:text-white rounded-full transition"
          aria-label="Close Toast"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
