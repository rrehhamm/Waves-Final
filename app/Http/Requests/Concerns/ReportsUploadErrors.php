<?php

namespace App\Http\Requests\Concerns;

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
