<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

// API Resource: طبقة "تنسيق" بين الموديل (Category) والـ JSON اللي بيوصل للـ front-end
// بدل ما نرجع الموديل مباشرة (وبيطلع فيه name_ar/name_en/created_at...إلخ)
// منتحكم بالظبط شو بيطلع، وبأي شكل
class CategoryResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,

            // trans_field() (من app/Helpers/helpers.php) بيرجع name_ar أو name_en
            // حسب اللغة المطلوبة (Accept-Language header أو ?lang=)
            'name' => trans_field($this, 'name'),
            'description' => $this->description,

            // image_url() بيحوّل المسار المخزّن بالداتابيز لرابط كامل قابل للعرض
            'image' => image_url($this->image),

            'status' => (bool) $this->status,
            // featured: التصنيفات يلي الأدمن اختارها تظهر بقسم "Main Categories" بالصفحة الرئيسية
            'featured' => (bool) $this->featured,

            // whenLoaded: بيضيف "products" بس إذا كنا فعلاً عملنا Eager Loading لها
            // (Category::with('products')->get()) - عشان نتفادى استعلامات زيادة (N+1 problem)
            'products' => ProductResource::collection($this->whenLoaded('products')),

            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
