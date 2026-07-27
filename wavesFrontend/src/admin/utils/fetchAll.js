import adminApi from '../api/adminApi';

// Every admin `index()` endpoint returns Laravel's default paginate(15) shape:
// { data: [...], links: {...}, meta: { current_page, last_page, ... } }
// Some UI pieces (e.g. category/brand <select> dropdowns on the Products page) need the
// FULL list regardless of how many pages it spans, since the backend has no per_page override.
// This walks every page and concatenates the results.
export default async function fetchAll(path) {
    let page = 1;
    let all = [];

    // Safety cap so a backend bug can't spin this into an infinite loop
    while (page <= 50) {
        const res = await adminApi.get(path, { params: { page } });
        const pageData = res.data?.data || [];
        all = all.concat(pageData);

        const meta = res.data?.meta;
        if (!meta || page >= meta.last_page) break;
        page += 1;
    }

    return all;
}
