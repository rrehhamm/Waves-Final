import React from 'react';
import { Link } from 'react-router-dom';
import { FaTwitter, FaFacebookF, FaInstagram, FaGithub } from 'react-icons/fa';
import { useLanguage } from '../context/LanguageContext';
import { useSiteSettings } from '../context/SiteSettingsContext';

const Footer = () => {
    const { t } = useLanguage();
    const { contactPhone, contactEmail } = useSiteSettings();

    return (
        <footer className="bg-[#81A6C6]/80 backdrop-blur-md text-gray-900 pt-16 pb-8 font-sans border-t border-white/30 shadow-lg relative z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-10 pb-12 border-b border-black/10">

                    <div className="md:col-span-1 space-y-4">
                        <Link to="/" className="text-3xl font-black text-black tracking-tight flex items-center gap-1">
                            <span>WAVES</span>
                            <span className="w-2 h-2 rounded-full bg-black"></span>
                        </Link>
                        <p className="text-xs text-gray-800 leading-relaxed font-medium">
                            {t('footer.tagline')}
                        </p>
                        <div className="flex space-x-2.5 pt-2">
                            <a href="#" className="w-9 h-9 rounded-full bg-white/40 backdrop-blur-sm hover:bg-white/80 border border-white/50 flex items-center justify-center text-black hover:scale-110 transition-all shadow-sm">
                                <FaTwitter className="w-4 h-4" />
                            </a>
                            <a href="#" className="w-9 h-9 rounded-full bg-black/90 text-white flex items-center justify-center hover:scale-110 transition-all shadow-sm">
                                <FaFacebookF className="w-4 h-4" />
                            </a>
                            <a href="#" className="w-9 h-9 rounded-full bg-white/40 backdrop-blur-sm hover:bg-white/80 border border-white/50 flex items-center justify-center text-black hover:scale-110 transition-all shadow-sm">
                                <FaInstagram className="w-4 h-4" />
                            </a>
                            <a href="#" className="w-9 h-9 rounded-full bg-white/40 backdrop-blur-sm hover:bg-white/80 border border-white/50 flex items-center justify-center text-black hover:scale-110 transition-all shadow-sm">
                                <FaGithub className="w-4 h-4" />
                            </a>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xs font-black uppercase tracking-widest text-black mb-4">{t('footer.company')}</h3>
                        <ul className="space-y-2.5 text-xs font-semibold text-gray-800">
                            <li><Link to="/about" className="hover:text-white transition-colors">{t('footer.about')}</Link></li>
                            <li><Link to="/features" className="hover:text-white transition-colors">{t('footer.features')}</Link></li>
                            <li><Link to="/works" className="hover:text-white transition-colors">{t('footer.works')}</Link></li>
                            <li><Link to="/career" className="hover:text-white transition-colors">{t('footer.career')}</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-xs font-black uppercase tracking-widest text-black mb-4">{t('footer.help')}</h3>
                        <ul className="space-y-2.5 text-xs font-semibold text-gray-800">
                            <li><Link to="/support" className="hover:text-white transition-colors">{t('footer.customerSupport')}</Link></li>
                            <li><Link to="/delivery" className="hover:text-white transition-colors">{t('footer.deliveryDetails')}</Link></li>
                            <li><Link to="/terms" className="hover:text-white transition-colors">{t('footer.terms')}</Link></li>
                            <li><Link to="/privacy" className="hover:text-white transition-colors">{t('footer.privacy')}</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-xs font-black uppercase tracking-widest text-black mb-4">{t('footer.faq')}</h3>
                        <ul className="space-y-2.5 text-xs font-semibold text-gray-800">
                            <li><Link to="/account" className="hover:text-white transition-colors">{t('footer.account')}</Link></li>
                            <li><Link to="/manage-deliveries" className="hover:text-white transition-colors">{t('footer.manageDeliveries')}</Link></li>
                            <li><Link to="/orders" className="hover:text-white transition-colors">{t('footer.orders')}</Link></li>
                            <li><Link to="/payments" className="hover:text-white transition-colors">{t('footer.payments')}</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-xs font-black uppercase tracking-widest text-black mb-4">{t('footer.resources')}</h3>
                        <ul className="space-y-2.5 text-xs font-semibold text-gray-800">
                            <li><Link to="/ebooks" className="hover:text-white transition-colors">{t('footer.freeEbooks')}</Link></li>
                            <li><Link to="/tutorials" className="hover:text-white transition-colors">{t('footer.tutorials')}</Link></li>
                            <li><Link to="/blog" className="hover:text-white transition-colors">{t('footer.blog')}</Link></li>
                            <li><Link to="/youtube" className="hover:text-white transition-colors">{t('footer.youtube')}</Link></li>
                        </ul>
                    </div>

                </div>

                <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-medium text-gray-800">
                    <div>
                        {t('footer.rights')}
                    </div>
                    <div>
                        {t('footer.contactLabel')}: {contactPhone} | {t('footer.emailLabel')}: {contactEmail}
                    </div>
                </div>

            </div>
        </footer>
    );
};

export default Footer;