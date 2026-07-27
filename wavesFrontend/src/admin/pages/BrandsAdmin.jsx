import React, { useEffect, useState } from 'react';
import adminApi from '../api/adminApi';
import Modal from '../components/Modal';
import { Pencil, Trash2, Plus, Star } from 'lucide-react';

const emptyForm = { name: '', description: '', status: true, featured: false, logo: null };

export default function BrandsAdmin() {
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
            .catch(() => setError('Failed to load brands.'))
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
            setFormError(errors ? Object.values(errors).flat().join(' ') : 'Something went wrong. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (brand) => {
        if (!window.confirm(`Delete brand "${brand.name}"?`)) return;
        try {
            await adminApi.delete(`/brands/${brand.id}`);
            load();
        } catch (err) {
            if (err.response?.status === 409) {
                setBlockingInfo({ brand, products: err.response.data?.blocking_products || [] });
            } else {
                alert('Failed to delete brand.');
            }
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Brands</h1>
                <button
                    onClick={openCreate}
                    type="button"
                    className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800"
                >
                    <Plus size={16} /> New Brand
                </button>
            </div>

            {error && <p className="text-red-600 mb-4 text-sm">{error}</p>}

            <div className="bg-white rounded-xl border overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-500 text-left">
                        <tr>
                            <th className="px-4 py-3">Logo</th>
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
                        ) : brands.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-4 py-6 text-center text-gray-400">
                                    No brands yet.
                                </td>
                            </tr>
                        ) : (
                            brands.map((brand) => (
                                <tr key={brand.id}>
                                    <td className="px-4 py-3">
                                        {brand.logo ? (
                                            <img src={brand.logo} alt={brand.name} className="w-10 h-10 rounded object-cover" />
                                        ) : (
                                            <div className="w-10 h-10 rounded bg-gray-100" />
                                        )}
                                    </td>
                                    <td className="px-4 py-3 font-medium">{brand.name}</td>
                                    <td className="px-4 py-3">
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                brand.status ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                                            }`}
                                        >
                                            {brand.status ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        {brand.featured ? (
                                            <Star size={16} className="text-amber-500 fill-amber-500" />
                                        ) : (
                                            <Star size={16} className="text-gray-300" />
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-right space-x-3">
                                        <button onClick={() => openEdit(brand)} type="button" className="text-gray-500 hover:text-gray-900">
                                            <Pencil size={16} />
                                        </button>
                                        <button onClick={() => handleDelete(brand)} type="button" className="text-red-500 hover:text-red-700">
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Brand' : 'New Brand'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {formError && <p className="text-red-600 text-sm">{formError}</p>}

                    <div>
                        <label className="block text-sm font-medium mb-1">Name</label>
                        <input
                            required
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
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
                        <label className="block text-sm font-medium mb-1">Logo</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                                const file = e.target.files?.[0] || null;
                                setForm({ ...form, logo: file });
                                if (file) setLogoPreview(URL.createObjectURL(file));
                            }}
                            className="w-full text-sm"
                        />
                        {logoPreview && <img src={logoPreview} alt="preview" className="mt-2 w-16 h-16 rounded object-cover" />}
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

            <Modal open={!!blockingInfo} onClose={() => setBlockingInfo(null)} title="Cannot delete brand">
                <p className="text-sm text-gray-600 mb-3">
                    "{blockingInfo?.brand?.name}" still has products attached. Reassign or delete those products first (Products page):
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
