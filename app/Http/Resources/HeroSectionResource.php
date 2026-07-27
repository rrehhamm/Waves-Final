<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class HeroSectionResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'badge_text' => $this->badge_text,
            'heading' => $this->heading,
            'subtext' => $this->subtext,
            'button1_text' => $this->button1_text,
            'button1_link' => $this->button1_link,
            'button2_text' => $this->button2_text,
            'button2_link' => $this->button2_link,
            'background_image' => image_url($this->background_image),
            'updated_at' => $this->updated_at,
        ];
    }
}
