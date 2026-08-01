import React, { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { FiSearch, FiShoppingCart, FiUser, FiX, FiMenu, FiGlobe } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const Navbar = () => {
    const { cartItems } = useCart();

    const cartCount = cartItems ? cartItems.reduce((acc, item) => acc + item.quantity, 0) : 0;

    const [showTopBar, setShowTopBar] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();
    const { t, language, setLanguage } = useLanguage();

    const toggleLanguage = () => setLanguage(language === 'en' ? 'ar' : 'en');

    const { isAuthenticated } = useAuth();
    const isLoggedIn = isAuthenticated;

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        const trimmed = searchQuery.trim();
        if (trimmed) {
            navigate(`/search?q=${encodeURIComponent(trimmed)}`);
            setMobileMenuOpen(false);
        }
    };

    return (
        <header className="w-full sticky top-0 z-50 transition-all duration-300">
            {!isLoggedIn && showTopBar && (
                <div className="bg-[#F3E3D0] text-black text-xs sm:text-sm py-2 px-4 flex justify-between items-center border-b border-[#D2C4B4]/40 font-medium">
                    <div className="w-full text-center tracking-tight">
                        <span>{t('nav.topBarOfferPrefix')} <strong className="font-bold">{t('nav.topBarOfferHighlight')}</strong> {t('nav.topBarOfferSuffix')} </span>
                        <Link to="/signup" className="underline font-bold text-[#81A6C6] hover:text-[#5a80a2] transition-colors ml-1">
                            {t('nav.topBarCta')}
                        </Link>
                    </div>
                    <button
                        onClick={() => setShowTopBar(false)}
                        className="text-gray-700 hover:text-black focus:outline-none p-1 transition-colors"
                        aria-label={t('nav.closeNotification')}
                    >
                        <FiX className="w-4 h-4" />
                    </button>
                </div>
            )}

            <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100/80 transition-all">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
                    <Link to="/" className="text-2xl sm:text-3xl font-black tracking-tight text-black flex items-center gap-1 group">
                        <span className="text-black group-hover:text-[#81A6C6] transition-colors">WAVES</span>
                        <span className="w-2 h-2 rounded-full bg-[#81A6C6]"></span>
                    </Link>

                    <div className="hidden md:flex items-center space-x-7 text-sm font-semibold text-gray-700">
                        <Link to="/" className="hover:text-[#81A6C6] transition-colors">{t('nav.home')}</Link>
                        <Link to="/categories" className="hover:text-[#81A6C6] transition-colors">{t('nav.categories')}</Link>
                        <Link to="/brands" className="hover:text-[#81A6C6] transition-colors">{t('nav.brands')}</Link>
                        <Link to="/products" className="hover:text-[#81A6C6] transition-colors">{t('nav.products')}</Link>
                        <Link to="/gallery" className="hover:text-[#81A6C6] transition-colors">{t('nav.gallery')}</Link>
                        <Link to="/contact" className="hover:text-[#81A6C6] transition-colors">{t('nav.contact')}</Link>
                    </div>

                    <form
                        onSubmit={handleSearchSubmit}
                        role="search"
                        className="hidden lg:flex flex-1 max-w-sm mx-4 relative items-center"
                    >
                        <button
                            type="submit"
                            aria-label={t('nav.search')}
                            className="absolute left-3.5 text-gray-400 hover:text-black transition-colors"
                        >
                            <FiSearch className="w-4 h-4" />
                        </button>
                        <input
                            type="text"
                            placeholder={t('nav.search')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-[#F3E3D0]/30 hover:bg-[#F3E3D0]/50 text-sm text-gray-800 rounded-full pl-10 pr-4 py-2 border border-transparent focus:border-[#AACDDC] focus:bg-white focus:outline-none transition-all shadow-inner"
                        />
                    </form>

                    <div className="flex items-center space-x-3 sm:space-x-4 text-gray-900">
                        <Link
                            to="/cart"
                            className="relative p-2 rounded-full hover:bg-[#AACDDC]/20 transition-colors"
                            aria-label={t('nav.cartLabel')}
                        >
                            <FiShoppingCart className="w-5 h-5" />
                            {cartCount > 0 && (
                                <span className="absolute top-1 right-1 bg-[#81A6C6] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold animate-pulse">
                                    {cartCount}
                                </span>
                            )}
                        </Link>

                        <button
                            onClick={toggleLanguage}
                            type="button"
                            className="hidden sm:inline-flex items-center gap-1 p-2 rounded-full hover:bg-[#AACDDC]/20 transition-colors"
                            aria-label={t('nav.toggleLanguage')}
                            title={language === 'en' ? 'العربية' : 'English'}
                        >
                            <FiGlobe className="w-5 h-5" />
                            <span className="text-xs font-bold uppercase">{language === 'en' ? 'AR' : 'EN'}</span>
                        </button>

                        <Link
                            to={isLoggedIn ? "/profile" : "/login"}
                            className="p-2 rounded-full hover:bg-[#AACDDC]/20 transition-colors"
                            aria-label={t('nav.accountLabel')}
                        >
                            <FiUser className="w-5 h-5" />
                        </Link>

                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2 text-gray-800 hover:bg-gray-100 rounded-full focus:outline-none"
                            aria-label={t('nav.toggleMenu')}
                        >
                            {mobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </nav>

            {mobileMenuOpen && (
                <div className="md:hidden bg-white/95 backdrop-blur-xl border-b border-gray-200 px-5 pt-4 pb-6 space-y-4 shadow-xl">
                    <form onSubmit={handleSearchSubmit} role="search" className="relative my-1">
                        <button
                            type="submit"
                            aria-label={t('nav.search')}
                            className="absolute left-3.5 top-3 text-gray-400 hover:text-black transition-colors"
                        >
                            <FiSearch className="w-4 h-4" />
                        </button>
                        <input
                            type="text"
                            placeholder={t('nav.search')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-[#F3E3D0]/40 text-sm rounded-full pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#81A6C6]"
                        />
                    </form>
                    <div className="flex flex-col space-y-2 font-semibold text-gray-800 text-sm">
                        <Link to="/" onClick={() => setMobileMenuOpen(false)} className="py-2 hover:text-[#81A6C6] border-b border-gray-50">{t('nav.home')}</Link>
                        <Link to="/categories" onClick={() => setMobileMenuOpen(false)} className="py-2 hover:text-[#81A6C6] border-b border-gray-50">{t('nav.categories')}</Link>
                        <Link to="/brands" onClick={() => setMobileMenuOpen(false)} className="py-2 hover:text-[#81A6C6] border-b border-gray-50">{t('nav.brands')}</Link>
                        <Link to="/products" onClick={() => setMobileMenuOpen(false)} className="py-2 hover:text-[#81A6C6] border-b border-gray-50">{t('nav.products')}</Link>
                        <Link to="/gallery" onClick={() => setMobileMenuOpen(false)} className="py-2 hover:text-[#81A6C6] border-b border-gray-50">{t('nav.gallery')}</Link>
                        <Link to="/contact" onClick={() => setMobileMenuOpen(false)} className="py-2 hover:text-[#81A6C6] border-b border-gray-50">{t('nav.contact')}</Link>
                        <button
                            onClick={() => {
                                toggleLanguage();
                                setMobileMenuOpen(false);
                            }}
                            type="button"
                            className="flex items-center gap-2 py-2 hover:text-[#81A6C6] text-left"
                        >
                            <FiGlobe className="w-4 h-4" />
                            {language === 'en' ? 'العربية' : 'English'}
                        </button>
                    </div>

                    <div className="pt-3 border-t border-gray-100">
                        {isLoggedIn ? (
                            <Link
                                to="/profile"
                                onClick={() => setMobileMenuOpen(false)}
                                className="block w-full text-center bg-[#AACDDC] text-gray-900 font-bold py-3 rounded-full text-xs transition-transform active:scale-95"
                            >
                                {t('nav.myAccount')}
                            </Link>
                        ) : (
                            <Link
                                to="/signup"
                                onClick={() => setMobileMenuOpen(false)}
                                className="block w-full text-center bg-[#81A6C6] text-white font-bold py-3 rounded-full text-xs shadow-md hover:bg-[#6c91b1] transition-transform active:scale-95"
                            >
                                {t('nav.signUp')}
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
};

export default Navbar;