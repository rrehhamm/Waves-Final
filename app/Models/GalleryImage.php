<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['title', 'image', 'description', 'sort_order', 'status'])]
class GalleryImage extends Model
{
    // اسم الموديل "GalleryImage" بس اسم الجدول بالداتابيز "gallery"
    // Laravel افتراضياً بيدور على جدول اسمه "gallery_images" (جمع اسم الموديل)
    // فلازم نحدد الاسم الصح يدوياً بـ $table
    protected $table = 'gallery';

    protected function casts(): array
    {
        return [
            'status' => 'boolean',
            'sort_order' => 'integer',
        ];
    }
}
