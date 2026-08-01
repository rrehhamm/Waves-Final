<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\HeroSectionResource;
use App\Models\HeroSection;

class HeroSectionController extends Controller
{
    public function show()
    {
        $hero = HeroSection::first();

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
