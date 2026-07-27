<?php

namespace App\Http\Requests\Admin\Category;

use App\Http\Requests\Concerns\ReportsUploadErrors;
use Illuminate\Foundation\Http\FormRequest;

// Form Request = كلاس منفصل لقواعد الـ validation، بدل ما نكتبها جوا الـ Controller مباشرة
// Laravel بيشغّل الفحص تلقائياً قبل ما توصل لجسم الـ method بالـ Controller
// لو فيه خطأ، بيرجع تلقائياً response بصيغة JSON (status 422) فيها تفاصيل الأخطاء
class StoreCategoryRequest extends FormRequest
{
    use ReportsUploadErrors;

    /**
     * هل مسموح لهاد الطلب يوصل أصلاً؟ (true دايماً هون لأن الحماية الحقيقية
     * بتصير من middleware auth:admin على مستوى الـ route)
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * قواعد الفحص لكل حقل
     */
    public function rules(): array
    {
        return [
            'name_ar' => ['required', 'string', 'max:255'],
            'name_en' => ['required', 'string', 'max:255'],
            // image: لازم يكون ملف صورة فعلي (jpg/png/webp...) وحجمه أقصى 25 ميجا (25600 كيلوبايت)
            'image' => ['nullable', 'image', 'max:25600'],
            'description' => ['nullable', 'string'],
            'status' => ['nullable', 'boolean'],
            'featured' => ['nullable', 'boolean'],
        ];
    }
}
