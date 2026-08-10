import React, { useEffect, useState } from 'react';
import adminApi from '../api/adminApi';
import Modal from '../components/Modal';
import { Pencil, Trash2, Plus, ToggleLeft, ToggleRight, ArrowUp, ArrowDown, GalleryHorizontal, ImageOff } from 'lucide-react';
import { Card, PageHeader, Button, IconButton, Badge, Input, Textarea, Toggle, EmptyState, TableSkeletonRow, FormError } from '../components/ui';
import { useAdminLanguage } from '../context/AdminLanguageContext';

const emptyForm = { title: '', description: '', status: true, image: null };

export default function GalleryAdmin() {
    const { t } = useAdminLanguage();
    const [images, setImages] = useState([]);
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
            .get('/gallery')
            .then((res) => setImages((res.data?.data || []).slice().sort((a, b) => a.sort_order - b.sort_order)))
            .catch(() => setError(t('gallery.failedLoad')))
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

    const openEdit = (img) => {
        setEditing(img);
        setForm({ title: img.title || '', description: img.description || '', status: img.status, image: null });
        setPreview(img.image || null);
        setFormError('');
        setModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setFormError('');
        try {
            const fd = new FormData();
            fd.append('title', form.title || '');
            fd.append('description', form.description || '');
            fd.append('status', form.status ? '1' : '0');
            if (form.image) fd.append('image', form.image);

            if (editing) {
                fd.append('_method', 'PUT');
                await adminApi.post(`/gallery/${editing.id}`, fd);
            } else {
                fd.append('sort_order', String(images.length));
                await adminApi.post('/gallery', fd);
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

    const handleDelete = async (img) => {
        if (!window.confirm(t('gallery.deleteConfirm'))) return;
        try {
            await adminApi.delete(`/gallery/${img.id}`);
            load();
        } catch {
            alert(t('gallery.failedDelete'));
        }
    };

    const handleToggle = async (img) => {
        try {
            await adminApi.patch(`/gallery/${img.id}/toggle-status`);
            load();
        } catch {
            alert(t('gallery.failedToggle'));
        }
    };

    const move = async (index, direction) => {
        const targetIndex = index + direction;
        if (targetIndex < 0 || targetIndex >= images.length) return;

        const reordered = [...images];
        [reordered[index], reordered[targetIndex]] = [reordered[targetIndex], reordered[index]];
        setImages(reordered);

        try {
            await adminApi.post('/gallery/sort', {
                items: reordered.map((img, i) => ({ id: img.id, sort_order: i })),
            });
            load();
        } catch {
            alert(t('gallery.failedReorder'));
            load();
        }
    };

    return (
        <div>
            <PageHeader
                title={t('gallery.title')}
                subtitle={t('gallery.subtitle')}
                actions={
                    <Button onClick={openCreate} icon={Plus}>
                        {t('gallery.addImage')}
                    </Button>
                }
            />

            {error && <div className="mb-4"><FormError message={error} /></div>}

            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="text-left border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-3.5 font-semibold text-xs uppercase tracking-wide text-slate-400">{t('gallery.order')}</th>
                                <th className="px-6 py-3.5 font-semibold text-xs uppercase tracking-wide text-slate-400">{t('gallery.image')}</th>
                                <th className="px-6 py-3.5 font-semibold text-xs uppercase tracking-wide text-slate-400">{t('gallery.titleField')}</th>
                                <th className="px-6 py-3.5 font-semibold text-xs uppercase tracking-wide text-slate-400">{t('common.status')}</th>
                                <th className="px-6 py-3.5 font-semibold text-xs uppercase tracking-wide text-slate-400 text-right">{t('common.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <TableSkeletonRow cols={5} />
                            ) : images.length === 0 ? (
                                <tr>
                                    <td colSpan={5}>
                                        <EmptyState icon={GalleryHorizontal} title={t('gallery.noImages')} subtitle={t('gallery.addFirst')} />
                                    </td>
                                </tr>
                            ) : (
                                images.map((img, index) => (
                                    <tr key={img.id} className="hover:bg-slate-50/70 transition-colors">
                                        <td className="px-6 py-3">
                                            <div className="flex items-center gap-1">
                                                <IconButton icon={ArrowUp} disabled={index === 0} onClick={() => move(index, -1)} className="disabled:opacity-30" />
                                                <IconButton icon={ArrowDown} disabled={index === images.length - 1} onClick={() => move(index, 1)} className="disabled:opacity-30" />
                                            </div>
                                        </td>
                                        <td className="px-6 py-3">
                                            {img.image ? (
                                                <img src={img.image} alt={img.title} className="w-10 h-10 rounded-lg object-cover" />
                                            ) : (
                                                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-300">
                                                    <ImageOff size={15} />
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-3 font-semibold text-slate-800">{img.title || '—'}</td>
                                        <td className="px-6 py-3">
                                            <Badge tone={img.status ? 'emerald' : 'slate'}>{img.status ? t('gallery.statusVisible') : t('gallery.statusHidden')}</Badge>
                                        </td>
                                        <td className="px-6 py-3 text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <IconButton
                                                    icon={img.status ? ToggleRight : ToggleLeft}
                                                    tone={img.status ? 'success' : 'default'}
                                                    onClick={() => handleToggle(img)}
                                                    title={t('gallery.showHide')}
                                                />
                                                <IconButton icon={Pencil} tone="primary" onClick={() => openEdit(img)} title={t('common.edit')} />
                                                <IconButton icon={Trash2} tone="danger" onClick={() => handleDelete(img)} title={t('common.delete')} />
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? t('gallery.editImage') : t('gallery.addImage')}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <FormError message={formError} />

                    <Input label={t('gallery.titleField')} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                    <Textarea
                        label={t('gallery.description')}
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        rows={2}
                    />
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                            {t('gallery.image')} {editing ? t('common.keepCurrentImage') : ''}
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            required={!editing}
                            onChange={(e) => {
                                const file = e.target.files?.[0] || null;
                                setForm({ ...form, image: file });
                                if (file) setPreview(URL.createObjectURL(file));
                            }}
                            className="w-full text-sm text-slate-500 file:mr-3 file:py-2 file:px-3.5 file:rounded-lg file:border-0 file:bg-slate-100 file:text-slate-700 file:text-xs file:font-semibold hover:file:bg-slate-200 file:cursor-pointer cursor-pointer"
                        />
                        {preview && <img src={preview} alt="preview" className="mt-2.5 w-16 h-16 rounded-lg object-cover border border-slate-200" />}
                    </div>
                    <Toggle label={t('gallery.visible')} checked={form.status} onChange={(v) => setForm({ ...form, status: v })} />
                    <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                        <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
                            {t('common.cancel')}
                        </Button>
                        <Button type="submit" disabled={saving}>
                            {saving ? t('common.saving') : t('gallery.saveImage')}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
