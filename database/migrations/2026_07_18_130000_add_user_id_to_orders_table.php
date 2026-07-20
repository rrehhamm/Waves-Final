<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            // nullable: بيسمح بالطلب لو العميل مسجل دخول (بنربطه بحسابه)
            // أو لو مش مسجل دخول (Guest Checkout - بتضل بيانات customer_name/phone كافية)
            // after('id'): بس شكلي، يحطها بترتيب منطقي بالجدول
            $table->foreignId('user_id')->nullable()->after('id')->constrained('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropColumn('user_id');
        });
    }
};
