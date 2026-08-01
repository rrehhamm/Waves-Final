<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\BrandResource;
use App\Models\Brand;

class BrandController extends Controller
{
    public function index()
    {
        $brands = Brand::where('status', true)->latest()->paginate(15);

        return BrandResource::collection($brands);
    }

    public function show(int $id)
    {
        $brand = Brand::where('status', true)->findOrFail($id);

        $brand->load(['products' => fn ($q) => $q->where('status', true)->with('category')]);

        return new BrandResource($brand);
    }
}
