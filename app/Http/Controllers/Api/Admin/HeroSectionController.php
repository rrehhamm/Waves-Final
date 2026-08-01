<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Hero\UpdateHeroSectionRequest;
use App\Http\Resources\HeroSectionResource;
use App\Models\HeroSection;
use App\Services\ImageUploadService;

class HeroSectionController extends Controller
{
    public function __construct(protected ImageUploadService $imageService) {}

    public function show()
    {
        $hero = $this->firstOrDefault();

        return new HeroSectionResource($hero);
    }

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
