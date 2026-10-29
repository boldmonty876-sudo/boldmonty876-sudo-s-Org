import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export const NotificationToast: React.FC = () => {
  const { notifications, dismissNotification } = useApp();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {notifications.map(item => {
        const isSuccess = item.type === 'success';
        const isError = item.type === 'error';
        const isWarning = item.type === 'warning';

        return (
          <div
            key={item.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-xl border backdrop-blur-md transition-all duration-300 animate-in slide-in-from-bottom-3 ${
              isSuccess 
                ? 'bg-emerald-950/90 text-white border-emerald-600/50 shadow-emerald-950/30' 
                : isError 
                ? 'bg-rose-950/90 text-white border-rose-600/50 shadow-rose-950/30'
                : isWarning
                ? 'bg-amber-950/90 text-white border-amber-600/50 shadow-amber-950/30'
                : 'bg-slate-900/90 text-white border-slate-700/60 shadow-black/40'
            }`}
          >
            <div className="mt-0.5 shrink-0">
              {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
              {isError && <AlertCircle className="w-5 h-5 text-rose-400" />}
              {isWarning && <AlertTriangle className="w-5 h-5 text-amber-400" />}
              {!isSuccess && !isError && !isWarning && <Info className="w-5 h-5 text-sky-400" />}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm leading-tight text-white">{item.title}</h4>
              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{item.message}</p>
            </div>
            <button
              onClick={() => dismissNotification(item.id)}
              className="text-slate-400 hover:text-white transition-colors -mr-1 -mt-1 p-1 rounded-md"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
