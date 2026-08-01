import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { CheckCircle, X } from 'lucide-react';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);
    const nextId = useRef(1);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const showToast = useCallback(
        (message) => {
            const id = nextId.current++;
            setToasts((prev) => [...prev, { id, message }]);
            setTimeout(() => removeToast(id), 3000);
        },
        [removeToast]
    );

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}

            <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 items-end">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className="flex items-center gap-2.5 bg-black text-white text-sm font-medium px-4 py-3 rounded-2xl shadow-lg"
                    >
                        <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        <span>{toast.message}</span>
                        <button
                            onClick={() => removeToast(toast.id)}
                            type="button"
                            className="text-white/60 hover:text-white transition-colors"
                            aria-label="Dismiss"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};
