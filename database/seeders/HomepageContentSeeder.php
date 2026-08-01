<?php

namespace Database\Seeders;

use App\Models\Banner;
use App\Models\Brand;
use App\Models\Category;
use App\Models\HeroSection;
use Illuminate\Database\Seeder;

class HomepageContentSeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            [
                'name_en' => 'Sports Shoes',
                'name_ar' => 'أحذية رياضية',
                'description' => 'Performance sneakers for running, training, and everyday sport.',
                'image' => 'categories/sports-shoes.jpg',
            ],
            [
                'name_en' => "Men's Shoes",
                'name_ar' => 'أحذية رجالية',
                'description' => 'Classic and modern footwear styles for men.',
                'image' => 'categories/mens-shoes.jpg',
            ],
            [
                'name_en' => 'High Heels',
                'name_ar' => 'كعب عالي',
                'description' => 'Elegant high heels for every occasion.',
                'image' => 'categories/high-heels.jpg',
            ],
            [
                'name_en' => 'Kids Shoes',
                'name_ar' => 'أحذية أطفال',
                'description' => 'Comfortable and durable shoes for kids.',
                'image' => 'categories/kids-shoes.jpg',
            ],
        ];

        foreach ($categories as $data) {
            Category::updateOrCreate(
                ['name_en' => $data['name_en']],
                [
                    'name_ar' => $data['name_ar'],
                    'description' => $data['description'],
                    'image' => $data['image'],
                    'status' => true,
                    'featured' => true,
                ]
            );
        }

        $brands = [
            [
                'name' => 'Nike',
                'description' => 'Premium athletic footwear & sportswear.',
                'logo' => 'brands/nike-shoe.jpg',
            ],
            [
                'name' => 'Adidas',
                'description' => 'Iconic streetwear & performance gear.',
                'logo' => 'brands/adidas-shoe.jpg',
            ],
            [
                'name' => 'Puma',
                'description' => 'Sleek sportstyle sneakers & apparel.',
                'logo' => 'brands/puma-shoe.jpg',
            ],
            [
                'name' => 'Prada',
                'description' => 'High-fashion footwear design.',
                'logo' => 'brands/prada-shoe.jpg',
            ],
        ];

        foreach ($brands as $data) {
            Brand::updateOrCreate(
                ['name' => $data['name']],
                [
                    'description' => $data['description'],
                    'logo' => $data['logo'],
                    'status' => true,
                    'featured' => true,
                ]
            );
        }

        Banner::where('title', 'New Collection 2026')
            ->where('image', 'banners/banner-bg.jpg')
            ->delete();

        HeroSection::updateOrCreate(
            ['id' => 1],
            [
                'badge_text' => 'New Collection 2026',
                'heading' => 'Find What Matches Your Style',
                'subtext' => 'Browse through our diverse range of meticulously crafted footwear, designed to elevate your everyday outfit with signature elegance.',
                'button1_text' => 'Shop Collection',
                'button1_link' => '/products',
                'button2_text' => 'Explore Categories',
                'button2_link' => '/categories',
                'background_image' => 'hero/banner-bg.jpg',
            ]
        );

        $banners = [
            [
                'title' => 'New Season Styles',
                'tag' => 'Trending Now',
                'description' => 'UP TO 40% OFF',
                'image' => 'banners/promo-1.jpg',
            ],
            [
                'title' => 'Everyday Essentials',
                'tag' => 'Best Sellers',
                'description' => 'FLAT 20% OFF',
                'image' => 'banners/promo-2.jpg',
            ],
        ];

        foreach ($banners as $data) {
            Banner::updateOrCreate(
                ['title' => $data['title']],
                [
                    'tag' => $data['tag'],
                    'description' => $data['description'],
                    'image' => $data['image'],
                    'status' => true,
                ]
            );
        }
    }
}
