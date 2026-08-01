import API from '../axios';

export const fetchHomeData = async () => {
    const [productsRes, categoriesRes, brandsRes, galleryRes] = await Promise.all([
        API.get('/products'),
        API.get('/categories'),
        API.get('/brands'),
        API.get('/gallery'),
    ]);

    const extractData = (res) => {
        if (res.data && Array.isArray(res.data.data)) {
            return res.data.data;
        }
        return Array.isArray(res.data) ? res.data : [];
    };

    return {
        products: extractData(productsRes),
        categories: extractData(categoriesRes),
        brands: extractData(brandsRes),
        gallery: extractData(galleryRes),
    };
};