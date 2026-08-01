import React from 'react';
import { Search, ChevronLeft, ChevronRight, Inbox } from 'lucide-react';

export function Card({ children, className = '', ...rest }) {
    return (
        <div
            className={`bg-white rounded-2xl border border-slate-200/70 shadow-sm ${className}`}
            {...rest}
        >
            {children}
        </div>
    );
}

const statTones = {
    indigo: { bg: 'bg-[#81A6C6]/12', text: 'text-[#4E7699]', ring: 'ring-[#81A6C6]/20' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', ring: 'ring-emerald-600/10' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-600', ring: 'ring-amber-600/10' },
    rose: { bg: 'bg-rose-50', text: 'text-rose-600', ring: 'ring-rose-600/10' },
    blue: { bg: 'bg-[#AACDDC]/25', text: 'text-[#4E7699]', ring: 'ring-[#81A6C6]/15' },
    violet: { bg: 'bg-slate-900/5', text: 'text-slate-900', ring: 'ring-slate-900/10' },
};

export function StatCard({ label, value, icon: Icon, tone = 'indigo', hint }) {
    const t = statTones[tone] || statTones.indigo;
    return (
        <Card className="p-4 sm:p-5 flex items-start justify-between gap-2.5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
            <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide leading-snug break-words">{label}</p>
                <p className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1.5 tracking-tight truncate">{value}</p>
                {hint && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
            </div>
            <div className={`shrink-0 w-10 h-10 sm:w-11 sm:h-11 rounded-xl ${t.bg} ${t.text} ring-1 ${t.ring} flex items-center justify-center`}>
                <Icon size={19} />
            </div>
        </Card>
    );
}

export function PageHeader({ title, subtitle, actions }) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">{title}</h1>
                {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
            </div>
            {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
        </div>
    );
}

const buttonVariants = {
    primary: 'bg-black text-white hover:bg-zinc-800 shadow-sm shadow-black/20 focus-visible:ring-black/40',
    secondary: 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 focus-visible:ring-slate-300',
    ghost: 'text-slate-500 hover:text-slate-900 hover:bg-slate-100 focus-visible:ring-slate-300',
    danger: 'bg-white text-rose-600 border border-rose-200 hover:bg-rose-50 focus-visible:ring-rose-300',
    dangerSolid: 'bg-rose-600 text-white hover:bg-rose-700 shadow-sm shadow-rose-600/20 focus-visible:ring-rose-500',
    success: 'bg-white text-emerald-600 border border-emerald-200 hover:bg-emerald-50 focus-visible:ring-emerald-300',
};

export function Button({ variant = 'primary', className = '', children, icon: Icon, disabled, ...rest }) {
    return (
        <button
            type="button"
            disabled={disabled}
            className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] ${buttonVariants[variant]} ${className}`}
            {...rest}
        >
            {Icon && <Icon size={16} />}
            {children}
        </button>
    );
}

export function IconButton({ icon: Icon, tone = 'default', className = '', ...rest }) {
    const tones = {
        default: 'text-slate-400 hover:text-slate-700 hover:bg-slate-100',
        primary: 'text-[#4E7699] hover:text-[#3A5A73] hover:bg-[#81A6C6]/10',
        danger: 'text-rose-500 hover:text-rose-700 hover:bg-rose-50',
        success: 'text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50',
    };
    return (
        <button
            type="button"
            className={`inline-flex items-center justify-center w-8 h-8 rounded-lg transition-colors duration-150 ${tones[tone]} ${className}`}
            {...rest}
        >
            <Icon size={16} />
        </button>
    );
}

const badgeTones = {
    slate: 'bg-slate-100 text-slate-600',
    emerald: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/10',
    rose: 'bg-rose-50 text-rose-700 ring-1 ring-rose-600/10',
    amber: 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/10',
    blue: 'bg-blue-50 text-blue-700 ring-1 ring-blue-600/10',
    indigo: 'bg-[#81A6C6]/12 text-[#3A5A73] ring-1 ring-[#81A6C6]/20',
    gray: 'bg-slate-100 text-slate-500',
};

export function Badge({ tone = 'slate', children, className = '', dot = false }) {
    return (
        <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${badgeTones[tone]} ${className}`}
        >
            {dot && <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />}
            {children}
        </span>
    );
}

export function Input({ label, error, className = '', ...rest }) {
    return (
        <div>
            {label && <label className="block text-xs font-semibold text-slate-600 mb-1.5">{label}</label>}
            <input
                className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#81A6C6]/30 ${
                    error ? 'border-rose-300 focus:border-rose-400' : 'border-slate-200 focus:border-[#81A6C6]'
                } ${className}`}
                {...rest}
            />
        </div>
    );
}

export function Textarea({ label, error, className = '', ...rest }) {
    return (
        <div>
            {label && <label className="block text-xs font-semibold text-slate-600 mb-1.5">{label}</label>}
            <textarea
                className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#81A6C6]/30 ${
                    error ? 'border-rose-300 focus:border-rose-400' : 'border-slate-200 focus:border-[#81A6C6]'
                } ${className}`}
                {...rest}
            />
        </div>
    );
}

export function Select({ label, className = '', children, ...rest }) {
    return (
        <div>
            {label && <label className="block text-xs font-semibold text-slate-600 mb-1.5">{label}</label>}
            <select
                className={`w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#81A6C6]/30 focus:border-[#81A6C6] ${className}`}
                {...rest}
            >
                {children}
            </select>
        </div>
    );
}

export function Toggle({ label, checked, onChange }) {
    return (
        <label className="flex items-center gap-2.5 text-sm font-medium text-slate-700 cursor-pointer select-none">
            <span
                onClick={() => onChange(!checked)}
                className={`relative inline-flex h-5.5 w-10 items-center rounded-full transition-colors duration-200 ${
                    checked ? 'bg-[#81A6C6]' : 'bg-slate-200'
                }`}
                style={{ height: '22px', width: '40px' }}
            >
                <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${
                        checked ? 'translate-x-5' : 'translate-x-1'
                    }`}
                />
            </span>
            {label}
        </label>
    );
}

export function SearchBox({ value, onChange, placeholder = 'Search...', className = '', ...rest }) {
    return (
        <div className={`relative ${className}`}>
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="w-full rounded-xl border border-slate-200 pl-9 pr-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#81A6C6]/30 focus:border-[#81A6C6] transition-colors duration-150"
                {...rest}
            />
        </div>
    );
}

export function EmptyState({ icon: Icon = Inbox, title = 'Nothing here yet', subtitle }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
                <Icon size={20} className="text-slate-400" />
            </div>
            <p className="text-sm font-semibold text-slate-600">{title}</p>
            {subtitle && <p className="text-xs text-slate-400 mt-1 max-w-xs">{subtitle}</p>}
        </div>
    );
}

export function TableSkeletonRow({ cols = 5 }) {
    return (
        <tr>
            {Array.from({ length: cols }).map((_, i) => (
                <td key={i} className="px-5 py-3.5">
                    <div className="h-3.5 rounded-full bg-slate-100 animate-pulse" style={{ width: `${60 + (i % 3) * 15}%` }} />
                </td>
            ))}
        </tr>
    );
}

export function Pagination({ meta, page, onPageChange }) {
    if (!meta || meta.last_page <= 1) return null;
    return (
        <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100">
            <span className="text-xs text-slate-400">
                Page <span className="font-semibold text-slate-600">{meta.current_page}</span> of{' '}
                <span className="font-semibold text-slate-600">{meta.last_page}</span>
                {typeof meta.total === 'number' && <span className="hidden sm:inline"> · {meta.total} total</span>}
            </span>
            <div className="flex items-center gap-2">
                <button
                    disabled={page <= 1}
                    onClick={() => onPageChange(Math.max(1, page - 1))}
                    type="button"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                >
                    <ChevronLeft size={13} /> Prev
                </button>
                <button
                    disabled={page >= meta.last_page}
                    onClick={() => onPageChange(page + 1)}
                    type="button"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                >
                    Next <ChevronRight size={13} />
                </button>
            </div>
        </div>
    );
}

export function Tabs({ value, onChange, options }) {
    return (
        <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-slate-100/80">
            {options.map((opt) => (
                <button
                    key={opt.value}
                    type="button"
                    onClick={() => onChange(opt.value)}
                    className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all duration-150 ${
                        value === opt.value ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                    }`}
                >
                    {opt.label}
                </button>
            ))}
        </div>
    );
}

export function FormError({ message }) {
    if (!message) return null;
    return (
        <div className="rounded-xl bg-rose-50 border border-rose-100 px-3.5 py-2.5 text-sm text-rose-600 font-medium">
            {message}
        </div>
    );
}

export function FormSuccess({ message }) {
    if (!message) return null;
    return (
        <div className="rounded-xl bg-emerald-50 border border-emerald-100 px-3.5 py-2.5 text-sm text-emerald-700 font-medium">
            {message}
        </div>
    );
}
