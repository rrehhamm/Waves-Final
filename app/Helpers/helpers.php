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
