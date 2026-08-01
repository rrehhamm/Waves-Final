import React, { useEffect, useState } from 'react';
import adminApi from '../api/adminApi';
import { Card, PageHeader, StatCard, Badge, EmptyState } from '../components/ui';
import { useLanguage } from '../../context/LanguageContext';
import { formatCurrency } from '../../utils/currency';
import {
    Package,
    Users,
    DollarSign,
    Clock,
    CheckCircle2,
    ShoppingCart,
    TrendingUp,
    BarChart3,
    ArrowUpRight,
} from 'lucide-react';

const statusTone = {
    pending: 'slate',
    confirmed: 'blue',
    processing: 'amber',
    completed: 'emerald',
    cancelled: 'rose',
};

function WeeklyActivityChart({ data }) {
    const max = Math.max(1, ...data.map((d) => d.orders_count));

    return (
        <div className="flex items-end justify-between gap-2 sm:gap-4 pt-4">
            {data.map((d) => {
                const heightPct = d.orders_count > 0 ? Math.max(8, (d.orders_count / max) * 100) : 0;
                return (
                    <div key={d.date} className="flex-1 flex flex-col items-center gap-2 group">
                        <span className="text-[11px] font-semibold text-slate-400 group-hover:text-[#4E7699] transition-colors">
                            {d.orders_count}
                        </span>
                        <div className="w-full max-w-10 h-32 flex items-end justify-center rounded-t-lg bg-slate-100/70 overflow-hidden">
                            <div
                                className="w-full rounded-t-lg bg-gradient-to-t from-[#4E7699] to-[#81A6C6] group-hover:from-[#3A5A73] group-hover:to-[#6f93b3] transition-all duration-300"
                                style={{ height: `${heightPct}%` }}
                            />
                        </div>
                        <span className="text-[11px] font-medium text-slate-400">{d.label}</span>
                    </div>
                );
            })}
        </div>
    );
}

export default function Dashboard() {
    const { t } = useLanguage();
    const [stats, setStats] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        adminApi
            .get('/dashboard')
            .then((res) => setStats(res.data?.data || {}))
            .catch(() => setError(t('admin.dashboard.failedLoad')))
            .finally(() => setLoading(false));
    }, []);

    const cards = [
        { key: 'orders_count', label: t('admin.dashboard.totalOrders'), icon: ShoppingCart, tone: 'indigo' },
        { key: 'products_count', label: t('admin.dashboard.totalProducts'), icon: Package, tone: 'blue' },
        { key: 'customers_count', label: t('admin.dashboard.totalCustomers'), icon: Users, tone: 'violet' },
        {
            key: 'revenue',
            label: t('admin.dashboard.revenue'),
            icon: DollarSign,
            tone: 'emerald',
            format: (v) => formatCurrency(v || 0),
        },
        { key: 'pending_orders_count', label: t('admin.dashboard.pendingOrders'), icon: Clock, tone: 'amber' },
        { key: 'delivered_orders_count', label: t('admin.dashboard.deliveredOrders'), icon: CheckCircle2, tone: 'emerald' },
    ];

    const weekly = stats?.weekly_activity || [];
    const bestSellers = stats?.best_selling_products || [];
    const recentOrders = stats?.recent_orders || [];
    const weekOrders = weekly.reduce((sum, d) => sum + d.orders_count, 0);
    const weekRevenue = weekly.reduce((sum, d) => sum + d.revenue, 0);

    return (
        <div>
            <PageHeader title={t('admin.dashboard.title')} subtitle={t('admin.dashboard.subtitle')} />

            {error && (
                <div className="rounded-xl bg-rose-50 border border-rose-100 px-4 py-3 text-sm text-rose-600 font-medium mb-6">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6 gap-4 mb-6">
                {cards.map(({ key, label, icon, tone, format }) => (
                    <StatCard
                        key={key}
                        label={label}
                        icon={icon}
                        tone={tone}
                        value={loading ? '—' : format ? format(stats?.[key]) : (stats?.[key] ?? 0)}
                    />
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <Card className="lg:col-span-2 p-6">
                    <div className="flex items-center justify-between mb-1">
                        <div>
                            <h3 className="text-sm font-bold text-slate-900">{t('admin.dashboard.weeklyActivity')}</h3>
                            <p className="text-xs text-slate-400 mt-0.5">{t('admin.dashboard.weeklyActivitySubtitle')}</p>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                            <TrendingUp size={13} />
                            {weekOrders} {t('admin.dashboard.ordersSuffix')}
                        </div>
                    </div>

                    {loading ? (
                        <div className="h-44 flex items-center justify-center text-sm text-slate-300">{t('admin.dashboard.loadingChart')}</div>
                    ) : weekly.length === 0 ? (
                        <EmptyState icon={BarChart3} title={t('admin.dashboard.noActivityYet')} subtitle={t('admin.dashboard.activityHint')} />
                    ) : (
                        <WeeklyActivityChart data={weekly} />
                    )}

                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100 text-xs text-slate-400">
                        <span>{t('admin.dashboard.revenueThisWeek')}</span>
                        <span className="font-bold text-slate-700">{formatCurrency(weekRevenue)}</span>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-slate-900">{t('admin.dashboard.bestSellingProducts')}</h3>
                    </div>

                    {loading ? (
                        <div className="h-44 flex items-center justify-center text-sm text-slate-300">{t('admin.common.loading')}</div>
                    ) : bestSellers.length === 0 ? (
                        <EmptyState icon={Package} title={t('admin.dashboard.noSalesYet')} subtitle={t('admin.dashboard.bestSellersHint')} />
                    ) : (
                        <ul className="space-y-3">
                            {bestSellers.map((p, i) => (
                                <li key={p.product_id || i} className="flex items-center gap-3">
                                    <span className="w-5 text-xs font-bold text-slate-300">{i + 1}</span>
                                    {p.main_image ? (
                                        <img src={p.main_image} alt={p.name} className="w-10 h-10 rounded-lg object-cover bg-slate-100 shrink-0" />
                                    ) : (
                                        <div className="w-10 h-10 rounded-lg bg-slate-100 shrink-0" />
                                    )}
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-semibold text-slate-800 truncate">{p.name}</p>
                                        <p className="text-xs text-slate-400">{p.total_quantity} {t('admin.dashboard.sold')}</p>
                                    </div>
                                    <span className="text-xs font-bold text-slate-600 shrink-0">
                                        {formatCurrency(p.total_revenue)}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </Card>
            </div>

            <Card className="overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <h3 className="text-sm font-bold text-slate-900">{t('admin.dashboard.recentOrders')}</h3>
                    <a
                        href="/admin/orders"
                        className="text-xs font-semibold text-[#4E7699] hover:text-[#3A5A73] flex items-center gap-1"
                    >
                        {t('admin.dashboard.viewAll')} <ArrowUpRight size={13} />
                    </a>
                </div>

                {loading ? (
                    <div className="py-10 text-center text-sm text-slate-300">{t('admin.common.loading')}</div>
                ) : recentOrders.length === 0 ? (
                    <EmptyState icon={ShoppingCart} title={t('admin.dashboard.noOrdersYet')} subtitle={t('admin.dashboard.newOrdersHint')} />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="text-slate-400 text-left">
                                <tr>
                                    <th className="px-6 py-2.5 font-semibold text-xs uppercase tracking-wide">{t('admin.dashboard.order')}</th>
                                    <th className="px-6 py-2.5 font-semibold text-xs uppercase tracking-wide">{t('admin.dashboard.customer')}</th>
                                    <th className="px-6 py-2.5 font-semibold text-xs uppercase tracking-wide">{t('admin.common.total')}</th>
                                    <th className="px-6 py-2.5 font-semibold text-xs uppercase tracking-wide">{t('admin.common.status')}</th>
                                    <th className="px-6 py-2.5 font-semibold text-xs uppercase tracking-wide">{t('admin.common.date')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {recentOrders.map((o) => (
                                    <tr key={o.id} className="hover:bg-slate-50/70 transition-colors">
                                        <td className="px-6 py-3.5 font-semibold text-slate-800">{o.order_number}</td>
                                        <td className="px-6 py-3.5 text-slate-600">{o.customer_name}</td>
                                        <td className="px-6 py-3.5 font-semibold text-slate-800">{formatCurrency(o.total_price)}</td>
                                        <td className="px-6 py-3.5">
                                            <Badge tone={statusTone[o.status] || 'slate'}>{t(`orderStatus.${o.status}`)}</Badge>
                                        </td>
                                        <td className="px-6 py-3.5 text-slate-400">
                                            {o.created_at ? new Date(o.created_at).toLocaleDateString() : '—'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>
        </div>
    );
}
