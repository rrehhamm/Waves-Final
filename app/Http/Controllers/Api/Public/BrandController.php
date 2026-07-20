<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\BrandResource;
use App\Models\Brand;

/**
 * @group Public - Brands
 *
 * Open endpoints, no login required.
 */
class BrandController extends Controller
{
    /**
     * List active brands
     */
    public function index()
    {
        $brands = Brand::where('status', true)->latest()->paginate(15);

        return BrandResource::collection($brands);
    }

    /**
     * Get a brand with its products
     *
     * GET /api/brands/{id} -> with products
     */
    public function show(int $id)
    {
        $brand = Brand::where('status', true)->findOrFail($id);

        $brand->load(['products' => fn ($q) => $q->where('status', true)->with('category')]);

        return new BrandResource($brand);
    }
}
