'use client';

import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';

interface Toast {
  id: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextValue {
  showToast: (message: string, action?: Toast['action']) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const showToast = useCallback(
    (message: string, action?: Toast['action']) => {
      const id = crypto.randomUUID();
      setToasts((prev) => [...prev, { id, message, action }]);
      const timer = setTimeout(() => removeToast(id), 8000);
      timersRef.current.set(id, timer);
    },
    [removeToast]
  );

  // Cleanup on unmount
  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((t) => clearTimeout(t));
    };
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast container - fixed bottom center */}
      {toasts.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 items-center">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              role="status"
              aria-live="polite"
              className="toast-in bg-gray-900 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 text-sm max-w-md"
            >
              <span>{toast.message}</span>
              {toast.action && (
                <button
                  onClick={() => {
                    toast.action!.onClick();
                    removeToast(toast.id);
                  }}
                  className="font-medium text-blue-300 hover:text-blue-200 whitespace-nowrap"
                >
                  {toast.action.label}
                </button>
              )}
              <button
                onClick={() => removeToast(toast.id)}
                className="text-gray-400 hover:text-white ml-1"
                aria-label="Dismiss"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
}
