<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Brand\StoreBrandRequest;
use App\Http\Requests\Admin\Brand\UpdateBrandRequest;
use App\Http\Resources\BrandResource;
use App\Models\Brand;
use App\Services\ImageUploadService;

class BrandController extends Controller
{
    public function __construct(protected ImageUploadService $imageService) {}

    public function index()
    {
        $brands = Brand::latest()->paginate(15);

        return BrandResource::collection($brands);
    }

    public function store(StoreBrandRequest $request)
    {
        $data = $request->validated();
        $data['status'] = $request->boolean('status', true);
        $data['featured'] = $request->boolean('featured', false);

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

    public function show(Brand $brand)
    {
        return new BrandResource($brand);
    }

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

    public function destroy(Brand $brand)
    {
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
