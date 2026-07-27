<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

// #[Fillable]: الأعمدة المسموح نعبيها جماعياً بـ Category::create([...]) أو $category->update([...])
// أي عمود مش موجود هون، لو حاولنا نعبيه جماعياً Laravel رح يرفض (حماية من Mass Assignment)
#[Fillable(['name_ar', 'name_en', 'image', 'description', 'status', 'featured'])]
class Category extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            // status محفوظ بالداتابيز كـ 0/1 (tinyint) بس بالكود بيتحول تلقائياً لـ true/false
            'status' => 'boolean',
            // featured: الأدمن بيحددها يدوياً - هاي التصنيفات يلي بتظهر بقسم "Main Categories" بالصفحة الرئيسية
            'featured' => 'boolean',
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
