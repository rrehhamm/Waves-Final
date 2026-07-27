<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Hero\UpdateHeroSectionRequest;
use App\Http\Resources\HeroSectionResource;
use App\Models\HeroSection;
use App\Services\ImageUploadService;

/**
 * @group Admin - Hero Section
 *
 * The big top section on the storefront home page (background, badge, heading, paragraph,
 * and the two CTA buttons) - a singleton, there is always exactly one row (id=1).
 * Separate from Banners (the smaller promo slider next to it - see Admin\BannerController).
 * @authenticated
 */
class HeroSectionController extends Controller
{
    public function __construct(protected ImageUploadService $imageService) {}

    /**
     * Get the hero section
     *
     * GET /api/admin/hero
     * firstOrCreate: أول مرة ما يكون في صف أصلاً، بينشئ وحدة بقيم افتراضية مطابقة
     * للنص يلي كان ثابت (hardcoded) قبل هيك بـ Home.jsx - هيك ما في شاشة فاضية بالأدمن.
     *
     * @response 200 {
     *   "success": true,
     *   "data": {
     *     "id": 1, "badge_text": "New Collection 2026", "heading": "Find What Matches Your Style",
     *     "subtext": "Browse through our diverse range of meticulously crafted footwear...",
     *     "button1_text": "Shop Collection", "button1_link": "/products",
     *     "button2_text": "Explore Categories", "button2_link": "/categories",
     *     "background_image": "http://127.0.0.1:8000/uploads/hero/banner-bg.jpg",
     *     "updated_at": "2026-07-25T10:00:00.000000Z"
     *   }
     * }
     */
    public function show()
    {
        $hero = $this->firstOrDefault();

        return new HeroSectionResource($hero);
    }

    /**
     * Update the hero section
     *
     * POST /api/admin/hero (multipart/form-data if uploading a new background_image)
     *
     * @response 200 {
     *   "success": true,
     *   "message": "Hero section updated successfully",
     *   "data": {
     *     "id": 1, "badge_text": "New Collection 2026", "heading": "Find What Matches Your Style",
     *     "subtext": "Browse through our diverse range of meticulously crafted footwear...",
     *     "button1_text": "Shop Collection", "button1_link": "/products",
     *     "button2_text": "Explore Categories", "button2_link": "/categories",
     *     "background_image": "http://127.0.0.1:8000/uploads/hero/banner-bg.jpg",
     *     "updated_at": "2026-07-25T10:05:00.000000Z"
     *   }
     * }
     */
    public function update(UpdateHeroSectionRequest $request)
    {
        $hero = $this->firstOrDefault();
        $data = $request->validated();

        if ($request->hasFile('background_image')) {
            $data['background_image'] = $this->imageService->replace(
                $request->file('background_image'),
                $hero->background_image,
                'hero'
            );
        }

        $hero->update($data);

        return response()->json([
            'success' => true,
            'message' => __('messages.hero_updated'),
            'data' => new HeroSectionResource($hero),
        ]);
    }

    /**
     * بيرجع الصف الوحيد (id=1)، وبينشئه بقيم افتراضية أول مرة إذا مش موجود
     */
    private function firstOrDefault(): HeroSection
    {
        return HeroSection::firstOrCreate(
            ['id' => 1],
            [
                'badge_text' => 'New Collection 2026',
                'heading' => 'Find What Matches Your Style',
                'subtext' => 'Browse through our diverse range of meticulously crafted footwear, designed to elevate your everyday outfit with signature elegance.',
                'button1_text' => 'Shop Collection',
                'button1_link' => '/products',
                'button2_text' => 'Explore Categories',
                'button2_link' => '/categories',
                'background_image' => null,
            ]
        );
    }
}
