# Waves — Ecommerce Backend API

Back-end for the **Waves** e-commerce platform, built with **Laravel 13**. It provides a RESTful API for the front-end plus a separate Admin Dashboard API, with full bilingual support (Arabic / English).

## Table of Contents

- [Waves — Ecommerce Backend API](#waves--ecommerce-backend-api)
  - [Table of Contents](#table-of-contents)
  - [Setup](#setup)
  - [Base URL](#base-url)
  - [Response Format](#response-format)
  - [Language Support](#language-support)
  - [Authentication](#authentication)
    - [1) Admin — full access](#1-admin--full-access)
    - [2) Customer (User) — can only place/view their own orders](#2-customer-user--can-only-placeview-their-own-orders)
  - [Admin API](#admin-api)
    - [Product lifecycle (soft delete, restore, reassign)](#product-lifecycle-soft-delete-restore-reassign)
    - [Deleting a category/brand that still has products](#deleting-a-categorybrand-that-still-has-products)
  - [Public API](#public-api)
    - [Example: creating an order (requires customer login)](#example-creating-an-order-requires-customer-login)
  - [Images](#images)
  - [Pagination](#pagination)
  - [Order Status](#order-status)
  - [Postman Collection](#postman-collection)
  - [API Documentation (Scribe)](#api-documentation-scribe)

---

## Setup

```bash
composer install
cp .env.example .env        # or edit the existing .env
php artisan key:generate
php artisan migrate
php artisan db:seed --class=AdminSeeder   # creates a ready-to-use admin account
php artisan serve
```

Default admin account (from `AdminSeeder`):
```
email: admin@example.com
password: Admin@12345
```

## Base URL

```
http://127.0.0.1:8000/api
```
(or via XAMPP: `http://localhost/Ecommerce%20Backend/public/api`)

## Response Format

All responses are JSON and generally follow this shape:

**Success:**
```json
{
  "success": true,
  "message": "...",
  "data": { }
}
```

**Validation error (422):**
```json
{
  "message": "The email field is required.",
  "errors": {
    "email": ["The email field is required."]
  }
}
```

**Unauthenticated (401):**
```json
{ "message": "Unauthenticated." }
```

## Language Support

All responses (data fields **and** success/error messages) are returned in Arabic or English depending on the requested language. Set the language with either:

- **Query parameter**: `?lang=ar` or `?lang=en`
- **Header**: `Accept-Language: ar` or `Accept-Language: en`

Default (if neither is sent): `en`.

Every response also includes an `X-Text-Direction` header (`rtl` or `ltr`) — use it on the front-end to set the page direction (`<html dir="rtl">` for Arabic).

## Authentication

There are two completely separate account types, each with its own guard (an admin token will never work on customer routes, and vice versa):

### 1) Admin — full access

| Method | Endpoint          | Description                    |
|--------|--------------------|---------------------------------|
| POST   | `/admin/login`     | Log in (returns a token)       |
| POST   | `/admin/logout`    | Log out (protected)             |
| GET    | `/admin/me`        | Current admin info (protected) |

### 2) Customer (User) — can only place/view their own orders

| Method | Endpoint      | Description                          |
|--------|----------------|----------------------------------------|
| POST   | `/register`   | Create a new account (returns a token) |
| POST   | `/login`      | Log in (returns a token)               |
| POST   | `/logout`     | Log out (protected)                    |
| GET    | `/me`         | Current customer info (protected)      |
| GET    | `/my-orders`  | Orders belonging to the current customer only (protected) |
| POST   | `/orders`     | Create an order (protected — see note below) |

**Using the token:** after login/register, take `data.token` from the response and send it with every protected request via header:
```
Authorization: Bearer {token}
```

> **Login is required to place an order.** Browsing products, categories, brands, banners and gallery is fully open to guests, but `POST /orders` requires a valid customer Bearer token — a guest without a token gets a `401 Unauthenticated`. Every order created is automatically linked to the logged-in customer's account and shows up under `/my-orders`.

---

## Admin API

All these routes are under `/api/admin/*` and protected with `Authorization: Bearer {admin_token}`.

| Method | Endpoint                                     | Description                        |
|--------|-----------------------------------------------|--------------------------------------|
| GET    | `/admin/dashboard`                            | General statistics                  |
| GET/POST/PUT/DELETE | `/admin/categories[/{id}]`      | Full category CRUD                  |
| GET/POST/PUT/DELETE | `/admin/brands[/{id}]`          | Full brand CRUD                     |
| GET/POST/PUT/DELETE | `/admin/products[/{id}]`        | Full product CRUD (use `search`, `category_id`, `brand_id` query params on `/admin/products` for search/filter) |
| GET    | `/admin/products/trashed`                     | List soft-deleted products          |
| PATCH  | `/admin/products/{id}/reassign`               | Move a product to another category/brand (works even on trashed products) |
| POST   | `/admin/products/{id}/restore`                | Restore a soft-deleted product      |
| DELETE | `/admin/products/{id}/force`                  | Permanently delete a product (and its images) — cannot be undone |
| GET/POST/PUT/DELETE | `/admin/banners[/{id}]`         | Full banner CRUD                    |
| PATCH  | `/admin/banners/{id}/toggle-status`           | Activate/deactivate a banner        |
| GET/POST/PUT/DELETE | `/admin/gallery[/{id}]`         | Full gallery image CRUD             |
| POST   | `/admin/gallery/sort`                         | Reorder gallery images              |
| PATCH  | `/admin/gallery/{id}/toggle-status`           | Show/hide a gallery image           |
| GET    | `/admin/contact-messages`                     | List all contact messages           |
| GET    | `/admin/contact-messages/{id}`                | Message details                     |
| PATCH  | `/admin/contact-messages/{id}/mark-as-read`   | Mark a message as read              |
| DELETE | `/admin/contact-messages/{id}`                | Delete a message                    |
| GET    | `/admin/orders`                               | List all orders                     |
| GET    | `/admin/orders/{id}`                          | Order details                       |
| PATCH  | `/admin/orders/{id}/status`                   | Change order status (Body: `{"status":"confirmed"}`) |

**Uploading images**: any endpoint with an image field (category/brand/product/banner/gallery) requires the request body to be `multipart/form-data`, not JSON. For updates that include a file, send a `POST` request with a `_method=PUT` field (Laravel's standard method-spoofing for HTML/multipart forms) — see the Postman collection for working examples.

### Product lifecycle (soft delete, restore, reassign)

`DELETE /admin/products/{id}` never removes a row from the database — it's a soft delete (the row gets a `deleted_at` timestamp and disappears from normal listings, but still exists). This gives the admin two ways to handle a deleted product later:

- **`GET /admin/products/trashed`** — see everything that's been soft-deleted.
- **`PATCH /admin/products/{id}/reassign`** (body: `{"category_id": 2}` and/or `{"brand_id": 3}`) — move a trashed (or active) product to a different category/brand.
- **`POST /admin/products/{id}/restore`** — bring a soft-deleted product back.
- **`DELETE /admin/products/{id}/force`** — permanently delete the product row and its stored images. This cannot be undone.

### Deleting a category/brand that still has products

`DELETE /admin/categories/{id}` and `DELETE /admin/brands/{id}` will **refuse** to delete if any product (including soft-deleted ones) still references it, returning `409 Conflict`:

```json
{
  "success": false,
  "message": "This category cannot be deleted because it has associated products. Delete or reassign those products first.",
  "blocking_products": [
    { "id": 5, "name": "Running Shoes" },
    { "id": 9, "name": "Sport Jacket" }
  ]
}
```

Use the `blocking_products` list to decide what to do next: `PATCH /admin/products/{id}/reassign` each one to a different category/brand, or `DELETE /admin/products/{id}/force` to remove it permanently — then retry the category/brand delete.

---

## Public API

Open, no login required:

| Method | Endpoint              | Description                                     |
|--------|------------------------|----------------------------------------------------|
| GET    | `/banners`             | Active banners only                             |
| GET    | `/categories`          | All active categories                           |
| GET    | `/categories/{id}`     | A single category + its products                |
| GET    | `/brands`               | All active brands                                |
| GET    | `/brands/{id}`          | A single brand + its products                    |
| GET    | `/products`             | All active products                              |
| GET    | `/products/{id}`        | A single product                                 |
| GET    | `/products/search`      | Search/filter (query: `search`, `category`, `brand`, `min_price`, `max_price`) |
| GET    | `/gallery`               | Active gallery images                            |
| POST   | `/contact-us`            | Send a contact message (Body: `name`, `email`, `message`, `phone?`) |

> `POST /orders` (Cart → Order) is **not** in this open list — it requires a logged-in customer. See [Authentication](#authentication) and the example below.

### Example: creating an order (requires customer login)

```json
POST /api/orders
Authorization: Bearer {customer_token}

{
  "customer_name": "Mohammad",
  "customer_phone": "0791234567",
  "customer_email": "mohammad@test.com",
  "customer_address": "Amman, Jordan",
  "products": [
    { "product_id": 3, "quantity": 2 },
    { "product_id": 7, "quantity": 1 }
  ]
}
```
The response returns a unique `order_number` and a `total_price` automatically calculated from product prices. Without a valid Bearer token this request returns `401 Unauthenticated`.

---

## Images

Images are **not stored inside the `public` folder** (per project requirements) — they are stored in `storage/app/uploads` and served through a dedicated route. Every image field in the API (`image`, `logo`, `main_image`...) already returns a full, ready-to-use URL, e.g.:
```
http://127.0.0.1:8000/uploads/products/abc123.jpg
```

## Pagination

All admin list endpoints plus the public `/products`, `/categories`, `/brands` are paginated (15 per page). Shape:
```json
{
  "data": [ ... ],
  "links": { "first": "...", "last": "...", "prev": null, "next": "..." },
  "meta": { "current_page": 1, "last_page": 3, "total": 42, "per_page": 15 }
}
```
Use `?page=2` to navigate between pages.

## Order Status

Possible values for the order `status` field (in logical order):
```
pending → confirmed → processing → completed
                                  → cancelled
```

## Postman Collection

A ready-to-import Postman collection is included: **`Waves.postman_collection.json`**. It contains all 58 endpoints listed above with literal URLs (no environment variables to configure) and example request bodies. Protected requests have placeholder Bearer tokens — `PASTE_ADMIN_TOKEN_HERE` for admin routes and `PASTE_CUSTOMER_TOKEN_HERE` for customer routes — just replace them with a real token obtained from the matching login request (`data.token` in the login response).

## API Documentation (Scribe)

Interactive API documentation is generated with [Scribe](https://scribe.knuckles.wtf/):

```bash
composer require knuckleswtf/scribe --dev   # if not already installed (already in composer.json)
php artisan scribe:generate
```

This reads every route under `/api/*`, plus the Form Requests and API Resources behind them, and builds a browsable documentation site with a "Try It Out" button for testing endpoints live from the page — no Postman needed. After generating, open:

```
http://127.0.0.1:8000/docs
```

Endpoints are organized into groups (Admin - Authentication, Admin - Categories, Admin - Products, Public - Products, Customer - Authentication, Customer - Orders, etc.) matching the tables above. Endpoints that require a token are marked "Requires authentication" — remember admin tokens and customer tokens are not interchangeable (see [Authentication](#authentication)).

**How example responses are generated** (so you know what to expect):
- `GET` endpoints: Scribe actually calls the route while generating and captures the real JSON response.
- `POST`/`PUT`/`PATCH`/`DELETE` endpoints: Scribe does **not** call these automatically (to avoid creating/deleting real data during generation). Every one of these already has a hand-written `@response` example in its controller docblock, so the docs always show accurate example JSON regardless of what's in your database.

Optional: to let "Try It Out" and the auto-captured `GET` examples run **authenticated** requests during generation (so protected `GET` routes like `/admin/dashboard` show real data instead of a `401`), add a real token to `.env`:
```
SCRIBE_AUTH_KEY=your_real_admin_or_customer_token
```
Without it, protected `GET` endpoints will simply show an "Unauthenticated" example response until you set one — this doesn't affect the hand-written `@response` examples on the write endpoints, which are always shown correctly.

Note: the image-serving route (`/uploads/{path}`) won't appear in the generated docs — it's registered in `routes/web.php`, not `routes/api.php`, since it streams a raw file rather than returning JSON. See [Images](#images).

Re-run `php artisan scribe:generate` any time routes, Form Requests, or Resources change to keep the docs in sync. A Postman collection and OpenAPI spec are also generated automatically alongside the HTML docs (`storage/app/scribe/collection.json` and `storage/app/scribe/openapi.yaml`).
