import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import FilterSection from '../components/FilterSection';
import Pagination from '../components/Pagination';
import LoadingComponent from '../components/LoadingComponent';
import EmptyStateComponent from '../components/EmptyStateComponent';

import { fetchFilteredProducts, fetchFilterOptions } from '../api/endpoints/products';
import { useLanguage } from '../context/LanguageContext';

const sortMap = { latest: 'latest', 'price-low': 'price_low', 'price-high': 'price_high' };

const Brands = () => {
    const { t } = useLanguage();
    const [searchParams, setSearchParams] = useSearchParams();
    const initialBrandParam = searchParams.get('brand') || '';

    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [productsLoading, setProductsLoading] = useState(false);
    const [error, setError] = useState('');

    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedBrand, setSelectedBrand] = useState(initialBrandParam);
    const [maxPrice, setMaxPrice] = useState(1000);
    const [sortBy, setSortBy] = useState('latest');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalResults, setTotalResults] = useState(0);

    useEffect(() => {
        const brandFromUrl = searchParams.get('brand') || '';
        setSelectedBrand(brandFromUrl);
    }, [searchParams]);

    const handleBrandChange = (brandId) => {
        setSelectedBrand(brandId);
        setCurrentPage(1);

        const newParams = new URLSearchParams(searchParams);
        if (brandId) {
            newParams.set('brand', brandId);
        } else {
            newParams.delete('brand');
        }
        setSearchParams(newParams);
    };

    useEffect(() => {
        const loadFilterOptions = async () => {
            try {
                const optionsData = await fetchFilterOptions();
                setCategories(optionsData.categories || []);
                setBrands(optionsData.brands || []);
            } catch (error) {
                console.error('Failed to load brands page filters:', error);
            } finally {
                setLoading(false);
            }
        };

        loadFilterOptions();
    }, []);

    useEffect(() => {
        const loadProducts = async () => {
            setProductsLoading(true);
            setError('');
            try {
                const response = await fetchFilteredProducts({
                    category: selectedCategory,
                    brand: selectedBrand,
                    max_price: maxPrice,
                    sort: sortMap[sortBy] || 'latest',
                    page: currentPage,
                });

                const data = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : [];
                setProducts(data);
                setTotalPages(response?.meta?.last_page || 1);
                setTotalResults(response?.meta?.total ?? data.length);
            } catch (err) {
                console.error('Failed to load brand products:', err);
                setError(t('common.loadError'));
                setProducts([]);
                setTotalPages(1);
                setTotalResults(0);
            } finally {
                setProductsLoading(false);
            }
        };

        loadProducts();
    }, [selectedCategory, selectedBrand, maxPrice, sortBy, currentPage]);

    if (loading) return <LoadingComponent />;

    return (
        <div className="w-full min-h-screen bg-white font-sans text-gray-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10 pb-6 border-b border-gray-100">
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-extrabold uppercase text-black tracking-tight">
                            {t('brandsPage.title')}
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">{t('brandsPage.subtitle')}</p>
                    </div>
                </div>

                {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

                <div className="flex flex-col lg:flex-row gap-8">
                    <aside className="w-full lg:w-64 shrink-0">
                        <div className="bg-gray-50/70 p-5 rounded-3xl border border-gray-100 sticky top-24 backdrop-blur-md">
                            <FilterSection
                                categories={categories}
                                brands={brands}
                                selectedCategory={selectedCategory}
                                setSelectedCategory={(val) => { setSelectedCategory(val); setCurrentPage(1); }}
                                selectedBrand={selectedBrand}
                                setSelectedBrand={handleBrandChange}
                                maxPrice={maxPrice}
                                setMaxPrice={(val) => { setMaxPrice(val); setCurrentPage(1); }}
                            />
                        </div>
                    </aside>

                    <main className="flex-1">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 bg-gray-50/80 backdrop-blur-md p-4 rounded-2xl border border-gray-100 shadow-sm">
                            <span className="text-xs sm:text-sm text-gray-600 font-medium">
                                {t('common.showingOf', { shown: products.length, total: totalResults })}
                            </span>
                            <div className="flex items-center gap-3 text-xs sm:text-sm">
                                <span className="text-gray-500 font-semibold">{t('common.sortBy')}</span>
                                <select
                                    value={sortBy}
                                    onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
                                    className="bg-white border border-gray-200 rounded-xl px-3 py-1.5 font-semibold text-black focus:outline-none focus:ring-2 focus:ring-[#81A6C6] transition-all cursor-pointer shadow-sm"
                                >
                                    <option value="latest">{t('common.sortLatest')}</option>
                                    <option value="price-low">{t('productsPage.sortPriceLow')}</option>
                                    <option value="price-high">{t('productsPage.sortPriceHigh')}</option>
                                </select>
                            </div>
                        </div>

                        {productsLoading ? (
                            <LoadingComponent />
                        ) : products.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {products.map((product) => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        ) : (
                            <EmptyStateComponent message={t('brandsPage.noResults')} />
                        )}

                        {totalPages > 1 && (
                            <div className="mt-10">
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={(page) => setCurrentPage(page)}
                                />
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
};

export default Brands;