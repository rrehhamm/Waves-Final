<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class OrderItemResource extends JsonResource
{
    public function toArray($request): array
    {
        $originalPrice = $this->original_price !== null ? (float) $this->original_price : (float) $this->price;
        $price = (float) $this->price;
        $hasDiscount = $originalPrice > 0 && $price < $originalPrice;

        return [
            'id' => $this->id,
            'product_id' => $this->product_id,
            'product_name' => $this->product_name,
            'color' => $this->color,
            'original_price' => $originalPrice,
            'price' => $price,
            'discount_percent' => $hasDiscount ? (int) round((1 - $price / $originalPrice) * 100) : 0,
            'quantity' => $this->quantity,
            'subtotal' => (float) $this->subtotal,
            'main_image' => image_url(optional($this->product)->main_image),
        ];
    }
}
