<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\GalleryImageResource;
use App\Models\GalleryImage;

/**
 * @group Public - Gallery
 *
 * Open endpoint, no login required.
 */
class GalleryController extends Controller
{
    /**
     * List active gallery images
     *
     * GET /api/gallery
     */
    public function index()
    {
        $images = GalleryImage::where('status', true)->orderBy('sort_order')->get();

        return GalleryImageResource::collection($images);
    }
}
