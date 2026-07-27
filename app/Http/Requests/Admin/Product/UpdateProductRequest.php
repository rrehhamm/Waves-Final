<?php

namespace App\Http\Requests\Admin\Product;

use App\Http\Requests\Concerns\ReportsUploadErrors;
use Illuminate\Foundation\Http\FormRequest;

class UpdateProductRequest extends FormRequest
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
            'description_ar' => ['nullable', 'string'],
            'description_en' => ['nullable', 'string'],

            'price' => ['required', 'numeric', 'min:0'],
            'discount_percent' => ['nullable', 'integer', 'min:0', 'max:100'],
            'quantity' => ['required', 'integer', 'min:0'],

            // بالتحديث: الصورة اختيارية (إذا ما انبعتت، بتضل الصورة القديمة زي ما هي)
            // max:25600 = 25 ميجا (لازم upload_max_filesize/post_max_size بـ php.ini كمان يكونوا 25M+)
            'main_image' => ['nullable', 'image', 'max:25600'],
            'additional_images' => ['nullable', 'array'],
            'additional_images.*' => ['image', 'max:25600'],

            'category_id' => ['required', 'integer', 'exists:categories,id'],
            'brand_id' => ['required', 'integer', 'exists:brands,id'],

            'status' => ['nullable', 'boolean'],
            'featured' => ['nullable', 'boolean'],
        ];
    }
}
