import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { useLanguage } from './LanguageContext';
import { useSiteSettings } from './SiteSettingsContext';

export const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const { firstOrderDiscountEligible } = useAuth();
    const { showToast } = useToast();
    const { t } = useLanguage();
    const { deliveryFee } = useSiteSettings();

    const [cartItems, setCartItems] = useState(() => {
        const savedCart = localStorage.getItem('waves_cart');
        return savedCart ? JSON.parse(savedCart) : [];
    });

    const [promoCode, setPromoCode] = useState('');

    const discountPercent = firstOrderDiscountEligible ? 20 : 0;

    useEffect(() => {
        localStorage.setItem('waves_cart', JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = (product) => {
        const productName = product.name_en || product.name;

        setCartItems((prevItems) => {
            const existing = prevItems.find((item) => item.id === product.id);
            if (existing) {
                return prevItems.map((item) =>
                    item.id === product.id ? { ...item, quantity: item.quantity + (product.quantity || 1) } : item
                );
            }
            const hasDiscount =
                Boolean(product.discount_percent) && product.final_price != null && Number(product.final_price) < Number(product.price);
            const originalPrice = Number(product.price);
            const unitPrice = hasDiscount ? Number(product.final_price) : originalPrice;

            return [
                ...prevItems,
                {
                    id: product.id,
                    name: productName,
                    size: product.selectedSize || '42',
                    color: product.selectedColor || null,
                    originalPrice,
                    price: unitPrice,
                    discountPercent: hasDiscount ? Number(product.discount_percent) : 0,
                    quantity: product.quantity || 1,
                    image: product.main_image || product.image,
                },
            ];
        });

        showToast(t('cart.addedToast', { name: productName }));
    };

    const increaseQuantity = (id) => {
        setCartItems((prevItems) =>
            prevItems.map((item) => (item.id === id ? { ...item, quantity: item.quantity + 1 } : item))
        );
    };

    const decreaseQuantity = (id) => {
        setCartItems((prevItems) =>
            prevItems.map((item) =>
                item.id === id && item.quantity > 1 ? { ...item, quantity: item.quantity - 1 } : item
            )
        );
    };

    const removeFromCart = (id) => {
        setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
    };

    const clearCart = () => {
        setCartItems([]);
    };

    // subtotal is the true pre-discount total (original unit price x quantity for every item)
    const subtotal = cartItems.reduce((acc, item) => acc + (item.originalPrice ?? item.price) * item.quantity, 0);

    // product-level discounts (per-item original price vs discounted price)
    const productDiscountAmount = cartItems.reduce(
        (acc, item) => acc + ((item.originalPrice ?? item.price) - item.price) * item.quantity,
        0
    );

    const firstOrderDiscountApplied = firstOrderDiscountEligible && cartItems.length > 0;
    const firstOrderDiscountAmount = firstOrderDiscountApplied
        ? Math.round((subtotal - productDiscountAmount) * (discountPercent / 100))
        : 0;

    const discountAmount = Math.round(productDiscountAmount + firstOrderDiscountAmount);
    const total = subtotal - discountAmount + (cartItems.length > 0 ? deliveryFee : 0);

    const applyPromo = () => {};

    return (
        <CartContext.Provider
            value={{
                cartItems,
                addToCart,
                increaseQuantity,
                decreaseQuantity,
                removeFromCart,
                clearCart,
                subtotal,
                discountPercent,
                discountAmount,
                productDiscountAmount,
                firstOrderDiscountAmount,
                firstOrderDiscountApplied,
                deliveryFee,
                total,
                promoCode,
                setPromoCode,
                applyPromo,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};