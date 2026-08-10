import React, { useEffect, useState } from 'react';
import adminApi from '../api/adminApi';
import { Card, PageHeader, Button, Input, Textarea, FormError, FormSuccess } from '../components/ui';
import { PanelTop } from 'lucide-react';
import { useAdminLanguage } from '../context/AdminLanguageContext';

const emptyForm = {
    badge_text: '',
    heading: '',
    subtext: '',
    button1_text: '',
    button1_link: '',
    button2_text: '',
    button2_link: '',
    background_image: null,
};

export default function HeroSectionAdmin() {
    const { t } = useAdminLanguage();
    const [form, setForm] = useState(emptyForm);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const load = () => {
        setLoading(true);
        adminApi
            .get('/hero')
            .then((res) => {
                const hero = res.data?.data || {};
                setForm({
                    badge_text: hero.badge_text || '',
                    heading: hero.heading || '',
                    subtext: hero.subtext || '',
                    button1_text: hero.button1_text || '',
                    button1_link: hero.button1_link || '',
                    button2_text: hero.button2_text || '',
                    button2_link: hero.button2_link || '',
                    background_image: null,
                });
                setPreview(hero.background_image || null);
            })
            .catch(() => setError(t('hero.failedLoad')))
            .finally(() => setLoading(false));
    };

    useEffect(load, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        setMessage('');
        try {
            const fd = new FormData();
            fd.append('badge_text', form.badge_text || '');
            fd.append('heading', form.heading);
            fd.append('subtext', form.subtext || '');
            fd.append('button1_text', form.button1_text || '');
            fd.append('button1_link', form.button1_link || '');
            fd.append('button2_text', form.button2_text || '');
            fd.append('button2_link', form.button2_link || '');
            if (form.background_image) fd.append('background_image', form.background_image);

            const res = await adminApi.post('/hero', fd);
            setMessage(t('hero.updated'));
            const hero = res.data?.data;
            if (hero?.background_image) setPreview(hero.background_image);
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
                <PageHeader title={t('hero.title')} />
                <Card className="h-96 animate-pulse bg-slate-50" />
            </div>
        );
    }

    return (
        <div>
            <PageHeader
                title={t('hero.title')}
                subtitle={t('hero.subtitle')}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <FormError message={error} />
                        <FormSuccess message={message} />

                        <Input
                            label={t('hero.badgeText')}
                            value={form.badge_text}
                            onChange={(e) => setForm({ ...form, badge_text: e.target.value })}
                            placeholder={t('hero.badgePlaceholder')}
                        />
                        <Input
                            label={t('hero.heading')}
                            required
                            value={form.heading}
                            onChange={(e) => setForm({ ...form, heading: e.target.value })}
                            placeholder={t('hero.headingPlaceholder')}
                        />
                        <Textarea
                            label={t('hero.paragraph')}
                            value={form.subtext}
                            onChange={(e) => setForm({ ...form, subtext: e.target.value })}
                            rows={3}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label={t('hero.button1Text')}
                                value={form.button1_text}
                                onChange={(e) => setForm({ ...form, button1_text: e.target.value })}
                                placeholder="e.g. Shop Collection"
                            />
                            <Input
                                label={t('hero.button1Link')}
                                value={form.button1_link}
                                onChange={(e) => setForm({ ...form, button1_link: e.target.value })}
                                placeholder="e.g. /products"
                            />
                            <Input
                                label={t('hero.button2Text')}
                                value={form.button2_text}
                                onChange={(e) => setForm({ ...form, button2_text: e.target.value })}
                                placeholder="e.g. Explore Categories"
                            />
                            <Input
                                label={t('hero.button2Link')}
                                value={form.button2_link}
                                onChange={(e) => setForm({ ...form, button2_link: e.target.value })}
                                placeholder="e.g. /categories"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                                {t('hero.backgroundImage')} {t('common.keepCurrentImage')}
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files?.[0] || null;
                                    setForm({ ...form, background_image: file });
                                    if (file) setPreview(URL.createObjectURL(file));
                                }}
                                className="w-full text-sm text-slate-500 file:mr-3 file:py-2 file:px-3.5 file:rounded-lg file:border-0 file:bg-slate-100 file:text-slate-700 file:text-xs file:font-semibold hover:file:bg-slate-200 file:cursor-pointer cursor-pointer"
                            />
                        </div>

                        <div className="flex justify-end pt-3 border-t border-slate-100">
                            <Button type="submit" disabled={saving}>
                                {saving ? t('common.saving') : t('hero.saveChanges')}
                            </Button>
                        </div>
                    </form>
                </Card>

                <Card className="p-5 h-fit">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">{t('hero.livePreview')}</p>
                    {preview ? (
                        <img src={preview} alt="preview" className="w-full h-48 rounded-xl object-cover border border-slate-200" />
                    ) : (
                        <div className="w-full h-48 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300">
                            <PanelTop size={28} />
                        </div>
                    )}
                    <div className="mt-4 space-y-1">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[#3A5A73]">{form.badge_text || t('hero.badgePreview')}</p>
                        <p className="text-sm font-extrabold text-slate-900 leading-snug">{form.heading || t('hero.headingPreview')}</p>
                        <p className="text-xs text-slate-400 line-clamp-2">{form.subtext || t('hero.paragraphPreview')}</p>
                    </div>
                </Card>
            </div>
        </div>
    );
}
