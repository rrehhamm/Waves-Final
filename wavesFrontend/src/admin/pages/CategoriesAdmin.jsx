import React, { useEffect, useState } from 'react';
import adminApi from '../api/adminApi';
import Modal from '../components/Modal';
import { Pencil, Trash2, Plus, Star } from 'lucide-react';

const emptyForm = { name_ar: '', name_en: '', description: '', status: true, featured: false, image: null };

export default function CategoriesAdmin() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [imagePreview, setImagePreview] = useState(null);
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState('');

    const [blockingInfo, setBlockingInfo] = useState(null);

    const load = () => {
        setLoading(true);
        adminApi
            .get('/categories')
            .then((res) => setCategories(res.data?.data || []))
            .catch(() => setError('Failed to load categories.'))
            .finally(() => setLoading(false));
    };

    useEffect(load, []);

    const openCreate = () => {
        setEditing(null);
        setForm(emptyForm);
        setImagePreview(null);
        setFormError('');
        setModalOpen(true);
    };

    const openEdit = (cat) => {
        setEditing(cat);
        // The list API only returns the already-translated "name" (not separate name_ar/name_en),
        // so we pre-fill both language fields with it and let the admin adjust whichever needs editing.
        setForm({
            name_ar: cat.name || '',
            name_en: cat.name || '',
            description: cat.description || '',
            status: cat.status,
            featured: cat.featured,
            image: null,
        });
        setImagePreview(cat.image || null);
        setFormError('');
        setModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setFormError('');
        try {
            const fd = new FormData();
            fd.append('name_ar', form.name_ar);
            fd.append('name_en', form.name_en);
            fd.append('description', form.description || '');
            fd.append('status', form.status ? '1' : '0');
            fd.append('featured', form.featured ? '1' : '0');
            if (form.image) fd.append('image', form.image);

            if (editing) {
                fd.append('_method', 'PUT');
                await adminApi.post(`/categories/${editing.id}`, fd);
            } else {
                await adminApi.post('/categories', fd);
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

    const handleDelete = async (cat) => {
        if (!window.confirm(`Delete category "${cat.name}"?`)) return;
        try {
            await adminApi.delete(`/categories/${cat.id}`);
            load();
        } catch (err) {
            if (err.response?.status === 409) {
                setBlockingInfo({ category: cat, products: err.response.data?.blocking_products || [] });
            } else {
                alert('Failed to delete category.');
            }
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Categories</h1>
                <button
                    onClick={openCreate}
                    type="button"
                    className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800"
                >
                    <Plus size={16} /> New Category
                </button>
            </div>

            {error && <p className="text-red-600 mb-4 text-sm">{error}</p>}

            <div className="bg-white rounded-xl border overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-500 text-left">
                        <tr>
                            <th className="px-4 py-3">Image</th>
                            <th className="px-4 py-3">Name</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3">Featured</th>
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
                        ) : categories.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-4 py-6 text-center text-gray-400">
                                    No categories yet.
                                </td>
                            </tr>
                        ) : (
                            categories.map((cat) => (
                                <tr key={cat.id}>
                                    <td className="px-4 py-3">
                                        {cat.image ? (
                                            <img src={cat.image} alt={cat.name} className="w-10 h-10 rounded object-cover" />
                                        ) : (
                                            <div className="w-10 h-10 rounded bg-gray-100" />
                                        )}
                                    </td>
                                    <td className="px-4 py-3 font-medium">{cat.name}</td>
                                    <td className="px-4 py-3">
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                cat.status ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                                            }`}
                                        >
                                            {cat.status ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        {cat.featured ? (
                                            <Star size={16} className="text-amber-500 fill-amber-500" />
                                        ) : (
                                            <Star size={16} className="text-gray-300" />
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-right space-x-3">
                                        <button onClick={() => openEdit(cat)} type="button" className="text-gray-500 hover:text-gray-900">
                                            <Pencil size={16} />
                                        </button>
                                        <button onClick={() => handleDelete(cat)} type="button" className="text-red-500 hover:text-red-700">
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Category' : 'New Category'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {formError && <p className="text-red-600 text-sm">{formError}</p>}

                    <div>
                        <label className="block text-sm font-medium mb-1">Name (Arabic)</label>
                        <input
                            required
                            value={form.name_ar}
                            onChange={(e) => setForm({ ...form, name_ar: e.target.value })}
                            className="w-full border rounded-lg px-3 py-2 text-sm"
                            dir="rtl"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Name (English)</label>
                        <input
                            required
                            value={form.name_en}
                            onChange={(e) => setForm({ ...form, name_en: e.target.value })}
                            className="w-full border rounded-lg px-3 py-2 text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Description</label>
                        <textarea
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            className="w-full border rounded-lg px-3 py-2 text-sm"
                            rows={3}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Image</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                                const file = e.target.files?.[0] || null;
                                setForm({ ...form, image: file });
                                if (file) setImagePreview(URL.createObjectURL(file));
                            }}
                            className="w-full text-sm"
                        />
                        {imagePreview && <img src={imagePreview} alt="preview" className="mt-2 w-16 h-16 rounded object-cover" />}
                    </div>
                    <div className="flex items-center gap-6">
                        <label className="flex items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                checked={form.status}
                                onChange={(e) => setForm({ ...form, status: e.target.checked })}
                            />
                            Active
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                checked={form.featured}
                                onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                            />
                            Featured on homepage
                        </label>
                    </div>
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

            <Modal open={!!blockingInfo} onClose={() => setBlockingInfo(null)} title="Cannot delete category">
                <p className="text-sm text-gray-600 mb-3">
                    "{blockingInfo?.category?.name}" still has products attached. Reassign or delete those products first (Products
                    page):
                </p>
                <ul className="text-sm list-disc pl-5 space-y-1">
                    {blockingInfo?.products?.map((p) => (
                        <li key={p.id}>{p.name}</li>
                    ))}
                </ul>
            </Modal>
        </div>
    );
}
