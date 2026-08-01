<?php

use App\Http\Controllers\Api\Admin\AuthController as AdminAuthController;
use App\Http\Controllers\Api\Admin\BannerController;
use App\Http\Controllers\Api\Admin\BrandController;
use App\Http\Controllers\Api\Admin\CategoryController;
use App\Http\Controllers\Api\Admin\ContactMessageController;
use App\Http\Controllers\Api\Admin\DashboardController;
use App\Http\Controllers\Api\Admin\GalleryController;
use App\Http\Controllers\Api\Admin\HeroSectionController as AdminHeroSectionController;
use App\Http\Controllers\Api\Admin\OrderController;
use App\Http\Controllers\Api\Admin\ProductController;
use App\Http\Controllers\Api\Admin\SiteSettingController as AdminSiteSettingController;
use App\Http\Controllers\Api\Public\AuthController as PublicAuthController;
use App\Http\Controllers\Api\Public\BannerController as PublicBannerController;
use App\Http\Controllers\Api\Public\BrandController as PublicBrandController;
use App\Http\Controllers\Api\Public\CategoryController as PublicCategoryController;
use App\Http\Controllers\Api\Public\ContactController as PublicContactController;
use App\Http\Controllers\Api\Public\GalleryController as PublicGalleryController;
use App\Http\Controllers\Api\Public\HeroSectionController as PublicHeroSectionController;
use App\Http\Controllers\Api\Public\OrderController as PublicOrderController;
use App\Http\Controllers\Api\Public\ProductController as PublicProductController;
use App\Http\Controllers\Api\Public\SiteSettingController as PublicSiteSettingController;
use App\Http\Controllers\Api\Public\StatsController;
use Illuminate\Support\Facades\Route;


Route::prefix('admin')->group(function () {

    Route::post('login', [AdminAuthController::class, 'login']);

    Route::middleware('auth:admin')->group(function () {
        Route::post('logout', [AdminAuthController::class, 'logout']);
        Route::get('me', [AdminAuthController::class, 'me']);

        Route::get('dashboard', [DashboardController::class, 'index']);

        Route::apiResource('categories', CategoryController::class);
        Route::apiResource('brands', BrandController::class);

        Route::get('products/trashed', [ProductController::class, 'trashed']);
        Route::patch('products/{id}/reassign', [ProductController::class, 'reassign']);
        Route::post('products/{id}/restore', [ProductController::class, 'restore']);
        Route::delete('products/{id}/force', [ProductController::class, 'forceDelete']);
        Route::apiResource('products', ProductController::class);

        Route::apiResource('banners', BannerController::class);
        Route::patch('banners/{banner}/toggle-status', [BannerController::class, 'toggleStatus']);

        Route::get('hero', [AdminHeroSectionController::class, 'show']);
        Route::post('hero', [AdminHeroSectionController::class, 'update']);

        Route::get('settings', [AdminSiteSettingController::class, 'show']);
        Route::post('settings', [AdminSiteSettingController::class, 'update']);

        Route::get('gallery', [GalleryController::class, 'index']);
        Route::post('gallery', [GalleryController::class, 'store']);
        Route::post('gallery/sort', [GalleryController::class, 'sort']);
        Route::put('gallery/{galleryImage}', [GalleryController::class, 'update']);
        Route::delete('gallery/{galleryImage}', [GalleryController::class, 'destroy']);
        Route::patch('gallery/{galleryImage}/toggle-status', [GalleryController::class, 'toggleStatus']);

        Route::get('contact-messages', [ContactMessageController::class, 'index']);
        Route::get('contact-messages/{contactMessage}', [ContactMessageController::class, 'show']);
        Route::patch('contact-messages/{contactMessage}/mark-as-read', [ContactMessageController::class, 'markAsRead']);
        Route::delete('contact-messages/{contactMessage}', [ContactMessageController::class, 'destroy']);

        Route::get('orders/trashed', [OrderController::class, 'trashed']);
        Route::post('orders/{id}/restore', [OrderController::class, 'restore']);
        Route::delete('orders/{id}/force', [OrderController::class, 'forceDelete']);
        Route::get('orders', [OrderController::class, 'index']);
        Route::get('orders/{order}', [OrderController::class, 'show']);
        Route::patch('orders/{order}/status', [OrderController::class, 'updateStatus']);
        Route::delete('orders/{order}', [OrderController::class, 'destroy']);
    });
});


Route::get('banners', [PublicBannerController::class, 'index']);

Route::get('hero', [PublicHeroSectionController::class, 'show']);

Route::get('settings', [PublicSiteSettingController::class, 'show']);

Route::get('categories', [PublicCategoryController::class, 'index']);
Route::get('categories/{id}', [PublicCategoryController::class, 'show']);

Route::get('brands', [PublicBrandController::class, 'index']);
Route::get('brands/{id}', [PublicBrandController::class, 'show']);

Route::get('products/search', [PublicProductController::class, 'search']);
Route::get('products', [PublicProductController::class, 'index']);
Route::get('products/{id}', [PublicProductController::class, 'show']);

Route::get('gallery', [PublicGalleryController::class, 'index']);

Route::post('contact-us', [PublicContactController::class, 'store']);

Route::get('stats', [StatsController::class, 'index']);

Route::post('register', [PublicAuthController::class, 'register']);
Route::post('login', [PublicAuthController::class, 'login']);

Route::middleware('auth:user')->group(function () {
    Route::post('logout', [PublicAuthController::class, 'logout']);
    Route::get('me', [PublicAuthController::class, 'me']);
    Route::post('profile', [PublicAuthController::class, 'updateProfile']);
    Route::get('my-orders', [PublicOrderController::class, 'myOrders']);
    Route::post('orders', [PublicOrderController::class, 'store']);
});
