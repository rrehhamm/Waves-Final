import React, { useEffect, useState } from 'react';
import adminApi from '../api/adminApi';
import Modal from '../components/Modal';
import ProductCard from '../../components/ProductCard';
import { Eye, Trash2, RotateCcw, XCircle, ShoppingCart, Trash } from 'lucide-react';
import { Card, PageHeader, IconButton, Badge, Tabs, EmptyState, TableSkeletonRow, Pagination, Select } from '../components/ui';
import { useAdminLanguage } from '../context/AdminLanguageContext';
import { formatCurrency } from '../../utils/currency';

const STATUSES = ['pending', 'confirmed', 'processing', 'completed', 'cancelled'];

const statusTone = {
    pending: 'slate',
    confirmed: 'blue',
    processing: 'amber',
    completed: 'emerald',
    cancelled: 'rose',
};

export default function OrdersAdmin() {
    const { t } = useAdminLanguage();
    const [tab, setTab] = useState('active');
    const [orders, setOrders] = useState([]);
    const [meta, setMeta] = useState(null);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [viewing, setViewing] = useState(null);
    const [updatingStatus, setUpdatingStatus] = useState(false);

    const load = () => {
        setLoading(true);
        setError('');
        const path = tab === 'trashed' ? '/orders/trashed' : '/orders';
        adminApi
            .get(path, { params: { page } })
            .then((res) => {
                setOrders(res.data?.data || []);
                setMeta(res.data?.meta || null);
            })
            .catch(() => setError(t('orders.failedLoad')))
            .finally(() => setLoading(false));
    };

    useEffect(load, [tab, page]);

    const handleStatusChange = async (order, status) => {
        setUpdatingStatus(true);
        try {
            const res = await adminApi.patch(`/orders/${order.id}/status`, { status });
            const updated = res.data?.data;
            setOrders((prev) => prev.map((o) => (o.id === order.id ? updated : o)));
            if (viewing?.id === order.id) setViewing(updated);
        } catch {
            alert(t('orders.failedUpdateStatus'));
        } finally {
            setUpdatingStatus(false);
        }
    };

    const handleDelete = async (order) => {
        if (!window.confirm(`${t('orders.deleteConfirm')} "${order.order_number}" ${t('orders.deleteConfirmSuffix')}`)) return;
        try {
            await adminApi.delete(`/orders/${order.id}`);
            setViewing(null);
            load();
        } catch {
            alert(t('orders.failedDelete'));
        }
    };

    const handleRestore = async (order) => {
        if (!window.confirm(`${t('orders.restoreConfirm')} "${order.order_number}"?`)) return;
        try {
            await adminApi.post(`/orders/${order.id}/restore`);
            setViewing(null);
            load();
        } catch {
            alert(t('orders.failedRestore'));
        }
    };

    const handleForceDelete = async (order) => {
        if (!window.confirm(`${t('orders.permanentDeleteConfirm')} "${order.order_number}"? ${t('orders.permanentDeleteWarning')}`)) return;
        try {
            await adminApi.delete(`/orders/${order.id}/force`);
            setViewing(null);
            load();
        } catch {
            alert(t('orders.failedPermanentDelete'));
        }
    };

    return (
        <div>
            <PageHeader title={t('orders.title')} subtitle={t('orders.subtitle')} />

            <div className="flex items-center justify-between mb-4">
                <Tabs
                    value={tab}
                    onChange={(v) => {
                        setTab(v);
                        setPage(1);
                    }}
                    options={[
                        { value: 'active', label: t('orders.tabActive') },
                        { value: 'trashed', label: t('orders.tabTrashed') },
                    ]}
                />
            </div>

            {error && (
                <div className="rounded-xl bg-rose-50 border border-rose-100 px-4 py-3 text-sm text-rose-600 font-medium mb-4">
                    {error}
                </div>
            )}

            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="text-left border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-3.5 font-semibold text-xs uppercase tracking-wide text-slate-400">{t('orders.orderNumber')}</th>
                                <th className="px-6 py-3.5 font-semibold text-xs uppercase tracking-wide text-slate-400">{t('orders.customer')}</th>
                                <th className="px-6 py-3.5 font-semibold text-xs uppercase tracking-wide text-slate-400">{t('orders.total')}</th>
                                <th className="px-6 py-3.5 font-semibold text-xs uppercase tracking-wide text-slate-400">{t('orders.status')}</th>
                                <th className="px-6 py-3.5 font-semibold text-xs uppercase tracking-wide text-slate-400">{t('orders.date')}</th>
                                <th className="px-6 py-3.5 font-semibold text-xs uppercase tracking-wide text-slate-400 text-right">{t('common.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <TableSkeletonRow cols={6} />
                            ) : orders.length === 0 ? (
                                <tr>
                                    <td colSpan={6}>
                                        <EmptyState
                                            icon={tab === 'trashed' ? Trash : ShoppingCart}
                                            title={tab === 'trashed' ? t('orders.trashEmpty') : t('orders.noOrders')}
                                            subtitle={tab === 'trashed' ? t('orders.trashHint') : t('orders.newOrdersHint')}
                                        />
                                    </td>
                                </tr>
                            ) : (
                                orders.map((o) => (
                                    <tr key={o.id} onClick={() => setViewing(o)} className="hover:bg-slate-50/70 transition-colors cursor-pointer">
                                        <td className="px-6 py-3.5 font-semibold text-slate-800">{o.order_number}</td>
                                        <td className="px-6 py-3.5 text-slate-600">{o.customer_name}</td>
                                        <td className="px-6 py-3.5 font-semibold text-slate-800">{formatCurrency(o.total_price)}</td>
                                        <td className="px-6 py-3.5">
                                            <Badge tone={statusTone[o.status] || 'slate'}>{t(`orderStatus.${o.status}`)}</Badge>
                                        </td>
                                        <td className="px-6 py-3.5 text-slate-400">
                                            {o.created_at ? new Date(o.created_at).toLocaleDateString() : '—'}
                                        </td>
                                        <td className="px-6 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex items-center justify-end gap-1.5">
                                                <IconButton icon={Eye} tone="primary" onClick={() => setViewing(o)} title={t('common.view')} />
                                                {tab === 'active' ? (
                                                    <IconButton icon={Trash2} tone="danger" onClick={() => handleDelete(o)} title={t('common.delete')} />
                                                ) : (
                                                    <>
                                                        <IconButton icon={RotateCcw} tone="success" onClick={() => handleRestore(o)} title={t('common.restore')} />
                                                        <IconButton icon={XCircle} tone="danger" onClick={() => handleForceDelete(o)} title={t('common.permanentlyDelete')} />
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                <Pagination meta={meta} page={page} onPageChange={setPage} />
            </Card>

            <Modal open={!!viewing} onClose={() => setViewing(null)} title={viewing?.order_number} subtitle={t('orders.orderDetails')} wide>
                {viewing && (
                    <div className="space-y-5 text-sm">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            <div className="rounded-xl bg-slate-50 px-3.5 py-2.5">
                                <span className="text-xs text-slate-400 font-semibold block mb-0.5">{t('orders.customer')}</span>
                                <span className="text-slate-800 font-medium">{viewing.customer_name}</span>
                            </div>
                            <div className="rounded-xl bg-slate-50 px-3.5 py-2.5">
                                <span className="text-xs text-slate-400 font-semibold block mb-0.5">{t('orders.phone')}</span>
                                <span className="text-slate-800 font-medium">{viewing.customer_phone}</span>
                            </div>
                            <div className="rounded-xl bg-slate-50 px-3.5 py-2.5">
                                <span className="text-xs text-slate-400 font-semibold block mb-0.5">{t('orders.email')}</span>
                                <span className="text-slate-800 font-medium">{viewing.customer_email || '—'}</span>
                            </div>
                            <div className="rounded-xl bg-slate-50 px-3.5 py-2.5 col-span-2 sm:col-span-3">
                                <span className="text-xs text-slate-400 font-semibold block mb-0.5">{t('orders.address')}</span>
                                <span className="text-slate-800 font-medium">{viewing.customer_address || '—'}</span>
                            </div>
                        </div>

                        <div>
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide block mb-2.5">{t('orders.items')}</span>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                {(viewing.items || []).map((item) => {
                                    const hasItemDiscount = Number(item.discount_percent) > 0;
                                    const subtotalBeforeDiscount = item.original_price * item.quantity;

                                    return (
                                        <div key={item.id} className="border border-slate-200 rounded-2xl p-3.5 bg-slate-50/60">
                                            <ProductCard
                                                product={{
                                                    id: item.product_id,
                                                    name: item.product_name,
                                                    price: item.original_price,
                                                    final_price: item.price,
                                                    discount_percent: item.discount_percent,
                                                    main_image: item.main_image,
                                                }}
                                            />

                                            <div className="mt-3 pt-3 border-t border-slate-200 space-y-1.5 text-xs">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-slate-500">{t('orders.priceBeforeDiscount')}</span>
                                                    <span className={`font-medium text-slate-900 ${hasItemDiscount ? 'line-through text-slate-400' : ''}`}>
                                                        {formatCurrency(item.original_price)}
                                                    </span>
                                                </div>

                                                {hasItemDiscount && (
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-slate-500">{t('orders.priceAfterDiscount')} ({item.discount_percent}% {t('orders.off')})</span>
                                                        <span className="font-medium text-emerald-600">{formatCurrency(item.price)}</span>
                                                    </div>
                                                )}

                                                {item.color && (
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-slate-500">{t('orders.color')}</span>
                                                        <span className="font-medium text-slate-900">{item.color}</span>
                                                    </div>
                                                )}

                                                <div className="flex items-center justify-between">
                                                    <span className="text-slate-500">{t('orders.quantity')}</span>
                                                    <span className="font-medium text-slate-900">{item.quantity}</span>
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <span className="text-slate-500">
                                                        {t('orders.subtotal')} {hasItemDiscount ? t('orders.subtotalBeforeDiscount') : ''}
                                                    </span>
                                                    <span className={`font-medium text-slate-900 ${hasItemDiscount ? 'line-through text-slate-400' : ''}`}>
                                                        {formatCurrency(subtotalBeforeDiscount)}
                                                    </span>
                                                </div>

                                                <div className="flex items-center justify-between pt-1.5 mt-1 border-t border-slate-200">
                                                    <span className="text-slate-700 font-semibold">{t('orders.totalAfterDiscount')}</span>
                                                    <span className="font-bold text-slate-900">{formatCurrency(item.subtotal)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-right border-t border-slate-100 pt-4">
                            <div>
                                <span className="text-slate-400 block text-xs font-semibold">{t('orders.originalPrice')}</span>
                                <span className="font-semibold text-slate-800">{formatCurrency(viewing.subtotal_price)}</span>
                            </div>
                            <div>
                                <span className="text-slate-400 block text-xs font-semibold">{t('orders.discount')}</span>
                                <span className="font-semibold text-slate-800">-{formatCurrency(viewing.discount_amount)}</span>
                                {viewing.first_order_discount_applied && (
                                    <div className="text-[11px] text-emerald-600 font-medium">{t('orders.includesFirstOrder')}</div>
                                )}
                            </div>
                            <div>
                                <span className="text-slate-400 block text-xs font-semibold">{t('orders.delivery')}</span>
                                <span className="font-semibold text-slate-800">+{formatCurrency(viewing.delivery_fee ?? 0)}</span>
                            </div>
                            <div>
                                <span className="text-slate-400 block text-xs font-semibold">{t('orders.totalAfterDiscount')}</span>
                                <span className="font-bold text-slate-900">{formatCurrency(viewing.total_price)}</span>
                            </div>
                        </div>

                        {viewing.deleted_at ? (
                            <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-100">
                                <div>
                                    <span className="text-rose-500 text-xs font-semibold block">
                                        {t('orders.deletedOn')} {new Date(viewing.deleted_at).toLocaleString()}
                                    </span>
                                    <span className="text-slate-400 text-xs">{t('orders.inRecycleBin')}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleRestore(viewing)}
                                        type="button"
                                        className="inline-flex items-center gap-1.5 text-emerald-600 hover:text-emerald-700 text-sm font-semibold"
                                    >
                                        <RotateCcw size={15} /> {t('common.restore')}
                                    </button>
                                    <button
                                        onClick={() => handleForceDelete(viewing)}
                                        type="button"
                                        className="inline-flex items-center gap-1.5 text-rose-500 hover:text-rose-600 text-sm font-semibold"
                                    >
                                        <XCircle size={15} /> {t('orders.deletePermanently')}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-100">
                                <div className="flex items-center gap-3">
                                    <span className="text-slate-400 text-xs font-semibold">{t('orders.status')}</span>
                                    <Select
                                        value={viewing.status}
                                        disabled={updatingStatus}
                                        onChange={(e) => handleStatusChange(viewing, e.target.value)}
                                        className="capitalize py-1.5 w-40"
                                    >
                                        {STATUSES.map((s) => (
                                            <option key={s} value={s}>
                                                {t(`orderStatus.${s}`)}
                                            </option>
                                        ))}
                                    </Select>
                                </div>
                                <button
                                    onClick={() => handleDelete(viewing)}
                                    type="button"
                                    className="inline-flex items-center gap-1.5 text-rose-500 hover:text-rose-600 text-sm font-semibold"
                                >
                                    <Trash2 size={15} /> {t('orders.deleteAction')}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
}
