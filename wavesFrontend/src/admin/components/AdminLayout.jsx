import React, { useEffect, useMemo, useRef, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import adminApi from '../api/adminApi';
import { useAdminLanguage } from '../context/AdminLanguageContext';
import '../admin.css';
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
    Settings,
    Search,
    Bell,
    ChevronsLeft,
    ChevronsRight,
    Menu,
    X,
    ChevronDown,
    Languages,
    Waves,
} from 'lucide-react';

function buildNavGroups(t) {
    return [
        {
            label: t('nav.overview'),
            items: [{ to: '/admin', label: t('nav.dashboard'), icon: LayoutDashboard, end: true }],
        },
        {
            label: t('nav.catalog'),
            items: [
                { to: '/admin/products', label: t('nav.products'), icon: Package },
                { to: '/admin/categories', label: t('nav.categories'), icon: FolderTree },
                { to: '/admin/brands', label: t('nav.brands'), icon: Tags },
            ],
        },
        {
            label: t('nav.content'),
            items: [
                { to: '/admin/hero', label: t('nav.heroSection'), icon: PanelTop },
                { to: '/admin/banners', label: t('nav.banners'), icon: ImageIcon },
                { to: '/admin/gallery', label: t('nav.gallery'), icon: GalleryHorizontal },
            ],
        },
        {
            label: t('nav.sales'),
            items: [{ to: '/admin/orders', label: t('nav.orders'), icon: ShoppingCart }],
        },
        {
            label: t('nav.support'),
            items: [{ to: '/admin/messages', label: t('nav.contactMessages'), icon: Mail }],
        },
        {
            label: t('nav.configuration'),
            items: [{ to: '/admin/settings', label: t('nav.settings'), icon: Settings }],
        },
    ];
}

export default function AdminLayout() {
    const { t, dir, language, toggleLanguage } = useAdminLanguage();
    const { admin, logout } = useAdminAuth();
    const navigate = useNavigate();

    const NAV_GROUPS = useMemo(() => buildNavGroups(t), [t]);
    const ALL_LINKS = useMemo(() => NAV_GROUPS.flatMap((g) => g.items), [NAV_GROUPS]);

    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [searchFocused, setSearchFocused] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [stats, setStats] = useState(null);
    const profileRef = useRef(null);

    useEffect(() => {
        adminApi
            .get('/dashboard')
            .then((res) => setStats(res.data?.data || null))
            .catch(() => { });
    }, []);

    useEffect(() => {
        const onClick = (e) => {
            if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
        };
        window.addEventListener('mousedown', onClick);
        return () => window.removeEventListener('mousedown', onClick);
    }, []);

    const matches = useMemo(() => {
        if (!query.trim()) return [];
        const q = query.trim().toLowerCase();
        return ALL_LINKS.filter((l) => l.label.toLowerCase().includes(q));
    }, [query]);

    const goTo = (to) => {
        navigate(to);
        setQuery('');
        setSearchFocused(false);
        setMobileOpen(false);
    };

    const unread = stats?.unread_messages_count || 0;

    return (
        <div dir={dir} lang={language} className="admin-shell min-h-screen flex bg-slate-50 text-slate-900 font-sans">
            {mobileOpen && (
                <div
                    className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-[1px] lg:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            <aside
                className={`fixed inset-y-0 start-0 z-40 flex flex-col bg-white border-e border-slate-200/80 transition-all duration-200 ease-out
                lg:static lg:translate-x-0
                ${mobileOpen ? 'translate-x-0' : 'ltr:-translate-x-full rtl:translate-x-full lg:translate-x-0'}
                ${collapsed ? 'w-[76px]' : 'w-64'}`}
            >
                <div className={`flex items-center h-16 shrink-0 border-b border-slate-100 ${collapsed ? 'justify-center px-2' : 'justify-between px-5'}`}>
                    <div className="flex items-center gap-2.5 overflow-hidden">
                        <div className="w-8 h-8 rounded-xl bg-black text-white flex items-center justify-center shrink-0 shadow-sm shadow-black/20">
                            <Waves size={16} />
                        </div>
                        {!collapsed && (
                            <div className="leading-tight">
                                <div className="text-sm font-extrabold tracking-tight text-slate-900">WAVES</div>
                                <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">{t('nav.adminPanel')}</div>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={() => setMobileOpen(false)}
                        type="button"
                        className="lg:hidden w-7 h-7 inline-flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100"
                    >
                        <X size={16} />
                    </button>
                </div>

                <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
                    {NAV_GROUPS.map((group) => (
                        <div key={group.label}>
                            {!collapsed && (
                                <div className="px-2.5 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                    {group.label}
                                </div>
                            )}
                            <div className="space-y-0.5">
                                {group.items.map(({ to, label, icon: Icon, end }) => (
                                    <NavLink
                                        key={to}
                                        to={to}
                                        end={end}
                                        onClick={() => setMobileOpen(false)}
                                        title={collapsed ? label : undefined}
                                        className={({ isActive }) =>
                                            `group relative flex items-center gap-3 rounded-xl text-sm font-medium transition-colors duration-150 ${collapsed ? 'justify-center px-0 py-2.5' : 'px-3 py-2.5'
                                            } ${isActive
                                                ? 'bg-[#81A6C6]/12 text-[#3A5A73]'
                                                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                            }`
                                        }
                                    >
                                        {({ isActive }) => (
                                            <>
                                                {isActive && (
                                                    <span className="absolute start-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-e-full bg-[#81A6C6]" />
                                                )}
                                                <Icon size={17} className="shrink-0" />
                                                {!collapsed && <span className="truncate">{label}</span>}
                                                {!collapsed && to === '/admin/messages' && unread > 0 && (
                                                    <span className="ms-auto inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold">
                                                        {unread}
                                                    </span>
                                                )}
                                            </>
                                        )}
                                    </NavLink>
                                ))}
                            </div>
                        </div>
                    ))}
                </nav>

                <div className="p-3 border-t border-slate-100 space-y-0.5">
                    <a
                        href="/"
                        target="_blank"
                        rel="noreferrer"
                        title={collapsed ? t('nav.viewStorefront') : undefined}
                        className={`flex items-center gap-3 rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors ${collapsed ? 'justify-center px-0 py-2.5' : 'px-3 py-2.5'
                            }`}
                    >
                        <ExternalLink size={17} className="shrink-0" />
                        {!collapsed && <span>{t('nav.viewStorefront')}</span>}
                    </a>
                    <button
                        onClick={() => setCollapsed((c) => !c)}
                        type="button"
                        className={`hidden lg:flex w-full items-center gap-3 rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors ${collapsed ? 'justify-center px-0 py-2.5' : 'px-3 py-2.5'
                            }`}
                    >
                        {collapsed
                            ? (dir === 'rtl' ? <ChevronsLeft size={17} /> : <ChevronsRight size={17} />)
                            : (dir === 'rtl' ? <ChevronsRight size={17} /> : <ChevronsLeft size={17} />)}
                        {!collapsed && <span>{t('nav.collapse')}</span>}
                    </button>
                </div>
            </aside>

            <div className={`flex-1 flex flex-col min-w-0 transition-all duration-200 ${collapsed ? 'lg:ml-0' : 'lg:ml-0'}`}>
                <header className="h-16 shrink-0 bg-white/90 backdrop-blur border-b border-slate-200/80 flex items-center gap-3 px-4 sm:px-6 sticky top-0 z-20">
                    <button
                        onClick={() => setMobileOpen(true)}
                        type="button"
                        className="lg:hidden w-9 h-9 inline-flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
                    >
                        <Menu size={18} />
                    </button>

                    <div className="relative flex-1 max-w-sm">
                        <Search size={15} className="absolute start-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onFocus={() => setSearchFocused(true)}
                            onBlur={() => setTimeout(() => setSearchFocused(false), 120)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && matches.length > 0) goTo(matches[0].to);
                                if (e.key === 'Escape') setQuery('');
                            }}
                            placeholder={t('nav.searchPlaceholder')}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 ps-9 pe-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#81A6C6]/25 focus:border-[#81A6C6] focus:bg-white transition-colors duration-150"
                        />
                        {searchFocused && matches.length > 0 && (
                            <div className="absolute mt-1.5 w-full bg-white rounded-xl border border-slate-200 shadow-lg shadow-slate-900/5 overflow-hidden z-30">
                                {matches.map((m) => (
                                    <button
                                        key={m.to}
                                        type="button"
                                        onMouseDown={() => goTo(m.to)}
                                        className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-slate-700 hover:bg-[#81A6C6]/10 hover:text-[#3A5A73] transition-colors"
                                    >
                                        <m.icon size={14} />
                                        {m.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="ms-auto flex items-center gap-2">
                        <button
                            onClick={toggleLanguage}
                            type="button"
                            title={language === 'en' ? 'التبديل إلى العربية' : 'Switch to English'}
                            className="w-9 h-9 inline-flex items-center justify-center gap-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors sm:w-auto sm:px-3"
                        >
                            <Languages size={17} />
                            <span className="hidden sm:inline text-xs font-semibold">
                                {language === 'en' ? 'العربية' : 'English'}
                            </span>
                        </button>

                        <NavLink
                            to="/admin/messages"
                            className="relative w-9 h-9 inline-flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                            title={t('nav.contactMessages')}
                        >
                            <Bell size={17} />
                            {unread > 0 && (
                                <span className="absolute top-1.5 end-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
                            )}
                        </NavLink>

                        <div className="relative" ref={profileRef}>
                            <button
                                onClick={() => setProfileOpen((o) => !o)}
                                type="button"
                                className="flex items-center gap-2 ps-2 pe-2.5 py-1.5 rounded-xl hover:bg-slate-100 transition-colors"
                            >
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#81A6C6] to-[#AACDDC] text-white flex items-center justify-center text-xs font-bold shrink-0">
                                    {(admin?.name || admin?.email || 'A').charAt(0).toUpperCase()}
                                </div>
                                <div className="hidden sm:block text-start leading-tight">
                                    <div className="text-xs font-semibold text-slate-800 max-w-[120px] truncate">
                                        {admin?.name || t('nav.admin')}
                                    </div>
                                    <div className="text-[10px] text-slate-400 max-w-[120px] truncate">{admin?.email}</div>
                                </div>
                                <ChevronDown size={14} className="text-slate-400 hidden sm:block" />
                            </button>

                            {profileOpen && (
                                <div className="absolute end-0 mt-2 w-52 bg-white rounded-xl border border-slate-200 shadow-lg shadow-slate-900/5 overflow-hidden z-30 animate-[scaleIn_0.12s_ease-out]">
                                    <div className="px-4 py-3 border-b border-slate-100">
                                        <div className="text-sm font-semibold text-slate-800 truncate">{admin?.name || t('nav.admin')}</div>
                                        <div className="text-xs text-slate-400 truncate">{admin?.email}</div>
                                    </div>
                                    <button
                                        onClick={logout}
                                        type="button"
                                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors"
                                    >
                                        <LogOut size={15} />
                                        {t('nav.signOut')}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    <div className="max-w-[1400px] mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}
