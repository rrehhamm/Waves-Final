<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use App\Models\Product;
use App\Models\User;

class StatsController extends Controller
{
    public function index()
    {
        return response()->json([
            'success' => true,
            'data' => [
                'products_count' => Product::where('status', true)->count(),
                'brands_count' => Brand::where('status', true)->count(),
                'customers_count' => User::count(),
            ],
        ]);
    }
}
