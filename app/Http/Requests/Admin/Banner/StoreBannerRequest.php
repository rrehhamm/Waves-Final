<?php

namespace App\Http\Requests\Admin\Banner;

use Illuminate\Foundation\Http\FormRequest;

class StoreBannerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'image' => ['required', 'image', 'max:2048'],
            'link' => ['nullable', 'url', 'max:255'], // url: لازم يكون رابط صحيح الصيغة (https://...)
            'status' => ['nullable', 'boolean'],
        ];
    }
}
