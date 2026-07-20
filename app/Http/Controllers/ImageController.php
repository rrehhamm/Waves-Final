<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

// كل الصور اللي منخزنها (categories, products...) بتترفع خارج فولدر public
// فلازم "بوابة" (route) تعرضها للمتصفح - هاد هوي دور هاد الـ Controller
class ImageController extends Controller
{
    /**
     * GET /uploads/{path}
     * مثال: /uploads/categories/abc123.jpg
     */
    public function show(string $path): StreamedResponse
    {
        // abort_unless: لو الملف مش موجود، رجّع خطأ 404 فوراً
        abort_unless(Storage::disk('uploads')->exists($path), 404);

        // response(): بيرجع الملف بالـ headers الصح (Content-Type مناسب لنوع الصورة...إلخ)
        return Storage::disk('uploads')->response($path);
    }
}
