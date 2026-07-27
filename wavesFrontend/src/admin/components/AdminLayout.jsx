import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import {
    LayoutDashboard,
    FolderTree,
    Tags,
    Package,
    Image as ImageIcon,
    GalleryHorizontal,
    Mail,
    ShoppingCart,
    LogOut,
    ExternalLink,
    PanelTop,
} from 'lucide-react';

const links = [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/admin/hero', label: 'Hero Section', icon: PanelTop },
    { to: '/admin/categories', label: 'Categories', icon: FolderTree },
    { to: '/admin/brands', label: 'Brands', icon: Tags },
    { to: '/admin/products', label: 'Products', icon: Package },
    { to: '/admin/banners', label: 'Banners', icon: ImageIcon },
    { to: '/admin/gallery', label: 'Gallery', icon: GalleryHorizontal },
    { to: '/admin/messages', label: 'Contact Messages', icon: Mail },
    { to: '/admin/orders', label: 'Orders', icon: ShoppingCart },
];

export default function AdminLayout() {
    const { admin, logout } = useAdminAuth();

    return (
        <div className="min-h-screen flex bg-gray-50 text-gray-900">
            <aside className="w-64 bg-gray-900 text-white flex flex-col shrink-0">
                <div className="px-6 py-5 text-xl font-bold tracking-wide border-b border-gray-800">
                    WAVES <span className="text-gray-400 font-normal text-sm">Admin</span>
                </div>

                <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                    {links.map(({ to, label, icon: Icon, end }) => (
                        <NavLink
                            key={to}
                            to={to}
                            end={end}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    isActive ? 'bg-white text-gray-900' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                                }`
                            }
                        >
                            <Icon size={18} />
                            {label}
                        </NavLink>
                    ))}
                </nav>

                <div className="px-3 py-4 border-t border-gray-800 space-y-1">
                    <a
                        href="/"
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                    >
                        <ExternalLink size={18} />
                        View Storefront
                    </a>
                    <button
                        onClick={logout}
                        type="button"
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                    >
                        <LogOut size={18} />
                        Logout
                    </button>
                </div>
            </aside>

            <div className="flex-1 flex flex-col min-w-0">
                <header className="h-16 bg-white border-b flex items-center justify-between px-6 shrink-0">
                    <div className="text-sm text-gray-500">Waves Admin Dashboard</div>
                    <div className="text-sm font-medium">{admin?.name || admin?.email}</div>
                </header>
                <main className="flex-1 overflow-y-auto p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
