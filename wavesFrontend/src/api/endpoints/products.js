import API from '../axios';

export const fetchFilteredProducts = async (params = {}) => {
    const queryParams = new URLSearchParams();

    if (params.search) queryParams.append('search', params.search);
    if (params.category) queryParams.append('category', params.category);
    if (params.brand) queryParams.append('brand', params.brand);
    if (params.min_price !== undefined) queryParams.append('min_price', params.min_price);
    if (params.max_price !== undefined) queryParams.append('max_price', params.max_price);
    if (params.sort) queryParams.append('sort', params.sort);
    if (params.page) queryParams.append('page', params.page);

    const response = await API.get(`/products/search?${queryParams.toString()}`);
    return response.data;
};

export const fetchFilterOptions = async () => {
    const [categoriesRes, brandsRes] = await Promise.all([
        API.get('/categories'),
        API.get('/brands'),
    ]);

    const extractData = (res) => {
        if (res.data && Array.isArray(res.data.data)) {
            return res.data.data;
        }
        return Array.isArray(res.data) ? res.data : [];
    };

    return {
        categories: extractData(categoriesRes),
        brands: extractData(brandsRes),
    };
};

export const fetchProductById = async (id) => {
    const response = await API.get(`/products/${id}`);
    return response.data?.data || response.data;
};

export const fetchRelatedProducts = async (categoryId, currentProductId) => {
    try {
        const params = categoryId ? { category: categoryId } : {};
        const data = await fetchFilteredProducts(params);
        const list = Array.isArray(data) ? data : data?.data || [];

        return list
            .filter((p) => String(p.id) !== String(currentProductId))
            .slice(0, 4);
    } catch (error) {
        console.error("Failed to fetch related products:", error);
        return [];
    }
};