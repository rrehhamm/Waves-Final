<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Product\StoreProductRequest;
use App\Http\Requests\Admin\Product\UpdateProductRequest;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Services\ImageUploadService;
use Illuminate\Http\Request;

/**
 * @group Admin - Products
 *
 * Full CRUD for products, plus soft-delete lifecycle management (trashed list,
 * reassign category/brand, restore, and permanent force-delete).
 * @authenticated
 */
class ProductController extends Controller
{
    public function __construct(protected ImageUploadService $imageService) {}

    /**
     * List / search products
     *
     * GET /api/admin/products?search=...&category_id=...&brand_id=...
     * (متطلب رقم 6: Search Products + Filter by Category/Brand)
     */
    public function index(Request $request)
    {
        // with(['category','brand']): Eager Loading - بيجيب العلاقات بـ query واحدة
        // بدل ما يعمل query منفصل لكل منتج (مشكلة N+1)
        $query = Product::query()->with(['category', 'brand']);

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name_ar', 'like', "%{$search}%")
                    ->orWhere('name_en', 'like', "%{$search}%");
            });
        }

        if ($categoryId = $request->query('category_id')) {
            $query->where('category_id', $categoryId);
        }

        if ($brandId = $request->query('brand_id')) {
            $query->where('brand_id', $brandId);
        }

        $products = $query->latest()->paginate(15);

        return ProductResource::collection($products);
    }

    /**
     * Create a product
     *
     * @response 201 {
     *   "success": true,
     *   "message": "Product created successfully",
     *   "data": {
     *     "id": 1, "name": "Running Shoes", "description": "Comfortable running shoes",
     *     "price": 49.99, "quantity": 100,
     *     "main_image": "http://127.0.0.1:8000/uploads/products/main123.jpg",
     *     "additional_images": ["http://127.0.0.1:8000/uploads/products/extra1.jpg"],
     *     "category": { "id": 1, "name": "Shoes", "description": null, "image": null, "status": true, "products": [], "created_at": "2026-07-20T10:00:00.000000Z", "updated_at": "2026-07-20T10:00:00.000000Z" },
     *     "brand": { "id": 1, "name": "Nike", "logo": null, "description": null, "status": true, "products": [], "created_at": "2026-07-20T10:00:00.000000Z", "updated_at": "2026-07-20T10:00:00.000000Z" },
     *     "status": true, "featured": false,
     *     "created_at": "2026-07-20T10:00:00.000000Z", "updated_at": "2026-07-20T10:00:00.000000Z"
     *   }
     * }
     * @response 422 scenario="Validation error" {
     *   "message": "The main image field is required.",
     *   "errors": { "main_image": ["The main image field is required."] }
     * }
     */
    public function store(StoreProductRequest $request)
    {
        $data = $request->validated();
        $data['status'] = $request->boolean('status', true);
        $data['featured'] = $request->boolean('featured', false);

        // main_image إجباري بـ StoreProductRequest، فمتأكدين إنه موجود هون
        $data['main_image'] = $this->imageService->store($request->file('main_image'), 'products');

        if ($request->hasFile('additional_images')) {
            // نرفع كل صورة إضافية ونجمع مساراتها بمصفوفة واحدة (بتترصف بعمود additional_images كـ JSON)
            $data['additional_images'] = collect($request->file('additional_images'))
                ->map(fn ($file) => $this->imageService->store($file, 'products'))
                ->all();
        }

        $product = Product::create($data);

        return response()->json([
            'success' => true,
            'message' => __('messages.product_created'),
            'data' => new ProductResource($product->load(['category', 'brand'])),
        ], 201);
    }

    /**
     * Get a product
     */
    public function show(Product $product)
    {
        return new ProductResource($product->load(['category', 'brand']));
    }

    /**
     * Update a product
     *
     * @response 200 {
     *   "success": true,
     *   "message": "Product updated successfully",
     *   "data": {
     *     "id": 1, "name": "Running Shoes", "description": "Comfortable running shoes",
     *     "price": 54.99, "quantity": 80,
     *     "main_image": "http://127.0.0.1:8000/uploads/products/main123.jpg",
     *     "additional_images": [],
     *     "category": { "id": 1, "name": "Shoes", "description": null, "image": null, "status": true, "products": [], "created_at": "2026-07-20T10:00:00.000000Z", "updated_at": "2026-07-20T10:00:00.000000Z" },
     *     "brand": { "id": 1, "name": "Nike", "logo": null, "description": null, "status": true, "products": [], "created_at": "2026-07-20T10:00:00.000000Z", "updated_at": "2026-07-20T10:00:00.000000Z" },
     *     "status": true, "featured": false,
     *     "created_at": "2026-07-20T10:00:00.000000Z", "updated_at": "2026-07-20T10:10:00.000000Z"
     *   }
     * }
     */
    public function update(UpdateProductRequest $request, Product $product)
    {
        $data = $request->validated();

        if ($request->hasFile('main_image')) {
            $data['main_image'] = $this->imageService->replace($request->file('main_image'), $product->main_image, 'products');
        }

        if ($request->hasFile('additional_images')) {
            // بنحذف كل الصور الإضافية القديمة ونرفع الجديدة بدلها
            foreach ((array) $product->additional_images as $oldPath) {
                $this->imageService->delete($oldPath);
            }

            $data['additional_images'] = collect($request->file('additional_images'))
                ->map(fn ($file) => $this->imageService->store($file, 'products'))
                ->all();
        }

        $product->update($data);

        return response()->json([
            'success' => true,
            'message' => __('messages.product_updated'),
            'data' => new ProductResource($product->load(['category', 'brand'])),
        ]);
    }

    /**
     * Delete a product (soft delete)
     *
     * DELETE /api/admin/products/{product}
     * بسبب SoftDeletes بالموديل، هاد delete() ما بيمسح الصف فعلياً
     * بس بيحط تاريخ بعمود deleted_at (ممكن نرجعه لاحقاً بـ restore())
     *
     * @response 200 {
     *   "success": true,
     *   "message": "Product deleted successfully"
     * }
     */
    public function destroy(Product $product)
    {
        $product->delete();

        return response()->json([
            'success' => true,
            'message' => __('messages.product_deleted'),
        ]);
    }

    /**
     * List trashed (soft-deleted) products
     *
     * GET /api/admin/products/trashed
     * قائمة المنتجات المحذوفة (Soft Delete) - عشان الأدمن يشوف شو مخفي ويقرر شو يعمل فيه
     */
    public function trashed()
    {
        $products = Product::onlyTrashed()->with(['category', 'brand'])->latest()->paginate(15);

        return ProductResource::collection($products);
    }

    /**
     * Reassign a product's category/brand
     *
     * PATCH /api/admin/products/{id}/reassign
     * Body: { "category_id": 2 } و/أو { "brand_id": 3 }
     *
     * endpoint خفيف بس لتغيير الكاتيجوري/البراند - بيشتغل حتى على منتج محذوف (Soft Delete)
     * بدون ما نطلب باقي الحقول الإجبارية (زي main_image) اللي بيطلبها update() العادي.
     * هاي بالظبط الطريقة اللي الأدمن بيقدر فيها "ينقل" منتج كان مانع حذف تصنيف/براند.
     *
     * @response 200 {
     *   "success": true,
     *   "message": "Product updated successfully",
     *   "data": {
     *     "id": 5, "name": "Running Shoes", "description": "Comfortable running shoes",
     *     "price": 49.99, "quantity": 100,
     *     "main_image": "http://127.0.0.1:8000/uploads/products/main123.jpg",
     *     "additional_images": [],
     *     "category": { "id": 2, "name": "Sportswear", "description": null, "image": null, "status": true, "products": [], "created_at": "2026-07-20T10:00:00.000000Z", "updated_at": "2026-07-20T10:00:00.000000Z" },
     *     "brand": { "id": 1, "name": "Nike", "logo": null, "description": null, "status": true, "products": [], "created_at": "2026-07-20T10:00:00.000000Z", "updated_at": "2026-07-20T10:00:00.000000Z" },
     *     "status": true, "featured": false,
     *     "created_at": "2026-07-20T10:00:00.000000Z", "updated_at": "2026-07-20T10:15:00.000000Z"
     *   }
     * }
     */
    public function reassign(Request $request, int $id)
    {
        // withTrashed(): عشان يلاقي المنتج حتى لو محذوف Soft Delete
        $product = Product::withTrashed()->findOrFail($id);

        $data = $request->validate([
            'category_id' => ['sometimes', 'integer', 'exists:categories,id'],
            'brand_id' => ['sometimes', 'integer', 'exists:brands,id'],
        ]);

        $product->update($data);

        return response()->json([
            'success' => true,
            'message' => __('messages.product_updated'),
            'data' => new ProductResource($product->load(['category', 'brand'])),
        ]);
    }

    /**
     * Restore a trashed product
     *
     * POST /api/admin/products/{id}/restore
     * يرجّع منتج محذوف Soft Delete لحالته الطبيعية
     *
     * @response 200 {
     *   "success": true,
     *   "message": "Product restored successfully",
     *   "data": {
     *     "id": 5, "name": "Running Shoes", "description": "Comfortable running shoes",
     *     "price": 49.99, "quantity": 100,
     *     "main_image": "http://127.0.0.1:8000/uploads/products/main123.jpg",
     *     "additional_images": [],
     *     "category": { "id": 1, "name": "Shoes", "description": null, "image": null, "status": true, "products": [], "created_at": "2026-07-20T10:00:00.000000Z", "updated_at": "2026-07-20T10:00:00.000000Z" },
     *     "brand": { "id": 1, "name": "Nike", "logo": null, "description": null, "status": true, "products": [], "created_at": "2026-07-20T10:00:00.000000Z", "updated_at": "2026-07-20T10:00:00.000000Z" },
     *     "status": true, "featured": false,
     *     "created_at": "2026-07-20T10:00:00.000000Z", "updated_at": "2026-07-20T10:20:00.000000Z"
     *   }
     * }
     */
    public function restore(int $id)
    {
        $product = Product::onlyTrashed()->findOrFail($id);
        $product->restore();

        return response()->json([
            'success' => true,
            'message' => __('messages.product_restored'),
            'data' => new ProductResource($product->load(['category', 'brand'])),
        ]);
    }

    /**
     * Force-delete a product permanently
     *
     * DELETE /api/admin/products/{id}/force
     * حذف نهائي (مش Soft Delete) - بيمسح الصف فعلياً من الداتابيز + بيحذف صوره من التخزين.
     * هاي الطريقة التانية (البديلة عن reassign) اللي الأدمن بيقدر فيها يخلّص من منتج
     * كان مانع حذف تصنيف/براند - عن طريق حذفه نهائياً مش بس soft delete.
     *
     * @response 200 {
     *   "success": true,
     *   "message": "Product permanently deleted successfully"
     * }
     */
    public function forceDelete(int $id)
    {
        $product = Product::withTrashed()->findOrFail($id);

        $this->imageService->delete($product->main_image);
        foreach ((array) $product->additional_images as $path) {
            $this->imageService->delete($path);
        }

        $product->forceDelete();

        return response()->json([
            'success' => true,
            'message' => __('messages.product_force_deleted'),
        ]);
    }
}
