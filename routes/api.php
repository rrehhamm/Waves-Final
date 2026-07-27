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
use App\Http\Controllers\Api\Public\AuthController as PublicAuthController;
use App\Http\Controllers\Api\Public\BannerController as PublicBannerController;
use App\Http\Controllers\Api\Public\BrandController as PublicBrandController;
use App\Http\Controllers\Api\Public\CategoryController as PublicCategoryController;
use App\Http\Controllers\Api\Public\ContactController as PublicContactController;
use App\Http\Controllers\Api\Public\GalleryController as PublicGalleryController;
use App\Http\Controllers\Api\Public\HeroSectionController as PublicHeroSectionController;
use App\Http\Controllers\Api\Public\OrderController as PublicOrderController;
use App\Http\Controllers\Api\Public\ProductController as PublicProductController;
use App\Http\Controllers\Api\Public\StatsController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
| كل مسار بهاد الملف بينحط تلقائياً تحت prefix "/api"
*/

// ===================== Admin =====================
Route::prefix('admin')->group(function () {

    // مسار مفتوح - بيولّد التوكن
    Route::post('login', [AdminAuthController::class, 'login']);

    // كل اللي جوا هاد الـ group محمي بـ auth:admin (لازم Bearer token صحيح)
    Route::middleware('auth:admin')->group(function () {
        Route::post('logout', [AdminAuthController::class, 'logout']);
        Route::get('me', [AdminAuthController::class, 'me']);

        // إحصائيات الداشبورد
        Route::get('dashboard', [DashboardController::class, 'index']);

        // apiResource(): بيعمل تلقائياً 5 مسارات CRUD قياسية:
        // GET /categories          -> index
        // POST /categories         -> store
        // GET /categories/{id}     -> show
        // PUT|PATCH /categories/{id} -> update
        // DELETE /categories/{id}  -> destroy
        Route::apiResource('categories', CategoryController::class);
        Route::apiResource('brands', BrandController::class);

        // مسارات المنتجات المحذوفة (Soft Delete) - لازم تنكتب قبل apiResource('products', ...)
        // وإلا "trashed" رح تتفسّر كـ {product} (نفس مشكلة gallery/sort فوق)
        Route::get('products/trashed', [ProductController::class, 'trashed']);
        Route::patch('products/{id}/reassign', [ProductController::class, 'reassign']);
        Route::post('products/{id}/restore', [ProductController::class, 'restore']);
        Route::delete('products/{id}/force', [ProductController::class, 'forceDelete']);
        Route::apiResource('products', ProductController::class);

        Route::apiResource('banners', BannerController::class);
        Route::patch('banners/{banner}/toggle-status', [BannerController::class, 'toggleStatus']);

        // Hero Section: singleton (صف واحد بس) - مش apiResource، بس show()/update() عاديين
        Route::get('hero', [AdminHeroSectionController::class, 'show']);
        Route::post('hero', [AdminHeroSectionController::class, 'update']);

        // Gallery: مسارات يدوية (مش apiResource) عشان عندنا زيادة sort() و toggleStatus()
        Route::get('gallery', [GalleryController::class, 'index']);
        Route::post('gallery', [GalleryController::class, 'store']);
        // ملاحظة: "gallery/sort" لازم تنكتب قبل "gallery/{galleryImage}"
        // وإلا Laravel رح يفهم "sort" على إنها {galleryImage} (تعارض بالترتيب)
        Route::post('gallery/sort', [GalleryController::class, 'sort']);
        Route::put('gallery/{galleryImage}', [GalleryController::class, 'update']);
        Route::delete('gallery/{galleryImage}', [GalleryController::class, 'destroy']);
        Route::patch('gallery/{galleryImage}/toggle-status', [GalleryController::class, 'toggleStatus']);

        Route::get('contact-messages', [ContactMessageController::class, 'index']);
        Route::get('contact-messages/{contactMessage}', [ContactMessageController::class, 'show']);
        Route::patch('contact-messages/{contactMessage}/mark-as-read', [ContactMessageController::class, 'markAsRead']);
        Route::delete('contact-messages/{contactMessage}', [ContactMessageController::class, 'destroy']);

        Route::get('orders', [OrderController::class, 'index']);
        Route::get('orders/{order}', [OrderController::class, 'show']);
        Route::patch('orders/{order}/status', [OrderController::class, 'updateStatus']);
    });
});

// ===================== Public (Front-End) =====================
// كل هاد المسارات مفتوحة بدون تسجيل دخول - الموقع نفسه بيستخدمها

Route::get('banners', [PublicBannerController::class, 'index']);

// Hero Section (القسم الكبير أعلى الصفحة الرئيسية) - منفصل عن /banners (سلايدر البروموشن الصغير)
Route::get('hero', [PublicHeroSectionController::class, 'show']);

Route::get('categories', [PublicCategoryController::class, 'index']);
Route::get('categories/{id}', [PublicCategoryController::class, 'show']);

Route::get('brands', [PublicBrandController::class, 'index']);
Route::get('brands/{id}', [PublicBrandController::class, 'show']);

// ملاحظة: "products/search" لازم قبل "products/{id}"
// وإلا Laravel رح يفهم كلمة "search" على إنها {id} (تعارض بالترتيب)
Route::get('products/search', [PublicProductController::class, 'search']);
Route::get('products', [PublicProductController::class, 'index']);
Route::get('products/{id}', [PublicProductController::class, 'show']);

Route::get('gallery', [PublicGalleryController::class, 'index']);

Route::post('contact-us', [PublicContactController::class, 'store']);

// إحصائيات عامة (منتجات/براندات/زبائن) - تستخدمها الصفحة الرئيسية بدل الأرقام الثابتة القديمة
Route::get('stats', [StatsController::class, 'index']);

// ===================== Customer Auth (User) =====================
// حساب العميل (User) منفصل عن حساب الأدمن (guard "user" مش "admin")
// صلاحياته محدودة: تسجيل / دخول / خروج / عمل طلب / رؤية طلباته بس - ولا أي عملية إدارية
Route::post('register', [PublicAuthController::class, 'register']);
Route::post('login', [PublicAuthController::class, 'login']);

// مهم: عمل طلب (orders) بقى لازم تسجيل دخول - Guest ما بيقدر يطلب أوردر خالص
// بس يقدر يتصفح المنتجات (GET endpoints فوق) بدون تسجيل دخول
Route::middleware('auth:user')->group(function () {
    Route::post('logout', [PublicAuthController::class, 'logout']);
    Route::get('me', [PublicAuthController::class, 'me']);
    Route::post('profile', [PublicAuthController::class, 'updateProfile']);
    Route::get('my-orders', [PublicOrderController::class, 'myOrders']);
    Route::post('orders', [PublicOrderController::class, 'store']);
});
