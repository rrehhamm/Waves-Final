<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

// tag: نص صغير (badge) بيظهر فوق العنوان بسلايدر البروموشن، مثلاً "Trending Now"
#[Fillable(['title', 'tag', 'description', 'image', 'link', 'status'])]
class Banner extends Model
{
    protected function casts(): array
    {
        return [
            'status' => 'boolean',
        ];
    }
}
