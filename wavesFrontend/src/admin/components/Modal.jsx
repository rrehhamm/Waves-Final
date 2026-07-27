import React from 'react';
import { X } from 'lucide-react';

// Small shared modal used by every admin CRUD page (create/edit forms, confirmation info, etc.)
export default function Modal({ open, onClose, title, children, wide = false }) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div
                className={`bg-white rounded-xl shadow-xl w-full ${wide ? 'max-w-2xl' : 'max-w-md'} max-h-[90vh] overflow-y-auto`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between px-5 py-4 border-b sticky top-0 bg-white">
                    <h3 className="font-semibold text-lg">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-700" type="button">
                        <X size={20} />
                    </button>
                </div>
                <div className="p-5">{children}</div>
            </div>
        </div>
    );
}
