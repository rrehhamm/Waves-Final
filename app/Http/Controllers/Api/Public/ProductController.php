<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index()
    {
        $products = Product::where('status', true)
            ->with(['category', 'brand'])
            ->latest()
            ->paginate(15);

        return ProductResource::collection($products);
    }

    public function show(int $id)
    {
        $product = Product::where('status', true)
            ->with(['category', 'brand'])
            ->findOrFail($id);

        return new ProductResource($product);
    }

    public function search(Request $request)
    {
        $validated = $request->validate([
            'search' => ['nullable', 'string', 'max:255'],
            'category' => ['nullable', 'integer'],
            'brand' => ['nullable', 'integer'],
            'min_price' => ['nullable', 'numeric', 'min:0'],
            'max_price' => ['nullable', 'numeric', 'min:0'],
            'sort' => ['nullable', 'string', 'in:latest,price_low,price_high'],
        ]);

        $query = Product::where('status', true)->with(['category', 'brand']);

        $search = trim((string) ($validated['search'] ?? ''));

        if ($search !== '') {
            $term = '%'.$search.'%';
            $query->where(function ($q) use ($term) {
                $q->where('name_ar', 'like', $term)
                    ->orWhere('name_en', 'like', $term)
                    ->orWhere('description_ar', 'like', $term)
                    ->orWhere('description_en', 'like', $term)
                    ->orWhereHas('brand', function ($b) use ($term) {
                        $b->where('name', 'like', $term);
                    })
                    ->orWhereHas('category', function ($c) use ($term) {
                        $c->where('name_ar', 'like', $term)
                            ->orWhere('name_en', 'like', $term);
                    });
            });
        }

        if (! empty($validated['category'])) {
            $query->where('category_id', $validated['category']);
        }

        if (! empty($validated['brand'])) {
            $query->where('brand_id', $validated['brand']);
        }

        if (isset($validated['min_price'])) {
            $query->where('price', '>=', $validated['min_price']);
        }

        if (isset($validated['max_price'])) {
            $query->where('price', '<=', $validated['max_price']);
        }

        match ($validated['sort'] ?? 'latest') {
            'price_low' => $query->orderBy('price', 'asc'),
            'price_high' => $query->orderBy('price', 'desc'),
            default => $query->latest(),
        };

        $products = $query->paginate(15)->withQueryString();

        return ProductResource::collection($products);
    }
}
