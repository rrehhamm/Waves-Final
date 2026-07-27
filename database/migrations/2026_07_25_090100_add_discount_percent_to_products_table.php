<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// discount_percent: نسبة خصم يحطها الأدمن يدوياً على منتج معين (0-100)، nullable = بدون خصم افتراضياً
// هاد منفصل تماماً عن خصم "أول طلب" (يلي بيتحسب تلقائياً وقت إنشاء الطلب - شوف OrderController)
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->unsignedTinyInteger('discount_percent')->nullable()->after('price');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn('discount_percent');
        });
    }
};
