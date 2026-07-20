<?php

namespace App\Http\Requests\Admin\Product;

use Illuminate\Foundation\Http\FormRequest;

class StoreProductRequest extends FormRequest
{
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

            'price' => ['required', 'numeric', 'min:0'],       // numeric بيقبل أرقام عشرية (12.5)
            'quantity' => ['required', 'integer', 'min:0'],     // integer بس (مش عشري)

            'main_image' => ['required', 'image', 'max:2048'],  // إجباري وقت الإنشاء

            // additional_images: مصفوفة صور (اختيارية)
            // additional_images.* : كل عنصر جوا المصفوفة لازم يكون صورة
            'additional_images' => ['nullable', 'array'],
            'additional_images.*' => ['image', 'max:2048'],

            // exists:categories,id => لازم الرقم المرسل يكون فعلاً موجود بجدول categories عمود id
            // (بيمنع مثلاً إرسال category_id = 9999 مش موجود أصلاً)
            'category_id' => ['required', 'integer', 'exists:categories,id'],
            'brand_id' => ['required', 'integer', 'exists:brands,id'],

            'status' => ['nullable', 'boolean'],
            'featured' => ['nullable', 'boolean'],
        ];
    }
}
