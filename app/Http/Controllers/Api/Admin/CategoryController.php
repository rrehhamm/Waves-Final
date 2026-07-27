<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Category\StoreCategoryRequest;
use App\Http\Requests\Admin\Category\UpdateCategoryRequest;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use App\Services\ImageUploadService;

/**
 * @group Admin - Categories
 *
 * Full CRUD for product categories. Deleting a category that still has products
 * (even soft-deleted ones) is blocked with a 409 response listing the blocking products.
 * @authenticated
 */
class CategoryController extends Controller
{
    // Dependency Injection: Laravel بيعمل instance من ImageUploadService تلقائياً
    // ويمررها هون، مش لازم نعمل "new ImageUploadService()" يدوي
    public function __construct(protected ImageUploadService $imageService) {}

    /**
     * List categories
     *
     * GET /api/admin/categories
     */
    public function index()
    {
        // paginate(15): بيرجع 15 صف بالصفحة + معلومات pagination (current_page, last_page, total...)
        // متطلب رقم 11: "Pagination (for large data)"
        $categories = Category::latest()->paginate(15);

        return CategoryResource::collection($categories);
    }

    /**
     * Create a category
     *
     * POST /api/admin/categories
     * StoreCategoryRequest: الفحص (validation) بيصير تلقائياً قبل ما توصل هون
     *
     * @response 201 {
     *   "success": true,
     *   "message": "Category created successfully",
     *   "data": {
     *     "id": 1, "name": "Shoes", "description": "All kinds of shoes", "image": "http://127.0.0.1:8000/uploads/categories/abc123.jpg",
     *     "status": true, "products": [], "created_at": "2026-07-20T10:00:00.000000Z", "updated_at": "2026-07-20T10:00:00.000000Z"
     *   }
     * }
     * @response 422 scenario="Validation error" {
     *   "message": "The name ar field is required.",
     *   "errors": { "name_ar": ["The name ar field is required."] }
     * }
     */
    public function store(StoreCategoryRequest $request)
    {
        $data = $request->validated(); // بس الحقول اللي عدّت الفحص

        // لو الأدمن ما بعتش status أصلاً، منحطها true افتراضياً بشكل صريح
        // (بدل ما نعتمد على الـ default بالداتابيز، عشان الـ response يرجع القيمة الصح فوراً)
        $data['status'] = $request->boolean('status', true);
        // featured: افتراضياً false - الأدمن لازم يفعّلها يدوياً عشان التصنيف يظهر بالصفحة الرئيسية
        $data['featured'] = $request->boolean('featured', false);

        if ($request->hasFile('image')) {
            $data['image'] = $this->imageService->store($request->file('image'), 'categories');
        }

        $category = Category::create($data);

        return response()->json([
            'success' => true,
            'message' => __('messages.category_created'),
            'data' => new CategoryResource($category),
        ], 201); // 201 = Created
    }

    /**
     * Get a category
     *
     * GET /api/admin/categories/{category}
     * Route Model Binding: Laravel بياخد الـ id من الرابط ويجيب الـ Category تلقائياً
     * (لو مش موجودة، بيرجع 404 لحاله بدون ما نكتب كود إضافي)
     */
    public function show(Category $category)
    {
        return new CategoryResource($category);
    }

    /**
     * Update a category
     *
     * PUT/PATCH /api/admin/categories/{category}
     *
     * @response 200 {
     *   "success": true,
     *   "message": "Category updated successfully",
     *   "data": {
     *     "id": 1, "name": "Shoes", "description": "All kinds of shoes", "image": "http://127.0.0.1:8000/uploads/categories/abc123.jpg",
     *     "status": true, "products": [], "created_at": "2026-07-20T10:00:00.000000Z", "updated_at": "2026-07-20T10:05:00.000000Z"
     *   }
     * }
     */
    public function update(UpdateCategoryRequest $request, Category $category)
    {
        $data = $request->validated();

        if ($request->hasFile('image')) {
            // replace(): بيحذف الصورة القديمة تلقائياً ويرفع الجديدة (متطلب رقم 12)
            $data['image'] = $this->imageService->replace($request->file('image'), $category->image, 'categories');
        }

        $category->update($data);

        return response()->json([
            'success' => true,
            'message' => __('messages.category_updated'),
            'data' => new CategoryResource($category),
        ]);
    }

    /**
     * Delete a category
     *
     * DELETE /api/admin/categories/{category}
     * Returns 409 with a `blocking_products` list if the category still has products.
     *
     * @response 200 {
     *   "success": true,
     *   "message": "Category deleted successfully"
     * }
     * @response 409 scenario="Category still has products" {
     *   "success": false,
     *   "message": "This category cannot be deleted because it has associated products. Delete or reassign those products first.",
     *   "blocking_products": [
     *     { "id": 5, "name": "Running Shoes" },
     *     { "id": 9, "name": "Sport Jacket" }
     *   ]
     * }
     */
    public function destroy(Category $category)
    {
        // عمود category_id بجدول products معمول عليه restrictOnDelete() (شوف migration المنتجات)
        // يعني MySQL نفسه بيرفض الحذف لو في منتجات مرتبطة، وبيطلع QueryException خام.
        // هون منتحقق إحنا قبل ما نوصل لهاد الخطأ، ونرجع رسالة واضحة بدل خطأ SQL تقني
        //
        // withTrashed() مهم هون: المنتج المحذوف Soft Delete لسا موجود فعلياً بالجدول
        // (بس deleted_at معبى)، فلسا بيمنع الحذف على مستوى MySQL FK - لازم نفحصه هو كمان
        $blockingProducts = $category->products()->withTrashed()->get(['id', 'name_ar', 'name_en']);

        if ($blockingProducts->isNotEmpty()) {
            return response()->json([
                'success' => false,
                'message' => __('messages.category_has_products'),
                // منرجع قائمة المنتجات نفسها عشان الأدمن يعرف بالظبط شو لازم يحذف/ينقل قبل ما يقدر يحذف التصنيف
                'blocking_products' => $blockingProducts->map(fn ($p) => [
                    'id' => $p->id,
                    'name' => trans_field($p, 'name'),
                ]),
            ], 409); // 409 Conflict: الطلب متعارض مع حالة البيانات الحالية
        }

        $this->imageService->delete($category->image);
        $category->delete();

        return response()->json([
            'success' => true,
            'message' => __('messages.category_deleted'),
        ]);
    }
}
