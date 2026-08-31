import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';

const UIContext = createContext(null);
let idCounter = 0;

export function UIProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [confirmState, setConfirmState] = useState(null);
  const resolveRef = useRef(null);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const pushToast = useCallback((type, message) => {
    const id = ++idCounter;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => removeToast(id), 3500);
  }, [removeToast]);

  const toast = {
    success: (message) => pushToast('success', message),
    error: (message) => pushToast('error', message),
    info: (message) => pushToast('info', message),
  };

  const confirm = useCallback((message, options = {}) => {
    return new Promise((resolve) => {
      resolveRef.current = resolve;
      setConfirmState({
        message,
        title: options.title ?? 'Konfirmasi',
        danger: options.danger ?? false,
      });
    });
  }, []);

  const handleConfirm = (result) => {
    setConfirmState(null);
    if (resolveRef.current) {
      resolveRef.current(result);
      resolveRef.current = null;
    }
  };

  const icons = { success: CheckCircle2, error: XCircle, info: Info };
  const styles = { success: 'bg-emerald-600', error: 'bg-red-600', info: 'bg-brand-800' };

  return (
    <UIContext.Provider value={{ toast, confirm }}>
      {children}

      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-[calc(100%-2rem)] max-w-sm">
        {toasts.map((t) => {
          const Icon = icons[t.type];
          return (
            <div
              key={t.id}
              className={`${styles[t.type]} text-white rounded-xl shadow-lg px-4 py-3 flex items-start gap-2.5 animate-[slideIn_0.25s_ease-out]`}
            >
              <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" strokeWidth={2} />
              <p className="text-sm flex-1">{t.message}</p>
              <button onClick={() => removeToast(t.id)} className="flex-shrink-0 opacity-70 hover:opacity-100">
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>

      {confirmState && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-sm p-6 animate-[fadeIn_0.2s_ease-out]">
            <h3 className="font-display text-lg font-bold text-brand-800 mb-2">{confirmState.title}</h3>
            <p className="text-sm text-gray-600 mb-6">{confirmState.message}</p>
            <div className="flex gap-2">
              <button
                onClick={() => handleConfirm(false)}
                className="flex-1 border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Batal
              </button>
              <button
                onClick={() => handleConfirm(true)}
                className={`flex-1 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  confirmState.danger ? 'bg-red-600 hover:bg-red-700' : 'bg-brand-800 hover:bg-brand-900'
                }`}
              >
                Ya, Lanjutkan
              </button>
            </div>
          </div>
        </div>
      )}
    </UIContext.Provider>
  );
}

export function useUI() {
  return useContext(UIContext);
}