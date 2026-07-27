<?php

// هاد الملف فيه "دوال عامة" (Global Functions) - مقدر أستدعيها من أي مكان بالمشروع
// من غير ما أعمل use App\Something أصلاً. لازم نسجله بـ composer.json (autoload.files)
// وبعدين نشغّل: composer dump-autoload

if (! function_exists('current_lang')) {
    /**
     * بيحدد اللغة الحالية للطلب (متطلب رقم 14+ بالمواصفات):
     * 1) أولوية لـ query parameter: /api/products?lang=ar
     * 2) إذا مش موجود، ياخد Header: Accept-Language: ar
     * 3) إذا ولا وحدة موجودة، افتراضي "en"
     */
    function current_lang(): string
    {
        $lang = request()->query('lang') ?? request()->header('Accept-Language', 'en');

        // نتأكد إن القيمة "ar" أو "en" بس، أي قيمة غريبة بترجع "en" احتياطاً
        return in_array($lang, ['ar', 'en']) ? $lang : 'en';
    }

    // ملاحظة: الاسم current_lang() لأن getLangField الأصلية بالمواصفات كانت لازم تاخد
    // اللغة من جوا نفسها، فقسمناها لدالتين أوضح: وحدة تحدد اللغة، ووحدة تجيب الحقل (تحت)
}

if (! function_exists('trans_field')) {
    /**
     * بيرجع قيمة الحقل المترجم حسب اللغة الحالية
     * مثال: trans_field($product, 'name') => بيرجع name_ar أو name_en حسب اللغة
     * (نفس فكرة getLangField المقترحة بالمواصفات، بس بدون تكرار احضار اللغة بكل مرة)
     */
    function trans_field($model, string $field): ?string
    {
        $lang = current_lang();

        // fallback: لو الحقل بلغة الطلب فاضي (null)، نرجع النسخة الإنجليزية بدل ما نرجع فاضي
        return $model->{$field.'_'.$lang} ?? $model->{$field.'_en'};
    }
}

if (! function_exists('upload_error_message')) {
    /**
     * لما PHP نفسه (قبل حتى ما توصل الصورة لفحص Laravel) يرفض ملف مرفوع لأنه أكبر من
     * upload_max_filesize أو post_max_size بملف php.ini، بيوصل الملف لـ Laravel "تالف"
     * (isValid() = false) وبيفشل بفحص "image" برسالة عامة مو واضحة ("must be an image")
     * حتى لو الملف فعلياً صورة سليمة. هاد الدالة بتكتشف هاد الحالة بالتحديد وبترجع
     * رسالة أوضح تشرح المشكلة الحقيقية (حجم الملف / إعدادات السيرفر).
     */
    function upload_error_message(?\Illuminate\Http\UploadedFile $file): ?string
    {
        if (! $file) {
            return null;
        }

        $error = $file->getError();

        if ($error === UPLOAD_ERR_OK) {
            return null;
        }

        return match ($error) {
            UPLOAD_ERR_INI_SIZE, UPLOAD_ERR_FORM_SIZE => trans('messages.upload_too_large'),
            UPLOAD_ERR_PARTIAL => trans('messages.upload_partial'),
            default => trans('messages.upload_failed'),
        };
    }
}

if (! function_exists('image_url')) {
    /**
     * يحوّل المسار المخزّن بالداتابيز (مثلاً "categories/abc123.jpg") لرابط كامل
     * يقدر الـ front-end يحطه مباشرة بـ <img src="...">
     */
    function image_url(?string $path): ?string
    {
        if (! $path) {
            return null;
        }

        return route('uploads.show', ['path' => $path]);
    }
}
