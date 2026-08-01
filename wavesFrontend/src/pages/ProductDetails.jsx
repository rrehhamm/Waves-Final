import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import ProductCard from '../components/ProductCard';
import LoadingComponent from '../components/LoadingComponent';
import EmptyStateComponent from '../components/EmptyStateComponent';
import { fetchProductById, fetchRelatedProducts } from '../api/endpoints/products';
import { formatCurrency } from '../utils/currency';
import { FaMinus, FaPlus } from 'react-icons/fa';
import { ShoppingBag, Tag, ShieldCheck, Box } from 'lucide-react';

const ProductDetails = () => {
    const { id } = useParams();
    const { addToCart } = useCart();
    const { t } = useLanguage();

    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [selectedImg, setSelectedImg] = useState('');
    const [selectedSize, setSelectedSize] = useState(null);
    const [selectedColor, setSelectedColor] = useState(null);
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        const loadProductDetails = async () => {
            setLoading(true);
            setError(null);
            setQuantity(1);

            try {
                const data = await fetchProductById(id);
                setProduct(data);

                const mainImg = data.main_image || data.image_url || (data.images && data.images[0]) || '';
                setSelectedImg(mainImg);

                const sizes = Array.isArray(data.sizes) ? data.sizes : [];
                setSelectedSize(sizes.length > 0 ? sizes[0] : null);

                const colors = Array.isArray(data.colors) ? data.colors : [];
                setSelectedColor(colors.length > 0 ? colors[0].name : null);

                const categoryId = data.category_id || data.category?.id;
                const related = await fetchRelatedProducts(categoryId, id);
                setRelatedProducts(related);
            } catch (err) {
                console.error('Error loading product details:', err);
                setError(t('productDetails.fetchError'));
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            loadProductDetails();
        }
    }, [id]);

    if (loading) return <LoadingComponent />;
    if (error || !product) return <EmptyStateComponent message={error || t('productDetails.notFound')} />;

    const additionalImgs = Array.isArray(product.additional_images)
        ? product.additional_images
        : Array.isArray(product.images)
            ? product.images
            : [];

    const allImages = Array.from(new Set([product.main_image || product.image_url, ...additionalImgs])).filter(Boolean);

    return (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans text-gray-900">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-16 items-start">

                {allImages.length > 0 && (
                    <div className="lg:col-span-2 flex lg:flex-col gap-3 order-2 lg:order-1 justify-center lg:justify-start">
                        {allImages.map((img, idx) => (
                            <button
                                key={idx}
                                onClick={() => setSelectedImg(img)}
                                className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gray-50 border-2 p-2 flex items-center justify-center transition-all duration-200 overflow-hidden ${selectedImg === img ? 'border-black shadow-md scale-105' : 'border-gray-100 hover:border-gray-300'
                                    }`}
                            >
                                <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-contain" />
                            </button>
                        ))}
                    </div>
                )}

                <div className={`${allImages.length > 0 ? 'lg:col-span-5' : 'lg:col-span-7'} bg-gradient-to-b from-gray-50 to-gray-100/60 rounded-3xl p-8 flex items-center justify-center order-1 lg:order-2 aspect-square border border-gray-100/80 shadow-inner`}>
                    <img
                        src={selectedImg || product.main_image || product.image_url}
                        alt={product.name_en || product.name}
                        className="w-full h-full object-contain drop-shadow-lg transition-all duration-300"
                    />
                </div>

                <div className="lg:col-span-5 flex flex-col justify-between order-3 space-y-6">
                    <div className="space-y-4">
                        <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-black leading-tight">
                            {product.name_en || product.name}
                        </h1>

                        <div className="flex items-baseline gap-2 pt-2">
                            {product.discount_percent && product.final_price != null && Number(product.final_price) < Number(product.price) ? (
                                <>
                                    <span className="text-3xl font-black tracking-tight text-black">{formatCurrency(product.final_price)}</span>
                                    <span className="text-lg font-semibold text-gray-400 line-through">{formatCurrency(product.price)}</span>
                                    <span className="bg-[#81A6C6] text-white text-xs font-extrabold px-2.5 py-1 rounded-full">
                                        -{product.discount_percent}%
                                    </span>
                                </>
                            ) : (
                                <span className="text-3xl font-black tracking-tight text-black">{formatCurrency(product.price)}</span>
                            )}
                        </div>

                        <p className="text-gray-500 text-sm leading-relaxed border-t border-b border-gray-100 py-4">
                            {product.description_en || product.description || 'No description available for this product.'}
                        </p>

                        {Array.isArray(product.sizes) && product.sizes.length > 0 && (
                            <div className="space-y-3 pt-2">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block">
                                    {t('productDetails.chooseSize')}
                                </span>
                                <div className="flex flex-wrap gap-2.5">
                                    {product.sizes.map((size) => (
                                        <button
                                            key={size}
                                            onClick={() => setSelectedSize(size)}
                                            className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 ${selectedSize === size
                                                    ? 'bg-black text-white shadow-md shadow-black/10 scale-105'
                                                    : 'bg-gray-100/80 text-gray-600 hover:bg-gray-200/80'
                                                }`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {Array.isArray(product.colors) && product.colors.length > 0 && (
                            <div className="space-y-3 pt-2">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block">
                                    {t('productDetails.chooseColor')}
                                </span>
                                <div className="flex flex-wrap gap-2.5">
                                    {product.colors.map((color) => (
                                        <button
                                            key={color.name}
                                            onClick={() => setSelectedColor(color.name)}
                                            title={color.name}
                                            className={`w-9 h-9 rounded-full border-2 transition-all duration-200 flex items-center justify-center ${selectedColor === color.name
                                                    ? 'border-black scale-110 shadow-md shadow-black/10'
                                                    : 'border-gray-200 hover:border-gray-400'
                                                }`}
                                        >
                                            <span
                                                className="w-6 h-6 rounded-full border border-black/10"
                                                style={{ backgroundColor: color.hex }}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center justify-between bg-gray-100/80 rounded-2xl px-4 py-3 w-32 border border-gray-200/50">
                            <button
                                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                                className="text-gray-500 hover:text-black transition-colors p-1"
                            >
                                <FaMinus className="w-2.5 h-2.5" />
                            </button>
                            <span className="font-extrabold text-sm text-black">{quantity}</span>
                            <button
                                onClick={() => setQuantity((q) => q + 1)}
                                className="text-gray-500 hover:text-black transition-colors p-1"
                            >
                                <FaPlus className="w-2.5 h-2.5" />
                            </button>
                        </div>

                        <button
                            onClick={() => addToCart({ ...product, quantity, selectedSize, selectedColor })}
                            className="flex-1 bg-black hover:bg-zinc-800 active:scale-[0.99] text-white font-bold py-3.5 px-6 rounded-2xl transition-all shadow-lg shadow-black/10 text-xs uppercase tracking-wider flex items-center justify-center gap-2"
                        >
                            <ShoppingBag className="w-4 h-4" />
                            {t('common.addToCart')}
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-2xl mx-auto bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm mb-16">
                <h3 className="text-base font-extrabold mb-5 text-black border-b border-gray-100 pb-3 flex items-center justify-between">
                    <span>{t('productDetails.title')}</span>
                    <ShieldCheck className="w-5 h-5 text-gray-400" />
                </h3>
                <ul className="space-y-4 text-sm">
                    <li className="flex justify-between items-center border-b border-gray-50 pb-3">
                        <span className="font-medium text-gray-500 flex items-center gap-2">
                            <Tag className="w-4 h-4 text-gray-400" />
                            {t('productDetails.category')}
                        </span>
                        <span className="font-bold text-gray-900">
                            {product.category?.name || t('productDetails.notSpecified')}
                        </span>
                    </li>
                    <li className="flex justify-between items-center border-b border-gray-50 pb-3">
                        <span className="font-medium text-gray-500 flex items-center gap-2">
                            <Box className="w-4 h-4 text-gray-400" />
                            {t('productDetails.brand')}
                        </span>
                        <span className="font-bold text-gray-900">
                            {product.brand?.name || t('productDetails.notSpecified')}
                        </span>
                    </li>
                    <li className="flex justify-between items-center">
                        <span className="font-medium text-gray-500">{t('productDetails.stockStatus')}</span>
                        <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${(product.stock || product.quantity || 0) > 0
                                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-200/60'
                                    : 'bg-red-50 text-red-600 border border-red-200/60'
                                }`}
                        >
                            {(product.stock || product.quantity || 0) > 0 ? t('productDetails.inStock') : t('productDetails.outOfStock')}
                        </span>
                    </li>
                </ul>
            </div>

            {relatedProducts.length > 0 && (
                <section className="pt-12 border-t border-gray-100">
                    <div className="text-center mb-10 space-y-1">
                        <h2 className="text-2xl sm:text-3xl font-black text-black uppercase tracking-tight">
                            {t('productDetails.relatedTitle')}
                        </h2>
                        <p className="text-xs text-gray-400 font-medium tracking-wide uppercase">
                            {t('productDetails.relatedSubtitle')}
                        </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                        {relatedProducts.map((prod) => (
                            <ProductCard key={prod.id} product={prod} />
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
};

export default ProductDetails;