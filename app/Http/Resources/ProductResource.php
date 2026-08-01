<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Collection;

class ProductResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'name' => trans_field($this, 'name'),
            'description' => trans_field($this, 'description'),

            'price' => (float) $this->price,
            'discount_percent' => $this->discount_percent,
            'final_price' => $this->final_price,
            'quantity' => $this->quantity,
            'sizes' => $this->sizes ?? [],
            'colors' => $this->colors ?? [],

            'main_image' => image_url($this->main_image),

            'additional_images' => Collection::make($this->additional_images)
                ->map(fn (string $path) => image_url($path))
                ->values(),

            'category' => new CategoryResource($this->whenLoaded('category')),
            'brand' => new BrandResource($this->whenLoaded('brand')),

            'status' => (bool) $this->status,
            'featured' => (bool) $this->featured,

            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
