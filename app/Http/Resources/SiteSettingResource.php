<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class SiteSettingResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'contact_phone' => $this->contact_phone,
            'contact_email' => $this->contact_email,
            'contact_address' => $this->contact_address,
            'delivery_fee' => (float) $this->delivery_fee,
            'updated_at' => $this->updated_at,
        ];
    }
}
