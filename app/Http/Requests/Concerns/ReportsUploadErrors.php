<?php

namespace App\Http\Requests\Concerns;

/**
 * أي Form Request فيها حقل صورة (image) بتحط عليها هاد الـ trait عشان لما PHP نفسه
 * (مش Laravel) يرفض ملف مرفوع بسبب حجمه (أكبر من upload_max_filesize أو post_max_size
 * بملف php.ini)، بدل ما يطلع للمستخدم رسالة عامة مو مفهومة زي "the main image field
 * must be an image" (وهو أصلاً مرفق صورة سليمة)، تطلع رسالة واضحة تشرح إنه المشكلة
 * حجم الملف/إعدادات السيرفر مش نوع الملف.
 */
trait ReportsUploadErrors
{
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            foreach ($this->allFiles() as $key => $file) {
                $files = is_array($file) ? $file : [$file];

                foreach ($files as $index => $singleFile) {
                    if (! $singleFile) {
                        continue;
                    }

                    $message = upload_error_message($singleFile);

                    if ($message) {
                        $field = is_array($file) ? "{$key}.{$index}" : $key;
                        $validator->errors()->add($field, $message);
                    }
                }
            }
        });
    }
}
