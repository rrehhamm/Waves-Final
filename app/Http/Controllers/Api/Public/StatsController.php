<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use App\Models\Product;
use App\Models\User;

/**
 * @group Public - General
 *
 * Lightweight public counters for the storefront home page hero
 * (replaces the old hardcoded "200+ Brands / 2,000+ Products / 30k+ Customers" numbers).
 */
class StatsController extends Controller
{
    /**
     * Site-wide public stats
     *
     * GET /api/stats
     * فقط أرقام عامة غير حساسة (عدد المنتجات/البراندات/الزبائن) - ما فيها أي بيانات شخصية
     */
    public function index()
    {
        return response()->json([
            'success' => true,
            'data' => [
                'products_count' => Product::where('status', true)->count(),
                'brands_count' => Brand::where('status', true)->count(),
                // كل يوزر مسجل = زبون حقيقي (مش تخمين ثابت زي "30k+" يلي كان بالكود قبل هيك)
                'customers_count' => User::count(),
            ],
        ]);
    }
}
