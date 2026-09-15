import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  ReactNode } from
'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, AlertCircle, Info, X } from 'lucide-react';

type ToastKind = 'success' | 'error' | 'info';

interface ToastItem {
  id: number;
  kind: ToastKind;
  message: string;
}

interface ToastContextValue {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const DURATION = 4500;

const iconMap: Record<ToastKind, React.ReactNode> = {
  success: <Check size={16} strokeWidth={2} />,
  error: <AlertCircle size={16} strokeWidth={1.75} />,
  info: <Info size={16} strokeWidth={1.75} />
};

const accentMap: Record<ToastKind, string> = {
  success: 'border-l-success text-success',
  error: 'border-l-danger text-danger',
  info: 'border-l-accent text-accent'
};

let counter = 0;

export function ToastProvider({ children }: {children: ReactNode;}) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (kind: ToastKind, message: string) => {
      const id = ++counter;
      setToasts((current) => [...current, { id, kind, message }]);
      window.setTimeout(() => dismiss(id), DURATION);
    },
    [dismiss]
  );

  const value = useMemo<ToastContextValue>(
    () => ({
      success: (message: string) => push('success', message),
      error: (message: string) => push('error', message),
      info: (message: string) => push('info', message)
    }),
    [push]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed inset-x-0 top-20 z-[100] flex flex-col items-center gap-2.5 px-4 sm:inset-x-auto sm:right-5 sm:items-end">
        
        <AnimatePresence initial={false}>
          {toasts.map((t) =>
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, y: -12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 border border-line border-l-2 bg-canvas/97 px-4 py-3.5 shadow-lg backdrop-blur-sm ${accentMap[t.kind]}`}>
            
              <span className="mt-0.5 shrink-0">{iconMap[t.kind]}</span>
              <p className="flex-1 text-[13px] font-light leading-relaxed text-ink">
                {t.message}
              </p>
              <button
              type="button"
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss"
              className="shrink-0 text-subtle transition-colors duration-200 hover:text-ink">
              
                <X size={14} strokeWidth={1.75} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>);

}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}
