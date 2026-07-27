import React, { useEffect, useState } from 'react';
import adminApi from '../api/adminApi';
import Modal from '../components/Modal';
import { Pencil, Trash2, Plus, ToggleLeft, ToggleRight, ArrowUp, ArrowDown } from 'lucide-react';

const emptyForm = { title: '', description: '', status: true, image: null };

export default function GalleryAdmin() {
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
            .catch(() => setError('Failed to load gallery.'))
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
                // New images are appended to the end of the current order
                fd.append('sort_order', String(images.length));
                await adminApi.post('/gallery', fd);
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

    const handleDelete = async (img) => {
        if (!window.confirm('Delete this gallery image?')) return;
        try {
            await adminApi.delete(`/gallery/${img.id}`);
            load();
        } catch {
            alert('Failed to delete image.');
        }
    };

    const handleToggle = async (img) => {
        try {
            await adminApi.patch(`/gallery/${img.id}/toggle-status`);
            load();
        } catch {
            alert('Failed to toggle image visibility.');
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
            alert('Failed to save new order.');
            load();
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Gallery</h1>
                <button
                    onClick={openCreate}
                    type="button"
                    className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800"
                >
                    <Plus size={16} /> Add Image
                </button>
            </div>

            {error && <p className="text-red-600 mb-4 text-sm">{error}</p>}

            <div className="bg-white rounded-xl border overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-500 text-left">
                        <tr>
                            <th className="px-4 py-3">Order</th>
                            <th className="px-4 py-3">Image</th>
                            <th className="px-4 py-3">Title</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="px-4 py-6 text-center text-gray-400">
                                    Loading...
                                </td>
                            </tr>
                        ) : images.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-4 py-6 text-center text-gray-400">
                                    No gallery images yet.
                                </td>
                            </tr>
                        ) : (
                            images.map((img, index) => (
                                <tr key={img.id}>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-1">
                                            <button
                                                disabled={index === 0}
                                                onClick={() => move(index, -1)}
                                                type="button"
                                                className="text-gray-400 hover:text-gray-800 disabled:opacity-30"
                                            >
                                                <ArrowUp size={14} />
                                            </button>
                                            <button
                                                disabled={index === images.length - 1}
                                                onClick={() => move(index, 1)}
                                                type="button"
                                                className="text-gray-400 hover:text-gray-800 disabled:opacity-30"
                                            >
                                                <ArrowDown size={14} />
                                            </button>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        {img.image ? (
                                            <img src={img.image} alt={img.title} className="w-10 h-10 rounded object-cover" />
                                        ) : (
                                            <div className="w-10 h-10 rounded bg-gray-100" />
                                        )}
                                    </td>
                                    <td className="px-4 py-3 font-medium">{img.title || '—'}</td>
                                    <td className="px-4 py-3">
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                img.status ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                                            }`}
                                        >
                                            {img.status ? 'Visible' : 'Hidden'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right space-x-3">
                                        <button onClick={() => handleToggle(img)} type="button" className="text-gray-500 hover:text-gray-900" title="Show/Hide">
                                            {img.status ? <ToggleRight size={18} className="text-green-600" /> : <ToggleLeft size={18} />}
                                        </button>
                                        <button onClick={() => openEdit(img)} type="button" className="text-gray-500 hover:text-gray-900" title="Edit">
                                            <Pencil size={16} />
                                        </button>
                                        <button onClick={() => handleDelete(img)} type="button" className="text-red-500 hover:text-red-700" title="Delete">
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Image' : 'Add Image'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {formError && <p className="text-red-600 text-sm">{formError}</p>}

                    <div>
                        <label className="block text-sm font-medium mb-1">Title</label>
                        <input
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                            className="w-full border rounded-lg px-3 py-2 text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Description</label>
                        <textarea
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            className="w-full border rounded-lg px-3 py-2 text-sm"
                            rows={2}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Image {editing ? '(leave empty to keep current)' : ''}
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
                            className="w-full text-sm"
                        />
                        {preview && <img src={preview} alt="preview" className="mt-2 w-16 h-16 rounded object-cover" />}
                    </div>
                    <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" checked={form.status} onChange={(e) => setForm({ ...form, status: e.target.checked })} />
                        Visible
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
