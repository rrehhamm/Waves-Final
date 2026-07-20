<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Http\Request;

/**
 * @group Public - Products
 *
 * Open endpoints, no login required.
 */
class ProductController extends Controller
{
    /**
     * List active products
     *
     * GET /api/products
     */
    public function index()
    {
        $products = Product::where('status', true)
            ->with(['category', 'brand'])
            ->latest()
            ->paginate(15);

        return ProductResource::collection($products);
    }

    /**
     * Get a product
     *
     * GET /api/products/{id}
     */
    public function show(int $id)
    {
        $product = Product::where('status', true)
            ->with(['category', 'brand'])
            ->findOrFail($id);

        return new ProductResource($product);
    }

    /**
     * Search / filter products
     *
     * GET /api/products/search?search=...&category=...&brand=...&min_price=...&max_price=...
     * (متطلب رقم 10: GET /products/search filters: category, brand, price)
     */
    public function search(Request $request)
    {
        $query = Product::where('status', true)->with(['category', 'brand']);

        // filled(): بيتحقق إن القيمة موجودة ومش فاضية (أدق من has())
        if ($request->filled('search')) {
            $search = $request->query('search');
            $query->where(function ($q) use ($search) {
                $q->where('name_ar', 'like', "%{$search}%")
                    ->orWhere('name_en', 'like', "%{$search}%");
            });
        }

        if ($request->filled('category')) {
            $query->where('category_id', $request->query('category'));
        }

        if ($request->filled('brand')) {
            $query->where('brand_id', $request->query('brand'));
        }

        if ($request->filled('min_price')) {
            $query->where('price', '>=', $request->query('min_price'));
        }

        if ($request->filled('max_price')) {
            $query->where('price', '<=', $request->query('max_price'));
        }

        $products = $query->latest()->paginate(15);

        return ProductResource::collection($products);
    }
}
