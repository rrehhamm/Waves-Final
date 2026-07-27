<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\HeroSectionResource;
use App\Models\HeroSection;

/**
 * @group Public - Hero Section
 *
 * Open endpoint, no login required - powers the home page's top hero section.
 */
class HeroSectionController extends Controller
{
    /**
     * Get the hero section
     *
     * GET /api/hero
     */
    public function show()
    {
        $hero = HeroSection::first();

        // No admin has ever visited /admin/hero yet (so no row was auto-created there) -
        // return sensible defaults instead of a 404, so the storefront never shows a blank hero
        if (! $hero) {
            $hero = new HeroSection([
                'badge_text' => 'New Collection 2026',
                'heading' => 'Find What Matches Your Style',
                'subtext' => 'Browse through our diverse range of meticulously crafted footwear, designed to elevate your everyday outfit with signature elegance.',
                'button1_text' => 'Shop Collection',
                'button1_link' => '/products',
                'button2_text' => 'Explore Categories',
                'button2_link' => '/categories',
                'background_image' => null,
            ]);
        }

        return new HeroSectionResource($hero);
    }
}
