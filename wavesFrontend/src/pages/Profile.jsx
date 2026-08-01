import React, { useState, useEffect, useRef } from 'react';
import { FiUser, FiPackage, FiMapPin, FiLogOut, FiClock, FiCheckCircle, FiXCircle, FiCamera, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { fetchUserOrders } from '../api/endpoints/orders';
import { JORDAN_GOVERNORATES } from '../constants/jordan';
import { useLanguage } from '../context/LanguageContext';
import { formatCurrency } from '../utils/currency';

const Profile = ({ onLogout }) => {
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState('orders');

    const { user, updateProfile } = useAuth();

    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAllOrders, setShowAllOrders] = useState(false);

    const ORDERS_PREVIEW_COUNT = 3;

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
    });
    const [infoSaving, setInfoSaving] = useState(false);
    const [infoMessage, setInfoMessage] = useState('');

    const [addressForm, setAddressForm] = useState({ address_line: '', city: '' });
    const [editingAddress, setEditingAddress] = useState(false);
    const [addressSaving, setAddressSaving] = useState(false);
    const [addressMessage, setAddressMessage] = useState('');

    const fileInputRef = useRef(null);
    const [avatarUploading, setAvatarUploading] = useState(false);
    const [avatarError, setAvatarError] = useState('');

    useEffect(() => {
        if (user) {
            setFormData({ name: user.name || '', email: user.email || '', phone: user.phone || '' });
            setAddressForm({ address_line: user.address_line || '', city: user.city || '' });
        }
    }, [user]);

    useEffect(() => {
        const loadOrders = async () => {
            try {
                setIsLoading(true);
                const data = await fetchUserOrders();
                const list = Array.isArray(data) ? data : [];
                const sorted = [...list].sort(
                    (a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
                );
                setOrders(sorted);
            } catch (err) {
                console.error('Failed to load order history:', err);
                setError(t('profile.ordersLoadError'));
            } finally {
                setIsLoading(false);
            }
        };

        loadOrders();
    }, []);

    const getBadgeColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            case 'confirmed':
            case 'processing':
                return 'bg-blue-100 text-blue-800 border-blue-300';
            case 'completed':
                return 'bg-green-100 text-green-800 border-green-300';
            case 'cancelled':
                return 'bg-red-100 text-red-800 border-red-300';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setInfoSaving(true);
        setInfoMessage('');
        try {
            const fd = new FormData();
            fd.append('name', formData.name);
            fd.append('email', formData.email);
            fd.append('phone', formData.phone || '');
            await updateProfile(fd);
            setInfoMessage(t('profile.infoSaved'));
        } catch (err) {
            console.error('Failed to update profile:', err);
            const errors = err.response?.data?.errors;
            setInfoMessage(errors ? Object.values(errors).flat().join(' ') : t('profile.infoSaveError'));
        } finally {
            setInfoSaving(false);
        }
    };

    const handleAddressChange = (e) => {
        const { name, value } = e.target;
        setAddressForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSaveAddress = async (e) => {
        e.preventDefault();
        setAddressSaving(true);
        setAddressMessage('');
        try {
            const fd = new FormData();
            fd.append('address_line', addressForm.address_line || '');
            fd.append('city', addressForm.city || '');
            await updateProfile(fd);
            setAddressMessage(t('profile.addressSaved'));
            setEditingAddress(false);
        } catch (err) {
            console.error('Failed to save address:', err);
            const errors = err.response?.data?.errors;
            setAddressMessage(errors ? Object.values(errors).flat().join(' ') : t('profile.addressSaveError'));
        } finally {
            setAddressSaving(false);
        }
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setAvatarUploading(true);
        setAvatarError('');
        try {
            const fd = new FormData();
            fd.append('profile_picture', file);
            await updateProfile(fd);
        } catch (err) {
            console.error('Failed to upload profile picture:', err);
            setAvatarError(t('profile.avatarUploadError'));
        } finally {
            setAvatarUploading(false);
            e.target.value = '';
        }
    };

    if (isLoading) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-20 text-center font-sans font-bold text-gray-500">
                {t('profile.loadingProfile')}
            </div>
        );
    }


    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans">
            <div className="bg-[#A4C2DC] rounded-3xl p-6 sm:p-10 mb-10 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
                <div className="flex items-center gap-5">
                    <div className="relative group">
                        <button
                            type="button"
                            onClick={handleAvatarClick}
                            className="w-20 h-20 bg-black text-white rounded-full flex items-center justify-center text-3xl font-extrabold uppercase shadow-md overflow-hidden relative"
                            title={t('profile.changePicture')}
                        >
                            {user?.profile_picture ? (
                                <img src={user.profile_picture} alt={user?.name || t('profile.defaultName')} className="w-full h-full object-cover" />
                            ) : (
                                user?.name ? user.name.charAt(0) : 'U'
                            )}
                            <span className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <FiCamera className="text-white" />
                            </span>
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarChange}
                            className="hidden"
                        />
                        {avatarUploading && <p className="text-[10px] text-gray-700 mt-1 text-center">{t('profile.uploading')}</p>}
                        {avatarError && <p className="text-[10px] text-red-600 mt-1 text-center">{avatarError}</p>}
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold uppercase text-black tracking-tight">
                            {user?.name || t('profile.defaultName')}
                        </h1>
                        <p className="text-gray-700 text-sm">{user?.email || 'email@example.com'}</p>
                        {user?.joined && (
                            <p className="text-xs text-gray-600 mt-1">{t('profile.memberSince', { date: user.joined })}</p>
                        )}
                    </div>
                </div>

                <button
                    onClick={onLogout}
                    className="flex items-center gap-2 bg-black text-white px-6 py-2.5 rounded-full font-medium text-sm hover:bg-gray-800 transition shadow"
                >
                    <FiLogOut /> {t('profile.logout')}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-1 space-y-2">
                    <button
                        onClick={() => setActiveTab('orders')}
                        className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl font-bold text-sm transition text-left ${activeTab === 'orders'
                            ? 'bg-black text-white shadow-md'
                            : 'bg-gray-50 text-black hover:bg-gray-100 border border-gray-200'
                            }`}
                    >
                        <FiPackage className="text-lg" /> {t('profile.tabOrders')}
                    </button>

                    <button
                        onClick={() => setActiveTab('info')}
                        className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl font-bold text-sm transition text-left ${activeTab === 'info'
                            ? 'bg-black text-white shadow-md'
                            : 'bg-gray-50 text-black hover:bg-gray-100 border border-gray-200'
                            }`}
                    >
                        <FiUser className="text-lg" /> {t('profile.tabInfo')}
                    </button>

                    <button
                        onClick={() => setActiveTab('address')}
                        className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl font-bold text-sm transition text-left ${activeTab === 'address'
                            ? 'bg-black text-white shadow-md'
                            : 'bg-gray-50 text-black hover:bg-gray-100 border border-gray-200'
                            }`}
                    >
                        <FiMapPin className="text-lg" /> {t('profile.tabAddress')}
                    </button>
                </div>

                <div className="lg:col-span-3">
                    {activeTab === 'orders' && (
                        <div className="border-4 border-[#A4C2DC] rounded-3xl p-6 sm:p-8 bg-white">
                            <h2 className="text-2xl font-extrabold uppercase tracking-tight text-black mb-6">
                                {t('profile.orderHistory')}
                            </h2>

                            {error ? (
                                <p className="text-sm text-red-500 font-medium">{error}</p>
                            ) : orders.length === 0 ? (
                                <p className="text-sm text-gray-500 font-medium">{t('profile.noOrders')}</p>
                            ) : (
                                <div className="space-y-4">
                                    {(showAllOrders ? orders : orders.slice(0, ORDERS_PREVIEW_COUNT)).map((order) => (
                                        <div
                                            key={order.id}
                                            className="border border-gray-200 rounded-2xl p-5 hover:border-[#A4C2DC] transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                                        >
                                            <div>
                                                <div className="flex items-center gap-3 mb-1">
                                                    <span className="font-extrabold text-black">{order.order_number || order.id}</span>
                                                    <span
                                                        className={`text-xs px-3 py-0.5 rounded-full border font-semibold ${getBadgeColor(order.status)}`}
                                                    >
                                                        {order.status ? t(`orderStatus.${order.status}`) : order.status}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-500">{t('profile.placedOn', { date: order.created_at ? new Date(order.created_at).toLocaleDateString() : '' })}</p>
                                                <p className="text-xs text-gray-600 mt-1">{t('profile.itemsCount', { count: order.items?.length || 0 })}</p>
                                            </div>

                                            <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-100">
                                                <span className="text-lg font-black text-black">
                                                    {typeof order.total_price === 'number' ? formatCurrency(order.total_price) : order.total_price}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {!error && orders.length > ORDERS_PREVIEW_COUNT && (
                                <div className="flex justify-center mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setShowAllOrders((prev) => !prev)}
                                        className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-black font-bold text-sm px-6 py-2.5 rounded-full transition"
                                    >
                                        {showAllOrders ? (
                                            <>
                                                {t('profile.viewLess')} <FiChevronUp />
                                            </>
                                        ) : (
                                            <>
                                                {t('profile.viewMore')} <FiChevronDown />
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'info' && (
                        <div className="border-4 border-[#A4C2DC] rounded-3xl p-6 sm:p-8 bg-white">
                            <h2 className="text-2xl font-extrabold uppercase tracking-tight text-black mb-6">
                                {t('profile.personalInfo')}
                            </h2>

                            {infoMessage && (
                                <p className="text-sm font-medium mb-4 text-gray-700">{infoMessage}</p>
                            )}

                            <form onSubmit={handleSaveProfile} className="space-y-4 max-w-lg">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-600 mb-1">{t('profile.fullName')}</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-black"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-600 mb-1">{t('profile.emailAddress')}</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-black"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-600 mb-1">{t('profile.phoneNumber')}</label>
                                    <input
                                        type="text"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-black"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={infoSaving}
                                    className="bg-black text-white px-8 py-3 rounded-full font-medium text-sm hover:bg-gray-800 transition mt-4 disabled:opacity-50"
                                >
                                    {infoSaving ? t('profile.saving') : t('profile.saveChanges')}
                                </button>
                            </form>
                        </div>
                    )}

                    {activeTab === 'address' && (
                        <div className="border-4 border-[#A4C2DC] rounded-3xl p-6 sm:p-8 bg-white">
                            <h2 className="text-2xl font-extrabold uppercase tracking-tight text-black mb-6">
                                {t('profile.savedAddress')}
                            </h2>

                            {addressMessage && (
                                <p className="text-sm font-medium mb-4 text-gray-700">{addressMessage}</p>
                            )}

                            {!editingAddress ? (
                                user?.address_line || user?.city ? (
                                    <div className="border border-gray-200 rounded-2xl p-5 max-w-md bg-gray-50">
                                        <p className="font-extrabold text-black mb-1">{user.name}</p>
                                        <p className="text-sm text-gray-600">{user.address_line}</p>
                                        <p className="text-sm text-gray-600">{user.city}, Jordan</p>
                                        {user.phone && <p className="text-sm text-gray-600">{user.phone}</p>}
                                        <button
                                            onClick={() => setEditingAddress(true)}
                                            className="text-xs font-bold text-black underline hover:text-gray-600 mt-4"
                                        >
                                            {t('profile.editAddress')}
                                        </button>
                                    </div>
                                ) : (
                                    <div>
                                        <p className="text-sm text-gray-500 font-medium mb-4">{t('profile.noAddress')}</p>
                                        <button
                                            onClick={() => setEditingAddress(true)}
                                            className="bg-black text-white px-6 py-2.5 rounded-full font-medium text-sm hover:bg-gray-800 transition"
                                        >
                                            {t('profile.addAddress')}
                                        </button>
                                    </div>
                                )
                            ) : (
                                <form onSubmit={handleSaveAddress} className="space-y-4 max-w-lg">
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-gray-600 mb-1">{t('checkout.addressDetails')}</label>
                                        <input
                                            type="text"
                                            name="address_line"
                                            value={addressForm.address_line}
                                            onChange={handleAddressChange}
                                            placeholder={t('profile.addressLinePlaceholder')}
                                            className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-black"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-gray-600 mb-1">{t('checkout.governorate')}</label>
                                        <select
                                            name="city"
                                            value={addressForm.city}
                                            onChange={handleAddressChange}
                                            className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-black"
                                        >
                                            <option value="">{t('checkout.selectGovernorate')}</option>
                                            {JORDAN_GOVERNORATES.map((gov) => (
                                                <option key={gov} value={gov}>{gov}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="flex gap-3">
                                        <button
                                            type="submit"
                                            disabled={addressSaving}
                                            className="bg-black text-white px-8 py-3 rounded-full font-medium text-sm hover:bg-gray-800 transition disabled:opacity-50"
                                        >
                                            {addressSaving ? t('profile.saving') : t('profile.saveAddress')}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setEditingAddress(false)}
                                            className="text-sm font-medium text-gray-500 hover:text-black px-4"
                                        >
                                            {t('common.cancel')}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;