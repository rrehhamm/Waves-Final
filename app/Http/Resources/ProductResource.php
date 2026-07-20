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
            'quantity' => $this->quantity,

            'main_image' => image_url($this->main_image),

            // additional_images مخزنة كـ array (بسبب casts 'array' بالموديل)
            // بنمرر كل مسار على image_url() عشان نحولها لروابط كاملة
            'additional_images' => Collection::make($this->additional_images)
                ->map(fn (string $path) => image_url($path))
                ->values(),

            // whenLoaded: بترجع بيانات الكاتيجوري/البراند بس إذا محمّلين مسبقاً
            // (Product::with(['category','brand'])->get())
            'category' => new CategoryResource($this->whenLoaded('category')),
            'brand' => new BrandResource($this->whenLoaded('brand')),

            'status' => (bool) $this->status,
            'featured' => (bool) $this->featured,

            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
