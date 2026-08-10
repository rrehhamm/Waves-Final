import React, { useEffect, useState } from 'react';
import adminApi from '../api/adminApi';
import Modal from '../components/Modal';
import { Pencil, Trash2, Plus, Star, Tags, ImageOff } from 'lucide-react';
import { Card, PageHeader, Button, IconButton, Badge, Input, Textarea, Toggle, EmptyState, TableSkeletonRow, FormError } from '../components/ui';
import { useAdminLanguage } from '../context/AdminLanguageContext';

const emptyForm = { name: '', description: '', status: true, featured: false, logo: null };

export default function BrandsAdmin() {
    const { t } = useAdminLanguage();
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [logoPreview, setLogoPreview] = useState(null);
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState('');

    const [blockingInfo, setBlockingInfo] = useState(null);

    const load = () => {
        setLoading(true);
        adminApi
            .get('/brands')
            .then((res) => setBrands(res.data?.data || []))
            .catch(() => setError(t('brands.failedLoad')))
            .finally(() => setLoading(false));
    };

    useEffect(load, []);

    const openCreate = () => {
        setEditing(null);
        setForm(emptyForm);
        setLogoPreview(null);
        setFormError('');
        setModalOpen(true);
    };

    const openEdit = (brand) => {
        setEditing(brand);
        setForm({
            name: brand.name || '',
            description: brand.description || '',
            status: brand.status,
            featured: brand.featured,
            logo: null,
        });
        setLogoPreview(brand.logo || null);
        setFormError('');
        setModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setFormError('');
        try {
            const fd = new FormData();
            fd.append('name', form.name);
            fd.append('description', form.description || '');
            fd.append('status', form.status ? '1' : '0');
            fd.append('featured', form.featured ? '1' : '0');
            if (form.logo) fd.append('logo', form.logo);

            if (editing) {
                fd.append('_method', 'PUT');
                await adminApi.post(`/brands/${editing.id}`, fd);
            } else {
                await adminApi.post('/brands', fd);
            }
            setModalOpen(false);
            load();
        } catch (err) {
            const errors = err.response?.data?.errors;
            setFormError(errors ? Object.values(errors).flat().join(' ') : t('common.somethingWrong'));
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (brand) => {
        if (!window.confirm(`${t('brands.deleteConfirm')} "${brand.name}"?`)) return;
        try {
            await adminApi.delete(`/brands/${brand.id}`);
            load();
        } catch (err) {
            if (err.response?.status === 409) {
                setBlockingInfo({ brand, products: err.response.data?.blocking_products || [] });
            } else {
                alert(t('brands.failedDelete'));
            }
        }
    };

    return (
        <div>
            <PageHeader
                title={t('brands.title')}
                subtitle={t('brands.subtitle')}
                actions={
                    <Button onClick={openCreate} icon={Plus}>
                        {t('brands.newBrand')}
                    </Button>
                }
            />

            {error && <div className="mb-4"><FormError message={error} /></div>}

            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="text-left border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-3.5 font-semibold text-xs uppercase tracking-wide text-slate-400">{t('brands.logo')}</th>
                                <th className="px-6 py-3.5 font-semibold text-xs uppercase tracking-wide text-slate-400">{t('common.name')}</th>
                                <th className="px-6 py-3.5 font-semibold text-xs uppercase tracking-wide text-slate-400">{t('common.status')}</th>
                                <th className="px-6 py-3.5 font-semibold text-xs uppercase tracking-wide text-slate-400">{t('categories.featured')}</th>
                                <th className="px-6 py-3.5 font-semibold text-xs uppercase tracking-wide text-slate-400 text-right">{t('common.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <TableSkeletonRow cols={5} />
                            ) : brands.length === 0 ? (
                                <tr>
                                    <td colSpan={5}>
                                        <EmptyState icon={Tags} title={t('brands.noBrands')} subtitle={t('brands.createFirst')} />
                                    </td>
                                </tr>
                            ) : (
                                brands.map((brand) => (
                                    <tr key={brand.id} className="hover:bg-slate-50/70 transition-colors">
                                        <td className="px-6 py-3">
                                            {brand.logo ? (
                                                <img src={brand.logo} alt={brand.name} className="w-10 h-10 rounded-lg object-cover" />
                                            ) : (
                                                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-300">
                                                    <ImageOff size={15} />
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-3 font-semibold text-slate-800">{brand.name}</td>
                                        <td className="px-6 py-3">
                                            <Badge tone={brand.status ? 'emerald' : 'slate'}>{brand.status ? t('common.active') : t('common.inactive')}</Badge>
                                        </td>
                                        <td className="px-6 py-3">
                                            {brand.featured ? (
                                                <Star size={16} className="text-amber-500 fill-amber-500" />
                                            ) : (
                                                <Star size={16} className="text-slate-200" />
                                            )}
                                        </td>
                                        <td className="px-6 py-3 text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <IconButton icon={Pencil} tone="primary" onClick={() => openEdit(brand)} title={t('common.edit')} />
                                                <IconButton icon={Trash2} tone="danger" onClick={() => handleDelete(brand)} title={t('common.delete')} />
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? t('brands.editBrand') : t('brands.newBrand')}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <FormError message={formError} />

                    <Input label={t('brands.name')} required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                    <Textarea
                        label={t('brands.description')}
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        rows={3}
                    />
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">{t('brands.logo')}</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                                const file = e.target.files?.[0] || null;
                                setForm({ ...form, logo: file });
                                if (file) setLogoPreview(URL.createObjectURL(file));
                            }}
                            className="w-full text-sm text-slate-500 file:mr-3 file:py-2 file:px-3.5 file:rounded-lg file:border-0 file:bg-slate-100 file:text-slate-700 file:text-xs file:font-semibold hover:file:bg-slate-200 file:cursor-pointer cursor-pointer"
                        />
                        {logoPreview && <img src={logoPreview} alt="preview" className="mt-2.5 w-16 h-16 rounded-lg object-cover border border-slate-200" />}
                    </div>
                    <div className="flex items-center gap-6 pt-1">
                        <Toggle label={t('common.active')} checked={form.status} onChange={(v) => setForm({ ...form, status: v })} />
                        <Toggle label={t('brands.featuredOnHome')} checked={form.featured} onChange={(v) => setForm({ ...form, featured: v })} />
                    </div>
                    <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                        <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
                            {t('common.cancel')}
                        </Button>
                        <Button type="submit" disabled={saving}>
                            {saving ? t('common.saving') : t('brands.saveBrand')}
                        </Button>
                    </div>
                </form>
            </Modal>

            <Modal open={!!blockingInfo} onClose={() => setBlockingInfo(null)} title={t('brands.cannotDelete')}>
                <p className="text-sm text-slate-500 mb-3">
                    "{blockingInfo?.brand?.name}" {t('common.stillHasProducts')}
                </p>
                <ul className="text-sm space-y-1.5">
                    {blockingInfo?.products?.map((p) => (
                        <li key={p.id} className="flex items-center gap-2 text-slate-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                            {p.name}
                        </li>
                    ))}
                </ul>
            </Modal>
        </div>
    );
}
