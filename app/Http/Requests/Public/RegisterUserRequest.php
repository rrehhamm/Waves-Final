<?php

namespace App\Http\Requests\Public;

use Illuminate\Foundation\Http\FormRequest;

class RegisterUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],

            // unique:users,email : لازم الإيميل ما يكون مستخدم من عميل تاني قبل
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],

            // confirmed: بيدور على حقل اسمه "password_confirmation" ويتأكد إنه مطابق
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ];
    }
}
