<?php

namespace App\Http\Requests\Admin\Hero;

use App\Http\Requests\Concerns\ReportsUploadErrors;
use Illuminate\Foundation\Http\FormRequest;

class UpdateHeroSectionRequest extends FormRequest
{
    use ReportsUploadErrors;

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'badge_text' => ['nullable', 'string', 'max:255'],
            'heading' => ['required', 'string', 'max:255'],
            'subtext' => ['nullable', 'string'],
            'button1_text' => ['nullable', 'string', 'max:100'],
            'button1_link' => ['nullable', 'string', 'max:255'],
            'button2_text' => ['nullable', 'string', 'max:100'],
            'button2_link' => ['nullable', 'string', 'max:255'],
            'background_image' => ['nullable', 'image', 'max:25600'],
        ];
    }
}
