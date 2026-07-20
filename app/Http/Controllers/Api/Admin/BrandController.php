<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Brand\StoreBrandRequest;
use App\Http\Requests\Admin\Brand\UpdateBrandRequest;
use App\Http\Resources\BrandResource;
use App\Models\Brand;
use App\Services\ImageUploadService;

// نفس منطق CategoryController بالظبط، بس على جدول brands (والحقل logo بدل image)
/**
 * @group Admin - Brands
 *
 * Full CRUD for brands. Deleting a brand that still has products (even soft-deleted
 * ones) is blocked with a 409 response listing the blocking products.
 * @authenticated
 */
class BrandController extends Controller
{
    public function __construct(protected ImageUploadService $imageService) {}

    /**
     * List brands
     */
    public function index()
    {
        $brands = Brand::latest()->paginate(15);

        return BrandResource::collection($brands);
    }

    /**
     * Create a brand
     *
     * @response 201 {
     *   "success": true,
     *   "message": "Brand created successfully",
     *   "data": {
     *     "id": 1, "name": "Nike", "logo": "http://127.0.0.1:8000/uploads/brands/abc123.jpg", "description": "Sportswear brand",
     *     "status": true, "products": [], "created_at": "2026-07-20T10:00:00.000000Z", "updated_at": "2026-07-20T10:00:00.000000Z"
     *   }
     * }
     * @response 422 scenario="Validation error" {
     *   "message": "The name field is required.",
     *   "errors": { "name": ["The name field is required."] }
     * }
     */
    public function store(StoreBrandRequest $request)
    {
        $data = $request->validated();
        $data['status'] = $request->boolean('status', true);

        if ($request->hasFile('logo')) {
            $data['logo'] = $this->imageService->store($request->file('logo'), 'brands');
        }

        $brand = Brand::create($data);

        return response()->json([
            'success' => true,
            'message' => __('messages.brand_created'),
            'data' => new BrandResource($brand),
        ], 201);
    }

    /**
     * Get a brand
     */
    public function show(Brand $brand)
    {
        return new BrandResource($brand);
    }

    /**
     * Update a brand
     *
     * @response 200 {
     *   "success": true,
     *   "message": "Brand updated successfully",
     *   "data": {
     *     "id": 1, "name": "Nike", "logo": "http://127.0.0.1:8000/uploads/brands/abc123.jpg", "description": "Sportswear brand",
     *     "status": true, "products": [], "created_at": "2026-07-20T10:00:00.000000Z", "updated_at": "2026-07-20T10:05:00.000000Z"
     *   }
     * }
     */
    public function update(UpdateBrandRequest $request, Brand $brand)
    {
        $data = $request->validated();

        if ($request->hasFile('logo')) {
            $data['logo'] = $this->imageService->replace($request->file('logo'), $brand->logo, 'brands');
        }

        $brand->update($data);

        return response()->json([
            'success' => true,
            'message' => __('messages.brand_updated'),
            'data' => new BrandResource($brand),
        ]);
    }

    /**
     * Delete a brand
     *
     * Returns 409 with a `blocking_products` list if the brand still has products.
     *
     * @response 200 {
     *   "success": true,
     *   "message": "Brand deleted successfully"
     * }
     * @response 409 scenario="Brand still has products" {
     *   "success": false,
     *   "message": "This brand cannot be deleted because it has associated products. Delete or reassign those products first.",
     *   "blocking_products": [
     *     { "id": 5, "name": "Running Shoes" }
     *   ]
     * }
     */
    public function destroy(Brand $brand)
    {
        // نفس منطق CategoryController::destroy - نتحقق قبل الحذف بدل ما نخلي MySQL يرمي خطأ خام
        // withTrashed(): منتج محذوف Soft Delete لسا موجود فعلياً بالجدول ولسا بيمنع الحذف على مستوى MySQL
        $blockingProducts = $brand->products()->withTrashed()->get(['id', 'name_ar', 'name_en']);

        if ($blockingProducts->isNotEmpty()) {
            return response()->json([
                'success' => false,
                'message' => __('messages.brand_has_products'),
                'blocking_products' => $blockingProducts->map(fn ($p) => [
                    'id' => $p->id,
                    'name' => trans_field($p, 'name'),
                ]),
            ], 409);
        }

        $this->imageService->delete($brand->logo);
        $brand->delete();

        return response()->json([
            'success' => true,
            'message' => __('messages.brand_deleted'),
        ]);
    }
}
