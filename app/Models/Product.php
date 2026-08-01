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
    'price', 'discount_percent', 'quantity', 'sizes', 'colors', 'main_image', 'additional_images',
    'category_id', 'brand_id', 'status', 'featured',
])]
class Product extends Model
{
    use HasFactory;

    use SoftDeletes;

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'discount_percent' => 'integer',
            'sizes' => 'array',
            'colors' => 'array',
            'additional_images' => 'array',
            'status' => 'boolean',
            'featured' => 'boolean',
        ];
    }

    public function getFinalPriceAttribute(): float
    {
        if (! $this->discount_percent) {
            return (float) $this->price;
        }

        return round((float) $this->price * (1 - $this->discount_percent / 100), 2);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class);
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }
}
