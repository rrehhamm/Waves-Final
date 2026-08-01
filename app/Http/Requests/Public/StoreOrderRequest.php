<?php

namespace App\Http\Requests\Public;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'customer_name' => ['required', 'string', 'max:255'],
            'customer_phone' => ['required', 'string', 'max:20'],
            'customer_email' => ['nullable', 'email', 'max:255'],
            'customer_address' => ['nullable', 'string', 'max:500'],

            'products' => ['required', 'array', 'min:1'],

            'products.*.product_id' => [
                'required',
                'integer',
                Rule::exists('products', 'id')->where(function ($query) {
                    $query->where('status', true)->whereNull('deleted_at');
                }),
            ],
            'products.*.quantity' => ['required', 'integer', 'min:1'],
            'products.*.color' => ['nullable', 'string', 'max:50'],
        ];
    }

    public function messages(): array
    {
        return [
            'products.required' => __('messages.order_products_required'),
            'products.*.product_id.exists' => __('messages.order_product_not_found'),
        ];
    }
}
