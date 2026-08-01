<?php


if (! function_exists('current_lang')) {
    function current_lang(): string
    {
        $lang = request()->query('lang') ?? request()->header('Accept-Language', 'en');

        return in_array($lang, ['ar', 'en']) ? $lang : 'en';
    }

}

if (! function_exists('trans_field')) {
    function trans_field($model, string $field): ?string
    {
        $lang = current_lang();

        return $model->{$field.'_'.$lang} ?? $model->{$field.'_en'};
    }
}

if (! function_exists('upload_error_message')) {
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
    function image_url(?string $path): ?string
    {
        if (! $path) {
            return null;
        }

        return route('uploads.show', ['path' => $path]);
    }
}
