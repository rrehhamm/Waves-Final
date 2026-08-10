import React, { useEffect, useState } from 'react';
import adminApi from '../api/adminApi';
import { Card, PageHeader, Button, Input, FormError, FormSuccess } from '../components/ui';
import { Phone, Truck } from 'lucide-react';
import { useAdminLanguage } from '../context/AdminLanguageContext';

const emptyForm = {
    contact_phone: '',
    contact_email: '',
    contact_address: '',
    delivery_fee: '',
};

export default function SiteSettingsAdmin() {
    const { t } = useAdminLanguage();
    const [form, setForm] = useState(emptyForm);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const load = () => {
        setLoading(true);
        adminApi
            .get('/settings')
            .then((res) => {
                const settings = res.data?.data || {};
                setForm({
                    contact_phone: settings.contact_phone || '',
                    contact_email: settings.contact_email || '',
                    contact_address: settings.contact_address || '',
                    delivery_fee: settings.delivery_fee ?? '',
                });
            })
            .catch(() => setError(t('settings.failedLoad')))
            .finally(() => setLoading(false));
    };

    useEffect(load, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        setMessage('');
        try {
            const res = await adminApi.post('/settings', {
                contact_phone: form.contact_phone,
                contact_email: form.contact_email,
                contact_address: form.contact_address,
                delivery_fee: form.delivery_fee,
            });
            setMessage(res.data?.message || t('settings.updated'));
        } catch (err) {
            const errors = err.response?.data?.errors;
            setError(errors ? Object.values(errors).flat().join(' ') : t('common.somethingWrong'));
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div>
                <PageHeader title={t('settings.title')} />
                <Card className="h-96 animate-pulse bg-slate-50" />
            </div>
        );
    }

    return (
        <div>
            <PageHeader title={t('settings.title')} subtitle={t('settings.subtitle')} />

            <form onSubmit={handleSubmit} className="space-y-6">
                <FormError message={error} />
                <FormSuccess message={message} />

                <Card className="p-6">
                    <div className="flex items-center gap-3 mb-5">
                        <div className="w-9 h-9 rounded-xl bg-[#81A6C6]/12 text-[#4E7699] flex items-center justify-center">
                            <Phone size={16} />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-slate-900">{t('settings.contactInfo')}</h3>
                            <p className="text-xs text-slate-400">{t('settings.contactInfoHint')}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                            label={t('settings.phone')}
                            required
                            value={form.contact_phone}
                            onChange={(e) => setForm({ ...form, contact_phone: e.target.value })}
                            placeholder={t('settings.phonePlaceholder')}
                        />
                        <Input
                            label={t('settings.email')}
                            required
                            type="email"
                            value={form.contact_email}
                            onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
                            placeholder={t('settings.emailPlaceholder')}
                        />
                        <div className="sm:col-span-2">
                            <Input
                                label={t('settings.address')}
                                required
                                value={form.contact_address}
                                onChange={(e) => setForm({ ...form, contact_address: e.target.value })}
                                placeholder={t('settings.addressPlaceholder')}
                            />
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center gap-3 mb-5">
                        <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <Truck size={16} />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-slate-900">{t('settings.delivery')}</h3>
                            <p className="text-xs text-slate-400">{t('settings.deliveryHint')}</p>
                        </div>
                    </div>

                    <div className="max-w-xs">
                        <Input
                            label={t('settings.deliveryFee')}
                            required
                            type="number"
                            min="0"
                            step="0.01"
                            value={form.delivery_fee}
                            onChange={(e) => setForm({ ...form, delivery_fee: e.target.value })}
                            placeholder={t('settings.deliveryFeePlaceholder')}
                        />
                    </div>
                </Card>

                <div className="flex justify-end">
                    <Button type="submit" disabled={saving}>
                        {saving ? t('common.saving') : t('settings.saveSettings')}
                    </Button>
                </div>
            </form>
        </div>
    );
}
