import React, { useEffect, useState } from 'react';
import adminApi from '../api/adminApi';
import Modal from '../components/Modal';
import { Eye, Trash2, Mail, MailOpen, Phone } from 'lucide-react';
import { Card, PageHeader, IconButton, EmptyState, TableSkeletonRow, FormError } from '../components/ui';
import { useAdminLanguage } from '../context/AdminLanguageContext';

export default function ContactMessagesAdmin() {
    const { t } = useAdminLanguage();
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [viewing, setViewing] = useState(null);

    const load = () => {
        setLoading(true);
        adminApi
            .get('/contact-messages')
            .then((res) => setMessages(res.data?.data || []))
            .catch(() => setError(t('messages.failedLoad')))
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
            }
        }
    };

    const handleDelete = async (msg) => {
        if (!window.confirm(`${t('messages.deleteConfirm')} "${msg.name}"?`)) return;
        try {
            await adminApi.delete(`/contact-messages/${msg.id}`);
            if (viewing?.id === msg.id) setViewing(null);
            load();
        } catch {
            alert(t('messages.failedDelete'));
        }
    };

    const unreadCount = messages.filter((m) => !m.is_read).length;

    return (
        <div>
            <PageHeader
                title={t('messages.title')}
                subtitle={unreadCount > 0 ? t(unreadCount === 1 ? 'messages.unreadCount' : 'messages.unreadCountPlural', { count: unreadCount }) : t('messages.allRead')}
            />

            {error && <div className="mb-4"><FormError message={error} /></div>}

            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="text-left border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-3.5 w-10"></th>
                                <th className="px-6 py-3.5 font-semibold text-xs uppercase tracking-wide text-slate-400">{t('messages.name')}</th>
                                <th className="px-6 py-3.5 font-semibold text-xs uppercase tracking-wide text-slate-400">{t('messages.contact')}</th>
                                <th className="px-6 py-3.5 font-semibold text-xs uppercase tracking-wide text-slate-400">{t('messages.message')}</th>
                                <th className="px-6 py-3.5 font-semibold text-xs uppercase tracking-wide text-slate-400">{t('messages.received')}</th>
                                <th className="px-6 py-3.5 font-semibold text-xs uppercase tracking-wide text-slate-400 text-right">{t('common.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <TableSkeletonRow cols={6} />
                            ) : messages.length === 0 ? (
                                <tr>
                                    <td colSpan={6}>
                                        <EmptyState icon={Mail} title={t('messages.noMessages')} subtitle={t('messages.noMessagesHint')} />
                                    </td>
                                </tr>
                            ) : (
                                messages.map((m) => (
                                    <tr
                                        key={m.id}
                                        onClick={() => openMessage(m)}
                                        className={`cursor-pointer transition-colors ${!m.is_read ? 'bg-[#81A6C6]/8 hover:bg-[#81A6C6]/12' : 'hover:bg-slate-50/70'}`}
                                    >
                                        <td className="px-6 py-3.5">
                                            {m.is_read ? (
                                                <MailOpen size={16} className="text-slate-300" />
                                            ) : (
                                                <span className="relative inline-flex">
                                                    <Mail size={16} className="text-[#4E7699]" />
                                                    <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-[#4E7699]" />
                                                </span>
                                            )}
                                        </td>
                                        <td className={`px-6 py-3.5 ${!m.is_read ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
                                            {m.name}
                                        </td>
                                        <td className="px-6 py-3.5 text-slate-500">
                                            {m.email}
                                            {m.phone ? ` · ${m.phone}` : ''}
                                        </td>
                                        <td className="px-6 py-3.5 text-slate-500 max-w-xs truncate">{m.message}</td>
                                        <td className="px-6 py-3.5 text-slate-400">
                                            {m.created_at ? new Date(m.created_at).toLocaleDateString() : '—'}
                                        </td>
                                        <td className="px-6 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex items-center justify-end gap-1.5">
                                                <IconButton icon={Eye} tone="primary" onClick={() => openMessage(m)} title={t('common.view')} />
                                                <IconButton icon={Trash2} tone="danger" onClick={() => handleDelete(m)} title={t('common.delete')} />
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            <Modal open={!!viewing} onClose={() => setViewing(null)} title={viewing?.name} subtitle={t('messages.title')}>
                {viewing && (
                    <div className="space-y-4 text-sm">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="rounded-xl bg-slate-50 px-3.5 py-2.5">
                                <span className="text-xs text-slate-400 font-semibold block mb-0.5">{t('messages.email')}</span>
                                <span className="text-slate-800 font-medium">{viewing.email}</span>
                            </div>
                            {viewing.phone && (
                                <div className="rounded-xl bg-slate-50 px-3.5 py-2.5">
                                    <span className="text-xs text-slate-400 font-semibold block mb-0.5 flex items-center gap-1">
                                        <Phone size={11} /> {t('messages.phone')}
                                    </span>
                                    <span className="text-slate-800 font-medium">{viewing.phone}</span>
                                </div>
                            )}
                        </div>
                        <div className="text-xs text-slate-400">
                            {t('messages.received')} {viewing.created_at ? new Date(viewing.created_at).toLocaleString() : '—'}
                        </div>
                        <div className="pt-3 border-t border-slate-100">
                            <p className="whitespace-pre-wrap text-slate-700 leading-relaxed">{viewing.message}</p>
                        </div>
                        <div className="flex justify-end pt-2">
                            <button
                                onClick={() => handleDelete(viewing)}
                                type="button"
                                className="inline-flex items-center gap-1.5 text-sm font-semibold text-rose-600 hover:text-rose-700"
                            >
                                <Trash2 size={15} /> {t('messages.deleteMessage')}
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
