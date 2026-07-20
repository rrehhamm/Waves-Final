<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\CategoryResource;
use App\Models\Category;

/**
 * @group Public - Categories
 *
 * Open endpoints, no login required.
 */
class CategoryController extends Controller
{
    /**
     * List active categories
     *
     * GET /api/categories
     */
    public function index()
    {
        $categories = Category::where('status', true)->latest()->paginate(15);

        return CategoryResource::collection($categories);
    }

    /**
     * Get a category with its products
     *
     * GET /api/categories/{id} -> with products
     */
    public function show(int $id)
    {
        // بندور بس بين الكاتيجوريز المفعّلة (findOrFail: لو مش موجودة بيرجع 404 تلقائياً)
        $category = Category::where('status', true)->findOrFail($id);

        // نحمّل بس المنتجات المفعّلة التابعة لهاد الكاتيجوري
        $category->load(['products' => fn ($q) => $q->where('status', true)->with('brand')]);

        return new CategoryResource($category);
    }
}
