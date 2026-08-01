<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'badge_text', 'heading', 'subtext',
    'button1_text', 'button1_link',
    'button2_text', 'button2_link',
    'background_image',
])]
class HeroSection extends Model
{
}
