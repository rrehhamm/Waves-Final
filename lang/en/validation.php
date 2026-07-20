<?php

// ملف رسائل أخطاء الـ validation بالإنجليزي
// لو حقل فشل بأي rule (required, email, max...)، Laravel بيدور هون على الرسالة المناسبة
return [

    'required' => 'The :attribute field is required.',
    'email' => 'The :attribute field must be a valid email address.',
    'string' => 'The :attribute field must be a string.',
    'integer' => 'The :attribute field must be an integer.',
    'numeric' => 'The :attribute field must be a number.',
    'boolean' => 'The :attribute field must be true or false.',
    'array' => 'The :attribute field must be an array.',
    'image' => 'The :attribute field must be an image.',
    'url' => 'The :attribute field must be a valid URL.',
    'date' => 'The :attribute field must be a valid date.',
    'confirmed' => 'The :attribute field confirmation does not match.',
    'unique' => 'The :attribute has already been taken.',
    'exists' => 'The selected :attribute is invalid.',
    'in' => 'The selected :attribute is invalid.',

    'max' => [
        'numeric' => 'The :attribute field must not be greater than :max.',
        'file' => 'The :attribute field must not be greater than :max kilobytes.',
        'string' => 'The :attribute field must not be greater than :max characters.',
        'array' => 'The :attribute field must not have more than :max items.',
    ],

    'min' => [
        'numeric' => 'The :attribute field must be at least :min.',
        'file' => 'The :attribute field must be at least :min kilobytes.',
        'string' => 'The :attribute field must be at least :min characters.',
        'array' => 'The :attribute field must have at least :min items.',
    ],

    /*
    |--------------------------------------------------------------------------
    | Custom Validation Attributes
    |--------------------------------------------------------------------------
    | أسماء الحقول اللي بتظهر جوا الرسالة بدل الاسم التقني (مثلاً name_ar -> "Arabic Name")
    */
    'attributes' => [
        'name_ar' => 'Arabic name',
        'name_en' => 'English name',
        'description_ar' => 'Arabic description',
        'description_en' => 'English description',
        'name' => 'name',
        'email' => 'email',
        'password' => 'password',
        'phone' => 'phone',
        'message' => 'message',
        'price' => 'price',
        'quantity' => 'quantity',
        'category_id' => 'category',
        'brand_id' => 'brand',
        'image' => 'image',
        'logo' => 'logo',
        'main_image' => 'main image',
        'link' => 'link',
        'status' => 'status',
        'customer_name' => 'customer name',
        'customer_phone' => 'customer phone',
        'customer_email' => 'customer email',
        'customer_address' => 'customer address',
        'products' => 'products',
    ],

];
