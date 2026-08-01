<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Category\StoreCategoryRequest;
use App\Http\Requests\Admin\Category\UpdateCategoryRequest;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use App\Services\ImageUploadService;

class CategoryController extends Controller
{
    public function __construct(protected ImageUploadService $imageService) {}

    public function index()
    {
        $categories = Category::latest()->paginate(15);

        return CategoryResource::collection($categories);
    }

    public function store(StoreCategoryRequest $request)
    {
        $data = $request->validated();

        $data['status'] = $request->boolean('status', true);
        $data['featured'] = $request->boolean('featured', false);

        if ($request->hasFile('image')) {
            $data['image'] = $this->imageService->store($request->file('image'), 'categories');
        }

        $category = Category::create($data);

        return response()->json([
            'success' => true,
            'message' => __('messages.category_created'),
            'data' => new CategoryResource($category),
        ], 201);
    }

    public function show(Category $category)
    {
        return new CategoryResource($category);
    }

    public function update(UpdateCategoryRequest $request, Category $category)
    {
        $data = $request->validated();

        if ($request->hasFile('image')) {
            $data['image'] = $this->imageService->replace($request->file('image'), $category->image, 'categories');
        }

        $category->update($data);

        return response()->json([
            'success' => true,
            'message' => __('messages.category_updated'),
            'data' => new CategoryResource($category),
        ]);
    }

    public function destroy(Category $category)
    {
        $blockingProducts = $category->products()->withTrashed()->get(['id', 'name_ar', 'name_en']);

        if ($blockingProducts->isNotEmpty()) {
            return response()->json([
                'success' => false,
                'message' => __('messages.category_has_products'),
                'blocking_products' => $blockingProducts->map(fn ($p) => [
                    'id' => $p->id,
                    'name' => trans_field($p, 'name'),
                ]),
            ], 409);
        }

        $this->imageService->delete($category->image);
        $category->delete();

        return response()->json([
            'success' => true,
            'message' => __('messages.category_deleted'),
        ]);
    }
}
