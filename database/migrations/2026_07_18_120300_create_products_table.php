<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();

            // ===== دعم لغتين =====
            $table->string('name_ar');
            $table->string('name_en');
            $table->text('description_ar')->nullable();
            $table->text('description_en')->nullable();

            // ===== بيانات أساسية =====
            $table->decimal('price', 10, 2);        // 10 أرقام إجمالي، 2 منهم بعد الفاصلة (مثلاً 12345678.99)
            $table->unsignedInteger('quantity')->default(0); // الكمية بالمخزون، ما بتكون سالبة أبداً

            // ===== صور =====
            $table->string('main_image')->nullable();   // مسار الصورة الرئيسية
            $table->json('additional_images')->nullable(); // مصفوفة مسارات (JSON) للصور الإضافية

            // ===== العلاقات (Relationships) =====
            // foreignId + constrained(): بيعمل عمود category_id، وبيربطه تلقائياً بجدول categories.id
            // restrictOnDelete(): يمنع حذف Category لو عندها منتجات (حماية من فقدان البيانات)
            $table->foreignId('category_id')->constrained('categories')->restrictOnDelete();
            $table->foreignId('brand_id')->constrained('brands')->restrictOnDelete();

            $table->boolean('status')->default(true);     // active / inactive
            $table->boolean('featured')->default(false);  // منتج مميز يظهر بالواجهة الرئيسية مثلاً

            $table->timestamps();

            // Soft Delete (متطلب رقم 13): بدل ما نحذف الصف فعلياً، بنحط تاريخ بعمود deleted_at
            // وأي query عادي (Product::all()) بيتجاهل الصفوف المحذوفة تلقائياً
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
