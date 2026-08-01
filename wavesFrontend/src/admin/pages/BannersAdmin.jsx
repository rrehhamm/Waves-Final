import React, { useEffect, useState } from 'react';
import adminApi from '../api/adminApi';
import Modal from '../components/Modal';
import { Pencil, Trash2, Plus, ToggleLeft, ToggleRight, ImageIcon } from 'lucide-react';
import { Card, PageHeader, Button, IconButton, Badge, Input, Textarea, Toggle, EmptyState, FormError } from '../components/ui';
import { useLanguage } from '../../context/LanguageContext';

const emptyForm = { title: '', tag: '', description: '', status: true, image: null };

export default function BannersAdmin() {
    const { t } = useLanguage();
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [preview, setPreview] = useState(null);
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState('');

    const load = () => {
        setLoading(true);
        adminApi
            .get('/banners')
            .then((res) => setBanners(res.data?.data || []))
            .catch(() => setError(t('admin.banners.failedLoad')))
            .finally(() => setLoading(false));
    };

    useEffect(load, []);

    const openCreate = () => {
        setEditing(null);
        setForm(emptyForm);
        setPreview(null);
        setFormError('');
        setModalOpen(true);
    };

    const openEdit = (banner) => {
        setEditing(banner);
        setForm({
            title: banner.title || '',
            tag: banner.tag || '',
            description: banner.description || '',
            status: banner.status,
            image: null,
        });
        setPreview(banner.image || null);
        setFormError('');
        setModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setFormError('');
        try {
            const fd = new FormData();
            fd.append('title', form.title);
            fd.append('tag', form.tag || '');
            fd.append('description', form.description || '');
            fd.append('status', form.status ? '1' : '0');
            if (form.image) fd.append('image', form.image);

            if (editing) {
                fd.append('_method', 'PUT');
                await adminApi.post(`/banners/${editing.id}`, fd);
            } else {
                await adminApi.post('/banners', fd);
            }
            setModalOpen(false);
            load();
        } catch (err) {
            const errors = err.response?.data?.errors;
            setFormError(errors ? Object.values(errors).flat().join(' ') : t('admin.common.somethingWrong'));
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (banner) => {
        if (!window.confirm(`${t('admin.banners.deleteConfirm')} "${banner.title}"?`)) return;
        try {
            await adminApi.delete(`/banners/${banner.id}`);
            load();
        } catch {
            alert(t('admin.banners.failedDelete'));
        }
    };

    const handleToggle = async (banner) => {
        try {
            await adminApi.patch(`/banners/${banner.id}/toggle-status`);
            load();
        } catch {
            alert(t('admin.banners.failedToggle'));
        }
    };

    return (
        <div>
            <PageHeader
                title={t('admin.banners.title')}
                subtitle={t('admin.banners.subtitle')}
                actions={
                    <Button onClick={openCreate} icon={Plus}>
                        {t('admin.banners.newBanner')}
                    </Button>
                }
            />

            {error && <div className="mb-4"><FormError message={error} /></div>}

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Card key={i} className="h-56 animate-pulse bg-slate-50" />
                    ))}
                </div>
            ) : banners.length === 0 ? (
                <Card>
                    <EmptyState icon={ImageIcon} title={t('admin.banners.noBanners')} subtitle={t('admin.banners.addFirst')} />
                </Card>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {banners.map((b) => (
                        <Card key={b.id} className="overflow-hidden group hover:shadow-md transition-shadow duration-200">
                            <div className="relative h-36 bg-slate-100">
                                {b.image ? (
                                    <img src={b.image} alt={b.title} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                                        <ImageIcon size={24} />
                                    </div>
                                )}
                                <div className="absolute top-2.5 right-2.5">
                                    <Badge tone={b.status ? 'emerald' : 'slate'} className="shadow-sm">
                                        {b.status ? t('admin.common.active') : t('admin.common.inactive')}
                                    </Badge>
                                </div>
                            </div>
                            <div className="p-4">
                                {b.tag && (
                                    <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-[#3A5A73] bg-[#81A6C6]/12 px-2 py-0.5 rounded-full mb-1.5">
                                        {b.tag}
                                    </span>
                                )}
                                <h3 className="font-bold text-slate-900 text-sm truncate">{b.title}</h3>
                                {b.description && <p className="text-xs text-slate-400 mt-1 line-clamp-2">{b.description}</p>}
                                <div className="flex items-center gap-1 mt-3.5 pt-3 border-t border-slate-100">
                                    <IconButton
                                        icon={b.status ? ToggleRight : ToggleLeft}
                                        tone={b.status ? 'success' : 'default'}
                                        onClick={() => handleToggle(b)}
                                        title={t('admin.banners.toggleActive')}
                                    />
                                    <IconButton icon={Pencil} tone="primary" onClick={() => openEdit(b)} title={t('admin.common.edit')} />
                                    <IconButton icon={Trash2} tone="danger" onClick={() => handleDelete(b)} title={t('admin.common.delete')} className="ml-auto" />
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? t('admin.banners.editBanner') : t('admin.banners.newBanner')}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <FormError message={formError} />

                    <Input
                        label={t('admin.banners.tag')}
                        value={form.tag}
                        onChange={(e) => setForm({ ...form, tag: e.target.value })}
                        placeholder={t('admin.banners.tagPlaceholder')}
                    />
                    <Input
                        label={t('admin.banners.titleField')}
                        required
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        placeholder="e.g. New Summer Arrivals"
                    />
                    <Textarea
                        label={t('admin.banners.highlightText')}
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        rows={2}
                        placeholder="e.g. UP TO 40% OFF"
                    />
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                            {t('admin.common.image')} {editing ? t('admin.common.keepCurrentImage') : ''}
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                                const file = e.target.files?.[0] || null;
                                setForm({ ...form, image: file });
                                if (file) setPreview(URL.createObjectURL(file));
                            }}
                            className="w-full text-sm text-slate-500 file:mr-3 file:py-2 file:px-3.5 file:rounded-lg file:border-0 file:bg-slate-100 file:text-slate-700 file:text-xs file:font-semibold hover:file:bg-slate-200 file:cursor-pointer cursor-pointer"
                        />
                        {preview && <img src={preview} alt="preview" className="mt-2.5 w-28 h-16 rounded-lg object-cover border border-slate-200" />}
                    </div>
                    <Toggle label={t('admin.common.active')} checked={form.status} onChange={(v) => setForm({ ...form, status: v })} />
                    <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                        <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
                            {t('admin.common.cancel')}
                        </Button>
                        <Button type="submit" disabled={saving}>
                            {saving ? t('admin.common.saving') : t('admin.banners.saveBanner')}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
