import adminApi from '../api/adminApi';

export default async function fetchAll(path) {
    let page = 1;
    let all = [];

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
