<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// بيضيف عمود "tag" لجدول banners - نص صغير بيظهر كـ badge فوق العنوان بسلايدر البانرات
// بالصفحة الرئيسية (مثلاً "Trending Now" / "Limited Edition") - شايفه بمكون BannerSlider.jsx
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('banners', function (Blueprint $table) {
            $table->string('tag')->nullable()->after('title');
        });
    }

    public function down(): void
    {
        Schema::table('banners', function (Blueprint $table) {
            $table->dropColumn('tag');
        });
    }
};
