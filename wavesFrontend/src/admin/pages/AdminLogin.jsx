import React, { useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Mail, AlertCircle, Waves, Eye, EyeOff } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { useAdminLanguage } from '../context/AdminLanguageContext';

export default function AdminLogin() {
    const { t, dir, language } = useAdminLanguage();
    const { login, isAuthenticated, loading } = useAdminAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState(() =>
        searchParams.get('expired') === '1' ? t('login.sessionExpired') : ''
    );
    const [submitting, setSubmitting] = useState(false);

    if (!loading && isAuthenticated) {
        return <Navigate to="/admin" replace />;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);
        try {
            await login(email, password);
            navigate('/admin', { replace: true });
        } catch (err) {
            const message =
                err.response?.data?.errors?.email?.[0] ||
                err.response?.data?.message ||
                t('login.invalidCredentials');
            setError(message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div dir={dir} lang={language} className="min-h-screen flex bg-slate-50 font-sans">
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-slate-900 via-black to-slate-900">
                <div className="absolute inset-0 opacity-[0.08]" style={{
                    backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                    backgroundSize: '28px 28px',
                }} />
                <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-[#81A6C6]/20 blur-3xl" />
                <div className="absolute bottom-0 -left-16 w-72 h-72 rounded-full bg-[#AACDDC]/10 blur-3xl" />
                <div className="relative z-10 flex flex-col justify-between p-14 text-white w-full">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-[#81A6C6] flex items-center justify-center">
                            <Waves size={18} />
                        </div>
                        <span className="text-lg font-extrabold tracking-tight">WAVES</span>
                    </div>

                    <div className="space-y-5 max-w-md">
                        <h2 className="text-3xl font-black leading-tight tracking-tight">
                            {t('login.heading')}
                        </h2>
                        <p className="text-slate-300/80 text-sm leading-relaxed">
                            {t('login.tagline')}
                        </p>
                    </div>

                    <p className="text-xs text-slate-400/70">© {new Date().getFullYear()} Waves. {t('login.rights')}</p>
                </div>
            </div>

            <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
                <div className="w-full max-w-sm">
                    <div className="lg:hidden flex items-center gap-2.5 mb-8 justify-center">
                        <div className="w-9 h-9 rounded-xl bg-black text-white flex items-center justify-center">
                            <Waves size={18} />
                        </div>
                        <span className="text-lg font-extrabold tracking-tight text-slate-900">WAVES</span>
                    </div>

                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{t('login.welcomeBack')}</h1>
                        <p className="text-sm text-slate-500 mt-1.5">{t('login.subtitle')}</p>
                    </div>

                    {error && (
                        <div className="flex items-start gap-2.5 bg-rose-50 border border-rose-100 text-rose-600 text-sm rounded-xl px-3.5 py-3 mb-5">
                            <AlertCircle size={16} className="mt-0.5 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1.5">{t('login.email')}</label>
                            <div className="relative">
                                <Mail size={16} className="absolute start-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 ps-10 pe-3.5 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#81A6C6]/25 focus:border-[#81A6C6] transition-colors"
                                    placeholder="admin@example.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1.5">{t('login.password')}</label>
                            <div className="relative">
                                <Lock size={16} className="absolute start-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 ps-10 pe-10 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#81A6C6]/25 focus:border-[#81A6C6] transition-colors"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((s) => !s)}
                                    className="absolute end-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full bg-black text-white rounded-xl py-3 text-sm font-semibold hover:bg-zinc-800 active:scale-[0.99] transition-all shadow-sm shadow-black/25 disabled:opacity-50 flex items-center justify-center mt-2"
                        >
                            {submitting ? (
                                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                            ) : (
                                t('login.signIn')
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
