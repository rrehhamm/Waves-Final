<?php

namespace App\Http\Requests\Admin\Category;

use App\Http\Requests\Concerns\ReportsUploadErrors;
use Illuminate\Foundation\Http\FormRequest;

class StoreCategoryRequest extends FormRequest
{
    use ReportsUploadErrors;

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name_ar' => ['required', 'string', 'max:255'],
            'name_en' => ['required', 'string', 'max:255'],
            'image' => ['nullable', 'image', 'max:25600'],
            'description' => ['nullable', 'string'],
            'status' => ['nullable', 'boolean'],
            'featured' => ['nullable', 'boolean'],
        ];
    }
}
