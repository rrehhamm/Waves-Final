<?php

namespace App\Http\Requests\Admin\Banner;

use App\Http\Requests\Concerns\ReportsUploadErrors;
use Illuminate\Foundation\Http\FormRequest;

class StoreBannerRequest extends FormRequest
{
    use ReportsUploadErrors;

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'tag' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'image' => ['required', 'image', 'max:25600'],
            'status' => ['nullable', 'boolean'],
        ];
    }
}
