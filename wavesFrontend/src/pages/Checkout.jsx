import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { createOrder } from '../api/endpoints/orders';
import { FiCheckCircle, FiShoppingBag, FiArrowLeft } from 'react-icons/fi';
import { JORDAN_GOVERNORATES } from '../constants/jordan';
import { useLanguage } from '../context/LanguageContext';
import { formatCurrency } from '../utils/currency';

const Checkout = () => {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const { user } = useAuth();

    const PAYMENT_METHODS = [
        { value: 'cod', label: t('checkout.paymentCod'), description: t('checkout.paymentCodDesc') },
    ];

    const { cartItems, clearCart, subtotal, discountPercent, discountAmount, firstOrderDiscountApplied, deliveryFee, total } = useCart();

    const [shippingInfo, setShippingInfo] = useState({
        full_name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        notes: '',
        payment_method: 'cod',
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false);
    const [orderId, setOrderId] = useState(null);

    useEffect(() => {
        if (user) {
            setShippingInfo((prev) => ({
                ...prev,
                full_name: prev.full_name || user.name || '',
                email: prev.email || user.email || '',
                phone: prev.phone || user.phone || '',
                address: prev.address || user.address_line || '',
                city: prev.city || user.city || '',
            }));
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setShippingInfo((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    };

    const validate = () => {
        let errs = {};
        if (!shippingInfo.full_name.trim()) errs.full_name = t('checkout.errors.fullName');
        if (!shippingInfo.phone.trim()) errs.phone = t('checkout.errors.phone');
        if (!shippingInfo.address.trim()) errs.address = t('checkout.errors.address');
        if (!shippingInfo.city.trim()) errs.city = t('checkout.errors.city');

        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmitOrder = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        if (!cartItems || cartItems.length === 0) return;

        setIsSubmitting(true);

        const orderPayload = {
            customer_name: shippingInfo.full_name,
            customer_phone: shippingInfo.phone,
            customer_email: shippingInfo.email || user?.email || undefined,
            customer_address: `${shippingInfo.address}, ${shippingInfo.city}`,
            products: cartItems.map((item) => ({
                product_id: item.id,
                quantity: item.quantity || 1,
                color: item.color || undefined,
            })),
        };

        try {
            const res = await createOrder(orderPayload);
            setIsSubmitting(false);
            setOrderSuccess(true);
            setOrderId(res?.data?.order_number || res?.data?.id || 'SUCCESS');
            if (typeof clearCart === 'function') clearCart();
        } catch (err) {
            setIsSubmitting(false);
            console.error('Order Submission Error:', err);
            const validationErrors = err.response?.data?.errors;
            const serverMessage = validationErrors
                ? Object.values(validationErrors).flat().join(' ')
                : err.response?.data?.message || err.message || t('checkout.orderError');
            alert(serverMessage);
        }
    };

    if (orderSuccess) {
        return (
            <div className="w-full max-w-3xl mx-auto px-4 py-16 text-center font-sans">
                <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-8 sm:p-12 shadow-sm">
                    <FiCheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                    <h1 className="text-3xl font-extrabold text-black uppercase tracking-tight mb-2">{t('checkout.orderConfirmed')}</h1>
                    <p className="text-gray-600 text-sm mb-6">
                        {t('checkout.orderConfirmedMessage')} <span className="font-bold text-black">#{orderId}</span>.
                    </p>
                    <div className="flex justify-center gap-4">
                        <button
                            onClick={() => navigate('/')}
                            className="bg-black text-white text-xs font-semibold px-8 py-3.5 rounded-full hover:bg-gray-800 transition-all cursor-pointer"
                        >
                            {t('checkout.returnToShop')}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!cartItems || cartItems.length === 0) {
        return (
            <div className="w-full max-w-3xl mx-auto px-4 py-16 text-center font-sans">
                <FiShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">{t('checkout.emptyCartTitle')}</h2>
                <p className="text-gray-500 text-sm mb-6">{t('checkout.emptyCartMessage')}</p>
                <Link
                    to="/products"
                    className="inline-flex items-center gap-2 bg-black text-white text-xs font-semibold px-6 py-3 rounded-full hover:bg-gray-800 transition-all"
                >
                    <FiArrowLeft /> {t('checkout.browseProducts')}
                </Link>
            </div>
        );
    }

    return (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans text-gray-900">
            <nav className="text-xs text-gray-500 mb-6">
                <Link to="/cart" className="hover:text-black">{t('cart.breadcrumb')}</Link>
                <span className="mx-2">/</span>
                <span className="text-black font-semibold">{t('checkout.title')}</span>
            </nav>

            <h1 className="text-3xl sm:text-4xl font-extrabold uppercase tracking-tight mb-8">{t('checkout.title')}</h1>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <form onSubmit={handleSubmitOrder} className="lg:col-span-7 bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 space-y-6">
                    <h2 className="text-xl font-bold border-b border-gray-100 pb-4">{t('checkout.shippingInfo')}</h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase">{t('checkout.fullName')}</label>
                            <input
                                type="text"
                                name="full_name"
                                value={shippingInfo.full_name}
                                onChange={handleChange}
                                placeholder={t('auth.namePlaceholder')}
                                className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-black"
                            />
                            {errors.full_name && <p className="text-red-500 text-xs mt-1 pl-2">{errors.full_name}</p>}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase">{t('checkout.phoneNumber')}</label>
                                <input
                                    type="text"
                                    name="phone"
                                    value={shippingInfo.phone}
                                    onChange={handleChange}
                                    placeholder="+962"
                                    className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-black"
                                />
                                {errors.phone && <p className="text-red-500 text-xs mt-1 pl-2">{errors.phone}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase">{t('checkout.governorate')}</label>
                                <select
                                    name="city"
                                    value={shippingInfo.city}
                                    onChange={handleChange}
                                    className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-black"
                                >
                                    <option value="">{t('checkout.selectGovernorate')}</option>
                                    {JORDAN_GOVERNORATES.map((gov) => (
                                        <option key={gov} value={gov}>{gov}</option>
                                    ))}
                                </select>
                                {errors.city && <p className="text-red-500 text-xs mt-1 pl-2">{errors.city}</p>}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase">{t('checkout.addressDetails')}</label>
                            <input
                                type="text"
                                name="address"
                                value={shippingInfo.address}
                                onChange={handleChange}
                                placeholder={t('checkout.addressPlaceholder')}
                                className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-black"
                            />
                            {errors.address && <p className="text-red-500 text-xs mt-1 pl-2">{errors.address}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase">{t('checkout.country')}</label>
                            <input
                                type="text"
                                value="Hashemite Kingdom of Jordan"
                                disabled
                                className="w-full bg-gray-100 border border-gray-200 text-sm rounded-xl px-4 py-3 text-gray-500"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase">{t('checkout.orderNotes')}</label>
                            <textarea
                                name="notes"
                                rows={3}
                                value={shippingInfo.notes}
                                onChange={handleChange}
                                placeholder={t('checkout.orderNotesPlaceholder')}
                                className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-black resize-none"
                            ></textarea>
                        </div>
                    </div>

                    <h2 className="text-xl font-bold border-b border-gray-100 pb-4 pt-4">{t('checkout.paymentMethod')}</h2>
                    <div className="space-y-3">
                        {PAYMENT_METHODS.map((method) => (
                            <label
                                key={method.value}
                                className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:border-black transition-all"
                            >
                                <input
                                    type="radio"
                                    name="payment_method"
                                    value={method.value}
                                    checked={shippingInfo.payment_method === method.value}
                                    onChange={handleChange}
                                    className="accent-black"
                                />
                                <div>
                                    <span className="block text-sm font-bold">{method.label}</span>
                                    <span className="block text-xs text-gray-500">{method.description}</span>
                                </div>
                            </label>
                        ))}
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-black text-white text-sm font-bold py-4 rounded-full hover:bg-gray-800 transition-all shadow-md disabled:opacity-50 cursor-pointer mt-6"
                    >
                        {isSubmitting ? t('checkout.placingOrder') : t('checkout.placeOrder')}
                    </button>
                </form>

                <div className="lg:col-span-5 bg-gray-50 border border-gray-200 rounded-3xl p-6 sm:p-8 space-y-6">
                    <h2 className="text-xl font-bold border-b border-gray-200 pb-4">{t('cart.orderSummary')}</h2>

                    <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
                        {cartItems.map((item, idx) => {
                            const original = item.originalPrice ?? item.price;
                            const hasItemDiscount = Number(original) > Number(item.price);

                            return (
                                <div key={idx} className="flex items-center gap-4 pb-3 border-b border-gray-200/60">
                                    <img
                                        src={item.image || item.image_url}
                                        alt={item.name || item.name_en}
                                        className="w-14 h-14 object-cover rounded-xl border border-gray-200"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-bold truncate">{item.name || item.name_en}</h4>
                                        <p className="text-xs text-gray-500">
                                            {t('checkout.qty')}: {item.quantity || 1} {(item.selectedSize || item.size) ? `| ${t('cart.size')}: ${item.selectedSize || item.size}` : ''} {item.color ? `| ${t('cart.color')}: ${item.color}` : ''}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            {hasItemDiscount ? (
                                                <>
                                                    <span className="line-through mr-1">{formatCurrency(original)}</span>
                                                    <span className="text-emerald-600 font-semibold">{formatCurrency(item.price)} {t('checkout.each')}</span>
                                                </>
                                            ) : (
                                                <span>{formatCurrency(item.price)} {t('checkout.each')}</span>
                                            )}
                                        </p>
                                    </div>
                                    <span className="text-sm font-bold">{formatCurrency(item.price * (item.quantity || 1))}</span>
                                </div>
                            );
                        })}
                    </div>

                    <div className="space-y-2 border-t border-gray-200 pb-2 pt-4">
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>{t('cart.originalPrice')}</span>
                            <span className="font-semibold">{formatCurrency(subtotal)}</span>
                        </div>
                        {discountAmount > 0 && (
                            <div className="flex justify-between text-sm text-emerald-600">
                                <span>
                                    {t('cart.discount')}
                                    {firstOrderDiscountApplied && <span className="block text-xs">{t('cart.includesFirstOrder', { percent: discountPercent })}</span>}
                                </span>
                                <span className="font-semibold">-{formatCurrency(discountAmount)}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>{t('cart.deliveryFee')}</span>
                            <span className="font-semibold">{formatCurrency(deliveryFee)}</span>
                        </div>
                    </div>

                    <div className="flex justify-between items-center text-lg font-extrabold text-black pt-2 border-t border-gray-200">
                        <span>{t('cart.totalAfterDiscount')}</span>
                        <span>{formatCurrency(total)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;