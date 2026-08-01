<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\GalleryImageResource;
use App\Models\GalleryImage;

class GalleryController extends Controller
{
    public function index()
    {
        $images = GalleryImage::where('status', true)->orderBy('sort_order')->get();

        return GalleryImageResource::collection($images);
    }
}
