<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

// هاد الـ Resource بيستخدمه الأدمن بس (Dashboard)، مش الزوار
// عشان هيك ما فيه داعي لدعم لغتين هون
class ContactMessageResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'phone' => $this->phone,
            'email' => $this->email,
            'message' => $this->message,
            'is_read' => (bool) $this->is_read,
            'created_at' => $this->created_at,
        ];
    }
}
