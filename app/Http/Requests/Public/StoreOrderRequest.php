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
            // ===== بيانات العميل =====
            'customer_name' => ['required', 'string', 'max:255'],
            'customer_phone' => ['required', 'string', 'max:20'],
            'customer_email' => ['nullable', 'email', 'max:255'],
            'customer_address' => ['nullable', 'string', 'max:500'],

            // ===== السلة (Cart) =====
            // products: مصفوفة، لازم فيها عنصر واحد ع الأقل (min:1)
            'products' => ['required', 'array', 'min:1'],

            // كل عنصر بالمصفوفة لازم يكون بالشكل: { "product_id": 1, "quantity": 2 }
            //
            // ملاحظة مهمة: exists:products,id العادية بتتحقق بس إن الصف موجود بالجدول،
            // حتى لو كان محذوف Soft Delete أو status=false! فلازم نستثنيهم يدوياً هون
            // (Rule::exists بيعمل استعلام مباشر على الجدول، مش عن طريق الموديل، فما بيتجاهل
            // الصفوف المحذوفة تلقائياً زي ما بيصير مع Product::query() العادي)
            'products.*.product_id' => [
                'required',
                'integer',
                Rule::exists('products', 'id')->where(function ($query) {
                    $query->where('status', true)->whereNull('deleted_at');
                }),
            ],
            'products.*.quantity' => ['required', 'integer', 'min:1'],
        ];
    }

    /**
     * رسائل خطأ مخصصة (اختياري) - بتساعد الـ front-end يعرض رسالة أوضح
     */
    public function messages(): array
    {
        return [
            'products.required' => __('messages.order_products_required'),
            'products.*.product_id.exists' => __('messages.order_product_not_found'),
        ];
    }
}
