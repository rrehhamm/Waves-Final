<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// عمود "featured" بيسمح للأدمن يختار يدوياً أي تصنيفات/براندات تظهر
// بقسم "Main Categories" و "Featured Brands" بالصفحة الرئيسية (بدل أول عناصر بس)
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('categories', function (Blueprint $table) {
            $table->boolean('featured')->default(false)->after('status');
        });

        Schema::table('brands', function (Blueprint $table) {
            $table->boolean('featured')->default(false)->after('status');
        });
    }

    public function down(): void
    {
        Schema::table('categories', function (Blueprint $table) {
            $table->dropColumn('featured');
        });

        Schema::table('brands', function (Blueprint $table) {
            $table->dropColumn('featured');
        });
    }
};
