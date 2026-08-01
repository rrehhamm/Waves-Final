<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\CategoryResource;
use App\Models\Category;

class CategoryController extends Controller
{
    public function index()
    {
        $categories = Category::where('status', true)->latest()->paginate(15);

        return CategoryResource::collection($categories);
    }

    public function show(int $id)
    {
        $category = Category::where('status', true)->findOrFail($id);

        $category->load(['products' => fn ($q) => $q->where('status', true)->with('brand')]);

        return new CategoryResource($category);
    }
}
