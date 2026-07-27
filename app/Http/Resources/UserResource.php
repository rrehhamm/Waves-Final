<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

// بنستخدمه بدل ما نرجع موديل User الخام، عشان نحول profile_picture لرابط كامل (زي باقي الصور بالمشروع)
class UserResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'profile_picture' => image_url($this->profile_picture),
            'address_line' => $this->address_line,
            'city' => $this->city,
            'created_at' => $this->created_at,
        ];
    }
}
