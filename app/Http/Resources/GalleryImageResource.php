<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class GalleryImageResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'image' => image_url($this->image),
            'description' => $this->description,
            'sort_order' => $this->sort_order,
            'status' => (bool) $this->status,
            'created_at' => $this->created_at,
        ];
    }
}
