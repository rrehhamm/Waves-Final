<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['title', 'image', 'description', 'sort_order', 'status'])]
class GalleryImage extends Model
{
    protected $table = 'gallery';

    protected function casts(): array
    {
        return [
            'status' => 'boolean',
            'sort_order' => 'integer',
        ];
    }
}
