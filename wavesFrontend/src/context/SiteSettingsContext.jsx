import React, { createContext, useContext, useEffect, useState } from 'react';
import API from '../api/axios';

const SiteSettingsContext = createContext();

export const useSiteSettings = () => useContext(SiteSettingsContext);

const DEFAULT_SETTINGS = {
    contact_phone: '+962 79 000 0000',
    contact_email: 'reham@waves-test.com',
    contact_address: 'Amman, Jordan',
    delivery_fee: 15,
};

export const SiteSettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState(DEFAULT_SETTINGS);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        API.get('/settings')
            .then((res) => {
                const data = res.data?.data || res.data;
                if (data) setSettings({ ...DEFAULT_SETTINGS, ...data });
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    return (
        <SiteSettingsContext.Provider
            value={{
                contactPhone: settings.contact_phone,
                contactEmail: settings.contact_email,
                contactAddress: settings.contact_address,
                deliveryFee: Number(settings.delivery_fee),
                loading,
            }}
        >
            {children}
        </SiteSettingsContext.Provider>
    );
};
