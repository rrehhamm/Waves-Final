import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({ open, onClose, title, subtitle, children, wide = false }) {
    useEffect(() => {
        if (!open) return;
        const onKeyDown = (e) => {
            if (e.key === 'Escape') onClose?.();
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-[2px] p-4 animate-[fadeIn_0.15s_ease-out]"
            onClick={onClose}
        >
            <div
                className={`bg-white rounded-2xl shadow-2xl shadow-slate-900/10 w-full ${
                    wide ? 'max-w-2xl' : 'max-w-md'
                } max-h-[90vh] overflow-y-auto border border-slate-100 animate-[scaleIn_0.15s_ease-out]`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-slate-100 sticky top-0 bg-white/95 backdrop-blur z-10 rounded-t-2xl">
                    <div>
                        <h3 className="font-bold text-base text-slate-900">{title}</h3>
                        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
                    </div>
                    <button
                        onClick={onClose}
                        type="button"
                        className="shrink-0 w-8 h-8 inline-flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>
                <div className="p-6">{children}</div>
            </div>
        </div>
    );
}
