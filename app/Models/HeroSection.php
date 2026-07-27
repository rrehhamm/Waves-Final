<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

// Singleton model: دايماً بنتعامل معه كصف واحد بس (id=1) عن طريق firstOrCreate() بالـ Controller
// - شوف App\Http\Controllers\Api\Admin\HeroSectionController
#[Fillable([
    'badge_text', 'heading', 'subtext',
    'button1_text', 'button1_link',
    'button2_text', 'button2_link',
    'background_image',
])]
class HeroSection extends Model
{
    //
}
