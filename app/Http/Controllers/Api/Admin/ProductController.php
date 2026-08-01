<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Product\StoreProductRequest;
use App\Http\Requests\Admin\Product\UpdateProductRequest;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Services\ImageUploadService;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function __construct(protected ImageUploadService $imageService) {}

    public function index(Request $request)
    {
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

    public function store(StoreProductRequest $request)
    {
        $data = $request->validated();
        $data['status'] = $request->boolean('status', true);
        $data['featured'] = $request->boolean('featured', false);

        if ($request->boolean('sizes_submitted')) {
            $data['sizes'] = $data['sizes'] ?? [];
        }

        if ($request->boolean('colors_submitted')) {
            $data['colors'] = $data['colors'] ?? [];
        }

        $data['main_image'] = $this->imageService->store($request->file('main_image'), 'products');

        if ($request->hasFile('additional_images')) {
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

    public function show(Product $product)
    {
        return new ProductResource($product->load(['category', 'brand']));
    }

    public function update(UpdateProductRequest $request, Product $product)
    {
        $data = $request->validated();

        if ($request->boolean('sizes_submitted')) {
            $data['sizes'] = $data['sizes'] ?? [];
        }

        if ($request->boolean('colors_submitted')) {
            $data['colors'] = $data['colors'] ?? [];
        }

        if ($request->hasFile('main_image')) {
            $data['main_image'] = $this->imageService->replace($request->file('main_image'), $product->main_image, 'products');
        }

        if ($request->hasFile('additional_images')) {
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

    public function destroy(Product $product)
    {
        $product->delete();

        return response()->json([
            'success' => true,
            'message' => __('messages.product_deleted'),
        ]);
    }

    public function trashed()
    {
        $products = Product::onlyTrashed()->with(['category', 'brand'])->latest()->paginate(15);

        return ProductResource::collection($products);
    }

    public function reassign(Request $request, int $id)
    {
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
