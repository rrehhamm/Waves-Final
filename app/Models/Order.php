<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable([
    'user_id', 'order_number', 'customer_name', 'customer_phone', 'customer_email',
    'customer_address', 'total_price', 'subtotal_price', 'discount_amount', 'delivery_fee',
    'first_order_discount_applied', 'status',
])]
class Order extends Model
{
    use SoftDeletes;

    protected function casts(): array
    {
        return [
            'total_price' => 'decimal:2',
            'subtotal_price' => 'decimal:2',
            'discount_amount' => 'decimal:2',
            'delivery_fee' => 'decimal:2',
            'first_order_discount_applied' => 'boolean',
        ];
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
