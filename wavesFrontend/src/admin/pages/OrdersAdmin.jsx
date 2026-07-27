import React, { useEffect, useState } from 'react';
import adminApi from '../api/adminApi';
import Modal from '../components/Modal';
import { Eye } from 'lucide-react';

const STATUSES = ['pending', 'confirmed', 'processing', 'completed', 'cancelled'];

const statusColor = {
    pending: 'bg-gray-100 text-gray-600',
    confirmed: 'bg-blue-100 text-blue-700',
    processing: 'bg-amber-100 text-amber-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
};

export default function OrdersAdmin() {
    const [orders, setOrders] = useState([]);
    const [meta, setMeta] = useState(null);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [viewing, setViewing] = useState(null);
    const [updatingStatus, setUpdatingStatus] = useState(false);

    const load = () => {
        setLoading(true);
        adminApi
            .get('/orders', { params: { page } })
            .then((res) => {
                setOrders(res.data?.data || []);
                setMeta(res.data?.meta || null);
            })
            .catch(() => setError('Failed to load orders.'))
            .finally(() => setLoading(false));
    };

    useEffect(load, [page]);

    const handleStatusChange = async (order, status) => {
        setUpdatingStatus(true);
        try {
            const res = await adminApi.patch(`/orders/${order.id}/status`, { status });
            const updated = res.data?.data;
            setOrders((prev) => prev.map((o) => (o.id === order.id ? updated : o)));
            if (viewing?.id === order.id) setViewing(updated);
        } catch {
            alert('Failed to update order status.');
        } finally {
            setUpdatingStatus(false);
        }
    };

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Orders</h1>

            {error && <p className="text-red-600 mb-4 text-sm">{error}</p>}

            <div className="bg-white rounded-xl border overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-500 text-left">
                        <tr>
                            <th className="px-4 py-3">Order #</th>
                            <th className="px-4 py-3">Customer</th>
                            <th className="px-4 py-3">Total</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3">Date</th>
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
                        ) : orders.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-4 py-6 text-center text-gray-400">
                                    No orders yet.
                                </td>
                            </tr>
                        ) : (
                            orders.map((o) => (
                                <tr key={o.id}>
                                    <td className="px-4 py-3 font-medium">{o.order_number}</td>
                                    <td className="px-4 py-3">{o.customer_name}</td>
                                    <td className="px-4 py-3">${o.total_price}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${statusColor[o.status] || 'bg-gray-100'}`}>
                                            {o.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-gray-500">
                                        {o.created_at ? new Date(o.created_at).toLocaleDateString() : '—'}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <button onClick={() => setViewing(o)} type="button" className="text-gray-500 hover:text-gray-900" title="View">
                                            <Eye size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {meta && meta.last_page > 1 && (
                <div className="flex items-center justify-center gap-4 mt-4 text-sm">
                    <button
                        disabled={page <= 1}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        type="button"
                        className="px-3 py-1.5 rounded-lg border disabled:opacity-40"
                    >
                        Prev
                    </button>
                    <span className="text-gray-500">
                        Page {meta.current_page} of {meta.last_page}
                    </span>
                    <button
                        disabled={page >= meta.last_page}
                        onClick={() => setPage((p) => p + 1)}
                        type="button"
                        className="px-3 py-1.5 rounded-lg border disabled:opacity-40"
                    >
                        Next
                    </button>
                </div>
            )}

            <Modal open={!!viewing} onClose={() => setViewing(null)} title={viewing?.order_number} wide>
                {viewing && (
                    <div className="space-y-4 text-sm">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <span className="text-gray-400 block">Customer</span>
                                {viewing.customer_name}
                            </div>
                            <div>
                                <span className="text-gray-400 block">Phone</span>
                                {viewing.customer_phone}
                            </div>
                            <div>
                                <span className="text-gray-400 block">Email</span>
                                {viewing.customer_email || '—'}
                            </div>
                            <div>
                                <span className="text-gray-400 block">Address</span>
                                {viewing.customer_address || '—'}
                            </div>
                        </div>

                        <div>
                            <span className="text-gray-400 block mb-2">Items</span>
                            <div className="border rounded-lg divide-y">
                                {(viewing.items || []).map((item) => (
                                    <div key={item.id} className="flex items-center justify-between px-3 py-2">
                                        <span>
                                            {item.product_name} × {item.quantity}
                                        </span>
                                        <span className="font-medium">${item.subtotal}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3 text-right border-t pt-3">
                            <div>
                                <span className="text-gray-400 block">Subtotal</span>${viewing.subtotal_price}
                            </div>
                            <div>
                                <span className="text-gray-400 block">Discount</span>-${viewing.discount_amount}
                                {viewing.first_order_discount_applied && (
                                    <div className="text-xs text-green-600">First order</div>
                                )}
                            </div>
                            <div>
                                <span className="text-gray-400 block">Total</span>
                                <span className="font-bold">${viewing.total_price}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 pt-2">
                            <span className="text-gray-400">Status:</span>
                            <select
                                value={viewing.status}
                                disabled={updatingStatus}
                                onChange={(e) => handleStatusChange(viewing, e.target.value)}
                                className="border rounded-lg px-3 py-1.5 text-sm capitalize"
                            >
                                {STATUSES.map((s) => (
                                    <option key={s} value={s}>
                                        {s}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
