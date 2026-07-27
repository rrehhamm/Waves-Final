<?php

namespace App\Http\Requests\Admin\Product;

use App\Http\Requests\Concerns\ReportsUploadErrors;
use Illuminate\Foundation\Http\FormRequest;

class StoreProductRequest extends FormRequest
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

            'price' => ['required', 'numeric', 'min:0'],       // numeric بيقبل أرقام عشرية (12.5)
            'discount_percent' => ['nullable', 'integer', 'min:0', 'max:100'],
            'quantity' => ['required', 'integer', 'min:0'],     // integer بس (مش عشري)

            // max:25600 = 25 ميجا (صور موبايل بجودة عالية ممكن توصل لهاد الحجم)
            // ملاحظة مهمة: لازم upload_max_filesize و post_max_size بملف php.ini يكونوا 25M أو أكتر
            // كمان، وإلا PHP نفسه بيرفض الملف قبل حتى ما يوصل لفحص Laravel (بيطلع خطأ "must be an image"
            // بسبب هيك برضه، مش بس بسبب النوع)
            'main_image' => ['required', 'image', 'max:25600'],  // إجباري وقت الإنشاء

            // additional_images: مصفوفة صور (اختيارية)
            // additional_images.* : كل عنصر جوا المصفوفة لازم يكون صورة
            'additional_images' => ['nullable', 'array'],
            'additional_images.*' => ['image', 'max:25600'],

            // exists:categories,id => لازم الرقم المرسل يكون فعلاً موجود بجدول categories عمود id
            // (بيمنع مثلاً إرسال category_id = 9999 مش موجود أصلاً)
            'category_id' => ['required', 'integer', 'exists:categories,id'],
            'brand_id' => ['required', 'integer', 'exists:brands,id'],

            'status' => ['nullable', 'boolean'],
            'featured' => ['nullable', 'boolean'],
        ];
    }
}
