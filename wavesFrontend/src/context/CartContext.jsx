import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

// Exported CartContext so direct useContext imports won't fail
export const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    // CartProvider is nested inside AuthProvider (see App.jsx), so this is safe to call here
    const { firstOrderDiscountEligible } = useAuth();

    // Load initial state from LocalStorage
    const [cartItems, setCartItems] = useState(() => {
        const savedCart = localStorage.getItem('waves_cart');
        return savedCart ? JSON.parse(savedCart) : [];
    });

    const [promoCode, setPromoCode] = useState('');
    const deliveryFee = 15;

    // The ONLY real discount is the automatic first-order 20% (server-enforced in
    // OrderController::store - see backend). This mirrors it client-side purely so the
    // Cart/Checkout pages can preview an accurate total before the order is placed.
    const discountPercent = firstOrderDiscountEligible ? 20 : 0;

    // Sync to LocalStorage on changes
    useEffect(() => {
        localStorage.setItem('waves_cart', JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = (product) => {
        setCartItems((prevItems) => {
            const existing = prevItems.find((item) => item.id === product.id);
            if (existing) {
                return prevItems.map((item) =>
                    item.id === product.id ? { ...item, quantity: item.quantity + (product.quantity || 1) } : item
                );
            }
            return [
                ...prevItems,
                {
                    id: product.id,
                    name: product.name_en || product.name,
                    size: product.selectedSize || '42',
                    color: product.selectedColor || 'White',
                    price: product.price,
                    quantity: product.quantity || 1,
                    image: product.main_image || product.image,
                },
            ];
        });
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

    const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const discountAmount = Math.round(subtotal * (discountPercent / 100));
    const total = subtotal - discountAmount + (cartItems.length > 0 ? deliveryFee : 0);

    // Legacy promo-code input on the Cart page: the real discount is now automatic
    // (first_order_discount_eligible above), so this no longer stacks anything extra -
    // kept as a harmless no-op so the existing Cart.jsx promo UI doesn't break.
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