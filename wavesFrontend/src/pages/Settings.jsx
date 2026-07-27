import React, { useState } from 'react';
import { FiGlobe, FiCheckCircle } from 'react-icons/fi';
import { useLanguage } from '../context/LanguageContext';

const Settings = () => {
    const { language, setLanguage, t, languages } = useLanguage();
    const [selected, setSelected] = useState(language);
    const [saved, setSaved] = useState(false);

    const handleSave = (e) => {
        e.preventDefault();
        setLanguage(selected);
        setSaved(true);
        setTimeout(() => setSaved(false), 4000);
    };

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans">
            <h1 className="text-3xl sm:text-4xl font-extrabold uppercase tracking-tight mb-8">{t('settings.title')}</h1>

            <div className="border-4 border-[#A4C2DC] rounded-3xl p-6 sm:p-8 bg-white">
                <div className="flex items-center gap-3 mb-2">
                    <FiGlobe className="text-xl text-[#81A6C6]" />
                    <h2 className="text-xl font-extrabold text-black">{t('settings.language')}</h2>
                </div>
                <p className="text-sm text-gray-500 mb-6">{t('settings.languageDesc')}</p>

                {saved && (
                    <div className="mb-6 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-emerald-700 text-sm font-semibold">
                        <FiCheckCircle className="w-4 h-4 shrink-0" />
                        <span>{t('settings.saved')}</span>
                    </div>
                )}

                <form onSubmit={handleSave} className="space-y-3 max-w-md">
                    {languages.map(({ code, label }) => (
                        <label
                            key={code}
                            className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-all ${
                                selected === code ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-400'
                            }`}
                        >
                            <input
                                type="radio"
                                name="language"
                                value={code}
                                checked={selected === code}
                                onChange={() => setSelected(code)}
                                className="accent-black"
                            />
                            <span className="text-sm font-bold">{label}</span>
                        </label>
                    ))}

                    <button
                        type="submit"
                        className="bg-black text-white px-8 py-3 rounded-full font-medium text-sm hover:bg-gray-800 transition mt-4"
                    >
                        {t('settings.save')}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Settings;
