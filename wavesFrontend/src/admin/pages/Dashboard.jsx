import React, { useEffect, useState } from 'react';
import adminApi from '../api/adminApi';
import {
    Package,
    FolderTree,
    Tags,
    GalleryHorizontal,
    Mail,
    MailOpen,
    Users,
    ShoppingCart,
} from 'lucide-react';

const cards = [
    { key: 'products_count', label: 'Products', icon: Package, color: 'bg-blue-500' },
    { key: 'categories_count', label: 'Categories', icon: FolderTree, color: 'bg-emerald-500' },
    { key: 'brands_count', label: 'Brands', icon: Tags, color: 'bg-purple-500' },
    { key: 'gallery_count', label: 'Gallery Images', icon: GalleryHorizontal, color: 'bg-amber-500' },
    { key: 'contact_messages_count', label: 'Contact Messages', icon: Mail, color: 'bg-pink-500' },
    { key: 'unread_messages_count', label: 'Unread Messages', icon: MailOpen, color: 'bg-red-500' },
    // customers_count comes from the real registered-user count (Customer Count Logic requirement)
    { key: 'customers_count', label: 'Customers', icon: Users, color: 'bg-cyan-500' },
    { key: 'orders_count', label: 'Orders', icon: ShoppingCart, color: 'bg-indigo-500' },
];

export default function Dashboard() {
    const [stats, setStats] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        adminApi
            .get('/dashboard')
            .then((res) => setStats(res.data?.data || {}))
            .catch(() => setError('Failed to load dashboard stats.'));
    }, []);

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

            {error && <p className="text-red-600 mb-4 text-sm">{error}</p>}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {cards.map(({ key, label, icon: Icon, color }) => (
                    <div key={key} className="bg-white rounded-xl border p-5 flex items-center gap-4">
                        <div className={`${color} text-white rounded-lg p-3 shrink-0`}>
                            <Icon size={22} />
                        </div>
                        <div>
                            <div className="text-2xl font-bold">{stats ? stats[key] ?? 0 : '—'}</div>
                            <div className="text-sm text-gray-500">{label}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
