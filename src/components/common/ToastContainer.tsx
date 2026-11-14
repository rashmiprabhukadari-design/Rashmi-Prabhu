import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useToastStore } from '../../store/useToastStore';

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);
  const dismissToast = useToastStore((s) => s.dismissToast);

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-20 md:bottom-6 right-4 z-50 flex flex-col gap-2 max-w-sm w-[calc(100vw-2rem)]"
    >
      {toasts.map((toast) => {
        const Icon =
          toast.type === 'error'
            ? AlertCircle
            : toast.type === 'info'
              ? Info
              : CheckCircle2;
        const borderClass =
          toast.type === 'error'
            ? 'border-[#ba1a1a]/30 bg-[#282C3F]'
            : 'border-[#282C3F] bg-[#282C3F]';

        return (
          <div
            key={toast.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-white shadow-lg border ${borderClass}`}
          >
            <Icon
              className={`w-4 h-4 shrink-0 ${
                toast.type === 'error'
                  ? 'text-[#FF905A]'
                  : toast.type === 'info'
                    ? 'text-[#FF3F6C]'
                    : 'text-[#14958F]'
              }`}
              aria-hidden="true"
            />
            <p className="text-xs font-medium flex-1 leading-snug">{toast.message}</p>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              aria-label="Dismiss notification"
              className="text-white/70 hover:text-white cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
