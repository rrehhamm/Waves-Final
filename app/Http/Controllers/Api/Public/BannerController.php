<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\BannerResource;
use App\Models\Banner;

/**
 * @group Public - Banners
 *
 * Open endpoints, no login required.
 */
class BannerController extends Controller
{
    /**
     * List active banners
     *
     * GET /api/banners
     * بيرجع البانرات المفعّلة (active) بس - الزوار ما لازم يشوفوا المخفية
     */
    public function index()
    {
        $banners = Banner::where('status', true)->latest()->get();

        return BannerResource::collection($banners);
    }
}
