<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['title', 'tag', 'description', 'image', 'status'])]
class Banner extends Model
{
    protected function casts(): array
    {
        return [
            'status' => 'boolean',
        ];
    }
}
