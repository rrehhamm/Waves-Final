<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('categories', function (Blueprint $table) {
            $table->id();

            // دعم لغتين (متطلب رقم 14 بالمواصفات): كل حقل نصي بينكتب بعربي وإنجليزي
            $table->string('name_ar');
            $table->string('name_en');

            $table->string('image')->nullable();        // بنخزن هون بس المسار (path) مش الصورة نفسها
            $table->text('description')->nullable();     // وصف اختياري (nullable = ممكن يكون فاضي)

            // status: true = active (ظاهرة للزوار) / false = inactive (مخفية)
            $table->boolean('status')->default(true);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('categories');
    }
};
