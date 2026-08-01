<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'contact_phone', 'contact_email', 'contact_address', 'delivery_fee',
])]
class SiteSetting extends Model
{
    protected $casts = [
        'delivery_fee' => 'decimal:2',
    ];
}
