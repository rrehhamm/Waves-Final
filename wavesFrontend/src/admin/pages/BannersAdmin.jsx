import React, { useEffect, useState } from 'react';
import adminApi from '../api/adminApi';
import Modal from '../components/Modal';
import { Pencil, Trash2, Plus, ToggleLeft, ToggleRight } from 'lucide-react';

const emptyForm = { title: '', tag: '', description: '', link: '', status: true, image: null };

export default function BannersAdmin() {
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
            .catch(() => setError('Failed to load banners.'))
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
            link: banner.link || '',
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
            fd.append('link', form.link || '');
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
            setFormError(errors ? Object.values(errors).flat().join(' ') : 'Something went wrong. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (banner) => {
        if (!window.confirm(`Delete banner "${banner.title}"?`)) return;
        try {
            await adminApi.delete(`/banners/${banner.id}`);
            load();
        } catch {
            alert('Failed to delete banner.');
        }
    };

    const handleToggle = async (banner) => {
        try {
            await adminApi.patch(`/banners/${banner.id}/toggle-status`);
            load();
        } catch {
            alert('Failed to toggle banner status.');
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Banners</h1>
                <button
                    onClick={openCreate}
                    type="button"
                    className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800"
                >
                    <Plus size={16} /> New Banner
                </button>
            </div>

            {error && <p className="text-red-600 mb-4 text-sm">{error}</p>}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {loading ? (
                    <p className="text-gray-400 col-span-full text-center py-6">Loading...</p>
                ) : banners.length === 0 ? (
                    <p className="text-gray-400 col-span-full text-center py-6">No banners yet.</p>
                ) : (
                    banners.map((b) => (
                        <div key={b.id} className="bg-white rounded-xl border overflow-hidden">
                            {b.image && <img src={b.image} alt={b.title} className="w-full h-32 object-cover" />}
                            <div className="p-4">
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        {b.tag && (
                                            <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full mb-1">
                                                {b.tag}
                                            </span>
                                        )}
                                        <h3 className="font-semibold">{b.title}</h3>
                                    </div>
                                    <span
                                        className={`px-2 py-1 rounded-full text-xs font-medium shrink-0 ${
                                            b.status ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                                        }`}
                                    >
                                        {b.status ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                                {b.description && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{b.description}</p>}
                                <div className="flex items-center gap-3 mt-3">
                                    <button onClick={() => handleToggle(b)} type="button" className="text-gray-500 hover:text-gray-900" title="Toggle active">
                                        {b.status ? <ToggleRight size={20} className="text-green-600" /> : <ToggleLeft size={20} />}
                                    </button>
                                    <button onClick={() => openEdit(b)} type="button" className="text-gray-500 hover:text-gray-900" title="Edit">
                                        <Pencil size={16} />
                                    </button>
                                    <button onClick={() => handleDelete(b)} type="button" className="text-red-500 hover:text-red-700" title="Delete">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Banner' : 'New Banner'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {formError && <p className="text-red-600 text-sm">{formError}</p>}

                    <div>
                        <label className="block text-sm font-medium mb-1">Tag / Badge</label>
                        <input
                            value={form.tag}
                            onChange={(e) => setForm({ ...form, tag: e.target.value })}
                            className="w-full border rounded-lg px-3 py-2 text-sm"
                            placeholder="e.g. Trending Now"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Title (heading)</label>
                        <input
                            required
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                            className="w-full border rounded-lg px-3 py-2 text-sm"
                            placeholder="e.g. New Summer Arrivals"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Highlight text (e.g. discount)</label>
                        <textarea
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            className="w-full border rounded-lg px-3 py-2 text-sm"
                            rows={2}
                            placeholder="e.g. UP TO 40% OFF"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Link URL</label>
                        <input
                            type="url"
                            value={form.link}
                            onChange={(e) => setForm({ ...form, link: e.target.value })}
                            className="w-full border rounded-lg px-3 py-2 text-sm"
                            placeholder="https://..."
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Image {editing ? '(leave empty to keep current)' : ''}
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                                const file = e.target.files?.[0] || null;
                                setForm({ ...form, image: file });
                                if (file) setPreview(URL.createObjectURL(file));
                            }}
                            className="w-full text-sm"
                        />
                        {preview && <img src={preview} alt="preview" className="mt-2 w-24 h-16 rounded object-cover" />}
                    </div>
                    <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" checked={form.status} onChange={(e) => setForm({ ...form, status: e.target.checked })} />
                        Active
                    </label>
                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => setModalOpen(false)}
                            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
