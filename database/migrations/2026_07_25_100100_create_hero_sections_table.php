<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// hero_sections: جدول "Singleton" (صف واحد بس دايماً، id=1) بيمثل قسم الهيرو الكامل
// بأعلى الصفحة الرئيسية (الخلفية + العنوان الكبير + الفقرة + زرين + الـ badge) - هاد كان قبل هيك
// نص وصورة ثابتين (hardcoded) جوا كود Home.jsx، هلق صار صف حقيقي بالداتابيز يقدر الأدمن يعدّله.
//
// ملاحظة مهمة: هاد القسم منفصل تماماً عن جدول banners (يلي هو سلايدر البروموشن الصغير
// عالجنب - شوف migration 2026_07_18_120400_create_banners_table.php) - هاد الجدول Hero
// بيمثل القسم الكبير كامل، مش سلايد واحد بلستة سلايدات.
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('hero_sections', function (Blueprint $table) {
            $table->id();
            $table->string('badge_text')->nullable();      // مثلاً: "New Collection 2026"
            $table->string('heading');                       // العنوان الكبير: "Find What Matches Your Style"
            $table->text('subtext')->nullable();             // الفقرة الوصفية تحت العنوان
            $table->string('button1_text')->nullable();      // مثلاً: "Shop Collection"
            $table->string('button1_link')->nullable();      // مثلاً: "/products"
            $table->string('button2_text')->nullable();      // مثلاً: "Explore Categories"
            $table->string('button2_link')->nullable();      // مثلاً: "/categories"
            $table->string('background_image')->nullable();  // خلفية القسم كامل
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('hero_sections');
    }
};
