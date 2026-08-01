import React, { useEffect, useState } from 'react';
import adminApi from '../api/adminApi';
import fetchAll from '../utils/fetchAll';
import Modal from '../components/Modal';
import { Pencil, Trash2, Plus, Star, RotateCcw, XCircle, ArrowRightLeft, Package, ImageOff } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { formatCurrency } from '../../utils/currency';
import {
    Card,
    PageHeader,
    Button,
    IconButton,
    Badge,
    Tabs,
    SearchBox,
    Input,
    Textarea,
    Select,
    Toggle,
    EmptyState,
    TableSkeletonRow,
    Pagination,
    FormError,
} from '../components/ui';

const emptyForm = {
    name_ar: '',
    name_en: '',
    description_ar: '',
    description_en: '',
    price: '',
    discount_percent: '',
    quantity: '',
    sizes: [],
    colors: [],
    category_id: '',
    brand_id: '',
    status: true,
    featured: false,
    main_image: null,
    additional_images: [],
};

export default function ProductsAdmin() {
    const { t } = useLanguage();
    const [tab, setTab] = useState('active');
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
    const [sizeInput, setSizeInput] = useState('');
    const [colorNameInput, setColorNameInput] = useState('');
    const [colorHexInput, setColorHexInput] = useState('#000000');

    const [reassignTarget, setReassignTarget] = useState(null);
    const [reassignForm, setReassignForm] = useState({ category_id: '', brand_id: '' });

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
            .catch(() => setError(t('admin.products.failedLoad')))
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
        setSizeInput('');
        setColorNameInput('');
        setColorHexInput('#000000');
        setModalOpen(true);
    };

    const openEdit = (product) => {
        setEditing(product);
        setForm({
            name_ar: product.name || '',
            name_en: product.name || '',
            description_ar: product.description || '',
            description_en: product.description || '',
            price: product.price ?? '',
            discount_percent: product.discount_percent ?? '',
            quantity: product.quantity ?? '',
            sizes: Array.isArray(product.sizes) ? product.sizes : [],
            colors: Array.isArray(product.colors) ? product.colors : [],
            category_id: product.category?.id || '',
            brand_id: product.brand?.id || '',
            status: product.status,
            featured: product.featured,
            main_image: null,
            additional_images: [],
        });
        setMainPreview(product.main_image || null);
        setFormError('');
        setSizeInput('');
        setColorNameInput('');
        setColorHexInput('#000000');
        setModalOpen(true);
    };

    const addSize = () => {
        const value = sizeInput.trim();
        if (!value) return;
        if (!form.sizes.includes(value)) {
            setForm({ ...form, sizes: [...form.sizes, value] });
        }
        setSizeInput('');
    };

    const removeSize = (size) => {
        setForm({ ...form, sizes: form.sizes.filter((s) => s !== size) });
    };

    const addColor = () => {
        const name = colorNameInput.trim();
        if (!name) return;
        if (!form.colors.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
            setForm({ ...form, colors: [...form.colors, { name, hex: colorHexInput }] });
        }
        setColorNameInput('');
    };

    const removeColor = (name) => {
        setForm({ ...form, colors: form.colors.filter((c) => c.name !== name) });
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
            fd.append('sizes_submitted', '1');
            form.sizes.forEach((size) => fd.append('sizes[]', size));
            fd.append('colors_submitted', '1');
            form.colors.forEach((color, idx) => {
                fd.append(`colors[${idx}][name]`, color.name);
                fd.append(`colors[${idx}][hex]`, color.hex);
            });
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
            setFormError(errors ? Object.values(errors).flat().join(' ') : t('admin.common.somethingWrong'));
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (product) => {
        if (!window.confirm(`${t('admin.products.deleteConfirm')} "${product.name}"? ${t('admin.products.deleteSoftHint')}`)) return;
        try {
            await adminApi.delete(`/products/${product.id}`);
            load();
        } catch {
            alert(t('admin.products.failedDelete'));
        }
    };

    const handleRestore = async (product) => {
        try {
            await adminApi.post(`/products/${product.id}/restore`);
            load();
        } catch {
            alert(t('admin.products.failedRestore'));
        }
    };

    const handleForceDelete = async (product) => {
        if (!window.confirm(`${t('admin.products.permanentDeleteConfirm')} "${product.name}"? ${t('admin.products.permanentDeleteWarning')}`)) return;
        try {
            await adminApi.delete(`/products/${product.id}/force`);
            load();
        } catch {
            alert(t('admin.products.failedPermanentDelete'));
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
            alert(t('admin.products.failedReassign'));
        }
    };

    return (
        <div>
            <PageHeader
                title={t('admin.products.title')}
                subtitle={t('admin.products.subtitle')}
                actions={
                    <Button onClick={openCreate} icon={Plus}>
                        {t('admin.products.newProduct')}
                    </Button>
                }
            />

            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
                <Tabs
                    value={tab}
                    onChange={(v) => {
                        setTab(v);
                        setPage(1);
                    }}
                    options={[
                        { value: 'active', label: t('admin.products.tabActive') },
                        { value: 'trashed', label: t('admin.products.tabTrashed') },
                    ]}
                />

                {tab === 'active' && (
                    <form onSubmit={handleSearchSubmit} className="sm:ml-auto flex gap-2">
                        <SearchBox value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('admin.products.searchPlaceholder')} className="w-64" />
                        <Button type="submit" variant="secondary">
                            {t('admin.products.search')}
                        </Button>
                    </form>
                )}
            </div>

            {error && <div className="mb-4"><FormError message={error} /></div>}

            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="text-left border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-3.5 font-semibold text-xs uppercase tracking-wide text-slate-400">{t('admin.products.image')}</th>
                                <th className="px-6 py-3.5 font-semibold text-xs uppercase tracking-wide text-slate-400">{t('admin.products.name')}</th>
                                <th className="px-6 py-3.5 font-semibold text-xs uppercase tracking-wide text-slate-400">{t('admin.products.categoryBrand')}</th>
                                <th className="px-6 py-3.5 font-semibold text-xs uppercase tracking-wide text-slate-400">{t('admin.products.price')}</th>
                                <th className="px-6 py-3.5 font-semibold text-xs uppercase tracking-wide text-slate-400">{t('admin.products.qty')}</th>
                                <th className="px-6 py-3.5 font-semibold text-xs uppercase tracking-wide text-slate-400">{t('admin.common.status')}</th>
                                <th className="px-6 py-3.5 font-semibold text-xs uppercase tracking-wide text-slate-400">{t('admin.products.featured')}</th>
                                <th className="px-6 py-3.5 font-semibold text-xs uppercase tracking-wide text-slate-400 text-right">{t('admin.common.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <TableSkeletonRow cols={8} />
                            ) : products.length === 0 ? (
                                <tr>
                                    <td colSpan={8}>
                                        <EmptyState
                                            icon={Package}
                                            title={tab === 'trashed' ? t('admin.products.trashEmpty') : t('admin.products.noProducts')}
                                            subtitle={tab === 'trashed' ? t('admin.products.trashHint') : t('admin.products.createFirst')}
                                        />
                                    </td>
                                </tr>
                            ) : (
                                products.map((p) => (
                                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                                        <td className="px-6 py-3">
                                            {p.main_image ? (
                                                <img src={p.main_image} alt={p.name} className="w-10 h-10 rounded-lg object-cover" />
                                            ) : (
                                                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-300">
                                                    <ImageOff size={15} />
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-3 font-semibold text-slate-800">{p.name}</td>
                                        <td className="px-6 py-3 text-slate-500">
                                            {p.category?.name || '—'} / {p.brand?.name || '—'}
                                        </td>
                                        <td className="px-6 py-3">
                                            {p.discount_percent ? (
                                                <span>
                                                    <span className="line-through text-slate-400 mr-1">{formatCurrency(p.price)}</span>
                                                    <span className="text-emerald-600 font-semibold">{formatCurrency(p.final_price)}</span>
                                                </span>
                                            ) : (
                                                <span className="font-medium text-slate-700">{formatCurrency(p.price)}</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-3 text-slate-600">{p.quantity}</td>
                                        <td className="px-6 py-3">
                                            <Badge tone={p.status ? 'emerald' : 'slate'}>{p.status ? t('admin.common.active') : t('admin.common.inactive')}</Badge>
                                        </td>
                                        <td className="px-6 py-3">
                                            {p.featured ? (
                                                <Star size={16} className="text-amber-500 fill-amber-500" />
                                            ) : (
                                                <Star size={16} className="text-slate-200" />
                                            )}
                                        </td>
                                        <td className="px-6 py-3 text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                {tab === 'active' ? (
                                                    <>
                                                        <IconButton icon={Pencil} tone="primary" onClick={() => openEdit(p)} title={t('admin.common.edit')} />
                                                        <IconButton icon={Trash2} tone="danger" onClick={() => handleDelete(p)} title={t('admin.common.delete')} />
                                                    </>
                                                ) : (
                                                    <>
                                                        <IconButton icon={ArrowRightLeft} tone="primary" onClick={() => openReassign(p)} title={t('admin.products.reassign')} />
                                                        <IconButton icon={RotateCcw} tone="success" onClick={() => handleRestore(p)} title={t('admin.common.restore')} />
                                                        <IconButton icon={XCircle} tone="danger" onClick={() => handleForceDelete(p)} title={t('admin.common.permanentlyDelete')} />
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                <Pagination meta={meta} page={page} onPageChange={setPage} />
            </Card>

            <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? t('admin.products.editProduct') : t('admin.products.newProduct')} wide>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <FormError message={formError} />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input label={t('admin.products.nameAr')} required value={form.name_ar} onChange={(e) => setForm({ ...form, name_ar: e.target.value })} dir="rtl" />
                        <Input label={t('admin.products.nameEn')} required value={form.name_en} onChange={(e) => setForm({ ...form, name_en: e.target.value })} />
                        <Textarea
                            label={t('admin.products.descriptionAr')}
                            value={form.description_ar}
                            onChange={(e) => setForm({ ...form, description_ar: e.target.value })}
                            rows={2}
                            dir="rtl"
                        />
                        <Textarea
                            label={t('admin.products.descriptionEn')}
                            value={form.description_en}
                            onChange={(e) => setForm({ ...form, description_en: e.target.value })}
                            rows={2}
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Input
                            label={t('admin.products.priceLabel')}
                            required
                            type="number"
                            step="0.01"
                            min="0"
                            value={form.price}
                            onChange={(e) => setForm({ ...form, price: e.target.value })}
                        />
                        <Input
                            label={t('admin.products.discountPercent')}
                            type="number"
                            min="0"
                            max="100"
                            value={form.discount_percent}
                            onChange={(e) => setForm({ ...form, discount_percent: e.target.value })}
                            placeholder="0"
                        />
                        <Input
                            label={t('admin.products.quantity')}
                            required
                            type="number"
                            min="0"
                            value={form.quantity}
                            onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">{t('admin.products.availableSizes')}</label>
                        <div className="flex items-center gap-2 mb-2.5">
                            <input
                                type="number"
                                value={sizeInput}
                                onChange={(e) => setSizeInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        addSize();
                                    }
                                }}
                                placeholder={t('admin.products.sizePlaceholder')}
                                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#81A6C6]/30 focus:border-[#81A6C6] transition-colors"
                            />
                            <Button type="button" variant="secondary" onClick={addSize} className="whitespace-nowrap">
                                {t('admin.products.add')}
                            </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {form.sizes.map((size) => (
                                <span
                                    key={size}
                                    className="flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-lg text-sm font-semibold bg-slate-900 text-white"
                                >
                                    {size}
                                    <button
                                        type="button"
                                        onClick={() => removeSize(size)}
                                        className="text-white/60 hover:text-white leading-none w-4 h-4 flex items-center justify-center rounded-full hover:bg-white/10"
                                        aria-label={`${t('admin.products.removeSize')} ${size}`}
                                    >
                                        &times;
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">{t('admin.products.availableColors')}</label>
                        <div className="flex items-center gap-2 mb-2.5">
                            <input
                                type="color"
                                value={colorHexInput}
                                onChange={(e) => setColorHexInput(e.target.value)}
                                className="w-11 h-11 rounded-xl border border-slate-200 cursor-pointer shrink-0 p-1"
                            />
                            <input
                                type="text"
                                value={colorNameInput}
                                onChange={(e) => setColorNameInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        addColor();
                                    }
                                }}
                                placeholder={t('admin.products.colorPlaceholder')}
                                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#81A6C6]/30 focus:border-[#81A6C6] transition-colors"
                            />
                            <Button type="button" variant="secondary" onClick={addColor} className="whitespace-nowrap">
                                {t('admin.products.add')}
                            </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {form.colors.map((color) => (
                                <span
                                    key={color.name}
                                    className="flex items-center gap-1.5 pl-2.5 pr-2 py-1.5 rounded-lg text-sm font-semibold bg-slate-900 text-white"
                                >
                                    <span className="w-3.5 h-3.5 rounded-full border border-white/40 shrink-0" style={{ backgroundColor: color.hex }} />
                                    {color.name}
                                    <button
                                        type="button"
                                        onClick={() => removeColor(color.name)}
                                        className="text-white/60 hover:text-white leading-none w-4 h-4 flex items-center justify-center rounded-full hover:bg-white/10"
                                        aria-label={`${t('admin.products.removeColor')} ${color.name}`}
                                    >
                                        &times;
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Select label={t('admin.categories.title')} required value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}>
                            <option value="">{t('admin.products.selectCategory')}</option>
                            {categories.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </Select>
                        <Select label={t('admin.brands.title')} required value={form.brand_id} onChange={(e) => setForm({ ...form, brand_id: e.target.value })}>
                            <option value="">{t('admin.products.selectBrand')}</option>
                            {brands.map((b) => (
                                <option key={b.id} value={b.id}>
                                    {b.name}
                                </option>
                            ))}
                        </Select>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                            {t('admin.products.mainImage')} {editing ? t('admin.common.keepCurrentImage') : ''}
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                                const file = e.target.files?.[0] || null;
                                setForm({ ...form, main_image: file });
                                if (file) setMainPreview(URL.createObjectURL(file));
                            }}
                            className="w-full text-sm text-slate-500 file:mr-3 file:py-2 file:px-3.5 file:rounded-lg file:border-0 file:bg-slate-100 file:text-slate-700 file:text-xs file:font-semibold hover:file:bg-slate-200 file:cursor-pointer cursor-pointer"
                        />
                        {mainPreview && <img src={mainPreview} alt="preview" className="mt-2.5 w-16 h-16 rounded-lg object-cover border border-slate-200" />}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                            {t('admin.products.additionalImages')} {editing ? t('admin.products.additionalImagesReplace') : ''}
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={(e) => setForm({ ...form, additional_images: Array.from(e.target.files || []) })}
                            className="w-full text-sm text-slate-500 file:mr-3 file:py-2 file:px-3.5 file:rounded-lg file:border-0 file:bg-slate-100 file:text-slate-700 file:text-xs file:font-semibold hover:file:bg-slate-200 file:cursor-pointer cursor-pointer"
                        />
                    </div>

                    <div className="flex items-center gap-6">
                        <Toggle label={t('admin.products.activeToggle')} checked={form.status} onChange={(v) => setForm({ ...form, status: v })} />
                        <Toggle label={t('admin.products.featuredToggle')} checked={form.featured} onChange={(v) => setForm({ ...form, featured: v })} />
                    </div>

                    <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                        <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
                            {t('admin.common.cancel')}
                        </Button>
                        <Button type="submit" disabled={saving}>
                            {saving ? t('admin.common.saving') : t('admin.products.saveProduct')}
                        </Button>
                    </div>
                </form>
            </Modal>

            <Modal open={!!reassignTarget} onClose={() => setReassignTarget(null)} title={`${t('admin.products.reassignTitle')} "${reassignTarget?.name}"`}>
                <form onSubmit={handleReassignSubmit} className="space-y-4">
                    <Select
                        label={t('admin.categories.title')}
                        value={reassignForm.category_id}
                        onChange={(e) => setReassignForm({ ...reassignForm, category_id: e.target.value })}
                    >
                        <option value="">{t('admin.products.keepCurrent')}</option>
                        {categories.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.name}
                            </option>
                        ))}
                    </Select>
                    <Select
                        label={t('admin.brands.title')}
                        value={reassignForm.brand_id}
                        onChange={(e) => setReassignForm({ ...reassignForm, brand_id: e.target.value })}
                    >
                        <option value="">{t('admin.products.keepCurrent')}</option>
                        {brands.map((b) => (
                            <option key={b.id} value={b.id}>
                                {b.name}
                            </option>
                        ))}
                    </Select>
                    <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                        <Button type="button" variant="secondary" onClick={() => setReassignTarget(null)}>
                            {t('admin.common.cancel')}
                        </Button>
                        <Button type="submit">{t('admin.common.save')}</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
