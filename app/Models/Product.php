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
    'price', 'discount_percent', 'quantity', 'main_image', 'additional_images',
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
            'discount_percent' => 'integer',
            'additional_images' => 'array',    // JSON بالداتابيز <-> array بالـ PHP تلقائياً
            'status' => 'boolean',
            'featured' => 'boolean',
        ];
    }

    /**
     * السعر النهائي بعد خصم الأدمن (discount_percent) - لو مفيش خصم، بيرجع نفس السعر الأصلي
     */
    public function getFinalPriceAttribute(): float
    {
        if (! $this->discount_percent) {
            return (float) $this->price;
        }

        return round((float) $this->price * (1 - $this->discount_percent / 100), 2);
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
