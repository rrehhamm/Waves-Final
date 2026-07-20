<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable([
    'name_ar', 'name_en', 'description_ar', 'description_en',
    'price', 'quantity', 'main_image', 'additional_images',
    'category_id', 'brand_id', 'status', 'featured',
])]
class Product extends Model
{
    use HasFactory;

    // SoftDeletes (متطلب رقم 13): بيضيف سلوك خاص لـ delete():
    // - $product->delete() ما بيمسح الصف، بس بيحط تاريخ بعمود deleted_at
    // - Product::all() / Product::find() بيتجاهلوا الصفوف المحذوفة تلقائياً
    // - لو حبينا نشوف المحذوفات: Product::withTrashed()->get()
    // - لاسترجاع منتج: $product->restore()
    use SoftDeletes;

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',           // بيضمن دايماً رقمين بعد الفاصلة
            'additional_images' => 'array',    // JSON بالداتابيز <-> array بالـ PHP تلقائياً
            'status' => 'boolean',
            'featured' => 'boolean',
        ];
    }

    /**
     * علاقة: كل منتج تابع لكاتيجوري واحدة بس (Many-to-One)
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * علاقة: كل منتج تابع لبراند واحد بس
     */
    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class);
    }

    /**
     * علاقة: المنتج ممكن يكون ظهر بعناصر طلبات كتير (order_items)
     */
    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }
}
