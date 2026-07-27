import React, { useEffect, useState } from 'react';
import adminApi from '../api/adminApi';
import Modal from '../components/Modal';
import { Eye, Trash2, Mail, MailOpen } from 'lucide-react';

export default function ContactMessagesAdmin() {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [viewing, setViewing] = useState(null);

    const load = () => {
        setLoading(true);
        adminApi
            .get('/contact-messages')
            .then((res) => setMessages(res.data?.data || []))
            .catch(() => setError('Failed to load contact messages.'))
            .finally(() => setLoading(false));
    };

    useEffect(load, []);

    const openMessage = async (msg) => {
        setViewing(msg);
        if (!msg.is_read) {
            try {
                await adminApi.patch(`/contact-messages/${msg.id}/mark-as-read`);
                load();
            } catch {
                // non-critical, ignore
            }
        }
    };

    const handleDelete = async (msg) => {
        if (!window.confirm(`Delete message from "${msg.name}"?`)) return;
        try {
            await adminApi.delete(`/contact-messages/${msg.id}`);
            if (viewing?.id === msg.id) setViewing(null);
            load();
        } catch {
            alert('Failed to delete message.');
        }
    };

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Contact Messages</h1>

            {error && <p className="text-red-600 mb-4 text-sm">{error}</p>}

            <div className="bg-white rounded-xl border overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-500 text-left">
                        <tr>
                            <th className="px-4 py-3"></th>
                            <th className="px-4 py-3">Name</th>
                            <th className="px-4 py-3">Contact</th>
                            <th className="px-4 py-3">Message</th>
                            <th className="px-4 py-3">Received</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="px-4 py-6 text-center text-gray-400">
                                    Loading...
                                </td>
                            </tr>
                        ) : messages.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-4 py-6 text-center text-gray-400">
                                    No messages yet.
                                </td>
                            </tr>
                        ) : (
                            messages.map((m) => (
                                <tr key={m.id} className={!m.is_read ? 'bg-blue-50/40 font-medium' : ''}>
                                    <td className="px-4 py-3">
                                        {m.is_read ? (
                                            <MailOpen size={16} className="text-gray-300" />
                                        ) : (
                                            <Mail size={16} className="text-blue-500" />
                                        )}
                                    </td>
                                    <td className="px-4 py-3">{m.name}</td>
                                    <td className="px-4 py-3 text-gray-500">
                                        {m.email}
                                        {m.phone ? ` · ${m.phone}` : ''}
                                    </td>
                                    <td className="px-4 py-3 text-gray-500 max-w-xs truncate">{m.message}</td>
                                    <td className="px-4 py-3 text-gray-500">
                                        {m.created_at ? new Date(m.created_at).toLocaleDateString() : '—'}
                                    </td>
                                    <td className="px-4 py-3 text-right space-x-3">
                                        <button onClick={() => openMessage(m)} type="button" className="text-gray-500 hover:text-gray-900" title="View">
                                            <Eye size={16} />
                                        </button>
                                        <button onClick={() => handleDelete(m)} type="button" className="text-red-500 hover:text-red-700" title="Delete">
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <Modal open={!!viewing} onClose={() => setViewing(null)} title={viewing?.name}>
                {viewing && (
                    <div className="space-y-3 text-sm">
                        <div>
                            <span className="text-gray-400">Email:</span> {viewing.email}
                        </div>
                        {viewing.phone && (
                            <div>
                                <span className="text-gray-400">Phone:</span> {viewing.phone}
                            </div>
                        )}
                        <div>
                            <span className="text-gray-400">Received:</span>{' '}
                            {viewing.created_at ? new Date(viewing.created_at).toLocaleString() : '—'}
                        </div>
                        <div className="pt-2 border-t">
                            <p className="whitespace-pre-wrap">{viewing.message}</p>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
