import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import Pagination from '../components/Pagination';
import LoadingComponent from '../components/LoadingComponent';
import EmptyStateComponent from '../components/EmptyStateComponent';
import { fetchFilteredProducts } from '../api/endpoints/products';
import { useLanguage } from '../context/LanguageContext';

const SearchResults = () => {
    const { t } = useLanguage();
    const [searchParams, setSearchParams] = useSearchParams();
    const query = (searchParams.get('q') || '').trim();
    const page = Number(searchParams.get('page')) || 1;

    const [products, setProducts] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [totalResults, setTotalResults] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!query) {
            setProducts([]);
            setTotalPages(1);
            setTotalResults(0);
            setLoading(false);
            setError('');
            return;
        }

        let cancelled = false;
        setLoading(true);
        setError('');

        fetchFilteredProducts({ search: query, page })
            .then((response) => {
                if (cancelled) return;
                const data = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : [];
                setProducts(data);
                setTotalPages(response?.meta?.last_page || 1);
                setTotalResults(response?.meta?.total ?? data.length);
            })
            .catch((err) => {
                if (cancelled) return;
                console.error('Search failed:', err);
                setError(t('search.error'));
                setProducts([]);
                setTotalPages(1);
                setTotalResults(0);
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [query, page]);

    const handlePageChange = (newPage) => {
        const next = new URLSearchParams(searchParams);
        next.set('page', String(newPage));
        setSearchParams(next);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans text-gray-900">
            <nav className="text-xs text-gray-500 mb-6">
                <Link to="/" className="hover:text-black">{t('nav.home')}</Link>
                <span className="mx-2">/</span>
                <span className="text-black font-semibold">{t('search.title')}</span>
            </nav>

            <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight mb-2">
                {t('search.title')}
            </h1>

            {query ? (
                <p className="text-sm text-gray-500 mb-8">
                    {t('search.resultsFor')} "<span className="font-semibold text-black">{query}</span>"
                    {!loading && !error && <span> &middot; {totalResults} {t('search.resultsCount')}</span>}
                </p>
            ) : (
                <p className="text-sm text-gray-500 mb-8">{t('search.emptyQuery')}</p>
            )}

            {!query ? (
                <EmptyStateComponent message={t('search.emptyQuery')} />
            ) : loading ? (
                <LoadingComponent />
            ) : error ? (
                <EmptyStateComponent message={error} />
            ) : products.length === 0 ? (
                <EmptyStateComponent message={t('search.noResults')} />
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {products.map((p) => (
                            <ProductCard key={p.id} product={p} />
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <Pagination currentPage={page} totalPages={totalPages} onPageChange={handlePageChange} />
                    )}
                </>
            )}
        </div>
    );
};

export default SearchResults;
