import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext'; // 1. Import Auth Context
import { createOrder } from '../api/endpoints/orders';
import { FiCheckCircle, FiShoppingBag, FiArrowLeft } from 'react-icons/fi';
import { JORDAN_GOVERNORATES } from '../constants/jordan';

const PAYMENT_METHODS = [
    { value: 'cod', label: 'Cash on Delivery', description: 'Pay when your order arrives at your doorstep' },
    { value: 'visa', label: 'Visa', description: 'Pay securely with your Visa card' },
    { value: 'mastercard', label: 'Mastercard', description: 'Pay securely with your Mastercard' },
    { value: 'paypal', label: 'PayPal', description: 'Pay securely through your PayPal account' },
];

const Checkout = () => {
    const navigate = useNavigate();
    const { user } = useAuth(); // 2. Access authenticated user details

    // CartContext exposes `total` (a computed value), not a getCartTotal() function
    const { cartItems, clearCart, subtotal, discountPercent, discountAmount, deliveryFee, total } = useCart();

    const [shippingInfo, setShippingInfo] = useState({
        full_name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        notes: '',
        payment_method: 'cod', // Cash on Delivery default
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false);
    const [orderId, setOrderId] = useState(null);

    // Auto-fill from the logged-in user's saved profile - including their saved address,
    // so a returning customer doesn't have to retype it every time (Saved Address Management)
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
        if (!shippingInfo.full_name.trim()) errs.full_name = 'Full name is required';
        if (!shippingInfo.phone.trim()) errs.phone = 'Phone number is required';
        if (!shippingInfo.address.trim()) errs.address = 'Shipping address is required';
        if (!shippingInfo.city.trim()) errs.city = 'City is required';

        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmitOrder = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        if (!cartItems || cartItems.length === 0) return;

        setIsSubmitting(true);

        // Format payload to match the Laravel backend's StoreOrderRequest exactly
        // (customer_name/customer_phone/customer_email/customer_address + products[{product_id,quantity}])
        // Note: price/total are intentionally NOT sent - the backend recalculates the total
        // itself from each product's current price, so a client-sent total would just be ignored.
        const orderPayload = {
            customer_name: shippingInfo.full_name,
            customer_phone: shippingInfo.phone,
            customer_email: shippingInfo.email || user?.email || undefined,
            customer_address: `${shippingInfo.address}, ${shippingInfo.city}`,
            products: cartItems.map((item) => ({
                product_id: item.id,
                quantity: item.quantity || 1,
            })),
        };

        try {
            const res = await createOrder(orderPayload);
            setIsSubmitting(false);
            setOrderSuccess(true);
            // OrderResource returns order_number (e.g. ORD-20260720-9K3XQ2), which is what the
            // customer should see - not the raw numeric id
            setOrderId(res?.data?.order_number || res?.data?.id || 'SUCCESS');
            if (typeof clearCart === 'function') clearCart();
        } catch (err) {
            setIsSubmitting(false);
            console.error('Order Submission Error:', err);
            // 422 validation errors come back as { message, errors: { field: [msg] } }
            const validationErrors = err.response?.data?.errors;
            const serverMessage = validationErrors
                ? Object.values(validationErrors).flat().join(' ')
                : err.response?.data?.message || err.message || 'Failed to place order. Please try again.';
            alert(serverMessage);
        }
    };

    // If order was placed successfully
    if (orderSuccess) {
        return (
            <div className="w-full max-w-3xl mx-auto px-4 py-16 text-center font-sans">
                <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-8 sm:p-12 shadow-sm">
                    <FiCheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                    <h1 className="text-3xl font-extrabold text-black uppercase tracking-tight mb-2">Order Confirmed!</h1>
                    <p className="text-gray-600 text-sm mb-6">
                        Thank you for your order. Your order ID is <span className="font-bold text-black">#{orderId}</span>.
                    </p>
                    <div className="flex justify-center gap-4">
                        <button
                            onClick={() => navigate('/')}
                            className="bg-black text-white text-xs font-semibold px-8 py-3.5 rounded-full hover:bg-gray-800 transition-all cursor-pointer"
                        >
                            Return to Shop
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Empty state redirect/message
    if (!cartItems || cartItems.length === 0) {
        return (
            <div className="w-full max-w-3xl mx-auto px-4 py-16 text-center font-sans">
                <FiShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">Your Cart is Empty</h2>
                <p className="text-gray-500 text-sm mb-6">Add items to your cart before proceeding to checkout.</p>
                <Link
                    to="/products"
                    className="inline-flex items-center gap-2 bg-black text-white text-xs font-semibold px-6 py-3 rounded-full hover:bg-gray-800 transition-all"
                >
                    <FiArrowLeft /> Browse Products
                </Link>
            </div>
        );
    }

    return (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans text-gray-900">
            <nav className="text-xs text-gray-500 mb-6">
                <Link to="/cart" className="hover:text-black">Cart</Link>
                <span className="mx-2">/</span>
                <span className="text-black font-semibold">Checkout</span>
            </nav>

            <h1 className="text-3xl sm:text-4xl font-extrabold uppercase tracking-tight mb-8">Checkout</h1>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Shipping Details Form */}
                <form onSubmit={handleSubmitOrder} className="lg:col-span-7 bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 space-y-6">
                    <h2 className="text-xl font-bold border-b border-gray-100 pb-4">Shipping Information</h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase">Full Name *</label>
                            <input
                                type="text"
                                name="full_name"
                                value={shippingInfo.full_name}
                                onChange={handleChange}
                                placeholder="John Doe"
                                className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-black"
                            />
                            {errors.full_name && <p className="text-red-500 text-xs mt-1 pl-2">{errors.full_name}</p>}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase">Phone Number *</label>
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
                                <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase">Governorate *</label>
                                <select
                                    name="city"
                                    value={shippingInfo.city}
                                    onChange={handleChange}
                                    className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-black"
                                >
                                    <option value="">Select governorate</option>
                                    {JORDAN_GOVERNORATES.map((gov) => (
                                        <option key={gov} value={gov}>{gov}</option>
                                    ))}
                                </select>
                                {errors.city && <p className="text-red-500 text-xs mt-1 pl-2">{errors.city}</p>}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase">Address Details *</label>
                            <input
                                type="text"
                                name="address"
                                value={shippingInfo.address}
                                onChange={handleChange}
                                placeholder="Street, building name, apartment (e.g. Rainbow St, Building 12, Apt 4)"
                                className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-black"
                            />
                            {errors.address && <p className="text-red-500 text-xs mt-1 pl-2">{errors.address}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase">Country</label>
                            <input
                                type="text"
                                value="Hashemite Kingdom of Jordan"
                                disabled
                                className="w-full bg-gray-100 border border-gray-200 text-sm rounded-xl px-4 py-3 text-gray-500"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase">Order Notes (Optional)</label>
                            <textarea
                                name="notes"
                                rows={3}
                                value={shippingInfo.notes}
                                onChange={handleChange}
                                placeholder="Special instructions for delivery"
                                className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-black resize-none"
                            ></textarea>
                        </div>
                    </div>

                    <h2 className="text-xl font-bold border-b border-gray-100 pb-4 pt-4">Payment Method</h2>
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
                        {isSubmitting ? 'Placing Order...' : 'Place Order'}
                    </button>
                </form>

                {/* Order Summary Sidebar */}
                <div className="lg:col-span-5 bg-gray-50 border border-gray-200 rounded-3xl p-6 sm:p-8 space-y-6">
                    <h2 className="text-xl font-bold border-b border-gray-200 pb-4">Order Summary</h2>

                    <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
                        {cartItems.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-4 pb-3 border-b border-gray-200/60">
                                <img
                                    src={item.image || item.image_url}
                                    alt={item.name || item.name_en}
                                    className="w-14 h-14 object-cover rounded-xl border border-gray-200"
                                />
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-bold truncate">{item.name || item.name_en}</h4>
                                    <p className="text-xs text-gray-500">
                                        Qty: {item.quantity || 1} {(item.selectedSize || item.size) ? `| Size: ${item.selectedSize || item.size}` : ''}
                                    </p>
                                </div>
                                <span className="text-sm font-bold">${Number(item.price * (item.quantity || 1)).toFixed(2)}</span>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-2 border-t border-gray-200 pb-2 pt-4">
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>Subtotal</span>
                            <span className="font-semibold">${Number(subtotal || 0).toFixed(2)}</span>
                        </div>
                        {discountAmount > 0 && (
                            <div className="flex justify-between text-sm text-emerald-600">
                                <span>First order discount (-{discountPercent}%)</span>
                                <span className="font-semibold">-${Number(discountAmount || 0).toFixed(2)}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>Delivery Fee</span>
                            <span className="font-semibold">${Number(deliveryFee || 0).toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="flex justify-between items-center text-lg font-extrabold text-black pt-2 border-t border-gray-200">
                        <span>Total</span>
                        <span>${Number(total || 0).toFixed(2)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;