<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

// #[Fillable]: الأعمدة المسموح نعبيها جماعياً بـ Category::create([...]) أو $category->update([...])
// أي عمود مش موجود هون، لو حاولنا نعبيه جماعياً Laravel رح يرفض (حماية من Mass Assignment)
#[Fillable(['name_ar', 'name_en', 'image', 'description', 'status'])]
class Category extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            // status محفوظ بالداتابيز كـ 0/1 (tinyint) بس بالكود بيتحول تلقائياً لـ true/false
            'status' => 'boolean',
        ];
    }

    /**
     * علاقة: الكاتيجوري الواحدة عندها منتجات كتير (One-to-Many)
     * بنستخدمها هيك: $category->products
     */
    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }
}
