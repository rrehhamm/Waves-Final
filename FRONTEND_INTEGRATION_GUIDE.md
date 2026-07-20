# Waves — Frontend Integration Guide

Everything the front-end team needs to connect to the Waves backend API. This is a companion to `README.md` (which has the full endpoint reference table) and `Waves.postman_collection.json` (ready-to-import Postman collection) — this file focuses on **how to actually integrate it** with real examples.

## 1. Base URL & Environment

```
http://127.0.0.1:8000/api
```

Suggested `.env` entry on the front-end side:
```
VITE_API_URL=http://127.0.0.1:8000/api
```

There is no CORS restriction configured beyond Laravel's defaults — if you run the front-end on a different port (e.g. `http://localhost:5173`), and you hit CORS issues, let the backend team know so `config/cors.php` can allow that origin.

## 2. Two Separate Auth Systems

| | Admin | Customer |
|---|---|---|
| Purpose | Manage the dashboard (full CRUD) | Browse the store, place/view own orders |
| Login endpoint | `POST /admin/login` | `POST /login` |
| Register endpoint | — (seeded manually) | `POST /register` |
| Token header | `Authorization: Bearer {admin_token}` | `Authorization: Bearer {customer_token}` |

**A token from one system will never authenticate on the other's protected routes** (you'll get a clean `401 Unauthenticated` JSON, not a crash). Keep the two tokens in separate storage keys if you're building both an admin panel and the storefront from the same codebase.

### Customer auth flow (storefront)

```js
// Register
const res = await fetch(`${API_URL}/register`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    name: "Sara",
    email: "sara@test.com",
    password: "12345678",
    password_confirmation: "12345678",
  }),
});
const { data } = await res.json();
localStorage.setItem("customer_token", data.token);

// Login
const res = await fetch(`${API_URL}/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: "sara@test.com", password: "12345678" }),
});

// Authenticated request
const res = await fetch(`${API_URL}/my-orders`, {
  headers: { Authorization: `Bearer ${localStorage.getItem("customer_token")}` },
});
```

**Checkout requires login.** `POST /orders` is a protected route — a guest without a valid customer Bearer token gets `401 Unauthenticated`. Guests can browse everything (home, products, categories, brands, gallery) with no restrictions, but must register/log in before placing an order. Every order created is automatically linked to the logged-in customer's account and shows up under `/my-orders`.

Practical flow: let guests build a cart freely (client-side, as usual). At the "Place Order" step, check if a `customer_token` exists in storage — if not, redirect to login/register first, then submit the order with the token attached.

## 3. Language Switching (Arabic / English)

Every single request — public or admin — should carry the current language, either as a header or a query param:

```js
// Recommended: send on every request via a shared fetch wrapper
const res = await fetch(`${API_URL}/products`, {
  headers: { "Accept-Language": currentLang }, // "ar" or "en"
});
```

or:
```
GET /api/products?lang=ar
```

**What changes automatically per language:**
- All product/category/brand/banner/gallery text fields (`name`, `description`, etc.)
- All success/error messages (`"تم إنشاء الطلب بنجاح"` vs `"Your order has been created successfully"`)
- All validation error messages (`"حقل البريد الإلكتروني مطلوب"` vs `"The email field is required."`)

**What you (front-end) still need to handle:**
- Actually switching the UI text/labels (that's your i18n layer, e.g. `react-i18next`)
- Setting the page direction. Every response includes a response header:
  ```
  X-Text-Direction: rtl   (or ltr)
  ```
  Read it and apply it, e.g.:
  ```js
  const dir = res.headers.get("X-Text-Direction"); // "rtl" | "ltr"
  document.documentElement.dir = dir;
  document.documentElement.lang = currentLang;
  ```
  In practice it's simplest to just derive this yourself from the language you're already tracking in app state (`ar` → `rtl`, `en` → `ltr`) rather than reading it from every response — the header is there as a convenience/fallback.

## 4. Displaying Images

Every image field returned by the API (`image`, `logo`, `main_image`, items inside `additional_images`) is **already a complete, absolute URL** — just drop it straight into `<img src="...">`:

```json
{
  "main_image": "http://127.0.0.1:8000/uploads/products/abc123.jpg"
}
```

No need to prepend anything. If a product/category/banner has no image, the field is `null` — handle that with a placeholder image.

## 5. Home Page — what to call

```js
const [banners, categories, brands, products, gallery] = await Promise.all([
  fetch(`${API_URL}/banners`).then(r => r.json()),
  fetch(`${API_URL}/categories`).then(r => r.json()),
  fetch(`${API_URL}/brands`).then(r => r.json()),
  fetch(`${API_URL}/products`).then(r => r.json()),
  fetch(`${API_URL}/gallery`).then(r => r.json()),
]);
```
All of these are public, paginated where noted in the README, and already filtered to only return "active" records.

## 6. Products Page — search, filter, sort

```
GET /api/products/search?search=phone&category=3&brand=2&min_price=50&max_price=500
```
- `search` — matches against both Arabic and English product name
- `category` / `brand` — pass the numeric ID
- `min_price` / `max_price` — numeric bounds

**Sorting by price/newest is not a dedicated query param yet** — the current default order is "newest first". If you need client-selectable sort (price asc/desc), let the backend team know and a `sort` query param can be added quickly (`sort=price_asc`, `sort=price_desc`, `sort=newest`).

## 7. Product Details Page

```
GET /api/products/{id}
```
Returns: `name`, `description`, `price`, `quantity`, `main_image`, `additional_images` (array of URLs), `category` (nested object), `brand` (nested object), `status`, `featured`. Use `quantity` (or `status`) to decide whether to show "Out of stock".

## 8. Cart → Checkout (Orders)

The cart itself is entirely client-side (local storage / state management, as your project spec requires) — the backend only gets involved at checkout. **This step requires the customer to be logged in:**

```js
const res = await apiFetch(`${API_URL}/orders`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("customer_token")}`,
  },
  body: JSON.stringify({
    customer_name: "Mohammad",
    customer_phone: "0791234567",
    customer_email: "mohammad@test.com",
    customer_address: "Amman, Jordan",
    products: [
      { product_id: 3, quantity: 2 },
      { product_id: 7, quantity: 1 },
    ],
  }),
});
```
If there's no `customer_token` in storage, don't even call this endpoint — send the user to login/register first (it would return `401` anyway).

The response includes the generated `order_number` and the server-calculated `total_price` — always trust the server total, don't rely on a client-calculated one. On success (`201`), clear the local cart.

If the `product_id` sent doesn't exist / is inactive / was deleted, you'll get a `422` with a clear message under `errors.products.*.product_id` — show it to the user and remove that item from the cart.

> Note for the admin panel team (not the storefront): products aren't permanently removed by a normal delete — see the "Product lifecycle" and "Deleting a category/brand that still has products" sections in `README.md` for the `trashed` / `reassign` / `restore` / `force` endpoints and the `409` conflict response.

## 9. Contact Us Page

```json
POST /api/contact-us
{
  "name": "Ahmad",
  "phone": "0791234567",
  "email": "ahmad@test.com",
  "message": "I have a question about a product"
}
```
`phone` is optional, everything else is required. Do your own client-side validation too (required fields, email format) before submitting, matching your project's "Form Validation" requirement — the API will also reject invalid data with a `422`.

## 10. Error Handling Pattern

Wrap all fetches with logic like:

```js
async function apiFetch(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: { "Accept-Language": currentLang, ...options.headers },
  });
  const json = await res.json();

  if (!res.ok) {
    if (res.status === 422) {
      // json.errors = { field: ["message", ...] }
      throw { type: "validation", errors: json.errors, message: json.message };
    }
    if (res.status === 401) {
      // token missing/invalid/expired — log the user out client-side
      throw { type: "unauthenticated", message: json.message };
    }
    throw { type: "error", message: json.message ?? "Something went wrong" };
  }

  return json;
}
```

Use this for your global Loading / Error / Empty State components: `loading` while the promise is pending, your Error component on any thrown error, and Empty State when `data` (or `data.data` for paginated lists) comes back empty.

## 11. Pagination

Paginated endpoints (admin lists, and public `/products`, `/categories`, `/brands`) return:
```json
{
  "data": [ /* items */ ],
  "links": { "first": "...", "last": "...", "prev": null, "next": "http://.../products?page=2" },
  "meta": { "current_page": 1, "last_page": 5, "total": 68, "per_page": 15 }
}
```
Build your Pagination component off `meta.current_page` / `meta.last_page`, and request the next page with `?page=N`.

## 12. Quick Reference Checklist

- [ ] Send `Accept-Language` (or `?lang=`) on every request
- [ ] Store admin token and customer token under separate keys
- [ ] Never hardcode product data — always fetch from the API (per your project spec)
- [ ] Trust `total_price` from the order response, not a client-calculated total
- [ ] Handle `422` (validation), `401` (auth), and network errors distinctly
- [ ] Use `meta.last_page` for pagination controls
- [ ] Images are full URLs already — no prefixing needed

## 13. Files provided alongside this guide

- `README.md` — full endpoint reference table + setup instructions
- `Waves.postman_collection.json` — importable Postman collection, 58 requests, literal URLs, organized by module (Admin Auth, Categories, Brands, Products, Banners, Gallery, Contact Messages, Orders, Customer Auth, Public API)
- Interactive docs at `/docs` (run `php artisan scribe:generate` on the backend) — lets you try any endpoint live from the browser without Postman. See "API Documentation (Scribe)" in `README.md`.

> **Using `/docs` as a front-end dev:** every `GET` endpoint shows a real, live-captured JSON example. Every `POST`/`PUT`/`PATCH`/`DELETE` endpoint shows a hand-written example JSON (Scribe doesn't auto-run write requests during generation, to avoid creating/deleting real data) — so it's accurate regardless of what's in the backend's database at the time. If a protected `GET` endpoint (e.g. `/admin/dashboard`) shows a `401` example instead of real data, that's just because the backend team hasn't set a `SCRIBE_AUTH_KEY` in `.env` — use the "Try It Out" button with your own token instead. Also note: the image URLs you get back from the API (`/uploads/...`) are a separate file-serving route and won't show up as a documented endpoint in `/docs` — that's expected, see [Images](#4-displaying-images) above.
