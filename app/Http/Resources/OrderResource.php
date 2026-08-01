<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'order_number' => $this->order_number,
            'customer_name' => $this->customer_name,
            'customer_phone' => $this->customer_phone,
            'customer_email' => $this->customer_email,
            'customer_address' => $this->customer_address,
            'subtotal_price' => (float) $this->subtotal_price,
            'discount_amount' => (float) $this->discount_amount,
            'delivery_fee' => (float) $this->delivery_fee,
            'first_order_discount_applied' => (bool) $this->first_order_discount_applied,
            'total_price' => (float) $this->total_price,
            'status' => $this->status,
            'items' => OrderItemResource::collection($this->whenLoaded('items')),
            'created_at' => $this->created_at,
            'deleted_at' => $this->deleted_at,
        ];
    }
}
