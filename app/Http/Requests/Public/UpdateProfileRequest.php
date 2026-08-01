<?php

namespace App\Http\Requests\Public;

use App\Http\Requests\Concerns\ReportsUploadErrors;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProfileRequest extends FormRequest
{
    use ReportsUploadErrors;

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'max:255'],

            'email' => ['sometimes', 'email', 'max:255', Rule::unique('users', 'email')->ignore($this->user()?->id)],

            'phone' => ['nullable', 'string', 'max:20'],
            'address_line' => ['nullable', 'string', 'max:255'],
            'city' => ['nullable', 'string', 'max:100'],

            'profile_picture' => ['nullable', 'image', 'max:25600'],
        ];
    }
}
