<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\BannerResource;
use App\Models\Banner;

class BannerController extends Controller
{
    public function index()
    {
        $banners = Banner::where('status', true)->latest()->get();

        return BannerResource::collection($banners);
    }
}
