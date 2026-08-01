import React, { useState, useEffect } from 'react';
import FilterSection from '../components/FilterSection';
import ProductCard from '../components/ProductCard';
import Pagination from '../components/Pagination';
import LoadingComponent from '../components/LoadingComponent';
import EmptyStateComponent from '../components/EmptyStateComponent';
import { fetchFilteredProducts, fetchFilterOptions } from '../api/endpoints/products';
import { useLanguage } from '../context/LanguageContext';

const Products = () => {
    const { t } = useLanguage();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [productsLoading, setProductsLoading] = useState(false);

    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedBrand, setSelectedBrand] = useState('');
    const [maxPrice, setMaxPrice] = useState(1000);
    const [sortOrder, setSortOrder] = useState('newest');

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalResults, setTotalResults] = useState(0);

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const { categories, brands } = await fetchFilterOptions();
                setCategories(categories);
                setBrands(brands);
            } catch (error) {
                console.error("Failed to fetch filter options:", error);
            }
        };

        loadInitialData();
    }, []);

    useEffect(() => {
        const loadProducts = async () => {
            setProductsLoading(true);
            try {
                const sortMap = { newest: 'latest', 'price-low': 'price_low', 'price-high': 'price_high' };
                const response = await fetchFilteredProducts({
                    category: selectedCategory,
                    brand: selectedBrand,
                    max_price: maxPrice,
                    sort: sortMap[sortOrder] || 'latest',
                    page: currentPage,
                });

                if (response && response.data && Array.isArray(response.data)) {
                    setProducts(response.data);
                    setTotalPages(response.meta?.last_page || response.last_page || 1);
                    setTotalResults(response.meta?.total || response.total || response.data.length);
                } else if (Array.isArray(response)) {
                    setProducts(response);
                    setTotalPages(1);
                    setTotalResults(response.length);
                } else {
                    setProducts([]);
                    setTotalPages(1);
                    setTotalResults(0);
                }
            } catch (error) {
                console.error("Failed to fetch products:", error);
                setProducts([]);
            } finally {
                setLoading(false);
                setProductsLoading(false);
            }
        };

        const timer = setTimeout(() => {
            loadProducts();
        }, 300);

        return () => clearTimeout(timer);
    }, [selectedCategory, selectedBrand, maxPrice, sortOrder, currentPage]);

    if (loading) return <LoadingComponent />;

    return (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 font-sans text-gray-900">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <h1 className="text-3xl font-extrabold uppercase tracking-tight">{t('productsPage.title')}</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-3">
                    <FilterSection
                        categories={categories}
                        brands={brands}
                        selectedCategory={selectedCategory}
                        setSelectedCategory={(val) => { setSelectedCategory(val); setCurrentPage(1); }}
                        selectedBrand={selectedBrand}
                        setSelectedBrand={(val) => { setSelectedBrand(val); setCurrentPage(1); }}
                        maxPrice={maxPrice}
                        setMaxPrice={(val) => { setMaxPrice(val); setCurrentPage(1); }}
                    />
                </div>

                <div className="lg:col-span-9 space-y-6">
                    <div className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl border border-gray-100 text-xs">
                        <span className="font-semibold text-gray-600">
                            {t('productsPage.showingResults', { count: totalResults })}
                        </span>
                        <select
                            value={sortOrder}
                            onChange={(e) => { setSortOrder(e.target.value); setCurrentPage(1); }}
                            className="bg-white border rounded-lg px-3 py-1.5 font-semibold text-gray-700 outline-none"
                        >
                            <option value="newest">{t('productsPage.sortNewest')}</option>
                            <option value="price-low">{t('productsPage.sortPriceLow')}</option>
                            <option value="price-high">{t('productsPage.sortPriceHigh')}</option>
                        </select>
                    </div>

                    {productsLoading ? (
                        <LoadingComponent />
                    ) : products.length === 0 ? (
                        <EmptyStateComponent message={t('productsPage.noResults')} />
                    ) : (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                {products.map((p) => (
                                    <ProductCard key={p.id} product={p} />
                                ))}
                            </div>

                            {totalPages > 1 && (
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={(page) => setCurrentPage(page)}
                                />
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Products;