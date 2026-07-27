import React, { useEffect, useState } from 'react';
import adminApi from '../api/adminApi';
import fetchAll from '../utils/fetchAll';
import Modal from '../components/Modal';
import { Pencil, Trash2, Plus, Star, RotateCcw, XCircle, ArrowRightLeft, ChevronLeft, ChevronRight } from 'lucide-react';

const emptyForm = {
    name_ar: '',
    name_en: '',
    description_ar: '',
    description_en: '',
    price: '',
    discount_percent: '',
    quantity: '',
    category_id: '',
    brand_id: '',
    status: true,
    featured: false,
    main_image: null,
    additional_images: [],
};

export default function ProductsAdmin() {
    const [tab, setTab] = useState('active'); // 'active' | 'trashed'
    const [products, setProducts] = useState([]);
    const [meta, setMeta] = useState(null);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);

    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [mainPreview, setMainPreview] = useState(null);
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState('');

    const [reassignTarget, setReassignTarget] = useState(null);
    const [reassignForm, setReassignForm] = useState({ category_id: '', brand_id: '' });

    // Category/brand dropdowns need the FULL list, not just page 1
    useEffect(() => {
        fetchAll('/categories').then(setCategories).catch(() => {});
        fetchAll('/brands').then(setBrands).catch(() => {});
    }, []);

    const load = () => {
        setLoading(true);
        setError('');
        const path = tab === 'trashed' ? '/products/trashed' : '/products';
        const params = tab === 'trashed' ? { page } : { page, search: search || undefined };

        adminApi
            .get(path, { params })
            .then((res) => {
                setProducts(res.data?.data || []);
                setMeta(res.data?.meta || null);
            })
            .catch(() => setError('Failed to load products.'))
            .finally(() => setLoading(false));
    };

    useEffect(load, [tab, page]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setPage(1);
        load();
    };

    const openCreate = () => {
        setEditing(null);
        setForm(emptyForm);
        setMainPreview(null);
        setFormError('');
        setModalOpen(true);
    };

    const openEdit = (product) => {
        setEditing(product);
        setForm({
            // Same caveat as Categories: the list API returns one translated "name"/"description",
            // not separate ar/en fields, so both language inputs start out identical.
            name_ar: product.name || '',
            name_en: product.name || '',
            description_ar: product.description || '',
            description_en: product.description || '',
            price: product.price ?? '',
            discount_percent: product.discount_percent ?? '',
            quantity: product.quantity ?? '',
            category_id: product.category?.id || '',
            brand_id: product.brand?.id || '',
            status: product.status,
            featured: product.featured,
            main_image: null,
            additional_images: [],
        });
        setMainPreview(product.main_image || null);
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
            fd.append('description_ar', form.description_ar || '');
            fd.append('description_en', form.description_en || '');
            fd.append('price', form.price);
            if (form.discount_percent !== '' && form.discount_percent !== null) {
                fd.append('discount_percent', form.discount_percent);
            }
            fd.append('quantity', form.quantity);
            fd.append('category_id', form.category_id);
            fd.append('brand_id', form.brand_id);
            fd.append('status', form.status ? '1' : '0');
            fd.append('featured', form.featured ? '1' : '0');
            if (form.main_image) fd.append('main_image', form.main_image);
            form.additional_images.forEach((file) => fd.append('additional_images[]', file));

            if (editing) {
                fd.append('_method', 'PUT');
                await adminApi.post(`/products/${editing.id}`, fd);
            } else {
                await adminApi.post('/products', fd);
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

    const handleDelete = async (product) => {
        if (!window.confirm(`Delete product "${product.name}"? (This is a soft delete - it can be restored later.)`)) return;
        try {
            await adminApi.delete(`/products/${product.id}`);
            load();
        } catch {
            alert('Failed to delete product.');
        }
    };

    const handleRestore = async (product) => {
        try {
            await adminApi.post(`/products/${product.id}/restore`);
            load();
        } catch {
            alert('Failed to restore product.');
        }
    };

    const handleForceDelete = async (product) => {
        if (!window.confirm(`Permanently delete "${product.name}"? This cannot be undone.`)) return;
        try {
            await adminApi.delete(`/products/${product.id}/force`);
            load();
        } catch {
            alert('Failed to permanently delete product.');
        }
    };

    const openReassign = (product) => {
        setReassignTarget(product);
        setReassignForm({ category_id: product.category?.id || '', brand_id: product.brand?.id || '' });
    };

    const handleReassignSubmit = async (e) => {
        e.preventDefault();
        try {
            await adminApi.patch(`/products/${reassignTarget.id}/reassign`, reassignForm);
            setReassignTarget(null);
            load();
        } catch {
            alert('Failed to reassign product.');
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Products</h1>
                <button
                    onClick={openCreate}
                    type="button"
                    className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800"
                >
                    <Plus size={16} /> New Product
                </button>
            </div>

            <div className="flex items-center gap-2 mb-4">
                <button
                    onClick={() => {
                        setTab('active');
                        setPage(1);
                    }}
                    type="button"
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === 'active' ? 'bg-gray-900 text-white' : 'bg-white border text-gray-600'}`}
                >
                    Active
                </button>
                <button
                    onClick={() => {
                        setTab('trashed');
                        setPage(1);
                    }}
                    type="button"
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === 'trashed' ? 'bg-gray-900 text-white' : 'bg-white border text-gray-600'}`}
                >
                    Trashed
                </button>

                {tab === 'active' && (
                    <form onSubmit={handleSearchSubmit} className="ml-auto flex gap-2">
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search products..."
                            className="border rounded-lg px-3 py-2 text-sm w-56"
                        />
                        <button type="submit" className="px-3 py-2 rounded-lg text-sm bg-gray-100 hover:bg-gray-200">
                            Search
                        </button>
                    </form>
                )}
            </div>

            {error && <p className="text-red-600 mb-4 text-sm">{error}</p>}

            <div className="bg-white rounded-xl border overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-500 text-left">
                        <tr>
                            <th className="px-4 py-3">Image</th>
                            <th className="px-4 py-3">Name</th>
                            <th className="px-4 py-3">Category / Brand</th>
                            <th className="px-4 py-3">Price</th>
                            <th className="px-4 py-3">Qty</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3">Featured</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {loading ? (
                            <tr>
                                <td colSpan={8} className="px-4 py-6 text-center text-gray-400">
                                    Loading...
                                </td>
                            </tr>
                        ) : products.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="px-4 py-6 text-center text-gray-400">
                                    No products found.
                                </td>
                            </tr>
                        ) : (
                            products.map((p) => (
                                <tr key={p.id}>
                                    <td className="px-4 py-3">
                                        {p.main_image ? (
                                            <img src={p.main_image} alt={p.name} className="w-10 h-10 rounded object-cover" />
                                        ) : (
                                            <div className="w-10 h-10 rounded bg-gray-100" />
                                        )}
                                    </td>
                                    <td className="px-4 py-3 font-medium">{p.name}</td>
                                    <td className="px-4 py-3 text-gray-500">
                                        {p.category?.name || '—'} / {p.brand?.name || '—'}
                                    </td>
                                    <td className="px-4 py-3">
                                        {p.discount_percent ? (
                                            <span>
                                                <span className="line-through text-gray-400 mr-1">${p.price}</span>
                                                <span className="text-green-600 font-medium">${p.final_price}</span>
                                            </span>
                                        ) : (
                                            <span>${p.price}</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">{p.quantity}</td>
                                    <td className="px-4 py-3">
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                p.status ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                                            }`}
                                        >
                                            {p.status ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        {p.featured ? (
                                            <Star size={16} className="text-amber-500 fill-amber-500" />
                                        ) : (
                                            <Star size={16} className="text-gray-300" />
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-right space-x-3 whitespace-nowrap">
                                        {tab === 'active' ? (
                                            <>
                                                <button onClick={() => openEdit(p)} type="button" className="text-gray-500 hover:text-gray-900" title="Edit">
                                                    <Pencil size={16} />
                                                </button>
                                                <button onClick={() => handleDelete(p)} type="button" className="text-red-500 hover:text-red-700" title="Delete">
                                                    <Trash2 size={16} />
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => openReassign(p)}
                                                    type="button"
                                                    className="text-blue-500 hover:text-blue-700"
                                                    title="Reassign category/brand"
                                                >
                                                    <ArrowRightLeft size={16} />
                                                </button>
                                                <button onClick={() => handleRestore(p)} type="button" className="text-green-600 hover:text-green-800" title="Restore">
                                                    <RotateCcw size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleForceDelete(p)}
                                                    type="button"
                                                    className="text-red-500 hover:text-red-700"
                                                    title="Permanently delete"
                                                >
                                                    <XCircle size={16} />
                                                </button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {meta && meta.last_page > 1 && (
                <div className="flex items-center justify-center gap-4 mt-4 text-sm">
                    <button
                        disabled={page <= 1}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        type="button"
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg border disabled:opacity-40"
                    >
                        <ChevronLeft size={14} /> Prev
                    </button>
                    <span className="text-gray-500">
                        Page {meta.current_page} of {meta.last_page}
                    </span>
                    <button
                        disabled={page >= meta.last_page}
                        onClick={() => setPage((p) => p + 1)}
                        type="button"
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg border disabled:opacity-40"
                    >
                        Next <ChevronRight size={14} />
                    </button>
                </div>
            )}

            <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Product' : 'New Product'} wide>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {formError && <p className="text-red-600 text-sm">{formError}</p>}

                    <div className="grid grid-cols-2 gap-4">
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
                            <label className="block text-sm font-medium mb-1">Description (Arabic)</label>
                            <textarea
                                value={form.description_ar}
                                onChange={(e) => setForm({ ...form, description_ar: e.target.value })}
                                className="w-full border rounded-lg px-3 py-2 text-sm"
                                rows={2}
                                dir="rtl"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Description (English)</label>
                            <textarea
                                value={form.description_en}
                                onChange={(e) => setForm({ ...form, description_en: e.target.value })}
                                className="w-full border rounded-lg px-3 py-2 text-sm"
                                rows={2}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Price ($)</label>
                            <input
                                required
                                type="number"
                                step="0.01"
                                min="0"
                                value={form.price}
                                onChange={(e) => setForm({ ...form, price: e.target.value })}
                                className="w-full border rounded-lg px-3 py-2 text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Discount %</label>
                            <input
                                type="number"
                                min="0"
                                max="100"
                                value={form.discount_percent}
                                onChange={(e) => setForm({ ...form, discount_percent: e.target.value })}
                                className="w-full border rounded-lg px-3 py-2 text-sm"
                                placeholder="0"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Quantity</label>
                            <input
                                required
                                type="number"
                                min="0"
                                value={form.quantity}
                                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                                className="w-full border rounded-lg px-3 py-2 text-sm"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Category</label>
                            <select
                                required
                                value={form.category_id}
                                onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                                className="w-full border rounded-lg px-3 py-2 text-sm"
                            >
                                <option value="">Select category</option>
                                {categories.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Brand</label>
                            <select
                                required
                                value={form.brand_id}
                                onChange={(e) => setForm({ ...form, brand_id: e.target.value })}
                                className="w-full border rounded-lg px-3 py-2 text-sm"
                            >
                                <option value="">Select brand</option>
                                {brands.map((b) => (
                                    <option key={b.id} value={b.id}>
                                        {b.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Main Image {editing ? '(leave empty to keep current)' : ''}
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                                const file = e.target.files?.[0] || null;
                                setForm({ ...form, main_image: file });
                                if (file) setMainPreview(URL.createObjectURL(file));
                            }}
                            className="w-full text-sm"
                        />
                        {mainPreview && <img src={mainPreview} alt="preview" className="mt-2 w-16 h-16 rounded object-cover" />}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Additional Images {editing ? '(uploading replaces all existing ones)' : ''}
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={(e) => setForm({ ...form, additional_images: Array.from(e.target.files || []) })}
                            className="w-full text-sm"
                        />
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
                            Featured
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

            <Modal open={!!reassignTarget} onClose={() => setReassignTarget(null)} title={`Reassign "${reassignTarget?.name}"`}>
                <form onSubmit={handleReassignSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Category</label>
                        <select
                            value={reassignForm.category_id}
                            onChange={(e) => setReassignForm({ ...reassignForm, category_id: e.target.value })}
                            className="w-full border rounded-lg px-3 py-2 text-sm"
                        >
                            <option value="">Keep current</option>
                            {categories.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Brand</label>
                        <select
                            value={reassignForm.brand_id}
                            onChange={(e) => setReassignForm({ ...reassignForm, brand_id: e.target.value })}
                            className="w-full border rounded-lg px-3 py-2 text-sm"
                        >
                            <option value="">Keep current</option>
                            {brands.map((b) => (
                                <option key={b.id} value={b.id}>
                                    {b.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => setReassignTarget(null)}
                            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100"
                        >
                            Cancel
                        </button>
                        <button type="submit" className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-900 text-white hover:bg-gray-800">
                            Save
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
