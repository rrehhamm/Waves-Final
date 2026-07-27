import React, { useEffect, useState } from 'react';
import adminApi from '../api/adminApi';

// The big top section on the storefront home page (background + badge + heading + paragraph +
// two CTA buttons). Singleton - there is always exactly one row, edited in place (no list,
// no create/delete). This is deliberately separate from the "Banners" page (the smaller promo
// slider next to it, which IS a list - see BannersAdmin.jsx).
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
            .catch(() => setError('Failed to load hero section.'))
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
            setMessage('Hero section updated successfully.');
            const hero = res.data?.data;
            if (hero?.background_image) setPreview(hero.background_image);
        } catch (err) {
            const errors = err.response?.data?.errors;
            setError(errors ? Object.values(errors).flat().join(' ') : 'Something went wrong. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <p className="text-gray-400">Loading...</p>;
    }

    return (
        <div>
            <h1 className="text-2xl font-bold mb-2">Hero Section</h1>
            <p className="text-sm text-gray-500 mb-6">
                The large top section on the home page - background image, badge, heading, paragraph, and the two
                buttons. This is separate from the small promo slider (Banners page).
            </p>

            {error && <p className="text-red-600 mb-4 text-sm">{error}</p>}
            {message && <p className="text-emerald-600 mb-4 text-sm">{message}</p>}

            <form onSubmit={handleSubmit} className="bg-white rounded-xl border p-6 space-y-5 max-w-2xl">
                <div>
                    <label className="block text-sm font-medium mb-1">Badge text</label>
                    <input
                        value={form.badge_text}
                        onChange={(e) => setForm({ ...form, badge_text: e.target.value })}
                        className="w-full border rounded-lg px-3 py-2 text-sm"
                        placeholder="e.g. New Collection 2026"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Heading</label>
                    <input
                        required
                        value={form.heading}
                        onChange={(e) => setForm({ ...form, heading: e.target.value })}
                        className="w-full border rounded-lg px-3 py-2 text-sm"
                        placeholder="e.g. Find What Matches Your Style"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Paragraph</label>
                    <textarea
                        value={form.subtext}
                        onChange={(e) => setForm({ ...form, subtext: e.target.value })}
                        className="w-full border rounded-lg px-3 py-2 text-sm"
                        rows={3}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Button 1 text</label>
                        <input
                            value={form.button1_text}
                            onChange={(e) => setForm({ ...form, button1_text: e.target.value })}
                            className="w-full border rounded-lg px-3 py-2 text-sm"
                            placeholder="e.g. Shop Collection"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Button 1 link</label>
                        <input
                            value={form.button1_link}
                            onChange={(e) => setForm({ ...form, button1_link: e.target.value })}
                            className="w-full border rounded-lg px-3 py-2 text-sm"
                            placeholder="e.g. /products"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Button 2 text</label>
                        <input
                            value={form.button2_text}
                            onChange={(e) => setForm({ ...form, button2_text: e.target.value })}
                            className="w-full border rounded-lg px-3 py-2 text-sm"
                            placeholder="e.g. Explore Categories"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Button 2 link</label>
                        <input
                            value={form.button2_link}
                            onChange={(e) => setForm({ ...form, button2_link: e.target.value })}
                            className="w-full border rounded-lg px-3 py-2 text-sm"
                            placeholder="e.g. /categories"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Background image (leave empty to keep current)</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            setForm({ ...form, background_image: file });
                            if (file) setPreview(URL.createObjectURL(file));
                        }}
                        className="w-full text-sm"
                    />
                    {preview && <img src={preview} alt="preview" className="mt-3 w-full max-w-md h-40 rounded-lg object-cover" />}
                </div>

                <div className="flex justify-end pt-2">
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-6 py-2.5 rounded-lg text-sm font-medium bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50"
                    >
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
}
