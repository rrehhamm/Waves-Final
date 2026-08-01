<?php

namespace App\Http\Requests\Admin\Settings;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSiteSettingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'contact_phone' => ['required', 'string', 'max:50'],
            'contact_email' => ['required', 'email', 'max:255'],
            'contact_address' => ['required', 'string', 'max:500'],
            'delivery_fee' => ['required', 'numeric', 'min:0', 'max:99999.99'],
        ];
    }
}
